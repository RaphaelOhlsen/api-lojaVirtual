const mongoose = require('mongoose');

const Pedido = mongoose.model('Pedido');
const Usuario = mongoose.model('Usuario');
const Produto = mongoose.model('Produto');
const Variacao = mongoose.model('Variacao');
const Pagamento = mongoose.model('Pagamento');
const Entrega = mongoose.model('Entrega');
const Cliente = mongoose.model('Cliente');
const RegistroPedido = mongoose.model('RegistroPedido');

const { calcularFrete } = require('./integracoes/correios');

const CarrinhoValidation = require('./validacoes/carrinhoValidation');
const EntregaValidation = require('./validacoes/entregaValidation');
const PagamentoValidation = require('./validacoes/pagamentoValidation');
const QuantidadeValidation = require('./validacoes/quantidadeValidation');

const EmailController = require('./EmailController');
class PedidoController {
  /**
   * ADMIN
   */

  //GET /admin indexAdmin
  async indexAdmin(req,res, next) {
    const { offset, limit, loja} = req.query;

    try {
      const pedidos = await Pedido.paginate(
        { loja }, 
        { 
          offset: Number(offset || 0),
          limit: Number(limit || 30), 
          populate: ['cliente', 'pagamento', 'entrega']
        }
      );
      console.log('Pedidos: ', pedidos)
      pedidos.docs = await Promise.all(pedidos.docs.map(async (pedido) => {
        pedido.carrinho = await Promise.all(pedido.carrinho.map(async (item) => {
          item.produto = await Produto.findById(item.produto);
          item.variacao = await Variacao.findById(item.variacao);
          return item;
        }));
        return pedido;
      }));
      return res.send({ pedidos });
    } catch(e) {
        next(e);
    }
  }

  // GET /admin/:id showAdmin
  async showAdmin(req, res, next) {
    const { loja } = req.query;
    const { id: _id } = req.params;
    try {  
      const pedido = await Pedido
        .findOne({ _id, loja })
        .populate(['cliente', 'pagamento', 'entrega', 'loja']);
      
      pedido.carrinho = await Promise.all(pedido.carrinho.map(async (item) => {
        item.produto = await Produto.findById(item.produto);
        item.variacao = await Variacao.findById(item.variacao);
        return item;
      }));

      const registros = await RegistroPedido.find({ pedido: pedido._id });
      return res.send({ pedido, registros });
    } catch(e) {
      next(e);
    }
  }

  // delete /admin/:id removeAdmin 
  async removeAdmin(req, res, next) {
    const { loja } = req.query;
    const { id: _id } = req.params;
    try {
      const pedido = await Pedido.findOne({ _id, loja })
        .populate({ path: "cliente", populate: {path: "usuario"} });
      if (!pedido) return res.status(400).send({error: 'Pedido não encontrado'});
      pedido.cancelado = true;

      console.log(pedido);

      const registroPedido = new RegistroPedido({
        pedido: pedido._id,
        tipo: 'pedido',
        situacao: 'pedido_cancelado'
      });

      await registroPedido.save();

      EmailController.cancelarPedido({ usuario: pedido.cliente.usuario, pedido });

      await pedido.save();

      await QuantidadeValidation.atualizarQuantidade('cancelar_pedido', pedido);

      return res.send({ cancelado: true });
    } catch(e) {
      next(e);
    }
  }

  // GET /admin/:id/carrinho showCarrinhoAdmin 
  async showCarrinhoPedidoAdmin(req, res, next) {
    const { loja } = req.query;
    const { id: _id } = req.params;

    try {
      const pedido = await Pedido.findOne({ loja, _id});

      const carrinho = await Promise.all(pedido.carrinho.map(async (item) => {
        item.produto = await Produto.findById(item.produto);
        item.variacao = await Variacao.findById(item.variacao);
        return item;
      }));

      return res.send({ carrinho });
    } catch(e) {
      next(e);
    }
  }
  /**
   * CLIENTE, VISITANTES
   */

  // GET / index
  async index(req,res, next) {
    const { offset, limit, loja} = req.query;
    const { id: usuario } = req.payload;
    try {
      const cliente = await Cliente.findOne({ usuario, loja });
      console.log('cliente: ', cliente);
      const pedidos = await Pedido.paginate(
        { loja, cliente: cliente._id }, 
        { 
          offset: Number(offset || 0),
          limit: Number(limit || 30), 
          limit, 
          populate: ['cliente', 'pagamento', 'entrega']
        }
      );
      pedidos.docs = await Promise.all(pedidos.docs.map(async (pedido) => {
        pedido.carrinho = await Promise.all(pedido.carrinho.map(async (item) => {
          item.produto = await Produto.findById(item.produto);
          item.variacao = await Variacao.findById(item.variacao);
          return item;
        }));
        return pedido;
      }));
      return res.send({ pedidos });
    } catch(e) {
      next(e);
    }
  }

