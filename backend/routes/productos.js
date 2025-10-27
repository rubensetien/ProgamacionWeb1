import express from 'express';
import { body, validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import Producto from '../models/Producto.js';
import authBasic from '../middlewares/authBasic.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

const validacionProducto = [
  body('nombre')
    .trim()
    .isLength({ min: 3 })
    .withMessage('El nombre debe tener al menos 3 caracteres'),
  body('precio')
    .isFloat({ gt: 0 })
    .withMessage('El precio debe ser un número mayor que 0'),
  body('descripcion')
    .trim()
    .isLength({ min: 5 })
    .withMessage('La descripción debe tener al menos 5 caracteres'),
];

// GET - Listar productos
router.get('/', authBasic, authorizeRole(['admin', 'user']), async (req, res, next) => {
  try {
    const { busqueda } = req.query;
    
    let filtro = {};
    if (busqueda && busqueda.trim()) {
      filtro = {
        nombre: { $regex: busqueda, $options: 'i' }
      };
    }
    
    const productos = await Producto.find(filtro);
    res.json(productos);
  } catch (err) {
    next(err);
  }
});

// GET - Obtener un producto
router.get('/:id', authBasic, authorizeRole(['admin', 'user']), async (req, res, next) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (err) {
    next(err);
  }
});

// POST - Crear producto (con imagen)
router.post(
  '/',
  authBasic,
  authorizeRole(['admin']),
  upload.single('imagen'), // Middleware para subir imagen
  validacionProducto,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Si hay errores de validación, eliminar imagen subida
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ ok: false, errors: errors.array() });
    }

    try {
      const nuevoProducto = new Producto({
        nombre: req.body.nombre,
        precio: req.body.precio,
        descripcion: req.body.descripcion,
        imagen: req.file ? `/uploads/${req.file.filename}` : null
      });

      await nuevoProducto.save();
      res.status(201).json(nuevoProducto);
    } catch (err) {
      // Si hay error, eliminar imagen subida
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      next(err);
    }
  }
);

// PUT - Actualizar producto (con imagen opcional)
router.put(
  '/:id',
  authBasic,
  authorizeRole(['admin']),
  upload.single('imagen'),
  validacionProducto,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ ok: false, errors: errors.array() });
    }

    try {
      const productoExistente = await Producto.findById(req.params.id);
      
      if (!productoExistente) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
      }

      // Preparar datos actualizados
      const datosActualizados = {
        nombre: req.body.nombre,
        precio: req.body.precio,
        descripcion: req.body.descripcion,
      };

      // Si se subió nueva imagen
      if (req.file) {
        // Eliminar imagen antigua si existe
        if (productoExistente.imagen) {
          const rutaAntigua = path.join('.', productoExistente.imagen);
          if (fs.existsSync(rutaAntigua)) {
            fs.unlinkSync(rutaAntigua);
          }
        }
        datosActualizados.imagen = `/uploads/${req.file.filename}`;
      }

      const productoActualizado = await Producto.findByIdAndUpdate(
        req.params.id,
        datosActualizados,
        { new: true, runValidators: true }
      );

      res.json(productoActualizado);
    } catch (err) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      next(err);
    }
  }
);

// DELETE - Eliminar producto (y su imagen)
router.delete(
  '/:id',
  authBasic,
  authorizeRole(['admin']),
  async (req, res, next) => {
    try {
      const productoEliminado = await Producto.findByIdAndDelete(req.params.id);
      
      if (!productoEliminado) {
        return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
      }

      // Eliminar imagen del producto si existe
      if (productoEliminado.imagen) {
        const rutaImagen = path.join('.', productoEliminado.imagen);
        if (fs.existsSync(rutaImagen)) {
          fs.unlinkSync(rutaImagen);
        }
      }

      res.json({ ok: true, mensaje: 'Producto eliminado correctamente' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;