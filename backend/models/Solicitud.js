import mongoose from 'mongoose';

const solicitudSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    tipo: {
        type: String,
        enum: ['vacaciones', 'dia-libre', 'horas-libres', 'asuntos-propios'],
        required: true
    },
    fechaInicio: {
        type: Date,
        required: true
    },
    fechaFin: {
        type: Date,
        required: true
    },
    horas: {
        type: String, // opcional, ej: "10:00-14:00" si es horas-libres
        trim: true
    },
    motivo: {
        type: String,
        required: true,
        trim: true
    },
    estado: {
        type: String,
        enum: ['pendiente', 'aprobada', 'rechazada'],
        default: 'pendiente'
    },
    respuestaAdmin: {
        type: String,
        trim: true
    },
    revisadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }
}, {
    timestamps: true
});

export default mongoose.model('Solicitud', solicitudSchema);
