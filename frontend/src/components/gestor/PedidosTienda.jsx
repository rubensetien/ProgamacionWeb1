import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, Clock, CheckCircle, AlertCircle, RefreshCw, Search, ChevronRight } from 'lucide-react';
import '../../styles/gestor/PanelTienda.css'; // Reusing store styles

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Estado Tabs
const TABS = [
  { id: 'activos', label: 'En Proceso' },
  { id: 'listos', label: 'Listos para Recoger' },
  { id: 'historial', label: 'Historial' }
];

const PedidosTienda = () => {
  const { usuario, token } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('activos');
  const [busqueda, setBusqueda] = useState('');

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      const headers = { 'Authorization': `Bearer ${token}` };
      // Pedimos más para filtrar en cliente o podríamos filtrar en back
      // Para simplificar, obtenemos una lista grande y filtramos. 
      // Idealmente el backend soportaría ?estado=X
      const res = await fetch(`${API_URL}/api/pedidos/tienda?limit=100`, { headers });
      const data = await res.json();

      if (data.success) {
        setPedidos(data.data);
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (usuario?.tiendaAsignada) {
      cargarPedidos();
    }
  }, [usuario, token]);

  const cambiarEstado = async (id, nuevoEstado) => {
    if (!confirm(`¿Cambiar estado a ${nuevoEstado}?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/pedidos/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      const data = await res.json();

      if (data.success) {
        // Recargar o actualizar localmente
        setPedidos(prev => prev.map(p => p._id === id ? { ...p, estado: nuevoEstado } : p));
        alert('Estado actualizado');
      } else {
        alert(data.message || 'Error al actualizar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  // Filtrado
  const filtrados = pedidos.filter(p => {
    // Filtro por Tab
    if (filtroEstado === 'activos') {
      return ['pendiente', 'confirmado', 'preparando'].includes(p.estado);
    }
    if (filtroEstado === 'listos') {
      return ['listo'].includes(p.estado);
    }
    if (filtroEstado === 'historial') {
      return ['entregado', 'cancelado', 'no-recogido'].includes(p.estado);
    }
    return true;
  }).filter(p => {
    // Filtro Búsqueda
    if (!busqueda) return true;
    const term = busqueda.toLowerCase();
    return (
      p.numeroPedido?.toLowerCase().includes(term) ||
      p.datosUsuario?.nombre?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Gestión de Pedidos</h2>
        <button
          onClick={cargarPedidos}
          className="btn-secondary"
        >
          <RefreshCw size={18} /> Actualizar
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="tabs-container">
        <div className="tabs-list">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFiltroEstado(tab.id)}
              className={`tab-btn ${filtroEstado === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="search-box">
          <Search className="search-icon" size={16} />
          <input
            type="text"
            placeholder="Buscar pedido o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="orders-grid">
        {cargando ? (
          <div className="empty-state">
            <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
            Cargando pedidos...
          </div>
        ) : filtrados.length === 0 ? (
          <div className="card empty-state">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-bold">No hay pedidos en esta sección</p>
            <p className="text-sm">Prueba cambiando el filtro o la búsqueda</p>
          </div>
        ) : (
          filtrados.map(pedido => (
            <PedidoCard
              key={pedido._id}
              pedido={pedido}
              onCambiarEstado={cambiarEstado}
            />
          ))
        )}
      </div>
    </div>
  );
};

const PedidoCard = ({ pedido, onCambiarEstado }) => {
  return (
    <div className={`order-card ${pedido.estado}`}>
      <div className="order-info">
        <div className="order-header">
          <div>
            <div className="order-number">#{pedido.numeroPedido}</div>
            <h3 className="customer-name">{pedido.datosUsuario?.nombre || 'Cliente'}</h3>
            <p className="customer-phone">{pedido.datosUsuario?.telefono}</p>
          </div>
          <div>
            <div className="order-price">{pedido.total.toFixed(2)}€</div>
            <span className={`payment-badge ${pedido.metodoPago === 'pendiente' ? 'pending' : 'paid'}`}>
              {pedido.metodoPago === 'pendiente' ? 'No Pagado' : 'Pagado'}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="order-items-list">
          {pedido.items.map((item, i) => (
            <div key={i} className="order-item-row">
              <span>
                <span className="qty">{item.cantidad}x </span>
                {item.nombreProducto}
              </span>
              <span>{(item.precioUnitario * item.cantidad).toFixed(2)}€</span>
            </div>
          ))}
        </div>

        <div className="order-footer">
          <div className="footer-badge">
            <Clock size={14} />
            {new Date(pedido.fechaPedido).toLocaleString()}
          </div>
          <div className="footer-badge">
            <AlertCircle size={14} />
            {pedido.tipoEntrega === 'recogida' ? 'Recogida en Tienda' : 'A Domicilio'}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="order-actions">
        <div className={`status-label ${pedido.estado}`}>
          {pedido.estado}
        </div>

        {pedido.estado === 'pendiente' && (
          <button
            onClick={() => onCambiarEstado(pedido._id, 'preparando')}
            className="action-btn start"
          >
            Empezar
          </button>
        )}

        {pedido.estado === 'preparando' && (
          <button
            onClick={() => onCambiarEstado(pedido._id, 'listo')}
            className="action-btn finish"
          >
            Listo
          </button>
        )}

        {pedido.estado === 'listo' && (
          <button
            onClick={() => onCambiarEstado(pedido._id, 'entregado')}
            className="action-btn deliver"
          >
            Entregar
          </button>
        )}
      </div>
    </div>
  );
};

export default PedidosTienda;
