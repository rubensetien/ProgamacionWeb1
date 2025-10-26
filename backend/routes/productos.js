import express from 'express';
import { body, validationResult } from 'express-validator';
import Producto from '../models/Producto.js';
import authBasic  from '../middlewares/authBasic.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

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

router.get('/', authBasic, authorizeRole(['admin', 'user']), async (req, res, next) => {
  try {
    const { busqueda } = req.query;
    
    let filtro = {};
    if (busqueda && busqueda.trim()) {
      filtro = {
        nombre: { $regex: busqueda, $options: 'i' }  // Búsqueda case-insensitive
      };
    }
    
    const productos = await Producto.find(filtro);
    res.json(productos);
  } catch (err) {
    next(err);
  }
});
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

router.post(
  '/',
  authBasic,
  authorizeRole(['admin']),
  validacionProducto,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ ok: false, errors: errors.array() });
    }

    try {
      const nuevoProducto = new Producto(req.body);
      await nuevoProducto.save();
      res.status(201).json(nuevoProducto);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  authBasic,
  authorizeRole(['admin']),
  validacionProducto,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ ok: false, errors: errors.array() });
    }

    try {
      const productoActualizado = await Producto.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!productoActualizado) {
        return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' });
      }

      res.json(productoActualizado);
    } catch (err) {
      next(err);
    }
  }
);

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
      res.json({ ok: true, mensaje: 'Producto eliminado correctamente' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;