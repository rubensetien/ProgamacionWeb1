import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCarrito } from '../../context/CarritoContext';
import Navbar from '../common/Navbar';
import Swal from 'sweetalert2';
import '../../styles/cliente/ProductosListModern.css'; // New CSS

// API URL Config
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ProductosList = () => {
  const [productos, setProductos] = useState([]);
  const [productosAgrupados, setProductosAgrupados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedVariations, setSelectedVariations] = useState({});


  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout, autenticado } = useAuth();
  const { agregarAlCarrito, cantidadTotal } = useCarrito();

  // Helper Initials
  // Helper Initials (Removed: Handled in Navbar)

  // 1. Fetch Data
  useEffect(() => {
    fetchProductos();
  }, []);

  // 2. URL Filter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('categoria');
    if (catParam && categorias.length > 0) {
      const found = categorias.find(c => c.toLowerCase().includes(catParam.toLowerCase())) || 'Todas';
      setSelectedCategoria(found);
    }
  }, [location.search, categorias]);

  // 3. Logic: Filter & Group
  useEffect(() => {
    if (productos.length === 0) return;

    let resultado = productos;

    // Filter by Category
    if (selectedCategoria !== 'Todas') {
      resultado = resultado.filter(p => {
        const catNombre = p.categoria?.nombre || p.categoria;
        return catNombre === selectedCategoria;
      });
    }

    // Filter by Search
    if (busqueda) {
      resultado = resultado.filter(p => {
        const nombreCompleto = p.nombre + (p.variante?.nombre || '');
        return nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
      });
    }

    // Grouping
    const grupos = {};
    resultado.forEach(prod => {
      let groupKey;
      if (prod.variante) {
        groupKey = `${prod.categoria?._id || 'cat'}_${prod.variante._id}`;
      } else {
        groupKey = prod.nombre;
      }

      if (!grupos[groupKey]) {
        grupos[groupKey] = {
          id: groupKey,
          nombrePrincipal: prod.variante ? prod.variante.nombre : prod.nombre,
          descripcion: prod.descripcion,
          imagen: prod.imagenPrincipal || prod.imagen || prod.variante?.imagen,
          categoria: prod.categoria,
          variante: prod.variante,
          productos: []
        };
      }
      grupos[groupKey].productos.push(prod);
    });

    const listaGrupos = Object.values(grupos);

    // Default Selections (Cheapest first)
    setSelectedVariations(prev => {
      const newSelections = { ...prev };
      listaGrupos.forEach(grupo => {
        const sortedProds = [...grupo.productos].sort((a, b) => (a.precioFinal || 0) - (b.precioFinal || 0));
        if (!newSelections[grupo.id] || !grupo.productos.find(p => p._id === newSelections[grupo.id])) {
          newSelections[grupo.id] = sortedProds[0]._id;
        }
      });
      return newSelections;
    });

    setProductosAgrupados(listaGrupos);
  }, [selectedCategoria, busqueda, productos]);

  const fetchProductos = async () => {
    try {
      // Logic: If professional, fetch ALL (undefined params). If public, fetch only public (false).
      const params = {};
      if (usuario?.rol !== 'profesional') {
        params.soloProfesionales = false;
      }

      const res = await axios.get(`${API_URL}/api/productos`, { params });
      const productosActivos = res.data.data.filter(p => p.activo);
      setProductos(productosActivos);

      const catsData = productosActivos.map(p => p.categoria?.nombre || p.categoria).filter(Boolean);
      const cats = Array.from(new Set(['Todas', 'Helados', 'Dulces', ...catsData]));
      setCategorias(cats);
    } catch (error) {
      console.error('Error fetching products:', error);
      Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFormatChange = (groupId, productId) => {
    setSelectedVariations(prev => ({ ...prev, [groupId]: productId }));
  };

  const handleAddToCart = (grupo) => {
    // [NEW] Check authentication first
    if (!autenticado) {
      Swal.fire({
        title: 'Inicia sesión',
        text: 'Debes estar registrado para comprar',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Ir al Login',
        cancelButtonText: 'Cerrar',
        confirmButtonColor: '#ff5722'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    const activeId = selectedVariations[grupo.id];
    const activeProd = grupo.productos.find(p => p._id === activeId) || grupo.productos[0];

    agregarAlCarrito(activeProd, activeProd.variante, activeProd.formato, 1);

    // Custom Toast
    const Toast = Swal.mixin({
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: false,
      background: '#1a1a1a', // Regma Dark
      color: '#fff',
    });
    Toast.fire({ icon: 'success', title: 'Añadido al pedido' });
  };

  const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/300x300?text=Regma';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  return (
    <div className="catalogo-modern-container">

      {/* 1. NAVBAR OVERLAY (Absolute) */}
      <Navbar transparent={true} />

      {/* 2. HERO VIDEO */}
      <header className="catalog-hero">
        <video
          className="hero-video-bg"
          autoPlay
          muted
          loop
          playsInline
          poster={`${API_URL}/uploads/landing/hero-principal.jpg`}
        >
          <source src={`${API_URL}/uploads/videoBola.mp4`} type="video/mp4" />
        </video>
        <div className="hero-overlay-content">
          <h1 className="hero-title-cat">CATÁLOGO 2026</h1>
          <p className="hero-subtitle-cat">Colección de Sabores & Tradición</p>
        </div>
      </header>

      {/* 3. FLOATING FILTER BAR */}
      <div className="filter-sticky-bar">
        <div className="categories-pills">
          {categorias.map(cat => (
            <button
              key={cat}
              className={`cat-btn ${selectedCategoria === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategoria(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="search-mini">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* 4. MAIN GRID */}
      <main className="grid-layout-modern">
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px' }}>Cargando catálogo...</div>
        ) : productosAgrupados.length > 0 ? (
          productosAgrupados.map(grupo => {
            const activeId = selectedVariations[grupo.id];
            const activeProd = grupo.productos.find(p => p._id === activeId) || grupo.productos[0];

            return (
              <div key={grupo.id} className="prod-card-modern">
                <div className="card-img-wrapper">
                  <img
                    src={getImageUrl(activeProd.variante?.imagen || activeProd.imagenPrincipal || activeProd.imagen)}
                    alt={activeProd.nombre}
                    className="prod-img-main"
                  />
                </div>
                <div className="card-info">
                  <span className="prod-cat-tag">{activeProd.categoria?.nombre || activeProd.categoria}</span>
                  <h3 className="prod-name">{grupo.nombrePrincipal}</h3>
                  <p className="prod-desc">{activeProd.descripcion ? activeProd.descripcion.substring(0, 60) + '...' : 'Delicioso producto Regma'}</p>

                  {/* Format Chips */}
                  {grupo.productos.length > 1 && (
                    <div className="format-chips">
                      {grupo.productos.map(p => (
                        <button
                          key={p._id}
                          className={`chip ${p._id === activeProd._id ? 'active' : ''}`}
                          onClick={() => handleFormatChange(grupo.id, p._id)}
                        >
                          {p.formato?.capacidad
                            ? (['unidades', 'unidad'].includes(p.formato.unidad?.toLowerCase())
                              ? p.formato.nombre
                              : `${p.formato.capacidad} ${p.formato.unidad}`)
                            : p.nombre.replace(grupo.nombrePrincipal, '').trim() || 'Estándar'}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="prod-controls">
                    <span className="price-modern">{Number(activeProd.precioFinal || 0).toFixed(2)}€</span>
                    <button className="btn-add-modern" onClick={() => handleAddToCart(grupo)}>
                      <span>Añadir</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px' }}>
            <p>No se encontraron productos.</p>
          </div>
        )}
      </main>

    </div>
  );
};

export default ProductosList;
