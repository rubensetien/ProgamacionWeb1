import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = 'http://localhost:3001';

export default function ProductosList() {
  const { usuario, logout, crearHeaderAuth } = useAuth();
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
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', precio: '', descripcion: '' });

  useEffect(() => { cargarProductos(); }, []);

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  };

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/productos`, { headers: crearHeaderAuth() });
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
      const res = await fetch(`${API_URL}/productos?busqueda=${encodeURIComponent(valor)}`, { headers: crearHeaderAuth() });
      if (!res.ok) throw new Error('Error en búsqueda');
      const data = await res.json();
      setProductos(data);
    } catch (err) {
      mostrarMensaje('Error en búsqueda', 'error');
    } finally {
      setLoading(false);
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
      const res = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: crearHeaderAuth(),
        body: JSON.stringify(nuevoProducto),
      });
      if (!res.ok) throw new Error('Error al añadir producto');
      setNuevoProducto({ nombre: '', precio: '', descripcion: '' });
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
      const res = await fetch(`${API_URL}/productos/${id}`, { method: 'DELETE', headers: crearHeaderAuth() });
      if (!res.ok) throw new Error('Error al eliminar');
      cargarProductos();
      mostrarMensaje('Producto eliminado', 'ok');
    } catch (err) {
      mostrarMensaje('Error al eliminar producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (producto) => { setEditando({ ...producto }); };

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
      const res = await fetch(`${API_URL}/productos/${id}`, {
        method: 'PUT',
        headers: crearHeaderAuth(),
        body: JSON.stringify(editando),
      });
      if (!res.ok) throw new Error('Error al actualizar');
      const data = await res.json();
      setProductos(productos.map((p) => (p._id === id ? data : p)));
      setEditando(null);
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
          <input type="text" placeholder="Nombre del helado" value={nuevoProducto.nombre} onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })} />
          <input type="number" step="0.01" placeholder="Precio (€)" value={nuevoProducto.precio} onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })} />
          <input type="text" placeholder="Descripción" value={nuevoProducto.descripcion} onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })} />
          <button onClick={handleCrear} disabled={loading}>Añadir</button>
        </div>
      )}

      {loading && <div className="spinner">⏳ Cargando...</div>}
      {mensaje && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

      <table>
        <thead>
          <tr>
            <th onClick={() => ordenarPor('nombre')}>Nombre</th>
            <th onClick={() => ordenarPor('precio')}>Precio (€)</th>
            <th onClick={() => ordenarPor('descripcion')}>Descripción</th>
            {esAdmin && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {visibles.length === 0 ? (
            <tr><td colSpan={esAdmin ? '4' : '3'} style={{ textAlign: 'center' }}>No hay productos</td></tr>
          ) : (
            visibles.map((p) => (
              <tr key={p._id}>
                <td>{esAdmin && editando?._id === p._id ? <input type="text" value={editando.nombre} onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} /> : p.nombre}</td>
                <td>{esAdmin && editando?._id === p._id ? <input type="number" step="0.01" value={editando.precio} onChange={(e) => setEditando({ ...editando, precio: e.target.value })} /> : `${p.precio.toFixed(2)}€`}</td>
                <td>{esAdmin && editando?._id === p._id ? <input type="text" value={editando.descripcion} onChange={(e) => setEditando({ ...editando, descripcion: e.target.value })} /> : p.descripcion}</td>
                {esAdmin && (<td>{editando?._id === p._id ? (<><button onClick={() => handleGuardar(p._id)} disabled={loading}>💾 Guardar</button><button onClick={() => setEditando(null)}>❌</button></>) : (<><button onClick={() => handleEditar(p)}>✏️ Editar</button><button onClick={() => handleEliminar(p._id)}>🗑️ Eliminar</button></>)}</td>)}
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
