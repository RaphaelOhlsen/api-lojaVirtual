const mongoose = require('mongoose');

const Produto = mongoose.model('Produto');
const Categoria = mongoose.model('Categoria');
const Avaliacao = mongoose.model('Avaliacao');
const Variacao = mongoose.model('Variacao');

const getSort = (sortType) => {
  switch(sortType){
    case "alfabetica_a-z":
      return { titulo: 1 };
    case "alfabetica_z-a":
      return { titulo: -1}
    case "preco-crescente":
      return { preco: 1 };
    case "preco-decrescente":
      return { preco: -1 };
    default:
      return {}
  }
}
class ProdutoController {
  /**
   * ADMIN  
   */

  // POST /
  async store(req, res, next) {
    const { 
      titulo, 
      descricao, 
      categoria: categoriaId, 
      preco,
      promocao,
      sku } = req.body;
    const { loja } = req.query;

    try {
      const produto = new Produto({
        titulo,
        disponibilidade: true,
        descricao, 
        categoria: categoriaId,
        preco,
        promocao,
        sku,
        loja
      });

      const categoria = await Categoria.findById(categoriaId);
      categoria.produtos.push(produto._id);

      await produto.save();
      await categoria.save();

      return res.send({ produto });

    } catch(e) {
      next(e);
    }
  }

  // PUT /:id
  async update(req, res, next) {
    const { 
      titulo, 
      descricao, 
      disponibilidade,
      categoria, 
      preco,
      promocao,
      sku } = req.body;
    const { loja } = req.query;

    try {
      const produto = await Produto.findById(req.params.id);
      if (!produto) return res.status(400).send({ error: "Produto não encontrado" });

      if (titulo) produto.titulo = titulo;
      if (descricao) produto.titulo = descricao;
      if (disponibilidade !== undefined) produto.disponibilidade = disponibilidade;
      if (preco) produto.preco = preco;
      if (promocao) produto.promocao = promocao;
      if (sku) produto.sku = sku;

      if (categoria && categoria.toString() !== produto.categoria.toString() ) {
        const oldCategoria = await Categoria.findById(produto.categoria);
        const newCategoria = await Categoria.findById(categoria);

        if(oldCategoria && newCategoria) {
          oldCategoria.produtos = oldCategoria.produtos.filter(item => item !== produto._id);
          newCategoria.produtos.push(produto._id);
          produto.categoria = categoria;
          await oldCategoria.save();
          await newCategoria.save();
        } else if (newCategoria) {
          newCategoria.produtos.push(produto._id);
          produto.categoria = categoria;
          await newCategoria.save();
        }
      }
      await produto.save();
      return res.send({ produto });
    } catch(e) {
      next(e);
    }
  }

  // PUT /images/:id - updateImages
  async updateImages(req, res, next) {
    const { loja } = req.query;
    const { id } = req.params;
    try {
      const produto = await Produto.findOne({ _id: id, loja });
      if (!produto) return res.status(400).send({ error: 'Produto não encontrado.'});

      const novaImagens = req.files.map(item => item.filename);
      produto.fotos = produto.fotos.filter(item => item).concat(novaImagens);

      await produto.save();
      return res.send({ produto });
    } catch(e) {
      next(e);
    }
  }

  // DELETE /:id - remove
  async remove(req, res, next) {
    const { id } = req.params;
    const { loja } = req.query;
    try {
      const produto = await Produto.findOne({ _id: id, loja });
      if (!produto) return res.status(400).send({ error: 'Produto não encontrado.'});

      const categoria = await Categoria.findById(produto.categoria);
      if (categoria) {
        categoria.produtos = categoria.produtos.filter(item => item !== produto._id);
        await categoria.save();
      }

      await produto.remove();
      return res.send({ deleted: true});
    } catch(e) {
      next(e);
    }
  }

  /**
   * CLIENTE  
   */

  // GET / - index
  async index(req, res, next) {
    const { loja } = req.query;
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || 30;

    try {
      const produtos = await Produto.paginate(
        { loja },
        { offset, limit, sort: getSort(req.query.sortType) }
      );
      return res.send({ produtos });
    } catch(e) {
      next(e);
    }
  }

  // GET /disponiveis - indexDisponiveis
  async indexDisponiveis(req, res, next) {
    const { loja } = req.query;
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || 30;

    try {
      const produtos = await Produto.paginate(
        { loja, disponibilidade: true },
        { offset, limit, sort: getSort(req.query.sortType) }
      );
      return res.send({ produtos });
    } catch(e) {
      next(e);
    }
  }

  // GET /search/:search - search
  async search(req, res, next) {
    const { loja } = req.query;
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || 30;
    const search = new RegExp(req.params.search, "i");

    try {
      const produtos = await Produto.paginate(
        {
          loja,
          $or: [
            { "titulo": { $regex: search } },
            { "descricao": { $regex: search } },
            { "sku": { $regex: search } },
          ]
        },
        { offset, limit, sort: getSort(req.query.sortType) }
      );
      
      return res.send({ produtos });
    } catch(e) {
      next(e);
    }
  }

  // GET /:id - show
  async show(req, res, next) {
    const { id } = req.params;

    try {
      const produto = await Produto
        .findById(id)
        .populate([
          // 'avaliacoes',
          // 'variacoes',
          'loja'
        ]);

      return res.send({ produto });
    } catch(e) {
      next(e);
    }
  }

   /**
   * AVALIAÇÕES  
   */

  // GET /:id/avaliacoes - showAvaliacoes
  async showAvaliacoes(req, res, next) {
    const { id } = req.params;

    try {
      const avaliacoes = await Avaliacao.find({ produto: id });
      return res.send({ avaliacoes });
    } catch(e) {
      next(e);
    }
  }

  /**
   * VARIAÇÕES  
   */

  // GET /:id/variacoes - showVariacoes
  async showVariacoes(req, res, next) {
    const { id } = req.params;

    try {
      const variacoes = await Variacao.find({ produto: id });
      return res.send({ variacoes });
    } catch(e) {
      next(e);
    }
  }
}

module.exports = ProdutoController;