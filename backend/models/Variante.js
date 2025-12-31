import mongoose from 'mongoose';

const varianteSchema = new mongoose.Schema({
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: [true, 'La categoría es obligatoria']
  },

  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  slug: {
    type: String,
    lowercase: true
  },
  descripcion: {
    type: String,
    default: ''
  },

  // Clasificación
  tipoVariante: {
    type: String,
    enum: ['sabor', 'relleno', 'tipo', 'estilo', 'otro'],
    default: 'sabor'
  },
  subcategoria: {
    type: String,
    default: ''
  },

  // Visual
  imagen: {
    type: String,
    default: null
  },
  imagenThumbnail: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: '#ffffff'
  },

  // Características
  ingredientes: [{
    type: String
  }],
  alergenos: [{
    type: String,
    enum: ['lactosa', 'gluten', 'frutos-secos', 'huevo', 'soja', 'pescado', 'crustaceos', 'moluscos', 'sulfitos', 'ninguno']
  }],
  valoresNutricionales: {
    calorias: Number,
    grasas: Number,
    proteinas: Number,
    carbohidratos: Number,
    azucares: Number,
    sal: Number
  },

  // Etiquetas
  temporada: {
    type: String,
    enum: ['todo-año', 'verano', 'invierno', 'primavera', 'otoño', 'navidad'],
    default: 'todo-año'
  },
  tipoAzucar: {
    type: String,
    enum: ['con-azucar', 'sin-azucar'],
    default: 'con-azucar'
  },
  vegano: {
    type: Boolean,
    default: false
  },
  sinGluten: {
    type: Boolean,
    default: false
  },
  ecologico: {
    type: Boolean,
    default: false
  },
  artesanal: {
    type: Boolean,
    default: true
  },

  // Estado
  destacado: {
    type: Boolean,
    default: false
  },
  nuevo: {
    type: Boolean,
    default: false
  },
  activo: {
    type: Boolean,
    default: true
  },
  orden: {
    type: Number,
    default: 0
  },

  // Disponibilidad
  disponibleDesde: Date,
  disponibleHasta: Date
}, {
  timestamps: true
});

// Middleware: generar slug ANTES de validar
varianteSchema.pre('validate', function (next) {
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

// Índices
varianteSchema.index({ categoria: 1, slug: 1 }, { unique: true });
varianteSchema.index({ activo: 1 });
varianteSchema.index({ destacado: 1 });
varianteSchema.index({ temporada: 1 });

export default mongoose.model('Variante', varianteSchema);
