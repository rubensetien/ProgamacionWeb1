import { useState, useEffect } from 'react';
import '../../styles/admin/gestion/GestionProductos.css';
import { FileText, Printer, Calendar, Store, Truck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const PedidosB2B = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        // Decode user from token or use AuthContext if imported (adapting to avoid massive imports for now)
        // Actually simpler to just fetch
        cargarPedidos();
    }, []);

    const cargarPedidos = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/pedidos/b2b`, {
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (data.success) {
                setPedidos(data.data || []);
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error('Error cargando pedidos B2B:', err);
            setError('Error al cargar pedidos B2B');
        } finally {
            setLoading(false);
        }
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleImprimirAlbaran = (pedido) => {
        // Here we would implement the printing logic.
        // For now, we can create a temporary print window or just alert.
        // The plan asks for "Frontend: AlbaranPrint.jsx (Printable Layout)".
        // We will implement that component next and maybe route to it.
        // For now, let's assume we navigate to /admin/albaran/:id or store in local state to print.
        localStorage.setItem('print_pedido', JSON.stringify(pedido));
        window.open(`/albaran/${pedido._id}`, '_blank');
    };

    if (loading) return <div className="pedidos-loading">Cargando pedidos B2B...</div>;

    return (
    return (
        <div className="gestion-productos">
            <div className="gestion-header">
                <div className="header-content">
                    <h2>
                        Pedidos Profesionales (B2B)
                    </h2>
                    <p className="header-description">
                        Gestión de pedidos para negocios y hostelería
                    </p>
                </div>
            </div>

            <div className="filtros-bar">
                <div className="search-box">
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" placeholder="Buscar por pedido o cliente..." style={{ paddingLeft: '48px' }} />
                </div>
            </div>

            {pedidos.length === 0 ? (
                <div className="empty-state">
                    <Store size={64} style={{ color: '#bdc3c7', marginBottom: '16px' }} />
                    <p>No hay pedidos B2B registrados</p>
                </div>
            ) : (
                <div className="tabla-container">
                    <table className="tabla-productos">
                        <thead>
                            <tr>
                                <th>Pedido</th>
                                <th>Cliente / Negocio</th>
                                <th>F. Realización</th>
                                <th>F. Entrega/Recogida</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos.map(pedido => (
                                <tr key={pedido._id}>
                                    <td>
                                        <span className="td-sku">{pedido.numeroPedido}</span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>{pedido.usuario?.nombre}</div>
                                        {pedido.usuario?.email && <div style={{ fontSize: '0.85em', color: '#666' }}>{pedido.usuario.email}</div>}
                                    </td>
                                    <td>{formatearFecha(pedido.createdAt)}</td>
                                    <td>
                                        {pedido.tipoEntrega === 'recogida' ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ background: '#e3f2fd', padding: '6px', borderRadius: '8px', color: '#1976d2' }}>
                                                    <Store size={16} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.9em' }}>Recogida</div>
                                                    <div style={{ fontSize: '0.8em', color: '#666' }}>{formatearFecha(pedido.fechaRecogida)}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ background: '#fff3e0', padding: '6px', borderRadius: '8px', color: '#f57c00' }}>
                                                    <Truck size={16} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.9em' }}>Entrega</div>
                                                    <div style={{ fontSize: '0.8em', color: '#666' }}>
                                                        {pedido.fechaEntregaEstimada ? formatearFecha(pedido.fechaEntregaEstimada) : 'Pendiente'}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${pedido.estado === 'entregado' ? 'badge-success' :
                                            pedido.estado === 'cancelado' ? 'badge-inactive' :
                                                'badge-warning' // Fallback or defined class for other states
                                            }`} style={{
                                                backgroundColor: pedido.estado === 'pendiente' ? '#fff3cd' : undefined,
                                                color: pedido.estado === 'pendiente' ? '#856404' : undefined
                                            }}>
                                            {pedido.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="acciones">
                                            <button
                                                className="btn-icono btn-editar"
                                                onClick={() => handleImprimirAlbaran(pedido)}
                                                title="Generar Albarán"
                                            >
                                                <Printer size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
    );
};

export default PedidosB2B;
