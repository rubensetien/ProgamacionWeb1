import mongoose from 'mongoose';

const pedidoSchema = new mongoose.Schema({
  // ========== IDENTIFICACIÓN ==========
  numeroPedido: {
    type: String,
    unique: true,
    required: true
  },

  // ========== USUARIO ==========
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    index: true
  },
  datosUsuario: {
    nombre: String,
    email: String,
    telefono: String
  },

  // ========== TIPO DE OPERACIÓN ==========
  tipo: {
    type: String,
    enum: ['reserva', 'compra-online', 'compra-tienda'],
    default: 'compra-online',
    required: true
  },

  // ========== TIPO DE ENTREGA ==========
  tipoEntrega: {
    type: String,
    enum: ['recogida', 'domicilio'],
    required: true
  },

  // ========== ITEMS DEL PEDIDO ==========
  items: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true
    },
    variante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Variante'
    },
    formato: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Formato'
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria'
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1
    },
    precioUnitario: {
      type: Number,
      required: true,
      min: 0
    },
    subtotal: {
      type: Number,
      min: 0
    },
    nombreProducto: String,
    nombreVariante: String,
    nombreFormato: String,
    sku: String,
    imagenVariante: String
  }],

  // ========== PUNTO DE VENTA (RECOGIDA) ==========
  puntoVenta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ubicacion'
  },
  datosPuntoVenta: {
    nombre: String,
    direccion: String,
    telefono: String
  },
  fechaRecogida: {
    type: Date
  },
  horaRecogida: {
    type: String
  },

  // ========== DIRECCIÓN DE ENVÍO ==========
  direccionEnvio: {
    calle: String,
    numero: String,
    piso: String,
    codigoPostal: String,
    ciudad: String,
    provincia: String,
    pais: { type: String, default: 'España' },
    coordenadas: {
      lat: Number,
      lng: Number
    }
  },
  distanciaKm: {
    type: Number
  },

  // ========== CONTACTO ==========
  telefonoContacto: {
    type: String,
    required: true
  },
  notasEntrega: {
    type: String,
    maxlength: 500
  },

  // ========== ESTADO DEL PEDIDO ==========
  estado: {
    type: String,
    enum: [
      'pendiente',
      'confirmado',
      'preparando',
      'listo',
      'en-camino',
      'entregado',
      'cancelado',
      'no-recogido'
    ],
    default: 'pendiente',
    required: true
  },

  historialEstados: [{
    estado: String,
    fecha: {
      type: Date,
      default: Date.now
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    },
    notas: String
  }],

  // ========== ASIGNACIÓN ==========
  repartidor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    default: null
  },

  // ========== DETALLE DE ENTREGAS (LOTES) ==========
  detalleEntregas: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto'
    },
    itemsLote: [{ // Qué lotes se utilizaron para este producto
      fechaFabricacion: Date,
      cantidad: Number
    }]
  }],

  // ========== FECHAS ==========
  fechaPedido: {
    type: Date,
    default: Date.now,
    required: true
  },
  fechaEntregaEstimada: {
    type: Date
  },
  fechaEntregaReal: {
    type: Date
  },

  // ========== TOTALES Y PAGO ==========
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  descuentos: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },

  metodoPago: {
    type: String,
    enum: [
      'efectivo-tienda',
      'tarjeta-tienda',
      'online-tarjeta',
      'online-paypal',
      'transferencia',
      'pendiente'
    ],
    default: 'pendiente'
  },

  estadoPago: {
    type: String,
    enum: ['pendiente', 'pagado', 'reembolsado', 'parcial'],
    default: 'pendiente'
  },

  // ========== RESERVA DE STOCK ==========
  stockReservado: {
    type: Boolean,
    default: false
  },
  reservaExpiresAt: {
    type: Date
  },

  // ========== NOTIFICACIONES ==========
  notificaciones: {
    emailEnviado: {
      type: Boolean,
      default: false
    },
    smsEnviado: {
      type: Boolean,
      default: false
    },
    recordatorioEnviado: {
      type: Boolean,
      default: false
    }
  },

  // ========== NOTAS ==========
  notas: {
    type: String,
    maxlength: 1000
  },
  notasInternas: {
    type: String,
    maxlength: 1000
  },

  // ========== CALIFICACIÓN ==========
  calificacion: {
    puntuacion: {
      type: Number,
      min: 1,
      max: 5
    },
    comentario: String,
    fecha: Date
  },

  // ========== METADATA ==========
  ipCliente: String,
  navegador: String,
  origen: {
    type: String,
    enum: ['web', 'mobile', 'app', 'admin'],
    default: 'web'
  }
}, {
  timestamps: true
});

