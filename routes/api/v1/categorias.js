const router = require('express').Router();

const Validation = require('express-validation');
const CategoriaController = require('../../../controllers/CategoriaController');

const auth = require('../../auth');
const { LojaValidation } = require('../../../controllers/validacoes/lojaValidation');
const { CategoriaValidation } = require('../../../controllers/validacoes/categoriaValidation');

const categoriaController = new CategoriaController();

router.get('/', Validation(CategoriaValidation.index), categoriaController.index);
router.get('/disponiveis', Validation(CategoriaValidation.indexDisponiveis), categoriaController.indexDisponiveis);
router.get('/:id', Validation(CategoriaValidation.show), categoriaController.show);

router.post('/', auth.required, LojaValidation.admin, Validation(CategoriaValidation.store), categoriaController.store);
router.put('/:id', auth.required, LojaValidation.admin, Validation(CategoriaValidation.update), categoriaController.update);
router.delete('/:id', auth.required, LojaValidation.admin, Validation(CategoriaValidation.remove), categoriaController.remove);

// ROTAS PARA PRODUTO PRODUTO
router.get('/:id/produtos', categoriaController.showProdutos);
router.put('/:id/produtos', auth.required, LojaValidation.admin, categoriaController.updateProdutos);

module.exports = router;
