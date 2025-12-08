import mongoose from 'mongoose';

const turnoSchema = new mongoose.Schema({
    ubicacion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ubicacion',
        required: true
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    tipo: {
        type: String,
        enum: ['mañana', 'tarde', 'noche', 'libre', 'vacaciones', 'baja'],
        required: true
    },
    nota: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Índice compuesto para evitar duplicados y facilitar búsquedas
// Un usuario solo puede tener un registro de turno por día y ubicación (aunque técnicamente podría tener partido, simplificamos a 1 registro principal o array en V2)
// Para esta versión, asumimos un turno por día por usuario.
turnoSchema.index({ ubicacion: 1, fecha: 1, usuario: 1 }, { unique: true });
turnoSchema.index({ fecha: 1 });
turnoSchema.index({ usuario: 1 });

export default mongoose.model('Turno', turnoSchema);
