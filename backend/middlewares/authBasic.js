import Usuario from '../models/Usuario.js';

export const authBasic = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Autenticación requerida' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [email, password] = credentials.split(':');

    const user = await Usuario.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const passwordValido = await user.compararPassword(password);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      rol: user.rol,
    };

    next();
  } catch (err) {
    console.error('Error en autenticación básica:', err);
    res.status(500).json({ error: 'Error en autenticación' });
  }
};