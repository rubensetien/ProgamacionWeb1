import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ProductosList() {
  const { usuario, logout, crearHeaderAuth, manejarError401 } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 9; // 9 productos por página (3x3 grid)
  const esAdmin = usuario?.rol === 'admin';
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({ 
    nombre: '', 
    precio: '', 
    descripcion: '',
    imagen: null 
  });
  const [previewImagen, setPreviewImagen] = useState(null);
  const [imagenEditando, setImagenEditando] = useState(null);
  const [previewEditando, setPreviewEditando] = useState(null);
  const fileInputRef = useRef(null);
  const fileInputEditRef = useRef(null);

  useEffect(() => { cargarProductos(); }, []);

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  };

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/productos`, { 
        headers: crearHeaderAuth(),
        credentials: 'include'
      });
      
      if (manejarError401(res)) return;
      
      if (!res.ok) throw new Error('Error al cargar productos');
      const data = await res.json();
      setProductos(data);
      setPaginaActual(1);
      mostrarMensaje('✅ Productos cargados correctamente', 'ok');
    } catch (err) {
      mostrarMensaje('❌ Error al cargar productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBusqueda = async (valor) => {
    setBusqueda(valor);
    setPaginaActual(1);
    if (!valor.trim()) {
      cargarProductos();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/productos?busqueda=${encodeURIComponent(valor)}`, { 
        headers: crearHeaderAuth(),
        credentials: 'include'
      });
      
      if (manejarError401(res)) return;
      
      if (!res.ok) throw new Error('Error en búsqueda');
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      mostrarMensaje('❌ Error en búsqueda', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        mostrarMensaje('❌ La imagen no debe superar 5MB', 'error');
        return;
      }
      
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        mostrarMensaje('❌ Solo se permiten imágenes JPG, PNG o WEBP', 'error');
        return;
      }

      setNuevoProducto({ ...nuevoProducto, imagen: file });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImagen(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagenEditChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        mostrarMensaje('❌ La imagen no debe superar 5MB', 'error');
        return;
      }
      
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        mostrarMensaje('❌ Solo se permiten imágenes JPG, PNG o WEBP', 'error');
        return;
      }

      setImagenEditando(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewEditando(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
const handleCrear = async (e) => {
  e.preventDefault();
  if (!nuevoProducto.nombre || nuevoProducto.nombre.length < 3) {
    mostrarMensaje('❌ El nombre debe tener al menos 3 caracteres', 'error');
    return;
  }
  if (!nuevoProducto.precio || parseFloat(nuevoProducto.precio) <= 0) {
    mostrarMensaje('❌ El precio debe ser mayor que 0', 'error');
    return;
  }
  if (!nuevoProducto.descripcion || nuevoProducto.descripcion.length < 5) {
    mostrarMensaje('❌ La descripción debe tener al menos 5 caracteres', 'error');
    return;
  }

  setLoading(true);
  try {
    const formData = new FormData();
    formData.append('nombre', nuevoProducto.nombre);
    formData.append('precio', nuevoProducto.precio);
    formData.append('descripcion', nuevoProducto.descripcion);
    if (nuevoProducto.imagen) {
      formData.append('imagen', nuevoProducto.imagen);
    }

    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${API_URL}/api/productos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: formData,
    });
    
    if (manejarError401(res)) return;
    
    if (!res.ok) throw new Error('Error al añadir producto');
    
    setNuevoProducto({ nombre: '', precio: '', descripcion: '', imagen: null });
    setPreviewImagen(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setMostrarModal(false); // CERRAR MODAL
    
    cargarProductos();
    mostrarMensaje('✅ Producto añadido correctamente', 'ok');
  } catch (err) {
    mostrarMensaje('❌ Error al añadir producto', 'error');
  } finally {
    setLoading(false);
  }
};

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/productos/${id}`, { 
        method: 'DELETE', 
        headers: crearHeaderAuth(),
        credentials: 'include'
      });
      
      if (manejarError401(res)) return;
      
      if (!res.ok) throw new Error('Error al eliminar');
      cargarProductos();
      mostrarMensaje('✅ Producto eliminado', 'ok');
    } catch (err) {
      mostrarMensaje('❌ Error al eliminar producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (producto) => { 
    setEditando({ ...producto });
    setImagenEditando(null);
    setPreviewEditando(null);
  };

  const handleGuardar = async (id) => {
    if (!editando.nombre || editando.nombre.length < 3) {
      mostrarMensaje('❌ El nombre debe tener al menos 3 caracteres', 'error');
      return;
    }
    if (!editando.precio || parseFloat(editando.precio) <= 0) {
      mostrarMensaje('❌ El precio debe ser mayor que 0', 'error');
      return;
    }
    if (!editando.descripcion || editando.descripcion.length < 5) {
      mostrarMensaje('❌ La descripción debe tener al menos 5 caracteres', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nombre', editando.nombre);
      formData.append('precio', editando.precio);
      formData.append('descripcion', editando.descripcion);
      if (imagenEditando) {
        formData.append('imagen', imagenEditando);
      }

      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/api/productos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData,
      });
      
      if (manejarError401(res)) return;
      
      if (!res.ok) throw new Error('Error al actualizar');
      const data = await res.json();
      setProductos(productos.map((p) => (p._id === id ? data : p)));
      setEditando(null);
      setImagenEditando(null);
      setPreviewEditando(null);
      mostrarMensaje('✅ Producto actualizado', 'ok');
    } catch (err) {
      mostrarMensaje('❌ Error al actualizar producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inicio = (paginaActual - 1) * porPagina;
  const visibles = productos.slice(inicio, inicio + porPagina);
  const totalPaginas = Math.ceil(productos.length / porPagina);

  return (
  <div className="container">
    {/* HEADER */}
    <header className="header">
      <div className="header-left">
        <img src="https://profesionales.regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png" alt="Regma" className="logo" />
        <div className="header-title">
          <h1>🍦 Catálogo de Helados Regma</h1>
          <p>Los mejores helados artesanales</p>
        </div>
      </div>
      <div className="user-info">
        <span className="user-email">{usuario?.email}</span>
        <span className="user-role" style={{ color: esAdmin ? 'white' : '#ffd700' }}>
          {esAdmin ? '👨‍💼 Administrador' : '👤 Usuario'}
        </span>
        <button className="logout-btn" onClick={logout}>🚪 Cerrar Sesión</button>
      </div>
    </header>

    {/* BUSCADOR */}
    <div className="buscador">
      <input 
        type="text" 
        placeholder="🔍 Buscar helados por nombre..." 
        value={busqueda} 
        onChange={(e) => handleBusqueda(e.target.value)} 
      />
      <button onClick={cargarProductos} disabled={loading}>
        🔄 Recargar
      </button>
    </div>

    {/* BOTÓN FLOTANTE PARA AÑADIR (SOLO ADMIN) */}
    {esAdmin && (
      <button 
        className="btn-flotante"
        onClick={() => setMostrarModal(true)}
        title="Añadir nuevo helado"
      >
        ➕
      </button>
    )}

    {/* MODAL PARA CREAR PRODUCTO */}
    {mostrarModal && (
      <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>🍦 Añadir Nuevo Helado</h2>
            <button 
              className="modal-close"
              onClick={() => setMostrarModal(false)}
            >
              ×
            </button>
          </div>

          <div className="modal-body">
            <form className="modal-form" onSubmit={handleCrear}>
              {/* Nombre */}
              <div className="modal-form-group">
                <label className="modal-form-label">Nombre del Helado</label>
                <input 
                  type="text"
                  className="modal-form-input"
                  placeholder="Ej: Nata, Chocolate, Fresa..."
                  value={nuevoProducto.nombre} 
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })} 
                  required
                />
              </div>

              {/* Precio */}
              <div className="modal-form-group">
                <label className="modal-form-label">Precio (€)</label>
                <input 
                  type="number"
                  step="0.01"
                  className="modal-form-input"
                  placeholder="Ej: 3.50"
                  value={nuevoProducto.precio} 
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })} 
                  required
                />
              </div>

              {/* Descripción */}
              <div className="modal-form-group">
                <label className="modal-form-label">Descripción</label>
                <textarea
                  className="modal-form-textarea"
                  placeholder="Describe el sabor, ingredientes, características..."
                  value={nuevoProducto.descripcion} 
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })} 
                  required
                />
              </div>

              {/* Imagen */}
              <div className="modal-form-group">
                <label className="modal-form-label">Imagen del Producto</label>
                <label className="modal-file-upload">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImagenChange}
                  />
                  <div className="modal-file-upload-content">
                    <div className="modal-file-upload-icon">📷</div>
                    <div className="modal-file-upload-text">
                      {nuevoProducto.imagen ? nuevoProducto.imagen.name : 'Haz clic para seleccionar imagen'}
                    </div>
                    <div className="modal-file-upload-hint">
                      JPG, PNG o WEBP • Máx 5MB
                    </div>
                  </div>
                </label>

                {previewImagen && (
                  <div className="modal-image-preview">
                    <img src={previewImagen} alt="Preview" />
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="modal-actions">
                <button 
                  type="button"
                  className="modal-btn modal-btn-secondary"
                  onClick={() => {
                    setMostrarModal(false);
                    setNuevoProducto({ nombre: '', precio: '', descripcion: '', imagen: null });
                    setPreviewImagen(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  ❌ Cancelar
                </button>
                <button 
                  type="submit"
                  className="modal-btn modal-btn-primary"
                  disabled={loading}
                >
                  {loading ? '⏳ Añadiendo...' : '✅ Añadir Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}


      {/* MENSAJES */}
      {mensaje && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

      {/* LOADING */}
      {loading && <div className="spinner">⏳ Cargando helados deliciosos...</div>}

      {/* GRID DE PRODUCTOS */}
      {!loading && (
        <div className="productos-grid">
          {visibles.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state-icon">🍦</div>
              <div className="empty-state-text">No hay productos para mostrar</div>
            </div>
          ) : (
            visibles.map((producto) => (
              <div 
                key={producto._id} 
                className={`producto-card ${editando?._id === producto._id ? 'editando' : ''}`}
              >
                {/* IMAGEN */}
                <div className="producto-imagen-wrapper">
                  {editando?._id === producto._id && esAdmin ? (
                    <>
                      <label className="file-input-label" style={{ margin: '20px', cursor: 'pointer' }}>
                        📷 Cambiar Imagen
                        <input 
                          type="file"
                          ref={fileInputEditRef}
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImagenEditChange}
                        />
                      </label>
                      {(previewEditando || editando.imagen) && (
                        <img 
                          src={previewEditando || `${BASE_URL}${editando.imagen}`}
                          alt={editando.nombre}
                          style={{ width: '100%', height: '200px', objectFit: 'cover', marginTop: '10px' }}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {producto.imagen ? (
                        <img 
                          src={`${BASE_URL}${producto.imagen}`}
                          alt={producto.nombre}
                          className="producto-imagen"
                          onClick={() => window.open(`${BASE_URL}${producto.imagen}`, '_blank')}
                        />
                      ) : (
                        <div className="producto-placeholder">🍦</div>
                      )}
                      <div className="producto-precio-badge">{producto.precio.toFixed(2)}€</div>
                    </>
                  )}
                </div>

                {/* CONTENIDO */}
                <div className="producto-contenido">
                  {editando?._id === producto._id && esAdmin ? (
                    <>
                      <input 
                        type="text" 
                        value={editando.nombre} 
                        onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                        placeholder="Nombre"
                      />
                      <input 
                        type="number" 
                        step="0.01" 
                        value={editando.precio} 
                        onChange={(e) => setEditando({ ...editando, precio: e.target.value })}
                        placeholder="Precio"
                      />
                      <input 
                        type="text" 
                        value={editando.descripcion} 
                        onChange={(e) => setEditando({ ...editando, descripcion: e.target.value })}
                        placeholder="Descripción"
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="producto-nombre">{producto.nombre}</h3>
                      <p className="producto-descripcion">{producto.descripcion}</p>
                    </>
                  )}

                  {/* BOTONES DE ACCIÓN (SOLO ADMIN) */}
                  {esAdmin && (
                    <div className="producto-acciones">
                      {editando?._id === producto._id ? (
                        <>
                          <button 
                            className="btn-accion btn-guardar"
                            onClick={() => handleGuardar(producto._id)} 
                            disabled={loading}
                          >
                            💾 Guardar
                          </button>
                          <button 
                            className="btn-accion btn-cancelar"
                            onClick={() => {
                              setEditando(null);
                              setImagenEditando(null);
                              setPreviewEditando(null);
                            }}
                          >
                            ❌ Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className="btn-accion btn-editar"
                            onClick={() => handleEditar(producto)}
                          >
                            ✏️ Editar
                          </button>
                          <button 
                            className="btn-accion btn-eliminar"
                            onClick={() => handleEliminar(producto._id)}
                          >
                            🗑️ Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="paginacion">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
            <button 
              key={num} 
              onClick={() => setPaginaActual(num)} 
              style={{ 
                background: num === paginaActual ? 'rgb(0, 86, 179)' : 'white',
                color: num === paginaActual ? 'white' : '#ff6600'
              }}
            >
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}