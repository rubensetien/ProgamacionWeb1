import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: [true, 'La categoría es obligatoria']
  },
  variante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Variante',
    default: null
  },
  formato: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formato',
    default: null
  },

  // Identificación
  nombre: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    lowercase: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  codigoBarras: String,

  // Descripción
  descripcionCorta: String,
  descripcionLarga: String,

  // Precio
  precioBase: {
    type: Number,
    required: true,
    min: 0
  },
  precioPersonalizado: {
    type: Number,
    default: null
  },

  // Descuentos
  descuento: {
    tipo: {
      type: String,
      enum: ['porcentaje', 'cantidad', 'ninguno'],
      default: 'ninguno'
    },
    valor: {
      type: Number,
      default: 0
    },
    vigenciaDesde: Date,
    vigenciaHasta: Date
  },

  // Stock
  gestionaStock: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: null
  },
  stockMinimo: {
    type: Number,
    default: 0
  },

  // Imágenes
  imagenPrincipal: String,
  imagenesSecundarias: [String],

  // Canales de venta
  seVendeOnline: {
    type: Boolean,
    default: true
  },
  seVendeEnPuntoVenta: {
    type: Boolean,
    default: true
  },
  canales: [{
    type: String,
    enum: ['heladeria', 'pasteleria', 'cafeteria', 'ecommerce']
  }],

  // Estado
  activo: {
    type: Boolean,
    default: true
  },
  destacado: {
    type: Boolean,
    default: false
  },
  nuevo: {
    type: Boolean,
    default: false
  },
  enOferta: {
    type: Boolean,
    default: false
  },
  visible: {
    type: Boolean,
    default: true
  },
  publicadoEn: Date,
  orden: {
    type: Number,
    default: 0
  },

  // Producción
  lugarProduccion: {
    type: String,
    default: 'obrador-revilla'
  },
  tiempoProduccion: {
    type: Number,
    default: 0
  },

  // Logística
  peso: Number,
  requiereRefrigeracion: {
    type: Boolean,
    default: false
  },
  diasCaducidad: Number,

  // Características
  alergenos: [{
    type: String,
    enum: ['lactosa', 'gluten', 'frutos-secos', 'huevo', 'soja', 'pescado', 'crustaceos', 'moluscos', 'sulfitos', 'ninguno']
  }],

  // Estadísticas
  ventasTotales: {
    type: Number,
    default: 0
  },
  visualizaciones: {
    type: Number,
    default: 0
  },
  valoracionPromedio: {
    type: Number,
    default: 0
  },
  numeroValoraciones: {
    type: Number,
    default: 0
  },

  // SEO
  metaTitle: String,
  metaDescription: String,
  keywords: [String],

  // Notas
  notasInternas: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// ========== VALIDACIÓN CONDICIONAL: Variante obligatoria para Helados ==========
productoSchema.pre('validate', async function (next) {
  // 1. Generar slug si no existe
  if (!this.slug && this.nombre) {
    this.slug = this.nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  // 1.b Generar SKU si no existe
  if (!this.sku) {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const prefix = this.nombre ? this.nombre.substring(0, 3).toUpperCase() : 'PROD';
    this.sku = `${prefix}-${random}`;
  }

  // 2. Validar variante según categoría
  if (this.isModified('categoria') || this.isModified('variante')) {
    try {
      const Categoria = mongoose.model('Categoria');
      const categoria = await Categoria.findById(this.categoria);

      if (categoria && categoria.requiereSabor && !this.variante) {
        return next(new Error(`La categoría "${categoria.nombre}" requiere un sabor/variante`));
      }
    } catch (error) {
      console.error('Error validando categoría:', error);
    }
  }

  next();
});

// Índices
productoSchema.index({ categoria: 1, variante: 1, formato: 1 });
productoSchema.index({ activo: 1 });
productoSchema.index({ destacado: 1 });
productoSchema.index({ ventasTotales: -1 });
productoSchema.index({ canales: 1 });

// Virtual: precio final
productoSchema.virtual('precioFinal').get(function () {
  if (this.descuento && this.descuento.tipo !== 'ninguno') {
    if (this.descuento.tipo === 'porcentaje') {
      return this.precioBase * (1 - this.descuento.valor / 100);
    } else if (this.descuento.tipo === 'cantidad') {
      return Math.max(0, this.precioBase - this.descuento.valor);
    }
  }
  return this.precioPersonalizado || this.precioBase;
});

// Virtual: disponible
productoSchema.virtual('disponible').get(function () {
  if (!this.activo) return false;
  if (!this.gestionaStock) return true;
  if (this.stock === null) return true;
  return this.stock > 0;
});

// Virtual: agotado
productoSchema.virtual('agotado').get(function () {
  if (!this.gestionaStock) return false;
  if (this.stock === null) return false;
  return this.stock === 0;
});

// ========== MÉTODO ESTÁTICO: Nombre completo del producto ==========
productoSchema.methods.obtenerNombreCompleto = async function () {
  await this.populate('variante formato');

  let nombreCompleto = this.nombre;

  if (this.variante) {
    nombreCompleto = `${this.variante.nombre}`;
  }

  if (this.formato) {
    nombreCompleto += ` ${this.formato.nombre}`;
  }

  return nombreCompleto;
};

productoSchema.set('toJSON', { virtuals: true });
productoSchema.set('toObject', { virtuals: true });

export default mongoose.model('Producto', productoSchema);
