import mongoose from 'mongoose';

const categoriaSchema = new mongoose.Schema({
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
  descripcion: {
    type: String,
    trim: true
  },
  // ========== NUEVO CAMPO ==========
  requiereSabor: {
    type: Boolean,
    default: false,
    comment: 'Si es true (ej: Helados), los productos DEBEN tener un sabor/variante'
  },
  color: {
    type: String,
    default: '#3498db'
  },
  icono: {
    type: String
  },
  orden: {
    type: Number,
    default: 0
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto-generar slug
categoriaSchema.pre('save', function(next) {
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

export default mongoose.model('Categoria', categoriaSchema);
