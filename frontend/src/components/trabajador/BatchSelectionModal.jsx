
import { useState, useEffect } from 'react';
import '../../../styles/admin/gestion/GestionProductos.css'; // Reusing styles

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function BatchSelectionModal({ pedido, onClose, onConfirm }) {
    const [inventario, setInventario] = useState({}); // { productoId: [batches] }
    const [seleccion, setSeleccion] = useState({}); // { productoId: [{ loteId, cantidad }] }
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargarInventario();
    }, [pedido]);

    const cargarInventario = async () => {
        try {
            const token = localStorage.getItem('token');
            const newInventario = {};

            // Cargar inventario para cada producto del pedido
            // Esto podría optimizarse en un solo endpoint pero por ahora iteramos
            for (const item of pedido.items) {
                const res = await fetch(`${API_URL}/api/inventario/${item.producto._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    // Filtrar lotes con stock disponible
                    newInventario[item.producto._id] = data.data.lotes.filter(l => (l.cantidad - (l.reservado || 0)) > 0);
                }
            }
            setInventario(newInventario);
            preseleccionarFIFO(pedido.items, newInventario);
            setCargando(false);
        } catch (err) {
            console.error("Error cargando inventario", err);
            setCargando(false);
        }
    };

    const preseleccionarFIFO = (items, inv) => {
        const initialSeleccion = {};

        items.forEach(item => {
            const necesarios = item.cantidad;
            let pendientes = necesarios;
            const lotesDisponibles = inv[item.producto._id] || [];
            // Ordenar por fecha (FIFO)
            const lotesOrdenados = [...lotesDisponibles].sort((a, b) => new Date(a.fechaFabricacion) - new Date(b.fechaFabricacion));

            const seleccionProducto = [];

            for (const lote of lotesOrdenados) {
                if (pendientes <= 0) break;
                const disponible = lote.cantidad - (lote.reservado || 0);
                const aTomar = Math.min(pendientes, disponible);

                seleccionProducto.push({
                    fechaFabricacion: lote.fechaFabricacion,
                    cantidad: aTomar
                });
                pendientes -= aTomar;
            }

            initialSeleccion[item.producto._id] = seleccionProducto;
        });

        setSeleccion(initialSeleccion);
    };

    const handleConfirm = () => {
        // Transformar seleccion al formato requerido por el backend
        const detalleEntregas = Object.keys(seleccion).map(prodId => ({
            producto: prodId,
            itemsLote: seleccion[prodId]
        }));
        onConfirm(detalleEntregas);
    };

    if (!pedido) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px' }}>
                <div className="modal-header">
                    <h3>Preparar Pedido #{pedido.numeroPedido}</h3>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-form">
                    {cargando ? <div className="loading-spinner"></div> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <p style={{ fontSize: '0.9em', color: '#666' }}>
                                Se han preseleccionado los lotes más antiguos (FIFO). Verifica y ajusta si es necesario.
                            </p>

                            {pedido.items.map(item => (
                                <div key={item.producto._id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '10px' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{item.producto.nombre}</span>
                                        <span className="badge">Cantidad: {item.cantidad}</span>
                                    </div>

                                    <table className="tabla-productos" style={{ fontSize: '0.85em' }}>
                                        <thead>
                                            <tr>
                                                <th>Lote (Fecha)</th>
                                                <th>Disponible</th>
                                                <th>A Utilizar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(inventario[item.producto._id] || []).map(lote => {
                                                const seleccionado = (seleccion[item.producto._id] || [])
                                                    .find(s => s.fechaFabricacion === lote.fechaFabricacion);
                                                const qty = seleccionado ? seleccionado.cantidad : 0;
                                                const max = lote.cantidad - (lote.reservado || 0);

                                                return (
                                                    <tr key={lote.fechaFabricacion}>
                                                        <td>{new Date(lote.fechaFabricacion).toLocaleDateString()}</td>
                                                        <td>{max}</td>
                                                        <td>{qty}</td>
                                                        {/* Aquí podríamos poner inputs para editar manual, 
                                                            pero por simplicidad y tiempo lo dejamos de solo lectura/FIFO por ahora 
                                                            o un input simple si el usuario lo requiere.
                                                        */}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-cancelar" onClick={onClose}>Cancelar</button>
                    <button className="btn-guardar" onClick={handleConfirm} disabled={cargando}>
                        Confirmar y Reservar Stock
                    </button>
                </div>
            </div>
        </div>
    );
}
