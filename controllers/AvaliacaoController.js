const mongoose = require('mongoose');

const Avaliacao = mongoose.model('Avaliacao');
const Produto = mongoose.model('Produto');

class AvaliacaoController {
  // GET /
  async index(req, res, next) {
    const { loja, produto } = req.query;
    try {
      const avaliacoes = await Avaliacao.find({ loja, produto });
      return res.send({ avaliacoes });
    } catch(e) {
      next(e);
    }
  }

  // GET /:id - show
  async show(req, res, next) {
    const { id: _id } = req.params;
    const { loja, produto } = req.query;
    try {
      const avaliacao = await Avaliacao.findOne({ _id, loja, produto });
      return res.send({ avaliacao });
    } catch(e) {
      next(e);
    }
  }

  // POST / - store
  async store(req, res, next) {
    const { nome, texto, pontuacao } = req.body;
    const { loja, produto } = req.query;
    try {
      const avaliacao = new Avaliacao({ nome, texto, pontuacao, loja, produto});

      const _produto = await Produto.findById(produto);
      if(!_produto) return res.status(422).send({ error: "Produto não existe"});
      _produto.avaliacoes.push(avaliacao._id);

      await _produto.save();
      await avaliacao.save();

      return res.send({ avaliacao });
    } catch(e) {
      next(e);
    }
  }

  // DELETE /:id - remove
  async remove(req, res, next) {
    const { id } = req.params;
    try {
      const avaliacao = await Avaliacao.findById(id);
      const produto = await Produto.findById(avaliacao.produto);
  
      produto.avaliacaoes = produto.avaliacoes.filter(item => item.toString() !== id);

      await produto.save();
      await avaliacao.remove();

      return res.send({ deleted: true });
    } catch(e) {
      next(e);
    }
  }


}

module.exports = AvaliacaoController;
