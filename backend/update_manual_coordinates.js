import mongoose from 'mongoose';
import Ubicacion from './models/Ubicacion.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MANUAL_COORDS = [
    {
        nombre: 'Oficinas Regma',
        lat: 43.4090714,
        lon: -3.8589325
    },
    {
        nombre: 'REGMA SAN JUAN DE LA CANAL',
        lat: 43.473889, // 43°28′26″N
        lon: -3.893333  // 3°53′36″O
    },
    {
        nombre: 'REGMA COMILLAS',
        lat: 43.7859,
        lon: -4.2511
    },
    {
        nombre: 'REGMA LLANES',
        lat: 43.4210,
        lon: -4.7531
    },
    {
        nombre: 'REGMA SANTURCE',
        lat: 43.3289,
        lon: -3.0314
    },
    {
        nombre: 'REGMA LAREDO PUERTO',
        lat: 43.415000, // 43°24′54″N
        lon: -3.406667  // 3°24′24″O
    },
    {
        nombre: 'REGMA SANTOÑA',
        lat: 43.450376,
        lon: -3.461783
    },
    {
        nombre: 'REGMA NOJA',
        lat: 43.4815,
        lon: -3.5186
    },
    {
        nombre: 'REGMA NOJA RIS',
        lat: 43.4892,
        lon: -3.52306
    },
    {
        nombre: 'REGMA BURGOS',
        lat: 42.3408,
        lon: -3.6831
    },
    {
        nombre: 'REGMA MADRID FUENCARRAL',
        lat: 40.4225,
        lon: -3.7031
    }
];

async function updateManual() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to DB');

        for (const item of MANUAL_COORDS) {
            const result = await Ubicacion.updateOne(
                { nombre: item.nombre },
                {
                    $set: {
                        coordenadas: {
                            latitud: item.lat,
                            longitud: item.lon
                        }
                    }
                }
            );

            if (result.matchedCount > 0) {
                console.log(`✅ Updated: ${item.nombre}`);
            } else {
                console.log(`⚠️ Not found: ${item.nombre}`);
            }
        }

        console.log('DONE');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateManual();
