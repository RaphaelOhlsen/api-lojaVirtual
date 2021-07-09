const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const { Schema } = mongoose;

const EntregaSchema = Schema({
  status: { type: String, required: true },
  codigoRastreamento: { type: String },
  tipo: { type: String, required: true },
  custo: { type: Number, required: true },
  prazo: { type: Number, required: true },
  pedido: { type: Schema.Types.ObjectId, ref: 'Pedido', required: true },
  loja: { type: Schema.Types.ObjectId, ref: 'Loja', required: true },
  payload: { type: Object }
}, { typestamps: true });

EntregaSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Entrega', EntregaSchema);
