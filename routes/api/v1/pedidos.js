const router = require('express').Router();

const PedidoController = require('../../../controllers/PedidoController');

const { LojaValidation } = require('../../../controllers/validacoes/lojaValidation');
const auth = require('../../auth');
const { route } = require('./variacoes');

const pedidoController = new PedidoController();

// ADMIN
router.get('/admin', auth.required, LojaValidation.admin, pedidoController.indexAdmin);
router.get('/admin/:id', auth.required, LojaValidation.admin, pedidoController.showAdmin);

router.delete('/admin/:id', auth.required, LojaValidation.admin, pedidoController.removeAdmin);

// -- carrinho
router.get('/admin/:id/carrinho', auth.required, LojaValidation.admin, pedidoController.showCarrinhoPedidoAdmin);

// -- entrega
// router.get('/admin/:id/entrega', auth.required, LojaValidation.admin, pedidoController.showEntregaPedidoAdmin);
// router.put('/admin/:id/entrega', auth.required, LojaValidation.admin, pedidoController.updateEntregaPedidoAdmin);

// -- pagamento
// router.get('/admin/:id/pagamento', auth.required, LojaValidation.admin, pedidoController.showPagamentoPedidoAdmin);

// CLIENTE

router.get('/', auth.required, pedidoController.index);
router.get('/:id', auth.required, pedidoController.show);

router.post('/', auth.required, pedidoController.store);
router.delete('/:id', auth.required, pedidoController.remove);

// -- carrinho
router.get('/:id/carrinho', auth.required, pedidoController.showCarrinhoPedido);

// -- entrega
// router.get('/:id/entrega', auth.required, LojaValidation.admin, pedidoController.showEntregaPedidoAdmin);
// router.put('/:id/entrega', auth.required, LojaValidation.admin, pedidoController.updateEntregaPedidoAdmin);

// -- pagamento
// router.get('/:id/pagamento', auth.required, LojaValidation.admin, pedidoController.showPagamentoPedidoAdmin);

module.exports = router;
