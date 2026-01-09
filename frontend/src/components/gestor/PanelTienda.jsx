import { useState, useEffect } from 'react';
import io from 'socket.io-client';
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

  const [trabajadoresTurno, setTrabajadoresTurno] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Helper to extract ID string safely from potentially populated object
  const getUbicacionId = (location) => {
    if (!location) return null;
    return typeof location === 'object' ? location._id : location;
  };

  const ubicacionId = getUbicacionId(usuario?.ubicacionAsignada);

  // Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Socket.IO Integration for Real-time Dashboard
  useEffect(() => {
    if (ubicacionId) {
      const newSocket = io(API_URL);

      newSocket.on('connect', () => {
        console.log('✅ [PanelTienda] Socket Connected!');
      });

      newSocket.on('nuevo-pedido', (pedido) => {
        const pedidoTiendaId = getUbicacionId(pedido.puntoVenta);
        if (pedidoTiendaId === ubicacionId) {
          // Update Recent Orders visually
          setPedidosRecientes(prev => {
            const updated = [pedido, ...prev];
            return updated.slice(0, 5);
          });
          // Update Stats (Increment Pending)
          setStats(prev => ({
            ...prev,
            pendiente: prev.pendiente + 1,
            total: prev.total + 1
          }));
        }
      });

      newSocket.on('pedido-actualizado', (pedidoActualizado) => {
        setPedidosRecientes(prev => prev.map(p =>
          p._id === pedidoActualizado._id ? pedidoActualizado : p
        ));
      });

      return () => newSocket.disconnect();
    }
  }, [ubicacionId]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        if (!ubicacionId) {
          // Fallback for safety/debug
          console.warn('Usuario sin ubicacionAsignada:', usuario);
          setCargando(false);
          return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        // 1. Cargar detalles de la tienda
        const resTienda = await fetch(`${API_URL}/api/ubicaciones/${ubicacionId}`, { headers });
        const dataTienda = await resTienda.json();

        // 2. Cargar pedidos con stats
        const resPedidos = await fetch(`${API_URL}/api/pedidos/tienda?limit=5`, { headers });
        const dataPedidos = await resPedidos.json();

        // 3. Cargar Equipo del Turno (Hoy)
        const hoy = new Date();
        const inicio = new Date(hoy.setHours(0, 0, 0, 0)).toISOString();
        const fin = new Date(hoy.setHours(23, 59, 59, 999)).toISOString();

        const resTurnos = await fetch(`${API_URL}/api/turnos?ubicacion=${ubicacionId}&inicio=${inicio}&fin=${fin}`, { headers });
        const dataTurnos = await resTurnos.json();

        if (dataTienda.success) setTienda(dataTienda.data);
        if (dataPedidos.success) {
          setPedidosRecientes(dataPedidos.data);
          setStats(dataPedidos.stats);
        }
        if (dataTurnos.success) {
          // Filtrar duplicados por si hay varios turnos
          const unicos = [];
          const ids = new Set();
          dataTurnos.data.forEach(t => {
            if (!ids.has(t.usuario._id)) {
              ids.add(t.usuario._id);
              unicos.push(t.usuario);
            }
          });
          setTrabajadoresTurno(unicos);
        }

      } catch (error) {
        console.error('Error cargando dashboard:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [ubicacionId, token]);

  if (cargando) return <div className="p-10 text-center text-slate-500">Cargando dashboard...</div>;
  if (!tienda) return <div className="p-10 text-center text-slate-500">No hay información de tienda disponible.</div>;

  return (
    <div className="dashboard-container">
      {/* 1. Header & Info Widget Container */}
      <div className="dashboard-top-section" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>

        <div className="store-card" style={{ height: '100%', marginBottom: 0 }}>
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

        {/* NEW: Time & Staff Widget */}
        <div className="store-info-widget" style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Clock */}
          <div style={{ textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e293b', lineHeight: '1' }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '5px' }}>
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>

          {/* Team */}
          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700', marginBottom: '10px' }}>
              Equipo en Turno ({trabajadoresTurno.length})
            </h4>
            <div className="active-staff-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {trabajadoresTurno.length > 0 ? trabajadoresTurno.map(worker => (
                <div key={worker._id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold'
                  }}>
                    {worker.nombre.charAt(0)}
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#334155' }}>{worker.nombre}</span>
                </div>
              )) : (
                <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontStyle: 'italic' }}>Sin turnos registrados</span>
              )}
            </div>
          </div>
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
