import { useState, useEffect } from 'react';
import { RefreshCw, Truck, Store, Package } from 'lucide-react';
import '../../styles/admin/gestion/GestionProductos.css'; // Reusing admin styles for consistency
import BatchSelectionModal from './BatchSelectionModal';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function RepartidorDashboard() {
    const { usuario } = useAuth();
    const [activeTab, setActiveTab] = useState('pedidos'); // 'pedidos' | 'stock'
    const [pedidos, setPedidos] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [pedidoAProcesar, setPedidoAProcesar] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setCargando(true);
        setError(null);
        try {
            await Promise.all([cargarPedidos(), cargarSolicitudes()]);
        } catch (err) {
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    const cargarPedidos = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/pedidos/reparto/pendientes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPedidos(data.data);
            }
        } catch (err) {
            setError('Error al cargar pedidos: ' + err.message);
        }
    };

    const cargarSolicitudes = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/solicitudes-stock/pendientes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSolicitudes(data.data);
            }
        } catch (err) {
            console.error('Error al cargar solicitudes stock', err);
        }
    };

    // --- Lógica Pedidos Clientes ---

    const asignarsePedido = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/pedidos/${id}/asignar`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                cargarPedidos();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const abrirPreparacion = (pedido) => {
        setPedidoAProcesar(pedido);
    };

    const confirmarPreparacion = async (detalleEntregas) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/pedidos/${pedidoAProcesar._id}/finalizar-preparacion`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ detalleEntregas })
            });

            const data = await res.json();

            // Dynamic import for Swal usage inside function
            const Swal = (await import('sweetalert2')).default;

            if (data.success) {
                setPedidoAProcesar(null);
                Swal.fire({
                    title: '¡Preparación Finalizada!',
                    text: 'El pedido está listo para ser entregado.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
                cargarPedidos();
            } else {
                Swal.fire('Error', data.message || 'Error al procesar', 'error');
            }
        } catch (err) {
            console.error(err);
            const Swal = (await import('sweetalert2')).default;
            Swal.fire('Error', 'Error de conexión', 'error');
        }
    };

    // --- Lógica Solicitudes Stock ---

    const [solicitudAProcesar, setSolicitudAProcesar] = useState(null);

    const avanzarFlujoSolicitud = async (solicitud) => {
        // Flow: pendiente -> aceptado -> (modal preparation) -> preparado -> en-reparto -> entregado

        let nuevoEstado = null;
        let endpoint = 'estado'; // default: /:id/estado
        let body = {};
        let confirmAction = false;
        let actionTitle = '';
        let actionText = '';

        if (solicitud.estado === 'pendiente') {
            nuevoEstado = 'aceptado';
        }
        else if (solicitud.estado === 'aceptado' || solicitud.estado === 'en-proceso') {
            // Abrir modal de preparación
            setSolicitudAProcesar({
                ...solicitud,
                numeroPedido: `SOL-${solicitud._id.slice(-6).toUpperCase()}` // Mock for modal title
            });
            return; // Stop here, wait for modal
        }
        else if (solicitud.estado === 'preparado') {
            nuevoEstado = 'en-reparto';
            confirmAction = true;
            actionTitle = '¿Iniciar Reparto?';
            actionText = 'Esto notificará a la tienda que el pedido va en camino.';
        }
        else if (solicitud.estado === 'en-reparto') {
            endpoint = 'entregar'; // Special endpoint
            confirmAction = true;
            actionTitle = '¿Confirmar Entrega?';
            actionText = 'Se descontará el stock definitivamente del inventario.';
        }

        if (confirmAction) {
            const result = await Swal.fire({
                title: actionTitle,
                text: actionText,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#ff6600', // Orange
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, continuar',
                cancelButtonText: 'Cancelar'
            });
            if (!result.isConfirmed) return;
        }

        if (nuevoEstado) body.estado = nuevoEstado;

        try {
            const token = localStorage.getItem('token');
            const url = endpoint === 'estado'
                ? `${API_URL}/api/solicitudes-stock/${solicitud._id}/estado`
                : `${API_URL}/api/solicitudes-stock/${solicitud._id}/${endpoint}`;

            const res = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (data.success) {
                Swal.fire({
                    title: '¡Actualizado!',
                    text: 'El estado del pedido ha sido actualizado correctamente.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
                cargarSolicitudes();
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Error al actualizar flujo', 'error');
        }
    }

    const confirmarPreparacionSolicitud = async (detalleEntregas) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/solicitudes-stock/${solicitudAProcesar._id}/finalizar-preparacion`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ detalleEntregas })
            });

            const data = await res.json();

            if (data.success) {
                setSolicitudAProcesar(null);
                Swal.fire({
                    title: '¡Preparación Completa!',
                    text: 'Stock reservado exitosamente. Listo para reparto.',
                    icon: 'success',
                });
                cargarSolicitudes();
            } else {
                Swal.fire('Error', data.message || 'Error al procesar preparación', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Error de conexión', 'error');
        }
    };


    if (cargando) return <div className="loading-spinner">Cargando datos...</div>;

    return (
        <div className="gestion-productos">
            <div className="gestion-header">
                <div className="header-content">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Truck size={28} /> Panel de Reparto
                    </h2>
                    <p className="header-description">Gestiona tus entregas y rutas asignadas</p>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                        <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                            {usuario?.rol?.toUpperCase()}
                        </span>
                        {usuario?.tipoTrabajador && (
                            <span className="badge" style={{ background: '#fef3c7', color: '#b45309' }}>
                                {usuario.tipoTrabajador.toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>
                <button className="btn-nuevo" onClick={cargarDatos}>
                    <RefreshCw size={18} /> Actualizar
                </button>
            </div>

            {/* Tabs de Navegación */}
            <div className="admin-tabs" style={{ marginBottom: '24px', display: 'flex', gap: '15px' }}>
                <button
                    className={`tab-btn`}
                    onClick={() => setActiveTab('pedidos')}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        background: activeTab === 'pedidos' ? '#ff6600' : '#f1f5f9',
                        color: activeTab === 'pedidos' ? 'white' : '#64748b',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        borderRadius: '30px',
                        transition: 'all 0.3s ease',
                        boxShadow: activeTab === 'pedidos' ? '0 4px 12px rgba(255, 102, 0, 0.3)' : 'none'
                    }}
                >
                    <Package size={20} />
                    <span>Pedidos Clientes</span>
                    <span style={{
                        background: activeTab === 'pedidos' ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                        padding: '2px 8px', borderRadius: '10px', fontSize: '0.9em'
                    }}>{pedidos.length}</span>
                </button>
                <button
                    className={`tab-btn`}
                    onClick={() => setActiveTab('stock')}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        background: activeTab === 'stock' ? '#ff6600' : '#f1f5f9',
                        color: activeTab === 'stock' ? 'white' : '#64748b',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        borderRadius: '30px',
                        transition: 'all 0.3s ease',
                        boxShadow: activeTab === 'stock' ? '0 4px 12px rgba(255, 102, 0, 0.3)' : 'none'
                    }}
                >
                    <Store size={20} />
                    <span>Solicitudes Tiendas</span>
                    <span style={{
                        background: activeTab === 'stock' ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                        padding: '2px 8px', borderRadius: '10px', fontSize: '0.9em'
                    }}>{solicitudes.length}</span>
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="tabla-container">
                {activeTab === 'pedidos' ? (
                    <table className="tabla-productos">
                        <thead>
                            <tr>
                                <th>PEDIDO</th>
                                <th>CLIENTE</th>
                                <th>DIRECCIÓN</th>
                                <th>ESTADO</th>
                                <th>ACCIÓN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-state">No hay pedidos de clientes pendientes</td>
                                </tr>
                            ) : (
                                pedidos.map(pedido => (
                                    <tr key={pedido._id}>
                                        <td className="td-sku">{pedido.numeroPedido}</td>
                                        <td>
                                            <div className="producto-info">
                                                <span>{pedido.datosUsuario?.nombre}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {pedido.direccionEnvio?.calle}, {pedido.direccionEnvio?.numero}
                                            <br />
                                            <span style={{ fontSize: '0.85em', color: '#666' }}>{pedido.direccionEnvio?.ciudad}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${pedido.estado === 'confirmado' ? 'badge-warning' :
                                                pedido.estado === 'preparando' ? 'badge-info' :
                                                    pedido.estado === 'en-camino' ? 'badge-primary' : 'badge-success'
                                                }`}>
                                                {pedido.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="acciones">
                                                {!pedido.repartidor ? (
                                                    <button className="btn-guardar" onClick={() => asignarsePedido(pedido._id)}>
                                                        Asignarme
                                                    </button>
                                                ) : (
                                                    <button className="btn-editar" onClick={() => abrirPreparacion(pedido)}>
                                                        {pedido.estado === 'preparando' ? 'Continuar Preparación' : 'Ver Detalles'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                ) : (
                    // --- TAB SOLICITUDES STORE ---
                    <table className="tabla-productos">
                        <thead>
                            <tr>
                                <th>TIENDA</th>
                                <th>ITEMS</th>
                                <th>NOTAS</th>
                                <th>ESTADO</th>
                                <th>ACCIÓN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitudes.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-state">No hay solicitudes de stock pendientes</td>
                                </tr>
                            ) : (
                                solicitudes.map(solicitud => (
                                    <tr key={solicitud._id}>
                                        <td className="td-sku">
                                            {solicitud.tienda?.nombre || 'Tienda Desconocida'}
                                            <div style={{ fontSize: '0.8em', color: '#666' }}>
                                                {new Date(solicitud.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="producto-info">
                                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                    {solicitud.items.map((item, idx) => (
                                                        <li key={idx}>
                                                            {item.cantidad} {item.unidad} - {item.nombreProducto}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </td>
                                        <td>
                                            {solicitud.notas || '-'}
                                        </td>
                                        <td>
                                            <span className={`badge ${solicitud.estado === 'pendiente' ? 'badge-warning' :
                                                solicitud.estado === 'en-proceso' ? 'badge-info' :
                                                    'badge-success'
                                                }`}>
                                                {solicitud.estado}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="acciones">
                                                {solicitud.estado === 'pendiente' && (
                                                    <button className="btn-guardar" onClick={() => avanzarFlujoSolicitud(solicitud)}>
                                                        Aceptar Solicitud
                                                    </button>
                                                )}
                                                {(solicitud.estado === 'aceptado' || solicitud.estado === 'en-proceso') && (
                                                    <button className="btn-editar" onClick={() => avanzarFlujoSolicitud(solicitud)}>
                                                        Preparar Stock
                                                    </button>
                                                )}
                                                {solicitud.estado === 'preparado' && (
                                                    <button className="btn-guardar" style={{ background: '#3b82f6' }} onClick={() => avanzarFlujoSolicitud(solicitud)}>
                                                        Iniciar Reparto
                                                    </button>
                                                )}
                                                {solicitud.estado === 'en-reparto' && (
                                                    <button className="btn-guardar" style={{ background: '#10b981' }} onClick={() => avanzarFlujoSolicitud(solicitud)}>
                                                        Confirmar Entrega
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {pedidoAProcesar && (
                <BatchSelectionModal
                    pedido={pedidoAProcesar}
                    onClose={() => setPedidoAProcesar(null)}
                    onConfirm={confirmarPreparacion}
                />
            )}

            {/* Modal para Solicitudes de Stock */}
            {solicitudAProcesar && (
                <BatchSelectionModal
                    pedido={solicitudAProcesar} // Pasamos la solicitud como 'pedido' (compatible structure)
                    onClose={() => setSolicitudAProcesar(null)}
                    onConfirm={confirmarPreparacionSolicitud}
                />
            )}
        </div>
    );
}
