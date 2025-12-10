import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import ListaTrabajadores from './chat/ListaTrabajadores';
import VentanaChat from './chat/VentanaChat';
import { reproducirNotificacion } from '../../utils/soundUtils';
import '../../styles/admin/ChatInterno.css';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ChatInterno = ({ socketInstance, mapaNoLeidosExterno, onMarcarLeidoExterno }) => {
  const { usuario } = useAuth();
  const [socket, setSocket] = useState(socketInstance || null);
  const [trabajadores, setTrabajadores] = useState([]);
  const [conversacionActiva, setConversacionActiva] = useState(null);
  const [conversaciones, setConversaciones] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [trabajadoresOnline, setTrabajadoresOnline] = useState(new Set());

  // Mapa local de no leídos (fallback si no hay externo)
  const [mapaNoLeidosLocal, setMapaNoLeidosLocal] = useState({});

  // Usar el externo o el local
  const mapaNoLeidos = mapaNoLeidosExterno || mapaNoLeidosLocal;

  useEffect(() => {
    // Si no hay externo, cargar localmente
    if (!mapaNoLeidosExterno && usuario?._id) {
      cargarNoLeidos();
    }
  }, [usuario?._id]);

  useEffect(() => {
    // Si viene por prop, usarlo. Si no (AdminLayout?), conectar uno nuevo.
    if (socketInstance) {
      setSocket(socketInstance);
      setupSocketListeners(socketInstance);
    } else if (usuario?._id && !socket) {
      const newSocket = inicializarSocket();
      setupSocketListeners(newSocket);
    }

    cargarTrabajadores();

    return () => {
      // Solo desconectar si lo creamos nosotros
      if (!socketInstance && socket) {
        socket.disconnect();
      }
    };
  }, [usuario?._id, socketInstance]);

  const cargarNoLeidos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${SOCKET_URL}/api/mensajes/no-leidos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMapaNoLeidosLocal(data.data || {});
      }
    } catch (error) {
      console.error('Error cargando no leidos en chat:', error);
    }
  };

  const setupSocketListeners = (currentSocket) => {
    if (!currentSocket) return;

    // Remover listeners anteriores para evitar duplicados
    currentSocket.off('trabajadores-online');
    currentSocket.off('mensaje-privado');
    currentSocket.off('escribiendo');
    currentSocket.off('mensaje-entregado');
    currentSocket.off('mensajes-leidos');

    currentSocket.on('trabajadores-online', (listaOnline) => {
      setTrabajadoresOnline(new Set(listaOnline));
    });

    currentSocket.on('mensaje-privado', (mensaje) => {
      const conversacionKey = mensaje.de === usuario._id ? mensaje.para : mensaje.de;

      setConversaciones(prev => ({
        ...prev,
        [conversacionKey]: [...(prev[conversacionKey] || []), mensaje]
      }));

      // Si leo el mensaje inmediatamente (estoy en la conversación)
      if (conversacionActiva?.usuario?._id === conversacionKey) {
        // Emitir que lo he recibido/leído pero eso lo maneja "abrirConversacion" o "useEffect"
        // Mínimo emitir recibido
        currentSocket.emit('mensaje-recibido', { mensajeId: mensaje.id, de: mensaje.de });
      } else {
        // Si NO estoy en la conversación, incrementar no leídos
        // Si tengo handler externo (Layout), él lo hace. Si no, lo hago yo local
        if (!mapaNoLeidosExterno) {
          setMapaNoLeidosLocal(prev => ({
            ...prev,
            [conversacionKey]: (prev[conversacionKey] || 0) + 1
          }));
        }
        reproducirNotificacion();
      }
    });

    currentSocket.on('mensaje-entregado', ({ mensajeId }) => {
      // Actualizar estado 'entregado' localmente
      setConversaciones(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(key => {
          newState[key] = newState[key].map(m =>
            m._id === mensajeId || m.id === mensajeId ? { ...m, entregado: true } : m
          );
        });
        return newState;
      });
    });

    currentSocket.on('mensajes-leidos', ({ para }) => {
      // Marcar todos mis mensajes enviados a 'para' como leídos
      setConversaciones(prev => {
        const msgs = prev[para] || [];
        const updatedMsgs = msgs.map(m =>
          m.de === usuario._id ? { ...m, leido: true, entregado: true } : m
        );
        return { ...prev, [para]: updatedMsgs };
      });
    });

    currentSocket.on('escribiendo', ({ userId, nombre }) => {
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
  };

  const inicializarSocket = () => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('trabajador-online', {
        userId: usuario._id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol
      });
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
        setTrabajadores((data.data || []).filter(t => t._id !== usuario._id));
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

    // Limpiar no leídos (Externo o Local)
    if (onMarcarLeidoExterno) {
      onMarcarLeidoExterno(trabajador._id);
    } else {
      setMapaNoLeidosLocal(prev => {
        const copy = { ...prev };
        delete copy[trabajador._id];
        return copy;
      });
    }

    if (!conversaciones[trabajador._id]) {
      await cargarHistorial(trabajador._id);
    } else {
      // Si ya tengo historial, marcar como leídos localmente y en servidor
      if (socket) {
        socket.emit('marcar-leidos', { de: trabajador._id, para: usuario._id });
      }
      // Actualizar UI local inmediatamente
      setConversaciones(prev => {
        const msgs = prev[trabajador._id] || [];
        if (msgs.some(m => !m.leido && m.de === trabajador._id)) {
          return {
            ...prev,
            [trabajador._id]: msgs.map(m => m.de === trabajador._id ? { ...m, leido: true } : m)
          };
        }
        return prev;
      });
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
        // Al cargar historial, ya se marcaron como leídos en backend.
        // Notificar al otro usuario vía socket si está, opcional.
        if (socket) {
          socket.emit('marcar-leidos', { de: trabajadorId, para: usuario._id });
        }
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const enviarMensaje = (texto) => {
    if (!socket || !conversacionActiva || !texto.trim() || !usuario?._id) return;

    const mensaje = {
      de: usuario._id,
      para: conversacionActiva.usuario._id,
      texto: texto.trim(),
      nombreEmisor: usuario.nombre,
      timestamp: new Date().toISOString()
      // entregado: false (default en server)
    };

    socket.emit('mensaje-privado', mensaje);

    // Actualización optimista
    const conversacionKey = conversacionActiva.usuario._id;
    setConversaciones(prev => ({
      ...prev,
      [conversacionKey]: [...(prev[conversacionKey] || []), { ...mensaje, _id: 'temp-' + Date.now(), entregado: false, leido: false }]
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

  // Ordenar trabajadores: Primero con mensajes no leídos, luego por última actividad, luego alfabético
  const trabajadoresOrdenados = [...trabajadores].sort((a, b) => {
    const aId = a._id;
    const bId = b._id;

    const aNoLeidos = mapaNoLeidos[aId] || 0;
    const bNoLeidos = mapaNoLeidos[bId] || 0;

    // 1. Prioridad: Mensajes no leídos
    if (aNoLeidos > 0 && bNoLeidos === 0) return -1;
    if (bNoLeidos > 0 && aNoLeidos === 0) return 1;

    // 2. Prioridad: Último mensaje (TIMESTAMP)
    const aMsgs = conversaciones[aId] || [];
    const bMsgs = conversaciones[bId] || [];
    const aLast = aMsgs.length > 0 ? new Date(aMsgs[aMsgs.length - 1].timestamp).getTime() : 0;
    const bLast = bMsgs.length > 0 ? new Date(bMsgs[bMsgs.length - 1].timestamp).getTime() : 0;

    if (aLast !== bLast) return bLast - aLast; // Más reciente primero

    // 3. Alfabético
    return a.nombre.localeCompare(b.nombre);
  });

  const trabajadoresFiltrados = trabajadoresOrdenados.filter(t =>
    t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    t.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (!usuario?._id) return <div className="chat-interno-container">Cargando...</div>;

  return (
    <div className="chat-interno-container">
      <ListaTrabajadores
        trabajadores={trabajadoresFiltrados}
        trabajadoresOnline={trabajadoresOnline}
        conversacionActiva={conversacionActiva}
        conversaciones={conversaciones}
        mapaNoLeidos={mapaNoLeidos}
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
