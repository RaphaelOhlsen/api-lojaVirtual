const mongoose = require('mongoose');

const Produto = mongoose.model('Produto');
const Variacao = mongoose.model('Variacao');

function getCarrinhoValue(carrinho) {
  let precoTotal = 0;
  let quantidade = 0;

  carrinho.forEach((item) => {
    precoTotal += item.precoUnitario * item.quantidade;
    quantidade += item.quantidade;
  });

  return { precoTotal, quantidade };
}

function getLojaValue(carrinho) {
  const results = Promise.all(carrinho.map(async (item) => {
    const produto = await Produto.findById(item.produto);
    const variacao = await Variacaol.findById(item.variacao);
    let preco = 0;
    let quantidade = 0;
    if( produto && variacao && produto.variacoes.includes(variacao.id) ) {
      let _preco = variacao.promocao || variacao.preco;
      preco = _preco * item.quantidade;
      quantidade = item.quantidade
    }
    return { preco, quantidade };
  }));
  let precoTotal = results.reduce((acc, item) => acc + item.preco, 0);
  let quantidade = results.reduce((acc, item) => acc + item.quantidade, 0);

  return { precoTotal, quantidade };
}

function CarrinhoValidation(carrinho) {
  const {
    precoTotal: precoTotalCarrinho,
    quantidade: quantidadeTotalCarrinho
  } = getCarrinhoValue(carrinho);
  const {
    precoTotal: precoTotalLoja,
    quantidade: quantidadeTotalLoja
  } = getLojaValue(carrinho);

  return precoTotalCarrinho === precoTotalLoja
    && quantidadeTotalCarrinho === quantidadeTotalLoja;
}

module.exports = CarrinhoValidation;
