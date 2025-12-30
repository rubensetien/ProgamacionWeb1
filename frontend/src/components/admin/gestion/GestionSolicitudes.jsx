
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../../../styles/admin/gestion/GestionProductos.css'; // Reutilizamos estilos

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function GestionSolicitudes() {
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

    useEffect(() => {
        cargarSolicitudes();
    }, []);

    const cargarSolicitudes = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/solicitudes-stock/todas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSolicitudes(data.data);
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Error de conexión', 'error');
        } finally {
            setCargando(false);
        }
    };

    const solicitudesFiltradas = solicitudes.filter(sol =>
        filtroEstado === 'todos' ? true : sol.estado === filtroEstado
    );

    const getEstadoBadge = (estado) => {
        const estilos = {
            'pendiente': { bg: '#fff3cd', color: '#856404' },
            'aceptado': { bg: '#d1ecf1', color: '#0c5460' },
            'en-preparacion': { bg: '#e2e3e5', color: '#383d41' },
            'preparado': { bg: '#c3e6cb', color: '#155724' },
            'en-reparto': { bg: '#d6d8d9', color: '#1b1e21' },
            'entregado': { bg: '#28a745', color: 'white' },
            'rechazada': { bg: '#f8d7da', color: '#721c24' }
        };
        const estilo = estilos[estado] || { bg: '#eee', color: '#333' };

        return (
            <span style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.85em',
                fontWeight: 'bold',
                backgroundColor: estilo.bg,
                color: estilo.color,
                textTransform: 'uppercase'
            }}>
                {estado}
            </span>
        );
    };

    const formatDireccion = (tienda) => {
        if (!tienda || !tienda.direccion) return 'Dirección no disponible';
        if (typeof tienda.direccion === 'string') return tienda.direccion;
        if (typeof tienda.direccion === 'object') {
            const { calle, ciudad, provincia } = tienda.direccion;
            if (calle) return `${calle}, ${ciudad || ''}`;
            // Fallback for object without 'calle' key but clearly an address object
            return Object.values(tienda.direccion).join(', ');
        }
        return 'Dirección no válida';
    };

    return (
        <div className="gestion-productos">
            <div className="gestion-header">
                <div className="header-content">
                    <h2>Gestión de Solicitudes</h2>
                    <p className="header-description">Supervisión y trazabilidad de pedidos a tiendas</p>
                </div>
            </div>

            <div className="filtros-bar">
                <div className="search-box">
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" placeholder="Buscar por tienda..." style={{ paddingLeft: '48px' }} />
                </div>

                <select
                    className="select-filter"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                >
                    <option value="todos">Todos los Estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="aceptado">Aceptado</option>
                    <option value="preparado">Preparado</option>
                    <option value="en-reparto">En Reparto</option>
                    <option value="entregado">Entregado</option>
                </select>
            </div>

            <div className="tabla-container">
                {cargando ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                    </div>
                ) : (
                    <table className="tabla-productos">
                        <thead>
                            <tr>
                                <th>Tienda</th>
                                <th>Usuario</th>
                                <th>Fecha</th>
                                <th>Items</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {solicitudesFiltradas.map(sol => (
                                <tr key={sol._id}>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>{sol.tienda?.nombre || 'Sin tienda'}</div>
                                        <div style={{ fontSize: '0.85em', color: '#666' }}>
                                            {formatDireccion(sol.tienda)}
                                        </div>
                                    </td>
                                    <td>{sol.usuario?.nombre}</td>
                                    <td>{new Date(sol.createdAt).toLocaleString()}</td>
                                    <td>{sol.items.length} productos</td>
                                    <td>{getEstadoBadge(sol.estado)}</td>
                                    <td>
                                        <button
                                            className="btn-editar"
                                            title="Ver Detalles"
                                            onClick={() => setSolicitudSeleccionada(sol)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal de Detalles */}
            {solicitudSeleccionada && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h3>Detalle Solicitud #{solicitudSeleccionada._id.slice(-6).toUpperCase()}</h3>
                            <button className="btn-close" onClick={() => setSolicitudSeleccionada(null)}>×</button>
                        </div>
                        <div className="modal-form" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

                            <h4>Productos Solicitados</h4>
                            <table className="tabla-productos" style={{ marginBottom: '24px' }}>
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {solicitudSeleccionada.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.nombreProducto || item.producto?.nombre}</td>
                                            <td>{item.cantidad} {item.unidad}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {solicitudSeleccionada.detalleEntregas && solicitudSeleccionada.detalleEntregas.length > 0 && (
                                <>
                                    <h4 style={{ marginTop: '20px', color: '#ff6600' }}>Trazabilidad de Lotes (Enviados)</h4>
                                    {solicitudSeleccionada.detalleEntregas.map((entrega, idx) => {
                                        // Buscar nombre del producto en items originales para mostrar algo legible si producto detailed no está poblado profundo
                                        // Aunque en backend hicimos populate items.producto, detalleEntregas.producto es un ID ref.
                                        // Podemos intentar cruzar con los items.
                                        const nombreProd = solicitudSeleccionada.items.find(i => i.producto._id === entrega.producto || i.producto === entrega.producto)?.nombreProducto || 'Producto';

                                        return (
                                            <div key={idx} style={{ marginBottom: '15px', border: '1px solid #eee', padding: '10px', borderRadius: '8px' }}>
                                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{nombreProd}</div>
                                                <table className="tabla-productos" style={{ fontSize: '0.9em' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>Lote (Fecha)</th>
                                                            <th>Cantidad Enviada</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {entrega.itemsLote.map((lote, lIdx) => (
                                                            <tr key={lIdx}>
                                                                <td>{new Date(lote.fechaFabricacion).toLocaleDateString()}</td>
                                                                <td>{lote.cantidad}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
