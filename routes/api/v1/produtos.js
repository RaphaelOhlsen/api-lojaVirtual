const router = require('express').Router();

const Validation = require('express-validation');
const ProdutoController = require('../../../controllers/ProdutoController');

const { LojaValidation } = require('../../../controllers/validacoes/lojaValidation');
const { ProdutoValidation } = require('../../../controllers/validacoes/produtoValidation');
const auth = require('../../auth');
const upload = require('../../../config/multer');

const produtoContoller = new ProdutoController();

// ADMIN
router.post('/', auth.required, LojaValidation.admin, Validation(ProdutoValidation.store), produtoContoller.store);
router.put('/:id', auth.required, LojaValidation.admin, Validation(ProdutoValidation.update), produtoContoller.update);
router.put('/images/:id', auth.required, LojaValidation.admin, Validation(ProdutoValidation.updateImages), upload.array('files', 4), produtoContoller.updateImages);
router.delete('/:id', auth.required, LojaValidation.admin, Validation(ProdutoValidation.remove), produtoContoller.remove);

// CLIENTE/VISITANTES
router.get('/', Validation(ProdutoValidation.index), produtoContoller.index);
router.get('/disponiveis', Validation(ProdutoValidation.indexDisponiveis), produtoContoller.indexDisponiveis);
router.get('/search/:search', Validation(ProdutoValidation.search), produtoContoller.search);
router.get('/:id', Validation(ProdutoValidation.show), produtoContoller.show);

// VARIACOES

// AVALIACOES

module.exports = router;
