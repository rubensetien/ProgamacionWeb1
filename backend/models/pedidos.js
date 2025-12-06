import express from 'express';
import Pedido from '../models/Pedido.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/pedidos
// @desc    Crear nuevo pedido
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      items,
      tipoEntrega,
      puntoVenta,
      fechaRecogida,
      horaRecogida,
      direccionEnvio,
      distanciaKm,
      telefonoContacto,
      notasEntrega
    } = req.body;

    // Validaciones básicas
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El pedido debe tener al menos un producto'
      });
    }

    if (!tipoEntrega) {
      return res.status(400).json({
        success: false,
        message: 'El tipo de entrega es requerido'
      });
    }

    if (!telefonoContacto) {
      return res.status(400).json({
        success: false,
        message: 'El teléfono de contacto es requerido'
      });
    }

    // Validar según tipo de entrega
    if (tipoEntrega === 'recogida') {
      if (!puntoVenta || !fechaRecogida || !horaRecogida) {
        return res.status(400).json({
          success: false,
          message: 'Para recogida en tienda se requiere punto de venta, fecha y hora'
        });
      }
    } else if (tipoEntrega === 'domicilio') {
      if (!direccionEnvio || !direccionEnvio.calle || !direccionEnvio.ciudad) {
        return res.status(400).json({
          success: false,
          message: 'Para envío a domicilio se requiere dirección completa'
        });
      }
    }

    // Calcular subtotal y total
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.precioUnitario * item.cantidad);
    }, 0);

    // Crear pedido
    const nuevoPedido = new Pedido({
      usuario: req.usuario.id,
      datosUsuario: {
        nombre: req.usuario.nombre,
        email: req.usuario.email,
        telefono: telefonoContacto
      },
      items,
      tipoEntrega,
      puntoVenta: tipoEntrega === 'recogida' ? puntoVenta : undefined,
      fechaRecogida: tipoEntrega === 'recogida' ? new Date(`${fechaRecogida}T${horaRecogida}`) : undefined,
      horaRecogida: tipoEntrega === 'recogida' ? horaRecogida : undefined,
      direccionEnvio: tipoEntrega === 'domicilio' ? direccionEnvio : undefined,
      distanciaKm: tipoEntrega === 'domicilio' ? distanciaKm : undefined,
      telefonoContacto,
      notasEntrega,
      subtotal,
      total: subtotal,
      estado: 'pendiente',
      origen: 'web'
    });

    await nuevoPedido.save();

    // Poblar datos
    await nuevoPedido.populate([
      { path: 'items.producto' },
      { path: 'items.variante' },
      { path: 'items.formato' },
      { path: 'puntoVenta' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: nuevoPedido
    });
  } catch (error) {
    console.error('Error creando pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el pedido',
      error: error.message
    });
  }
});

// @route   GET /api/pedidos/mis-pedidos
// @desc    Obtener pedidos del usuario autenticado
// @access  Private
router.get('/mis-pedidos', auth, async (req, res) => {
  try {
    const pedidos = await Pedido.getByUsuario(req.usuario.id);

    res.json({
      success: true,
      count: pedidos.length,
      data: pedidos
    });
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos'
    });
  }
});

// @route   GET /api/pedidos/:id
// @desc    Obtener pedido por ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate('items.producto')
      .populate('items.variante')
      .populate('items.formato')
      .populate('puntoVenta');

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    // Verificar que el pedido pertenezca al usuario
    if (pedido.usuario.toString() !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este pedido'
      });
    }

    res.json({
      success: true,
      data: pedido
    });
  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedido'
    });
  }
});

// @route   PUT /api/pedidos/:id/cancelar
// @desc    Cancelar pedido
// @access  Private
router.put('/:id/cancelar', auth, async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    if (pedido.usuario.toString() !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para cancelar este pedido'
      });
    }

    if (!pedido.puedeSerCancelado) {
      return res.status(400).json({
        success: false,
        message: 'Este pedido no puede ser cancelado'
      });
    }

    await pedido.cancelar('Cancelado por el usuario', req.usuario.id);

    res.json({
      success: true,
      message: 'Pedido cancelado exitosamente',
      data: pedido
    });
  } catch (error) {
    console.error('Error cancelando pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar pedido'
    });
  }
});

export default router;
