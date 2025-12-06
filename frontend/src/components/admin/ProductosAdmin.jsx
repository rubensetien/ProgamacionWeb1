import { useState, useEffect } from 'react';
import axios from 'axios';
import GestionProductos from './gestion/GestionProductos';
import GestionCategorias from './gestion/GestionCategorias';
import GestionVariantes from './gestion/GestionVariantes';
import GestionFormatos from './gestion/GestionFormatos';
import GestionInventario from './gestion/GestionInventario';
import '../../styles/admin/ProductosAdmin.css';

const ProductosAdmin = () => {
  const [tabActiva, setTabActiva] = useState('productos');

  return (
    <div className="productos-admin-container">
      {/* Header con Pestañas */}
      <div className="productos-admin-header">
        <div className="header-content">
          <h1>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            Gestión del Catálogo
          </h1>
          <p className="header-subtitle">
            Administración completa de productos, categorías, sabores y formatos
          </p>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="tabs-navegacion">
        <button
          className={`tab-item ${tabActiva === 'productos' ? 'active' : ''}`}
          onClick={() => setTabActiva('productos')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
          <span>Productos</span>
        </button>

        <button
          className={`tab-item ${tabActiva === 'categorias' ? 'active' : ''}`}
          onClick={() => setTabActiva('categorias')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
          </svg>
          <span>Categorías</span>
        </button>

        <button
          className={`tab-item ${tabActiva === 'variantes' ? 'active' : ''}`}
          onClick={() => setTabActiva('variantes')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
          <span>Sabores</span>
        </button>

        <button
          className={`tab-item ${tabActiva === 'formatos' ? 'active' : ''}`}
          onClick={() => setTabActiva('formatos')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
          <span>Formatos</span>
        </button>

        <button
          className={`tab-item ${tabActiva === 'inventario' ? 'active' : ''}`}
          onClick={() => setTabActiva('inventario')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 7h-9"/>
            <path d="M14 17H5"/>
            <circle cx="17" cy="17" r="3"/>
            <circle cx="7" cy="7" r="3"/>
          </svg>
          <span>Inventario</span>
        </button>
      </div>

      {/* Contenido de las Pestañas */}
      <div className="tab-content">
        {tabActiva === 'productos' && <GestionProductos />}
        {tabActiva === 'categorias' && <GestionCategorias />}
        {tabActiva === 'variantes' && <GestionVariantes />}
        {tabActiva === 'formatos' && <GestionFormatos />}
        {tabActiva === 'inventario' && <GestionInventario />}
      </div>
    </div>
  );
};

export default ProductosAdmin;
