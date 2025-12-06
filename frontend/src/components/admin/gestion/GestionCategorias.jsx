import { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/admin/gestion/GestionCategorias.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const GestionCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [notificacion, setNotificacion] = useState({ mostrar: false, tipo: '', mensaje: '' });

  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    color: '#ff6600',
    icono: '🍦',
    orden: 1,
    activo: true,
    requiereSabor: false
  });

  const iconosDisponibles = ['🍦', '🍰', '🥐', '☕', '🧁', '🍪', '🎂', '🥧', '🍩', '🧊'];
  const coloresDisponibles = [
    '#ff6600', '#3498db', '#9b59b6', '#e74c3c', '#f39c12',
    '#1abc9c', '#2ecc71', '#34495e', '#e67e22', '#95a5a6'
  ];

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/api/categorias`, config);
      setCategorias(response.data.data || []);
    } catch (error) {
      console.error('Error cargando categorías:', error);
      mostrarNotificacion('error', 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const mostrarNotificacion = (tipo, mensaje) => {
    setNotificacion({ mostrar: true, tipo, mensaje });
    setTimeout(() => setNotificacion({ mostrar: false, tipo: '', mensaje: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (modoEdicion && categoriaEditando) {
        await axios.put(`${API_URL}/api/categorias/${categoriaEditando._id}`, formulario, config);
        mostrarNotificacion('success', 'Categoría actualizada correctamente');
      } else {
        await axios.post(`${API_URL}/api/categorias`, formulario, config);
        mostrarNotificacion('success', 'Categoría creada correctamente');
      }

      await cargarCategorias();
      cerrarModal();
    } catch (error) {
      console.error('Error guardando categoría:', error);
      mostrarNotificacion('error', 'Error al guardar la categoría');
    }
  };

  const handleEditar = (categoria) => {
    setModoEdicion(true);
    setCategoriaEditando(categoria);
    setFormulario({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      color: categoria.color || '#ff6600',
      icono: categoria.icono || '🍦',
      orden: categoria.orden || 1,
      activo: categoria.activo,
      requiereSabor: categoria.requiereSabor || false
    });
    setMostrarModal(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría? Los productos asociados quedarán sin categoría.')) return;

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/api/categorias/${id}`, config);
      mostrarNotificacion('success', 'Categoría eliminada correctamente');
      await cargarCategorias();
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      mostrarNotificacion('error', 'Error al eliminar la categoría');
    }
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setCategoriaEditando(null);
    setFormulario({
      nombre: '',
      descripcion: '',
      color: '#ff6600',
      icono: '🍦',
      orden: categorias.length + 1,
      activo: true,
      requiereSabor: false
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setModoEdicion(false);
    setCategoriaEditando(null);
  };

  if (loading) {
    return (
      <div className="gestion-loading">
        <div className="spinner"></div>
        <p>Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="gestion-container">
      {/* Header */}
      <div className="gestion-header">
        <div className="header-info">
          <span className="count-badge">{categorias.length}</span>
          <span className="count-text">categorías totales</span>
        </div>
        <button className="btn-nuevo" onClick={abrirModalNuevo}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva Categoría
        </button>
      </div>

      {/* Grid de Categorías */}
      <div className="categorias-grid">
        {categorias.map(categoria => (
          <div key={categoria._id} className="categoria-card" style={{ borderColor: categoria.color }}>
            <div className="categoria-icon" style={{ background: categoria.color + '20' }}>
              <span style={{ fontSize: '48px' }}>{categoria.icono}</span>
            </div>
            <div className="categoria-info">
              <h3>{categoria.nombre}</h3>
              <p>{categoria.descripcion}</p>
              <div className="categoria-meta">
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                  {categoria.productosCount || 0} productos
                </span>
                {categoria.requiereSabor && (
                  <span className="meta-item" style={{ color: '#3498db' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                    Requiere sabor
                  </span>
                )}
                <span className={`estado-badge ${categoria.activo ? 'activo' : 'inactivo'}`}>
                  {categoria.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
            <div className="categoria-acciones">
              <button className="btn-accion editar" onClick={() => handleEditar(categoria)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button className="btn-accion eliminar" onClick={() => handleEliminar(categoria._id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {categorias.length === 0 && (
        <div className="sin-resultados">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
          </svg>
          <p>No hay categorías creadas</p>
          <button className="btn-crear-primero" onClick={abrirModalNuevo}>
            Crear primera categoría
          </button>
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modoEdicion ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button className="btn-cerrar" onClick={cerrarModal}>×</button>
            </div>

            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formulario.nombre}
                  onChange={(e) => setFormulario({...formulario, nombre: e.target.value})}
                  placeholder="Ej: Helados"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formulario.descripcion}
                  onChange={(e) => setFormulario({...formulario, descripcion: e.target.value})}
                  placeholder="Descripción breve de la categoría..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Icono</label>
                  <div className="iconos-selector">
                    {iconosDisponibles.map(icono => (
                      <button
                        key={icono}
                        type="button"
                        className={`icono-opcion ${formulario.icono === icono ? 'selected' : ''}`}
                        onClick={() => setFormulario({...formulario, icono})}
                      >
                        {icono}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Color</label>
                  <div className="colores-selector">
                    {coloresDisponibles.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color-opcion ${formulario.color === color ? 'selected' : ''}`}
                        style={{ background: color }}
                        onClick={() => setFormulario({...formulario, color})}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Orden</label>
                  <input
                    type="number"
                    min="1"
                    value={formulario.orden}
                    onChange={(e) => setFormulario({...formulario, orden: parseInt(e.target.value)})}
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formulario.activo}
                      onChange={(e) => setFormulario({...formulario, activo: e.target.checked})}
                    />
                    <span>Categoría activa</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formulario.requiereSabor}
                    onChange={(e) => setFormulario({...formulario, requiereSabor: e.target.checked})}
                  />
                  <span>Requiere Sabor o Variante</span>
                </label>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#7f8c8d', 
                  marginTop: '8px',
                  marginLeft: '28px' 
                }}>
                  Si está activado, todos los productos de esta categoría deberán tener un sabor o variante asignado (ejemplo: Helados requieren sabor Nata, Chocolate, etc.)
                </p>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  {modoEdicion ? 'Actualizar' : 'Crear'} Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notificación */}
      {notificacion.mostrar && (
        <div className={`notificacion ${notificacion.tipo}`}>
          {notificacion.mensaje}
        </div>
      )}
    </div>
  );
};

export default GestionCategorias;
