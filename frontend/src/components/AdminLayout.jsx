import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductosList from './ProductosList';
import ChatAdmin from './ChatAdmin';
import RegisterAdmin from './RegisterAdmin';
import '../styles/AdminLayout.css';

const AdminLayout = () => {
  const { logout, usuario } = useAuth();
  const [vistaActual, setVistaActual] = useState('catalogo'); // 'catalogo' | 'chat' | 'registrar'
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);

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

          {/* NUEVO: Botón Registrar Admin */}
          <button
            className="nav-item"
            onClick={() => setMostrarModalRegistro(true)}
          >
            <span className="nav-icon">👨‍💼</span>
            <span className="nav-text">Registrar Admin</span>
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

      {/* Modal de Registro de Admin */}
      {mostrarModalRegistro && (
        <RegisterAdmin onClose={() => setMostrarModalRegistro(false)} />
      )}
    </div>
  );
};

export default AdminLayout;