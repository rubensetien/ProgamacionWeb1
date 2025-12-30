import express from 'express';
import SolicitudStock from '../models/SolicitudStock.js';
import Producto from '../models/Producto.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

router.use(auth);

// @route   POST /api/solicitudes-stock
// @desc    Crear una nueva solicitud de stock (Tienda)
router.post('/', async (req, res) => {
    try {
        const { items, notas } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'La solicitud debe tener al menos un producto' });
        }

        if (!req.usuario.tiendaAsignada) {
            return res.status(400).json({ success: false, message: 'Usuario no tiene tienda asignada' });
        }

        // Enriquecer items con nombre
        const itemsProcesados = await Promise.all(items.map(async (item) => {
            const producto = await Producto.findById(item.producto).select('nombre');
            return {
                producto: item.producto,
                nombreProducto: producto ? producto.nombre : 'Producto desconocido',
                cantidad: item.cantidad,
                unidad: item.unidad || 'unidades'
            };
        }));

        const solicitud = await SolicitudStock.create({
            tienda: req.usuario.tiendaAsignada,
            usuario: req.usuario._id,
            items: itemsProcesados,
            notas,
            estado: 'pendiente'
        });



        // Emitir evento socket
        const io = req.app.get('io');
        if (io) {
            io.emit('nueva-solicitud-stock', solicitud);
        }

        res.status(201).json({
            success: true,
            message: 'Solicitud de stock creada correctamente',
            data: solicitud
        });
    } catch (error) {
        console.error('Error creando solicitud stock:', error);
        res.status(500).json({ success: false, message: 'Error al crear solicitud' });
    }
});

// @route   GET /api/solicitudes-stock/todas
// @desc    Obtener TODAS las solicitudes (Admin)
router.get('/todas', async (req, res) => {
    try {
        if (req.usuario.rol !== 'admin') {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }

        const solicitudes = await SolicitudStock.find()
            .sort({ createdAt: -1 })
            .populate('tienda', 'nombre direccion')
            .populate('usuario', 'nombre')
            .populate('items.producto', 'nombre');

        res.json({
            success: true,
            data: solicitudes
        });
    } catch (error) {
        console.error('Error obteniendo todas las solicitudes:', error);
        res.status(500).json({ success: false, message: 'Error al obtener solicitudes' });
    }
});

// @route   GET /api/solicitudes-stock/tienda
// @desc    Obtener solicitudes de mi tienda
router.get('/tienda', async (req, res) => {
    try {
        if (!req.usuario.tiendaAsignada) {
            return res.status(400).json({ success: false, message: 'Usuario no tiene tienda asignada' });
        }

        const solicitudes = await SolicitudStock.find({ tienda: req.usuario.tiendaAsignada })
            .sort({ createdAt: -1 })
            .populate('usuario', 'nombre');

        res.json({
            success: true,
            data: solicitudes
        });
    } catch (error) {
        console.error('Error obteniendo solicitudes:', error);
        res.status(500).json({ success: false, message: 'Error al obtener solicitudes' });
    }
});

// @route   GET /api/solicitudes-stock/pendientes
// @desc    Obtener todas las solicitudes pendientes (Repartidor/Admin)
router.get('/pendientes', async (req, res) => {
    try {
        if (req.usuario.rol !== 'admin' && req.usuario.tipoTrabajador !== 'repartidor' && req.usuario.tipoTrabajador !== 'obrador') {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }

        const solicitudes = await SolicitudStock.find({ estado: { $ne: 'entregado' } }) // Show all active logic
            .sort({ createdAt: 1 })
            .populate('tienda', 'nombre direccion')
            .populate('usuario', 'nombre')
            .populate('items.producto', 'nombre');

        res.json({
            success: true,
            data: solicitudes
        });
    } catch (error) {
        console.error('Error obteniendo solicitudes pendientes:', error);
        res.status(500).json({ success: false, message: 'Error al obtener solicitudes' });
    }
});

// @route   PUT /api/solicitudes-stock/:id/estado
// @desc    Actualizar estado de solicitud (Repartidor/Obrador/Admin)
router.put('/:id/estado', async (req, res) => {
    try {
        const { estado } = req.body;

        // Validación básica de permisos
        if (req.usuario.rol !== 'admin' &&
            req.usuario.tipoTrabajador !== 'repartidor' &&
            req.usuario.tipoTrabajador !== 'obrador') {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }

        const solicitud = await SolicitudStock.findByIdAndUpdate(
            req.params.id,
            { estado },
            { new: true }
        );

        if (!solicitud) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }

        res.json({
            success: true,
            data: solicitud,
            message: `Estado actualizado a ${estado}`
        });

    } catch (error) {
        console.error('Error actualizando solicitud:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar solicitud' });
    }
});

