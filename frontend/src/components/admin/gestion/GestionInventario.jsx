import { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/admin/GestionComun.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const GestionInventario = () => {
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [notificacion, setNotificacion] = useState({ mostrar: false, tipo: '', mensaje: '' });
  const [busqueda, setBusqueda] = useState('');

  const [formulario, setFormulario] = useState({
    cantidad: '',
    motivo: '',
    tipo: 'entrada' // entrada, salida, ajuste
  });

  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/api/inventario`, config);
      setInventario(response.data.data || []);
    } catch (error) {
      console.error('Error cargando inventario:', error);
      mostrarNotificacion('error', 'Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  const mostrarNotificacion = (tipo, mensaje) => {
    setNotificacion({ mostrar: true, tipo, mensaje });
    setTimeout(() => setNotificacion({ mostrar: false, tipo: '', mensaje: '' }), 3000);
  };

  const abrirModalAjuste = (item) => {
    setItemEditando(item);
    setFormulario({
      cantidad: '',
      motivo: '',
      tipo: 'entrada'
    });
    setMostrarModal(true);
  };

  const handleAjustarStock = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const cantidad = parseInt(formulario.cantidad);
      
      if (isNaN(cantidad) || cantidad < 0) {
        mostrarNotificacion('error', 'La cantidad debe ser un número válido');
        return;
      }

      // ✅ ENVIAR DATOS CORRECTOS AL BACKEND
      const payload = {
        tipoMovimiento: formulario.tipo, // 'entrada', 'salida', o 'ajuste'
        cantidad: cantidad,
        motivo: formulario.motivo || `${formulario.tipo} de stock`
      };

      console.log('📤 Enviando al backend:', payload);

      await axios.patch(
        `${API_URL}/api/inventario/${itemEditando._id}`,
        payload,
        config
      );

      mostrarNotificacion('success', 'Stock actualizado correctamente');
      await cargarInventario();
      cerrarModal();
    } catch (error) {
      console.error('Error ajustando stock:', error);
      const mensaje = error.response?.data?.message || 'Error al ajustar stock';
      mostrarNotificacion('error', mensaje);
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setItemEditando(null);
  };

  const getEstadoStock = (item) => {
    const stock = item.stockActual || 0;
    const minimo = item.stockMinimo || 5;
    
    if (stock === 0) return { clase: 'agotado', texto: 'AGOTADO' };
    if (stock <= minimo) return { clase: 'critico', texto: 'CRÍTICO' };
    if (stock <= minimo * 1.5) return { clase: 'bajo', texto: 'BAJO' };
    return { clase: 'normal', texto: 'NORMAL' };
  };

  const calcularNuevoStock = () => {
    if (!formulario.cantidad || !itemEditando) return null;
    
    const cantidad = parseInt(formulario.cantidad);
    const stockActual = itemEditando.stockActual || 0;
    
    if (formulario.tipo === 'entrada') {
      return stockActual + cantidad;
    } else if (formulario.tipo === 'salida') {
      return Math.max(0, stockActual - cantidad);
    } else if (formulario.tipo === 'ajuste') {
      return cantidad;
    }
    return null;
  };

  const inventarioFiltrado = inventario.filter(item =>
    item.producto?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    item.producto?.sku?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="gestion-loading">
        <div className="spinner"></div>
        <p>Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="gestion-container">
      {/* Header */}
      <div className="gestion-header">
        <div className="header-info">
          <span className="count-badge">{inventario.length}</span>
          <span className="count-text">productos en inventario</span>
        </div>
        <div className="filtro-busqueda">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Inventario */}
      <div className="inventario-tabla">
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Ubicación</th>
              <th>Stock Actual</th>
              <th>Stock Mínimo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inventarioFiltrado.map(item => {
              const estado = getEstadoStock(item);
              return (
                <tr key={item._id} className={estado.clase}>
                  <td>
                    <code className="sku-badge">{item.producto?.sku || 'N/A'}</code>
                  </td>
                  <td>
                    <strong>{item.producto?.nombre || 'Sin nombre'}</strong>
                  </td>
                  <td>
                    <span className="ubicacion-tag">
                      {item.ubicacion || 'Obrador principal'}
                    </span>
                  </td>
                  <td>
                    <span className="stock-cantidad">{item.stockActual || 0}</span>
                  </td>
                  <td className="text-muted">{item.stockMinimo || 5}</td>
                  <td>
                    <span className={`estado-stock ${estado.clase}`}>
                      {estado.texto}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-accion ajustar"
                      onClick={() => abrirModalAjuste(item)}
                      title="Ajustar stock"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Ajustar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Ajuste de Stock */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajustar Stock</h2>
              <button className="btn-cerrar" onClick={cerrarModal}>×</button>
            </div>

            <form className="modal-body" onSubmit={handleAjustarStock}>
              <div className="info-producto">
                <p><strong>{itemEditando?.producto?.nombre}</strong></p>
                <p className="text-muted">Stock actual: {itemEditando?.stockActual || 0} unidades</p>
              </div>

              <div className="form-group">
                <label>Tipo de Movimiento</label>
                <div className="tipo-movimiento-selector">
                  <button
                    type="button"
                    className={`tipo-btn ${formulario.tipo === 'entrada' ? 'active' : ''}`}
                    onClick={() => setFormulario({...formulario, tipo: 'entrada'})}
                  >
                    ➕ Entrada
                  </button>
                  <button
                    type="button"
                    className={`tipo-btn ${formulario.tipo === 'salida' ? 'active' : ''}`}
                    onClick={() => setFormulario({...formulario, tipo: 'salida'})}
                  >
                    ➖ Salida
                  </button>
                  <button
                    type="button"
                    className={`tipo-btn ${formulario.tipo === 'ajuste' ? 'active' : ''}`}
                    onClick={() => setFormulario({...formulario, tipo: 'ajuste'})}
                  >
                    🔧 Ajuste
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>
                  {formulario.tipo === 'ajuste' ? 'Nuevo Stock Total *' : 'Cantidad *'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formulario.cantidad}
                  onChange={(e) => setFormulario({...formulario, cantidad: e.target.value})}
                  placeholder={formulario.tipo === 'ajuste' ? 'Ej: 20' : 'Ej: 5'}
                  required
                />
                {formulario.cantidad && (
                  <p className="helper-text" style={{ color: '#3498db', marginTop: '8px' }}>
                    Nuevo stock: <strong>{calcularNuevoStock()}</strong>
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Motivo</label>
                <textarea
                  value={formulario.motivo}
                  onChange={(e) => setFormulario({...formulario, motivo: e.target.value})}
                  placeholder="Describe el motivo del ajuste..."
                  rows="3"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Confirmar Ajuste
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

export default GestionInventario;
