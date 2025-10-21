import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import '../styles/Chat.css';

const ChatUsuario = () => {
  const { usuario } = useAuth();
  const [socket, setSocket] = useState(null);
  const [chatAbierto, setChatAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [inputMensaje, setInputMensaje] = useState('');
  const [adminConectado, setAdminConectado] = useState(false);
  const [escribiendo, setEscribiendo] = useState(false);
  const mensajesEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Conectado al servidor de chat');
      newSocket.emit('identificar', {
        userId: usuario._id || usuario.email,
        email: usuario.email,
        role: 'user'
      });
    });

    newSocket.on('chat-iniciado', ({ messages }) => {
      if (messages) {
        setMensajes(messages);
      }
    });

    newSocket.on('admin-unido', () => {
      setAdminConectado(true);
    });

    newSocket.on('admin-desconectado', () => {
      setAdminConectado(false);
    });

    newSocket.on('nuevo-mensaje', (mensaje) => {
      setMensajes((prev) => [...prev, mensaje]);
    });

    newSocket.on('admin-escribiendo', () => {
      setEscribiendo(true);
      setTimeout(() => setEscribiendo(false), 3000);
    });

    newSocket.on('chat-cerrado', () => {
      setChatAbierto(false);
      setMensajes([]);
      setAdminConectado(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [usuario]);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const abrirChat = () => {
    setChatAbierto(true);
    socket.emit('solicitar-chat', {
      userId: usuario._id || usuario.email,
      email: usuario.email
    });
  };

  const enviarMensaje = (e) => {
    e.preventDefault();
    if (inputMensaje.trim() && socket) {
      socket.emit('enviar-mensaje', {
        userId: usuario._id || usuario.email,
        mensaje: inputMensaje,
        emisor: 'user'
      });
      
      const nuevoMensaje = {
        id: Date.now(),
        texto: inputMensaje,
        emisor: 'user',
        timestamp: new Date().toISOString()
      };
      setMensajes((prev) => [...prev, nuevoMensaje]);
      setInputMensaje('');
    }
  };

  const handleInputChange = (e) => {
    setInputMensaje(e.target.value);
    
    if (socket && e.target.value) {
      socket.emit('escribiendo', {
        userId: usuario._id || usuario.email,
        emisor: 'user'
      });
    }
  };

  const cerrarChat = () => {
    if (socket) {
      socket.emit('cerrar-chat', { userId: usuario._id || usuario.email });
    }
    setChatAbierto(false);
    setMensajes([]);
    setAdminConectado(false);
  };

  if (!chatAbierto) {
    return (
      <button className="chat-toggle-btn" onClick={abrirChat} title="Abrir chat de soporte">
        💬
      </button>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-info">
          <Avatar email="admin@example.com" name="Soporte" size="small" />
          <div>
            <h3>Chat de Soporte</h3>
            <span className={`status ${adminConectado ? 'online' : 'offline'}`}>
              {adminConectado ? '🟢 Admin conectado' : '🟡 Esperando admin...'}
            </span>
          </div>
        </div>
        <button onClick={cerrarChat} className="btn-cerrar-chat">✕</button>
      </div>
      
      <div className="chat-mensajes">
        {mensajes.length === 0 ? (
          <p className="chat-vacio">Inicia la conversación...</p>
        ) : (
          mensajes.map((msg) => (
            <div key={msg.id} className={`mensaje ${msg.emisor}`}>
              {msg.emisor !== 'sistema' && (
                <Avatar 
                  email={msg.emisor === 'user' ? usuario.email : 'admin@example.com'}
                  name={msg.emisor === 'user' ? usuario.nombre : 'Admin'}
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
          ))
        )}
        {escribiendo && (
          <div className="escribiendo-indicador">
            <Avatar email="admin@example.com" size="small" />
            <span>Admin está escribiendo</span>
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
          placeholder={adminConectado ? "Escribe un mensaje..." : "Escribe tu mensaje (esperando admin)..."}
          className="chat-input"
        />
        <button type="submit" className="btn-enviar">
          Enviar
        </button>
      </form>
    </div>
  );
};

export default ChatUsuario;