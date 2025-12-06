import express from 'express';
import Formato from '../models/Formato.js';
import { auth, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/formatos - Obtener todos los formatos
router.get('/', async (req, res) => {
  try {
    const { activo } = req.query;
    
    const filtro = {};
    if (activo !== undefined) filtro.activo = activo === 'true';
    
    const formatos = await Formato.find(filtro).sort({ orden: 1 });
    
    res.json({
      success: true,
      count: formatos.length,
      data: formatos
    });
  } catch (error) {
    console.error('Error obteniendo formatos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener formatos',
      error: error.message
    });
  }
});

// GET /api/formatos/:id - Obtener formato por ID
router.get('/:id', async (req, res) => {
  try {
    const formato = await Formato.findById(req.params.id);

    if (!formato) {
      return res.status(404).json({
        success: false,
        message: 'Formato no encontrado'
      });
    }

    res.json({
      success: true,
      data: formato
    });
  } catch (error) {
    console.error('Error obteniendo formato:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener formato',
      error: error.message
    });
  }
});

// POST /api/formatos - Crear nuevo formato
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const {
      nombre,
      tipo,
      capacidad,
      unidad,
      precioBase,
      tipoEnvase,
      descripcion,
      orden,
      activo,
      esUnitario,
      reciclable,
      disponibleOnline,
      disponibleTienda
    } = req.body;

    if (!nombre || !tipo || !unidad || precioBase === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: nombre, tipo, unidad, precioBase'
      });
    }

    const formato = await Formato.create({
      nombre,
      tipo,
      capacidad: capacidad || 1,
      unidad,
      precioBase,
      tipoEnvase: tipoEnvase || null,
      descripcion: descripcion || null,
      orden: orden || 1,
      activo: activo !== undefined ? activo : true,
      esUnitario: esUnitario || false,
      reciclable: reciclable || false,
      disponibleOnline: disponibleOnline !== undefined ? disponibleOnline : true,
      disponibleTienda: disponibleTienda !== undefined ? disponibleTienda : true
    });

    res.status(201).json({
      success: true,
      message: 'Formato creado correctamente',
      data: formato
    });
  } catch (error) {
    console.error('Error creando formato:', error);
    res.status(400).json({
      success: false,
      message: 'Error al crear formato',
      error: error.message
    });
  }
});

// PUT /api/formatos/:id - Actualizar formato
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const formato = await Formato.findById(req.params.id);

    if (!formato) {
      return res.status(404).json({
        success: false,
        message: 'Formato no encontrado'
      });
    }

    const camposActualizables = [
      'nombre', 'tipo', 'capacidad', 'unidad', 'precioBase',
      'tipoEnvase', 'descripcion', 'orden', 'activo', 'esUnitario',
      'reciclable', 'disponibleOnline', 'disponibleTienda'
    ];

    camposActualizables.forEach(campo => {
      if (req.body[campo] !== undefined) {
        formato[campo] = req.body[campo];
      }
    });

    await formato.save();

    res.json({
      success: true,
      message: 'Formato actualizado correctamente',
      data: formato
    });
  } catch (error) {
    console.error('Error actualizando formato:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar formato',
      error: error.message
    });
  }
});

// DELETE /api/formatos/:id - Eliminar formato
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const formato = await Formato.findById(req.params.id);

    if (!formato) {
      return res.status(404).json({
        success: false,
        message: 'Formato no encontrado'
      });
    }

    await formato.deleteOne();

    res.json({
      success: true,
      message: 'Formato eliminado correctamente'
    });
  } catch (error) {
    console.error('Error eliminando formato:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar formato',
      error: error.message
    });
  }
});

export default router;
