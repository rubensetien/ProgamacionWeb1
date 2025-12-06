import express from 'express';
import Ubicacion from '../models/Ubicacion.js';

const router = express.Router();

// @route   GET /api/ubicaciones/puntos-venta
// @desc    Obtener puntos de venta activos (para recogida de pedidos)
// @access  Public
router.get('/puntos-venta', async (req, res) => {
  try {
    const puntosVenta = await Ubicacion.find({
      tipo: { $in: ['punto-venta', 'cafeteria'] },
      activo: true,
      aceptaPedidos: true
    })
    .select('nombre codigo direccion coordenadas contacto horarios capacidadDiaria')
    .sort({ nombre: 1 });
    
    res.json({
      success: true,
      count: puntosVenta.length,
      data: puntosVenta
    });
  } catch (error) {
    console.error('Error obteniendo puntos de venta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener puntos de venta'
    });
  }
});

// @route   GET /api/ubicaciones/obrador
// @desc    Obtener el obrador principal (para calcular radio de entrega)
// @access  Public
router.get('/obrador', async (req, res) => {
  try {
    const obrador = await Ubicacion.findOne({
      tipo: 'obrador',
      activo: true
    }).select('nombre codigo direccion coordenadas contacto');
    
    if (!obrador) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró el obrador principal'
      });
    }
    
    res.json({
      success: true,
      data: obrador
    });
  } catch (error) {
    console.error('Error obteniendo obrador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener obrador'
    });
  }
});

// @route   POST /api/ubicaciones/validar-entrega
// @desc    Validar si una dirección está dentro del radio de entrega (50km)
// @access  Public
router.post('/validar-entrega', async (req, res) => {
  try {
    const { latitud, longitud } = req.body;
    
    if (!latitud || !longitud) {
      return res.status(400).json({
        success: false,
        message: 'Latitud y longitud son requeridas'
      });
    }
    
    // Obtener obrador principal
    const obrador = await Ubicacion.findOne({
      tipo: 'obrador',
      activo: true
    });
    
    if (!obrador) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró el obrador principal'
      });
    }
    
    // Calcular distancia
    const distancia = obrador.calcularDistancia(latitud, longitud);
    
    if (distancia === null) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo calcular la distancia. Verifique las coordenadas del obrador.'
      });
    }
    
    const RADIO_MAXIMO = 50; // km
    const dentroDeRadio = distancia <= RADIO_MAXIMO;
    
    res.json({
      success: true,
      data: {
        distanciaKm: Math.round(distancia * 10) / 10,
        dentroDeRadio,
        radioMaximo: RADIO_MAXIMO,
        obrador: {
          nombre: obrador.nombre,
          direccion: obrador.direccion
        }
      }
    });
  } catch (error) {
    console.error('Error validando entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar entrega'
    });
  }
});

// @route   GET /api/ubicaciones
// @desc    Obtener todas las ubicaciones (admin)
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const { tipo, activo } = req.query;
    
    const filtros = {};
    if (tipo) filtros.tipo = tipo;
    if (activo !== undefined) filtros.activo = activo === 'true';
    
    const ubicaciones = await Ubicacion.find(filtros)
      .populate('responsable', 'nombre email')
      .populate('obradorAsignado', 'nombre codigo')
      .sort({ tipo: 1, nombre: 1 });
    
    res.json({
      success: true,
      count: ubicaciones.length,
      data: ubicaciones
    });
  } catch (error) {
    console.error('Error obteniendo ubicaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ubicaciones'
    });
  }
});

// @route   GET /api/ubicaciones/:id
// @desc    Obtener una ubicación por ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const ubicacion = await Ubicacion.findById(req.params.id)
      .populate('responsable', 'nombre email telefono')
      .populate('obradorAsignado', 'nombre codigo direccion');
    
    if (!ubicacion) {
      return res.status(404).json({
        success: false,
        message: 'Ubicación no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: ubicacion
    });
  } catch (error) {
    console.error('Error obteniendo ubicación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ubicación'
    });
  }
});

export default router;
