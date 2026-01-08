import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/common/Auth.css';
import '../../styles/auth/RegisterBusiness.css';

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
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="auth-page">
            {/* BACKGROUND PARTICLES */}
            <div className="auth-background">
                <div className="particles">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="particle" style={{
                            '--delay': `${i * 0.5}s`,
                            '--x': `${Math.random() * 100}%`,
                            '--y': `${Math.random() * 100}%`,
                            '--duration': `${10 + Math.random() * 20}s`
                        }}></div>
                    ))}
                </div>
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
            </div>

            <div className="auth-container business-auth-container">
                <div className="auth-card">
                    {/* HEADER */}
                    <div className="auth-header">
                        <div className="logo-wrapper">
                            <img
                                src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
                                alt="REGMA"
                                className="auth-logo"
                                style={{ maxWidth: '180px' }}
                            />
                            <div className="logo-glow"></div>
                        </div>
                        <h1 className="auth-title" style={{ fontSize: '2.5rem' }}>
                            <span className="title-word">Alta</span>{' '}
                            <span className="title-word">Profesional</span>
                        </h1>
                        <p className="auth-subtitle fade-in">
                            Únete a la red de distribuidores y hostelería de Regma
                        </p>
                    </div>

                    {error && (
                        <div className="auth-error pulse-error">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">

                        {/* SECCION EMPRESA */}
                        <fieldset className="business-fieldset">
                            <legend className="business-legend">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                                    <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21V7" />
                                    <path d="M4 11h16" />
                                </svg>
                                Datos de la Empresa
                            </legend>

                            <div className="form-group-row">
                                <div className="input-wrapper float-label">
                                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                    <input
                                        type="text"
                                        name="cif"
                                        placeholder=" "
                                        value={formData.cif}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label>CIF / NIF</label>
                                    <div className="input-border"></div>
                                </div>

                                <div className="input-wrapper float-label">
                                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                    </svg>
                                    <select
                                        name="tipoNegocio"
                                        value={formData.tipoNegocio}
                                        onChange={handleChange}
                                        style={{ width: '100%', paddingLeft: '56px', height: '62px', background: 'transparent', border: '2px solid #e0e0e0', borderRadius: '16px' }}
                                    >
                                        <option value="hosteleria">Hostelería</option>
                                        <option value="retail">Supermercado / Retail</option>
                                        <option value="distribuidor">Distribuidor</option>
                                        <option value="eventos">Eventos</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                    {/* <label>Actividad</label> */}
                                </div>
                            </div>

                            <div className="input-wrapper float-label" style={{ marginBottom: '20px' }}>
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <input
                                    type="text"
                                    name="nombreNegocio"
                                    placeholder=" "
                                    value={formData.nombreNegocio}
                                    onChange={handleChange}
                                    required
                                />
                                <label>Nombre Comercial</label>
                                <div className="input-border"></div>
                            </div>

                            <div className="input-wrapper float-label" style={{ marginBottom: '20px' }}>
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                <input
                                    type="text"
                                    name="razonSocial"
                                    placeholder=" "
                                    value={formData.razonSocial}
                                    onChange={handleChange}
                                    required
                                />
                                <label>Razón Social</label>
                                <div className="input-border"></div>
                            </div>

                            <div className="form-group-row">
                                <div className="input-wrapper float-label">
                                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    <input
                                        type="text"
                                        name="direccion.calle"
                                        placeholder=" "
                                        value={formData.direccion.calle}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label>Dirección</label>
                                    <div className="input-border"></div>
                                </div>
                                <div className="input-wrapper float-label">
                                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                        <polyline points="9 22 9 12 15 12 15 22" />
                                    </svg>
                                    <input
                                        type="text"
                                        name="direccion.ciudad"
                                        placeholder=" "
                                        value={formData.direccion.ciudad}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label>Ciudad</label>
                                    <div className="input-border"></div>
                                </div>
                            </div>

                            <div className="form-group-row">
                                <div className="input-wrapper float-label">
                                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="M7 15h0M7 9h0" />
                                    </svg>
                                    <input
                                        type="text"
                                        name="direccion.codigoPostal"
                                        placeholder=" "
                                        value={formData.direccion.codigoPostal}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label>Código Postal</label>
                                    <div className="input-border"></div>
                                </div>
                                <div className="input-wrapper float-label">
                                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="2" y1="12" x2="22" y2="12" />
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                    </svg>
                                    <input
                                        type="text"
                                        name="direccion.provincia"
                                        placeholder=" "
                                        value={formData.direccion.provincia}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label>Provincia</label>
                                    <div className="input-border"></div>
                                </div>
                            </div>
                        </fieldset>

                        {/* SECCION CONTACTO */}
                        <fieldset className="business-fieldset">
                            <legend className="business-legend">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                Contacto y Acceso
                            </legend>

                            <div className="input-wrapper float-label" style={{ marginBottom: '20px' }}>
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <input
                                    type="text"
                                    name="nombreContacto"
                                    placeholder=" "
                                    value={formData.nombreContacto}
                                    onChange={handleChange}
                                    required
                                />
                                <label>Nombre del Administrador</label>
                                <div className="input-border"></div>
                            </div>

                            <div className="form-group-row">
                                <div className="input-wrapper float-label">
                                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="4" width="20" height="16" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                    <input
                                        type="email"
                                        name="emailContacto"
                                        placeholder=" "
                                        value={formData.emailContacto}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label>Email Corporativo</label>
                                    <div className="input-border"></div>
                                </div>
                                <div className="input-wrapper float-label">
                                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                    <input
                                        type="tel"
                                        name="telefonoContacto"
                                        placeholder=" "
                                        value={formData.telefonoContacto}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label>Teléfono</label>
                                    <div className="input-border"></div>
                                </div>
                            </div>

                            <div className="form-group-row">
                                <div className="input-wrapper float-label">
                                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder=" "
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label>Contraseña</label>
                                    <div className="input-border"></div>
                                </div>
                                <div className="input-wrapper float-label">
                                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder=" "
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <label>Confirmar Contraseña</label>
                                    <div className="input-border"></div>
                                </div>
                            </div>
                        </fieldset>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="btn-spinner"></div>
                                    <span>Enviando Solicitud...</span>
                                </>
                            ) : (
                                <>
                                    <span className="btn-text">Registrar Negocio</span>
                                    <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                    <div className="btn-shine"></div>
                                </>
                            )}
                        </button>

                        <div className="auth-footer" style={{ borderTop: 'none', margin: 0, padding: 0 }}>
                            <button
                                type="button"
                                className="link-button link-animated"
                                onClick={() => navigate('/login')}
                                style={{ marginTop: '20px', fontSize: '0.9rem' }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'rotate(180deg)' }}>
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                                Volver al Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
