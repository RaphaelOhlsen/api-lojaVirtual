const mongoose = require('mongoose');
const produto = require('../models/produto');

const Variacao = mongoose.model('Variacao');
const Produto = mongoose.model('Produto');

class VariacaoController {
  // GET / - index
  async index(req, res, next) {
    const { loja, produto } = req.query;
    try {
      const variacoes = await Variacao.find({ produto, loja });
      return res.send({ variacoes });
    } catch(e) {
      next(e);
    }
  }

  // GET /:id - show
  async show(req, res, next) {
    const { loja, produto } = req.query;
    const { id: _id} = req.params;
    try {
      const variacao = await Variacao.findOne({ _id, loja, produto});
      return res.send( { variacao });
    } catch(e) {
      next(e);
    }
  }

  // POST / - store 
  async store(req, res, next) {
    const { loja, produto } = req.query;
    const {
      codigo,
      nome,
      preco,
      promocao,
      entrega,
      quantidade
    } = req.body;

    try { 
      const _produto = await Produto.findById(produto);
      if (!_produto) return res.status(400).send({ error: "Produto não encontrado"});

      const variacao = new Variacao({
        codigo,
        nome,
        preco,
        promocao,
        entrega,
        quantidade,
        loja, 
        produto
      });

      _produto.variacoes.push(variacao._id);

      await _produto.save();
      await variacao.save();

      return res.send({ variacao });
    } catch(e) {
      next(e);
    }
  }

  // PUT /:id - update
  async update(req, res, next) {
    const {
      codigo,
      fotos,
      nome,
      preco,
      promocao,
      entrega,
      quantidade
    } = req.body;
    const { id: _id } = req.params;
    const { loja, produto } = req.query;

    try {
      const variacao = await Variacao.findOne({ _id, loja, produto });
      if (!variacao) return res.status(400).send({ error: 'Variacao não encontrada'});
     
      if (codigo) variacao.codigo = codigo;
      if (nome) variacao.nome = nome;
      if (preco) variacao.preco = preco;
      if (promocao) variacao.promocao = promocao;
      if (entrega) variacao.entrega = entrega;
      if (quantidade) variacao.quantidade = quantidade;
      if (fotos) variacao.fotos = fotos;

      await variacao.save();

      return res.send({ variacao });
    } catch {
      next(e);
    }
  }

  //PUT /images/:id - updateImages
  async updateImages(req, res, next) {
    const { id: _id } = req.params;
    const { loja, produto } = req.query;
    try {
      const variacao = await Variacao.findOne({ _id, loja, produto });
      if (!variacao) return res.status(400).send({ error: 'Variacao não encontrada'});

      const novasImagens = req.files.map(item => item.filename);
      console.log(req.files);
      variacao.fotos = variacao.fotos.filter(item => item).concat(novasImagens);

      await variacao.save();
      return res.send({ variacao });
    } catch(e) {
      next(e);
    }
  }

  // DELETE /:id - remove 
  async remove(req, res, next) {
    const { id: _id } = req.params;
    const { loja, produto } = req.query;
    try {
      const variacao = await Variacao.findOne({ _id, loja, produto });
      if (!variacao) return res.status(400).send({ error: 'Variacao não encontrada'});

      const _produto = await Produto.findById(variacao.produto);
      if (!_produto) return res.status(400).send({ error: 'Produto não encontrado'});
      _produto.variacoes = _produto.variacoes.filter(item => item.toString() !== variacao._id.toString());
      console.log(_produto);
      await _produto.save();
      await variacao.remove();

      return res.send({ deleted: true});
    } catch(e) {
      next(e);
    }
  }
}

module.exports = VariacaoController;