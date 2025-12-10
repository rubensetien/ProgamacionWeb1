import mongoose from 'mongoose';

const mensajeSchema = new mongoose.Schema({
  de: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  para: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  texto: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  nombreEmisor: {
    type: String,
    required: true
  },
  leido: {
    type: Boolean,
    default: false
  },
  entregado: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para búsquedas rápidas
mensajeSchema.index({ de: 1, para: 1, timestamp: -1 });
mensajeSchema.index({ para: 1, leido: 1 });

export default mongoose.model('Mensaje', mensajeSchema);
