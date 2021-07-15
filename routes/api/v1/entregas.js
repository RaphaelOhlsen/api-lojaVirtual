const router = require('express').Router();

const EntregaController = require('../../../controllers/EntregaController');

const { LojaValidation } = require('../../../controllers/validacoes/lojaValidation');
const auth = require('../../auth');

const entregaController = new EntregaController();

router.get('/:id', auth.required, entregaController.show);
router.put('/:id', auth.required, LojaValidation.admin, EntregaController.update);
router.post('/calcular', entregaController.calcular);

module.exports = router;

