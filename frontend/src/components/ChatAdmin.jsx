import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import '../styles/Chat.css';

const ChatAdmin = () => {
  const { usuario } = useAuth();
  const [socket, setSocket] = useState(null);
  const [salasActivas, setSalasActivas] = useState([]);
  const [salaSeleccionada, setSalaSeleccionada] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const mensajesEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
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
      setSalasActivas(salas);
    });

    newSocket.on('nueva-solicitud-chat', ({ userId, email }) => {
      setSalasActivas((prev) => [...prev, { userId, email, mensajesSinLeer: 0 }]);
    });

    newSocket.on('historial-mensajes', ({ userId, messages }) => {
      if (salaSeleccionada === userId) {
        setMensajes(messages);
      }
    });

    newSocket.on('nuevo-mensaje', (mensaje) => {
      if (salaSeleccionada === mensaje.userId) {
        setMensajes((prev) => [...prev, mensaje]);
      } else {
        setSalasActivas((prev) =>
          prev.map((sala) =>
            sala.userId === mensaje.userId
              ? { ...sala, mensajesSinLeer: (sala.mensajesSinLeer || 0) + 1 }
              : sala
          )
        );
      }
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
      newSocket.disconnect();
    };
  }, [usuario, salaSeleccionada]);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const seleccionarSala = (userId) => {
    setSalaSeleccionada(userId);
    setMensajes([]);
    
    setSalasActivas((prev) =>
      prev.map((sala) =>
        sala.userId === userId ? { ...sala, mensajesSinLeer: 0 } : sala
      )
    );
    
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
        timestamp: new Date().toISOString()
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
        <h3>Chats Activos ({salasActivas.length})</h3>
        {salasActivas.length === 0 ? (
          <p className="sin-chats">No hay chats activos</p>
        ) : (
          <ul>
            {salasActivas.map((sala) => (
              <li
                key={sala.userId}
                className={salaSeleccionada === sala.userId ? 'activa' : ''}
                onClick={() => seleccionarSala(sala.userId)}
              >
                <div className="sala-item">
                  <Avatar email={sala.email} size="small" />
                  <div className="sala-info">
                    <span className="sala-email">{sala.email}</span>
                    {sala.mensajesSinLeer > 0 && (
                      <span className="badge-sin-leer">{sala.mensajesSinLeer}</span>
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
                    <span className="mensaje-timestamp">
                      {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
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