import mongoose from 'mongoose';

const obradorSchema = new mongoose.Schema({
  // ========== IDENTIFICACIÓN ==========
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  slug: {
    type: String,
    lowercase: true,
    index: true
  },
  codigo: {
    type: String,
    unique: true,
    uppercase: true,
    required: true
  },
  
  // ========== UBICACIÓN ==========
  ubicacion: {
    direccion: {
      type: String,
      required: true
    },
    ciudad: {
      type: String,
      required: true
    },
    provincia: {
      type: String,
      required: true
    },
    codigoPostal: {
      type: String,
      required: true
    },
    pais: {
      type: String,
      default: 'España'
    },
    coordenadas: {
      lat: Number,
      lng: Number
    }
  },
  
  // ========== TIPO Y CARACTERÍSTICAS ==========
  tipo: {
    type: String,
    enum: ['produccion', 'almacen', 'mixto'],
    default: 'produccion',
    required: true
  },
  
  descripcion: {
    type: String
  },
  
  // ========== RESPONSABLES Y PERSONAL ==========
  responsable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  
  trabajadores: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    },
    puesto: {
      type: String,
      enum: [
        'maestro-heladero',
        'ayudante-produccion',
        'control-calidad',
        'almacen',
        'logistica',
        'mantenimiento'
      ],
      required: true
    },
    fechaAsignacion: {
      type: Date,
      default: Date.now
    },
    activo: {
      type: Boolean,
      default: true
    }
  }],
  
  // ========== CAPACIDAD DE PRODUCCIÓN ==========
  capacidadProduccion: {
    diaria: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Litros por día'
    },
    semanal: {
      type: Number,
      default: 0,
      min: 0
    },
    mensual: {
      type: Number,
      default: 0,
      min: 0
    },
    unidad: {
      type: String,
      enum: ['litros', 'kg', 'unidades'],
      default: 'litros'
    }
  },
  
  // ========== INVENTARIO ==========
  inventario: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    stockMinimo: {
      type: Number,
      default: 0
    },
    ubicacionFisica: {
      type: String,
      comment: 'Ej: Cámara A3, Almacén B2'
    },
    lote: {
      type: String
    },
    fechaProduccion: {
      type: Date
    },
    fechaCaducidad: {
      type: Date
    },
    ultimaActualizacion: {
      type: Date,
      default: Date.now
    }
  }],
  
  // ========== ÓRDENES DE PRODUCCIÓN ==========
  ordenesProduccion: [{
    numeroOrden: {
      type: String,
      required: true
    },
    productos: [{
      producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto'
      },
      variante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variante'
      },
      cantidad: {
        type: Number,
        required: true,
        min: 1
      },
      unidad: {
        type: String,
        enum: ['litros', 'kg', 'unidades'],
        default: 'litros'
      },
      prioridad: {
        type: String,
        enum: ['baja', 'media', 'alta', 'urgente'],
        default: 'media'
      }
    }],
    solicitadoPor: {
      tipo: {
        type: String,
        enum: ['tienda', 'admin', 'sistema'],
        required: true
      },
      usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
      },
      tienda: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PuntoVenta'
      }
    },
    estado: {
      type: String,
      enum: ['pendiente', 'aprobada', 'en-proceso', 'completada', 'cancelada'],
      default: 'pendiente'
    },
    asignadoA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario'
    },
    fechaSolicitud: {
      type: Date,
      default: Date.now
    },
    fechaInicio: {
      type: Date
    },
    fechaCompletado: {
      type: Date
    },
    fechaEntregaEstimada: {
      type: Date
    },
    notas: {
      type: String
    },
    notasProduccion: {
      type: String
    }
  }],
  
  // ========== MATERIAS PRIMAS ==========
  materiasPrimas: [{
    nombre: {
      type: String,
      required: true
    },
    tipo: {
      type: String,
      enum: ['lacteo', 'fruta', 'fruto-seco', 'azucar', 'aditivo', 'envase', 'otro'],
      required: true
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    stockMinimo: {
      type: Number,
      default: 0
    },
    unidad: {
      type: String,
      enum: ['kg', 'litros', 'unidades'],
      required: true
    },
    proveedor: {
      type: String
    },
    ultimaCompra: {
      type: Date
    },
    fechaCaducidad: {
      type: Date
    }
  }],
  
  // ========== HORARIOS ==========
  horarios: {
    apertura: {
      type: String,
      default: '08:00'
    },
    cierre: {
      type: String,
      default: '18:00'
    },
    diasProduccion: [{
      type: String,
      enum: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
    }],
    turnosDisponibles: [{
      nombre: {
        type: String
      },
      horaInicio: String,
      horaFin: String,
      tipo: {
        type: String,
        enum: ['mañana', 'tarde', 'noche']
      }
    }]
  },
  
  // ========== INSTALACIONES ==========
  instalaciones: {
    camarasFrio: {
      type: Number,
      default: 0
    },
    capacidadAlmacenamiento: {
      type: Number,
      comment: 'Metros cúbicos'
    },
    lineasProduccion: {
      type: Number,
      default: 1
    },
    maquinaria: [{
      nombre: String,
      tipo: String,
      capacidad: Number,
      ultimoMantenimiento: Date,
      proximoMantenimiento: Date
    }]
  },
  
  // ========== CERTIFICACIONES ==========
  certificaciones: [{
    nombre: {
      type: String
    },
    numero: {
      type: String
    },
    fechaEmision: {
      type: Date
    },
    fechaExpiracion: {
      type: Date
    },
    activo: {
      type: Boolean,
      default: true
    }
  }],
  
  // ========== CONTACTO ==========
  contacto: {
    telefono: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    telefonoEmergencia: {
      type: String
    }
  },
  
  // ========== ESTADÍSTICAS ==========
  estadisticas: {
    produccionTotal: {
      type: Number,
      default: 0
    },
    ordenesCompletadas: {
      type: Number,
      default: 0
    },
    ordenesEnProceso: {
      type: Number,
      default: 0
    },
    ultimaProduccion: {
      type: Date
    }
  },
  
  // ========== CONFIGURACIÓN ==========
  configuracion: {
    permiteVisitas: {
      type: Boolean,
      default: false
    },
    alertasStock: {
      type: Boolean,
      default: true
    },
    alertasProduccion: {
      type: Boolean,
      default: true
    }
  },
  
  // ========== ESTADO ==========
  activo: {
    type: Boolean,
    default: true
  },
  operativo: {
    type: Boolean,
    default: true
  },
  motivoInactivo: {
    type: String
  },
  
  // ========== METADATA ==========
  imagen: {
    type: String
  },
  imagenes: [{
    type: String
  }]
}, {
  timestamps: true
});

