const mongoose = require('mongoose');
const { find } = require('../models/pedido');

const Pedido = mongoose.model('Pedido');
const Produto = mongoose.model('Produto');
const Variacao = mongoose.model('Variacao');
const Pagamento = mongoose.model('Pagamento');
const Entrega = mongoose.model('Entrega');
const Cliente = mongoose.model('Cliente');

// const CarrinhoValidation = require('./validacoes/carrinhoValidation');

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
          limit, 
          populate: ['cliente', 'pagamento', 'entrega']
        }
      );
      pedidos.docs = await Promisse.all(pedidos.doc.map(async (pedido) => {
        pedido.carrinho = await Promisse.all(pedido.carrinho.map(async (item) => {
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
      
      pedido.carrinho = await Promisse.all(pedido.carrinho.map(async (item) => {
        item.produto = await Produto.findById(item.produto);
        item.variacao = await Variacao.findById(item.variacao);
        return item;
      }));

      return res.send({ pedido });
    } catch(e) {
      next(e);
    }
  }

  // delete /admin/:id removeAdmin 
  async removeAdmin(req, res, next) {
    const { loja } = req.query;
    const { id: _id } = req.params;
    try {
      const pedido = await Pedido.findOne({ _id, loja });
      if (!pedido) return res.status(400).send({error: 'Pedido não encontrado'});
      pedido.cancelado = true;

      // Registro de atividade = pedido cancelado
      // Enviar email para cliente = pedido cancelado
      await pedido.save();

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

      const carrinho = await Promisse.all(pedido.carrinho.map(async (item) => {
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
      const cliente = await Cliente.findOne({ usuario, loja});
      const pedidos = await Pedido.paginate(
        { loja, cliente: cliente._id }, 
        { 
          offset: Number(offset || 0),
          limit: Number(limit || 30), 
          limit, 
          populate: ['cliente', 'pagamento', 'entrega']
        }
      );
      pedidos.docs = await Promisse.all(pedidos.doc.map(async (pedido) => {
        pedido.carrinho = await Promisse.all(pedido.carrinho.map(async (item) => {
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

      pedido.carrinho = await Promisse.all(pedido.carrinho.map(async (item) => {
        item.produto = await Produto.findById(item.produto);
        item.variacao = await Variacao.findById(item.variacao);
        return item;
      }));

      return res.send({ pedido });
    } catch(e) {
      next(e);
    }
  }

  // POST / - store
  async store(req, res, next) {
    const { carrinho, pagamento, entrega } = req.body;
    const { id: usuario } = req.payload;
    const { loja } = req.query;

    try {
      // CHEGAR DADOS DO CARRINHO 
      // if(!await CarrinhoValidation(carrinho)) 
      //   return res.status(422).send({ error: 'Carrinho Inválido'});

      // CHEGAR DADOS DA ENTREGA 
      // if(!await EntregaValidation(carrinho, entrega)) 
      //   return res.status(422).send({ error: 'Dados de Entrega Inválidos'});

      // CHEGAR DADOS DO PAGAMENTO 
      // if(!await PagamentoValidation(carrinho, pagamento)) 
      //   return res.status(422).send({ error: 'Dados de Pagamento Inválidos'});
      
      const cliente = await Cliente.findOne({ usuario, loja });

      const novoPagamento = new Pagamento({
        valor: pagamento.valor,
        forma: pagamento.forma,
        status: 'iniciando',
        payload: pagamento,
        loja
      });

      const novaEntrega = new Entrega({
        status: 'nao_iniciado',
        custo: entrega.custo,
        prazo: entrega.prazo,
        payload: entrega,
        loja
      });

      const pedido = new Pedido({
        cliente: cliente._id,
        carrinho,
        pagamento: novoPagamento._id,
        entrega: novaEntrega._id,
        loja
      }); 

      novoPagamento.pedido = pedido._id;
      novaEntrega.pedido = pedido._id;

      await pedido.save();
      await novoPagamento.save();
      await novaEntrega.save();

      // Notificar via email - cliente e admin = novo pedido 

      return res.send({ pedido: Object.assign(
        {},
        pedido,
        { entrega: novaEntrega, pagamento: novoPagamento }
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

      // Registro de atividade = pedido cancelado
      // Enviar email para admin = pedido cancelado
      await pedido.save();

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

      const carrinho = await Promisse.all(pedido.carrinho.map(async (item) => {
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
