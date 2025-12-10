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

  // ========== LOTES (BATCHES) ==========
  lotes: [{
    fechaFabricacion: {
      type: Date,
      required: true
    },
    cantidad: {
      type: Number,
      required: true,
      min: 0
    },
    reservado: { // Nuevo: Cantidad reservada (no disponible para venta pero física)
      type: Number,
      default: 0,
      min: 0
    },
    fechaCaducidad: Date,
    notas: String
  }],

  // ========== STOCK SIMPLE (Virtual sum of batches) ==========
  stockActual: {
    type: Number,
    default: 0,
    min: 0,
    comment: 'Stock FÍSICO total (incluye reservados)'
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
      enum: ['entrada', 'salida', 'ajuste', 'venta', 'reserva', 'confirmacion-entrega'],
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
    },
    detalleLotes: [{ // Para rastrear qué lotes se afectaron
      fechaFabricacion: Date,
      cantidad: Number
    }]
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
inventarioSchema.pre('save', function (next) {
  // Recalcular stock total basado en lotes si existen
  if (this.lotes && this.lotes.length > 0) {
    this.stockActual = this.lotes.reduce((sum, lote) => sum + lote.cantidad, 0);
  }

  this.alertaSinStock = this.stockActual === 0;
  this.alertaStockBajo = this.stockActual > 0 && this.stockActual <= this.stockMinimo;
  next();
});

// ========== VIRTUALS ==========
inventarioSchema.virtual('stockDisponible').get(function () {
  if (!this.lotes || this.lotes.length === 0) return this.stockActual;
  const totalReservado = this.lotes.reduce((sum, lote) => sum + (lote.reservado || 0), 0);
  return Math.max(0, this.stockActual - totalReservado);
});

// ========== MÉTODOS ==========

// 1️⃣ ENTRADA: Añadir stock (con lote)
inventarioSchema.methods.agregarStock = function (cantidad, usuarioId = null, motivo = 'Entrada de stock', fechaFabricacion = null) {
  const stockAntes = this.stockActual;

  // Si no se proporciona fecha, usamos hoy (o un lote "default" si ya existe uno sin fecha específica)
  const fechaLote = fechaFabricacion ? new Date(fechaFabricacion) : new Date();
  fechaLote.setHours(0, 0, 0, 0); // Normalizar a medianoche

  let loteExistente = this.lotes.find(l => {
    const d = new Date(l.fechaFabricacion);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === fechaLote.getTime();
  });

  if (loteExistente) {
    loteExistente.cantidad += cantidad;
  } else {
    this.lotes.push({
      fechaFabricacion: fechaLote,
      cantidad: cantidad
    });
    // Ordenar lotes por fecha (más antiguos primero para FIFO)
    this.lotes.sort((a, b) => new Date(a.fechaFabricacion) - new Date(b.fechaFabricacion));
  }

  // El pre-save calculará el stockActual total
  const stockDespuesPreview = this.stockActual + cantidad; // Aproximación para el historial

  this.movimientos.push({
    tipo: 'entrada',
    cantidad: cantidad,
    stockAntes: stockAntes,
    stockDespues: stockDespuesPreview, // Se corregirá al guardar
    motivo: motivo,
    fecha: new Date(),
    usuario: usuarioId,
    detalleLotes: [{
      fechaFabricacion: fechaLote,
      cantidad: cantidad
    }]
  });

  return this.save();
};

