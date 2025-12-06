import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProductosList from '../cliente/ProductosList';
import ProductosAdmin from './ProductosAdmin';
import RegisterAdmin from './RegisterAdmin';
import ChatInterno from './ChatInterno';
import DashboardAdmin from './DashboardAdmin';
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
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        cambiarVista('chat');
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
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                ADMIN
              </span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${vistaActual === 'dashboard' ? 'active' : ''}`}
            onClick={() => cambiarVista('dashboard')}
            title="Alt + D"
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </span>
            <span className="nav-text">Dashboard</span>
            <span className="nav-shortcut">Alt+D</span>
          </button>

          <button
            className={`nav-item ${vistaActual === 'productos' ? 'active' : ''}`}
            onClick={() => cambiarVista('productos')}
            title="Alt + P"
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </span>
            <span className="nav-text">Gestión Productos</span>
            <span className="nav-shortcut">Alt+P</span>
          </button>
          
          <button
            className={`nav-item ${vistaActual === 'catalogo' ? 'active' : ''}`}
            onClick={() => cambiarVista('catalogo')}
            title="Alt + C"
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </span>
            <span className="nav-text">Ver Catálogo</span>
            <span className="nav-shortcut">Alt+C</span>
          </button>

          <button
            className={`nav-item ${vistaActual === 'pedidos' ? 'active' : ''}`}
            onClick={() => cambiarVista('pedidos')}
            title="Alt + O"
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </span>
            <span className="nav-text">Mis Pedidos</span>
            <span className="nav-shortcut">Alt+O</span>
          </button>
          
          <button
            className={`nav-item ${vistaActual === 'chat' ? 'active' : ''}`}
            onClick={() => cambiarVista('chat')}
            title="Alt + M"
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </span>
            <span className="nav-text">Mensajes</span>
            {notificaciones > 0 && (
              <span className="nav-badge">{notificaciones}</span>
            )}
            <span className="nav-shortcut">Alt+M</span>
          </button>

          <div className="nav-divider"></div>
          
          <button
            className="nav-item"
            onClick={() => setMostrarModalRegistro(true)}
            title="Alt + U"
          >
            <span className="nav-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </span>
            <span className="nav-text">Registrar Usuario</span>
            <span className="nav-shortcut">Alt+U</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={logout}>
            <span className="logout-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ✅ Contenido con clase de carga */}
      <main className={`admin-content ${cargandoVista ? 'loading' : ''}`}>
        {vistaActual === 'dashboard' && <DashboardAdmin />}
        {vistaActual === 'productos' && <ProductosAdmin />}
        {vistaActual === 'catalogo' && (
          <>
            <div className="content-header">
              <h1>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
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
        {vistaActual === 'chat' && <ChatInterno />}
      </main>

      {mostrarModalRegistro && (
        <RegisterAdmin onClose={() => setMostrarModalRegistro(false)} />
      )}
    </div>
  );
};

export default AdminLayout;
