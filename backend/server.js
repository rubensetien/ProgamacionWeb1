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
import Chat from './models/Chat.js';

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

// Socket.IO - Sistema de Chat con Persistencia
const usuariosConectados = new Map();
const salasActivas = new Map();

const crearMensajeSistema = (texto) => ({
  id: Date.now() + Math.random(),
  texto,
  emisor: 'sistema',
  timestamp: new Date().toISOString(),
  leido: true // Los mensajes del sistema se marcan como leídos
});

const guardarMensaje = async (userId, mensaje) => {
  try {
    const resultado = await Chat.findOneAndUpdate(
      { userId },
      {
        $push: { mensajes: mensaje },
        $set: { ultimaActividad: new Date() }
      },
      { upsert: true, new: true }
    );
    return resultado;
  } catch (error) {
    console.error('Error guardando mensaje:', error);
  }
};

const obtenerOCrearChat = async (userId, userEmail) => {
  try {
    let chat = await Chat.findOne({ userId });
    if (!chat) {
      chat = await Chat.create({
        userId,
        userEmail,
        mensajes: [],
        activo: true,
        mensajesSinLeerAdmin: 0,
        mensajesSinLeerUser: 0
      });
    } else {
      if (!chat.activo) {
        chat.activo = true;
        await chat.save();
      }
    }
    return chat;
  } catch (error) {
    console.error('Error obteniendo/creando chat:', error);
    return null;
  }
};

// Contar mensajes sin leer
const contarMensajesSinLeer = (mensajes, emisor) => {
  return mensajes.filter(m => m.emisor === emisor && !m.leido).length;
};

