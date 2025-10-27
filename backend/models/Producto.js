import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    minlength: [3, 'El nombre debe tener al menos 3 caracteres']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0.1, 'El precio debe ser mayor que 0']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    minlength: [5, 'La descripción debe tener al menos 5 caracteres']
  },
  imagen: {
    type: String,
    default: null // Ruta a la imagen: /uploads/producto-123456.jpg
  }
}, {
  timestamps: true
});

export default mongoose.model('Producto', productoSchema);