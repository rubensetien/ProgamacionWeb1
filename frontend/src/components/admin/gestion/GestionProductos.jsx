import { useState, useEffect } from 'react';
import '../../../styles/admin/gestion/GestionProductos.css';
import GestionFormatos from './GestionFormatos';
import GestionVariantes from './GestionVariantes';
import GestionInventario from './GestionInventario';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function GestionProductos() {
  console.log('GestionProductos wrapper loaded');
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [formatos, setFormatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [seccionActiva, setSeccionActiva] = useState('productos'); // 'productos', 'formatos', 'sabores', 'inventario'
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // [NEW] Control de items por página

  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    variante: '',
    formato: '',
    precioBase: '',
    precioFinal: '',
    imagen: null,
    activo: true
  });

  // Estado para saber si la categoría seleccionada requiere sabor
  const [categoriaRequiereSabor, setCategoriaRequiereSabor] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Detectar cuando cambia la categoría seleccionada
  useEffect(() => {
    if (formulario.categoria) {
      const categoriaSeleccionada = categorias.find(c => c._id === formulario.categoria);
      if (categoriaSeleccionada) {
        setCategoriaRequiereSabor(categoriaSeleccionada.requiereSabor || false);

        // Si la categoría NO requiere sabor, limpiar el campo variante
        if (!categoriaSeleccionada.requiereSabor) {
          setFormulario(prev => ({ ...prev, variante: '' }));
        }
      }
    } else {
      setCategoriaRequiereSabor(false);
    }
  }, [formulario.categoria, categorias]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const token = localStorage.getItem('token');

      const [productosRes, categoriasRes, variantesRes, formatosRes] = await Promise.all([
        fetch(`${API_URL}/api/productos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/categorias`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/variantes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/formatos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const productosData = await productosRes.json();
      const categoriasData = await categoriasRes.json();
      const variantesData = await variantesRes.json();
      const formatosData = await formatosRes.json();

      if (productosData.success) setProductos(productosData.data);
      if (categoriasData.success) setCategorias(categoriasData.data);
      if (variantesData.success) setVariantes(variantesData.data);
      if (formatosData.success) setFormatos(formatosData.data);

      setError(null);
    } catch (err) {
      setError('Error al cargar datos: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setProductoEditando(null);
    setFormulario({
      nombre: '',
      descripcion: '',
      categoria: '',
      variante: '',
      formato: '',
      precioBase: '',
      precioFinal: '',
      imagen: null,
      activo: true
    });
    setCategoriaRequiereSabor(false);
    setMostrarModal(true);
  };

  const abrirModalEditar = (producto) => {
    setModoEdicion(true);
    setProductoEditando(producto);
    setFormulario({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      categoria: producto.categoria?._id || '',
      variante: producto.variante?._id || '',
      formato: producto.formato?._id || '',
      precioBase: producto.precioBase || '',
      precioFinal: producto.precioFinal || '',
      imagen: null,
      activo: producto.activo
    });

    // Detectar si la categoría del producto requiere sabor
    if (producto.categoria) {
      const cat = categorias.find(c => c._id === producto.categoria._id);
      setCategoriaRequiereSabor(cat?.requiereSabor || false);
    }

    setMostrarModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación: Si la categoría requiere sabor, debe tener variante
    if (categoriaRequiereSabor && !formulario.variante) {
      setError('Esta categoría requiere seleccionar un sabor o variante');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('nombre', formulario.nombre);
      formData.append('descripcion', formulario.descripcion);
      formData.append('categoria', formulario.categoria);

      // Solo enviar variante si tiene valor
      if (formulario.variante) {
        formData.append('variante', formulario.variante);
      }

      if (formulario.formato) {
        formData.append('formato', formulario.formato);
      }

      formData.append('precioBase', formulario.precioBase);
      formData.append('precioFinal', formulario.precioFinal);
      formData.append('activo', formulario.activo);

      if (formulario.imagen) {
        formData.append('imagen', formulario.imagen);
      }

      const url = modoEdicion
        ? `${API_URL}/api/productos/${productoEditando._id}`
        : `${API_URL}/api/productos`;

      const method = modoEdicion ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al guardar producto');
      }

      setMostrarModal(false);
      cargarDatos();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/productos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al eliminar');
      }

      cargarDatos();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const productosFiltrados = productos.filter(p => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sku?.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoriaFiltro === 'todas' ||
      p.categoria?._id === categoriaFiltro;
    return matchBusqueda && matchCategoria;
  });

  const obtenerNombreCompleto = (producto) => {
    let nombre = producto.nombre;
    if (producto.variante?.nombre) {
      nombre += ` - ${producto.variante.nombre}`;
    }
    if (producto.formato?.nombre) {
      nombre += ` (${producto.formato.nombre})`;
    }
    return nombre;
  };

  if (cargando) {
    return (
      <div className="gestion-productos">
        <div className="loading-spinner">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="gestion-productos">
      <div className="gestion-header">
        <div className="header-content">
          <h2>Gestión de Productos</h2>
          <p className="header-description">
            Administración completa del catálogo de productos
          </p>
        </div>

        {seccionActiva === 'productos' && (
          <button className="btn-nuevo" onClick={abrirModalNuevo}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Producto
          </button>
        )}
      </div>

      {/* SUBMENU DE NAVEGACIÓN */}
      <div className="gestion-submenu">
        <button
          className={`submenu-tab ${seccionActiva === 'productos' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('productos')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9L9 3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" /></svg>
          Productos
        </button>
        <button
          className={`submenu-tab ${seccionActiva === 'sabores' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('sabores')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
          Sabores
        </button>
        <button
          className={`submenu-tab ${seccionActiva === 'formatos' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('formatos')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
          Formatos
        </button>
        <button
          className={`submenu-tab ${seccionActiva === 'inventario' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('inventario')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
          Inventario
        </button>
      </div>

      {seccionActiva === 'productos' && (
        <>
          {error && (
            <div className="alert alert-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          <div className="stats-bar">
            <div className="stat-card">
              <div className="stat-value">{productos.length}</div>
              <div className="stat-label">productos totales</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {productos.filter(p => p.activo).length}
              </div>
              <div className="stat-label">activos</div>
            </div>
          </div>

          <div className="filtros-bar">
            <div className="search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre o SKU..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="select-filter"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          <div className="tabla-container">
            <table className="tabla-productos">
              {/* (Table content unchanged) */}
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>PRODUCTO</th>
                  <th>CATEGORÍA</th>
                  <th>SABOR/VARIANTE</th>
                  <th>FORMATO</th>
                  <th>PRECIO BASE</th>
                  <th>PRECIO FINAL</th>
                  <th>ESTADO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                        <line x1="9" y1="9" x2="9.01" y2="9" />
                        <line x1="15" y1="9" x2="15.01" y2="9" />
                      </svg>
                      <p>No se encontraron productos</p>
                    </td>
                  </tr>
                ) : (
                  // ✅ PAGINACIÓN: Variable
                  productosFiltrados.slice((page - 1) * itemsPerPage, page * itemsPerPage).map(producto => (
                    <tr key={producto._id}>
                      {/* ... row content ... */}
                      <td className="td-sku">{producto.sku || '-'}</td>
                      <td className="td-producto">
                        <div className="producto-info">
                          {producto.imagenPrincipal || producto.imagen ? (
                            <img
                              src={`${API_URL}${producto.imagenPrincipal || producto.imagen}`}
                              alt={producto.nombre}
                              className="producto-thumbnail"
                            />
                          ) : null}
                          <span>{producto.nombre}</span>
                        </div>
                      </td>
                      <td>{producto.categoria?.nombre || '-'}</td>
                      <td>{producto.variante?.nombre || '-'}</td>
                      <td>{producto.formato?.nombre || '-'}</td>
                      <td className="td-precio">€{producto.precioBase?.toFixed(2)}</td>
                      <td className="td-precio">€{producto.precioFinal?.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${producto.activo ? 'badge-success' : 'badge-inactive'}`}>
                          {producto.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="acciones">
                          <button
                            className="btn-icono btn-editar"
                            onClick={() => abrirModalEditar(producto)}
                            title="Editar"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="btn-icono btn-eliminar"
                            onClick={() => handleEliminar(producto._id)}
                            title="Eliminar"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* CONTROLES DE PAGINACIÓN MEJORADOS */}
          <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>

            <div className="items-per-page" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#7f8c8d', fontSize: '14px', fontWeight: '500' }}>Mostrar:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e8e8e8', fontWeight: '600', color: '#2c3e50', cursor: 'pointer' }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <span style={{ color: '#7f8c8d', fontSize: '14px', fontWeight: '500' }}>
              Mostrando {Math.min((page - 1) * itemsPerPage + 1, productosFiltrados.length)} - {Math.min(page * itemsPerPage, productosFiltrados.length)} de {productosFiltrados.length} productos
            </span>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary"
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e8e8e8', background: page === 1 ? '#f8f9fa' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(Math.ceil(productosFiltrados.length / itemsPerPage), p + 1))}
                disabled={page >= Math.ceil(productosFiltrados.length / itemsPerPage)}
                className="btn-secondary"
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e8e8e8', background: page >= Math.ceil(productosFiltrados.length / itemsPerPage) ? '#f8f9fa' : 'white', cursor: page >= Math.ceil(productosFiltrados.length / itemsPerPage) ? 'not-allowed' : 'pointer' }}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}

      {seccionActiva === 'sabores' && <GestionVariantes />}
      {seccionActiva === 'formatos' && <GestionFormatos />}
      {seccionActiva === 'inventario' && <GestionInventario />}

      {/* Modal solo si estamos en productos */}
      {mostrarModal && seccionActiva === 'productos' && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button className="btn-close" onClick={() => setMostrarModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre del Producto *</label>
                  <input
                    type="text"
                    value={formulario.nombre}
                    onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Categoría *</label>
                  <select
                    value={formulario.categoria}
                    onChange={(e) => setFormulario({ ...formulario, categoria: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.nombre}
                        {cat.requiereSabor && ' (Requiere sabor)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CAMPO INTELIGENTE: Solo mostrar si la categoría requiere sabor */}
              {categoriaRequiereSabor && (
                <div className="form-group">
                  <label>Sabor / Variante * (Requerido para esta categoría)</label>
                  <select
                    value={formulario.variante}
                    onChange={(e) => setFormulario({ ...formulario, variante: e.target.value })}
                    required={categoriaRequiereSabor}
                  >
                    <option value="">Seleccionar sabor</option>
                    {variantes.map(v => (
                      <option key={v._id} value={v._id}>{v.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Formato/Tamaño *</label>
                  <select
                    value={formulario.formato}
                    onChange={(e) => setFormulario({ ...formulario, formato: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar formato</option>
                    {formatos.map(f => (
                      <option key={f._id} value={f._id}>
                        {f.nombre} ({f.capacidad}{f.unidad})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Imagen</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormulario({ ...formulario, imagen: e.target.files[0] })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Precio Base *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formulario.precioBase}
                    onChange={(e) => setFormulario({ ...formulario, precioBase: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Precio Final *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formulario.precioFinal}
                    onChange={(e) => setFormulario({ ...formulario, precioFinal: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formulario.descripcion}
                  onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                  rows="3"
                ></textarea>
              </div>

              <div className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formulario.activo}
                  onChange={(e) => setFormulario({ ...formulario, activo: e.target.checked })}
                />
                Producto Activo y Visible
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancelar" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  {modoEdicion ? 'Actualizar Producto' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


