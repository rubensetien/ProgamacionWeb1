import mongoose from 'mongoose';

const solicitudStockSchema = new mongoose.Schema({
    tienda: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ubicacion',
        required: true
    },
    usuario: { // Quién hizo la solicitud
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    items: [{
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto',
            required: true
        },
        nombreProducto: String, // Snapshot name
        cantidad: {
            type: Number,
            required: true,
            min: 1
        },
        unidad: String // e.g. 'cajas', 'unidades'
    }],
    estado: {
        type: String,
        enum: ['pendiente', 'aceptado', 'en-preparacion', 'preparado', 'en-reparto', 'entregado', 'rechazada'],
        default: 'pendiente'
    },
    // Detalle de lotes entregados (para trazabilidad)
    detalleEntregas: [{
        producto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Producto'
        },
        itemsLote: [{
            fechaFabricacion: Date,
            cantidad: Number
        }]
    }],
    notas: {
        type: String,
        trim: true
    },
    fechaSolicitud: {
        type: Date,
        default: Date.now
    },
    fechaEnvio: Date,
    fechaRecepcion: Date
}, {
    timestamps: true
});

// Indices
solicitudStockSchema.index({ tienda: 1, estado: 1 });
solicitudStockSchema.index({ fechaSolicitud: -1 });

export default mongoose.model('SolicitudStock', solicitudStockSchema);