// ========== ÍNDICES ==========
obradorSchema.index({ slug: 1 });
obradorSchema.index({ codigo: 1 });
obradorSchema.index({ activo: 1, operativo: 1 });
obradorSchema.index({ 'ubicacion.ciudad': 1 });
obradorSchema.index({ responsable: 1 });

// ========== MIDDLEWARE: Generar slug ==========
obradorSchema.pre('validate', function(next) {
  if (!this.slug && this.nombre) {
    this.slug = this.nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
  next();
});

// ========== MÉTODOS DE INSTANCIA ==========

// Verificar si tiene stock de un producto
obradorSchema.methods.tieneStock = function(productoId, cantidad) {
  const item = this.inventario.find(i => 
    i.producto.toString() === productoId.toString()
  );
  
  return item && item.stock >= cantidad;
};

// Reducir stock
obradorSchema.methods.reducirStock = function(productoId, cantidad) {
  const item = this.inventario.find(i => 
    i.producto.toString() === productoId.toString()
  );
  
  if (!item || item.stock < cantidad) {
    throw new Error('Stock insuficiente');
  }
  
  item.stock -= cantidad;
  item.ultimaActualizacion = new Date();
  
  return this.save();
};

// Agregar stock
obradorSchema.methods.agregarStock = function(productoId, cantidad, datos = {}) {
  let item = this.inventario.find(i => 
    i.producto.toString() === productoId.toString()
  );
  
  if (item) {
    item.stock += cantidad;
    item.ultimaActualizacion = new Date();
    if (datos.lote) item.lote = datos.lote;
    if (datos.fechaProduccion) item.fechaProduccion = datos.fechaProduccion;
    if (datos.fechaCaducidad) item.fechaCaducidad = datos.fechaCaducidad;
  } else {
    this.inventario.push({
      producto: productoId,
      stock: cantidad,
      ...datos,
      ultimaActualizacion: new Date()
    });
  }
  
  return this.save();
};

// Obtener productos con stock bajo
obradorSchema.methods.getProductosStockBajo = function() {
  return this.inventario.filter(item => 
    item.stock <= item.stockMinimo
  );
};

// Obtener órdenes pendientes
obradorSchema.methods.getOrdenesPendientes = function() {
  return this.ordenesProduccion.filter(orden => 
    orden.estado === 'pendiente' || orden.estado === 'aprobada'
  );
};

// Obtener órdenes en proceso
obradorSchema.methods.getOrdenesEnProceso = function() {
  return this.ordenesProduccion.filter(orden => 
    orden.estado === 'en-proceso'
  );
};

// ========== VIRTUALS ==========
obradorSchema.virtual('totalTrabajadores').get(function() {
  return this.trabajadores.filter(t => t.activo).length;
});

obradorSchema.virtual('stockTotal').get(function() {
  return this.inventario.reduce((total, item) => total + item.stock, 0);
});

obradorSchema.virtual('ordenesPendientes').get(function() {
  return this.ordenesProduccion.filter(o => 
    o.estado === 'pendiente' || o.estado === 'aprobada'
  ).length;
});

obradorSchema.set('toJSON', { virtuals: true });
obradorSchema.set('toObject', { virtuals: true });

export default mongoose.model('Obrador', obradorSchema);
