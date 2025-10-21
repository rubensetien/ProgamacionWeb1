import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import productosRoutes from './routes/productos.js';
import usuariosRoutes from './routes/usuarios.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

app.use('/productos', productosRoutes);
app.use('/usuarios', usuariosRoutes);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Productos funcionando ✅' });
});

// Socket.IO - Sistema de Chat
const usuariosConectados = new Map();
const salasActivas = new Map();

// Función helper para crear mensajes del sistema
const crearMensajeSistema = (texto) => ({
  id: Date.now() + Math.random(),
  texto,
  emisor: 'sistema',
  timestamp: new Date().toISOString()
});

io.on('connection', (socket) => {
  console.log('🔌 Nuevo cliente conectado:', socket.id);

  socket.on('identificar', ({ userId, email, role }) => {
    usuariosConectados.set(socket.id, { userId, email, role });
    console.log(`✅ Usuario identificado: ${email} (${role})`);

    if (role === 'admin') {
      socket.emit('admin-conectado');
      
      const salas = Array.from(salasActivas.entries()).map(([userId, sala]) => ({
        userId,
        email: sala.userEmail,
        mensajesSinLeer: sala.mensajesSinLeerAdmin || 0
      }));
      socket.emit('lista-salas', salas);
    }
  });

  socket.on('solicitar-chat', ({ userId, email }) => {
    if (!salasActivas.has(userId)) {
      // Crear mensaje de sistema de bienvenida
      const mensajeBienvenida = crearMensajeSistema(`${email} se ha conectado al chat`);
      
      salasActivas.set(userId, {
        userEmail: email,
        messages: [mensajeBienvenida],
        userSocketId: socket.id,
        adminSocketId: null,
        mensajesSinLeerAdmin: 0,
        mensajesSinLeerUser: 0
      });
      
      console.log(`💬 Usuario ${email} solicitó chat`);
      
      // Notificar a todos los admins
      usuariosConectados.forEach((user, socketId) => {
        if (user.role === 'admin') {
          io.to(socketId).emit('nueva-solicitud-chat', { userId, email });
        }
      });
      
      socket.emit('chat-iniciado', { userId, messages: [mensajeBienvenida] });
    } else {
      // Reconectar usuario a su sala
      const sala = salasActivas.get(userId);
      sala.userSocketId = socket.id;
      
      // Mensaje de reconexión
      const mensajeReconexion = crearMensajeSistema(`${email} se ha reconectado`);
      sala.messages.push(mensajeReconexion);
      
      socket.emit('chat-iniciado', { userId, messages: sala.messages });
      
      // Notificar al admin si está conectado
      if (sala.adminSocketId) {
        io.to(sala.adminSocketId).emit('nuevo-mensaje', { ...mensajeReconexion, userId });
      }
    }
  });

  socket.on('admin-unirse-chat', ({ userId }) => {
    const sala = salasActivas.get(userId);
    if (sala) {
      sala.adminSocketId = socket.id;
      sala.mensajesSinLeerAdmin = 0;
      
      // Mensaje de sistema: admin se unió
      const mensajeAdminUnido = crearMensajeSistema('Un administrador se ha unido al chat');
      sala.messages.push(mensajeAdminUnido);
      
      // Notificar al usuario
      if (sala.userSocketId) {
        io.to(sala.userSocketId).emit('admin-unido');
        io.to(sala.userSocketId).emit('nuevo-mensaje', mensajeAdminUnido);
      }
      
      socket.emit('historial-mensajes', { userId, messages: sala.messages });
      console.log(`👨‍💼 Admin se unió al chat con usuario ${sala.userEmail}`);
    }
  });

  socket.on('enviar-mensaje', ({ userId, mensaje, emisor }) => {
    const sala = salasActivas.get(userId);
    if (sala) {
      const mensajeCompleto = {
        id: Date.now(),
        texto: mensaje,
        emisor,
        timestamp: new Date().toISOString()
      };
      
      sala.messages.push(mensajeCompleto);
      
      if (sala.userSocketId && emisor === 'admin') {
        io.to(sala.userSocketId).emit('nuevo-mensaje', mensajeCompleto);
        sala.mensajesSinLeerUser++;
      }
      
      if (sala.adminSocketId && emisor === 'user') {
        io.to(sala.adminSocketId).emit('nuevo-mensaje', { ...mensajeCompleto, userId });
        sala.mensajesSinLeerAdmin++;
      }
      
      console.log(`📨 Mensaje de ${emisor} en chat ${userId}: ${mensaje}`);
    }
  });

  socket.on('escribiendo', ({ userId, emisor }) => {
    const sala = salasActivas.get(userId);
    if (sala) {
      if (emisor === 'user' && sala.adminSocketId) {
        io.to(sala.adminSocketId).emit('usuario-escribiendo', { userId });
      } else if (emisor === 'admin' && sala.userSocketId) {
        io.to(sala.userSocketId).emit('admin-escribiendo');
      }
    }
  });

  socket.on('cerrar-chat', ({ userId }) => {
    const sala = salasActivas.get(userId);
    if (sala) {
      if (sala.userSocketId) {
        io.to(sala.userSocketId).emit('chat-cerrado');
      }
      if (sala.adminSocketId) {
        io.to(sala.adminSocketId).emit('chat-cerrado', { userId });
      }
      
      salasActivas.delete(userId);
      console.log(`❌ Chat cerrado con usuario ${userId}`);
    }
  });

  socket.on('disconnect', () => {
    const usuario = usuariosConectados.get(socket.id);
    if (usuario) {
      console.log(`🔌 Usuario desconectado: ${usuario.email}`);
      
      // Si era un usuario normal, notificar en su sala
      salasActivas.forEach((sala, userId) => {
        if (sala.userSocketId === socket.id) {
          const mensajeDesconexion = crearMensajeSistema(`${sala.userEmail} se ha desconectado`);
          sala.messages.push(mensajeDesconexion);
          sala.userSocketId = null;
          
          // Notificar al admin si está conectado
          if (sala.adminSocketId) {
            io.to(sala.adminSocketId).emit('nuevo-mensaje', { ...mensajeDesconexion, userId });
            io.to(sala.adminSocketId).emit('usuario-desconectado', { userId });
          }
        }
      });
      
      // Si era admin
      if (usuario.role === 'admin') {
        salasActivas.forEach((sala) => {
          if (sala.adminSocketId === socket.id) {
            const mensajeAdminDesconectado = crearMensajeSistema('El administrador se ha desconectado');
            sala.messages.push(mensajeAdminDesconectado);
            sala.adminSocketId = null;
            
            if (sala.userSocketId) {
              io.to(sala.userSocketId).emit('admin-desconectado');
              io.to(sala.userSocketId).emit('nuevo-mensaje', mensajeAdminDesconectado);
            }
          }
        });
      }
      
      usuariosConectados.delete(socket.id);
    }
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () =>
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
);