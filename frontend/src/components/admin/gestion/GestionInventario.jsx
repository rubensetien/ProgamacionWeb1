import { useState, useEffect } from 'react';
import axios from 'axios';
import Pagination from '../../common/Pagination';
import '../../../styles/admin/GestionComun.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const GestionInventario = () => {
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [notificacion, setNotificacion] = useState({ mostrar: false, tipo: '', mensaje: '' });
  const [busqueda, setBusqueda] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(3);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [formulario, setFormulario] = useState({
    cantidad: '',
    motivo: '',
    tipo: 'entrada' // entrada, salida, ajuste
  });

  useEffect(() => {
    cargarInventario();
  }, [page, limit, busqueda]);

  // Reset page when filtering
  useEffect(() => {
    setPage(1);
  }, [busqueda]);

  const cargarInventario = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let url = `${API_URL}/api/inventario?page=${page}&limit=${limit}`;
      if (busqueda) url += `&search=${encodeURIComponent(busqueda)}`;

      const response = await axios.get(url, config);
      const { data, total, pages } = response.data;

      setInventario(data || []);
      setTotal(total || 0);
      setTotalPages(pages || 1);
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
      tipo: 'entrada',
      fechaFabricacion: new Date().toISOString().split('T')[0] // Default hoy
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
        motivo: formulario.motivo || `${formulario.tipo} de stock`,
        fechaFabricacion: formulario.fechaFabricacion // ✅ Envío de fecha para lotes
      };

      console.log('📤 Enviando al backend:', payload);

      await axios.patch(
        `${API_URL}/api/inventario/${itemEditando._id}`,
        payload,
        config
      );

      mostrarNotificacion('success', 'Stock actualizado correctamente');
      await cargarInventario(); // Reload current page
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
      // Ajuste es complejo con lotes, mostraremos advertencia
      return cantidad; // Asumiendo reset total si no hay fecha, o cambio de lote
    }
    return null;
  };

  // Helper para formatear fecha de lotes
  const formatDate = (dateString) => {
    if (!dateString) return 'S/F';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="gestion-container">
      {/* Header */}
      <div className="gestion-header">
        <div className="header-info">
          <span className="count-badge">{total}</span>
          <span className="count-text">productos en inventario</span>
        </div>
        <div className="filtro-busqueda">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {loading && !inventario.length ? (
        <div className="gestion-loading">
          <div className="spinner"></div>
          <p>Cargando inventario...</p>
        </div>
      ) : (
        <>
          {/* Tabla de Inventario */}
          <div className="inventario-tabla">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Producto</th>
                  <th>Ubicación</th>
                  <th>Stock Total</th> {/* Renombrado */}
                  <th>Lotes</th> {/* Nueva columna */}
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inventario.map(item => {
                  const estado = getEstadoStock(item);
                  const tieneLotes = item.lotes && item.lotes.length > 0;

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
                      <td>
                        {tieneLotes ? (
                          <div className="lotes-mini-list">
                            {item.lotes.slice(0, 2).map((lote, idx) => (
                              <span key={idx} className="lote-tag" title={formatDate(lote.fechaFabricacion)}>
                                {formatDate(lote.fechaFabricacion)}: <strong>{lote.cantidad}</strong>
                              </span>
                            ))}
                            {item.lotes.length > 2 && <span className="lote-more">+{item.lotes.length - 2}</span>}
                          </div>
                        ) : (
                          <span className="text-muted text-small">Sin lotes</span>
                        )}
                      </td>
                      <td>
                        <span className={`estado-stock ${estado.clase}`}>
                          {estado.texto}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-accion ajustar"
                          onClick={() => abrirModalAjuste(item)}
                          title="Gestionar Stock y Lotes"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={total}
            itemsPerPage={limit}
            onItemsPerPageChange={setLimit}
            loading={loading}
          />
        </>
      )}

      {/* Modal Ajuste de Stock */}
      {mostrarModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content modal-medium" onClick={(e) => e.stopPropagation()}> {/* Modal más ancho */}
            <div className="modal-header">
              <h2>Gestionar Stock</h2>
              <button className="btn-cerrar" onClick={cerrarModal}>×</button>
            </div>

            <div className="modal-body-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Columna Izquierda: Formulario */}
              <form onSubmit={handleAjustarStock}>
                <div className="info-producto">
                  <p><strong>{itemEditando?.producto?.nombre}</strong></p>
                  <p className="text-muted">Stock Total: <strong>{itemEditando?.stockActual || 0}</strong></p>
                </div>

                <div className="form-group">
                  <label>Tipo de Movimiento</label>
                  <div className="tipo-movimiento-selector">
                    <button
                      type="button"
                      className={`tipo-btn ${formulario.tipo === 'entrada' ? 'active' : ''}`}
                      onClick={() => setFormulario({ ...formulario, tipo: 'entrada' })}
                    >
                      ➕ Entrada
                    </button>
                    <button
                      type="button"
                      className={`tipo-btn ${formulario.tipo === 'salida' ? 'active' : ''}`}
                      onClick={() => setFormulario({ ...formulario, tipo: 'salida' })}
                    >
                      ➖ Salida
                    </button>
                    <button
                      type="button"
                      className={`tipo-btn ${formulario.tipo === 'ajuste' ? 'active' : ''}`}
                      onClick={() => setFormulario({ ...formulario, tipo: 'ajuste' })}
                    >
                      🔧 Ajuste
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Fecha Fabricación / Lote *</label>
                  <input
                    type="date"
                    value={formulario.fechaFabricacion}
                    onChange={(e) => setFormulario({ ...formulario, fechaFabricacion: e.target.value })}
                    required
                  />
                  <p className="helper-text">
                    {formulario.tipo === 'entrada' ? 'Fecha de fabricación del nuevo lote.' : 'Selecciona la fecha del lote a afectar.'}
                  </p>
                </div>

                <div className="form-group">
                  <label>Cantidad *</label>
                  <input
                    type="number"
                    min="0"
                    value={formulario.cantidad}
                    onChange={(e) => setFormulario({ ...formulario, cantidad: e.target.value })}
                    placeholder="Ej: 5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Motivo</label>
                  <textarea
                    value={formulario.motivo}
                    onChange={(e) => setFormulario({ ...formulario, motivo: e.target.value })}
                    placeholder="Motivo..."
                    rows="2"
                  />
                </div>

                <div className="modal-footer-inline">
                  <button type="submit" className="btn-guardar full-width">
                    Confirmar Movimiento
                  </button>
                </div>
              </form>

              {/* Columna Derecha: Lista de Lotes Actuales */}
              <div className="lotes-panel">
                <h3>Lotes Disponibles</h3>
                {itemEditando?.lotes && itemEditando.lotes.length > 0 ? (
                  <div className="lotes-list-scroll">
                    {itemEditando.lotes
                      .sort((a, b) => new Date(a.fechaFabricacion) - new Date(b.fechaFabricacion))
                      .map((lote, index) => (
                        <div
                          key={index}
                          className="lote-item"
                          onClick={() => setFormulario({ ...formulario, fechaFabricacion: lote.fechaFabricacion.split('T')[0] })}
                          style={{ cursor: 'pointer', border: formulario.fechaFabricacion === lote.fechaFabricacion.split('T')[0] ? '2px solid #e67e22' : '1px solid #eee' }}
                        >
                          <div className="lote-date">📅 {formatDate(lote.fechaFabricacion)}</div>
                          <div className="lote-qty">Qt: <strong>{lote.cantidad}</strong></div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted">No hay lotes registrados.</p>
                )}
              </div>
            </div>
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
