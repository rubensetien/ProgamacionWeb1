import mongoose from 'mongoose';

const formatoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es requerido'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  tipo: {
    type: String,
    enum: ['peso', 'volumen', 'unidad', 'porcion'],
    default: 'unidad',
    comment: 'Tipo de medida del formato'
  },
  capacidad: {
    type: Number,
    default: 1,
    comment: 'Cantidad numérica (ej: 0.5, 1, 8)'
  },
  unidad: {
    type: String,
    enum: ['L', 'ml', 'kg', 'g', 'unidades', 'porciones'],
    default: 'unidades'
  },
  precioBase: {
    type: Number,
    required: [true, 'El precio base es requerido'],
    min: 0,
    comment: 'Precio adicional de este formato sobre el precio base del producto'
  },
  tipoEnvase: {
    type: String,
    trim: true,
    comment: 'Ej: tarrina plástico, barquillo, caja cartón'
  },
  descripcion: {
    type: String,
    trim: true
  },
  // ========== NUEVO CAMPO ==========
  esUnitario: {
    type: Boolean,
    default: false,
    comment: 'Si es true, el producto se vende por unidades sin formato específico (ej: napolitanas)'
  },
  reciclable: {
    type: Boolean,
    default: false
  },
  disponibleOnline: {
    type: Boolean,
    default: true
  },
  disponibleTienda: {
    type: Boolean,
    default: true
  },
  activo: {
    type: Boolean,
    default: true
  },
  orden: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Auto-generar slug
formatoSchema.pre('save', function (next) {
  if (this.isModified('nombre')) {
    this.slug = this.nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Índices
// formatoSchema.index({ slug: 1 }); // Definido en schema con unique: true
formatoSchema.index({ activo: 1 });
formatoSchema.index({ orden: 1 });

export default mongoose.model('Formato', formatoSchema);
