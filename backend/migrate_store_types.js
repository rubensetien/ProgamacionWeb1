
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Ubicacion from '../backend/models/Ubicacion.js';

dotenv.config();

const migrateStoreTypes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📦 Conectado a MongoDB');

        // 1. Update all 'punto-venta' to 'heladeria'
        // NOTE: We use updateMany with bypassValidation true if strict is enabled, 
        // but since we updated the schema first, we might need to be careful.
        // However, Mongoose validation happens on save(), updateMany usually bypasses unless configured otherwise.
        // We will update directly.

        const result = await Ubicacion.updateMany(
            { tipo: 'punto-venta' },
            { $set: { tipo: 'heladeria' } }
        );

        console.log(`✅ Migración completada.`);
        console.log(`🔄 Documentos actualizados: ${result.modifiedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    }
};

migrateStoreTypes();
