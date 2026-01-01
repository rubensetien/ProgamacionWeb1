import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClipboardCheck } from 'lucide-react';
import '../../styles/admin/gestion/GestionProductos.css';

export default function ValidacionNegocios() {
    const [negocios, setNegocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { usuario } = useAuth();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Fetch pendientes
    const fetchPendientes = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/profesionales/pendientes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (Array.isArray(data)) {
                setNegocios(data);
            } else {
                setNegocios([]);
            }
        } catch (err) {
            console.error(err);
            setError('Error al cargar solicitudes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendientes();
    }, []);

    const handleAction = async (id, action) => {
        if (!window.confirm(`¿Estás seguro de que quieres ${action} este negocio?`)) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/profesionales/${id}/${action}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert(`Negocio ${action === 'validar' ? 'validado' : 'rechazado'} correctamente`);
                fetchPendientes(); // Recargar lista
            } else {
                alert('Error al procesar la solicitud');
            }
        } catch (err) {
            console.error(err);
            alert('Error de conexión');
        }
    };

    if (loading) return <div>Cargando solicitudes...</div>;

    return (
        <div className="gestion-productos">
            <div className="gestion-header">
                <div className="header-content">
                    <h2>
                        Solicitudes de Alta
                    </h2>
                    <p className="header-description">
                        Validación de nuevos registros profesionales
                    </p>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {negocios.length === 0 ? (
                <div className="empty-state">
                    <ClipboardCheck size={64} style={{ color: '#bdc3c7', marginBottom: '16px' }} />
                    <p>No hay solicitudes pendientes.</p>
                </div>
            ) : (
                <div className="tabla-container">
                    <table className="tabla-productos">
                        <thead>
                            <tr>
                                <th>Negocio</th>
                                <th>CIF</th>
                                <th>Contacto</th>
                                <th>Tipo</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {negocios.map(negocio => (
                                <tr key={negocio._id}>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>{negocio.nombre}</div>
                                        <div style={{ fontSize: '0.85em', color: '#666' }}>{negocio.razonSocial}</div>
                                    </td>
                                    <td>
                                        <span className="td-sku">{negocio.cif}</span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{negocio.contacto.nombre}</div>
                                        <div style={{ fontSize: '0.8em', color: '#666' }}>{negocio.contacto.email}</div>
                                        <div style={{ fontSize: '0.8em', color: '#666' }}>{negocio.contacto.telefono}</div>
                                    </td>
                                    <td>
                                        <span className="badge" style={{ background: '#e3f2fd', color: '#0d47a1' }}>
                                            {negocio.tipo}
                                        </span>
                                    </td>
                                    <td>{new Date(negocio.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="acciones">
                                            <button
                                                className="btn-icono"
                                                onClick={() => handleAction(negocio._id, 'validar')}
                                                style={{ background: '#d4edda', color: '#155724' }}
                                                title="Aceptar Solicitud"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            </button>
                                            <button
                                                className="btn-icono"
                                                onClick={() => handleAction(negocio._id, 'rechazar')}
                                                style={{ background: '#f8d7da', color: '#721c24' }}
                                                title="Rechazar Solicitud"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
}
