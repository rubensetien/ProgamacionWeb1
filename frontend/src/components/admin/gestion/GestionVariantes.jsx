import { useState, useEffect } from 'react';
import ImageUploader from '../common/ImageUploader';
import '../../../styles/admin/gestion/GestionVariantes.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const GestionVariantes = () => {
  const [variantes, setVariantes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [varianteActual, setVarianteActual] = useState(null);
  const [notificacion, setNotificacion] = useState({ mostrar: false, mensaje: '', tipo: '' });

  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    descripcion: '',
    precio: '',
    color: '#3498db',
    imagen: '',
    vegano: false,
    sinGluten: false,
    sinLactosa: false,
    disponible: true
  });

  const coloresDisponibles = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
    '#9b59b6', '#1abc9c', '#34495e', '#e67e22',
    '#95a5a6', '#d35400'
  ];

  useEffect(() => {
    cargarVariantes();
    cargarCategorias();
  }, []);

  const cargarVariantes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/variantes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setVariantes(data.data);
      }
    } catch (error) {
      console.error('Error cargando variantes:', error);
    }
  };

  const cargarCategorias = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/categorias`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCategorias(data.data);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const abrirModal = (variante = null) => {
    if (variante) {
      setModoEdicion(true);
      setVarianteActual(variante);
      setFormData({
        nombre: variante.nombre,
        categoria: variante.categoria._id,
        descripcion: variante.descripcion || '',
        precio: variante.precio || '',
        color: variante.color || '#3498db',
        imagen: variante.imagen || '',
        vegano: variante.vegano || false,
        sinGluten: variante.sinGluten || false,
        sinLactosa: variante.sinLactosa || false,
        disponible: variante.disponible !== false
      });
    } else {
      setModoEdicion(false);
      setVarianteActual(null);
      setFormData({
        nombre: '',
        categoria: '',
        descripcion: '',
        precio: '',
        color: '#3498db',
        imagen: '',
        vegano: false,
        sinGluten: false,
        sinLactosa: false,
        disponible: true
      });
    }
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setModoEdicion(false);
    setVarianteActual(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const url = modoEdicion
        ? `${API_URL}/api/variantes/${varianteActual._id}`
        : `${API_URL}/api/variantes`;

      const response = await fetch(url, {
        method: modoEdicion ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        mostrarNotificacion(
          modoEdicion ? 'Sabor actualizado correctamente' : 'Sabor creado correctamente',
          'success'
        );
        cargarVariantes();
        cerrarModal();
      } else {
        mostrarNotificacion(data.message || 'Error al guardar', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarNotificacion('Error al guardar el sabor', 'error');
    }
  };

  const eliminarVariante = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este sabor?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/variantes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        mostrarNotificacion('Sabor eliminado correctamente', 'success');
        cargarVariantes();
      } else {
        mostrarNotificacion(data.message || 'Error al eliminar', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarNotificacion('Error al eliminar el sabor', 'error');
    }
  };

  const mostrarNotificacion = (mensaje, tipo) => {
    setNotificacion({ mostrar: true, mensaje, tipo });
    setTimeout(() => {
      setNotificacion({ mostrar: false, mensaje: '', tipo: '' });
    }, 3000);
  };

  const variantesFiltradas = variantes.filter(v => {
    const matchCategoria = !filtroCategoria || v.categoria._id === filtroCategoria;
    const matchBusqueda = !busqueda ||
      v.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    return matchCategoria && matchBusqueda;
  });

  return (
    <div className="gestion-container">
      <div className="gestion-header">
        <div>
          <h2>Gestión de Sabores</h2>
          <span className="count-badge">{variantesFiltradas.length} sabores</span>
        </div>
        <button className="btn-nuevo" onClick={() => abrirModal()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Sabor
        </button>
      </div>

      <div className="filtros-container">
        <input
          type="text"
          className="filtro-busqueda"
          placeholder="Buscar sabor..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select
          className="filtro-select"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.nombre}</option>
          ))}
        </select>
      </div>

      <div className="variantes-grid">
        {variantesFiltradas.map(variante => (
          <div key={variante._id} className="variante-card">
            <div className="variante-color-bar" style={{ backgroundColor: variante.color }} />

            {variante.imagen && (
              <div className="variante-imagen">
                <img src={`${API_URL}${variante.imagen}`} alt={variante.nombre} />
              </div>
            )}

            <div className="variante-contenido">
              <h3>{variante.nombre}</h3>
              <span className="variante-categoria">{variante.categoria.nombre}</span>
              {variante.descripcion && (
                <p className="variante-descripcion">{variante.descripcion}</p>
              )}

              <div className="variante-tags">
                {variante.vegano && <span className="tag tag-vegano">🌱 Vegano</span>}
                {variante.sinGluten && <span className="tag tag-sin-gluten">🌾 Sin Gluten</span>}
                {variante.sinLactosa && <span className="tag tag-sin-lactosa">🥛 Sin Lactosa</span>}
              </div>

              <div className="variante-footer">
                <span className="variante-precio">{(variante?.precio || 0).toFixed(2)}€</span>
                <div className="variante-acciones">
                  <button className="btn-accion editar" onClick={() => abrirModal(variante)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button className="btn-accion eliminar" onClick={() => eliminarVariante(variante._id)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-cerrar" onClick={cerrarModal}>×</button>
            <h2>{modoEdicion ? 'Editar Sabor' : 'Nuevo Sabor'}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Categoría *</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {categorias.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows="3"
                />
              </div>

              <ImageUploader
                tipo="variante"
                imagenActual={formData.imagen ? `${API_URL}${formData.imagen}` : null}
                onImagenCargada={(url) => setFormData({ ...formData, imagen: url })}
                nombre={formData.nombre}
              />

              <div className="form-row">
                <div className="form-group">
                  <label>Precio (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Color</label>
                  <div className="colores-selector">
                    {coloresDisponibles.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color-opcion ${formData.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.vegano}
                    onChange={(e) => setFormData({ ...formData, vegano: e.target.checked })}
                  />
                  🌱 Vegano
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.sinGluten}
                    onChange={(e) => setFormData({ ...formData, sinGluten: e.target.checked })}
                  />
                  🌾 Sin Gluten
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.sinLactosa}
                    onChange={(e) => setFormData({ ...formData, sinLactosa: e.target.checked })}
                  />
                  🥛 Sin Lactosa
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.disponible}
                    onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                  />
                  Disponible
                </label>
              </div>

              <div className="modal-acciones">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  {modoEdicion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notificacion.mostrar && (
        <div className={`notificacion ${notificacion.tipo}`}>
          {notificacion.mensaje}
        </div>
      )}
    </div>
  );
};

export default GestionVariantes;
