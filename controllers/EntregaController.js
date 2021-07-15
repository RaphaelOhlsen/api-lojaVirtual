const mongoose = require('mongoose');
const { calculaFrete } = require('./integracoes/correios');

const Entrega = mongoose.model('Entrega');
const Produto = mongoose.model('Produto');
const Variacao = mongoose.model('Variacao');
const RegistroPedido = mongoose.model('RegistroPedido');



class EntregaController {
  // GET /:id - show
  async show (req, res, netx) {
    const { id: _id } = req.params;
    const { loja } = req.query;
    try {
      const entrega = await Entrega.findOne({ _id, loja });
      const registros = await RegistroPedido.find({ pedido: entrega.pedido, tipo: 'entrega'});
      return res.send({ entrega, registros });
    } catch(e) {
      netx(e);
    }
  }

  // PUT /:id
  async update(req, res, next) {
    const { situacao, codigoRastreamento } = req.body;
    const { loja } = req.query;
    const { id: _id } = req.params;

    try {
      const entrega = await Entrega.findOne({ loja, _id });

      if(situacao) entrega.situacao = situacao;
      if(codigoRastreamento) entrega.codigoRastreamento;

      const registroPedido = new RegistroPedido({
        pedido: entrega.pedido,
        tipo: 'entrega',
        situacao,
        payload: req.body
      });
      await registroPedido.save();
      // Enviar email de aviso para cliente - aviso de atualizacao na entrega

      await entrega.save();
      return res.send({ entrega });
    } catch(e) {
      next(e);
    }
  }

  // POST /calcular
  async calcular(req, res, next) {
    const { cep, carrinho } = req.body;
    try {
      const _carrinho = await Promise.all(carrinho.map(async item => {
        item.produto = await Produto.findById(item.produto);
        item.variacao = await Variacao.findById(item.variacao);
        return item;
      }));
      const resultados = await calculaFrete(cep, _carrinho);
      return res.send({ resultados });
    } catch(e) {
      next(e);
    }
  }
}

module.exports = EntregaController;
