import { useState, useEffect } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import '../../styles/admin/gestion/GestionProductos.css'; // Reusing common styles

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function MisTurnos() {
    const [turnos, setTurnos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarTurnos();
    }, []);

    const cargarTurnos = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/turnos/mis-turnos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                setTurnos(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Error de conexión');
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    if (cargando) return <div className="loading-spinner">Cargando turnos...</div>;

    return (
        <div className="gestion-productos">
            <div className="gestion-header">
                <div className="header-content">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar size={28} /> Mis Turnos
                    </h2>
                    <p className="header-description">Próximos turnos asignados</p>
                </div>
                <button className="btn-nuevo" onClick={cargarTurnos}>
                    <RefreshCw size={18} /> Actualizar
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="tabla-container">
                <table className="tabla-productos">
                    <thead>
                        <tr>
                            <th>FECHA</th>
                            <th>HORARIO / TIPO</th>
                            <th>UBICACIÓN</th>
                            <th>NOTAS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {turnos.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="empty-state">No tienes turnos asignados próximamente</td>
                            </tr>
                        ) : (
                            turnos.map(turno => (
                                <tr key={turno._id}>
                                    <td style={{ fontWeight: 'bold' }}>
                                        {new Date(turno.fecha).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span className={`badge ${turno.tipo === 'mañana' ? 'badge-success' :
                                            turno.tipo === 'tarde' ? 'badge-warning' :
                                                turno.tipo === 'noche' ? 'badge-primary' : 'badge-info'
                                            }`}>
                                            {turno.tipo.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        {turno.ubicacion?.nombre} <br />
                                        <span style={{ fontSize: '0.8em', color: '#666' }}>{turno.ubicacion?.tipo}</span>
                                    </td>
                                    <td>
                                        {turno.nota || '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
