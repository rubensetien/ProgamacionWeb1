
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Producto from './models/Producto.js';
import Variante from './models/Variante.js';
import Categoria from './models/Categoria.js';
import Formato from './models/Formato.js';

dotenv.config();

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

const refactorDulces = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('📦 Conectado a MongoDB');

        const catDulces = await Categoria.findOne({ slug: 'dulces' });
        if (!catDulces) {
            console.error('❌ No se encontró la categoría Dulces');
            process.exit(1);
        }

        console.log('🛠️ Actualizando categoría Dulces a requiereSabor: false');
        catDulces.requiereSabor = false;
        await catDulces.save();

        console.log('🗑️ Eliminando productos y variantes anteriores de Dulces...');
        // Find variants first
        const variantesDulces = await Variante.find({ categoria: catDulces._id });
        const varianteIds = variantesDulces.map(v => v._id);

        // Delete products linked to these variants OR to the category directly
        const deletedProducts = await Producto.deleteMany({ categoria: catDulces._id });
        console.log(`   - Eliminados ${deletedProducts.deletedCount} productos.`);

        // Delete variants
        const deletedVariants = await Variante.deleteMany({ categoria: catDulces._id });
        console.log(`   - Eliminadas ${deletedVariants.deletedCount} variantes.`);

        // Get Unit Format
        let fmtUnidad = await Formato.findOne({ nombre: 'Unidad' });
        if (!fmtUnidad) {
            fmtUnidad = await Formato.create({ nombre: 'Unidad', capacidad: 1, unidad: 'unidades', precioBase: 0, tipo: 'unidad', esUnitario: true });
        }

        console.log('🥐 Re-creando Dulces como Productos directos...');
        for (const data of dulcesData) {
            const productSku = `DUL-${data.nombre.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

            await Producto.create({
                nombre: data.nombre, // Direct name
                sku: productSku,
                categoria: catDulces._id,
                variante: null, // No variant
                formato: fmtUnidad._id,
                precioBase: 1.50,
                descripcionShort: `Dulce artesanal: ${data.nombre}`,
                alergenos: data.alergenos, // Store allergens on product
                activo: true
            });
        }

        console.log('✅ Refactorización completada con éxito.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

refactorDulces();
