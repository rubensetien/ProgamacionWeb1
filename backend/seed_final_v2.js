
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Producto from './models/Producto.js';
import Variante from './models/Variante.js';
import Categoria from './models/Categoria.js';
import Formato from './models/Formato.js';

dotenv.config();

const heladosData = [
    { nombre: "Turrón", alergenos: ["lactosa", "frutos-secos"] },
    { nombre: "Chocolate", alergenos: ["lactosa"] },
    { nombre: "Mantecado", alergenos: ["lactosa"] },
    { nombre: "Caramelo", alergenos: ["lactosa"] },
    { nombre: "Jaspeado de moka", alergenos: ["lactosa"] },
    { nombre: "Jaspeado escocés", alergenos: ["lactosa"] },
    { nombre: "Nata", alergenos: ["lactosa"] },
    { nombre: "Fresa", alergenos: ["lactosa"] },
    { nombre: "Limón", alergenos: ["lactosa"] },
    { nombre: "Avellana", alergenos: ["lactosa", "frutos-secos"] },
    { nombre: "Tutti frutti", alergenos: ["lactosa", "sulfitos"] },
    { nombre: "Yogur", alergenos: ["lactosa"] },
    { nombre: "Queso", alergenos: ["lactosa"] },
    { nombre: "Tarta de queso", alergenos: ["gluten", "huevo", "lactosa"] },
    { nombre: "Chocolate sin azúcar", alergenos: ["lactosa"] },
    { nombre: "Mantecado sin azúcar", alergenos: ["lactosa"] },
    { nombre: "Crocante", alergenos: ["lactosa", "frutos-secos", "gluten"] }
];

const dulcesData = [
    { nombre: "Napolitanas", alergenos: ["gluten", "huevo", "lactosa", "frutos-secos"] },
    { nombre: "Napolitanas de chocolate", alergenos: ["gluten", "huevo", "lactosa", "soja"] },
    { nombre: "Ochos de crema", alergenos: ["gluten", "huevo", "lactosa"] },
    { nombre: "Croissant", alergenos: ["gluten", "huevo", "lactosa"] },
    { nombre: "Suizos", alergenos: ["gluten", "huevo", "lactosa"] },
    { nombre: "Regmas", alergenos: ["gluten", "huevo", "lactosa"] },
    { nombre: "Mini Regma", alergenos: ["gluten", "huevo", "lactosa"] },
    { nombre: "Minicroissant", alergenos: ["gluten", "huevo", "lactosa"] },
    { nombre: "Minicroissant jamón y queso", alergenos: ["gluten", "huevo", "lactosa", "soja"] },
    { nombre: "Minicroissant bonito", alergenos: ["gluten", "huevo", "lactosa", "pescado"] },
    { nombre: "Minicroissant vegetal", alergenos: ["gluten", "huevo", "lactosa", "soja"] },
    { nombre: "Minicroissant bocas de mar", alergenos: ["gluten", "huevo", "lactosa", "pescado", "crustaceos", "moluscos"] },
    { nombre: "Lenguas y palmeras", alergenos: ["gluten", "lactosa"] },
    { nombre: "Ochos", alergenos: ["gluten", "lactosa", "frutos-secos"] },
    { nombre: "Krunis", alergenos: ["gluten", "lactosa"] },
    { nombre: "Palmeras de yema", alergenos: ["gluten", "lactosa", "huevo"] },
    { nombre: "Palmeras de chocolate", alergenos: ["gluten", "lactosa", "soja"] },
    { nombre: "Sacristanes", alergenos: ["gluten", "lactosa", "huevo"] },
    { nombre: "Torteles", alergenos: ["gluten", "lactosa", "huevo"] },
    { nombre: "Panettone de frutas", alergenos: ["gluten", "lactosa", "huevo"] },
    { nombre: "Panettones de chocolate", alergenos: ["gluten", "lactosa", "huevo", "soja"] }
];

// Pricing Configuration per User Request
const formatoSpecs = [
    { nombre: "0.5L", capacidad: 0.5, unidad: "L", precio: 6.50, activo: true },
    { nombre: "1L", capacidad: 1, unidad: "L", precio: 11.50, activo: true },
    { nombre: "4L", capacidad: 4, unidad: "L", precio: 0, activo: false },
    { nombre: "8L", capacidad: 8, unidad: "L", precio: 82.00, activo: true },
    { nombre: "Barra de Corte", capacidad: 1, unidad: "unidades", precio: 15.00, activo: true }
];

