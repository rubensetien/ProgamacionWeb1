import { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/admin/DashboardAdmin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    totalProductos: 0,
    productosActivos: 0,
    productosDestacados: 0,
    categorias: 0,
    variantes: 0,
    formatos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.get(`${API_URL}/api/dashboard/stats`, config);
      setStats(res.data.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-admin">
      <div className="dashboard-header">
        <h1>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          Dashboard
        </h1>
        <p className="dashboard-subtitle">
          Panel de control y estadísticas de REGMA
        </p>
      </div>

      <div className="stats-grid">

        {/* USUARIOS */}
        <div className="stat-card usuarios">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Usuarios</p>
            <p className="stat-value">{stats.usuarios?.total || 0}</p>
            <p className="stat-detail">
              {stats.usuarios?.trabajadores || 0} personal, {stats.usuarios?.clientes || 0} clientes
            </p>
          </div>
        </div>

        {/* TIENDAS */}
        <div className="stat-card ubicaciones">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18v-8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8z" />
              <path d="M9 10a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
              <path d="M12 2v4" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Tiendas Activas</p>
            <p className="stat-value">{stats.ubicaciones?.total || 0}</p>
            <p className="stat-detail">Operativas</p>
          </div>
        </div>

        {/* SOLICITUDES PENDIENTES - ALERTA SI HAY */}
        <div className={`stat-card solicitudes ${stats.solicitudes?.pendientes > 0 ? 'alert' : ''}`}>
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Solicitudes</p>
            <p className="stat-value">{stats.solicitudes?.pendientes || 0}</p>
            <p className="stat-detail">Pendientes de revisión</p>
          </div>
        </div>

        {/* PEDIDOS HOY */}
        <div className="stat-card pedidos">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Pedidos Hoy</p>
            <p className="stat-value">{stats.pedidos?.hoy || 0}</p>
            <p className="stat-detail">Recibidos</p>
          </div>
        </div>

        {/* PRODUCTOS */}
        <div className="stat-card productos">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Productos</p>
            <p className="stat-value">{stats.productos?.total || 0}</p>
            <p className="stat-detail">{stats.productos?.activos || 0} activos</p>
          </div>
        </div>

        <div className="stat-card sistema">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Sistema</p>
            <p className="stat-value">100%</p>
            <p className="stat-detail">Operativo</p>
          </div>
        </div>

      </div>

      <div className="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div className="actions-grid">
          <button className="action-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nuevo Producto</span>
          </button>
          <button className="action-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            <span>Registrar Usuario</span>
          </button>
          <button className="action-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span>Buscar Producto</span>
          </button>
          <button className="action-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Ver Mensajes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
