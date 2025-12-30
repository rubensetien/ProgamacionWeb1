import mongoose from 'mongoose';
import Ubicacion from './models/Ubicacion.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkLocations() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const total = await Ubicacion.countDocuments();
        console.log(`Total locations: ${total}`);

        const active = await Ubicacion.countDocuments({ activo: true });
        console.log(`Active locations: ${active}`);

        const publicas = await Ubicacion.find({
            activo: true,
            tipo: { $nin: ['oficina', 'obrador'] }
        }).select('nombre codigo tipo activo');

        console.log(`Public locations (should show on map): ${publicas.length}`);

        console.log('--- Sample Public Locations ---');
        publicas.slice(0, 7).forEach(u => {
            console.log(`${u.nombre} (${u.tipo}) - Activo: ${u.activo}`);
        });

        if (publicas.length > 5) {
            console.log('--- Locations 6-10 ---');
            publicas.slice(5, 10).forEach(u => {
                console.log(`${u.nombre} (${u.tipo}) - Activo: ${u.activo}`);
            });
        }

        console.log('--- Sample Public Locations (with coords) ---');
        publicas.forEach((u, index) => {
            // Only show first 10 for brevity, or all if needed. Let's show first 10.
            if (index < 10) {
                // Re-fetch to get coordinates (the previous query selected specific fields but I want to be sure)
                // Wait, I selected 'nombre codigo tipo activo' only. I need 'coordenadas'.
            }
        });

        // Let's just do a new query to get coords
        const publicasWithCoords = await Ubicacion.find({
            activo: true,
            tipo: { $nin: ['oficina', 'obrador'] }
        }).select('nombre coordenadas');

        const missingCoords = await Ubicacion.find({
            activo: true,
            $or: [
                { 'coordenadas': { $exists: false } },
                { 'coordenadas.latitud': { $exists: false } },
                { 'coordenadas.latitud': null }
            ]
        }).select('nombre direccion');

        console.log('\n❌ TIENDAS SIN COORDENADAS:');
        console.log('---------------------------');
        missingCoords.forEach(u => {
            const dir = u.direccion ? `${u.direccion.calle}, ${u.direccion.ciudad}` : 'Sin dirección';
            console.log(`- ${u.nombre}`);
            console.log(`  📍 Dirección actual: ${dir}`);
        });
        console.log('---------------------------');
        console.log(`Total pendientes: ${missingCoords.length}`);

        console.log('--- Checking Coordinates ---');
        publicasWithCoords.forEach((u, i) => {
            const lat = u.coordenadas?.latitud;
            const lng = u.coordenadas?.longitud;
            const hasCoords = lat && lng;
            console.log(`#${i + 1} ${u.nombre}: [${lat}, ${lng}] ${hasCoords ? '✅' : '❌'}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkLocations();
