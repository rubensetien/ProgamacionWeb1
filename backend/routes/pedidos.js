import express from 'express';
import Pedido from '../models/Pedido.js';
import { auth } from '../middlewares/auth.js';

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

    console.log('📦 Datos recibidos:', req.body);

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
      if (!puntoVenta) {
        return res.status(400).json({
          success: false,
          message: 'El punto de venta es requerido para recogida'
        });
      }
      if (!fechaRecogida) {
        return res.status(400).json({
          success: false,
          message: 'La fecha de recogida es requerida'
        });
      }
      if (!horaRecogida) {
        return res.status(400).json({
          success: false,
          message: 'La hora de recogida es requerida'
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

    // Preparar datos del pedido
    const datosPedido = {
      usuario: req.usuario.id,
      datosUsuario: {
        nombre: req.usuario.nombre,
        email: req.usuario.email,
        telefono: telefonoContacto
      },
      items,
      tipoEntrega,
      telefonoContacto,
      notasEntrega,
      subtotal,
      total: subtotal,
      estado: 'pendiente',
      origen: 'web'
    };

    // Añadir datos específicos según tipo de entrega
    if (tipoEntrega === 'recogida') {
      // Combinar fecha y hora en un solo objeto Date
      const fechaCompleta = new Date(`${fechaRecogida}T${horaRecogida}:00`);

      datosPedido.puntoVenta = puntoVenta;
      datosPedido.fechaRecogida = fechaCompleta;
      datosPedido.horaRecogida = horaRecogida;

      console.log('✅ Fecha de recogida combinada:', fechaCompleta);
    } else {
      datosPedido.direccionEnvio = direccionEnvio;
      datosPedido.distanciaKm = distanciaKm;
    }

    // Crear pedido
    const nuevoPedido = new Pedido(datosPedido);
    await nuevoPedido.save();

    // Poblar datos
    await nuevoPedido.populate([
      { path: 'items.producto' },
      { path: 'items.variante' },
      { path: 'items.formato' },
      { path: 'puntoVenta' }
    ]);

    console.log('✅ Pedido creado exitosamente:', nuevoPedido.numeroPedido);

    // Emitir evento de socket
    const io = req.app.get('io');
    if (io) {
      io.emit('nuevo-pedido', nuevoPedido);
    }

    res.status(201).json({
      success: true,
      message: 'Pedido creado exitosamente',
      data: nuevoPedido
    });
  } catch (error) {
    console.error('❌ Error creando pedido:', error);
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
    const limitVal = parseInt(req.query.limit) || 50;
    const pageVal = parseInt(req.query.page) || 1;
    const MAX_LIMIT = 100;
    const limit = Math.min(limitVal, MAX_LIMIT);
    const page = Math.max(1, pageVal);
    const skip = (page - 1) * limit;

    const [pedidos, total] = await Promise.all([
      Pedido.getByUsuario(req.usuario.id, { limit, skip }),
      Pedido.countDocuments({ usuario: req.usuario.id })
    ]);

    res.json({
      success: true,
      count: pedidos.length,
      data: pedidos,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    });
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos'
    });
  }
});

