import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import '../../styles/common/Auth.css'; // Reusing Auth styles

export default function RegisterNegocio() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombreNegocio: '',
        razonSocial: '',
        cif: '',
        tipoNegocio: 'hosteleria',
        direccion: {
            calle: '',
            ciudad: '',
            codigoPostal: '',
            provincia: ''
        },
        nombreContacto: '',
        emailContacto: '',
        telefonoContacto: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

        try {
            const res = await fetch(`${API_URL}/api/profesionales/registro-negocio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.msg || 'Error en el registro');
            }

            // Success
            alert('Solicitud de negocio registrada correctamente. En breve nos pondremos en contacto para validarla.');
            navigate('/login');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    return (
        <div className="auth-page-container">
            <Navbar />
            <div className="auth-content-wrapper" style={{ maxWidth: '800px', margin: '40px auto' }}>
                <h2 className="auth-title">Alta de Negocio / Profesional</h2>
                <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666' }}>
                    Únete a la red de profesionales Regma y disfruta de condiciones exclusivas.
                </p>

                {error && <div className="auth-error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form-grid">

                    {/* SECCIÓN DATOS EMPRESA */}
                    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                        <legend style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ff6600', marginBottom: '20px' }}>Datos de la Empresa</legend>

                        <div className="form-group-row">
                            <input
                                type="text"
                                name="cif"
                                placeholder="CIF / NIF"
                                className="auth-input"
                                value={formData.cif}
                                onChange={handleChange}
                                required
                            />
                            <select
                                name="tipoNegocio"
                                className="auth-input"
                                value={formData.tipoNegocio}
                                onChange={handleChange}
                            >
                                <option value="hosteleria">Hostelería (Restaurante/Hotel)</option>
                                <option value="retail">Supermercado / Retail</option>
                                <option value="distribuidor">Distribuidor</option>
                                <option value="eventos">Eventos / Catering</option>
                                <option value="otro">Otro</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                name="nombreNegocio"
                                placeholder="Nombre Comercial"
                                className="auth-input"
                                value={formData.nombreNegocio}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <input
                                type="text"
                                name="razonSocial"
                                placeholder="Razón Social"
                                className="auth-input"
                                value={formData.razonSocial}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group-row">
                            <input
                                type="text"
                                name="direccion.calle"
                                placeholder="Dirección (Calle, Nº)"
                                className="auth-input"
                                value={formData.direccion.calle}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="direccion.ciudad"
                                placeholder="Ciudad"
                                className="auth-input"
                                value={formData.direccion.ciudad}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group-row">
                            <input
                                type="text"
                                name="direccion.codigoPostal"
                                placeholder="CP"
                                className="auth-input"
                                value={formData.direccion.codigoPostal}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="text"
                                name="direccion.provincia"
                                placeholder="Provincia"
                                className="auth-input"
                                value={formData.direccion.provincia}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </fieldset>

                    <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />

                    {/* SECCIÓN ADMINISTRADOR */}
                    <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                        <legend style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ff6600', marginBottom: '20px' }}>Datos de Contacto (Administrador)</legend>

                        <div className="form-group">
                            <input
                                type="text"
                                name="nombreContacto"
                                placeholder="Nombre Completo"
                                className="auth-input"
                                value={formData.nombreContacto}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group-row">
                            <input
                                type="email"
                                name="emailContacto"
                                placeholder="Email Corporativo"
                                className="auth-input"
                                value={formData.emailContacto}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="tel"
                                name="telefonoContacto"
                                placeholder="Teléfono"
                                className="auth-input"
                                value={formData.telefonoContacto}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group-row">
                            <input
                                type="password"
                                name="password"
                                placeholder="Contraseña"
                                className="auth-input"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirmar Contraseña"
                                className="auth-input"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </fieldset>

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? 'Procesando...' : 'Registrar Negocio'}
                    </button>
                </form>
            </div>
            <Footer />
        </div>
    );
}
