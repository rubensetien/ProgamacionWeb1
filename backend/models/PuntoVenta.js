import mongoose from 'mongoose';

const puntoVentaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String
  },
  
  tipo: {
    type: String,
    enum: ['heladeria', 'pasteleria', 'cafeteria', 'mixto'],
    required: true
  },
  
  direccion: {
    calle: String,
    ciudad: String,
    provincia: String,
    codigoPostal: String,
    pais: {
      type: String,
      default: 'España'
    },
    coordenadas: {
      lat: Number,
      lng: Number
    }
  },
  
  contacto: {
    telefono: String,
    email: String,
    web: String
  },
  
  horario: {
    lunes: String,
    martes: String,
    miercoles: String,
    jueves: String,
    viernes: String,
    sabado: String,
    domingo: String
  },
  
  // Categorías disponibles
  categoriasDisponibles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria'
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
  
  // Imagen
  imagen: String,
  imagenes: [String]
}, {
  timestamps: true
});

// Middleware: generar slug ANTES de validar
puntoVentaSchema.pre('validate', function(next) {
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
puntoVentaSchema.index({ tipo: 1 });
puntoVentaSchema.index({ activo: 1 });

export default mongoose.model('PuntoVenta', puntoVentaSchema);
