const router = require('express').Router();

const Validation = require('express-validation');
const PedidoController = require('../../../controllers/PedidoController');

const { LojaValidation } = require('../../../controllers/validacoes/lojaValidation');
const { PedidoValidation } = require('../../../controllers/validacoes/pedidoValidation');
const auth = require('../../auth');

const pedidoController = new PedidoController();

// ADMIN
router.get('/admin', auth.required, LojaValidation.admin, Validation(PedidoValidation.indexAdmin), pedidoController.indexAdmin);
router.get('/admin/:id', auth.required, LojaValidation.admin, Validation(PedidoValidation.showAdmin), pedidoController.showAdmin);

router.delete('/admin/:id', auth.required, LojaValidation.admin, Validation(PedidoValidation.removeAdmin), pedidoController.removeAdmin);

// -- carrinho
router.get('/admin/:id/carrinho', auth.required, LojaValidation.admin, Validation(PedidoValidation.showCarrinhoPedidoAdmin), pedidoController.showCarrinhoPedidoAdmin);

// -- pagamento
// router.get('/admin/:id/pagamento', auth.required, LojaValidation.admin, pedidoController.showPagamentoPedidoAdmin);

// CLIENTE

router.get('/', auth.required, Validation(PedidoValidation.index), pedidoController.index);
router.get('/:id', auth.required, Validation(PedidoValidation.show), pedidoController.show);

router.post('/', auth.required, Validation(PedidoValidation.store), pedidoController.store);
router.delete('/:id', auth.required, Validation(PedidoValidation.remove), pedidoController.remove);

// -- carrinho
router.get('/:id/carrinho', auth.required, Validation(PedidoValidation.showCarrinhoPedido), pedidoController.showCarrinhoPedido);

// -- pagamento
// router.get('/:id/pagamento', auth.required, LojaValidation.admin, pedidoController.showPagamentoPedidoAdmin);

module.exports = router;
