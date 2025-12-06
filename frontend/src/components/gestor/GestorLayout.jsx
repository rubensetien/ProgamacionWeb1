import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PanelTienda from './PanelTienda';
import SolicitudStock from './SolicitudStock';
import PedidosTienda from './PedidosTienda';
import '../../styles/gestor/GestorLayout.css';

const GestorLayout = () => {
  const { logout, usuario } = useAuth();
  const [vistaActual, setVistaActual] = useState('panel');

  return (
    <div className="gestor-layout">
      {/* Sidebar */}
      <aside className="gestor-sidebar">
        <div className="sidebar-header">
          {/* Logo REGMA */}
          <div className="logo-container">
            <img 
              src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png" 
              alt="REGMA" 
              className="logo-oficial"
            />
          </div>
          
          {/* Info del Gestor */}
          <div className="gestor-info">
            <div className="gestor-avatar">
              {usuario?.nombre?.charAt(0).toUpperCase() || 'G'}
            </div>
            <div className="gestor-details">
              <p className="gestor-nombre">{usuario?.nombre || 'Gestor'}</p>
              <span className="gestor-badge">GESTOR DE TIENDA</span>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${vistaActual === 'panel' ? 'active' : ''}`}
            onClick={() => setVistaActual('panel')}
          >
            <span className="nav-icon">🏪</span>
            <span className="nav-text">Panel Tienda</span>
          </button>
          
          <button
            className={`nav-item ${vistaActual === 'pedidos' ? 'active' : ''}`}
            onClick={() => setVistaActual('pedidos')}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-text">Pedidos</span>
          </button>
          
          <button
            className={`nav-item ${vistaActual === 'stock' ? 'active' : ''}`}
            onClick={() => setVistaActual('stock')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Solicitar Stock</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={logout}>
            <span className="logout-icon">🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="gestor-content">
        <div className="content-header">
          <h1>
            {vistaActual === 'panel' && '🏪 Panel de Tienda'}
            {vistaActual === 'pedidos' && '📦 Gestión de Pedidos'}
            {vistaActual === 'stock' && '📊 Solicitud de Stock'}
          </h1>
          <p className="content-subtitle">
            {vistaActual === 'panel' && 'Vista general de tu tienda'}
            {vistaActual === 'pedidos' && 'Gestiona los pedidos de tus clientes'}
            {vistaActual === 'stock' && 'Solicita productos al obrador'}
          </p>
        </div>
        
        <div className="content-body">
          {vistaActual === 'panel' && <PanelTienda />}
          {vistaActual === 'pedidos' && <PedidosTienda />}
          {vistaActual === 'stock' && <SolicitudStock />}
        </div>
      </main>
    </div>
  );
};

export default GestorLayout;
