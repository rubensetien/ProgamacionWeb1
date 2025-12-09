import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);

// ========== CONFIGURACIÓN SOCKET.IO ==========
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://172.18.8.1:5174',
      'http://localhost:3000',
      'https://progamacionweb1-1.onrender.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Importar manejadores de Socket.IO
import('./socketHandlers.js').then(module => module.default(io));

// ========== SEGURIDAD ==========
import helmet from 'helmet';
app.use(helmet());
app.disable('x-powered-by'); // Desactivar cabecera explícitamente como respaldo

// ========== MIDDLEWARES ==========
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://172.18.8.1:5174',
  'http://localhost:3000',
  'https://progamacionweb1-1.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// ========== CONEXIÓN A MONGODB ==========
// ========== CONEXIÓN A MONGODB ==========
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// ========== RUTAS ==========
import authRoutes from './routes/auth.js';
import usuariosRoutes from './routes/usuarios.js';
import productosRoutes from './routes/productos.js';
import categoriasRoutes from './routes/categorias.js';
import variantesRoutes from './routes/variantes.js';
import formatosRoutes from './routes/formatos.js';
import inventarioRoutes from './routes/inventario.js';
import ubicacionesRoutes from './routes/ubicaciones.js';
import pedidosRoutes from './routes/pedidos.js';
import mensajesRoutes from './routes/mensajes.js';
import uploadRoutes from './routes/upload.js';
import carritoRoutes from './routes/carrito.js';

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/variantes', variantesRoutes);
app.use('/api/formatos', formatosRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/ubicaciones', ubicacionesRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/mensajes', mensajesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/carrito', carritoRoutes);

import { apiLimiter } from './middlewares/rateLimit.js';
app.use('/api', apiLimiter);

import turnosRoutes from './routes/turnos.js';
app.use('/api/turnos', turnosRoutes);

import solicitudesRoutes from './routes/solicitudes.js';
app.use('/api/solicitudes', solicitudesRoutes);

import dashboardRoutes from './routes/dashboard.js';
app.use('/api/dashboard', dashboardRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: '🍦 API REGMA funcionando',
    socketConnected: io.engine.clientsCount,
    timestamp: new Date().toISOString()
  });
});

// ========== MANEJO DE ERRORES ==========
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
});

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🔌 Socket.IO listo para conexiones`);
});

export { app, server, io };
