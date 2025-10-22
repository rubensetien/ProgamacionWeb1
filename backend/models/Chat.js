import mongoose from 'mongoose';

const mensajeSchema = new mongoose.Schema({
  texto: {
    type: String,
    required: true
  },
  emisor: {
    type: String,
    enum: ['user', 'admin', 'sistema'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  leido: {
    type: Boolean,
    default: false
  }
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  userEmail: {
    type: String,
    required: true
  },
  mensajes: [mensajeSchema],
  activo: {
    type: Boolean,
    default: true
  },
  ultimaActividad: {
    type: Date,
    default: Date.now
  },
  mensajesSinLeerAdmin: {
    type: Number,
    default: 0
  },
  mensajesSinLeerUser: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

chatSchema.index({ userId: 1 });
chatSchema.index({ activo: 1 });

export default mongoose.model('Chat', chatSchema);