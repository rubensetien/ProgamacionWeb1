import express from 'express';
import Producto from '../models/Producto.js';
import Categoria from '../models/Categoria.js';
import Variante from '../models/Variante.js';
import Formato from '../models/Formato.js';
import redisClient from '../config/redis.js';

const router = express.Router();

// Helper para invalidar caché
const invalidarCacheProductos = async () => {
  try {
    if (redisClient.isReady) {
      const keys = await redisClient.keys('productos:query:*');
      if (keys.length > 0) {
        await redisClient.del(keys);
        console.log('🧹 Caché de productos invalidada');
      }
    }
  } catch (error) {
    console.error('Error invalidando caché:', error);
  }
};

// GET /api/productos - Obtener todos los productos con filtros avanzados
router.get('/', async (req, res) => {
  try {
    // Intentar obtener de caché
    const cacheKey = `productos:query:${JSON.stringify(req.query)}`;

    try {
      if (redisClient.isReady) {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }
    } catch (redisError) {
      console.error('Redis error:', redisError);
    }

    const {
      categoria,
      variante,
      formato,
      activo,
      destacado,
      canal,
      seVendeOnline,
      buscar,
      limit = 100,
      page = 1
    } = req.query;

    const filtro = {};

    if (categoria) filtro.categoria = categoria;
    if (variante) filtro.variante = variante;
    if (formato) filtro.formato = formato;
    if (activo !== undefined) filtro.activo = activo === 'true';
    if (destacado !== undefined) filtro.destacado = destacado === 'true';
    if (canal) filtro.canales = canal;
    if (seVendeOnline !== undefined) filtro.seVendeOnline = seVendeOnline === 'true';

    // Búsqueda por nombre o SKU
    if (buscar) {
      filtro.$or = [
        { nombre: { $regex: buscar, $options: 'i' } },
        { sku: { $regex: buscar, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [productos, total] = await Promise.all([
      Producto.find(filtro)
        .populate('categoria', 'nombre slug color icono')
        .populate('variante', 'nombre slug descripcion imagen color alergenos')
        .populate('formato', 'nombre slug capacidad unidad precioBase tipoVenta')
        .sort({ orden: 1, nombre: 1 })
        .limit(parseInt(limit))
        .skip(skip),
      Producto.countDocuments(filtro)
    ]);

    const responseData = {
      success: true,
      data: productos,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    };

    // Guardar en caché (30 min)
    try {
      if (redisClient.isReady) {
        await redisClient.set(cacheKey, JSON.stringify(responseData), {
          EX: 1800
        });
      }
    } catch (redisError) {
      console.error('Error saving to Redis:', redisError);
    }

    res.json(responseData);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
});

// GET /api/productos/categoria/:categoriaId - Obtener productos por categoría
router.get('/categoria/:categoriaId', async (req, res) => {
  try {
    const productos = await Producto.find({
      categoria: req.params.categoriaId,
      activo: true
    })
      .populate('categoria', 'nombre slug color')
      .populate('variante', 'nombre slug imagen color')
      .populate('formato', 'nombre slug capacidad unidad')
      .sort({ orden: 1 });

    res.json({
      success: true,
      data: productos,
      total: productos.length
    });
  } catch (error) {
    console.error('Error obteniendo productos por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
});

// GET /api/productos/canal/:canal - Obtener productos por canal de venta
router.get('/canal/:canal', async (req, res) => {
  try {
    const productos = await Producto.find({
      canales: req.params.canal,
      activo: true
    })
      .populate('categoria', 'nombre slug')
      .populate('variante', 'nombre slug imagen')
      .populate('formato', 'nombre slug capacidad unidad')
      .sort({ destacado: -1, orden: 1 });

    res.json({
      success: true,
      data: productos,
      total: productos.length
    });
  } catch (error) {
    console.error('Error obteniendo productos por canal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: error.message
    });
  }
});

// GET /api/productos/destacados - Obtener productos destacados
router.get('/destacados', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const productos = await Producto.find({
      destacado: true,
      activo: true
    })
      .populate('categoria', 'nombre slug color')
      .populate('variante', 'nombre slug imagen')
      .populate('formato', 'nombre capacidad unidad')
      .sort({ orden: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: productos,
      total: productos.length
    });
  } catch (error) {
    console.error('Error obteniendo productos destacados:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos destacados',
      error: error.message
    });
  }
});

// GET /api/productos/:id - Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id)
      .populate('categoria', 'nombre slug color icono')
      .populate('variante', 'nombre slug descripcion imagen color ingredientes alergenos')
      .populate('formato', 'nombre slug descripcion capacidad unidad precioBase tipoEnvase');

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: error.message
    });
  }
});

// GET /api/productos/sku/:sku - Obtener un producto por SKU
router.get('/sku/:sku', async (req, res) => {
  try {
    const producto = await Producto.findOne({ sku: req.params.sku.toUpperCase() })
      .populate('categoria', 'nombre slug')
      .populate('variante', 'nombre slug imagen')
      .populate('formato', 'nombre slug capacidad unidad');

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    console.error('Error obteniendo producto por SKU:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener producto',
      error: error.message
    });
  }
});

// POST /api/productos - Crear un producto
router.post('/', async (req, res) => {
  try {
    // Verificar que existe la categoría
    const categoria = await Categoria.findById(req.body.categoria);
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar que existe la variante (si se proporciona)
    if (req.body.variante) {
      const variante = await Variante.findById(req.body.variante);
      if (!variante) {
        return res.status(404).json({
          success: false,
          message: 'Variante no encontrada'
        });
      }
    }

    // Verificar que existe el formato (si se proporciona)
    if (req.body.formato) {
      const formato = await Formato.findById(req.body.formato);
      if (!formato) {
        return res.status(404).json({
          success: false,
          message: 'Formato no encontrado'
        });
      }
    }

    const producto = new Producto(req.body);
    await producto.save();

    await producto.populate([
      { path: 'categoria', select: 'nombre slug' },
      { path: 'variante', select: 'nombre slug imagen' },
      { path: 'formato', select: 'nombre slug capacidad unidad' }
    ]);

    await invalidarCacheProductos();

    res.status(201).json({
      success: true,
      data: producto,
      message: 'Producto creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(400).json({
      success: false,
      message: 'Error al crear producto',
      error: error.message
    });
  }
});

// PUT /api/productos/:id - Actualizar un producto
router.put('/:id', async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('categoria', 'nombre slug')
      .populate('variante', 'nombre slug imagen')
      .populate('formato', 'nombre slug capacidad unidad');

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    await invalidarCacheProductos();

    res.json({
      success: true,
      data: producto,
      message: 'Producto actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(400).json({
      success: false,
      message: 'Error al actualizar producto',
      error: error.message
    });
  }
});

// PATCH /api/productos/:id/stock - Actualizar solo el stock
router.patch('/:id/stock', async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || stock === null) {
      return res.status(400).json({
        success: false,
        message: 'El campo stock es requerido'
      });
    }

    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    );

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    await invalidarCacheProductos();

    res.json({
      success: true,
      data: producto,
      message: 'Stock actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando stock:', error);
    res.status(400).json({
      success: false,
      message: 'Error al actualizar stock',
      error: error.message
    });
  }
});

// DELETE /api/productos/:id - Eliminar un producto
router.delete('/:id', async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    await invalidarCacheProductos();

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar producto',
      error: error.message
    });
  }
});

export default router;