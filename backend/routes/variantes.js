import express from 'express';
import Variante from '../models/Variante.js';
import Categoria from '../models/Categoria.js';

const router = express.Router();

// GET /api/variantes - Obtener todas las variantes
router.get('/', async (req, res) => {
  try {
    const { categoria, activo, destacado, temporada, page = 1, limit = 100, search } = req.query;

    const filtro = {};
    if (categoria) filtro.categoria = categoria;
    if (activo !== undefined) filtro.activo = activo === 'true';
    if (destacado !== undefined) filtro.destacado = destacado === 'true';
    if (temporada) filtro.temporada = temporada;

    if (search) {
      filtro.$or = [
        { nombre: { $regex: search, $options: 'i' } },
        { descripcion: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [variantes, total] = await Promise.all([
      Variante.find(filtro)
        .populate('categoria', 'nombre slug')
        .sort({ orden: 1 })
        .skip(skip)
        .limit(limitNum),
      Variante.countDocuments(filtro)
    ]);

    res.json({
      success: true,
      data: variantes,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum
    });
  } catch (error) {
    console.error('Error obteniendo variantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener variantes',
      error: error.message
    });
  }
});

// GET /api/variantes/categoria/:categoriaId - Obtener variantes por categoría
router.get('/categoria/:categoriaId', async (req, res) => {
  try {
    const variantes = await Variante.find({
      categoria: req.params.categoriaId,
      activo: true
    })
      .populate('categoria', 'nombre slug')
      .sort({ orden: 1 });

    res.json({
      success: true,
      data: variantes,
      total: variantes.length
    });
  } catch (error) {
    console.error('Error obteniendo variantes por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener variantes',
      error: error.message
    });
  }
});

// GET /api/variantes/:id - Obtener una variante por ID
router.get('/:id', async (req, res) => {
  try {
    const variante = await Variante.findById(req.params.id)
      .populate('categoria', 'nombre slug color');

    if (!variante) {
      return res.status(404).json({
        success: false,
        message: 'Variante no encontrada'
      });
    }

    res.json({
      success: true,
      data: variante
    });
  } catch (error) {
    console.error('Error obteniendo variante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener variante',
      error: error.message
    });
  }
});

// GET /api/variantes/slug/:slug - Obtener una variante por slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const variante = await Variante.findOne({ slug: req.params.slug })
      .populate('categoria', 'nombre slug color');

    if (!variante) {
      return res.status(404).json({
        success: false,
        message: 'Variante no encontrada'
      });
    }

    res.json({
      success: true,
      data: variante
    });
  } catch (error) {
    console.error('Error obteniendo variante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener variante',
      error: error.message
    });
  }
});

// POST /api/variantes - Crear una variante
router.post('/', async (req, res) => {
  try {
    // Verificar que la categoría existe
    const categoria = await Categoria.findById(req.body.categoria);
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    const variante = new Variante(req.body);
    await variante.save();

    await variante.populate('categoria', 'nombre slug');

    res.status(201).json({
      success: true,
      data: variante,
      message: 'Variante creada exitosamente'
    });
  } catch (error) {
    console.error('Error creando variante:', error);
    res.status(400).json({
      success: false,
      message: 'Error al crear variante',
      error: error.message
    });
  }
});

// PUT /api/variantes/:id - Actualizar una variante
router.put('/:id', async (req, res) => {
  try {
    const variante = await Variante.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('categoria', 'nombre slug');

    if (!variante) {
      return res.status(404).json({
        success: false,
        message: 'Variante no encontrada'
      });
    }

    res.json({
      success: true,
      data: variante,
      message: 'Variante actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando variante:', error);
    res.status(400).json({
      success: false,
      message: 'Error al actualizar variante',
      error: error.message
    });
  }
});

// DELETE /api/variantes/:id - Eliminar una variante
router.delete('/:id', async (req, res) => {
  try {
    const variante = await Variante.findByIdAndDelete(req.params.id);

    if (!variante) {
      return res.status(404).json({
        success: false,
        message: 'Variante no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Variante eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando variante:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar variante',
      error: error.message
    });
  }
});

export default router;