  //GET /:id  - show
  async show(req, res, next) {
    const { id: usuario } = req.payload;
    const { id: _id } = req.params;
    try {
      const cliente = await Cliente.findOne({ usuario });
      const pedido = await Pedido
        .findOne({ _id, cliente: cliente._id })
        .populate(['cliente', 'pagamento', 'entrega']);

      pedido.carrinho = await Promise.all(pedido.carrinho.map(async (item) => {
        item.produto = await Produto.findById(item.produto);
        item.variacao = await Variacao.findById(item.variacao);
        return item;
      }));

      const registros = await RegistroPedido.find({ pedido: pedido._id });

      return res.send({ pedido, registros });
    } catch(e) {
      next(e);
    }
  }

  // POST / - store
  async store(req, res, next) {
    const { carrinho, pagamento, entrega } = req.body;
    const { id: usuario } = req.payload;
    const { loja } = req.query;
    const _carrinho = carrinho.slice();

    try {
      // CHEGAR DADOS DO CARRINHO 
      if(!await CarrinhoValidation(carrinho)) 
        return res.status(422).send({ error: 'Carrinho Inválido'});

      const cliente = await Cliente.findOne({ usuario, loja }).populate({path:"usuario", select:"_id nome email"});
  
      if(!await QuantidadeValidation.validarQuantidadeDisponivel(carrinho))
        return res.status(400).send({ error: 'Produtos não tem quantidade disponivel'});

      // CHEGAR DADOS DA ENTREGA 
      if(!await EntregaValidation.checarValorPrazo(cliente.endereco.CEP, carrinho, entrega)) 
        return res.status(422).send({ error: 'Dados de Entrega Inválidos'});

      // CHEGAR DADOS DO PAGAMENTO 
      if(!await PagamentoValidation.checarValorTotal({carrinho, entrega, pagamento})) 
        return res.status(422).send({ error: 'Dados de Pagamento Inválidos'});
      if(!PagamentoValidation.checarCartao(pagamento)) 
        return res.status(422).send({ error: "Dados de Pagamento com Cartao Inválidos" });

      const novoPagamento = new Pagamento({
        valor: pagamento.valor,
        parcelas: pagamento.parcelas || 1,
        forma: pagamento.forma,
        status: 'iniciando',
        endereco: pagamento.endereco,
        cartao: pagamento.cartao,
        enderecoEntregaIgualCobranca:pagamento.enderecoEntregaIgualCobranca,
        loja
      });

      const novaEntrega = new Entrega({
        status: 'nao_iniciado',
        custo: entrega.custo,
        prazo: entrega.prazo,
        tipo: entrega.tipo,
        endereco: entrega.endereco,
        loja
      });

      const pedido = new Pedido({
        cliente: cliente._id,
        carrinho: _carrinho, 
        pagamento: novoPagamento._id,
        entrega: novaEntrega._id,
        loja
      }); 

      novoPagamento.pedido = pedido._id;
      novaEntrega.pedido = pedido._id;

      await pedido.save();
      await novoPagamento.save();
      await novaEntrega.save();

      await QuantidadeValidation.atualizarQuantidade('salvar_pedido', pedido);

      const registroPedido = new RegistroPedido({
        pedido: pedido._id,
        tipo: 'pedido',
        situacao: 'pedido_criado'
      });

      await registroPedido.save();

      EmailController.enviarNovoPedido({ pedido, usuario: cliente.usuario });

      const administradores = await Usuario.find({ permissao: 'admin', loja })

      administradores.forEach((usuario) => {
        EmailController.enviarNovoPedido({ pedido, usuario });
      });

      return res.send({ pedido: Object.assign(
        {},
        pedido._doc,
        { entrega: novaEntrega, pagamento: novoPagamento, cliente }
      )});
      
    } catch(e) {
      next(e);
    }
  }

  // DELETE /:id - remove
  async remove(req, res, next) {
    const { id: _id } = req.params;
    const { id: usuario } = req.payload;
    try {
      const cliente = await Cliente.findOne({ usuario });
      if(!cliente) return res.status(400).send({ error: "Cliente não encontrado" });
      const pedido = await Pedido.findOne({ _id , cliente: cliente._id});
      if(!pedido) return res.status(400).send({ error: "Pedido não encontrado" });
      pedido.cancelado = true;

      const registroPedido = new RegistroPedido({
        pedido: pedido._id,
        tipo: 'pedido',
        situacao: 'pedido_cancelado'
      });

      await registroPedido.save();

      const administradores = await Usuario.find({ permissao: "admin", loja: pedido.loja});

      administradores.forEach((usuario) => {
        EmailController.cancelarPedido({ pedido, usuario });
      });

      await pedido.save();
      
      await QuantidadeValidation.atualizarQuantidade('cancelar_pedido', pedido);

      return res.send({ cancelado: true });
    } catch(e) {
      next(e);
    }
  }

  // GET /:id/carrinho - showCarrinhoPedido
  async showCarrinhoPedido(req,res, next) {
    const { id: _id } = req.params;
    const { id: usuario } = req.payload;
    try {
      const cliente = await Cliente.findOne({ usuario });
      const pedido = await Pedido.findOne({ _id, cliente: cliente._id });

      const carrinho = await Promise.all(pedido.carrinho.map(async (item) => {
        item.produto = await Produto.findById(item.produto);
        item.variacao = await Variacao.findById(item.variacao);
        return item;
      }));
    
      return res.send({ carrinho });
    } catch(e) {
      next(e);
    }
  }
}

  



module.exports = PedidoController;
