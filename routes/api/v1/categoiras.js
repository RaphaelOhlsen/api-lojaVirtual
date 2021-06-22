const router = require('express').Router();

const Validation = require('express-validation');
const CategoriaController = require('../../../controllers/CategoriaController');

const auth = require('../../auth');
const { LojaValidation } = require('../../../controllers/validacoes/lojaValidation');
const { CategoriaValidation } = require('../../../controllers/validacoes/categoriaValidation');

const categoriaController = new CategoriaController();

router.get('/', categoriaController.index);
router.get('/disponiveis', categoriaController.indexDisponiveis);
router.get('/:id', categoriaController.show);

router.post('/', auth.required, LojaValidation.admin, categoriaController.store);
router.put('/:id', auth.required, LojaValidation.admin, categoriaController.update);
router.delete('/:id', auth.required, LojaValidation.admin, categoriaController.remove);

// ROTAS AO PRODUTO

module.exports = router;
