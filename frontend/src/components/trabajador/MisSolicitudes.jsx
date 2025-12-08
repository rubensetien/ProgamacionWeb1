import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import '../../styles/admin/gestion/GestionProductos.css'; // Reutilizar estilos generales

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const MisSolicitudes = () => {
    const { token } = useAuth();
    const [solicitudes, setSolicitudes] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    const [formulario, setFormulario] = useState({
        tipo: 'vacaciones',
        fechaInicio: '',
        fechaFin: '',
        horas: '',
        motivo: ''
    });

    useEffect(() => {
        fetchSolicitudes();
    }, []);

    const fetchSolicitudes = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/solicitudes/mis-solicitudes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSolicitudes(res.data.data || []);
        } catch (error) {
            console.error('Error cargando solicitudes:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/solicitudes`, formulario, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMensaje({ tipo: 'success', texto: 'Solicitud enviada correctamente' });
            setMostrarModal(false);
            setFormulario({ tipo: 'vacaciones', fechaInicio: '', fechaFin: '', horas: '', motivo: '' });
            fetchSolicitudes();
            setTimeout(() => setMensaje(null), 3000);
        } catch (error) {
            console.error('Error enviando solicitud:', error);
            setMensaje({ tipo: 'error', texto: 'Error al enviar solicitud' });
        } finally {
            setLoading(false);
        }
    };

    const getEstadoBadge = (estado) => {
        const estilos = {
            pendiente: { bg: '#fff3cd', color: '#856404' },
            aprobada: { bg: '#d4edda', color: '#155724' },
            rechazada: { bg: '#f8d7da', color: '#721c24' }
        };
        const st = estilos[estado] || estilos.pendiente;
        return (
            <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: st.bg,
                color: st.color,
                fontSize: '0.85rem',
                fontWeight: 'bold',
                textTransform: 'capitalize'
            }}>
                {estado}
            </span>
        );
    };

    return (
        <div className="gestion-container fade-in" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="gestion-header">
                <div>
                    <h2>Mis Solicitudes</h2>
                    <p className="header-description">Gestiona tus vacaciones y días libres</p>
                </div>
                <button className="btn-nuevo" onClick={() => setMostrarModal(true)}>
                    + Nueva Solicitud
                </button>
            </div>

            {mensaje && (
                <div className={`alert alert-${mensaje.tipo}`}>
                    {mensaje.texto}
                </div>
            )}

            <div className="tabla-container">
                <table className="tabla-productos">
                    <thead>
                        <tr>
                            <th>TIPO</th>
                            <th>FECHAS</th>
                            <th>MOTIVO</th>
                            <th>ESTADO</th>
                            <th>RESPUESTA ADMIN</th>
                        </tr>
                    </thead>
                    <tbody>
                        {solicitudes.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="empty-state">No tienes solicitudes registradas.</td>
                            </tr>
                        ) : (
                            solicitudes.map(sol => (
                                <tr key={sol._id}>
                                    <td style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                                        {sol.tipo}
                                        {sol.tipo === 'horas-libres' && <span style={{ display: 'block', fontSize: '0.8em', color: '#666' }}>{sol.horas}</span>}
                                    </td>
                                    <td>
                                        {new Date(sol.fechaInicio).toLocaleDateString()} - {new Date(sol.fechaFin).toLocaleDateString()}
                                    </td>
                                    <td>{sol.motivo}</td>
                                    <td>{getEstadoBadge(sol.estado)}</td>
                                    <td>{sol.respuestaAdmin || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {mostrarModal && (
                <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Nueva Solicitud</h3>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Tipo</label>
                                <select
                                    value={formulario.tipo}
                                    onChange={e => setFormulario({ ...formulario, tipo: e.target.value })}
                                >
                                    <option value="vacaciones">Vacaciones</option>
                                    <option value="dia-libre">Día Libre</option>
                                    <option value="horas-libres">Horas Libres</option>
                                    <option value="asuntos-propios">Asuntos Propios</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fecha Inicio</label>
                                    <input
                                        type="date"
                                        required
                                        value={formulario.fechaInicio}
                                        onChange={e => setFormulario({ ...formulario, fechaInicio: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Fecha Fin</label>
                                    <input
                                        type="date"
                                        required
                                        value={formulario.fechaFin}
                                        onChange={e => setFormulario({ ...formulario, fechaFin: e.target.value })}
                                    />
                                </div>
                            </div>

                            {formulario.tipo === 'horas-libres' && (
                                <div className="form-group">
                                    <label>Horario (ej: 10:00 - 12:00)</label>
                                    <input
                                        type="text"
                                        value={formulario.horas}
                                        onChange={e => setFormulario({ ...formulario, horas: e.target.value })}
                                        placeholder="10:00 - 12:00"
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Motivo</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={formulario.motivo}
                                    onChange={e => setFormulario({ ...formulario, motivo: e.target.value })}
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancelar" onClick={() => setMostrarModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-guardar" disabled={loading}>
                                    {loading ? 'Enviando...' : 'Enviar Solicitud'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MisSolicitudes;
