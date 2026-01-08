
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Producto from './models/Producto.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected');
        const prod = await Producto.findOne({}).lean();
        console.log('Sample Product:', JSON.stringify(prod, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
