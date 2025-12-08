import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, CheckCircle, ChefHat, PackageCheck, CheckCheck, XCircle, AlertCircle,
  MapPin, Calendar, ShoppingBag, CreditCard, FileText, Star, ArrowLeft, Package
} from 'lucide-react';
import '../../styles/cliente/MisPedidos.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const ESTADOS = {
  pendiente: { color: '#ffc107', icon: Clock, texto: 'Pendiente' },
  confirmado: { color: '#17a2b8', icon: CheckCircle, texto: 'Confirmado' },
  preparando: { color: '#fd7e14', icon: ChefHat, texto: 'Preparando' },
  listo: { color: '#28a745', icon: PackageCheck, texto: 'Listo para recoger' },
  entregado: { color: '#6c757d', icon: CheckCheck, texto: 'Entregado' },
  cancelado: { color: '#dc3545', icon: XCircle, texto: 'Cancelado' },
  'no-recogido': { color: '#6c757d', icon: AlertCircle, texto: 'No recogido' }
};

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const navigate = useNavigate();

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/pedidos/mis-pedidos`, {
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        setPedidos(data.data || []);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error cargando pedidos:', err);
      setError('Error al cargar tus pedidos');
    } finally {
      setLoading(false);
    }
  };

  const cancelarPedido = async (pedidoId) => {
    if (!confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/pedidos/${pedidoId}/cancelar`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          motivo: 'Cancelado por el cliente'
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Pedido cancelado correctamente');
        cargarPedidos();
      } else {
        alert(data.message || 'Error al cancelar el pedido');
      }
    } catch (err) {
      console.error('Error cancelando pedido:', err);
      alert('Error al cancelar el pedido');
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pedidosFiltrados = filtroEstado === 'todos'
    ? pedidos
    : pedidos.filter(p => p.estado === filtroEstado);

  if (loading) {
    return (
      <div className="mis-pedidos-container">
        <div className="pedidos-loading">
          <div className="spinner"></div>
          <p>Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mis-pedidos-container">
        <div className="pedidos-error">
          <p><XCircle className="icon-inline" /> {error}</p>
          <button onClick={cargarPedidos}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-pedidos-container">
      {/* Header */}
      <div className="pedidos-header">
        <div className="header-top">
          <button
            className="btn-volver-landing"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="icon-small" /> Volver al Inicio
          </button>
        </div>
        <div className="header-content">
          <div>
            <h1><Package className="icon-large" /> Mis Pedidos</h1>
            <p className="pedidos-subtitulo">
              Tienes {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
            </p>
          </div>
          <button
            className="btn-nuevo-pedido"
            onClick={() => navigate('/productos')}
          >
            + Hacer nuevo pedido
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="pedidos-filtros">
        <button
          className={`filtro-btn ${filtroEstado === 'todos' ? 'activo' : ''}`}
          onClick={() => setFiltroEstado('todos')}
        >
          Todos ({pedidos.length})
        </button>
        <button
          className={`filtro-btn ${filtroEstado === 'pendiente' ? 'activo' : ''}`}
          onClick={() => setFiltroEstado('pendiente')}
        >
          <Clock className="icon-small" /> Pendientes ({pedidos.filter(p => p.estado === 'pendiente').length})
        </button>
        <button
          className={`filtro-btn ${filtroEstado === 'listo' ? 'activo' : ''}`}
          onClick={() => setFiltroEstado('listo')}
        >
          <PackageCheck className="icon-small" /> Listos ({pedidos.filter(p => p.estado === 'listo').length})
        </button>
        <button
          className={`filtro-btn ${filtroEstado === 'entregado' ? 'activo' : ''}`}
          onClick={() => setFiltroEstado('entregado')}
        >
          <CheckCheck className="icon-small" /> Completados ({pedidos.filter(p => p.estado === 'entregado').length})
        </button>
      </div>

      {/* Lista de pedidos */}
      {pedidosFiltrados.length === 0 ? (
        <div className="pedidos-vacio">
          <div className="icono-vacio"><Package className="icon-huge" /></div>
          <h2>No hay pedidos {filtroEstado !== 'todos' ? 'en este estado' : ''}</h2>
          <p>Haz tu primer pedido y aparecerá aquí</p>
          <button
            className="btn-ir-productos"
            onClick={() => navigate('/productos')}
          >
            Ver productos
          </button>
        </div>
      ) : (
        <div className="pedidos-lista">
          {pedidosFiltrados.map(pedido => (
            <PedidoCard
              key={pedido._id}
              pedido={pedido}
              onCancelar={cancelarPedido}
              formatearFecha={formatearFecha}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PedidoCard({ pedido, onCancelar, formatearFecha }) {
  const [expandido, setExpandido] = useState(false);
  const estadoInfo = ESTADOS[pedido.estado] || ESTADOS.pendiente;
  const EstadoIcon = estadoInfo.icon;
  const puedeCancelar = ['pendiente', 'confirmado'].includes(pedido.estado);

  return (
    <div className="pedido-card">
      {/* Header del pedido */}
      <div className="pedido-header-card" onClick={() => setExpandido(!expandido)}>
        <div className="pedido-header-info">
          <div className="pedido-numero">
            <span className="numero-label">Pedido #</span>
            <span className="numero-valor">{pedido.numeroPedido}</span>
          </div>

          <div className="pedido-fecha">
            <span className="fecha-label">Realizado:</span>
            <span className="fecha-valor">
              {formatearFecha(pedido.fechaPedido)}
            </span>
          </div>
        </div>

        <div className="pedido-header-estado">
          <span
            className="pedido-estado-badge"
            style={{
              background: estadoInfo.color,
              color: 'white'
            }}
          >
            <EstadoIcon className="icon-small" /> {estadoInfo.texto}
          </span>

          <button className="btn-expandir">
            {expandido ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Contenido expandible */}
      {expandido && (
        <div className="pedido-contenido">
          {/* Información de recogida */}
          <div className="pedido-seccion">
            <h3><MapPin className="icon-section" /> Punto de recogida</h3>
            <div className="info-box">
              <p className="info-principal">
                {pedido.puntoVenta?.nombre || pedido.datosPuntoVenta?.nombre || 'Punto de venta no disponible'}
              </p>
              <p className="info-secundaria">
                {pedido.puntoVenta?.direccion?.calle || pedido.datosPuntoVenta?.direccion || ''}, {pedido.puntoVenta?.direccion?.ciudad || ''}
              </p>
              {(pedido.puntoVenta?.contacto?.telefono || pedido.datosPuntoVenta?.telefono) && (
                <p className="info-secundaria">
                  📞 {pedido.puntoVenta?.contacto?.telefono || pedido.datosPuntoVenta?.telefono}
                </p>
              )}
            </div>
          </div>

          {/* Fecha de recogida */}
          <div className="pedido-seccion">
            <h3><Calendar className="icon-section" /> Recogida programada</h3>
            <div className="info-box">
              <p className="info-principal">
                {pedido.fechaRecogida ? formatearFecha(pedido.fechaRecogida) : 'Fecha no disponible'}
              </p>
              {pedido.estado === 'listo' && (
                <p className="info-destacada" style={{ color: '#28a745', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PackageCheck className="icon-small" /> ¡Tu pedido está listo! Puedes pasar a recogerlo
                </p>
              )}
              {pedido.fechaRecogidaReal && (
                <p className="info-secundaria">
                  Recogido el: {formatearFecha(pedido.fechaRecogidaReal)}
                </p>
              )}
            </div>
          </div>

          {/* Items del pedido */}
          <div className="pedido-seccion">
            <h3><ShoppingBag className="icon-section" /> Productos ({pedido.items.length})</h3>
            <div className="pedido-items">
              {pedido.items.map((item, index) => (
                <div key={index} className="pedido-item">
                  <div className="item-info">
                    <span className="item-nombre">
                      {item.nombreVariante || item.variante?.nombre || item.producto?.nombre || 'Producto sin nombre'}
                    </span>
                    <span className="item-formato">
                      {item.nombreFormato || item.formato?.nombre || ''}
                    </span>
                  </div>
                  <div className="item-cantidad">
                    ×{item.cantidad}
                  </div>
                  <div className="item-precio">
                    {item.subtotal.toFixed(2)}€
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="pedido-seccion pedido-totales">
            <div className="total-linea">
              <span>Subtotal:</span>
              <span>{pedido.subtotal.toFixed(2)}€</span>
            </div>
            {pedido.descuentos > 0 && (
              <div className="total-linea descuento">
                <span>Descuentos:</span>
                <span>-{pedido.descuentos.toFixed(2)}€</span>
              </div>
            )}
            <div className="total-linea total-final">
              <span>Total:</span>
              <span>{pedido.total.toFixed(2)}€</span>
            </div>
          </div>

          {/* Método de pago */}
          <div className="pedido-seccion">
            <h3><CreditCard className="icon-section" /> Pago</h3>
            <div className="info-box">
              <p className="info-principal">
                {pedido.metodoPago === 'efectivo-tienda' && 'Efectivo en tienda'}
                {pedido.metodoPago === 'tarjeta-tienda' && 'Tarjeta en tienda'}
                {pedido.metodoPago === 'online-tarjeta' && 'Tarjeta (online)'}
                {pedido.metodoPago === 'transferencia' && 'Transferencia'}
                {pedido.metodoPago === 'pendiente' && 'Pendiente'}
              </p>
              <span
                className="estado-pago-badge"
                style={{
                  background: pedido.estadoPago === 'pagado' ? '#28a745' : '#ffc107',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {pedido.estadoPago === 'pagado' ? <CheckCircle className="icon-mini" /> : <Clock className="icon-mini" />}
                {pedido.estadoPago === 'pagado' ? 'Pagado' : 'Pendiente'}
              </span>
            </div>
          </div>

          {/* Notas */}
          {pedido.notas && (
            <div className="pedido-seccion">
              <h3><FileText className="icon-section" /> Notas</h3>
              <div className="info-box">
                <p className="info-secundaria">{pedido.notas}</p>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="pedido-acciones">
            {puedeCancelar && (
              <button
                className="btn-cancelar-pedido"
                onClick={() => onCancelar(pedido._id)}
              >
                <XCircle className="icon-small" /> Cancelar pedido
              </button>
            )}
            {pedido.estado === 'entregado' && !pedido.calificacion && (
              <button className="btn-calificar">
                <Star className="icon-small" /> Calificar pedido
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
