
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Formato from './models/Formato.js';

dotenv.config();

async function checkFormats() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const formats = await Formato.find({});
        console.log('Existing Formats:', formats.map(f => `${f.nombre} (${f.capacidad} ${f.unidad})`));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkFormats();
