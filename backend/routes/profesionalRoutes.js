import express from 'express';
import { registrarNegocio, getNegociosPendientes, validarNegocio, rechazarNegocio, getAllNegocios, addEmpleado, getMiNegocio } from '../controllers/profesionalController.js';
import { auth } from '../middlewares/auth.js'; // Import auth middleware

const router = express.Router();

router.post('/registro-negocio', registrarNegocio);

// Rutas protegidas (Admin / Oficina)
router.get('/pendientes', auth, getNegociosPendientes);
router.put('/:id/validar', auth, validarNegocio);
router.put('/:id/rechazar', auth, rechazarNegocio);

// Gestión de Negocios (Admin/Oficina)
router.get('/', auth, getAllNegocios);
router.post('/:id/empleados', auth, addEmpleado);

// Rutas Profesionales (Propios)
router.get('/mi-negocio', auth, getMiNegocio);

export default router;
