import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import ListaTrabajadores from './chat/ListaTrabajadores';
import VentanaChat from './chat/VentanaChat';
import { reproducirNotificacion } from '../../utils/soundUtils';
import '../../styles/admin/ChatInterno.css';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ChatInterno = () => {
  const { usuario } = useAuth();
  const [socket, setSocket] = useState(null);
  const [trabajadores, setTrabajadores] = useState([]);
  const [conversacionActiva, setConversacionActiva] = useState(null);
  const [conversaciones, setConversaciones] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [trabajadoresOnline, setTrabajadoresOnline] = useState(new Set());

  useEffect(() => {
    // ⚠️ NO CONECTAR SI NO HAY USUARIO
    if (!usuario?._id) {
      console.warn('⚠️ ChatInterno: Esperando usuario...');
      return;
    }

    cargarTrabajadores();
    const newSocket = inicializarSocket();

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [usuario?._id]); // Solo ejecutar cuando el _id cambie

  const inicializarSocket = () => {
    if (!usuario?._id) {
      console.error('❌ No se puede inicializar socket sin usuario._id');
      return null;
    }

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🟢 Conectado al chat interno');
      newSocket.emit('trabajador-online', {
        userId: usuario._id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Error de conexión Socket.IO:', error.message);
    });

    newSocket.on('trabajadores-online', (listaOnline) => {
      setTrabajadoresOnline(new Set(listaOnline));
    });

    newSocket.on('mensaje-privado', (mensaje) => {
      const conversacionKey = mensaje.de === usuario._id ? mensaje.para : mensaje.de;
      
      setConversaciones(prev => ({
        ...prev,
        [conversacionKey]: [...(prev[conversacionKey] || []), mensaje]
      }));

      if (conversacionActiva?.usuario?._id !== conversacionKey) {
        reproducirNotificacion();
        
        if (Notification.permission === 'granted') {
          new Notification(`Mensaje de ${mensaje.nombreEmisor}`, {
            body: mensaje.texto,
            icon: '💬'
          });
        }
      }
    });

    newSocket.on('escribiendo', ({ userId, nombre }) => {
      if (conversacionActiva?.usuario?._id === userId) {
        setConversacionActiva(prev => ({
          ...prev,
          escribiendo: true,
          nombreEscribiendo: nombre
        }));
        
        setTimeout(() => {
          setConversacionActiva(prev => ({
            ...prev,
            escribiendo: false
          }));
        }, 3000);
      }
    });

    return newSocket;
  };

  const cargarTrabajadores = async () => {
    if (!usuario?._id) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${SOCKET_URL}/api/usuarios/trabajadores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const trabajadoresFiltrados = (data.data || []).filter(
          t => t._id !== usuario._id
        );
        setTrabajadores(trabajadoresFiltrados);
      }
    } catch (error) {
      console.error('Error cargando trabajadores:', error);
    }
  };

  const abrirConversacion = async (trabajador) => {
    setConversacionActiva({
      usuario: trabajador,
      escribiendo: false
    });

    if (!conversaciones[trabajador._id]) {
      await cargarHistorial(trabajador._id);
    }
  };

  const cargarHistorial = async (trabajadorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${SOCKET_URL}/api/mensajes/historial/${trabajadorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setConversaciones(prev => ({
          ...prev,
          [trabajadorId]: data.data || []
        }));
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const enviarMensaje = (texto) => {
    if (!socket || !conversacionActiva || !texto.trim() || !usuario?._id) {
      return;
    }

    const mensaje = {
      de: usuario._id,
      para: conversacionActiva.usuario._id,
      texto: texto.trim(),
      nombreEmisor: usuario.nombre,
      timestamp: new Date().toISOString()
    };

    socket.emit('mensaje-privado', mensaje);

    const conversacionKey = conversacionActiva.usuario._id;
    setConversaciones(prev => ({
      ...prev,
      [conversacionKey]: [...(prev[conversacionKey] || []), mensaje]
    }));
  };

  const notificarEscribiendo = () => {
    if (socket && conversacionActiva && usuario?._id) {
      socket.emit('escribiendo', {
        userId: usuario._id,
        nombre: usuario.nombre,
        para: conversacionActiva.usuario._id
      });
    }
  };

  const trabajadoresFiltrados = trabajadores.filter(t => 
    t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Mostrar loading mientras carga el usuario
  if (!usuario?._id) {
    return (
      <div className="chat-interno-container">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          fontSize: '18px',
          color: '#7f8c8d'
        }}>
          Cargando chat...
        </div>
      </div>
    );
  }

  return (
    <div className="chat-interno-container">
      <ListaTrabajadores
        trabajadores={trabajadoresFiltrados}
        trabajadoresOnline={trabajadoresOnline}
        conversacionActiva={conversacionActiva}
        conversaciones={conversaciones}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        onSeleccionarTrabajador={abrirConversacion}
      />

      <VentanaChat
        conversacionActiva={conversacionActiva}
        mensajes={conversaciones[conversacionActiva?.usuario?._id] || []}
        usuarioActual={usuario}
        onEnviarMensaje={enviarMensaje}
        onEscribiendo={notificarEscribiendo}
      />
    </div>
  );
};

export default ChatInterno;
