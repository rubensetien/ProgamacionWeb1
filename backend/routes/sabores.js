import express from 'express';
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import Sabor from '../models/Sabor.js';
import authBasic from '../middlewares/authBasic.js';
import { isAdminRole } from '../middlewares/isAdminRole.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

const validacionSabor = [
  body('nombre')
    .trim()
    .isLength({ min: 3 })
    .withMessage('El nombre debe tener al menos 3 caracteres'),
  body('descripcion')
    .trim()
    .isLength({ min: 10 })
    .withMessage('La descripción debe tener al menos 10 caracteres'),
  body('categoria')
    .isIn(['cremoso', 'sorbete', 'vegano', 'premium', 'sin-azucar', 'tradicional'])
    .withMessage('Categoría no válida'),
  body('tipoAzucar')
    .isIn(['con-azucar', 'sin-azucar'])
    .withMessage('Tipo de azúcar no válido')
];

// GET - Listar todos los sabores
router.get('/', authBasic, isAdminRole(['admin', 'user']), async (req, res, next) => {
  try {
    const { categoria, tipoAzucar, destacado, activo } = req.query;
    
    let filtro = {};
    if (categoria) filtro.categoria = categoria;
    if (tipoAzucar) filtro.tipoAzucar = tipoAzucar;
    if (destacado) filtro.destacado = destacado === 'true';
    if (activo !== undefined) filtro.activo = activo === 'true';
    
    const sabores = await Sabor.find(filtro).sort({ orden: 1, nombre: 1 });
    res.json(sabores);
  } catch (err) {
    next(err);
  }
});

// GET - Obtener sabor por ID
router.get('/:id', authBasic, isAdminRole(['admin', 'user']), async (req, res, next) => {
  try {
    const sabor = await Sabor.findById(req.params.id);
    if (!sabor) {
      return res.status(404).json({ ok: false, mensaje: 'Sabor no encontrado' });
    }
    res.json(sabor);
  } catch (err) {
    next(err);
  }
});

// GET - Obtener sabor por slug
router.get('/slug/:slug', authBasic, isAdminRole(['admin', 'user']), async (req, res, next) => {
  try {
    const sabor = await Sabor.findOne({ slug: req.params.slug });
    if (!sabor) {
      return res.status(404).json({ ok: false, mensaje: 'Sabor no encontrado' });
    }
    res.json(sabor);
  } catch (err) {
    next(err);
  }
});

// POST - Crear sabor (solo admin, con imagen opcional)
router.post(
  '/',
  authBasic,
  isAdminRole(['admin']),
  upload.single('imagen'),
  validacionSabor,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ ok: false, errors: errors.array() });
    }

    try {
      const nuevoSabor = new Sabor({
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        categoria: req.body.categoria,
        tipoAzucar: req.body.tipoAzucar,
        alergenos: req.body.alergenos ? JSON.parse(req.body.alergenos) : [],
        ingredientesPrincipales: req.body.ingredientesPrincipales ? JSON.parse(req.body.ingredientesPrincipales) : [],
        temporada: req.body.temporada || 'todo-año',
        color: req.body.color || '#FFFFFF',
        destacado: req.body.destacado === 'true',
        activo: req.body.activo !== 'false',
        orden: req.body.orden || 0,
        imagen: req.file ? `/uploads/sabores/${req.file.filename}` : null
      });

      await nuevoSabor.save();
      res.status(201).json(nuevoSabor);
    } catch (err) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      next(err);
    }
  }
);

// PUT - Actualizar sabor (solo admin, con imagen opcional)
router.put(
  '/:id',
  authBasic,
  isAdminRole(['admin']),
  upload.single('imagen'),
  validacionSabor,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ ok: false, errors: errors.array() });
    }

    try {
      const saborExistente = await Sabor.findById(req.params.id);
      
      if (!saborExistente) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ ok: false, mensaje: 'Sabor no encontrado' });
      }

      const datosActualizados = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        categoria: req.body.categoria,
        tipoAzucar: req.body.tipoAzucar,
        alergenos: req.body.alergenos ? JSON.parse(req.body.alergenos) : saborExistente.alergenos,
        ingredientesPrincipales: req.body.ingredientesPrincipales ? JSON.parse(req.body.ingredientesPrincipales) : saborExistente.ingredientesPrincipales,
        temporada: req.body.temporada || saborExistente.temporada,
        color: req.body.color || saborExistente.color,
        destacado: req.body.destacado === 'true',
        activo: req.body.activo !== 'false',
        orden: req.body.orden !== undefined ? req.body.orden : saborExistente.orden
      };

      if (req.file) {
        if (saborExistente.imagen) {
          const rutaAntigua = path.join('.', saborExistente.imagen);
          if (fs.existsSync(rutaAntigua)) {
            fs.unlinkSync(rutaAntigua);
          }
        }
        datosActualizados.imagen = `/uploads/sabores/${req.file.filename}`;
      }

      const saborActualizado = await Sabor.findByIdAndUpdate(
        req.params.id,
        datosActualizados,
        { new: true, runValidators: true }
      );

      res.json(saborActualizado);
    } catch (err) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      next(err);
    }
  }
);

// DELETE - Eliminar sabor (solo admin)
router.delete(
  '/:id',
  authBasic,
  isAdminRole(['admin']),
  async (req, res, next) => {
    try {
      const saborEliminado = await Sabor.findByIdAndDelete(req.params.id);
      
      if (!saborEliminado) {
        return res.status(404).json({ ok: false, mensaje: 'Sabor no encontrado' });
      }

      // Eliminar imagen si existe
      if (saborEliminado.imagen) {
        const rutaImagen = path.join('.', saborEliminado.imagen);
        if (fs.existsSync(rutaImagen)) {
          fs.unlinkSync(rutaImagen);
        }
      }

      res.json({ ok: true, mensaje: 'Sabor eliminado correctamente' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;