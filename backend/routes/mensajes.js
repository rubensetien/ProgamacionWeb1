import express from 'express';
import Mensaje from '../models/Mensaje.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @route   GET /api/mensajes/historial/:trabajadorId
 * @desc    Obtener historial de conversación con un trabajador
 * @access  Private
 */
router.get('/historial/:trabajadorId', auth, async (req, res) => {
  try {
    const { trabajadorId } = req.params;
    const usuarioActual = req.usuario._id;

    // Buscar todos los mensajes entre los dos usuarios
    const mensajes = await Mensaje.find({
      $or: [
        { de: usuarioActual, para: trabajadorId },
        { de: trabajadorId, para: usuarioActual }
      ]
    })
    .sort({ timestamp: 1 })
    .limit(100)
    .lean();

    // Marcar como leídos los mensajes recibidos
    await Mensaje.updateMany(
      { de: trabajadorId, para: usuarioActual, leido: false },
      { leido: true }
    );

    res.json({
      success: true,
      data: mensajes
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el historial de mensajes'
    });
  }
});

/**
 * @route   GET /api/mensajes/no-leidos
 * @desc    Obtener contador de mensajes no leídos por conversación
 * @access  Private
 */
router.get('/no-leidos', auth, async (req, res) => {
  try {
    const usuarioActual = req.usuario._id;

    const noLeidos = await Mensaje.aggregate([
      {
        $match: {
          para: usuarioActual,
          leido: false
        }
      },
      {
        $group: {
          _id: '$de',
          cantidad: { $sum: 1 }
        }
      }
    ]);

    // Convertir a objeto { userId: cantidad }
    const contador = {};
    noLeidos.forEach(item => {
      contador[item._id.toString()] = item.cantidad;
    });

    res.json({
      success: true,
      data: contador
    });
  } catch (error) {
    console.error('Error obteniendo mensajes no leídos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes no leídos'
    });
  }
});

/**
 * @route   GET /api/mensajes/conversaciones
 * @desc    Obtener lista de conversaciones recientes
 * @access  Private
 */
router.get('/conversaciones', auth, async (req, res) => {
  try {
    const usuarioActual = req.usuario._id;

    const conversaciones = await Mensaje.aggregate([
      {
        $match: {
          $or: [
            { de: usuarioActual },
            { para: usuarioActual }
          ]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$de', usuarioActual] },
              '$para',
              '$de'
            ]
          },
          ultimoMensaje: { $first: '$$ROOT' },
          noLeidos: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$para', usuarioActual] },
                    { $eq: ['$leido', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'usuario'
        }
      },
      {
        $unwind: '$usuario'
      },
      {
        $project: {
          usuario: {
            _id: 1,
            nombre: 1,
            email: 1,
            rol: 1
          },
          ultimoMensaje: 1,
          noLeidos: 1
        }
      },
      {
        $sort: { 'ultimoMensaje.timestamp': -1 }
      }
    ]);

    res.json({
      success: true,
      data: conversaciones
    });
  } catch (error) {
    console.error('Error obteniendo conversaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las conversaciones'
    });
  }
});

export default router;
