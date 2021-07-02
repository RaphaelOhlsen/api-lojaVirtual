const router = require('express').Router();

// const Validation = require('express-validation');
const AvaliacaoController = require('../../../controllers/AvaliacaoController');

const auth = require('../../auth');
const { LojaValidation } = require('../../../controllers/validacoes/lojaValidation');
// const { AvaliacaoValidation } = require('../../../controllers/validacoes/avaliacaoValidation');

const avaliacaoController = new AvaliacaoController();

// CLIENTES/VISITANTES
router.get('/', avaliacaoController.index);
router.get('/:id', avaliacaoController.show);
router.post('/', auth.required, avaliacaoController.store);

// ADMIN
router.delete('/:id', auth.required, LojaValidation.admin, avaliacaoController.remove);

module.exports = router;
