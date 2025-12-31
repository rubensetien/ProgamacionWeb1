
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Producto from './models/Producto.js';
import Variante from './models/Variante.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, 'uploads/productos');
const SABORES_DIR = path.join(__dirname, 'uploads/sabores');

const relinkImages = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📦 Conectado a MongoDB');

        // 1. Process Named Files in uploads/productos 
        if (fs.existsSync(UPLOADS_DIR)) {
            const productFiles = fs.readdirSync(UPLOADS_DIR).filter(f => !fs.statSync(path.join(UPLOADS_DIR, f)).isDirectory());

            console.log(`📂 Encontrados ${productFiles.length} archivos en uploads/productos.`);

            for (const file of productFiles) {
                const lowerFile = file.toLowerCase();
                // Heuristic Mappings
                let searchTerm = '';
                if (lowerFile.includes('avellana')) searchTerm = 'Avellana';
                else if (lowerFile.includes('nata')) searchTerm = 'Nata';
                else if (lowerFile.includes('fresa')) searchTerm = 'Fresa';
                else if (lowerFile.includes('limon') || lowerFile.includes('limón')) searchTerm = 'Limón';
                else if (lowerFile.includes('moka')) searchTerm = 'Jaspeado de moka';
                else if (lowerFile.includes('queso') && !lowerFile.includes('tarta')) searchTerm = 'Queso';
                else if (lowerFile.includes('tarta') && lowerFile.includes('queso')) searchTerm = 'Tarta de queso';
                else if (lowerFile.includes('turron') || lowerFile.includes('turrón')) searchTerm = 'Turrón';
                else if (lowerFile.includes('chocolate') && !lowerFile.includes('panettone')) searchTerm = 'Chocolate';
                else if (lowerFile.includes('crocante')) searchTerm = 'Crocante';

                if (searchTerm) {
                    console.log(`🔍 Buscando productos para imagen: ${file} (Term: ${searchTerm})`);
                    await Producto.updateMany(
                        { nombre: { $regex: searchTerm, $options: 'i' } },
                        { $set: { imagen: `/uploads/productos/${file}`, imagenPrincipal: `/uploads/productos/${file}` } }
                    );
                    await Variante.updateMany(
                        { nombre: { $regex: searchTerm, $options: 'i' } },
                        { $set: { imagen: `/uploads/productos/${file}` } }
                    );
                }
            }
        }

        // 2. Process Anonymous Files in uploads/sabores
        if (fs.existsSync(SABORES_DIR)) {
            const saborFiles = fs.readdirSync(SABORES_DIR)
                .filter(f => !fs.statSync(path.join(SABORES_DIR, f)).isDirectory())
                .sort(); // Sort by name (timestamp) ascending -> Oldest first

            console.log(`📂 Encontrados ${saborFiles.length} archivos en uploads/sabores.`);

            // Get Flavors strictly in the order of seed data (assuming creation order)
            const variantes = await Variante.find({ tipoVariante: 'sabor' });
            // Sort by creation time (ObjectId)
            variantes.sort((a, b) => a._id.getTimestamp() - b._id.getTimestamp());

            console.log(`🍦 Encontrados ${variantes.length} sabores en DB.`);

            for (let i = 0; i < variantes.length; i++) {
                if (i < saborFiles.length) {
                    const file = saborFiles[i];
                    const variante = variantes[i];

                    console.log(`🔗 Enlazando (Orden ${i + 1}): ${variante.nombre} -> ${file}`);

                    const imagePath = `/uploads/sabores/${file}`;

                    // Update Variant
                    variante.imagen = imagePath;
                    await variante.save();

                    // Update Products with this variant
                    await Producto.updateMany(
                        { variante: variante._id },
                        {
                            $set: {
                                imagen: imagePath,
                                imagenPrincipal: imagePath
                            }
                        }
                    );
                }
            }
        }

        console.log('🔗 Proceso de reconexión finalizado.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

relinkImages();
