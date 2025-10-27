import express from "express";
import { body, validationResult } from 'express-validator';
import { login, refresh, logout, register, registerAdmin } from "../controllers/authController.js";
import authBasic from '../middlewares/authBasic.js';
import { authorizeRole } from '../middlewares/authorizeRole.js';

const router = express.Router();

// Validaciones para registro
const validacionRegistro = [
  body('nombre')
    .trim()
    .isLength({ min: 3 })
    .withMessage('El nombre debe tener al menos 3 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
];

// Middleware para manejar errores de validación
const manejarErroresValidacion = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      ok: false, 
      mensaje: errors.array()[0].msg,
      errores: errors.array() 
    });
  }
  next();
};

// Rutas existentes
router.post("/login", login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Rutas nuevas
router.post(
  '/register', 
  validacionRegistro,
  manejarErroresValidacion,
  register
);

router.post(
  '/register-admin',
  authBasic,
  authorizeRole(['admin']),
  validacionRegistro,
  manejarErroresValidacion,
  registerAdmin
);

export default router;