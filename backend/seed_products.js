
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
    { nombre: "Mantecado sin azúcar", alergenos: ["lactosa"] }
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

const formatosHelado = [
    { nombre: "0.5L", capacidad: 0.5, unidad: "L", precio: 10 },
    { nombre: "1L", capacidad: 1, unidad: "L", precio: 18 },
    { nombre: "4L", capacidad: 4, unidad: "L", precio: 60 },
    { nombre: "8L", capacidad: 8, unidad: "L", precio: 100 }
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📦 Conectado a MongoDB');

        // 1. Categorías
        let catHelados = await Categoria.findOne({ slug: 'helados' });
        if (!catHelados) catHelados = await Categoria.create({ nombre: 'Helados', requiereSabor: true, icono: '🍦' });

        let catDulces = await Categoria.findOne({ slug: 'dulces' });
        if (!catDulces) catDulces = await Categoria.create({ nombre: 'Dulces', requiereSabor: true, icono: '🥐' }); // requiereSabor=true para usar variantes

        // 2. Formatos Helado
        const formatoDocs = [];
        for (const fmt of formatosHelado) {
            let f = await Formato.findOne({ nombre: fmt.nombre });
            if (!f) f = await Formato.create({ nombre: fmt.nombre, capacidad: fmt.capacidad, unidad: fmt.unidad, precioBase: fmt.precio, tipo: 'volumen' });
            formatoDocs.push(f);
        }

        // 3. Formato Unitario (para dulces)
        let fmtUnidad = await Formato.findOne({ nombre: 'Unidad' });
        if (!fmtUnidad) fmtUnidad = await Formato.create({ nombre: 'Unidad', capacidad: 1, unidad: 'unidades', precioBase: 0, tipo: 'unidad', esUnitario: true });

        // 4. Procesar Helados
        console.log('🍦 Procesando Helados...');
        for (const data of heladosData) {
            // Crear Variante
            let variante = await Variante.findOne({ nombre: data.nombre, categoria: catHelados._id });
            if (!variante) {
                variante = await Variante.create({
                    nombre: data.nombre,
                    categoria: catHelados._id,
                    alergenos: data.alergenos,
                    tipoVariante: 'sabor'
                });
            } else {
                variante.alergenos = data.alergenos;
                await variante.save();
            }

            // Crear Productos (Variante x Formato)
            for (const fmt of formatoDocs) {
                const productSku = `HEL-${data.nombre.substring(0, 3).toUpperCase()}-${fmt.nombre.replace('.', '')}`.replace(/\s/g, '');
                const exists = await Producto.findOne({ sku: productSku });
                if (!exists) {
                    await Producto.create({
                        nombre: `${data.nombre} ${fmt.nombre}`,
                        sku: productSku,
                        categoria: catHelados._id,
                        variante: variante._id,
                        formato: fmt._id,
                        precioBase: fmt.precioBase, // Formato defines base price offset, logic might vary but using format price as base here simplistically
                        descripcionShort: `Helado sabor ${data.nombre} en formato ${fmt.nombre}`,
                        activo: true
                    });
                }
            }
        }

        // 5. Procesar Dulces
        console.log('🥐 Procesando Dulces...');
        for (const data of dulcesData) {
            // Crear Variante "implicita"
            let variante = await Variante.findOne({ nombre: data.nombre, categoria: catDulces._id });
            if (!variante) {
                variante = await Variante.create({
                    nombre: data.nombre,
                    categoria: catDulces._id,
                    alergenos: data.alergenos, // Aquí guardamos los alérgenos
                    tipoVariante: 'tipo'
                });
            } else {
                variante.alergenos = data.alergenos;
                await variante.save();
            }

            const productSku = `DUL-${data.nombre.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
            const exists = await Producto.findOne({ nombre: data.nombre, categoria: catDulces._id });

            if (!exists) {
                await Producto.create({
                    nombre: data.nombre,
                    sku: productSku,
                    categoria: catDulces._id,
                    variante: variante._id,
                    formato: fmtUnidad._id,
                    precioBase: 1.50, // Default price
                    descripcionShort: `Dulce artesanal: ${data.nombre}`,
                    activo: true
                });
            }
        }

        console.log('✅ Importación completada con éxito.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedProducts();
