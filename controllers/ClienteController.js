const mongoose = require('mongoose');

const Cliente = mongoose.model('Cliente');
const Usuario = mongoose.model('Usuario');

class ClienteController {

   /**
   * 
   * ADMIN
   */

  
  // GET / index
  async index(req, res, next) {
    const { offset, limit, loja } = req.query;
    const offset = Number(offset) || 0;
    const limit = Number(limit) || 30;
    
    try {
      const clientes = await Cliente.paginate(
        {loja: loja},
        {offset, limit, populate: 'usuario'}
      );
      return res.send({ clientes })
    } catch(e) {
      next(e);
    }
  }

  //GET /search/:search/pedidos
  searchPedidos(req, res, next) {
    return res.status(400).send({ error: "Em desenvolvimento." });
  }

  //GET /search/:search
  async search(req, res, next) {
    const { offset, limit, loja } = req.query;
    const offset = Number(offset) || 0;
    const limit = Number(limit) || 30;
    const search = new RegExp(req.params.search, 'i');
    
    try {
      const clientes = await Cliente.paginate(
        {loja: loja, nome: { $regex: search }},
        {offset, limit, populate: 'usuario'}
      );
      return res.send({ clientes })
    } catch(e) {
      next(e);
    }
  }

  //GET /admin/:id
  async showAdmin(req, res, next) {
    const id  = req.params.id;
    const loja = req.query.loja;
    try {
      const cliente = await Cliente.findOne({ _id: id, loja: loja}).populate('usuario');
      return res.send({ cliente });
    } catch(e) {
      next(e)
    }
  }

  // GET /admin/:id/pedidos
  showPedidosCliente(req, res, next) {
    return res.status(400).send({ error: 'Em desenvolvimento.' });
  }

  //PUT /admin/:id
  async updateAdmin(req, res, next) {
    const { 
      nome, 
      cpf,
      email,
      telefones,
      endereco,
      dataDeNascimento
    } = req.body;
    try {
      const cliente = await Cliente.findById(req.params.id).populate('usuario');
      if (nome) {
        cliente.usuario.nome = nome;
        cliente.nome = nome;
      }
      if (email) cliente.usuario.email;
      if(cpf) cliente.cpf = cpf;
      if (telefones) cliente.telefones = telefones;
      if (endereco) cliente.endereco = endereco;
      if (dataDeNascimento) cliente.dataDeNascimento = dataDeNascimento;
      await cliente.save();
      return res.send({ cliente });
    } catch(e) {
      next(e);
    }
  }

   /**
   * 
   * CLIENTE
   */
}

module.exports = ClienteController;
