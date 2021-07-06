const router = require('express').Router();

const Validation = require('express-validation');
const VariacaoController = require('../../../controllers/VariacaoController');

const auth = require('../../auth');
const { LojaValidation } = require('../../../controllers/validacoes/lojaValidation');
const { VariacaoValidation } = require('../../../controllers/validacoes/avaliacaoValidation');
const upload = require('../../../config/multer');

const variacaoController = new VariacaoController();

// CLIENTES/VISITANTES
router.get('/', variacaoController.index);
router.get('/:id', Validation(VariacaoValidation.show), variacaoController.show);

router.post('/', auth.required, LojaValidation.admin, Validation(VariacaoValidation.store), variacaoController.store);
router.put('/:id', auth.required, LojaValidation.admin, Validation(VariacaoValidation.update), variacaoController.update);
router.put(
  '/imgages/:id',
  auth.required,
  LojaValidation.admin,
  Validation(VariacaoValidation.updateImages),
  upload.array('files', 4),
  variacaoController.update
);
router.delete('/:id', auth.required, LojaValidation.admin, Validation(VariacaoValidation.remove), variacaoController.remove);

module.exports = router;
