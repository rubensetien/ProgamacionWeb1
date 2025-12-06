import express from 'express';
import PuntoVenta from '../models/PuntoVenta.js';

const router = express.Router();

// GET /api/puntos-venta - Obtener todos los puntos de venta
router.get('/', async (req, res) => {
  try {
    const { tipo, activo } = req.query;
    
    const filtro = {};
    if (tipo) filtro.tipo = tipo;
    if (activo !== undefined) filtro.activo = activo === 'true';
    
    const puntosVenta = await PuntoVenta.find(filtro)
      .populate('categoriasDisponibles', 'nombre slug icono')
      .sort({ destacado: -1, nombre: 1 });
    
    res.json({
      success: true,
      data: puntosVenta,
      total: puntosVenta.length
    });
  } catch (error) {
    console.error('Error obteniendo puntos de venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener puntos de venta',
      error: error.message
    });
  }
});

// GET /api/puntos-venta/tipo/:tipo - Obtener puntos de venta por tipo
router.get('/tipo/:tipo', async (req, res) => {
  try {
    const puntosVenta = await PuntoVenta.find({ 
      tipo: req.params.tipo,
      activo: true 
    })
      .populate('categoriasDisponibles', 'nombre slug')
      .sort({ nombre: 1 });
    
    res.json({
      success: true,
      data: puntosVenta,
      total: puntosVenta.length
    });
  } catch (error) {
    console.error('Error obteniendo puntos de venta por tipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener puntos de venta',
      error: error.message
    });
  }
});

// GET /api/puntos-venta/:id - Obtener un punto de venta por ID
router.get('/:id', async (req, res) => {
  try {
    const puntoVenta = await PuntoVenta.findById(req.params.id)
      .populate('categoriasDisponibles', 'nombre slug icono color');
    
    if (!puntoVenta) {
      return res.status(404).json({
        success: false,
        message: 'Punto de venta no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: puntoVenta
    });
  } catch (error) {
    console.error('Error obteniendo punto de venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener punto de venta',
      error: error.message
    });
  }
});

// GET /api/puntos-venta/slug/:slug - Obtener un punto de venta por slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const puntoVenta = await PuntoVenta.findOne({ slug: req.params.slug })
      .populate('categoriasDisponibles', 'nombre slug icono');
    
    if (!puntoVenta) {
      return res.status(404).json({
        success: false,
        message: 'Punto de venta no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: puntoVenta
    });
  } catch (error) {
    console.error('Error obteniendo punto de venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener punto de venta',
      error: error.message
    });
  }
});

// POST /api/puntos-venta - Crear un punto de venta
router.post('/', async (req, res) => {
  try {
    const puntoVenta = new PuntoVenta(req.body);
    await puntoVenta.save();
    
    await puntoVenta.populate('categoriasDisponibles', 'nombre slug');
    
    res.status(201).json({
      success: true,
      data: puntoVenta,
      message: 'Punto de venta creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando punto de venta:', error);
    res.status(400).json({
      success: false,
      message: 'Error al crear punto de venta',
      error: error.message
    });
  }
});

// PUT /api/puntos-venta/:id - Actualizar un punto de venta
router.put('/:id', async (req, res) => {
  try {
    const puntoVenta = await PuntoVenta.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('categoriasDisponibles', 'nombre slug');
    
    if (!puntoVenta) {
      return res.status(404).json({
        success: false,
        message: 'Punto de venta no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: puntoVenta,
      message: 'Punto de venta actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando punto de venta:', error);
    res.status(400).json({
      success: false,
      message: 'Error al actualizar punto de venta',
      error: error.message
    });
  }
});

// DELETE /api/puntos-venta/:id - Eliminar un punto de venta
router.delete('/:id', async (req, res) => {
  try {
    const puntoVenta = await PuntoVenta.findByIdAndDelete(req.params.id);
    
    if (!puntoVenta) {
      return res.status(404).json({
        success: false,
        message: 'Punto de venta no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Punto de venta eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando punto de venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar punto de venta',
      error: error.message
    });
  }
});

export default router;
