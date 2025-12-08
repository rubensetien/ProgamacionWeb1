import express from 'express';
import Solicitud from '../models/Solicitud.js';
import Turno from '../models/Turno.js';
import Usuario from '../models/Usuario.js';
import { auth, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.use(auth);

// POST /api/solicitudes - Crear nueva solicitud (Trabajador)
router.post('/', async (req, res) => {
    try {
        const { tipo, fechaInicio, fechaFin, horas, motivo } = req.body;

        const nuevaSolicitud = new Solicitud({
            usuario: req.usuario._id, // Del token
            tipo,
            fechaInicio,
            fechaFin,
            horas,
            motivo
        });

        await nuevaSolicitud.save();

        res.status(201).json({
            success: true,
            data: nuevaSolicitud,
            message: 'Solicitud enviada correctamente'
        });
    } catch (error) {
        console.error('Error creando solicitud:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar la solicitud',
            error: error.message
        });
    }
});

// GET /api/solicitudes/mis-solicitudes - Ver mis solicitudes (Trabajador)
router.get('/mis-solicitudes', async (req, res) => {
    try {
        const solicitudes = await Solicitud.find({ usuario: req.usuario._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: solicitudes
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/solicitudes/pendientes - Ver todas las pendientes (Admin)
// Agregamos opción para filtrar por estado si se quiere ver historial
router.get('/todas', isAdmin, async (req, res) => {
    try {
        const { estado } = req.query;
        const filtro = estado ? { estado } : {};

        const solicitudes = await Solicitud.find(filtro)
            .populate('usuario', 'nombre email ubicacionAsignada')
            .populate('usuario.ubicacionAsignada.referencia') // Si queremos filtrar por tienda luego
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: solicitudes
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/solicitudes/:id/estado - Aprobar/Rechazar (Admin)
router.put('/:id/estado', isAdmin, async (req, res) => {
    try {
        const { estado, respuestaAdmin } = req.body; // 'aprobada' | 'rechazada'

        if (!['aprobada', 'rechazada'].includes(estado)) {
            return res.status(400).json({ success: false, message: 'Estado inválido' });
        }

        const solicitud = await Solicitud.findById(req.params.id);
        if (!solicitud) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }

        solicitud.estado = estado;
        solicitud.respuestaAdmin = respuestaAdmin;
        solicitud.revisadoPor = req.usuario._id;
        await solicitud.save();

        // Si se aprueba, ACTUALIZAR TURNOS automágicamente
        if (estado === 'aprobada') {
            // Calcular días entre inicio y fin
            const start = new Date(solicitud.fechaInicio);
            const end = new Date(solicitud.fechaFin);

            const usuario = await Usuario.findById(solicitud.usuario).populate('ubicacionAsignada.referencia');
            const ubicacionId = usuario.ubicacionAsignada?.referencia?._id;

            if (ubicacionId) {
                // Iterar días
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    // Upsert turno
                    await Turno.updateOne(
                        {
                            usuario: solicitud.usuario,
                            ubicacion: ubicacionId,
                            fecha: new Date(d)
                        },
                        {
                            $set: {
                                tipo: solicitud.tipo === 'vacaciones' ? 'vacaciones' : 'libre', // Mapear tipo
                                nota: `Solicitud aprobada: ${solicitud.motivo}`
                            }
                        },
                        { upsert: true }
                    );
                }
            }
        }

        res.json({
            success: true,
            data: solicitud,
            message: `Solicitud ${estado} correctamente`
        });

    } catch (error) {
        console.error('Error actualizando solicitud:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
