import jwt from 'jsonwebtoken';

const authBasic = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token de autenticación no proporcionado' });
    }

    // Verificar formato: "Bearer TOKEN"
    const partes = authHeader.split(' ');
    if (partes.length !== 2 || partes[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Formato de token inválido. Use: Bearer <token>' });
    }

    const token = partes[1];

    // Verificar y decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adjuntar información del usuario a la request
    req.user = {
      id: decoded.id,
      rol: decoded.rol,
      email: decoded.email
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado', 
        codigo: 'TOKEN_EXPIRED' 
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    console.error('Error al verificar token:', error);
    return res.status(500).json({ error: 'Error al verificar token' });
  }
};

export default authBasic;