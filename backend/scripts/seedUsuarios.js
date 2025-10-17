import fs from 'fs';
import Usuario from '../models/Usuario.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const seedUsuarios = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const usuariosJSON = JSON.parse(fs.readFileSync('./data/usuarios.json', 'utf-8'));
    
    await Usuario.deleteMany({});
    
    // Guardar uno por uno para que se ejecute el pre('save')
    for (let usuario of usuariosJSON) {
      const nuevoUsuario = new Usuario(usuario);
      await nuevoUsuario.save();
    }
    
    console.log('✅ Usuarios cargados correctamente con contraseñas hasheadas');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

seedUsuarios();