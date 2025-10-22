import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductosList from './ProductosList';
import ChatAdmin from './ChatAdmin';
import '../styles/AdminLayout.css';

const AdminLayout = () => {
  const { logout, usuario } = useAuth();
  const [vistaActual, setVistaActual] = useState('catalogo'); // 'catalogo' o 'chat'

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-icon">🍦</span>
            <h2>Regma Admin</h2>
          </div>
          <div className="admin-info">
            <div className="admin-avatar">
              {usuario?.nombre?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="admin-details">
              <p className="admin-nombre">{usuario?.nombre || 'Administrador'}</p>
              <span className="admin-badge">Admin</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${vistaActual === 'catalogo' ? 'active' : ''}`}
            onClick={() => setVistaActual('catalogo')}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-text">Catálogo</span>
          </button>
          
          <button
            className={`nav-item ${vistaActual === 'chat' ? 'active' : ''}`}
            onClick={() => setVistaActual('chat')}
          >
            <span className="nav-icon">💬</span>
            <span className="nav-text">Chats</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={logout}>
            <span className="logout-icon">🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="admin-content">
        <div className="content-header">
          <h1>
            {vistaActual === 'catalogo' ? '📦 Gestión de Catálogo' : '💬 Gestión de Chats'}
          </h1>
          <p className="content-subtitle">
            {vistaActual === 'catalogo' 
              ? 'Administra los productos de tu catálogo' 
              : 'Responde a las consultas de los usuarios'}
          </p>
        </div>

        <div className="content-body">
          {vistaActual === 'catalogo' ? <ProductosList /> : <ChatAdmin />}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;