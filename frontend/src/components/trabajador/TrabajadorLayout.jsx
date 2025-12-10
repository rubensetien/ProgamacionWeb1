import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, LogOut, MessageSquare, Home } from 'lucide-react';
import io from 'socket.io-client';
import TrabajadorTienda from './TrabajadorTienda';
import TrabajadorObrador from './TrabajadorObrador';
import TrabajadorOficina from './TrabajadorOficina';
import RepartidorDashboard from './RepartidorDashboard';
import MisTurnos from './MisTurnos';
import ChatInterno from '../admin/ChatInterno';
import '../../styles/trabajador/TrabajadorLayout.css';
import '../../styles/admin/AdminLayout.css';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TrabajadorLayout = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [vistaActual, setVistaActual] = useState('dashboard');
  const [mapaNoLeidos, setMapaNoLeidos] = useState({});
  const socketRef = useRef(null);

  // Determinar tipo de trabajador
  const tipoTrabajador = usuario?.tipoTrabajador || usuario?.ubicacionAsignada?.tipo;

  useEffect(() => {
    // Inicializar Socket y cargar notificaciones
    if (usuario?._id) {
      cargarNoLeidos();

      const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true
      });

      newSocket.on('connect', () => {
        console.log('🟢 Layout: Conectado al socket');
        newSocket.emit('trabajador-online', {
          userId: usuario._id,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol
        });
      });

      // Escuchar nuevos mensajes para incrementar contador
      newSocket.on('mensaje-privado', (mensaje) => {
        // Incrementar contador para el emisor
        const emisorId = mensaje.de;
        setMapaNoLeidos(prev => ({
          ...prev,
          [emisorId]: (prev[emisorId] || 0) + 1
        }));
        // Reproducir sonido si no estoy en el chat
        if (vistaActual !== 'chat') {
          // reproducirNotificacion(); // Si tienes el import
        }
      });

      socketRef.current = newSocket;

      return () => {
        newSocket.disconnect();
      };
    }
  }, [usuario?._id]);

  const cargarNoLeidos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${SOCKET_URL}/api/mensajes/no-leidos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMapaNoLeidos(data.data || {});
      }
    } catch (error) {
      console.error('Error cargando no leidos:', error);
    }
  };

  const handleMarcarLeido = (idEmisor) => {
    setMapaNoLeidos(prev => {
      const nuevo = { ...prev };
      delete nuevo[idEmisor];
      return nuevo;
    });
  };

  // Calcular total para el badge principal
  const totalNoLeidos = Object.values(mapaNoLeidos).reduce((a, b) => a + b, 0);

  const renderDashboard = () => {
    switch (tipoTrabajador) {
      case 'tienda': return <TrabajadorTienda />;
      case 'obrador': return <TrabajadorObrador />;
      case 'oficina': return <TrabajadorOficina />;
      case 'repartidor': return <RepartidorDashboard />;
      default: return (
        <div className="sin-asignacion">
          <h2>⚠️ Sin Asignación</h2>
          <p>No tienes una ubicación asignada. Contacta con el administrador.</p>
        </div>
      );
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" style={{ background: '#1e293b' }}>
        <div className="sidebar-header">
          <div className="logo-container" onClick={() => navigate('/')} title="Ir al Inicio" style={{ cursor: 'pointer', marginBottom: '20px' }}>
            <img
              src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
              alt="REGMA"
              className="logo-oficial"
            />
          </div>

          <div className="admin-info" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
            <div className="admin-avatar">
              <span className="avatar-letter">{usuario?.nombre?.charAt(0).toUpperCase() || 'T'}</span>
            </div>
            <div className="admin-details">
              <p className="admin-nombre" style={{ color: '#f8fafc', fontWeight: 600 }}>{usuario?.nombre}</p>
              <span className="admin-badge" style={{
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                marginTop: '4px'
              }}>
                {tipoTrabajador ? tipoTrabajador.toUpperCase() : 'TRABAJADOR'}
              </span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`admin-nav-item ${vistaActual === 'dashboard' ? 'active' : ''}`}
            onClick={() => setVistaActual('dashboard')}
          >
            <span className="nav-icon"><LayoutDashboard size={20} /></span>
            <span className="nav-text">Dashboard</span>
          </button>

          <button
            className={`admin-nav-item ${vistaActual === 'turnos' ? 'active' : ''}`}
            onClick={() => setVistaActual('turnos')}
          >
            <span className="nav-icon"><Calendar size={20} /></span>
            <span className="nav-text">Mis Turnos</span>
          </button>

          <button
            className={`admin-nav-item ${vistaActual === 'chat' ? 'active' : ''}`}
            onClick={() => setVistaActual('chat')}
            style={{ position: 'relative' }}
          >
            <span className="nav-icon"><MessageSquare size={20} /></span>
            <span className="nav-text">Chat Equipo</span>
            {totalNoLeidos > 0 && vistaActual !== 'chat' && (
              <span className="nav-badge" style={{
                position: 'absolute',
                right: '10px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {totalNoLeidos}
              </span>
            )}
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={logout}>
            <span className="logout-icon"><LogOut size={20} /></span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="admin-content">
        {vistaActual === 'dashboard' && renderDashboard()}
        {vistaActual === 'turnos' && <MisTurnos />}
        {/* Pass socket instance and unread map/handler to ChatInterno */}
        {vistaActual === 'chat' && (
          <ChatInterno
            socketInstance={socketRef.current}
            mapaNoLeidosExterno={mapaNoLeidos}
            onMarcarLeidoExterno={handleMarcarLeido}
          />
        )}
      </main>
    </div>
  );
};

export default TrabajadorLayout;
