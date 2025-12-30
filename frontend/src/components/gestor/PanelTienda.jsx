import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Store, Package, Clock, CheckCircle, AlertCircle, MapPin, Phone, Calendar } from 'lucide-react';
import '../../styles/gestor/PanelTienda.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const PanelTienda = () => {
  const { usuario, token } = useAuth();
  const [tienda, setTienda] = useState(null);
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const [stats, setStats] = useState({ pendiente: 0, preparacion: 0, listo: 0, entregado: 0, total: 0 });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        if (!usuario?.tiendaAsignada) return;

        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Cargar detalles de la tienda
        const resTienda = await fetch(`${API_URL}/api/ubicaciones/${usuario.tiendaAsignada}`, { headers });
        const dataTienda = await resTienda.json();

        // 2. Cargar pedidos con stats
        const resPedidos = await fetch(`${API_URL}/api/pedidos/tienda?limit=5`, { headers });
        const dataPedidos = await resPedidos.json();

        if (dataTienda.success) setTienda(dataTienda.data);
        if (dataPedidos.success) {
          setPedidosRecientes(dataPedidos.data);
          setStats(dataPedidos.stats);
        }
      } catch (error) {
        console.error('Error cargando dashboard:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [usuario, token]);

  if (cargando) return <div className="p-10 text-center text-slate-500">Cargando dashboard...</div>;
  if (!tienda) return <div className="p-10 text-center text-slate-500">No hay información de tienda disponible.</div>;

  return (
    <div className="dashboard-container">
      {/* 1. Tarjeta de Bienvenida / Info Tienda */}
      <div className="store-card">
        <div className="store-header">
          <h2>{tienda.nombre}</h2>
          <div className="store-details">
            <div className="store-detail-item">
              <MapPin size={16} />
              <span>{tienda.direccion?.calle}, {tienda.direccion?.ciudad}</span>
            </div>
            <div className="store-detail-item">
              <Phone size={16} />
              <span>{tienda.contacto?.telefono}</span>
            </div>
            <div className="store-detail-item">
              <Calendar size={16} />
              <span>{tienda.contacto?.horario || 'Horario no definido'}</span>
            </div>
          </div>
        </div>
        <div className={`store-status-badge ${tienda.activo ? 'active' : 'inactive'}`}>
          {tienda.activo ? '🟢 TIENDA ACTIVA' : '🔴 TIENDA INACTIVA'}
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon={<AlertCircle size={24} />}
          label="Pendientes"
          value={stats.pendiente || 0}
          color="orange"
        />
        <StatCard
          icon={<Clock size={24} />}
          label="En Preparación"
          value={stats.preparacion || 0}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle size={24} />}
          label="Listos"
          value={stats.listo || 0}
          color="green"
        />
        <StatCard
          icon={<Package size={24} />}
          label="Total Pedidos"
          value={stats.total || 0}
          color="indigo"
        />
      </div>

      {/* 3. Pedidos Recientes (Tabla simple) */}
      <div className="orders-section">
        <div className="orders-header">
          <h3>📦 Últimos Pedidos</h3>
          <button className="btn-view-all">
            Ver Todos
          </button>
        </div>
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pedidosRecientes.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    No hay pedidos recientes
                  </td>
                </tr>
              ) : (
                pedidosRecientes.map(pedido => (
                  <tr key={pedido._id}>
                    <td className="order-id">
                      #{pedido.numeroPedido || pedido._id.slice(-6).toUpperCase()}
                    </td>
                    <td>
                      <div className="customer-name">{pedido.datosUsuario?.nombre || 'Cliente'}</div>
                      <div className="customer-phone">{pedido.datosUsuario?.telefono}</div>
                    </td>
                    <td style={{ color: '#64748b' }}>
                      {new Date(pedido.fechaPedido).toLocaleDateString()}
                    </td>
                    <td className="order-total">
                      {pedido.total.toFixed(2)}€
                    </td>
                    <td>
                      <EstadoBadge estado={pedido.estado} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Componente simple para Tarjetas de Estadísticas
const StatCard = ({ icon, label, value, color }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-icon-wrapper">
      {icon}
    </div>
    <div className="stat-info">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  </div>
);

// Badge para estado
const EstadoBadge = ({ estado }) => {
  const labels = {
    pendiente: 'Pendiente',
    preparacion: 'En Preparación',
    listo: 'Listo para Recoger',
    entregado: 'Entregado',
    cancelado: 'Cancelado'
  };

  return (
    <span className={`status-badge ${estado}`}>
      {labels[estado] || estado}
    </span>
  );
};

export default PanelTienda;