io.on('connection', (socket) => {
  console.log('🔌 Nuevo cliente conectado:', socket.id);

  socket.on('identificar', async ({ userId, email, role }) => {
    usuariosConectados.set(socket.id, { userId, email, role });
    console.log(`✅ Usuario identificado: ${email} (${role})`);

    if (role === 'admin') {
      socket.emit('admin-conectado');
      
      try {
        const chats = await Chat.find({ activo: true }).sort({ ultimaActividad: -1 });
        const salasParaAdmin = chats.map(chat => {
          // Contar mensajes sin leer del usuario
          const mensajesSinLeer = contarMensajesSinLeer(chat.mensajes, 'user');
          
          if (!salasActivas.has(chat.userId)) {
            salasActivas.set(chat.userId, {
              userEmail: chat.userEmail,
              messages: chat.mensajes.map(m => ({
                id: m._id.toString(),
                texto: m.texto,
                emisor: m.emisor,
                timestamp: m.timestamp.toISOString(),
                leido: m.leido
              })),
              userSocketId: null,
              adminSocketId: null,
              mensajesSinLeerAdmin: mensajesSinLeer,
              mensajesSinLeerUser: contarMensajesSinLeer(chat.mensajes, 'admin')
            });
          }
          
          return {
            userId: chat.userId,
            email: chat.userEmail,
            mensajesSinLeer: mensajesSinLeer
          };
        });
        
        socket.emit('lista-salas', salasParaAdmin);
      } catch (error) {
        console.error('Error cargando chats:', error);
      }
    }
  });

  socket.on('solicitar-chat', async ({ userId, email }) => {
    try {
      const chat = await obtenerOCrearChat(userId, email);
      
      if (!salasActivas.has(userId)) {
        const mensajeBienvenida = {
          texto: `${email} se ha conectado al chat`,
          emisor: 'sistema',
          timestamp: new Date(),
          leido: true
        };
        
        await guardarMensaje(userId, mensajeBienvenida);
        
        const mensajesFormateados = chat.mensajes.map(m => ({
          id: m._id.toString(),
          texto: m.texto,
          emisor: m.emisor,
          timestamp: m.timestamp.toISOString(),
          leido: m.leido
        }));
        
        const mensajeBienvenidaFormateado = {
          id: Date.now().toString(),
          texto: mensajeBienvenida.texto,
          emisor: mensajeBienvenida.emisor,
          timestamp: mensajeBienvenida.timestamp.toISOString(),
          leido: true
        };
        
        mensajesFormateados.push(mensajeBienvenidaFormateado);
        
        salasActivas.set(userId, {
          userEmail: email,
          messages: mensajesFormateados,
          userSocketId: socket.id,
          adminSocketId: null,
          mensajesSinLeerAdmin: 0,
          mensajesSinLeerUser: 0
        });
        
        console.log(`💬 Usuario ${email} solicitó chat`);
        
        usuariosConectados.forEach((user, socketId) => {
          if (user.role === 'admin') {
            io.to(socketId).emit('nueva-solicitud-chat', { userId, email, mensajesSinLeer: 0 });
          }
        });
        
        socket.emit('chat-iniciado', { userId, messages: mensajesFormateados });
      } else {
        const sala = salasActivas.get(userId);
        sala.userSocketId = socket.id;
        
        const mensajeReconexion = {
          texto: `${email} se ha reconectado`,
          emisor: 'sistema',
          timestamp: new Date(),
          leido: true
        };
        
        await guardarMensaje(userId, mensajeReconexion);
        
        const mensajeReconexionFormateado = {
          id: Date.now().toString(),
          texto: mensajeReconexion.texto,
          emisor: mensajeReconexion.emisor,
          timestamp: mensajeReconexion.timestamp.toISOString(),
          leido: true
        };
        
        sala.messages.push(mensajeReconexionFormateado);
        
        socket.emit('chat-iniciado', { userId, messages: sala.messages });
        
        if (sala.adminSocketId) {
          io.to(sala.adminSocketId).emit('nuevo-mensaje', { 
            ...mensajeReconexionFormateado, 
            userId 
          });
        }
      }
    } catch (error) {
      console.error('Error en solicitar-chat:', error);
    }
  });

  socket.on('admin-unirse-chat', async ({ userId }) => {
    try {
      const sala = salasActivas.get(userId);
      if (sala) {
        sala.adminSocketId = socket.id;
        
        // Marcar todos los mensajes del usuario como leídos
        await Chat.findOneAndUpdate(
          { userId },
          { 
            $set: { 
              'mensajes.$[elem].leido': true,
              mensajesSinLeerAdmin: 0
            }
          },
          {
            arrayFilters: [{ 'elem.emisor': 'user', 'elem.leido': false }]
          }
        );
        
        // Actualizar mensajes en memoria
        sala.messages = sala.messages.map(m => {
          if (m.emisor === 'user') {
            return { ...m, leido: true };
          }
          return m;
        });
        
        sala.mensajesSinLeerAdmin = 0;
        
        const mensajeAdminUnido = {
          texto: 'Un administrador se ha unido al chat',
          emisor: 'sistema',
          timestamp: new Date(),
          leido: true
        };
        
        await guardarMensaje(userId, mensajeAdminUnido);
        
        const mensajeAdminUnidoFormateado = {
          id: Date.now().toString(),
          texto: mensajeAdminUnido.texto,
          emisor: mensajeAdminUnido.emisor,
          timestamp: mensajeAdminUnido.timestamp.toISOString(),
          leido: true
        };
        
        sala.messages.push(mensajeAdminUnidoFormateado);
        
        if (sala.userSocketId) {
          io.to(sala.userSocketId).emit('admin-unido');
          io.to(sala.userSocketId).emit('nuevo-mensaje', mensajeAdminUnidoFormateado);
        }
        
        socket.emit('historial-mensajes', { userId, messages: sala.messages });
        
        // Notificar a todos los admins que los mensajes fueron leídos
        usuariosConectados.forEach((user, socketId) => {
          if (user.role === 'admin') {
            io.to(socketId).emit('mensajes-leidos', { userId });
          }
        });
        
        console.log(`👨‍💼 Admin se unió al chat con usuario ${sala.userEmail}`);
      }
    } catch (error) {
      console.error('Error en admin-unirse-chat:', error);
    }
  });

  socket.on('enviar-mensaje', async ({ userId, mensaje, emisor }) => {
    try {
      const sala = salasActivas.get(userId);
      if (sala) {
        const mensajeParaGuardar = {
          texto: mensaje,
          emisor,
          timestamp: new Date(),
          leido: false
        };
        
        await guardarMensaje(userId, mensajeParaGuardar);
        
        // Incrementar contador según quién envía
        if (emisor === 'user') {
          await Chat.findOneAndUpdate(
            { userId },
            { $inc: { mensajesSinLeerAdmin: 1 } }
          );
          sala.mensajesSinLeerAdmin++;
        } else {
          await Chat.findOneAndUpdate(
            { userId },
            { $inc: { mensajesSinLeerUser: 1 } }
          );
          sala.mensajesSinLeerUser++;
        }
        
        const mensajeCompleto = {
          id: Date.now().toString(),
          texto: mensaje,
          emisor,
          timestamp: mensajeParaGuardar.timestamp.toISOString(),
          leido: false
        };
        
        sala.messages.push(mensajeCompleto);
        
        if (sala.userSocketId && emisor === 'admin') {
          io.to(sala.userSocketId).emit('nuevo-mensaje', mensajeCompleto);
        }
        
        if (sala.adminSocketId && emisor === 'user') {
          io.to(sala.adminSocketId).emit('nuevo-mensaje', { ...mensajeCompleto, userId });
        }
        
        // Notificar a TODOS los admins sobre el nuevo mensaje sin leer
        if (emisor === 'user') {
          usuariosConectados.forEach((user, socketId) => {
            if (user.role === 'admin' && socketId !== sala.adminSocketId) {
              io.to(socketId).emit('nuevo-mensaje-sin-leer', { 
                userId, 
                email: sala.userEmail,
                mensaje: mensajeCompleto 
              });
            }
          });
        }
        
        console.log(`📨 Mensaje de ${emisor} en chat ${userId}: ${mensaje}`);
      }
    } catch (error) {
      console.error('Error en enviar-mensaje:', error);
    }
  });

  // Marcar mensaje como leído
  socket.on('marcar-como-leido', async ({ userId, mensajeId }) => {
    try {
      await Chat.findOneAndUpdate(
        { userId, 'mensajes._id': mensajeId },
        { 
          $set: { 'mensajes.$.leido': true },
          $inc: { mensajesSinLeerAdmin: -1 }
        }
      );
      
      const sala = salasActivas.get(userId);
      if (sala) {
        const mensaje = sala.messages.find(m => m.id === mensajeId);
        if (mensaje) {
          mensaje.leido = true;
          sala.mensajesSinLeerAdmin = Math.max(0, sala.mensajesSinLeerAdmin - 1);
        }
      }
    } catch (error) {
      console.error('Error marcando mensaje como leído:', error);
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

  socket.on('cerrar-chat', async ({ userId }) => {
    try {
      const sala = salasActivas.get(userId);
      if (sala) {
        await Chat.findOneAndUpdate(
          { userId },
          { activo: false }
        );
        
        if (sala.userSocketId) {
          io.to(sala.userSocketId).emit('chat-cerrado');
        }
        if (sala.adminSocketId) {
          io.to(sala.adminSocketId).emit('chat-cerrado', { userId });
        }
        
        salasActivas.delete(userId);
        console.log(`❌ Chat cerrado con usuario ${userId}`);
      }
    } catch (error) {
      console.error('Error en cerrar-chat:', error);
    }
  });

  socket.on('disconnect', async () => {
    const usuario = usuariosConectados.get(socket.id);
    if (usuario) {
      console.log(`🔌 Usuario desconectado: ${usuario.email}`);
      
      try {
        for (const [userId, sala] of salasActivas.entries()) {
          if (sala.userSocketId === socket.id) {
            const mensajeDesconexion = {
              texto: `${sala.userEmail} se ha desconectado`,
              emisor: 'sistema',
              timestamp: new Date(),
              leido: true
            };
            
            await guardarMensaje(userId, mensajeDesconexion);
            
            const mensajeDesconexionFormateado = {
              id: Date.now().toString(),
              texto: mensajeDesconexion.texto,
              emisor: mensajeDesconexion.emisor,
              timestamp: mensajeDesconexion.timestamp.toISOString(),
              leido: true
            };
            
            sala.messages.push(mensajeDesconexionFormateado);
            sala.userSocketId = null;
            
            if (sala.adminSocketId) {
              io.to(sala.adminSocketId).emit('nuevo-mensaje', { 
                ...mensajeDesconexionFormateado, 
                userId 
              });
              io.to(sala.adminSocketId).emit('usuario-desconectado', { userId });
            }
          }
        }
        
        if (usuario.role === 'admin') {
          for (const [userId, sala] of salasActivas.entries()) {
            if (sala.adminSocketId === socket.id) {
              const mensajeAdminDesconectado = {
                texto: 'El administrador se ha desconectado',
                emisor: 'sistema',
                timestamp: new Date(),
                leido: true
              };
              
              await guardarMensaje(userId, mensajeAdminDesconectado);
              
              const mensajeAdminDesconectadoFormateado = {
                id: Date.now().toString(),
                texto: mensajeAdminDesconectado.texto,
                emisor: mensajeAdminDesconectado.emisor,
                timestamp: mensajeAdminDesconectado.timestamp.toISOString(),
                leido: true
              };
              
              sala.messages.push(mensajeAdminDesconectadoFormateado);
              sala.adminSocketId = null;
              
              if (sala.userSocketId) {
                io.to(sala.userSocketId).emit('admin-desconectado');
                io.to(sala.userSocketId).emit('nuevo-mensaje', mensajeAdminDesconectadoFormateado);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error en disconnect:', error);
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