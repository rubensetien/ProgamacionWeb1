import express from 'express';
import Inventario from '../models/Inventario.js';
import Producto from '../models/Producto.js';
import { auth, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/inventario - Obtener todo el inventario (y sincronizar productos nuevos)
router.get('/', auth, async (req, res) => {
  try {
    // OPTIMIZACIÓN: Se ha desactivado la sincronización automática en GET / para evitar sobrecarga con grandes volúmenes de datos.
    // La sincronización debe moverse a un proceso en segundo plano o un endpoint específico POST /sync.

    const limitVal = parseInt(req.query.limit) || 100;
    const pageVal = parseInt(req.query.page) || 1;
    const { search } = req.query;
    const MAX_LIMIT = 100;
    const limit = Math.min(limitVal, MAX_LIMIT);
    const page = Math.max(1, pageVal);
    const skip = (page - 1) * limit;

    let filtro = {};

    if (search) {
      // Step 1: Find products that match the search term
      const matchedProducts = await Producto.find({
        $or: [
          { nombre: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const productIds = matchedProducts.map(p => p._id);
      filtro.producto = { $in: productIds };
    }

    const [inventarios, total] = await Promise.all([
      Inventario.find(filtro)
        .populate({
          path: 'producto',
          populate: [
            { path: 'categoria', select: 'nombre' },
            { path: 'variante', select: 'nombre' },
            { path: 'formato', select: 'nombre' }
          ]
        })
        .sort({ stockActual: 1 })
        .limit(limit)
        .skip(skip),
      Inventario.countDocuments(filtro)
    ]);

    res.json({
      success: true,
      count: inventarios.length,
      data: inventarios,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
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

// GET /api/inventario/alertas - Productos con stock bajo o sin stock
router.get('/alertas', auth, async (req, res) => {
  try {
    const inventarios = await Inventario.find({
      $or: [
        { alertaStockBajo: true },
        { alertaSinStock: true }
      ]
    })
      .populate('producto', 'nombre sku imagen')
      .sort({ stockActual: 1 });

    res.json({
      success: true,
      count: inventarios.length,
      data: inventarios
    });
  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener alertas',
      error: error.message
    });
  }
});

// GET /api/inventario/:id - Obtener inventario por ID
router.get('/:id', auth, async (req, res) => {
  try {
    const inventario = await Inventario.findById(req.params.id)
      .populate({
        path: 'producto',
        populate: [
          { path: 'categoria', select: 'nombre' },
          { path: 'variante', select: 'nombre' },
          { path: 'formato', select: 'nombre' }
        ]
      });

    if (!inventario) {
      return res.status(404).json({
        success: false,
        message: 'Inventario no encontrado'
      });
    }

    res.json({
      success: true,
      data: inventario
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

// POST /api/inventario - Crear inventario para un producto
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { producto, stockActual, stockMinimo, ubicacion } = req.body;

    if (!producto) {
      return res.status(400).json({
        success: false,
        message: 'El producto es requerido'
      });
    }

    // Verificar que el producto existe
    const productoExiste = await Producto.findById(producto);
    if (!productoExiste) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Verificar que no existe ya
    const existe = await Inventario.findOne({ producto });
    if (existe) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un inventario para este producto'
      });
    }

    const inventario = await Inventario.create({
      producto,
      stockActual: stockActual || 0,
      stockMinimo: stockMinimo || 5,
      ubicacion: ubicacion || 'Obrador principal'
    });

    await inventario.populate('producto');

    res.status(201).json({
      success: true,
      message: 'Inventario creado correctamente',
      data: inventario
    });
  } catch (error) {
    console.error('Error creando inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear inventario',
      error: error.message
    });
  }
});

// PATCH /api/inventario/:id - AJUSTAR STOCK (3 TIPOS DE MOVIMIENTO)
router.patch('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { tipoMovimiento, cantidad, motivo } = req.body;

    // ✅ FIX: Obtener usuarioId de forma segura
    const usuarioId = req.user && req.user._id ? req.user._id : null;

    if (!tipoMovimiento || cantidad === undefined || cantidad === null) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de movimiento y cantidad son requeridos'
      });
    }

    const inventario = await Inventario.findById(req.params.id);

    if (!inventario) {
      return res.status(404).json({
        success: false,
        message: 'Inventario no encontrado'
      });
    }

    // Ejecutar el método según el tipo
    try {
      if (tipoMovimiento === 'entrada') {
        await inventario.agregarStock(cantidad, usuarioId, motivo || 'Entrada de stock');
      } else if (tipoMovimiento === 'salida') {
        await inventario.reducirStock(cantidad, usuarioId, motivo || 'Salida de stock');
      } else if (tipoMovimiento === 'ajuste') {
        await inventario.ajustarStock(cantidad, usuarioId, motivo || 'Ajuste de inventario');
      } else {
        return res.status(400).json({
          success: false,
          message: 'Tipo de movimiento inválido. Debe ser: entrada, salida o ajuste'
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Recargar con populate
    await inventario.populate({
      path: 'producto',
      populate: [
        { path: 'categoria', select: 'nombre' },
        { path: 'variante', select: 'nombre' },
        { path: 'formato', select: 'nombre' }
      ]
    });

    res.json({
      success: true,
      message: `Stock ${tipoMovimiento === 'entrada' ? 'añadido' : tipoMovimiento === 'salida' ? 'reducido' : 'ajustado'} correctamente`,
      data: inventario
    });
  } catch (error) {
    console.error('Error ajustando stock:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al ajustar el stock'
    });
  }
});

// PUT /api/inventario/:id - Actualizar configuración (no stock)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { stockMinimo, ubicacion } = req.body;

    const inventario = await Inventario.findById(req.params.id);

    if (!inventario) {
      return res.status(404).json({
        success: false,
        message: 'Inventario no encontrado'
      });
    }

    if (stockMinimo !== undefined) inventario.stockMinimo = stockMinimo;
    if (ubicacion !== undefined) inventario.ubicacion = ubicacion;

    await inventario.save();
    await inventario.populate('producto');

    res.json({
      success: true,
      message: 'Configuración actualizada correctamente',
      data: inventario
    });
  } catch (error) {
    console.error('Error actualizando inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar inventario',
      error: error.message
    });
  }
});

// DELETE /api/inventario/:id - Eliminar inventario
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const inventario = await Inventario.findById(req.params.id);

    if (!inventario) {
      return res.status(404).json({
        success: false,
        message: 'Inventario no encontrado'
      });
    }

    await inventario.deleteOne();

    res.json({
      success: true,
      message: 'Inventario eliminado correctamente'
    });
  } catch (error) {
    console.error('Error eliminando inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar inventario',
      error: error.message
    });
  }
});

export default router;