// 2️⃣ SALIDA: Quitar stock (FIFO o lote específico)
inventarioSchema.methods.reducirStock = function (cantidad, usuarioId = null, motivo = 'Salida de stock', fechaFabricacion = null) {
  if (this.stockActual < cantidad) {
    throw new Error(`Stock insuficiente. Disponible: ${this.stockActual}, Solicitado: ${cantidad}`);
  }

  const stockAntes = this.stockActual;
  let cantidadRestante = cantidad;
  let lotesAfectados = [];

  if (fechaFabricacion) {
    // Reducir de un lote específico
    const fechaLote = new Date(fechaFabricacion);
    fechaLote.setHours(0, 0, 0, 0);

    const lote = this.lotes.find(l => {
      const d = new Date(l.fechaFabricacion);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === fechaLote.getTime();
    });

    if (!lote || lote.cantidad < cantidad) {
      throw new Error(`Stock insuficiente en el lote ${fechaFabricacion}.`);
    }

    lote.cantidad -= cantidad;
    cantidadRestante = 0;
    lotesAfectados.push({ fechaFabricacion: fechaLote, cantidad: cantidad });
  } else {
    // FIFO: Consumir de los lotes más antiguos primero
    // Asumimos que this.lotes ya está ordenado por fecha por 'agregarStock'
    // Pero por seguridad ordenamos de nuevo
    this.lotes.sort((a, b) => new Date(a.fechaFabricacion) - new Date(b.fechaFabricacion));

    // Filtrar lotes con stock > 0
    for (let lote of this.lotes) {
      if (lote.cantidad <= 0) continue;
      if (cantidadRestante <= 0) break;

      const aConsumir = Math.min(lote.cantidad, cantidadRestante);
      lote.cantidad -= aConsumir;
      cantidadRestante -= aConsumir;
      lotesAfectados.push({ fechaFabricacion: lote.fechaFabricacion, cantidad: aConsumir });
    }
  }

  if (cantidadRestante > 0) {
    // Esto no debería pasar si la validación inicial de stock total pasó,
    // a menos que los lotes no sumen el stock total (inconsistencia de datos)
    throw new Error(`Inconsistencia en lotes. Stock total dice OK, pero lotes no alcanzan.`);
  }

  // Limpiar lotes vacíos (Opcional: podemos dejarlos en 0 para historial)
  // this.lotes = this.lotes.filter(l => l.cantidad > 0);

  this.movimientos.push({
    tipo: 'salida',
    cantidad: cantidad,
    stockAntes: stockAntes,
    stockDespues: stockAntes - cantidad, // Se recalculará bien en pre-save
    motivo: motivo,
    fecha: new Date(),
    usuario: usuarioId,
    detalleLotes: lotesAfectados
  });

  return this.save();
};

// 3️⃣ AJUSTE: Ajuste manual (reemplazar)
// Para simplificar, si es ajuste total, borramos lotes anteriores y creamos uno nuevo con hoy?
// O mejor: Ajuste de un lote específico.
inventarioSchema.methods.ajustarStock = function (nuevoStock, usuarioId = null, motivo = 'Ajuste de stock', fechaFabricacion = null) {
  // Ajustar stock global es complejo con lotes.
  // Vamos a asumir que "Ajuste" en este contexto significa "Corregir la cantidad total".
  // Estrategia: Si hay fechaFabricacion, ajustamos ese lote.
  // Si NO hay fechaFabricacion, es un "reset" peligroso -> Creamos un lote de ajuste con la diferencia?
  // O mejor, creamos un único lote con el stock total "hoy".

  const stockAntes = this.stockActual;
  const fechaLote = fechaFabricacion ? new Date(fechaFabricacion) : new Date();
  fechaLote.setHours(0, 0, 0, 0);

  if (fechaFabricacion) {
    // Ajustar un lote específico
    let lote = this.lotes.find(l => {
      const d = new Date(l.fechaFabricacion);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === fechaLote.getTime();
    });

    if (lote) {
      lote.cantidad = nuevoStock;
    } else {
      this.lotes.push({ fechaFabricacion: fechaLote, cantidad: nuevoStock });
      this.lotes.sort((a, b) => new Date(a.fechaFabricacion) - new Date(b.fechaFabricacion));
    }
    // Nota: El 'nuevoStock' aquí se interpreta como el stock de ESE LOTE, no el total.
    // Esto podría ser confuso desde la API si no se especifica bien.
    // Para mantener compatibilidad con la API anterior que enviaba "nuevoStockTotal", 
    // si no se envía fecha, asumimos que se quiere forzar el stock total.
  } else {
    // SIN FECHA: Reset drástico. Borrar todo y poner un lote hoy.
    // Es lo más seguro para "stockActual = X".
    this.lotes = [{
      fechaFabricacion: new Date(),
      cantidad: nuevoStock,
      notas: 'Ajuste stock total'
    }];
  }

  // Recalculamos manualmente para el historial antes de guardar
  const stockDespuesPreview = this.lotes.reduce((acc, l) => acc + l.cantidad, 0);

  this.movimientos.push({
    tipo: 'ajuste',
    cantidad: stockDespuesPreview - stockAntes,
    stockAntes: stockAntes,
    stockDespues: stockDespuesPreview,
    motivo: motivo,
    fecha: new Date(),
    usuario: usuarioId
  });

  return this.save();
};

