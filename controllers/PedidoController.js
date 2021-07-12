const mongoose = require('mongoose');

const Pedido = mongoose.model('Pedido');
const Produto = mongoose.model('Produto');
const Variacao = mongoose.model('Variacao');
const Pagamento = mongoose.model('Pagamento');
const Entrega = mongoose.model('Entrega');
const Cliente = mongoose.model('Cliente');
const Usuario = mongoose.model('Usuario');

const CarrinhoValidation = require('./validacoes/carrinhoValidation');

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
        pedido.pagamento = await Pagamento.findById(pedido.pagamento);
        pedido.entrega = await Entrega.findById(pedido.entrega);
        pedido.loja = await Loja.findById(pedido.loja);
        pedido.cliente = await Cliente.findById(pedido.cliente);
        pedido.usuario = await Usuario.findById(pedido.cliente.usuario);
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
      await pedido.save({ cancelado: true});
    } catch(e) {
      next(e);
    }
  }

  // GET /admin/:id/carrinho showCarrinhoAdmin 
  async showCarrinhoPedidoAdmin(req, res, next) {
    const { loja } = req.query;
    const { _id: id } = req.params;

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
}

module.exports = PedidoController;
