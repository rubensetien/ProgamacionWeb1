import express from 'express';
import Turno from '../models/Turno.js';
import Usuario from '../models/Usuario.js'; // Para validar
import { auth, isAdmin } from '../middlewares/auth.js';
import { onlyAdmin } from '../middlewares/checkPermissions.js';

const router = express.Router();

router.use(auth);

// GET /api/turnos/mis-turnos - Obtener mis próximos turnos
router.get('/mis-turnos', async (req, res) => {
    try {
        const usuarioId = req.usuario._id;

        // Obtener turnos desde hoy en adelante
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const turnos = await Turno.find({
            usuario: usuarioId,
            fecha: { $gte: hoy }
        })
            .populate('ubicacion', 'nombre tipo')
            .sort({ fecha: 1 })
            .limit(10)
            .lean();

        res.json({
            success: true,
            data: turnos
        });
    } catch (error) {
        console.error('Error obteniendo mis turnos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener mis turnos',
            error: error.message
        });
    }
});

// GET /api/turnos - Obtener turnos por rango de fecha y ubicación
router.get('/', async (req, res) => {
    try {
        const { ubicacion, inicio, fin } = req.query;

        if (!ubicacion || !inicio || !fin) {
            return res.status(400).json({
                success: false,
                message: 'Ubicación, fecha inicio y fecha fin son requeridos'
            });
        }

        const turnos = await Turno.find({
            ubicacion,
            fecha: {
                $gte: new Date(inicio),
                $lte: new Date(fin)
            }
        })
            .populate('usuario', 'nombre email')
            .lean();

        res.json({
            success: true,
            data: turnos
        });
    } catch (error) {
        console.error('Error obteniendo turnos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener turnos',
            error: error.message
        });
    }
});

// POST /api/turnos/batch - Guardar/Actualizar múltiples turnos (Upsert)
router.post('/batch', onlyAdmin, async (req, res) => {
    try {
        const { turnos } = req.body; // Array de { usuario, ubicacion, fecha, tipo }

        if (!Array.isArray(turnos)) {
            return res.status(400).json({
                success: false,
                message: 'Se espera un array de turnos'
            });
        }

        const operaciones = turnos.map(turno => ({
            updateOne: {
                filter: {
                    usuario: turno.usuario,
                    ubicacion: turno.ubicacion,
                    fecha: new Date(turno.fecha)
                },
                update: {
                    $set: {
                        tipo: turno.tipo,
                        nota: turno.nota
                    }
                },
                upsert: true
            }
        }));

        if (operaciones.length > 0) {
            await Turno.bulkWrite(operaciones);
        }

        res.json({
            success: true,
            message: 'Turnos guardados exitosamente'
        });
    } catch (error) {
        console.error('Error guardando turnos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al guardar turnos',
            error: error.message
        });
    }
});

// DELETE /api/turnos/:id - Eliminar un turno específico
router.delete('/:id', onlyAdmin, async (req, res) => {
    try {
        await Turno.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Turno eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
