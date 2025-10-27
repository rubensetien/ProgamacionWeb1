import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = 'http://localhost:3001/api';
const BASE_URL = 'http://localhost:3001';

export default function ProductosList() {
  const { usuario, logout, crearHeaderAuth, manejarError401 } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [ordenCampo, setOrdenCampo] = useState(null);
  const [ordenAsc, setOrdenAsc] = useState(true);
  const porPagina = 5;
  const esAdmin = usuario?.rol === 'admin';
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
    setTimeout(() => setMensaje(null), 3000);
  };

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/productos`, { 
        headers: crearHeaderAuth(),
        credentials: 'include'
      });
      
      if (manejarError401(res)) return;
      
      if (!res.ok) throw new Error('Error al cargar productos');
      const data = await res.json();
      setProductos(data);
      setPaginaActual(1);
      mostrarMensaje('Productos cargados correctamente', 'ok');
    } catch (err) {
      mostrarMensaje('Error al cargar productos', 'error');
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
      const res = await fetch(`${API_URL}/productos?busqueda=${encodeURIComponent(valor)}`, { 
        headers: crearHeaderAuth(),
        credentials: 'include'
      });
      
      if (manejarError401(res)) return;
      
      if (!res.ok) throw new Error('Error en búsqueda');
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      mostrarMensaje('Error en búsqueda', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección de imagen para nuevo producto
  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        mostrarMensaje('La imagen no debe superar 5MB', 'error');
        return;
      }
      
      // Validar tipo
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        mostrarMensaje('Solo se permiten imágenes JPG, PNG o WEBP', 'error');
        return;
      }

      setNuevoProducto({ ...nuevoProducto, imagen: file });
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImagen(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejar selección de imagen para editar producto
  const handleImagenEditChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        mostrarMensaje('La imagen no debe superar 5MB', 'error');
        return;
      }
      
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        mostrarMensaje('Solo se permiten imágenes JPG, PNG o WEBP', 'error');
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
      mostrarMensaje('El nombre debe tener al menos 3 caracteres', 'error');
      return;
    }
    if (!nuevoProducto.precio || parseFloat(nuevoProducto.precio) <= 0) {
      mostrarMensaje('El precio debe ser mayor que 0', 'error');
      return;
    }
    if (!nuevoProducto.descripcion || nuevoProducto.descripcion.length < 5) {
      mostrarMensaje('La descripción debe tener al menos 5 caracteres', 'error');
      return;
    }

    setLoading(true);
    try {
      // Crear FormData para enviar archivo
      const formData = new FormData();
      formData.append('nombre', nuevoProducto.nombre);
      formData.append('precio', nuevoProducto.precio);
      formData.append('descripcion', nuevoProducto.descripcion);
      if (nuevoProducto.imagen) {
        formData.append('imagen', nuevoProducto.imagen);
      }

      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // NO incluir 'Content-Type' cuando se usa FormData
        },
        credentials: 'include',
        body: formData,
      });
      
      if (manejarError401(res)) return;
      
      if (!res.ok) throw new Error('Error al añadir producto');
      
      setNuevoProducto({ nombre: '', precio: '', descripcion: '', imagen: null });
      setPreviewImagen(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      cargarProductos();
      mostrarMensaje('Producto añadido correctamente', 'ok');
    } catch (err) {
      mostrarMensaje('Error al añadir producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/productos/${id}`, { 
        method: 'DELETE', 
        headers: crearHeaderAuth(),
        credentials: 'include'
      });
      
      if (manejarError401(res)) return;
      
      if (!res.ok) throw new Error('Error al eliminar');
      cargarProductos();
      mostrarMensaje('Producto eliminado', 'ok');
    } catch (err) {
      mostrarMensaje('Error al eliminar producto', 'error');
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
      mostrarMensaje('El nombre debe tener al menos 3 caracteres', 'error');
      return;
    }
    if (!editando.precio || parseFloat(editando.precio) <= 0) {
      mostrarMensaje('El precio debe ser mayor que 0', 'error');
      return;
    }
    if (!editando.descripcion || editando.descripcion.length < 5) {
      mostrarMensaje('La descripción debe tener al menos 5 caracteres', 'error');
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
      const res = await fetch(`${API_URL}/productos/${id}`, {
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
      mostrarMensaje('Producto actualizado', 'ok');
    } catch (err) {
      mostrarMensaje('Error al actualizar producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const ordenarPor = (campo) => {
    if (ordenCampo === campo) {
      setOrdenAsc(!ordenAsc);
    } else {
      setOrdenCampo(campo);
      setOrdenAsc(true);
    }
  };

  const filtrados = [...productos].sort((a, b) => {
    if (!ordenCampo) return 0;
    if (a[ordenCampo] < b[ordenCampo]) return ordenAsc ? -1 : 1;
    if (a[ordenCampo] > b[ordenCampo]) return ordenAsc ? 1 : -1;
    return 0;
  });

  const inicio = (paginaActual - 1) * porPagina;
  const visibles = filtrados.slice(inicio, inicio + porPagina);
  const totalPaginas = Math.ceil(filtrados.length / porPagina);

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <img src="https://profesionales.regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png" alt="Regma" className="logo" />
          <div className="header-title">
            <h1>Catálogo de Helados</h1>
            <p>Consulta, edita o añade productos al catálogo</p>
          </div>
        </div>
        <div className="user-info">
          <span className="user-email">{usuario?.email}</span>
          <span className="user-role" style={{ color: esAdmin ? '#ff6600' : '#28a745' }}>
            {esAdmin ? '👨‍💼 Admin' : '👤 Usuario'}
          </span>
          <button className="logout-btn" onClick={logout}>Cerrar Sesión</button>
        </div>
      </header>

      <div className="buscador">
        <input type="text" placeholder="Buscar por nombre..." value={busqueda} onChange={(e) => handleBusqueda(e.target.value)} />
        <button onClick={cargarProductos} disabled={loading}>Cargar Productos</button>
      </div>

      {esAdmin && (
        <div className="formulario">
          <input 
            type="text" 
            placeholder="Nombre del helado" 
            value={nuevoProducto.nombre} 
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })} 
          />
          <input 
            type="number" 
            step="0.01" 
            placeholder="Precio (€)" 
            value={nuevoProducto.precio} 
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })} 
          />
          <input 
            type="text" 
            placeholder="Descripción" 
            value={nuevoProducto.descripcion} 
            onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })} 
          />
          
          {/* Input de imagen */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImagenChange}
              style={{ flex: 1 }}
            />
            {previewImagen && (
              <img 
                src={previewImagen} 
                alt="Preview" 
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  objectFit: 'cover', 
                  borderRadius: '8px',
                  border: '2px solid #ff6600'
                }} 
              />
            )}
          </div>

          <button onClick={handleCrear} disabled={loading}>Añadir</button>
        </div>
      )}

      {loading && <div className="spinner">⏳ Cargando...</div>}
      {mensaje && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

      <table>
        <thead>
          <tr>
            <th>Imagen</th>
            <th onClick={() => ordenarPor('nombre')}>Nombre</th>
            <th onClick={() => ordenarPor('precio')}>Precio (€)</th>
            <th onClick={() => ordenarPor('descripcion')}>Descripción</th>
            {esAdmin && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {visibles.length === 0 ? (
            <tr><td colSpan={esAdmin ? '5' : '4'} style={{ textAlign: 'center' }}>No hay productos</td></tr>
          ) : (
            visibles.map((p) => (
              <tr key={p._id}>
                {/* Columna de Imagen */}
                <td>
                  {editando?._id === p._id && esAdmin ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                      <input 
                        type="file"
                        ref={fileInputEditRef}
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImagenEditChange}
                        style={{ fontSize: '11px' }}
                      />
                      {(previewEditando || editando.imagen) && (
                        <img 
                          src={previewEditando || `${BASE_URL}${editando.imagen}`}
                          alt={editando.nombre}
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            objectFit: 'cover', 
                            borderRadius: '8px' 
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    p.imagen ? (
                      <img 
                        src={`${BASE_URL}${p.imagen}`}
                        alt={p.nombre}
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          objectFit: 'cover', 
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(`${BASE_URL}${p.imagen}`, '_blank')}
                      />
                    ) : (
                      <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        backgroundColor: '#f0f0f0',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        🍦
                      </div>
                    )
                  )}
                </td>

                {/* Columna Nombre */}
                <td>
                  {esAdmin && editando?._id === p._id ? 
                    <input type="text" value={editando.nombre} onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} /> 
                    : p.nombre
                  }
                </td>

                {/* Columna Precio */}
                <td>
                  {esAdmin && editando?._id === p._id ? 
                    <input type="number" step="0.01" value={editando.precio} onChange={(e) => setEditando({ ...editando, precio: e.target.value })} /> 
                    : `${p.precio.toFixed(2)}€`
                  }
                </td>

                {/* Columna Descripción */}
                <td>
                  {esAdmin && editando?._id === p._id ? 
                    <input type="text" value={editando.descripcion} onChange={(e) => setEditando({ ...editando, descripcion: e.target.value })} /> 
                    : p.descripcion
                  }
                </td>

                {/* Columna Acciones (solo Admin) */}
                {esAdmin && (
                  <td>
                    {editando?._id === p._id ? (
                      <>
                        <button onClick={() => handleGuardar(p._id)} disabled={loading}>💾 Guardar</button>
                        <button onClick={() => {
                          setEditando(null);
                          setImagenEditando(null);
                          setPreviewEditando(null);
                        }}>❌</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditar(p)}>✏️ Editar</button>
                        <button onClick={() => handleEliminar(p._id)}>🗑️ Eliminar</button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="paginacion">
        {totalPaginas > 1 && Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
          <button key={num} onClick={() => setPaginaActual(num)} style={{ background: num === paginaActual ? '#0056b3' : 'white', color: num === paginaActual ? 'white' : '#ff6600' }}>{num}</button>
        ))}
      </div>
    </div>
  );
}