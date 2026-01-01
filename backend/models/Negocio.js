import mongoose from 'mongoose';

const negocioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre comercial es obligatorio'],
        trim: true
    },
    razonSocial: {
        type: String,
        required: [true, 'La razón social es obligatoria'],
        trim: true
    },
    cif: {
        type: String,
        required: [true, 'El CIF es obligatorio'],
        unique: true,
        trim: true,
        uppercase: true
    },
    tipo: {
        type: String,
        enum: ['hosteleria', 'retail', 'distribuidor', 'eventos', 'otro'],
        required: true
    },
    direccion: {
        calle: { type: String, required: true },
        ciudad: { type: String, required: true },
        codigoPostal: { type: String, required: true },
        provincia: { type: String, required: true },
        pais: { type: String, default: 'España' }
    },
    contacto: {
        nombre: { type: String, required: true }, // Persona de contacto principal
        email: { type: String, required: true },
        telefono: { type: String, required: true }
    },
    estado: {
        type: String,
        enum: ['pendiente', 'activo', 'rechazado', 'baja'],
        default: 'pendiente'
    },
    fechaValidacion: {
        type: Date
    },
    validadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }
}, {
    timestamps: true
});

// Índices
negocioSchema.index({ cif: 1 });
negocioSchema.index({ estado: 1 });

export default mongoose.model('Negocio', negocioSchema);
