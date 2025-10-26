import express from 'express';
import Chat from '../models/Chat.js';
import  authBasic  from '../middlewares/authBasic.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = express.Router();

// Obtener todos los chats (solo admin)
router.get('/', authBasic, authorizeRole(['admin']), async (req, res, next) => {
  try {
    const chats = await Chat.find({ activo: true })
      .sort({ ultimaActividad: -1 })
      .select('userId userEmail mensajes ultimaActividad');
    
    res.json(chats);
  } catch (error) {
    next(error);
  }
});

// Obtener historial de un chat específico
router.get('/:userId', authBasic, async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Si no es admin, solo puede ver su propio chat
    if (req.user.rol !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para ver este chat' });
    }
    
    const chat = await Chat.findOne({ userId });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat no encontrado' });
    }
    
    res.json(chat);
  } catch (error) {
    next(error);
  }
});

// Eliminar un chat (solo admin)
router.delete('/:userId', authBasic, authorizeRole(['admin']), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const chat = await Chat.findOneAndDelete({ userId });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat no encontrado' });
    }
    
    res.json({ mensaje: 'Chat eliminado correctamente' });
  } catch (error) {
    next(error);
  }
});

export default router;