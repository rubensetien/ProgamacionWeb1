import express from 'express';
import upload from '../middlewares/upload.js';
import { auth, isAdmin } from '../middlewares/auth.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

/**
 * @route   POST /api/upload/producto
 * @desc    Subir imagen de producto
 * @access  Private (Admin, Gestor)
 */
router.post('/producto', auth, isAdmin, upload.single('imagen'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
    }

    const imageUrl = `/uploads/productos/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Imagen subida correctamente',
      data: {
        filename: req.file.filename,
        url: imageUrl,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir la imagen'
    });
  }
});

/**
 * @route   POST /api/upload/variante
 * @desc    Subir imagen de sabor/variante
 * @access  Private (Admin, Gestor)
 */
router.post('/variante', auth, isAdmin, upload.single('imagen'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
    }

    const imageUrl = `/uploads/sabores/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Imagen de sabor subida correctamente',
      data: {
        filename: req.file.filename,
        url: imageUrl,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Error subiendo imagen de sabor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir la imagen del sabor'
    });
  }
});

/**
 * @route   POST /api/upload/categoria
 * @desc    Subir imagen de categoría
 * @access  Private (Admin)
 */
router.post('/categoria', auth, isAdmin, upload.single('imagen'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
    }

    const imageUrl = `/uploads/categorias/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Imagen de categoría subida correctamente',
      data: {
        filename: req.file.filename,
        url: imageUrl,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Error subiendo imagen de categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir la imagen de la categoría'
    });
  }
});

/**
 * @route   DELETE /api/upload/:tipo/:filename
 * @desc    Eliminar una imagen
 * @access  Private (Admin)
 */
router.delete('/:tipo/:filename', auth, isAdmin, (req, res) => {
  try {
    const { tipo, filename } = req.params;
    const validTypes = ['productos', 'sabores', 'categorias', 'formatos'];

    if (!validTypes.includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de imagen no válido'
      });
    }

    const filePath = path.join(process.cwd(), 'uploads', tipo, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Imagen eliminada correctamente'
    });
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la imagen'
    });
  }
});

export default router;
