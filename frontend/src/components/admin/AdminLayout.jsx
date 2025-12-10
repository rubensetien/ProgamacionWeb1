import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProductosList from '../cliente/ProductosList';
import RegisterAdmin from './RegisterAdmin';
import ChatInterno from './ChatInterno';
import DashboardAdmin from './DashboardAdmin';
import GestionProductos from './gestion/GestionProductos';
import GestionUbicaciones from './gestion/GestionUbicaciones';
import GestionTrabajadores from './gestion/GestionTrabajadores';
import GestionTurnos from './gestion/GestionTurnos'; // ✅ NEW
import PedidosAdmin from './PedidosAdmin';
import '../../styles/admin/AdminLayout.css';

const AdminLayout = () => {
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();
  const [vistaActual, setVistaActual] = useState('dashboard');
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);
  const [notificaciones, setNotificaciones] = useState(0);
  const [cargandoVista, setCargandoVista] = useState(false); // ✅ Estado de carga

  const irAlLanding = () => {
    navigate('/');
  };

  // ✅ Función mejorada para cambiar vista con transición
  const cambiarVista = (nuevaVista) => {
    if (nuevaVista === vistaActual) return;

    setCargandoVista(true);

    // Pequeño delay para transición suave
    setTimeout(() => {
      setVistaActual(nuevaVista);
      setCargandoVista(false);
    }, 150);
  };

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        cambiarVista('dashboard');
      }
      if (e.altKey && e.key === 'p') {
        e.preventDefault();
        cambiarVista('productos');
      }
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        cambiarVista('catalogo');
      }
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        cambiarVista('ubicaciones');
      }
      if (e.altKey && e.key === 'e') {
        e.preventDefault();
        cambiarVista('trabajadores');
      }
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        cambiarVista('chat');
      }
      if (e.altKey && e.key === 'k') { // Usando 'k' para evitar conflicto con 'c' de catálogo
        e.preventDefault();
        cambiarVista('turnos'); // Calendario/Turnos
      }
      if (e.altKey && e.key === 'o') {
        e.preventDefault();
        cambiarVista('pedidos');
      }
      if (e.altKey && e.key === 'u') {
        e.preventDefault();
        setMostrarModalRegistro(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [vistaActual]);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo-container" onClick={irAlLanding} title="Ir al Landing (con sesión abierta)">
            <img
              src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
              alt="REGMA"
              className="logo-oficial"
            />
          </div>

          <div className="admin-info">
            <div className="admin-avatar">
              <span className="avatar-letter">{usuario?.nombre?.charAt(0).toUpperCase() || 'A'}</span>
              <div className="status-indicator"></div>
            </div>
            <div className="admin-details">
              <p className="admin-nombre">{usuario?.nombre || 'Administrador'}</p>
              <span className="admin-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                ADMIN
              </span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`admin-nav-item ${vistaActual === 'dashboard' ? 'active' : ''}`}
            onClick={() => cambiarVista('dashboard')}
            title="Alt + D"
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </span>
            <span className="nav-text">Dashboard</span>
            <span className="nav-shortcut">Alt+D</span>
          </button>

          <button
            className={`admin-nav-item ${vistaActual === 'productos' ? 'active' : ''}`}
            onClick={() => cambiarVista('productos')}
            title="Alt + P"
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </span>
            <span className="nav-text">Gestión Productos</span>
            <span className="nav-shortcut">Alt+P</span>
          </button>

          <button
            className={`admin-nav-item ${vistaActual === 'catalogo' ? 'active' : ''}`}
            onClick={() => cambiarVista('catalogo')}
            title="Alt + C"
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            <span className="nav-text">Ver Catálogo</span>
            <span className="nav-shortcut">Alt+C</span>
          </button>

          <button
            className={`admin-nav-item ${vistaActual === 'ubicaciones' ? 'active' : ''}`}
            onClick={() => cambiarVista('ubicaciones')}
            title="Alt + T"
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18v-8a2 2 0 0 0-2-2h-3v-7a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v7H4a2 2 0 0 0-2 2v8z" />
              </svg>
            </span>
            <span className="nav-text">Gestión Tiendas</span>
            <span className="nav-shortcut">Alt+T</span>
          </button>

          <button
            className={`admin-nav-item ${vistaActual === 'trabajadores' ? 'active' : ''}`}
            onClick={() => cambiarVista('trabajadores')}
            title="Alt + E"
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <span className="nav-text">Gestión Equipo</span>
            <span className="nav-shortcut">Alt+E</span>
          </button>

          <button
            className={`admin-nav-item ${vistaActual === 'turnos' ? 'active' : ''}`}
            onClick={() => cambiarVista('turnos')}
            title="Alt + C"
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <span className="nav-text">Gestión Turnos</span>
            <span className="nav-shortcut">Alt+C</span>
          </button>

          <button
            className={`admin-nav-item ${vistaActual === 'pedidos' ? 'active' : ''}`}
            onClick={() => cambiarVista('pedidos')}
            title="Alt + O"
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </span>
            <span className="nav-text">Mis Pedidos</span>
            <span className="nav-shortcut">Alt+O</span>
          </button>

          <button
            className={`admin-nav-item ${vistaActual === 'chat' ? 'active' : ''}`}
            onClick={() => cambiarVista('chat')}
            title="Alt + M"
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            <span className="nav-text">Mensajes</span>
            {notificaciones > 0 && (
              <span className="nav-badge">{notificaciones}</span>
            )}
            <span className="nav-shortcut">Alt+M</span>
          </button>

          {/* "Registrar Usuario" Link eliminado por redundancia con "Gestión Equipo" */}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={logout}>
            <span className="logout-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ✅ Contenido con clase de carga */}
      <main className={`admin-content ${cargandoVista ? 'loading' : ''}`}>
        {vistaActual === 'dashboard' && <DashboardAdmin />}
        {vistaActual === 'productos' && <GestionProductos />}
        {vistaActual === 'catalogo' && (
          <>
            <div className="content-header">
              <h1>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                Catálogo de Productos
              </h1>
              <p className="content-subtitle">
                Vista de cliente - Aquí puedes realizar compras como administrador
              </p>
            </div>
            <div className="content-body">
              <ProductosList />
            </div>
          </>
        )}
        {vistaActual === 'pedidos' && <PedidosAdmin />}
        {vistaActual === 'ubicaciones' && <GestionUbicaciones />}
        {vistaActual === 'trabajadores' && <GestionTrabajadores />}
        {vistaActual === 'turnos' && <GestionTurnos />}
        {vistaActual === 'chat' && <ChatInterno />}
      </main>

      {mostrarModalRegistro && (
        <RegisterAdmin onClose={() => setMostrarModalRegistro(false)} />
      )}
    </div>
  );
};

export default AdminLayout;
