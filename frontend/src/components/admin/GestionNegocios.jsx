import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, MapPin, Plus, UserPlus, Building } from 'lucide-react';
import '../../styles/admin/gestion/GestionProductos.css';

export default function GestionNegocios() {
    const [negocios, setNegocios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNegocio, setSelectedNegocio] = useState(null); // Para ver detalles/contactos
    const [showAddContact, setShowAddContact] = useState(false); // Modal state
    const { usuario } = useAuth();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Form state para nuevo contacto
    const [newContact, setNewContact] = useState({
        nombre: '',
        email: '',
        telefono: '',
        puesto: '',
        password: 'Regma' + new Date().getFullYear() // Default simple, en prod cambiar
    });

    const fetchNegocios = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/profesionales`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) setNegocios(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNegocios();
    }, []);

    const handleAddContact = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/profesionales/${selectedNegocio._id}/empleados`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newContact)
            });

            if (res.ok) {
                alert('Contacto añadido correctamente');
                setShowAddContact(false);
                setNewContact({ nombre: '', email: '', telefono: '', puesto: '', password: 'Regma' + new Date().getFullYear() });
                // En una app real, aquí recargaríamos la lista de contactos del negocio
                // Para MVP, simplemente cerramos
            } else {
                const data = await res.json();
                alert(data.msg || 'Error al añadir contacto');
            }
        } catch (err) {
            console.error(err);
            alert('Error de conexión');
        }
    };

    if (loading) return <div>Cargando negocios...</div>;

    return (
        <div className="gestion-productos">
            <div className="gestion-header">
                <div className="header-content">
                    <h2>
                        Gestión de Negocios
                    </h2>
                    <p className="header-description">
                        Administración de cuentas profesionales y usuarios B2B
                    </p>
                </div>
            </div>

            <div className="filtros-bar">
                <div className="search-box">
                    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" placeholder="Buscar negocio..." style={{ paddingLeft: '48px' }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px', height: 'calc(100% - 140px)' }}>
                {/* LISTA DE NEGOCIOS */}
                <div className="tabla-container" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px', background: '#f8f9fa', borderBottom: '1px solid #e8e8e8', fontWeight: 700, color: '#2c3e50' }}>
                        Listado Global
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {negocios.map(negocio => (
                            <div
                                key={negocio._id}
                                onClick={() => setSelectedNegocio(negocio)}
                                style={{
                                    padding: '16px',
                                    borderBottom: '1px solid #f0f0f0',
                                    cursor: 'pointer',
                                    background: selectedNegocio?._id === negocio._id ? '#fff3cd' : 'white',
                                    borderLeft: selectedNegocio?._id === negocio._id ? '4px solid #ff6600' : '4px solid transparent',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <strong style={{ color: '#2c3e50' }}>{negocio.nombre}</strong>
                                    <span className={`badge ${negocio.estado === 'activo' ? 'badge-success' : 'badge-inactive'}`}>
                                        {negocio.estado}
                                    </span>
                                </div>
                                <div style={{ fontSize: '13px', color: '#7f8c8d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <MapPin size={14} />
                                    {negocio.direccion?.ciudad} • {negocio.tipo}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DETALLES Y CONTACTOS */}
                <div className="tabla-container" style={{ padding: '0', overflowY: 'auto', background: '#fff' }}>
                    {selectedNegocio ? (
                        <div style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px', borderBottom: '2px solid #f0f0f0', paddingBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#2c3e50' }}>{selectedNegocio.nombre}</h3>
                                    <div style={{ color: '#7f8c8d', fontSize: '14px' }}>CIF: {selectedNegocio.cif}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="td-sku">{selectedNegocio.razonSocial}</div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="stat-card" style={{ padding: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff6600', fontWeight: 700, marginBottom: '8px' }}>
                                        <MapPin size={20} /> Dirección
                                    </div>
                                    <div style={{ fontSize: '15px', color: '#2c3e50', lineHeight: '1.5' }}>
                                        {selectedNegocio.direccion?.calle}<br />
                                        {selectedNegocio.direccion?.cp} {selectedNegocio.direccion?.ciudad}<br />
                                        {selectedNegocio.direccion?.provincia}
                                    </div>
                                </div>

                                <div className="stat-card" style={{ padding: '20px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff6600', fontWeight: 700, marginBottom: '8px' }}>
                                        <Building size={20} /> Datos Fiscales
                                    </div>
                                    <div style={{ fontSize: '15px', color: '#2c3e50', lineHeight: '1.5' }}>
                                        <strong>Razón Social:</strong> {selectedNegocio.razonSocial}<br />
                                        <strong>Tipo:</strong> {selectedNegocio.tipo}<br />
                                        <strong>Estado:</strong> {selectedNegocio.estado}
                                    </div>
                                </div>
                            </div>

                            <h4 style={{ marginTop: '32px', marginBottom: '16px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', color: '#2c3e50' }}>
                                <UserPlus size={20} /> Contactos y Empleados
                            </h4>

                            <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '20px', border: '1px solid #e8e8e8' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ffead0', color: '#ff6600', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                                        {selectedNegocio.contacto.nombre.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#2c3e50' }}>{selectedNegocio.contacto.nombre} <span className="badge badge-success" style={{ marginLeft: '8px', fontSize: '10px' }}>ADMIN</span></div>
                                        <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '14px', color: '#7f8c8d' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {selectedNegocio.contacto.email}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {selectedNegocio.contacto.telefono}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setShowAddContact(true)}
                                    className="btn-nuevo"
                                    style={{ padding: '10px 20px', fontSize: '14px' }}
                                >
                                    <Plus size={16} /> Añadir Contacto
                                </button>
                            </div>

                        </div>
                    ) : (
                        <div className="empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Building size={64} style={{ color: '#bdc3c7', marginBottom: '16px' }} />
                            <p>Selecciona un negocio para ver sus detalles</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL AÑADIR CONTACTO (Updated styles to match classNames) */}
            {showAddContact && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3>Nuevo Empleado</h3>
                            <button className="btn-close" onClick={() => setShowAddContact(false)}>×</button>
                        </div>
                        <div className="modal-form">
                            <form onSubmit={handleAddContact}>
                                <div className="form-group">
                                    <label>Nombre</label>
                                    <input
                                        type="text" required
                                        value={newContact.nombre}
                                        onChange={e => setNewContact({ ...newContact, nombre: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email" required
                                        value={newContact.email}
                                        onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="tel" required
                                        value={newContact.telefono}
                                        onChange={e => setNewContact({ ...newContact, telefono: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Puesto / Rol</label>
                                    <input
                                        type="text" placeholder="Ej: Encargado"
                                        value={newContact.puesto}
                                        onChange={e => setNewContact({ ...newContact, puesto: e.target.value })}
                                    />
                                </div>

                                <div className="modal-footer" style={{ padding: '0', border: 'none', justifyContent: 'space-between' }}>
                                    <button
                                        type="button"
                                        className="btn-cancelar"
                                        onClick={() => setShowAddContact(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-guardar"
                                    >
                                        Guardar Empleado
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
