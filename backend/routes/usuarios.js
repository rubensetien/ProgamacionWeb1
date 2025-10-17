import express from 'express';
import { authBasic } from '../middlewares/authBasic.js';
import Usuario from '../models/Usuario.js';

const router = express.Router();

// GET /usuarios/perfil - Obtener datos del usuario autenticado
router.get('/perfil', authBasic, async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.user.id).select('-password');
    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (err) {
    next(err);
  }
});

export default router;