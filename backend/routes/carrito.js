import express from 'express';
import Carrito from '../models/Carrito.js';
import Producto from '../models/Producto.js';
import Inventario from '../models/Inventario.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(auth);

// GET /api/carrito - Obtener carrito del usuario
router.get('/', async (req, res) => {
  try {
    const carrito = await Carrito.obtenerActivo(req.usuario.id);
    
    res.json({
      success: true,
      data: carrito
    });
  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el carrito',
      error: error.message
    });
  }
});

// POST /api/carrito/item - Agregar item al carrito
router.post('/item', async (req, res) => {
  try {
    const { productoId, cantidad = 1 } = req.body;
    
    if (!productoId) {
      return res.status(400).json({
        success: false,
        message: 'El ID del producto es requerido'
      });
    }
    
    // Obtener producto con sus referencias
    const producto = await Producto.findById(productoId)
      .populate('variante')
      .populate('formato')
      .populate('categoria');
    
    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    // Verificar que el producto esté activo
    if (!producto.activo) {
      return res.status(400).json({
        success: false,
        message: 'Este producto no está disponible'
      });
    }
    
    // Verificar stock disponible (si existe inventario)
    const inventario = await Inventario.findOne({ producto: productoId });
    if (inventario && inventario.stockDisponible < cantidad) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Disponible: ${inventario.stockDisponible}`
      });
    }
    
    // Obtener carrito activo
    const carrito = await Carrito.obtenerActivo(req.usuario.id);
    
    // Preparar datos del item
    const itemData = {
      producto: producto._id,
      variante: producto.variante._id,
      formato: producto.formato._id,
      categoria: producto.categoria ? producto.categoria._id : null,
      cantidad,
      precioUnitario: producto.precioFinal,
      nombreProducto: producto.nombre,
      nombreVariante: producto.variante.nombre,
      nombreFormato: producto.formato.nombre,
      imagenVariante: producto.variante.imagen
    };
    
    // Agregar item al carrito
    await carrito.agregarItem(itemData);
    
    // Recargar carrito con populate
    await carrito.populate('items.producto');
    await carrito.populate('items.variante');
    await carrito.populate('items.formato');
    await carrito.populate('items.categoria');
    
    res.json({
      success: true,
      message: 'Producto agregado al carrito',
      data: carrito
    });
  } catch (error) {
    console.error('Error agregando item:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar el producto al carrito',
      error: error.message
    });
  }
});

// PUT /api/carrito/item/:itemId - Actualizar cantidad de item
router.put('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { cantidad } = req.body;
    
    if (!cantidad || cantidad < 0) {
      return res.status(400).json({
        success: false,
        message: 'Cantidad inválida'
      });
    }
    
    const carrito = await Carrito.obtenerActivo(req.usuario.id);
    
    // Verificar stock disponible
    const item = carrito.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item no encontrado en el carrito'
      });
    }
    
    const inventario = await Inventario.findOne({ producto: item.producto });
    if (inventario && inventario.stockDisponible < cantidad) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Disponible: ${inventario.stockDisponible}`
      });
    }
    
    await carrito.actualizarCantidad(itemId, cantidad);
    
    // Recargar carrito con populate
    await carrito.populate('items.producto');
    await carrito.populate('items.variante');
    await carrito.populate('items.formato');
    await carrito.populate('items.categoria');
    
    res.json({
      success: true,
      message: 'Cantidad actualizada',
      data: carrito
    });
  } catch (error) {
    console.error('Error actualizando cantidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la cantidad',
      error: error.message
    });
  }
});

// DELETE /api/carrito/item/:itemId - Eliminar item del carrito
router.delete('/item/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const carrito = await Carrito.obtenerActivo(req.usuario.id);
    await carrito.eliminarItem(itemId);
    
    // Recargar carrito con populate
    await carrito.populate('items.producto');
    await carrito.populate('items.variante');
    await carrito.populate('items.formato');
    await carrito.populate('items.categoria');
    
    res.json({
      success: true,
      message: 'Item eliminado del carrito',
      data: carrito
    });
  } catch (error) {
    console.error('Error eliminando item:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el item',
      error: error.message
    });
  }
});

// DELETE /api/carrito - Vaciar carrito
router.delete('/', async (req, res) => {
  try {
    const carrito = await Carrito.obtenerActivo(req.usuario.id);
    await carrito.vaciar();
    
    res.json({
      success: true,
      message: 'Carrito vaciado',
      data: carrito
    });
  } catch (error) {
    console.error('Error vaciando carrito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al vaciar el carrito',
      error: error.message
    });
  }
});

export default router;