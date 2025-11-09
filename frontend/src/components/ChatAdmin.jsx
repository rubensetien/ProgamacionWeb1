import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { reproducirNotificacion } from '../utils/soundUtils';
import '../styles/Chat.css';

const ChatAdmin = () => {
   const { usuario, API_URL } = useAuth();
   const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const [socket, setSocket] = useState(null);
  const [salasActivas, setSalasActivas] = useState([]);
  const [salaSeleccionada, setSalaSeleccionada] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const [totalMensajesSinLeer, setTotalMensajesSinLeer] = useState(0);
  const mensajesEndRef = useRef(null);

  // 🔔 Solicitar permiso para notificaciones al montar
 useEffect(() => {
  const newSocket = io(SOCKET_URL);
  setSocket(newSocket);

  newSocket.on('connect', () => {
    console.log('Admin conectado al servidor de chat');
    newSocket.emit('identificar', {
      userId: usuario._id || usuario.email,
      email: usuario.email,
      role: 'admin'
    });
  });

  newSocket.on('lista-salas', (salas) => {
    console.log('📋 Salas recibidas:', salas);
    setSalasActivas(salas);
    
    // Calcular total de mensajes sin leer
    const total = salas.reduce((acc, sala) => acc + (sala.mensajesSinLeer || 0), 0);
    setTotalMensajesSinLeer(total);
  });

  newSocket.on('nueva-solicitud-chat', ({ userId, email, mensajesSinLeer }) => {
    console.log('🆕 Nueva solicitud de chat:', userId, email);
    setSalasActivas((prev) => {
      // Evitar duplicados
      const existe = prev.find(s => s.userId === userId);
      if (existe) return prev;
      return [...prev, { userId, email, mensajesSinLeer: mensajesSinLeer || 0 }];
    });
    
    // 🔊 Reproducir sonido de notificación
    reproducirNotificacion();
    
    // 🔔 Notificación del navegador
    if (Notification.permission === 'granted') {
      new Notification('Nueva solicitud de chat', {
        body: `${email} quiere iniciar un chat`,
        icon: '🍦',
        tag: 'nueva-solicitud',
        requireInteraction: true
      });
    }
  });

  newSocket.on('historial-mensajes', ({ userId, messages }) => {
    console.log('📜 Historial recibido para:', userId, messages);
    if (salaSeleccionada === userId) {
      setMensajes(messages);
    }
  });

  newSocket.on('nuevo-mensaje', (mensaje) => {
    console.log('📨 Nuevo mensaje recibido:', mensaje);
    
    if (salaSeleccionada === mensaje.userId) {
      // Mensaje en sala activa - solo agregar a la lista
      setMensajes((prev) => [...prev, mensaje]);
    } else {
      // Mensaje en otra sala - incrementar contador + notificar
      setSalasActivas((prev) =>
        prev.map((sala) =>
          sala.userId === mensaje.userId
            ? { ...sala, mensajesSinLeer: (sala.mensajesSinLeer || 0) + 1 }
            : sala
        )
      );
      
      // 🔊 Reproducir sonido SOLO si no es el mensaje del admin mismo
      if (mensaje.emisor !== 'admin') {
        reproducirNotificacion();
        
        // 🔔 Notificación del navegador
        if (Notification.permission === 'granted') {
          const sala = salasActivas.find(s => s.userId === mensaje.userId);
          new Notification(`Nuevo mensaje de ${sala?.email || 'Usuario'}`, {
            body: mensaje.texto.length > 50 
              ? mensaje.texto.substring(0, 50) + '...' 
              : mensaje.texto,
            icon: '🍦',
            tag: `mensaje-${mensaje.userId}`
          });
        }
      }
    }
  });

  newSocket.on('nuevo-mensaje-sin-leer', ({ userId, email, mensaje }) => {
    console.log('📬 Nuevo mensaje sin leer:', userId, email);
    
    setSalasActivas((prev) => {
      const salaExiste = prev.find(s => s.userId === userId);
      if (salaExiste) {
        return prev.map((sala) =>
          sala.userId === userId
            ? { ...sala, mensajesSinLeer: (sala.mensajesSinLeer || 0) + 1 }
            : sala
        );
      } else {
        return [...prev, { userId, email, mensajesSinLeer: 1 }];
      }
    });
    
    // 🔊 Reproducir sonido
    reproducirNotificacion();
    
    // 🔔 Notificación del navegador
    if (Notification.permission === 'granted') {
      new Notification(`Mensaje sin leer de ${email}`, {
        body: mensaje?.texto || 'Tienes un nuevo mensaje',
        icon: '🍦',
        tag: `sin-leer-${userId}`
      });
    }
  });

  newSocket.on('mensajes-leidos', ({ userId }) => {
    setSalasActivas((prev) =>
      prev.map((sala) =>
        sala.userId === userId
          ? { ...sala, mensajesSinLeer: 0 }
          : sala
      )
    );
  });

  newSocket.on('usuario-escribiendo', ({ userId }) => {
    if (salaSeleccionada === userId) {
      setEscribiendo(true);
      setTimeout(() => setEscribiendo(false), 3000);
    }
  });

  newSocket.on('chat-cerrado', ({ userId }) => {
    setSalasActivas((prev) => prev.filter((sala) => sala.userId !== userId));
    if (salaSeleccionada === userId) {
      setSalaSeleccionada(null);
      setMensajes([]);
    }
  });

  return () => {
    console.log('🔌 Desconectando socket admin');
    newSocket.disconnect();
  };
}, [usuario, salaSeleccionada]); // ✅ SOLO usuario y salaSeleccionada
  // Recalcular total de mensajes sin leer cuando cambien las salas
  useEffect(() => {
    const total = salasActivas.reduce((acc, sala) => acc + (sala.mensajesSinLeer || 0), 0);
    setTotalMensajesSinLeer(total);
  }, [salasActivas]);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // 🔔 Manejar click en notificaciones del navegador
  useEffect(() => {
    const handleNotificationClick = (event) => {
      if (event.notification.data?.userId) {
        // Abrir/enfocar la ventana y seleccionar el chat
        window.focus();
        seleccionarSala(event.notification.data.userId);
      }
    };

    if ('Notification' in window) {
      // Escuchar clicks en notificaciones (solo funciona en algunos navegadores)
      navigator.serviceWorker?.ready.then((registration) => {
        registration.addEventListener('notificationclick', handleNotificationClick);
      });
    }

    return () => {
      navigator.serviceWorker?.ready.then((registration) => {
        registration.removeEventListener('notificationclick', handleNotificationClick);
      });
    };
  }, []);

  const seleccionarSala = (userId) => {
    setSalaSeleccionada(userId);
    setMensajes([]);
    
    // Obtener mensajes sin leer antes de resetear
    const sala = salasActivas.find(s => s.userId === userId);
    const mensajesSinLeerSala = sala?.mensajesSinLeer || 0;
    
    // Resetear mensajes sin leer de esta sala
    setSalasActivas((prev) =>
      prev.map((sala) =>
        sala.userId === userId ? { ...sala, mensajesSinLeer: 0 } : sala
      )
    );
    
    // Decrementar total
    setTotalMensajesSinLeer(prev => Math.max(0, prev - mensajesSinLeerSala));
    
    if (socket) {
      socket.emit('admin-unirse-chat', { userId });
    }
  };

  const enviarMensaje = (e) => {
    e.preventDefault();
    if (inputMensaje.trim() && socket && salaSeleccionada) {
      socket.emit('enviar-mensaje', {
        userId: salaSeleccionada,
        mensaje: inputMensaje,
        emisor: 'admin'
      });
      
      const nuevoMensaje = {
        id: Date.now(),
        texto: inputMensaje,
        emisor: 'admin',
        timestamp: new Date().toISOString(),
        leido: false
      };
      setMensajes((prev) => [...prev, nuevoMensaje]);
      setInputMensaje('');
    }
  };

  const handleInputChange = (e) => {
    setInputMensaje(e.target.value);
    
    if (socket && e.target.value && salaSeleccionada) {
      socket.emit('escribiendo', {
        userId: salaSeleccionada,
        emisor: 'admin'
      });
    }
  };

  const cerrarChat = () => {
    if (socket && salaSeleccionada) {
      socket.emit('cerrar-chat', { userId: salaSeleccionada });
    }
  };

  const salaActual = salasActivas.find(s => s.userId === salaSeleccionada);

  return (
    <div className="chat-admin-container">
      <div className="salas-lista">
        <div className="salas-header">
          <h3>Chats Activos ({salasActivas.length})</h3>
          {totalMensajesSinLeer > 0 && (
            <span className="total-sin-leer-badge" title="Total de mensajes sin leer">
              {totalMensajesSinLeer}
            </span>
          )}
        </div>
        {salasActivas.length === 0 ? (
          <p className="sin-chats">No hay chats activos</p>
        ) : (
          <ul>
            {salasActivas.map((sala) => (
              <li
                key={sala.userId}
                className={`${salaSeleccionada === sala.userId ? 'activa' : ''} ${sala.mensajesSinLeer > 0 ? 'con-sin-leer' : ''}`}
                onClick={() => seleccionarSala(sala.userId)}
              >
                <div className="sala-item">
                  <Avatar email={sala.email} size="small" />
                  <div className="sala-info">
                    <span className="sala-email">{sala.email}</span>
                    {sala.mensajesSinLeer > 0 && (
                      <span className="badge-sin-leer pulse">{sala.mensajesSinLeer}</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="chat-contenido">
        {!salaSeleccionada ? (
          <div className="sin-seleccion">
            <p>Selecciona un chat para comenzar</p>
          </div>
        ) : (
          <>
            <div className="chat-header-admin">
              <div className="chat-header-admin-info">
                <Avatar email={salaActual?.email} size="medium" />
                <h4>Chat con {salaActual?.email}</h4>
              </div>
              <button onClick={cerrarChat} className="btn-cerrar">Cerrar Chat</button>
            </div>
            
            <div className="chat-mensajes">
              {mensajes.map((msg) => (
                <div key={msg.id} className={`mensaje ${msg.emisor}`}>
                  {msg.emisor !== 'sistema' && (
                    <Avatar 
                      email={msg.emisor === 'user' ? salaActual?.email : usuario.email}
                      name={msg.emisor === 'user' ? salaActual?.email : usuario.nombre}
                      size="small"
                      className="mensaje-avatar"
                    />
                  )}
                  <div className="mensaje-contenido">
                    <p>{msg.texto}</p>
                    <div className="mensaje-footer">
                      <span className="mensaje-timestamp">
                        {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {msg.emisor !== 'sistema' && (
                        <span className="mensaje-estado">
                          {msg.leido ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {escribiendo && (
                <div className="escribiendo-indicador">
                  <Avatar email={salaActual?.email} size="small" />
                  <span>Usuario está escribiendo</span>
                  <span className="dots">...</span>
                </div>
              )}
              <div ref={mensajesEndRef} />
            </div>
            
            <form onSubmit={enviarMensaje} className="chat-input-container">
              <Avatar email={usuario.email} name={usuario.nombre} size="small" />
              <input
                type="text"
                value={inputMensaje}
                onChange={handleInputChange}
                placeholder="Escribe un mensaje..."
                className="chat-input"
              />
              <button type="submit" className="btn-enviar">Enviar</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
export default ChatAdmin;