// @route   PUT /api/solicitudes-stock/:id/finalizar-preparacion
// @desc    Indicar lotes usados y reservar stock para solicitud (Obrador)
router.put('/:id/finalizar-preparacion', async (req, res) => {
    const session = await import('mongoose').then(m => m.default.startSession());
    session.startTransaction();

    try {
        const { detalleEntregas } = req.body;

        // Validación de permisos
        if (req.usuario.tipoTrabajador !== 'obrador' && req.usuario.tipoTrabajador !== 'repartidor' && req.usuario.rol !== 'admin') {
            throw new Error('Acceso denegado');
        }

        const solicitud = await SolicitudStock.findById(req.params.id).session(session);

        if (!solicitud) throw new Error('Solicitud no encontrada');
        if (solicitud.estado !== 'en-preparacion' && solicitud.estado !== 'aceptado' && solicitud.estado !== 'en-proceso') { // Permitir desde aceptado o en-prep
            throw new Error('La solicitud no está en estado de preparación');
        }

        const Inventario = (await import('../models/Inventario.js')).default;

        // 1. Reservar stock
        for (const entrega of detalleEntregas) {
            const inventario = await Inventario.findOne({ producto: entrega.producto }).session(session);
            if (!inventario) throw new Error(`Inventario no encontrado para producto ${entrega.producto}`);

            for (const lote of entrega.itemsLote) {
                const fechaLote = new Date(lote.fechaFabricacion);
                fechaLote.setHours(0, 0, 0, 0);

                const infoLote = inventario.lotes.find(l => {
                    const d = new Date(l.fechaFabricacion);
                    d.setHours(0, 0, 0, 0);
                    return d.getTime() === fechaLote.getTime();
                });

                if (!infoLote) throw new Error(`Lote no encontrado para producto ${entrega.producto}`);

                // Check availability
                if ((infoLote.cantidad - (infoLote.reservado || 0)) < lote.cantidad) {
                    throw new Error(`Stock insuficiente en lote ${lote.fechaFabricacion}`);
                }

                infoLote.reservado = (infoLote.reservado || 0) + lote.cantidad;

                inventario.movimientos.push({
                    tipo: 'reserva',
                    cantidad: lote.cantidad,
                    stockAntes: inventario.stockActual, // Aproximado
                    stockDespues: inventario.stockActual,
                    motivo: `Reserva Solicitud Stock ${solicitud._id}`, // TODO: ID corto visual?
                    fecha: new Date(),
                    usuario: req.usuario._id,
                    detalleLotes: [{ fechaFabricacion: fechaLote, cantidad: lote.cantidad }]
                });
            }
            await inventario.save({ session });
        }

        // 2. Actualizar Solicitud
        solicitud.detalleEntregas = detalleEntregas;
        solicitud.estado = 'preparado';
        await solicitud.save({ session });

        await session.commitTransaction();
        res.json({ success: true, message: 'Preparación finalizada y stock reservado', data: solicitud });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error finalizar preparacion solicitud:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
});

// @route   PUT /api/solicitudes-stock/:id/entregar
// @desc    Confirmar entrega y descontar stock (Repartidor)
router.put('/:id/entregar', async (req, res) => {
    const session = await import('mongoose').then(m => m.default.startSession());
    session.startTransaction();

    try {
        const solicitud = await SolicitudStock.findById(req.params.id).session(session);
        if (!solicitud) throw new Error('Solicitud no encontrada');

        // Validar estado (debe estar en reparto o preparado)
        if (!['en-reparto', 'preparado'].includes(solicitud.estado)) {
            throw new Error('Estado inválido para entrega');
        }

        const Inventario = (await import('../models/Inventario.js')).default;

        // Descontar stock REAL
        for (const entrega of solicitud.detalleEntregas) {
            const inventario = await Inventario.findOne({ producto: entrega.producto }).session(session);
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
                        infoLote.reservado = 0;
                    }
                    // Reducir real
                    infoLote.cantidad -= lote.cantidad;
                    if (infoLote.cantidad < 0) infoLote.cantidad = 0;
                }
            }

            const cantidadTotal = entrega.itemsLote.reduce((acc, l) => acc + l.cantidad, 0);
            inventario.movimientos.push({
                tipo: 'salida-tienda', // Salida hacia tienda
                cantidad: cantidadTotal,
                stockAntes: inventario.stockActual,
                stockDespues: inventario.stockActual - cantidadTotal,
                motivo: `Envío a Tienda (Solicitud ${solicitud._id})`,
                fecha: new Date(),
                usuario: req.usuario._id,
                detalleLotes: entrega.itemsLote
            });

            await inventario.save({ session });
        }

        solicitud.estado = 'entregado';
        solicitud.fechaRecepcion = new Date();
        await solicitud.save({ session });

        await session.commitTransaction();
        res.json({ success: true, message: 'Solicitud entregada y stock descontado', data: solicitud });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error entregar solicitud:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
});

export default router;
