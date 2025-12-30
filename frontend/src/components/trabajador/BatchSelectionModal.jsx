
import { useState, useEffect } from 'react';
import '../../styles/admin/gestion/GestionProductos.css'; // Reusing styles

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
                console.log('Fetching inventory for:', item.producto._id, item.producto.nombre);
                // FIX: Use the specific endpoint for fetching by Product ID, not Inventory ID
                const res = await fetch(`${API_URL}/api/inventario/producto/${item.producto._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                console.log('Inventory API response:', data);

                if (data.success) {
                    // Filtrar lotes con stock disponible
                    const lotes = data.data.lotes || [];
                    const filtered = lotes.filter(l => (l.cantidad - (l.reservado || 0)) > 0);
                    console.log('Filtered batches:', filtered);
                    newInventario[item.producto._id] = filtered;
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

    const handleCantidadChange = (productoId, fechaFabricacion, valor) => {
        const cantidad = parseInt(valor) || 0;
        if (cantidad < 0) return;

        setSeleccion(prev => {
            const currentSelection = prev[productoId] || [];
            // Remove existing entry for this batch if exists
            const filtered = currentSelection.filter(s => s.fechaFabricacion !== fechaFabricacion);

            // Add new entry if quantity > 0
            if (cantidad > 0) {
                filtered.push({ fechaFabricacion, cantidad });
            }

            return { ...prev, [productoId]: filtered };
        });
    };

    const calcularTotalSeleccionado = (productoId) => {
        return (seleccion[productoId] || []).reduce((acc, curr) => acc + curr.cantidad, 0);
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

    // Check if all items have correct quantity selected
    const esValido = pedido.items.every(item => {
        const total = calcularTotalSeleccionado(item.producto._id);
        return total === item.cantidad;
    });

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '900px' }}>
                <div className="modal-header">
                    <h3>Preparar Pedido #{pedido.numeroPedido}</h3>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-form">
                    {cargando ? <div className="loading-spinner"></div> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="alert" style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>ℹ️ Se han preseleccionado lotes FIFO. Puedes editar las cantidades manualmente.</span>
                                <button
                                    onClick={() => preseleccionarFIFO(pedido.items, inventario)}
                                    style={{
                                        background: 'transparent', border: '1px solid #0369a1', color: '#0369a1',
                                        padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9em'
                                    }}
                                >
                                    Restablecer FIFO
                                </button>
                            </div>

                            {pedido.items.map(item => {
                                const totalSeleccionado = calcularTotalSeleccionado(item.producto._id);
                                const diferencia = item.cantidad - totalSeleccionado;
                                const esCorrecto = diferencia === 0;

                                return (
                                    <div key={item.producto._id} style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                    }}>
                                        <div style={{
                                            background: '#f8fafc',
                                            padding: '12px 20px',
                                            borderBottom: '1px solid #e2e8f0',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                        }}>
                                            <div style={{ fontWeight: 700, color: '#334155' }}>{item.producto.nombre}</div>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.9em', color: esCorrecto ? 'green' : 'red', fontWeight: 600 }}>
                                                    Seleccionado: {totalSeleccionado} / {item.cantidad}
                                                </span>
                                                {diferencia !== 0 && (
                                                    <span className="badge" style={{ background: '#dc2626', color: 'white' }}>
                                                        {diferencia > 0 ? `Faltan ${diferencia}` : `Sobran ${Math.abs(diferencia)}`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ padding: '0' }}>
                                            <table className="tabla-productos" style={{ fontSize: '0.9em', width: '100%', margin: 0 }}>
                                                <thead style={{ background: 'white' }}>
                                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                                        <th style={{ padding: '12px 20px', color: '#64748b' }}>Lote</th>
                                                        <th style={{ padding: '12px 20px', color: '#64748b' }}>Stock Disp.</th>
                                                        <th style={{ padding: '12px 20px', color: '#64748b' }}>A Utilizar</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(inventario[item.producto._id] || []).map(lote => {
                                                        const seleccionado = (seleccion[item.producto._id] || [])
                                                            .find(s => s.fechaFabricacion === lote.fechaFabricacion);
                                                        const qty = seleccionado ? seleccionado.cantidad : 0;
                                                        const max = lote.cantidad - (lote.reservado || 0);
                                                        const isSelected = qty > 0;

                                                        return (
                                                            <tr key={lote.fechaFabricacion} style={{
                                                                background: isSelected ? '#fff7ed' : 'white',
                                                                transition: 'background 0.3s'
                                                            }}>
                                                                <td style={{ padding: '12px 20px', fontWeight: isSelected ? 600 : 400 }}>
                                                                    {new Date(lote.fechaFabricacion).toLocaleDateString()}
                                                                </td>
                                                                <td style={{ padding: '12px 20px' }}>{max}</td>
                                                                <td style={{ padding: '12px 20px' }}>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max={max}
                                                                        value={qty === 0 ? '' : qty}
                                                                        onChange={(e) => {
                                                                            let v = parseInt(e.target.value);
                                                                            if (isNaN(v)) v = 0;
                                                                            if (v > max) v = max; // Prevent exceeding stock
                                                                            if (v < 0) v = 0;
                                                                            handleCantidadChange(item.producto._id, lote.fechaFabricacion, v);
                                                                        }}
                                                                        style={{
                                                                            width: '80px',
                                                                            padding: '6px',
                                                                            borderRadius: '6px',
                                                                            border: isSelected ? '2px solid #ea580c' : '1px solid #cbd5e1',
                                                                            textAlign: 'center',
                                                                            fontWeight: 'bold',
                                                                            color: isSelected ? '#ea580c' : 'inherit'
                                                                        }}
                                                                        placeholder="0"
                                                                    />
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-cancelar" onClick={onClose}>Cancelar</button>
                    <button
                        className="btn-guardar"
                        onClick={handleConfirm}
                        disabled={cargando || !esValido}
                        style={{ opacity: esValido ? 1 : 0.5, cursor: esValido ? 'pointer' : 'not-allowed' }}
                        title={!esValido ? "Las cantidades seleccionadas deben coincidir exactamente con lo requerido" : "Confirmar selección"}
                    >
                        Confirmar y Reservar Stock
                    </button>
                </div>
            </div>
        </div>
    );
}
