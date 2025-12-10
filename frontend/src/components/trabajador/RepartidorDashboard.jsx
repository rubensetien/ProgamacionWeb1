```javascript
import { useState, useEffect } from 'react';
import '../../../styles/admin/gestion/GestionProductos.css'; // Reusing admin styles for consistency
import BatchSelectionModal from './BatchSelectionModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function RepartidorDashboard() {
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [pedidoAProcesar, setPedidoAProcesar] = useState(null); 

    useEffect(() => {
        cargarPedidos();
    }, []);

    const cargarPedidos = async () => {
        try {
            setCargando(true);
            const token = localStorage.getItem('token');
            // Obtener pedidos pendientes de reparto
            const res = await fetch(`${ API_URL } /api/pedidos / reparto / pendientes`, {
                headers: { 'Authorization': `Bearer ${ token } ` }
            });
            const data = await res.json();

            if (data.success) {
                setPedidos(data.data);

                // Verificar si ya tengo uno asignado en estado 'preparando' o 'en-camino'
                // Para simplificar, asumimos que el usuario sabe cuál es su tarea actual o lo filtramos
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Error al cargar pedidos: ' + err.message);
        } finally {
            setCargando(false);
        }
    };

    const asignarsePedido = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${ API_URL } /api/pedidos / ${ id }/asignar`, {
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
        if (data.success) {
            setPedidoAProcesar(null);
            cargarPedidos();
        } else {
            alert(data.message || 'Error al procesar');
        }
    } catch (err) {
        console.error(err);
        alert('Error de conexión');
    }
};


if (cargando) return <div className="loading-spinner">Cargando pedidos...</div>;

return (
    <div className="gestion-productos">
        <div className="gestion-header">
            <div className="header-content">
                <h2>Panel de Reparto</h2>
                <p className="header-description">Gestiona tus entregas y rutas asignadas</p>
            </div>
            <button className="btn-nuevo" onClick={cargarPedidos}>
                🔄 Actualizar
            </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="tabla-container">
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
                            <td colSpan="5" className="empty-state">No hay pedidos pendientes de reparto</td>
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
        </div>

        {pedidoAProcesar && (
            <BatchSelectionModal
                pedido={pedidoAProcesar}
                onClose={() => setPedidoAProcesar(null)}
                onConfirm={confirmarPreparacion}
            />
        )}
    </div>
);
}
```
