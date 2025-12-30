import mongoose from 'mongoose';
import axios from 'axios';
import Ubicacion from './models/Ubicacion.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar dotenv para leer desde backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const DELAY_MS = 1500; // 1.5s delay to be safe/polite

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function geocodeAddress(address) {
    try {
        const query = `${address.calle}, ${address.ciudad}, ${address.provincia}, España`;
        console.log(`🔍 Buscando: "${query}"`);

        const response = await axios.get(NOMINATIM_URL, {
            params: {
                q: query,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'RegmaStoreLocator/1.0 (admin@regma.es)' // Required by OSM
            }
        });

        if (response.data && response.data.length > 0) {
            const result = response.data[0];
            return {
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon)
            };
        }
        return null;
    } catch (error) {
        console.error(`❌ Error geocoding ${address.ciudad}:`, error.message);
        return null;
    }
}

async function updateCoordinates() {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado.');

        // Buscar ubicaciones activas SIN coordenadas o con coordenadas inválidas
        const ubicaciones = await Ubicacion.find({
            activo: true,
            $or: [
                { 'coordenadas.latitud': { $exists: false } },
                { 'coordenadas.latitud': null },
                { 'coordenadas.latitud': 0 }
            ]
        });

        console.log(`📋 Encontradas ${ubicaciones.length} ubicaciones sin coordenadas.`);

        for (const ubicacion of ubicaciones) {
            if (!ubicacion.direccion || !ubicacion.direccion.ciudad) {
                console.log(`⚠️ Saltando ${ubicacion.nombre} (sin dirección)`);
                continue;
            }

            const coords = await geocodeAddress(ubicacion.direccion);

            if (coords) {
                ubicacion.coordenadas = {
                    latitud: coords.lat,
                    longitud: coords.lon
                };
                await ubicacion.save();
                console.log(`✅ Actualizado ${ubicacion.nombre}: [${coords.lat}, ${coords.lon}]`);
            } else {
                console.log(`❌ No se encontraron coordenadas para ${ubicacion.nombre}`);
            }

            // Respetar rate limit de Nominatim (max 1 request/sec)
            await sleep(DELAY_MS);
        }

        console.log('🎉 Proceso finalizado.');
        process.exit(0);

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
        process.exit(1);
    }
}

updateCoordinates();
