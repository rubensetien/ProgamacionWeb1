import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCarrito } from '../../context/CarritoContext'; // [NEW] Importar contexto
import Swal from 'sweetalert2';
import '../../styles/cliente/ProductosList.css';

// API URL Config
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ProductosList = () => {
  const [productos, setProductos] = useState([]);
  const [productosAgrupados, setProductosAgrupados] = useState([]); // [NEW] Estado parta grupos
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [cantidades, setCantidades] = useState({});
  // const [carritoCount, setCarritoCount] = useState(0); // REMOVED: Managed by Context

  // [NEW] Estado para controlar qué formato está seleccionado en cada "Grupo"
  // { [grupoId]: productoIdSeleccionado }
  const [selectedVariations, setSelectedVariations] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout, autenticado } = useAuth(); // Usamos autenticado del contexto
  const { agregarAlCarrito: agregarAlContexto, cantidadTotal } = useCarrito(); // [NEW] Usar contexto

  // Efecto inicial: Cargar productos
  useEffect(() => {
    fetchProductos();
    // updateCarritoCount(); // REMOVED
  }, []);

  // Efecto para filtrar por categoría desde URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('categoria');
    if (catParam) {
      if (categorias.length > 0) {
        const found = categorias.find(c => c.toLowerCase().includes(catParam.toLowerCase())) || 'Todas';
        setSelectedCategoria(found);
      }
    }
  }, [location.search, categorias]);

  // [NEW] Efecto complejo: Filtrado + Agrupación
  useEffect(() => {
    if (productos.length === 0) return;

    let resultado = productos;

    // 1. Filtrar
    if (selectedCategoria !== 'Todas') {
      resultado = resultado.filter(p => {
        const catNombre = p.categoria?.nombre || p.categoria;
        return catNombre === selectedCategoria;
      });
    }

    if (busqueda) {
      resultado = resultado.filter(p => {
        const nombreCompleto = p.nombre + (p.variante?.nombre || '');
        return nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
      });
    }

    // 2. Agrupar
    const grupos = {};

    resultado.forEach(prod => {
      // Clave de agrupación:
      // Si tiene variante (Sabor) -> [CategoriaID]_[VarianteID]
      // Si NO tiene variante -> [Nombre] (para juntar formatos con mismo nombre)
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
          imagen: prod.imagen || prod.variante?.imagen,
          categoria: prod.categoria,
          variante: prod.variante,
          productos: []
        };
      }

      grupos[groupKey].productos.push(prod);
    });

    const listaGrupos = Object.values(grupos);

    // Inicializar selecciones por defecto (el de menor precio o primero)
    setSelectedVariations(prev => {
      const newSelections = { ...prev };
      listaGrupos.forEach(grupo => {
        // Ordenar por precio para seleccionar el más barato por defecto
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
      const res = await axios.get(`${API_URL}/api/productos`);
      const productosActivos = res.data.data.filter(p => p.activo);
      setProductos(productosActivos);


      // Extraer categorías únicas (manejando si categoria es objeto o string)
      // Extraer categorías únicas y asegurar que Helados y Dulces estén presentes
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

  /* REMOVED MANUAL LOCALSTORAGE LOGIC
  const updateCarritoCount = () => {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const count = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    setCarritoCount(count);
  };
  */

  const handleCantidadChange = (groupId, delta) => {
    setCantidades(prev => ({
      ...prev,
      [groupId]: Math.max(1, (prev[groupId] || 1) + delta)
    }));
  };

  // [NEW] Cambiar formato seleccionado en la tarjeta
  const handleFormatChange = (groupId, productId) => {
    setSelectedVariations(prev => ({
      ...prev,
      [groupId]: productId
    }));
    // Resetear cantidad al cambiar formato? O mantenerla? 
    // Mejor resetear para evitar confusiones de precio x cantidad
    setCantidades(prev => ({ ...prev, [groupId]: 1 }));
  };

  const agregarAlCarrito = (producto, groupId) => {
    // La cantidad la sacamos del estado del GRUPO
    const cantidad = cantidades[groupId] || 1;

    /* REMOVED MANUAL ADD LOGIC
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const existingIndex = carrito.findIndex(item => item._id === producto._id);

    if (existingIndex >= 0) {
      carrito[existingIndex].cantidad += cantidad;
    } else {
      carrito.push({ ...producto, cantidad });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    updateCarritoCount();
    */

    // Usar contexto
    agregarAlContexto(producto, producto.variante, producto.formato, cantidad);

    // Reset cantidad
    setCantidades(prev => ({ ...prev, [groupId]: 1 }));

    const Toast = Swal.mixin({
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      background: '#2c3e50',
      color: '#fff',
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });

    Toast.fire({
      icon: 'success',
      title: `${cantidad}x ${producto.nombre} añadido`
    });
  };

  // Obtener nombre o inicial
  const getAvatarContent = () => {
    if (usuario?.nombre) return usuario.nombre;
    if (usuario?.email) return usuario.email;
    return 'U';
  };

  const getIniciales = (nombre) => {
    return nombre.substring(0, 2).toUpperCase();
  };

  return (
    <div className="catalogo-container">
      {/* 🔮 LIVING BACKGROUND */}
      <div className="living-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="noise-overlay"></div>
      </div>

      {/* 🌟 HEADER PREMIUM */}
      <header className="catalogo-header">
        <div className="header-glass">
          <div className="logo-section" onClick={() => navigate('/')}>
            <img
              src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
              alt="Regma"
              className="logo-img"
            />
          </div>

          <div className="header-actions">
            <button
              className="btn-header-nav"
              onClick={() => navigate('/tiendas')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Tiendas</span>
            </button>

            <button
              className="btn-header-cart"
              onClick={() => navigate('/carrito')}
            >
              <div className="cart-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {/* [UPDATED] Use context quantity */}
                {cantidadTotal() > 0 && <span className="cart-badge">{cantidadTotal()}</span>}
              </div>
              <span className="cart-text">Mi Pedido</span>
            </button>

            {autenticado && (
              <div className="user-profile-mini" onClick={() => navigate('/perfil')}>
                {usuario?.avatar ? (
                  <img src={usuario.avatar} alt="Avatar" className="user-avatar-mini" />
                ) : (
                  <div className="user-initials-mini">{getIniciales(getAvatarContent())}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 🔍 SEARCH & FILTER BAR */}
      <div className="catalogo-toolbar">
        <div className="search-bar-glass">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar helados, postres..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="categories-scroll">
          {categorias.map(cat => (
            <button
              key={cat}
              className={`cat-pill ${selectedCategoria === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategoria(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 🛍️ PRODUCT GRID - GROUPED */}
      <main className="main-content">
        <h2 className="section-title">
          {selectedCategoria === 'Todas' ? 'Nuestra Selección' : selectedCategoria}
        </h2>

        {loading ? (
          <div className="loading-spinner"></div>
        ) : productosAgrupados.length > 0 ? (
          <div className="products-grid">
            {productosAgrupados.map(grupo => {
              // Determine active product based on selection state
              const activeProductId = selectedVariations[grupo.id];
              const activeProd = grupo.productos.find(p => p._id === activeProductId) || grupo.productos[0];

              // Determine quantity based on GROUP ID
              const currentQty = cantidades[grupo.id] || 1;

              // Helper para obtener URL completa de la imagen
              const getImageUrl = (path) => {
                if (!path) return 'https://placehold.co/300x300?text=Regma';
                if (path.startsWith('http')) return path;
                return `${API_URL}${path}`;
              };

              return (
                <div key={grupo.id} className="product-card-glass">
                  <div className="card-image-container">
                    <img
                      src={getImageUrl(activeProd.imagen || activeProd.variante?.imagen)}
                      alt={activeProd.nombre}
                      className="product-image"
                      loading="lazy"
                    />
                    <div className="card-overlay"></div>
                  </div>

                  <div className="card-content">
                    <div className="card-header-row">
                      <span className="card-category">
                        {activeProd.categoria?.nombre || activeProd.categoria || 'Sin categoría'}
                      </span>
                      {/* Iterate formats if multiple exist */}
                      {grupo.productos.length > 1 && (
                        <div className="format-badges">
                          {grupo.productos.length} formatos
                        </div>
                      )}
                    </div>

                    <h3 className="card-title">{grupo.nombrePrincipal}</h3>
                    <p className="card-description">
                      {activeProd.descripcion || 'Delicioso producto artesanal de Regma.'}
                    </p>

                    {/* FORMAT SELECTOR */}
                    {grupo.productos.length > 1 && (
                      <div className="format-selector">
                        {grupo.productos.map(prod => (
                          <button
                            key={prod._id}
                            className={`format-btn ${prod._id === activeProd._id ? 'active' : ''}`}
                            onClick={() => handleFormatChange(grupo.id, prod._id)}
                          >
                            {prod.unidadMedida ? prod.unidadMedida : prod.nombre.replace(grupo.nombrePrincipal, '').trim()}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="card-footer">
                      <div className="price-tag">
                        <span className="currency">€</span>
                        <span className="value">
                          {(Number(activeProd.precioFinal || activeProd.precioBase) || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="actions-wrapper">
                        <div className="qty-selector">
                          <button
                            onClick={() => handleCantidadChange(grupo.id, -1)}
                            disabled={currentQty <= 1}
                          >−</button>
                          <span>{currentQty}</span>
                          <button onClick={() => handleCantidadChange(grupo.id, 1)}>+</button>
                        </div>

                        <button
                          className="btn-add-cart"
                          onClick={() => agregarAlCarrito(activeProd, grupo.id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                          <span>Añadir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-results">
            <p>No encontramos productos en esta categoría.</p>
            <button onClick={() => {
              setSelectedCategoria('Todas');
              setBusqueda('');
            }}>
              Ver todo el catálogo
            </button>
          </div>
        )}
      </main>


    </div>
  );
};

export default ProductosList;
