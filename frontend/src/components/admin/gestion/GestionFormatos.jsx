import { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/admin/GestionComun.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const GestionFormatos = () => {
  const [formatos, setFormatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formatoEditando, setFormatoEditando] = useState(null);
  const [notificacion, setNotificacion] = useState({ mostrar: false, tipo: '', mensaje: '' });

  const [formulario, setFormulario] = useState({
    nombre: '',
    tipo: 'volumen',
    capacidad: '',
    unidad: 'L',
    precioBase: '',
    tipoEnvase: 'tarrina-plastico',
    reciclable: true,
    tipoVenta: 'envasado',
    seVendeOnline: true,
    seVendeEnPuntoVenta: true,
    descripcion: '',
    activo: true,
    orden: 1
  });

  const tiposFormato = [
    { value: 'volumen', label: 'Volumen', icon: '📦' },
    { value: 'peso', label: 'Peso', icon: '⚖️' },
    { value: 'unidad', label: 'Unidad', icon: '🔢' },
    { value: 'porcion', label: 'Porción', icon: '🍽️' }
  ];

  const unidades = {
    volumen: ['L', 'ml'],
    peso: ['kg', 'g'],
    unidad: ['unidades'],
    porcion: ['porciones']
  };

  const tiposEnvase = [
    'tarrina-plastico', 'garrafa', 'carton', 'vidrio',
    'comestible', 'papel', 'otro'
  ];

  useEffect(() => {
    cargarFormatos();
  }, []);

  const cargarFormatos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/api/formatos`, config);
      setFormatos(response.data.data || []);
    } catch (error) {
      console.error('Error cargando formatos:', error);
      mostrarNotificacion('error', 'Error al cargar formatos');
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

      const datos = {
        ...formulario,
        capacidad: parseFloat(formulario.capacidad),
        precioBase: parseFloat(formulario.precioBase),
        orden: parseInt(formulario.orden)
      };

      if (!formulario.nombre.trim()) {
        mostrarNotificacion('error', '❌ El nombre es obligatorio');
        return;
      }

      if (modoEdicion && formatoEditando) {
        await axios.put(`${API_URL}/api/formatos/${formatoEditando._id}`, datos, config);
        mostrarNotificacion('success', '✅ Formato actualizado');
      } else {
        await axios.post(`${API_URL}/api/formatos`, datos, config);
        mostrarNotificacion('success', '✅ Formato creado');
      }

      await cargarFormatos();
      cerrarModal();
    } catch (error) {
      console.error('Error guardando formato:', error);
      const mensaje = error.response?.data?.message || '❌ Error al guardar';
      mostrarNotificacion('error', mensaje);
    }
  };

  const handleEditar = (formato) => {
    setModoEdicion(true);
    setFormatoEditando(formato);
    setFormulario({
      nombre: formato.nombre,
      tipo: formato.tipo,
      capacidad: formato.capacidad,
      unidad: formato.unidad,
      precioBase: formato.precioBase,
      tipoEnvase: formato.tipoEnvase || 'tarrina-plastico',
      reciclable: formato.reciclable ?? true,
      tipoVenta: formato.tipoVenta || 'envasado',
      seVendeOnline: formato.seVendeOnline ?? true,
      seVendeEnPuntoVenta: formato.seVendeEnPuntoVenta ?? true,
      descripcion: formato.descripcion || '',
      activo: formato.activo,
      orden: formato.orden || 1
    });
    setMostrarModal(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este formato?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/api/formatos/${id}`, config);
      mostrarNotificacion('success', '✅ Formato eliminado');
      await cargarFormatos();
    } catch (error) {
      console.error('Error eliminando formato:', error);
      mostrarNotificacion('error', '❌ Error al eliminar');
    }
  };

  const abrirModalNuevo = () => {
    setModoEdicion(false);
    setFormatoEditando(null);
    setFormulario({
      nombre: '',
      tipo: 'volumen',
      capacidad: '',
      unidad: 'L',
      precioBase: '',
      tipoEnvase: 'tarrina-plastico',
      reciclable: true,
      tipoVenta: 'envasado',
      seVendeOnline: true,
      seVendeEnPuntoVenta: true,
      descripcion: '',
      activo: true,
      orden: formatos.length + 1
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setModoEdicion(false);
    setFormatoEditando(null);
  };

  if (loading) {
    return (
      <div className="gestion-loading">
        <div className="spinner"></div>
        <p>Cargando formatos...</p>
      </div>
    );
  }

  return (
    <div className="gestion-container">
      {/* Header */}
      <div className="gestion-header">
        <div className="header-info">
          <span className="count-badge">{formatos.length}</span>
          <span className="count-text">formatos totales</span>
        </div>
        <button className="btn-nuevo" onClick={abrirModalNuevo}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo Formato
        </button>
      </div>

      {/* Grid de Formatos */}
      <div className="formatos-grid">
        {formatos.map(formato => (
          <div key={formato._id} className="formato-card">
            <div className="formato-icon">
              {tiposFormato.find(t => t.value === formato.tipo)?.icon || '📦'}
            </div>
            <div className="formato-content">
              <h3>{formato.nombre}</h3>
              <div className="formato-detalles">
                <div className="detalle-item">
                  <span className="detalle-label">Capacidad:</span>
                  <span className="detalle-valor">{formato.capacidad} {formato.unidad}</span>
                </div>
                <div className="detalle-item">
                  <span className="detalle-label">Tipo:</span>
                  <span className="detalle-valor">{formato.tipo}</span>
                </div>
                <div className="detalle-item">
                  <span className="detalle-label">Envase:</span>
                  <span className="detalle-valor">{formato.tipoEnvase}</span>
                </div>
                <div className="detalle-item">
                  <span className="detalle-label">Precio Base:</span>
                  <span className="detalle-valor precio">€{formato.precioBase?.toFixed(2)}</span>
                </div>
              </div>
              <div className="formato-tags">
                {formato.reciclable && <span className="tag reciclable">♻️ Reciclable</span>}
                {formato.seVendeOnline && <span className="tag online">🌐 Online</span>}
                {formato.seVendeEnPuntoVenta && <span className="tag tienda">🏪 Tienda</span>}
              </div>
              <div className="formato-estado">
                <span className={`estado-badge ${formato.activo ? 'activo' : 'inactivo'}`}>
                  {formato.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
            <div className="formato-acciones">
              <button className="btn-accion editar" onClick={() => handleEditar(formato)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button className="btn-accion eliminar" onClick={() => handleEliminar(formato._id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modoEdicion ? 'Editar Formato' : 'Nuevo Formato'}</h2>
              <button className="btn-cerrar" onClick={cerrarModal}>×</button>
            </div>

            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formulario.nombre}
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                  placeholder="Ej: Tarrina 0.5L"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo *</label>
                  <select
                    value={formulario.tipo}
                    onChange={(e) => {
                      const nuevoTipo = e.target.value;
                      setFormulario({
                        ...formulario,
                        tipo: nuevoTipo,
                        unidad: unidades[nuevoTipo][0]
                      });
                    }}
                    required
                  >
                    {tiposFormato.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.icon} {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Capacidad *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formulario.capacidad}
                    onChange={(e) => setFormulario({ ...formulario, capacidad: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Unidad *</label>
                  <select
                    value={formulario.unidad}
                    onChange={(e) => setFormulario({ ...formulario, unidad: e.target.value })}
                    required
                  >
                    {unidades[formulario.tipo]?.map(unidad => (
                      <option key={unidad} value={unidad}>{unidad}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Precio Base (€) *</label>
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
                  <label>Tipo de Envase</label>
                  <select
                    value={formulario.tipoEnvase}
                    onChange={(e) => setFormulario({ ...formulario, tipoEnvase: e.target.value })}
                  >
                    {tiposEnvase.map(envase => (
                      <option key={envase} value={envase}>
                        {envase.replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Orden</label>
                  <input
                    type="number"
                    min="1"
                    value={formulario.orden}
                    onChange={(e) => setFormulario({ ...formulario, orden: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formulario.descripcion}
                  onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })}
                  placeholder="Descripción del formato..."
                  rows="2"
                />
              </div>

              <div className="form-group-checks">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formulario.reciclable}
                    onChange={(e) => setFormulario({ ...formulario, reciclable: e.target.checked })}
                  />
                  <span>♻️ Reciclable</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formulario.seVendeOnline}
                    onChange={(e) => setFormulario({ ...formulario, seVendeOnline: e.target.checked })}
                  />
                  <span>🌐 Venta Online</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formulario.seVendeEnPuntoVenta}
                    onChange={(e) => setFormulario({ ...formulario, seVendeEnPuntoVenta: e.target.checked })}
                  />
                  <span>🏪 Venta en Tienda</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formulario.activo}
                    onChange={(e) => setFormulario({ ...formulario, activo: e.target.checked })}
                  />
                  <span>Formato Activo</span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  {modoEdicion ? 'Actualizar' : 'Crear'} Formato
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

export default GestionFormatos;
