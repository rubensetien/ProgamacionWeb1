import express from 'express';
import Categoria from '../models/Categoria.js';

const router = express.Router();

// GET /api/categorias - Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const { activo } = req.query;
    
    const filtro = {};
    if (activo !== undefined) {
      filtro.activo = activo === 'true';
    }
    
    const categorias = await Categoria.find(filtro).sort({ orden: 1 });
    
    res.json({
      success: true,
      data: categorias,
      total: categorias.length
    });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
});

// GET /api/categorias/:id - Obtener una categoría por ID
router.get('/:id', async (req, res) => {
  try {
    const categoria = await Categoria.findById(req.params.id);
    
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: categoria
    });
  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categoría',
      error: error.message
    });
  }
});

// GET /api/categorias/slug/:slug - Obtener una categoría por slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const categoria = await Categoria.findOne({ slug: req.params.slug });
    
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: categoria
    });
  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener categoría',
      error: error.message
    });
  }
});

// POST /api/categorias - Crear una categoría
router.post('/', async (req, res) => {
  try {
    const categoria = new Categoria(req.body);
    await categoria.save();
    
    res.status(201).json({
      success: true,
      data: categoria,
      message: 'Categoría creada exitosamente'
    });
  } catch (error) {
    console.error('Error creando categoría:', error);
    res.status(400).json({
      success: false,
      message: 'Error al crear categoría',
      error: error.message
    });
  }
});

// PUT /api/categorias/:id - Actualizar una categoría
router.put('/:id', async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: categoria,
      message: 'Categoría actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando categoría:', error);
    res.status(400).json({
      success: false,
      message: 'Error al actualizar categoría',
      error: error.message
    });
  }
});

// DELETE /api/categorias/:id - Eliminar una categoría
router.delete('/:id', async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndDelete(req.params.id);
    
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar categoría',
      error: error.message
    });
  }
});

export default router;
