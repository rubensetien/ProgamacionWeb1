import mongoose from 'mongoose';

const ubicacionSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la ubicación es obligatorio'],
    trim: true,
    maxlength: 100
  },
  codigo: {
    type: String,
    required: [true, 'El código es obligatorio'],
    unique: true,
    uppercase: true,
    trim: true
  },
  tipo: {
    type: String,
    enum: ['obrador', 'cafeteria', 'punto-venta', 'oficina'],
    required: true
  },
  direccion: {
    calle: { type: String, trim: true },
    ciudad: { type: String, trim: true },
    codigoPostal: { type: String, trim: true },
    provincia: { type: String, trim: true },
    pais: { type: String, default: 'España' }
  },
  coordenadas: {
    latitud: { type: Number },
    longitud: { type: Number }
  },
  contacto: {
    telefono: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    horario: { type: String }
  },

  // ✅ AÑADIDO: Horarios detallados para puntos de venta
  horarios: {
    lunes: { apertura: String, cierre: String },
    martes: { apertura: String, cierre: String },
    miercoles: { apertura: String, cierre: String },
    jueves: { apertura: String, cierre: String },
    viernes: { apertura: String, cierre: String },
    sabado: { apertura: String, cierre: String },
    domingo: { apertura: String, cierre: String }
  },

  responsable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  obradorAsignado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ubicacion'
  },
  capacidadProduccion: {
    cantidad: { type: Number },
    unidad: { type: String }
  },

  // ✅ AÑADIDO: Para pedidos con recogida
  aceptaPedidos: {
    type: Boolean,
    default: true
  },
  capacidadDiaria: {
    type: Number,
    default: 50,
    comment: 'Pedidos máximos por día'
  },

  activo: {
    type: Boolean,
    default: true
  },

  // ✅ AÑADIDO: Metadata útil
  descripcion: {
    type: String
  },
  imagen: {
    type: String
  }
}, {
  timestamps: true
});

// Índices
// ubicacionSchema.index({ codigo: 1 }); // Definido en schema con unique: true
ubicacionSchema.index({ tipo: 1 });
ubicacionSchema.index({ activo: 1 });
ubicacionSchema.index({ 'coordenadas.latitud': 1, 'coordenadas.longitud': 1 });

// ✅ Índice geoespacial para búsquedas por radio
// ✅ Índice geoespacial para búsquedas por radio
ubicacionSchema.index({
  coordenadas: '2dsphere'
}, { sparse: true });

// ✅ MÉTODO: Calcular distancia a otra ubicación
ubicacionSchema.methods.calcularDistancia = function (lat, lng) {
  if (!this.coordenadas.latitud || !this.coordenadas.longitud) {
    return null;
  }

  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat - this.coordenadas.latitud) * Math.PI / 180;
  const dLon = (lng - this.coordenadas.longitud) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.coordenadas.latitud * Math.PI / 180) *
    Math.cos(lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en km
};

export default mongoose.model('Ubicacion', ubicacionSchema);
