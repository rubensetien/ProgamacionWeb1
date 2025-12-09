import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../config/redis.js';

// Crear el store de Redis una sola vez
// const store = new RedisStore({
//     sendCommand: (...args) => redisClient.sendCommand(args),
// });

// Limiter estricto para rutas de autenticación
const LOGIN_WINDOW_MS = parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW_MS) || 15 * 60 * 1000; // Por defecto: 15 minutos
const LOGIN_MAX = parseInt(process.env.RATE_LIMIT_LOGIN_MAX) || 5; // Por defecto: 5 intentos

export const loginLimiter = rateLimit({
    // store: store, // Usar memoria por defecto si Redis no está disponible
    windowMs: LOGIN_WINDOW_MS,
    max: LOGIN_MAX,
    message: {
        success: false,
        message: `Demasiados intentos de inicio de sesión. Por favor, inténtelo de nuevo en ${Math.ceil(LOGIN_WINDOW_MS / 60000)} minutos.`
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiter general para el resto de la API
const API_WINDOW_MS = parseInt(process.env.RATE_LIMIT_API_WINDOW_MS) || 15 * 60 * 1000; // Por defecto: 15 minutos
const API_MAX = parseInt(process.env.RATE_LIMIT_API_MAX) || 100; // Por defecto: 100 peticiones

export const apiLimiter = rateLimit({
    // store: store, // Usar memoria por defecto si Redis no está disponible
    windowMs: API_WINDOW_MS,
    max: API_MAX,
    message: {
        success: false,
        message: 'Has excedido el límite de peticiones. Por favor, inténtelo más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
