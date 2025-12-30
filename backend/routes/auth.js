import express from 'express';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Generar JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

import { loginLimiter } from '../middlewares/rateLimit.js';

// ========== POST /api/auth/register - Registro de usuarios ==========
router.post('/register', loginLimiter, async (req, res) => {
  try {
    const { nombre, email, password, telefono } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y contraseña son requeridos'
      });
    }

    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    const usuario = await Usuario.create({
      nombre,
      email,
      password,
      telefono,
      rol: 'cliente',
      activo: true
    });

    const token = generarToken(usuario._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        _id: usuario._id,  // ✅ Agregado
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        avatar: usuario.avatar,
        token
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
});

// ========== POST /api/auth/login - Inicio de sesión ==========
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario (SIN populate que causa error)
    const usuario = await Usuario.findOne({ email }).select('+password');
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si está activo
    if (!usuario.activo) {
      return res.status(403).json({
        success: false,
        message: 'Usuario inactivo. Contacta al administrador.'
      });
    }

    // Verificar si está bloqueado
    if (usuario.bloqueado) {
      return res.status(403).json({
        success: false,
        message: 'Usuario bloqueado. Contacta al administrador.'
      });
    }

    // Actualizar última conexión
    usuario.ultimaConexion = new Date();
    await usuario.save();

    // Generar token
    const token = generarToken(usuario._id);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        _id: usuario._id,  // ✅ Agregado
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        avatar: usuario.avatar,
        telefono: usuario.telefono,
        permisos: usuario.permisos,
        activo: usuario.activo,
        tipoTrabajador: usuario.tipoTrabajador,
        ubicacionAsignada: usuario.ubicacionAsignada,
        token
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
});

// ========== GET /api/auth/me - Obtener usuario actual ==========
router.get('/me', auth, async (req, res) => {
  try {
    const usuario = req.usuario;

    res.json({
      success: true,
      data: {
        _id: usuario._id,  // ✅ Agregado - CRÍTICO PARA CHAT
        id: usuario._id,   // Mantener por compatibilidad
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        avatar: usuario.avatar,
        telefono: usuario.telefono,
        permisos: usuario.permisos,
        activo: usuario.activo,
        tipoTrabajador: usuario.tipoTrabajador,
        ubicacionAsignada: usuario.ubicacionAsignada
      }
    });
  } catch (error) {
    console.error('Error en /me:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
});

// ========== POST /api/auth/logout - Cerrar sesión ==========
router.post('/logout', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar sesión',
      error: error.message
    });
  }
});

// ========== POST /api/auth/refresh - Refrescar token ==========
router.post('/refresh', auth, async (req, res) => {
  try {
    const nuevoToken = generarToken(req.usuario._id);

    res.json({
      success: true,
      message: 'Token refrescado',
      data: {
        token: nuevoToken
      }
    });
  } catch (error) {
    console.error('Error en refresh:', error);
    res.status(500).json({
      success: false,
      message: 'Error al refrescar token',
      error: error.message
    });
  }
});

// ========== PUT /api/auth/profile - Actualizar perfil propio ==========
router.put('/profile', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id).select('+password');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const { nombre, email, password, telefono, avatar, newPassword } = req.body;

    // Actualizar campos básicos
    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;
    if (telefono) usuario.telefono = telefono;
    if (avatar) usuario.avatar = avatar;

    // Actualizar contraseña si se proporciona
    if (newPassword && password) {
      // Verificar contraseña actual
      const isMatch = await usuario.compararPassword(password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña actual no es correcta'
        });
      }
      usuario.password = newPassword;
    }

    await usuario.save();

    // Generar nuevo token (opcional, pero buena práctica si cambian datos críticos)
    const token = generarToken(usuario._id);

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        avatar: usuario.avatar,
        telefono: usuario.telefono,
        token
      }
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message
    });
  }
});

export default router;
