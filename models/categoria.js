const mongoose = require('mongoose');

const { Schema } = mongoose;

const CategoriaSchema = Schema({
  nome: { type: String, required: true },
  codigo: { type: String, required: true },
  disponibilidade: { type: Boolean, default: true },
  produtos: { type: [{ type: Schema.Types.ObjectId, ref: 'Produto' }] },
  loja: { type: Schema.Types.ObjectId, ref: 'Loja' }
}, { timestamps: true });

module.exports = mongoose.model('Categoria', CategoriaSchema);
