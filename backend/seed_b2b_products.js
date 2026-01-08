import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Producto from './models/Producto.js';
import Categoria from './models/Categoria.js';
import Variante from './models/Variante.js';
import Formato from './models/Formato.js';

dotenv.config();

const flavors = [
    'Chocolate', 'Vainilla', 'Fresa', 'Limón',
    'Nata', 'Avellana', 'Turrón', 'Café'
];

async function seedB2BProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Ensure 'Cubeta 4L' format exists
        const formatData = {
            nombre: 'Cubeta 4L',
            tipo: 'volumen',
            capacidad: 4,
            unidad: 'L',
            precioBase: 0, // Price is on the product itself
            tipoEnvase: 'Cubeta plástico',
            activo: true,
            disponibleOnline: true, // Visible for B2B logic
            disponibleTienda: false
        };

        const formato4L = await Formato.findOneAndUpdate(
            { nombre: 'Cubeta 4L' },
            formatData,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log(`Format ensures: ${formato4L.nombre}`);

        // Find or Create 'Helados' category if needed, strictly to satisfy schema
        // Assuming an ID or generic category exists, but let's try to find one.
        const categoria = await Categoria.findOne({ nombre: { $regex: /helado/i } });

        if (!categoria) {
            console.error('No suitable category found. Please ensure categories exist.');
            process.exit(1);
        }

        // 2. Fetch ALL variants dynamically
        const allVariantes = await Variante.find({});
        console.log(`Found ${allVariantes.length} variants in total.`);

        for (const variante of allVariantes) {
            const flavorName = variante.nombre;

            const prod = {
                nombre: `Helado de ${flavorName}`, // Cleaner name since format chip handles display
                descripcionCorta: `Cubeta de 4 Litros de Helado de ${flavorName} de altísima calidad.`,
                descripcionLarga: `Nuestro clásico helado de ${flavorName} ahora en formato exclusivo para hostelería. Ideal para restaurantes y caterings que buscan ofrecer la experiencia Regma.`,
                precioBase: 45.00,
                categoria: categoria._id,
                variante: variante._id,
                formato: formato4L._id, // Assign the Format
                sku: `B2B-${variante.slug.toUpperCase().substring(0, 5)}-4L`, // Use SLUG for safer SKU
                stock: 100,
                gestionaStock: true,
                soloProfesionales: true,
                canales: ['b2b'],
                peso: 4,
                imagenPrincipal: '/images/b2b-bucket-placeholder.png'
            };

            // Use findOneAndUpdate to UPSERT (Update if exists, Create if not)
            const result = await Producto.findOneAndUpdate(
                { sku: prod.sku },
                prod,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            console.log(`Processed B2B Product: ${result.nombre} (${formato4L.nombre})`);
        }

        console.log('B2B Seeding/Update Complete');
        process.exit(0);

        console.log('B2B Seeding Complete');
        process.exit(0);

    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
}

seedB2BProducts();
