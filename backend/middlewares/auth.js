import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import redisClient from '../config/redis.js';

// Middleware de autenticación
export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No hay token, autorización denegada'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const redisKey = `usuario:${decoded.id}`;

    // 1. Intentar obtener de Redis
    try {
      if (redisClient.isReady) {
        const cachedUser = await redisClient.get(redisKey);
        if (cachedUser) {
          const userObj = JSON.parse(cachedUser);
          req.usuario = userObj;
          req.user = userObj;
          return next();
        }
      }
    } catch (redisError) {
      console.error('⚠️ Redis error in auth middleware:', redisError);
      // Fallback seguro a BD sin interrumpir
    }

    // 2. Si no está en caché, obtener de BD
    const usuario = await Usuario.findById(decoded.id)
      .select('-password')
      .populate('ubicacionAsignada.referencia');

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o token no inválido'
      });
    }

    req.usuario = usuario;
    req.user = usuario;

    // 3. Guardar en Redis (1 hora)
    try {
      if (redisClient.isReady) {
        // Convertir a objeto plano para guardar
        const userToCache = usuario.toObject();
        // Asegurar que _id sea string para consistencia
        userToCache._id = userToCache._id.toString();

        await redisClient.set(redisKey, JSON.stringify(userToCache), {
          EX: 3600 // 1 hora
        });
      }
    } catch (redisError) {
      console.error('⚠️ Error saving to Redis:', redisError);
    }

    next();
  } catch (error) {
    console.error('Error en middleware auth:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware para verificar rol de administrador
export const isAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin' && req.usuario.rol !== 'gestor') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador.'
    });
  }
  next();
};

// Middleware para verificar rol de gestor
export const isGestor = (req, res, next) => {
  if (req.usuario.rol !== 'admin' && req.usuario.rol !== 'gestor') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de gestor.'
    });
  }
  next();
};
