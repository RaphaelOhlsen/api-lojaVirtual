const mongoose = require('mongoose');

const { Schema } = mongoose;

const RegistrosPedidoSchema = Schema({
  pedido: { type: Schema.Types.ObjectId, ref: 'Pedido', required: true },
  tipo: { type: String, required: true },
  situacao: { type: String, required: true },
  data: { type: Date, default: Date.now },
  payload: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('RegistroPedido', RegistrosPedidoSchema);