const seedFinal = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📦 Conectado a MongoDB');

        // --- PREPARE CATEGORIES ---
        console.log('🏗️ Preparando Categorías...');
        let catHelados = await Categoria.findOne({ slug: 'helados' });
        if (!catHelados) catHelados = await Categoria.create({ nombre: 'Helados', requiereSabor: true, icono: '🍦' });

        let catDulces = await Categoria.findOne({ slug: 'dulces' });
        if (!catDulces) {
            catDulces = await Categoria.create({ nombre: 'Dulces', requiereSabor: false, icono: '🥐' });
        } else {
            catDulces.requiereSabor = false;
            await catDulces.save();
        }

        // --- CLEANUP (DISABLED TO PROTECT USER DATA) ---
        // console.log('🧹 Limpiando datos antiguos...');
        // await Producto.deleteMany({ categoria: { $in: [catHelados._id, catDulces._id] } });
        // await Variante.deleteMany({ categoria: catHelados._id });
        // await Variante.deleteMany({ categoria: catDulces._id });
        // console.log('   - Limpieza completada.');

        // --- PREPARE FORMATS ---
        console.log('📏 Preparando Formatos...');
        const formatosDb = {};
        for (const spec of formatoSpecs) {
            let f = await Formato.findOne({ nombre: spec.nombre });

            // Try fallback by slug if name match fails
            if (!f) {
                const slug = spec.nombre.toLowerCase().replace(/ /g, '-').replace(/\./g, '');
                f = await Formato.findOne({ slug: new RegExp(`^${slug}$`, 'i') });
            }

            if (!f) {
                try {
                    f = await Formato.create({
                        nombre: spec.nombre,
                        capacidad: spec.capacidad,
                        unidad: spec.unidad,
                        precioBase: 0,
                        tipo: spec.unidad === 'unidades' ? 'unidad' : 'volumen'
                    });
                } catch (e) {
                    // Catch duplicates race/slug
                    console.log(`Format ${spec.nombre} exists/collision, fetching...`);
                    const slug = spec.nombre.toLowerCase().replace(/ /g, '-').replace(/\./g, '');
                    f = await Formato.findOne({ slug: new RegExp(slug, 'i') });
                }
            }
            if (f) {
                formatosDb[spec.nombre] = f;
            } else {
                console.error(`Could not find or create format: ${spec.nombre}`);
            }
        }

        let fmtUnidad = await Formato.findOne({ nombre: 'Unidad' });
        if (!fmtUnidad) {
            try {
                fmtUnidad = await Formato.create({ nombre: 'Unidad', capacidad: 1, unidad: 'unidades', precioBase: 0, tipo: 'unidad', esUnitario: true });
            } catch (e) {
                fmtUnidad = await Formato.findOne({ slug: 'unidad' });
            }
        }

        // --- SEED HELADOS ---
        console.log('🍦 Creando Helados...');
        for (const data of heladosData) {
            // Find or Create Flavor Variant
            let variante = await Variante.findOne({ nombre: data.nombre, tipoVariante: 'sabor' });
            if (!variante) {
                variante = await Variante.create({
                    nombre: data.nombre,
                    categoria: catHelados._id,
                    alergenos: data.alergenos,
                    tipoVariante: 'sabor'
                });
            }

            // Description Generation
            const descriptionsByFormat = {
                "0.5L": "Tarrina isotérmica de medio litro. Ideal para disfrutar en casa o compartir.",
                "1L": "Envase familiar de 1 litro. Sabor auténtico en formato grande.",
                "8L": "Formato industrial de 8 litros. Perfecto para eventos y hostelería.",
                "4L": "Formato especial de 4 litros.",
                "Barra de Corte": "Barra de helado lista para cortar y servir."
            };

            for (const spec of formatoSpecs) {
                const formatoDoc = formatosDb[spec.nombre];

                if (!formatoDoc) continue;

                // Idempotency: skip if exists
                const existingProduct = await Producto.findOne({
                    nombre: `${data.nombre} ${spec.nombre}`,
                    categoria: catHelados._id
                });

                if (existingProduct) {
                    process.stdout.write('.');
                    continue;
                }

                const uniqueId = Math.floor(Math.random() * 9000) + 1000;
                const nameCode = data.nombre.substring(0, 3).toUpperCase();
                const specCode = spec.nombre.replace('.', '').replace(/\s/g, '');
                const productSku = `HEL-${nameCode}-${specCode}-${uniqueId}`.replace(/\s/g, '');

                const isActive = spec.activo;

                await Producto.create({
                    nombre: `${data.nombre} ${spec.nombre}`,
                    sku: productSku,
                    categoria: catHelados._id,
                    variante: variante._id,
                    formato: formatoDoc._id,
                    precioBase: spec.precio,
                    descripcionShort: descriptionsByFormat[spec.nombre] || `Helado sabor ${data.nombre}`,
                    alergenos: data.alergenos,
                    activo: isActive,
                    seVendeOnline: isActive,
                    seVendeEnPuntoVenta: isActive,
                    gestionaStock: isActive
                });
            }
        }

        // --- SEED DULCES ---
        console.log('\n🥐 Creando Dulces...');

        const sweetDescriptions = {
            "Napolitanas": "Clásica masa hojaldrada, crujiente y dorada.",
            "Napolitanas de chocolate": "Hojaldre relleno de delicioso chocolate negro fundido.",
            "Croissant": "El auténtico croissant de mantequilla, ligero y esponjoso.",
            "Suizos": "Bollo tierno de leche con azúcar escarchado.",
            "Regmas": "Nuestra especialidad de la casa, receta secreta.",
            "Palmeras de chocolate": "Hojaldre caramelizado bañado en cobertura de chocolate."
        };

        for (const data of dulcesData) {
            // Idempotency
            const existingSweet = await Producto.findOne({ nombre: data.nombre, categoria: catDulces._id });
            if (existingSweet) {
                process.stdout.write('.');
                continue;
            }

            const productSku = `DUL-${data.nombre.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
            const desc = sweetDescriptions[data.nombre] || `Delicioso ${data.nombre.toLowerCase()} elaborado artesanalmente cada día.`;

            await Producto.create({
                nombre: data.nombre,
                sku: productSku,
                categoria: catDulces._id,
                variante: null,
                formato: fmtUnidad._id,
                precioBase: 1.50,
                descripcionShort: desc,
                alergenos: data.alergenos,
                activo: true,
                seVendeOnline: true,
                seVendeEnPuntoVenta: true
            });
        }

        console.log('\n✅ Re-generación final completada.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedFinal();
