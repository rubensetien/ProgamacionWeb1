import mongoose from 'mongoose';

const carritoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    index: true
  },
  
  items: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true
    },
    variante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Variante',
      required: true
    },
    formato: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Formato',
      required: true
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categoria'
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    precioUnitario: {
      type: Number,
      required: true,
      min: 0
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    nombreProducto: String,
    nombreVariante: String,
    nombreFormato: String,
    imagenVariante: String
  }],
  
  puntoRecogida: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ubicacion',  // CORREGIDO: era 'PuntoVenta'
    default: null
  },
  
  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  descuentos: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    default: 0,
    min: 0
  },
  
  activo: {
    type: Boolean,
    default: true
  },
  fechaExpiracion: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  
  notas: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

carritoSchema.index({ usuario: 1, activo: 1 });
carritoSchema.index({ fechaExpiracion: 1 });

carritoSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.total = this.subtotal - this.descuentos;
  if (this.total < 0) this.total = 0;
  next();
});

carritoSchema.methods.agregarItem = function(itemData) {
  const { producto, variante, formato, categoria, cantidad, precioUnitario, nombreProducto, nombreVariante, nombreFormato, imagenVariante } = itemData;
  
  const itemExistente = this.items.find(item => 
    item.producto.toString() === producto.toString() &&
    item.variante.toString() === variante.toString() &&
    item.formato.toString() === formato.toString()
  );
  
  if (itemExistente) {
    itemExistente.cantidad += cantidad;
    itemExistente.subtotal = itemExistente.cantidad * itemExistente.precioUnitario;
  } else {
    this.items.push({
      producto,
      variante,
      formato,
      categoria,
      cantidad,
      precioUnitario,
      subtotal: cantidad * precioUnitario,
      nombreProducto,
      nombreVariante,
      nombreFormato,
      imagenVariante
    });
  }
  
  return this.save();
};

carritoSchema.methods.actualizarCantidad = function(itemId, nuevaCantidad) {
  const item = this.items.id(itemId);
  
  if (!item) {
    throw new Error('Item no encontrado en el carrito');
  }
  
  if (nuevaCantidad <= 0) {
    item.remove();
  } else {
    item.cantidad = nuevaCantidad;
    item.subtotal = item.cantidad * item.precioUnitario;
  }
  
  return this.save();
};

carritoSchema.methods.eliminarItem = function(itemId) {
  const item = this.items.id(itemId);
  
  if (!item) {
    throw new Error('Item no encontrado en el carrito');
  }
  
  item.remove();
  return this.save();
};

carritoSchema.methods.vaciar = function() {
  this.items = [];
  return this.save();
};

carritoSchema.methods.aplicarDescuento = function(montoDescuento) {
  this.descuentos = montoDescuento;
  return this.save();
};

carritoSchema.methods.setPuntoRecogida = function(puntoVentaId) {
  this.puntoRecogida = puntoVentaId;
  return this.save();
};

carritoSchema.methods.estaExpirado = function() {
  return new Date() > this.fechaExpiracion;
};

carritoSchema.methods.extenderExpiracion = function(dias = 7) {
  this.fechaExpiracion = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
  return this.save();
};

carritoSchema.statics.limpiarExpirados = async function() {
  const resultado = await this.updateMany(
    { 
      fechaExpiracion: { $lt: new Date() },
      activo: true
    },
    { 
      activo: false 
    }
  );
  
  return resultado;
};

carritoSchema.statics.obtenerActivo = async function(usuarioId) {
  let carrito = await this.findOne({ 
    usuario: usuarioId, 
    activo: true 
  })
    .populate('items.producto')
    .populate('items.variante')
    .populate('items.formato')
    .populate('items.categoria');
    // ELIMINADO: .populate('puntoRecogida') - lo cargamos solo si existe
  
  if (carrito && carrito.puntoRecogida) {
    await carrito.populate('puntoRecogida');
  }
  
  if (!carrito) {
    carrito = await this.create({
      usuario: usuarioId,
      items: [],
      activo: true
    });
  } else if (carrito.estaExpirado()) {
    carrito.activo = false;
    await carrito.save();
    
    carrito = await this.create({
      usuario: usuarioId,
      items: [],
      activo: true
    });
  }
  
  return carrito;
};

carritoSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.cantidad, 0);
});

carritoSchema.virtual('cantidadProductos').get(function() {
  return this.items.length;
});

carritoSchema.set('toJSON', { virtuals: true });
carritoSchema.set('toObject', { virtuals: true });

export default mongoose.model('Carrito', carritoSchema);
