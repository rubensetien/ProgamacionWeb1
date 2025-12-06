import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productosService } from '../../services';
import '../../styles/cliente/ProductosList.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export default function ProductosList() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [agregandoCarrito, setAgregandoCarrito] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const categoria = searchParams.get('categoria');
    if (categoria) {
      setCategoriaFiltro(categoria);
    }
    cargarDatos();
  }, [searchParams]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const res = await productosService.getAll();
      
      if (res.success) {
        setProductos(res.data || []);
      } else {
        setProductos(res || []);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setLoading(false);
    }
  };

  const agregarAlCarrito = async (productoId) => {
    try {
      setAgregandoCarrito(productoId);
      
      const response = await fetch(`${API_URL}/api/carrito/item`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          productoId,
          cantidad: 1
        })
      });

      const data = await response.json();

      if (data.success) {
        mostrarNotificacion('Producto añadido al carrito correctamente');
      } else {
        mostrarNotificacion(data.message || 'Error al añadir al carrito', 'error');
      }
    } catch (err) {
      console.error('Error añadiendo al carrito:', err);
      mostrarNotificacion('Por favor inicia sesión para añadir productos al carrito', 'error');
    } finally {
      setAgregandoCarrito(null);
    }
  };

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    const notif = document.createElement('div');
    notif.className = `notificacion ${tipo}`;
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    
    setTimeout(() => {
      notif.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  };

  const productosFiltrados = productos.filter(p => {
    const matchBusqueda = !busqueda || 
      p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.variante?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sku?.toLowerCase().includes(busqueda.toLowerCase());
    
    const matchCategoria = categoriaFiltro === 'todas' || 
      p.categoria?.nombre?.toLowerCase() === categoriaFiltro.toLowerCase();
    
    return matchBusqueda && matchCategoria && p.activo;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando catálogo de productos...</p>
      </div>
    );
  }

  return (
    <div className="catalogo-page">
      {/* Navbar Premium */}
      <nav className="catalogo-navbar">
        <div className="catalogo-navbar-container">
          <img 
            src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
            alt="REGMA - El sabor de lo natural"
            className="catalogo-navbar-logo"
            onClick={() => navigate('/')}
          />
          
          <div className="catalogo-navbar-actions">
            <button 
              className="btn-volver-landing"
              onClick={() => navigate('/')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>Volver al Inicio</span>
            </button>
            
            <button 
              className="btn-ver-carrito"
              onClick={() => navigate('/carrito')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <span>Mi Carrito</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Elegante */}
      <section className="catalogo-hero">
        <div className="catalogo-hero-content">
          <h1>Catálogo de Productos</h1>
          <div className="catalogo-hero-ornament"></div>
          <p>Más de 80 años de tradición artesanal. Descubre nuestra selección de productos elaborados con ingredientes naturales de la máxima calidad.</p>
        </div>
      </section>

      {/* Filtros Premium */}
      <section className="catalogo-filtros">
        <div className="filtros-container">
          {/* Búsqueda */}
          <div className="busqueda-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, sabor o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="busqueda-input"
            />
          </div>

          {/* Categorías */}
          <div className="categorias-tabs">
            <button
              className={`categoria-tab ${categoriaFiltro === 'todas' ? 'active' : ''}`}
              onClick={() => setCategoriaFiltro('todas')}
            >
              <span>Todos</span>
            </button>
            <button
              className={`categoria-tab ${categoriaFiltro === 'helados' ? 'active' : ''}`}
              onClick={() => setCategoriaFiltro('helados')}
            >
              <span>Helados</span>
            </button>
            <button
              className={`categoria-tab ${categoriaFiltro === 'dulces' ? 'active' : ''}`}
              onClick={() => setCategoriaFiltro('dulces')}
            >
              <span>Dulces</span>
            </button>
            <button
              className={`categoria-tab ${categoriaFiltro === 'salados' ? 'active' : ''}`}
              onClick={() => setCategoriaFiltro('salados')}
            >
              <span>Salados</span>
            </button>
          </div>
        </div>
      </section>

      {/* Resultados */}
      <div className="resultados-info">
        <p>
          Mostrando <strong>{productosFiltrados.length}</strong> {productosFiltrados.length === 1 ? 'producto' : 'productos'}
        </p>
      </div>

      {/* Grid de Productos */}
      <section className="productos-section">
        <div className="productos-grid-modern">
          {productosFiltrados.map((producto) => (
            <ProductoCard
              key={producto._id}
              producto={producto}
              onAgregarCarrito={() => agregarAlCarrito(producto._id)}
              agregando={agregandoCarrito === producto._id}
            />
          ))}
        </div>

        {productosFiltrados.length === 0 && (
          <div className="sin-resultados">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <h3>No se encontraron productos</h3>
            <p>No hemos encontrado productos que coincidan con tu búsqueda. Prueba con otros términos o explora todas nuestras categorías.</p>
            <button 
              className="btn-limpiar-filtros"
              onClick={() => {
                setBusqueda('');
                setCategoriaFiltro('todas');
              }}
            >
              Mostrar todos los productos
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function ProductoCard({ producto, onAgregarCarrito, agregando }) {
  const variante = producto.variante || {};
  const formato = producto.formato || {};
  const categoria = producto.categoria || {};
  
  const { sku, precioFinal, disponible, destacado, nombre } = producto;

  return (
    <article className={`producto-card-modern ${destacado ? 'destacado' : ''}`}>
      {/* Imagen */}
      <div className="producto-imagen-container">
        {variante.imagen ? (
          <img 
            src={`${API_URL}${variante.imagen}`} 
            alt={variante.nombre || nombre}
            className="producto-imagen-modern"
          />
        ) : (
          <div className="producto-placeholder-modern">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
        )}

        {/* Badge Destacado */}
        {destacado && (
          <div className="badge-destacado">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Destacado
          </div>
        )}

        {/* Badge Categoría */}
        <div className="badge-categoria" style={{ background: categoria.color || '#ff6600' }}>
          {categoria.nombre || 'Producto'}
        </div>
      </div>

      {/* Info */}
      <div className="producto-info-modern">
        <div className="producto-header-modern">
          <h3 className="producto-titulo-modern">{variante.nombre || nombre}</h3>
          <p className="producto-formato-modern">{formato.nombre || 'Formato estándar'}</p>
        </div>

        {variante.descripcion && (
          <p className="producto-descripcion-modern">{variante.descripcion}</p>
        )}

        {/* Tags */}
        <div className="producto-tags">
          {variante.vegano && (
            <span className="producto-tag vegano">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.67 2.37-5.1c1.49 1.27 3.84 1.6 5.76.37a7.04 7.04 0 0 0 2.36-2.48 7.23 7.23 0 0 0 .69-3.17l.21-.03a7.98 7.98 0 0 0-.71-1.6 7.99 7.99 0 0 0-1.39-1.6z"/>
              </svg>
              Vegano
            </span>
          )}
          {variante.sinGluten && (
            <span className="producto-tag sin-gluten">Sin Gluten</span>
          )}
        </div>

        {/* Footer */}
        <div className="producto-footer-modern">
          <div className="precio-container-modern">
            <span className="precio-modern">{(precioFinal || producto.precioBase || 0).toFixed(2)}€</span>
            {formato.capacidad && (
              <span className="precio-unidad">{formato.capacidad}</span>
            )}
          </div>

          <button
            className="btn-agregar-modern"
            onClick={onAgregarCarrito}
            disabled={agregando || !disponible}
          >
            {agregando ? (
              <>
                <div className="btn-spinner"></div>
                <span>Añadiendo...</span>
              </>
            ) : disponible ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <span>Añadir</span>
              </>
            ) : (
              <span>Agotado</span>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
