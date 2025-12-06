import mongoose from 'mongoose';

const reservaSchema = new mongoose.Schema({
  // Cliente
  cliente: {
    nombre: {
      type: String,
      required: true
    },
    telefono: {
      type: String,
      required: true
    },
    email: String
  },
  
  // Productos reservados
  items: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1
    },
    precioUnitario: Number,
    subtotal: Number
  }],
  
  // Punto de venta donde recoger
  puntoVenta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PuntoVenta',
    required: true
  },
  
  // Fechas
  fechaReserva: {
    type: Date,
    default: Date.now
  },
  fechaRecogida: {
    type: Date,
    required: true
  },
  
  // Estado
  estado: {
    type: String,
    enum: ['pendiente', 'confirmada', 'preparada', 'entregada', 'cancelada'],
    default: 'pendiente'
  },
  
  // Pago
  tipoPago: {
    type: String,
    enum: ['efectivo-tienda', 'tarjeta-tienda', 'online'],
    default: 'efectivo-tienda'
  },
  pagado: {
    type: Boolean,
    default: false
  },
  total: {
    type: Number,
    required: true
  },
  
  // Notas
  notasCliente: String,
  notasInternas: String,
  
  // Código de reserva
  codigoReserva: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});

// Índices
reservaSchema.index({ codigoReserva: 1 });
reservaSchema.index({ estado: 1 });
reservaSchema.index({ fechaRecogida: 1 });
reservaSchema.index({ puntoVenta: 1 });

// Generar código de reserva
reservaSchema.pre('save', function(next) {
  if (this.isNew) {
    this.codigoReserva = `RES-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

export default mongoose.model('Reserva', reservaSchema);