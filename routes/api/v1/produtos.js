const router = require('express').Router();

const ProdutoController = require('../../../controllers/ProdutoController');

const { LojaValidation } = require('../../../controllers/validacoes/lojaValidation');
const auth = require('../../auth');
const upload = require('../../../config/multer');

const produtoContoller = new ProdutoController();

// ADMIN
router.post('/', auth.required, LojaValidation.admin, produtoContoller.store);
router.put('/:id', auth.required, LojaValidation.admin, produtoContoller.update);
router.put('/images/:id', auth.required, LojaValidation.admin, upload.array('files', 4), produtoContoller.updateImages);
router.delete('/:id', auth.required, LojaValidation.admin, produtoContoller.remove);

// CLIENTE/VISITANTES
router.get('/', produtoContoller.index);
router.get('/disponiveis', produtoContoller.indexDisponiveis);
router.get('/search/:search', produtoContoller.search);
router.get('/:id', produtoContoller.show);
// VARIACOES

// AVALIACOES

module.exports = router;
