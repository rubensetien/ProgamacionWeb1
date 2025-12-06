import Mensaje from './models/Mensaje.js';

// Mapa de usuarios conectados: { userId: socketId }
const usuariosConectados = new Map();

export default (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado:', socket.id);

    /**
     * Trabajador se identifica al conectarse
     */
    socket.on('trabajador-online', async ({ userId, email, nombre, rol }) => {
      console.log('👤 Trabajador online:', nombre, '- ID:', userId);
      
      // Guardar en el mapa de conectados
      usuariosConectados.set(userId, {
        socketId: socket.id,
        email,
        nombre,
        rol,
        userId
      });

      // Guardar userId en el socket para referencia
      socket.userId = userId;

      // Enviar lista actualizada de usuarios online a todos
      const usuariosOnlineIds = Array.from(usuariosConectados.keys());
      io.emit('trabajadores-online', usuariosOnlineIds);

      console.log(`📊 Usuarios online: ${usuariosConectados.size}`);
    });

    /**
     * Enviar mensaje privado
     */
    socket.on('mensaje-privado', async (mensaje) => {
      try {
        console.log('📨 Mensaje recibido del frontend:', mensaje);
        
        const { de, para, texto, nombreEmisor } = mensaje;

        // ✅ VALIDAR que los campos existen
        if (!de) {
          console.error('❌ ERROR: Campo "de" no existe en el mensaje');
          console.error('📋 Mensaje completo recibido:', JSON.stringify(mensaje, null, 2));
          socket.emit('error-mensaje', {
            success: false,
            message: 'Error: falta el campo "de" (ID del emisor)'
          });
          return;
        }

        if (!para) {
          console.error('❌ ERROR: Campo "para" no existe en el mensaje');
          socket.emit('error-mensaje', {
            success: false,
            message: 'Error: falta el campo "para" (ID del destinatario)'
          });
          return;
        }

        if (!texto || !texto.trim()) {
          console.error('❌ ERROR: Campo "texto" vacío');
          socket.emit('error-mensaje', {
            success: false,
            message: 'Error: el mensaje no puede estar vacío'
          });
          return;
        }

        console.log('✅ Campos validados:', { de, para, texto: texto.substring(0, 20) });

        // Guardar mensaje en la base de datos
        const nuevoMensaje = await Mensaje.create({
          de,
          para,
          texto,
          nombreEmisor: nombreEmisor || 'Usuario',
          timestamp: new Date()
        });

        console.log(`💬 Mensaje guardado en BD: ${nuevoMensaje._id}`);
        console.log(`   De: ${nombreEmisor} (${de})`);
        console.log(`   Para: ${para}`);

        // Enviar al destinatario si está conectado
        const destinatario = usuariosConectados.get(para);
        if (destinatario) {
          io.to(destinatario.socketId).emit('mensaje-privado', {
            ...mensaje,
            id: nuevoMensaje._id,
            timestamp: nuevoMensaje.timestamp
          });
          console.log(`✅ Mensaje enviado a ${destinatario.nombre}`);
        } else {
          console.log(`⚠️ Usuario ${para} no está conectado`);
        }

        // Confirmar al emisor
        socket.emit('mensaje-enviado', {
          success: true,
          mensajeId: nuevoMensaje._id
        });
      } catch (error) {
        console.error('❌ Error enviando mensaje:', error);
        console.error('📋 Stack trace:', error.stack);
        socket.emit('error-mensaje', {
          success: false,
          message: 'Error al enviar el mensaje'
        });
      }
    });

    /**
     * Usuario está escribiendo
     */
    socket.on('escribiendo', ({ userId, nombre, para }) => {
      const destinatario = usuariosConectados.get(para);
      if (destinatario) {
        io.to(destinatario.socketId).emit('escribiendo', {
          userId,
          nombre
        });
      }
    });

    /**
     * Marcar mensajes como leídos
     */
    socket.on('marcar-leidos', async ({ de, para }) => {
      try {
        await Mensaje.updateMany(
          { de, para, leido: false },
          { leido: true }
        );

        // Notificar al emisor que sus mensajes fueron leídos
        const emisor = usuariosConectados.get(de);
        if (emisor) {
          io.to(emisor.socketId).emit('mensajes-leidos', { para });
        }
      } catch (error) {
        console.error('Error marcando mensajes como leídos:', error);
      }
    });

    /**
     * Desconexión
     */
    socket.on('disconnect', () => {
      console.log('🔌 Cliente desconectado:', socket.id);

      // Eliminar del mapa de conectados
      if (socket.userId) {
        usuariosConectados.delete(socket.userId);
        
        // Enviar lista actualizada
        const usuariosOnlineIds = Array.from(usuariosConectados.keys());
        io.emit('trabajadores-online', usuariosOnlineIds);
        
        console.log(`📊 Usuarios online: ${usuariosConectados.size}`);
      }
    });
  });

  // Función auxiliar para obtener usuarios conectados
  io.getUsuariosConectados = () => {
    return Array.from(usuariosConectados.values());
  };
};
