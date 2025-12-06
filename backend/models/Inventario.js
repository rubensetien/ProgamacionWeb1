import mongoose from 'mongoose';

const inventarioSchema = new mongoose.Schema({
  // ========== PRODUCTO ==========
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true,
    unique: true,
    index: true
  },
  
  // ========== STOCK SIMPLE ==========
  stockActual: {
    type: Number,
    default: 0,
    min: 0,
    comment: 'Stock actual disponible'
  },
  
  stockMinimo: {
    type: Number,
    default: 5,
    min: 0,
    comment: 'Nivel mínimo antes de alerta'
  },
  
  // ========== UBICACIÓN ==========
  ubicacion: {
    type: String,
    default: 'Obrador principal',
    comment: 'Dónde está almacenado'
  },
  
  // ========== HISTORIAL DE MOVIMIENTOS ==========
  movimientos: [{
    tipo: {
      type: String,
      enum: ['entrada', 'salida', 'ajuste', 'venta'],
      required: true
    },
    cantidad: {
      type: Number,
      required: true
    },
    stockAntes: {
      type: Number,
      required: true
    },
    stockDespues: {
      type: Number,
      required: true
    },
    motivo: {
      type: String,
      default: ''
    },
    fecha: {
      type: Date,
      default: Date.now
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    }
  }],
  
  // ========== ALERTAS AUTOMÁTICAS ==========
  alertaStockBajo: {
    type: Boolean,
    default: false
  },
  
  alertaSinStock: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// ========== MIDDLEWARE: Actualizar alertas automáticamente ==========
inventarioSchema.pre('save', function(next) {
  this.alertaSinStock = this.stockActual === 0;
  this.alertaStockBajo = this.stockActual > 0 && this.stockActual <= this.stockMinimo;
  next();
});

// ========== MÉTODOS ==========

// 1️⃣ ENTRADA: Añadir stock
inventarioSchema.methods.agregarStock = function(cantidad, usuarioId = null, motivo = 'Entrada de stock') {
  const stockAntes = this.stockActual;
  this.stockActual += cantidad;
  
  this.movimientos.push({
    tipo: 'entrada',
    cantidad: cantidad,
    stockAntes: stockAntes,
    stockDespues: this.stockActual,
    motivo: motivo,
    fecha: new Date(),
    usuario: usuarioId
  });
  
  return this.save();
};

// 2️⃣ SALIDA: Quitar stock
inventarioSchema.methods.reducirStock = function(cantidad, usuarioId = null, motivo = 'Salida de stock') {
  if (this.stockActual < cantidad) {
    throw new Error(`Stock insuficiente. Disponible: ${this.stockActual}, Solicitado: ${cantidad}`);
  }
  
  const stockAntes = this.stockActual;
  this.stockActual -= cantidad;
  
  this.movimientos.push({
    tipo: 'salida',
    cantidad: cantidad,
    stockAntes: stockAntes,
    stockDespues: this.stockActual,
    motivo: motivo,
    fecha: new Date(),
    usuario: usuarioId
  });
  
  return this.save();
};

// 3️⃣ AJUSTE: Establecer stock exacto
inventarioSchema.methods.ajustarStock = function(nuevoStock, usuarioId = null, motivo = 'Ajuste de stock') {
  const stockAntes = this.stockActual;
  const diferencia = nuevoStock - stockAntes;
  this.stockActual = nuevoStock;
  
  this.movimientos.push({
    tipo: 'ajuste',
    cantidad: diferencia,
    stockAntes: stockAntes,
    stockDespues: this.stockActual,
    motivo: motivo,
    fecha: new Date(),
    usuario: usuarioId
  });
  
  return this.save();
};

// 4️⃣ VENTA: Reducir por venta (para pedidos)
inventarioSchema.methods.registrarVenta = function(cantidad, pedidoId = null) {
  if (this.stockActual < cantidad) {
    throw new Error(`Stock insuficiente. Disponible: ${this.stockActual}, Solicitado: ${cantidad}`);
  }
  
  const stockAntes = this.stockActual;
  this.stockActual -= cantidad;
  
  this.movimientos.push({
    tipo: 'venta',
    cantidad: cantidad,
    stockAntes: stockAntes,
    stockDespues: this.stockActual,
    motivo: pedidoId ? `Venta - Pedido ${pedidoId}` : 'Venta',
    fecha: new Date()
  });
  
  return this.save();
};

// ========== MÉTODOS ESTÁTICOS ==========

// Obtener productos con stock bajo
inventarioSchema.statics.getStockBajo = function() {
  return this.find({ alertaStockBajo: true })
    .populate('producto', 'nombre sku imagen');
};

// Obtener productos sin stock
inventarioSchema.statics.getSinStock = function() {
  return this.find({ alertaSinStock: true })
    .populate('producto', 'nombre sku imagen');
};

// ========== ÍNDICES ==========
inventarioSchema.index({ producto: 1 });
inventarioSchema.index({ stockActual: 1 });
inventarioSchema.index({ alertaStockBajo: 1 });
inventarioSchema.index({ alertaSinStock: 1 });

export default mongoose.model('Inventario', inventarioSchema);
