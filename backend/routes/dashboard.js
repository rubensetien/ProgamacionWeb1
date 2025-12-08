import express from 'express';
import { auth, isAdmin } from '../middlewares/auth.js';
import Usuario from '../models/Usuario.js';
import Producto from '../models/Producto.js';
import Ubicacion from '../models/Ubicacion.js';
import Pedido from '../models/Pedido.js';
import Solicitud from '../models/Solicitud.js';
import Categoria from '../models/Categoria.js';

const router = express.Router();

router.use(auth);
router.use(isAdmin);

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
    try {
        const [
            totalUsuarios,
            totalClientes,
            totalTrabajadores,
            totalUbicaciones,
            totalProductos,
            productosActivos,
            totalCategorias,
            solicitudesPendientes,
            pedidosHoy
        ] = await Promise.all([
            Usuario.countDocuments(),
            Usuario.countDocuments({ rol: 'cliente' }),
            Usuario.countDocuments({ rol: { $ne: 'cliente' } }), // Admin, gestor, etc
            Ubicacion.countDocuments({
                activo: true,
                tipo: { $nin: ['oficina', 'obrador'] } // Excluir oficinas y obradores
            }),
            Producto.countDocuments(),
            Producto.countDocuments({ activo: true }),
            Categoria.countDocuments({ activa: true }),
            Solicitud.countDocuments({ estado: 'pendiente' }),
            Pedido.countDocuments({ // Pedidos de hoy (ejemplo simplificado)
                createdAt: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    $lt: new Date(new Date().setHours(23, 59, 59, 999))
                }
            })
        ]);

        res.json({
            success: true,
            data: {
                usuarios: {
                    total: totalUsuarios,
                    clientes: totalClientes,
                    trabajadores: totalTrabajadores
                },
                ubicaciones: {
                    total: totalUbicaciones
                },
                productos: {
                    total: totalProductos,
                    activos: productosActivos,
                    categorias: totalCategorias
                },
                solicitudes: {
                    pendientes: solicitudesPendientes
                },
                pedidos: {
                    hoy: pedidosHoy
                }
            }
        });

    } catch (error) {
        console.error('Error en dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error cargando estadísticas',
            error: error.message
        });
    }
});

export default router;