// ========== ÍNDICES ==========
// pedidoSchema.index({ numeroPedido: 1 }); // Definido en schema con unique: true
pedidoSchema.index({ usuario: 1, estado: 1 });
pedidoSchema.index({ fechaPedido: -1 });
pedidoSchema.index({ estado: 1, tipo: 1 });

// ========== MIDDLEWARE: Generar número de pedido ==========
pedidoSchema.pre('validate', async function (next) {
  if (!this.numeroPedido) {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');

    const count = await mongoose.model('Pedido').countDocuments({
      fechaPedido: {
        $gte: new Date(fecha.setHours(0, 0, 0, 0)),
        $lt: new Date(fecha.setHours(23, 59, 59, 999))
      }
    });

    const secuencial = (count + 1).toString().padStart(4, '0');
    this.numeroPedido = `P${año}${mes}${dia}-${secuencial}`;
  }
  next();
});

// ========== MIDDLEWARE: Calcular totales y subtotales ==========
pedidoSchema.pre('save', function (next) {
  // Calcular subtotal de cada item si no está establecido
  this.items.forEach(item => {
    if (!item.subtotal) {
      item.subtotal = item.precioUnitario * item.cantidad;
    }
  });

  // Calcular subtotal total
  if (!this.subtotal || this.isModified('items')) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  // Calcular total
  this.total = this.subtotal - this.descuentos;

  if (this.total < 0) this.total = 0;

  next();
});

// ========== MÉTODOS DE INSTANCIA ==========
pedidoSchema.methods.cambiarEstado = function (nuevoEstado, usuarioId = null, notas = '') {
  this.historialEstados.push({
    estado: nuevoEstado,
    fecha: new Date(),
    usuario: usuarioId,
    notas
  });

  this.estado = nuevoEstado;

  if (nuevoEstado === 'entregado' && !this.fechaEntregaReal) {
    this.fechaEntregaReal = new Date();
  }

  return this.save();
};

pedidoSchema.methods.reservarStock = async function () {
  this.stockReservado = true;
  this.reservaExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return this.save();
};

pedidoSchema.methods.liberarStock = async function () {
  this.stockReservado = false;
  this.reservaExpiresAt = null;
  return this.save();
};

pedidoSchema.methods.confirmarPago = function (metodoPago) {
  this.metodoPago = metodoPago;
  this.estadoPago = 'pagado';
  return this.save();
};

pedidoSchema.methods.cancelar = async function (motivo, usuarioId = null) {
  await this.cambiarEstado('cancelado', usuarioId, motivo);
  if (this.stockReservado) {
    await this.liberarStock();
  }
  return this;
};

// ========== MÉTODOS ESTÁTICOS ==========
pedidoSchema.statics.getByUsuario = function (usuarioId, opciones = {}) {
  const query = { usuario: usuarioId };

  if (opciones.estado) {
    query.estado = opciones.estado;
  }

  const limit = opciones.limit || 50;
  const skip = opciones.skip || 0;

  return this.find(query)
    .populate('puntoVenta', 'nombre direccion contacto')
    .populate('items.producto')
    .populate('items.variante')
    .populate('items.formato')
    .sort({ fechaPedido: -1 })
    .limit(limit)
    .skip(skip);
};

// ========== VIRTUALS ==========
pedidoSchema.virtual('totalItems').get(function () {
  return this.items.reduce((sum, item) => sum + item.cantidad, 0);
});

pedidoSchema.virtual('puedeSerCancelado').get(function () {
  return ['pendiente', 'confirmado'].includes(this.estado);
});

pedidoSchema.set('toJSON', { virtuals: true });
pedidoSchema.set('toObject', { virtuals: true });

export default mongoose.model('Pedido', pedidoSchema);
