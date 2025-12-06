import express from 'express';
import Obrador from '../models/Obrador.js';
import { authenticate } from '../middlewares/auth.js';
import { onlyAdmin, checkAnyPermission } from '../middlewares/checkPermissions.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET /api/obradores - Listar todos los obradores
router.get('/', checkAnyPermission(['verProduccion', 'gestionarProduccion']), async (req, res) => {
  try {
    const { activo, tipo } = req.query;
    
    const filtro = {};
    if (activo !== undefined) filtro.activo = activo === 'true';
    if (tipo) filtro.tipo = tipo;
    
    const obradores = await Obrador.find(filtro)
      .populate('responsable', 'nombre email telefono')
      .populate('trabajadores.usuario', 'nombre email')
      .sort({ nombre: 1 });
    
    res.json({
      success: true,
      data: obradores,
      total: obradores.length
    });
  } catch (error) {
    console.error('Error obteniendo obradores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener obradores',
      error: error.message
    });
  }
});

// GET /api/obradores/:id - Obtener obrador por ID
router.get('/:id', checkAnyPermission(['verProduccion', 'gestionarProduccion']), async (req, res) => {
  try {
    const obrador = await Obrador.findById(req.params.id)
      .populate('responsable', 'nombre email telefono')
      .populate('trabajadores.usuario', 'nombre email puesto')
      .populate('inventario.producto')
      .populate('ordenesProduccion.productos.producto')
      .populate('ordenesProduccion.productos.variante')
      .populate('ordenesProduccion.solicitadoPor.usuario', 'nombre email')
      .populate('ordenesProduccion.solicitadoPor.tienda', 'nombre')
      .populate('ordenesProduccion.asignadoA', 'nombre email');
    
    if (!obrador) {
      return res.status(404).json({
        success: false,
        message: 'Obrador no encontrado'
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
      message: 'Error al obtener obrador',
      error: error.message
    });
  }
});

// POST /api/obradores - Crear obrador
router.post('/', onlyAdmin, async (req, res) => {
  try {
    const obrador = await Obrador.create(req.body);
    
    await obrador.populate('responsable', 'nombre email');
    
    res.status(201).json({
      success: true,
      message: 'Obrador creado exitosamente',
      data: obrador
    });
  } catch (error) {
    console.error('Error creando obrador:', error);
    res.status(400).json({
      success: false,
      message: 'Error al crear obrador',
      error: error.message
    });
  }
});

// PUT /api/obradores/:id - Actualizar obrador
router.put('/:id', onlyAdmin, async (req, res) => {
  try {
    const obrador = await Obrador.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('responsable', 'nombre email')
      .populate('trabajadores.usuario', 'nombre email');
    
    if (!obrador) {
      return res.status(404).json({
        success: false,
        message: 'Obrador no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Obrador actualizado exitosamente',
      data: obrador
    });
  } catch (error) {
    console.error('Error actualizando obrador:', error);
    res.status(400).json({
      success: false,
      message: 'Error al actualizar obrador',
      error: error.message
    });
  }
});

// GET /api/obradores/:id/inventario - Ver inventario del obrador
router.get('/:id/inventario', checkAnyPermission(['verProduccion', 'verStockObrador']), async (req, res) => {
  try {
    const obrador = await Obrador.findById(req.params.id)
      .populate('inventario.producto', 'nombre sku');
    
    if (!obrador) {
      return res.status(404).json({
        success: false,
        message: 'Obrador no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: obrador.inventario
    });
  } catch (error) {
    console.error('Error obteniendo inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener inventario',
      error: error.message
    });
  }
});

// PATCH /api/obradores/:id/inventario/actualizar - Actualizar stock
router.patch('/:id/inventario/actualizar', checkAnyPermission(['gestionarProduccion', 'gestionarStock']), async (req, res) => {
  try {
    const { productoId, cantidad, operacion, ...datosMantener } = req.body;
    
    if (!productoId || cantidad === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Producto y cantidad son requeridos'
      });
    }
    
    const obrador = await Obrador.findById(req.params.id);
    
    if (!obrador) {
      return res.status(404).json({
        success: false,
        message: 'Obrador no encontrado'
      });
    }
    
    if (operacion === 'agregar') {
      await obrador.agregarStock(productoId, cantidad, datosMantener);
    } else if (operacion === 'reducir') {
      await obrador.reducirStock(productoId, cantidad);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Operación no válida. Usa "agregar" o "reducir"'
      });
    }
    
    await obrador.populate('inventario.producto', 'nombre sku');
    
    res.json({
      success: true,
      message: 'Stock actualizado exitosamente',
      data: obrador.inventario
    });
  } catch (error) {
    console.error('Error actualizando stock:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/obradores/:id/ordenes - Ver órdenes de producción
router.get('/:id/ordenes', checkAnyPermission(['verProduccion', 'gestionarProduccion']), async (req, res) => {
  try {
    const { estado } = req.query;
    
    const obrador = await Obrador.findById(req.params.id)
      .populate('ordenesProduccion.productos.producto', 'nombre sku')
      .populate('ordenesProduccion.productos.variante', 'nombre')
      .populate('ordenesProduccion.solicitadoPor.usuario', 'nombre email')
      .populate('ordenesProduccion.solicitadoPor.tienda', 'nombre')
      .populate('ordenesProduccion.asignadoA', 'nombre email');
    
    if (!obrador) {
      return res.status(404).json({
        success: false,
        message: 'Obrador no encontrado'
      });
    }
    
    let ordenes = obrador.ordenesProduccion;
    
    if (estado) {
      ordenes = ordenes.filter(orden => orden.estado === estado);
    }
    
    res.json({
      success: true,
      data: ordenes
    });
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener órdenes',
      error: error.message
    });
  }
});

// DELETE /api/obradores/:id - Eliminar obrador
router.delete('/:id', onlyAdmin, async (req, res) => {
  try {
    const obrador = await Obrador.findByIdAndDelete(req.params.id);
    
    if (!obrador) {
      return res.status(404).json({
        success: false,
        message: 'Obrador no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Obrador eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando obrador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar obrador',
      error: error.message
    });
  }
});

export default router;
