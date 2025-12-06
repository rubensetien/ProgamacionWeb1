import { useState, useEffect } from 'react';
import '../../styles/admin/PedidosAdmin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const PedidosAdmin = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="pedidos-loading">Cargando pedidos...</div>;

  return (
    <div className="pedidos-admin">
      <div className="pedidos-header">
        <h1>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          Mis Pedidos
        </h1>
        <p className="pedidos-subtitle">
          Historial de compras como administrador ({pedidos.length})
        </p>
      </div>

      {pedidos.length === 0 ? (
        <div className="pedidos-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <p>No tienes pedidos aún</p>
        </div>
      ) : (
        <div className="pedidos-lista-admin">
          {/* Simple table or list for admin view */}
          <table className="tabla-pedidos">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(pedido => (
                <tr key={pedido._id}>
                  <td>{pedido.numeroPedido}</td>
                  <td>{formatearFecha(pedido.fechaPedido)}</td>
                  <td>{pedido.tipoEntrega}</td>
                  <td>{pedido.total?.toFixed(2)}€</td>
                  <td>
                    <span className={`estado-badge ${pedido.estado}`}>
                      {pedido.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PedidosAdmin;
