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

      const [prodRes, catRes, varRes, formRes] = await Promise.all([
        axios.get(`${API_URL}/api/productos`, config),
        axios.get(`${API_URL}/api/categorias`, config),
        axios.get(`${API_URL}/api/variantes`, config),
        axios.get(`${API_URL}/api/formatos`, config)
      ]);

      const productos = prodRes.data.data || [];
      
      setStats({
        totalProductos: productos.length,
        productosActivos: productos.filter(p => p.activo).length,
        productosDestacados: productos.filter(p => p.destacado).length,
        categorias: catRes.data.data?.length || 0,
        variantes: varRes.data.data?.length || 0,
        formatos: formRes.data.data?.length || 0
      });
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
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          Dashboard
        </h1>
        <p className="dashboard-subtitle">
          Panel de control y estadísticas de REGMA
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card productos">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Productos</p>
            <p className="stat-value">{stats.totalProductos}</p>
            <p className="stat-detail">{stats.productosActivos} activos</p>
          </div>
        </div>

        <div className="stat-card destacados">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Destacados</p>
            <p className="stat-value">{stats.productosDestacados}</p>
            <p className="stat-detail">En portada</p>
          </div>
        </div>

        <div className="stat-card categorias">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Categorías</p>
            <p className="stat-value">{stats.categorias}</p>
            <p className="stat-detail">Activas</p>
          </div>
        </div>

        <div className="stat-card variantes">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Variantes</p>
            <p className="stat-value">{stats.variantes}</p>
            <p className="stat-detail">Sabores</p>
          </div>
        </div>

        <div className="stat-card formatos">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
          </div>
          <div className="stat-content">
            <p className="stat-label">Formatos</p>
            <p className="stat-value">{stats.formatos}</p>
            <p className="stat-detail">Tamaños</p>
          </div>
        </div>

        <div className="stat-card sistema">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
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
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Nuevo Producto</span>
          </button>
          <button className="action-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            <span>Registrar Usuario</span>
          </button>
          <button className="action-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <span>Buscar Producto</span>
          </button>
          <button className="action-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span>Ver Mensajes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