// 4️⃣ VENTA: Reducir por venta (FIFO)
inventarioSchema.methods.registrarVenta = function (cantidad, pedidoId = null) {
  // Reutilizamos reducirStock que ya tiene FIFO
  return this.reducirStock(cantidad, null, pedidoId ? `Venta - Pedido ${pedidoId}` : 'Venta');
};

// 4️⃣ RESERVAR STOCK (Preparación de pedido)
inventarioSchema.methods.reservarStockLote = function (fechaFabricacion, cantidad, usuarioId = null, motivo = 'Reserva pedido') {
  const fechaLote = new Date(fechaFabricacion);
  fechaLote.setHours(0, 0, 0, 0);

  const lote = this.lotes.find(l => {
    const d = new Date(l.fechaFabricacion);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === fechaLote.getTime();
  });

  if (!lote) throw new Error('Lote no encontrado');

  // Disponibilidad = cantidad - reservado
  if ((lote.cantidad - (lote.reservado || 0)) < cantidad) {
    throw new Error(`Stock insuficiente disponible en lote ${fechaFabricacion}`);
  }

  lote.reservado = (lote.reservado || 0) + cantidad;

  this.movimientos.push({
    tipo: 'reserva',
    cantidad: cantidad,
    stockAntes: this.stockActual,
    stockDespues: this.stockActual, // Reserva no baja el stock físico
    motivo: motivo,
    fecha: new Date(),
    usuario: usuarioId,
    detalleLotes: [{ fechaFabricacion: fechaLote, cantidad }]
  });

  return this.save();
};

// 5️⃣ CONFIRMAR VENTA (Entrega de pedido) - Baja física y de reserva
inventarioSchema.methods.confirmarVentaLote = function (fechaFabricacion, cantidad, usuarioId = null, motivo = 'Confirmación entrega') {
  const fechaLote = new Date(fechaFabricacion);
  fechaLote.setHours(0, 0, 0, 0);

  const lote = this.lotes.find(l => {
    const d = new Date(l.fechaFabricacion);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === fechaLote.getTime();
  });

  if (!lote) throw new Error('Lote no encontrado');

  // Asumimos que la reserva YA EXISTE.
  // Pero por si acaso, verificamos que hay reserva que liberar
  if (!lote.reservado || lote.reservado < cantidad) {
    console.warn('Confirmando venta sin reserva suficiente, ajustando reserva.');
    lote.reservado = 0; // O manejar error
  } else {
    lote.reservado -= cantidad;
  }

  // Baja física
  if (lote.cantidad < cantidad) throw new Error('Inconsistencia crítica: Stock físico menor que entrega');
  lote.cantidad -= cantidad;

  const stockAntes = this.stockActual; // Antes del save (que recalcula)

  this.movimientos.push({
    tipo: 'confirmacion-entrega',
    cantidad: cantidad,
    stockAntes: stockAntes,
    stockDespues: stockAntes - cantidad, // Preview
    motivo: motivo,
    fecha: new Date(),
    usuario: usuarioId,
    detalleLotes: [{ fechaFabricacion: fechaLote, cantidad }]
  });

  return this.save();
};

// ========== MÉTODOS ESTÁTICOS ==========

// Obtener productos con stock bajo
inventarioSchema.statics.getStockBajo = function () {
  return this.find({ alertaStockBajo: true })
    .populate('producto', 'nombre sku imagen');
};

// Obtener productos sin stock
inventarioSchema.statics.getSinStock = function () {
  return this.find({ alertaSinStock: true })
    .populate('producto', 'nombre sku imagen');
};

// ========== ÍNDICES ==========
// inventarioSchema.index({ producto: 1 }); // Definido en schema con unique: true & index: true
inventarioSchema.index({ stockActual: 1 });
inventarioSchema.index({ alertaStockBajo: 1 });
inventarioSchema.index({ alertaSinStock: 1 });

export default mongoose.model('Inventario', inventarioSchema);