// @route   GET /api/pedidos/tienda
// @desc    Obtener pedidos de la tienda asignada
// @access  Private (Tienda/Admin)
router.get('/tienda', auth, async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;

    if (!req.usuario.tiendaAsignada && req.usuario.rol !== 'admin') {
      return res.status(400).json({ success: false, message: 'Usuario sin tienda asignada' });
    }

    const filtro = {};
    if (req.usuario.tiendaAsignada) {
      filtro.puntoVenta = req.usuario.tiendaAsignada;
    }

    const pedidos = await Pedido.find(filtro)
      .sort({ createdAt: -1 }) // Más recientes primero
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('items.producto')
      .populate('items.variante')
      .populate('items.formato')
      .populate('usuario', 'nombre email telefono')
      .populate('puntoVenta');

    const total = await Pedido.countDocuments(filtro);

    res.json({
      success: true,
      data: pedidos,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error pedidos tienda:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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


// @route   PUT /api/pedidos/:id/estado
// @desc    Actualizar estado del pedido (Tienda/Admin)
// @access  Private
router.put('/:id/estado', auth, async (req, res) => {
  try {
    const { estado } = req.body;
    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    // Verificar permisos
    if (!['admin', 'tienda', 'gestor-tienda'].includes(req.usuario.rol)) {
      // Si es la tienda asignada
      if (pedido.puntoVenta && pedido.puntoVenta.toString() !== req.usuario.tiendaAsignada) {
        return res.status(403).json({ success: false, message: 'No tienes permiso para modificar este pedido' });
      }
    }

    const estadosValidos = ['pendiente', 'confirmado', 'preparando', 'listo', 'entregado', 'no-recogido'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ success: false, message: 'Estado inválido' });
    }

    await pedido.cambiarEstado(estado, req.usuario.id, 'Cambio de estado manual por tienda/admin');

    res.json({
      success: true,
      message: `Pedido actualizado a ${estado}`,
      data: pedido
    });

  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar estado' });
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

// @route   GET /api/pedidos/reparto/pendientes
// @desc    Obtener pedidos pendientes de preparación/reparto
// @access  Private (Repartidores/Admin)
router.get('/reparto/pendientes', auth, async (req, res) => {
  try {
    // Verificar permisos
    if (req.usuario.rol !== 'admin' && req.usuario.tipoTrabajador !== 'repartidor') {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }

    const pedidos = await Pedido.find({
      estado: { $in: ['confirmado', 'preparando', 'listo', 'en-camino'] },
      $or: [
        { repartidor: null }, // Sin asignar
        { repartidor: req.usuario.id } // Asignado a mí
      ],
      tipoEntrega: 'domicilio' // Solo delivery (o recogida si preparamos para tienda?)
    })
      .sort({ fechaPedido: 1 }) // Más antiguos primero
      .populate('items.producto')
      .populate('repartidor', 'nombre');

    res.json({ success: true, count: pedidos.length, data: pedidos });
  } catch (error) {
    console.error('Error fetching reparto orders:', error);
    res.status(500).json({ success: false, message: 'Error obteniendo pedidos' });
  }
});

// @route   PUT /api/pedidos/:id/asignar
// @desc    Repartidor se asigna un pedido
// @access  Private (Repartidores)
router.put('/:id/asignar', auth, async (req, res) => {
  try {
    if (req.usuario.tipoTrabajador !== 'repartidor' && req.usuario.rol !== 'admin') {
      return res.status(403).json({ success: false, message: 'Solo repartidores pueden asignarse pedidos' });
    }

    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

    if (pedido.repartidor && pedido.repartidor.toString() !== req.usuario.id) {
      return res.status(400).json({ message: 'Pedido ya asignado a otro repartidor' });
    }

    pedido.repartidor = req.usuario.id;
    pedido.estado = 'preparando'; // Empieza a prepararlo
    await pedido.save();

    res.json({ success: true, message: 'Pedido asignado', data: pedido });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/pedidos/:id/finalizar-preparacion
// @desc    Indicar lotes usados y reservar stock
// @access  Private (Repartidores)
router.put('/:id/finalizar-preparacion', auth, async (req, res) => {
  const session = await import('mongoose').then(m => m.default.startSession());
  session.startTransaction();

  try {
    const { detalleEntregas } = req.body; // Array de { producto, itemsLote: [{fecha, cantidad}] }
    const pedido = await Pedido.findById(req.params.id).session(session);

    if (!pedido) throw new Error('Pedido no encontrado');

    // Validar estado
    if (pedido.estado !== 'preparando') {
      throw new Error('El pedido no está en estado de preparación');
    }

    // 1. Reservar stock en Inventario
    // Necesitamos iterar sobre detalleEntregas
    // detalleEntregas estructura esperada: 
    // [ { producto: 'ID', itemsLote: [ { fechaFabricacion: 'YYYY-MM-DD', cantidad: 5 } ] } ]

    const Inventario = (await import('../models/Inventario.js')).default;

    for (const entrega of detalleEntregas) {
      const inventario = await Inventario.findOne({ producto: entrega.producto }).session(session);
      if (!inventario) throw new Error(`Inventario no encontrado para producto ${entrega.producto}`);

      for (const lote of entrega.itemsLote) {
        // Llamamos al método de instancia, pasando la session si es posible? 
        // Mongoose methods no aceptan session directamente en argumentos customs, hay que bindearlo o pasarlo.
        // Pero nuestro método 'reservarStockLote' hace save().
        // Modificaremos el método o lo haremos manual aquí para soportar transacción.
        // Para simplificar, asumiremos consistencia eventual o reescribiremos lógica de reserva aquí.

        // Opción segura: Logic inline para usar la sesión.
        // Reutilizar lógica de 'reservarStockLote' pero con sesión.

        const fechaLote = new Date(lote.fechaFabricacion);
        fechaLote.setHours(0, 0, 0, 0);

        const infoLote = inventario.lotes.find(l => {
          const d = new Date(l.fechaFabricacion);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === fechaLote.getTime();
        });

        if (!infoLote) throw new Error(`Lote ${lote.fechaFabricacion} no encontrado para producto ${entrega.producto}`);

        // Check disponibilidad
        if ((infoLote.cantidad - (infoLote.reservado || 0)) < lote.cantidad) {
          throw new Error(`Stock insuficiente en lote ${lote.fechaFabricacion}`);
        }

        infoLote.reservado = (infoLote.reservado || 0) + lote.cantidad;

        inventario.movimientos.push({
          tipo: 'reserva',
          cantidad: lote.cantidad,
          stockAntes: inventario.stockActual,
          stockDespues: inventario.stockActual,
          motivo: `Reserva Pedido ${pedido.numeroPedido}`,
          fecha: new Date(),
          usuario: req.usuario.id,
          detalleLotes: [{ fechaFabricacion: fechaLote, cantidad: lote.cantidad }]
        });
      }
      await inventario.save({ session });
    }

    // 2. Actualizar Pedido
    pedido.detalleEntregas = detalleEntregas;
    pedido.estado = 'en-camino'; // O 'listo' si es recogida
    pedido.stockReservado = true;

    await pedido.save({ session });
    await session.commitTransaction();

    res.json({ success: true, message: 'Preparación finalizada y stock reservado', data: pedido });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error finalizar preparacion:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
});

// @route   PUT /api/pedidos/:id/entregar
// @desc    Confirmar entrega y descontar stock
// @access  Private (Repartidores)
router.put('/:id/entregar', auth, async (req, res) => {
  const session = await import('mongoose').then(m => m.default.startSession());
  session.startTransaction();

  try {
    const pedido = await Pedido.findById(req.params.id).session(session);
    if (!pedido) throw new Error('Pedido no encontrado');

    const Inventario = (await import('../models/Inventario.js')).default;

    // Descontar stock REAL de los lotes reservados
    for (const entrega of pedido.detalleEntregas) {
      const inventario = await Inventario.findOne({ producto: entrega.producto }).session(session);
      // Si no existe inventario (raro), saltamos
      if (!inventario) continue;

      for (const lote of entrega.itemsLote) {
        const fechaLote = new Date(lote.fechaFabricacion);
        fechaLote.setHours(0, 0, 0, 0);

        const infoLote = inventario.lotes.find(l => {
          const d = new Date(l.fechaFabricacion);
          d.setHours(0, 0, 0, 0);
          return d.getTime() === fechaLote.getTime();
        });

        if (infoLote) {
          // Reducir reserva
          if (infoLote.reservado >= lote.cantidad) {
            infoLote.reservado -= lote.cantidad;
          } else {
            infoLote.reservado = 0; // Fallback
          }

          // Reducir cantidad real
          infoLote.cantidad -= lote.cantidad;
          if (infoLote.cantidad < 0) infoLote.cantidad = 0; // Fallback safety
        }
      }

      // Movimiento
      // Sumar cantidad total del producto en este pedido para el movimiento
      const cantidadTotal = entrega.itemsLote.reduce((acc, l) => acc + l.cantidad, 0);

      inventario.movimientos.push({
        tipo: 'confirmacion-entrega',
        cantidad: cantidadTotal,
        stockAntes: inventario.stockActual, // Pre-save 
        stockDespues: inventario.stockActual - cantidadTotal, // Approx
        motivo: `Entrega Pedido ${pedido.numeroPedido}`,
        fecha: new Date(),
        usuario: req.usuario.id,
        detalleLotes: entrega.itemsLote
      });

      await inventario.save({ session });
    }

    pedido.estado = 'entregado';
    pedido.fechaEntregaReal = new Date();
    pedido.estadoPago = 'pagado'; // Asumimos pago al entrega si era efectivo, o ya pagado
    await pedido.save({ session });

    await session.commitTransaction();
    res.json({ success: true, message: 'Pedido entregado y stock descontado', data: pedido });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error confirmar entrega:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
});

export default router;
