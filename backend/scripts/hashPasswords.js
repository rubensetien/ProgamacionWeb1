import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const hashPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    const collection = db.collection('usuarios');
    
    const usuarios = await collection.find({}).toArray();
    
    for (let user of usuarios) {
      if (typeof user.password === 'string' && !user.password.startsWith('$2')) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await collection.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        console.log(`✅ ${user.email} hasheado`);
      }
    }
    
    console.log('✅ Todas las contraseñas hasheadas');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

hashPasswords();