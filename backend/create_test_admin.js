import mongoose from 'mongoose';
import Usuario from './models/Usuario.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to DB');

        const email = 'testadmin@regma.es';
        const password = 'testadmin123';

        // Delete if exists
        await Usuario.deleteOne({ email });

        const admin = new Usuario({
            nombre: 'Test Admin',
            email,
            password,
            rol: 'admin',
            activo: true
        });

        await admin.save();
        console.log(`✅ Test Admin created: ${email} / ${password}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createTestAdmin();
