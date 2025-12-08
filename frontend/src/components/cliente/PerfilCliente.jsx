import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MisPedidos from './MisPedidos';
import {
    User, Package, Key, Save, Camera, LogOut,
    MapPin, Phone, Mail, Shield, AlertTriangle, CheckCircle
} from 'lucide-react';
import '../../styles/cliente/PerfilCliente.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function PerfilCliente() {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('perfil'); // 'perfil' | 'pedidos'

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        password: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (usuario) {
            setFormData(prev => ({
                ...prev,
                nombre: usuario.nombre || '',
                email: usuario.email || '',
                telefono: usuario.telefono || ''
            }));
        }
    }, [usuario]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden' });
            return;
        }

        if (formData.newPassword && !formData.password) {
            setMessage({ type: 'error', text: 'Debes ingresar tu contraseña actual para cambiarla' });
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    email: formData.email,
                    telefono: formData.telefono,
                    ...(formData.newPassword ? {
                        password: formData.password,
                        newPassword: formData.newPassword
                    } : {})
                })
            });

            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
                // Update local storage and context if necessary (context might need reload or manual update)
                // For now, simpler to just show success. Ideally, useAuth should expose a setUser method.
                // Assuming page reload or context auto-refresh on next navigation
                if (data.data.token) {
                    localStorage.setItem('token', data.data.token);
                }

                // Forced reload to update context for now, or we could add setUser to context
                setTimeout(() => window.location.reload(), 1500);

            } else {
                setMessage({ type: 'error', text: data.message || 'Error al actualizar perfil' });
            }

        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="perfil-page">
            {/* Hero Header matching Checkout */}
            <header className="profile-hero">
                <div className="hero-content">
                    <div className="hero-top-bar">
                        <div className="brand-wrapper">
                            <img
                                src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
                                alt="REGMA"
                                className="hero-logo"
                                onClick={() => navigate('/')}
                                style={{ cursor: 'cursor' }}
                            />
                        </div>
                        <button className="btn-hero-text" onClick={() => navigate('/')}>
                            <User size={16} /> Volver al Inicio
                        </button>
                    </div>
                    <h1 className="hero-title">Mi Perfil</h1>
                    <p className="hero-subtitle">Gestiona tu información personal y revisa tu historial de pedidos</p>
                </div>
            </header>

            <div className="perfil-container">
                {/* Sidebar / Tabs */}
                <aside className="perfil-sidebar">
                    <div className="perfil-user-card">
                        <div className="user-avatar-large">
                            {usuario?.avatar ? (<img src={usuario.avatar} alt="Avatar" />) : (<User size={40} />)}
                        </div>
                        <h3>{usuario?.nombre}</h3>
                        <span className="user-role-badge">{usuario?.rol}</span>
                    </div>

                    <nav className="perfil-nav">
                        <button
                            className={`nav-item ${activeTab === 'perfil' ? 'active' : ''}`}
                            onClick={() => setActiveTab('perfil')}
                        >
                            <User size={20} /> Mi Perfil
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'pedidos' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pedidos')}
                        >
                            <Package size={20} /> Mis Pedidos
                        </button>
                        <div className="nav-divider"></div>
                        <button className="nav-item logout" onClick={logout}>
                            <LogOut size={20} /> Cerrar Sesión
                        </button>
                    </nav>
                </aside>

                {/* Content Area - Transparent when showing Order Cards */}
                <main className={`perfil-content ${activeTab === 'pedidos' ? 'transparent-mode' : ''}`}>
                    {activeTab === 'perfil' && (
                        <div className="perfil-form-section">
                            <div className="section-header">
                                <h2>Configuración de Cuenta</h2>
                                <p>Gestiona tus datos personales y seguridad</p>
                            </div>

                            {message.text && (
                                <div className={`alert-message ${message.type}`}>
                                    {message.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="form-grid">
                                <div className="form-group">
                                    <label>Nombre Completo</label>
                                    <div className="input-with-icon">
                                        <User size={18} />
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Correo Electrónico</label>
                                    <div className="input-with-icon">
                                        <Mail size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <div className="input-with-icon">
                                        <Phone size={18} />
                                        <input
                                            type="tel"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleChange}
                                            placeholder="+34..."
                                        />
                                    </div>
                                </div>

                                <div className="form-divider">
                                    <h3>Seguridad</h3>
                                </div>

                                <div className="form-group">
                                    <label>Contraseña Actual (Para cambios)</label>
                                    <div className="input-with-icon">
                                        <Key size={18} />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Nueva Contraseña</label>
                                    <div className="input-with-icon">
                                        <Shield size={18} />
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            placeholder="Nueva contraseña"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Confirmar Nueva Contraseña</label>
                                    <div className="input-with-icon">
                                        <Shield size={18} />
                                        <input
                                            type="password"
                                            name="confirmNewPassword"
                                            value={formData.confirmNewPassword}
                                            onChange={handleChange}
                                            placeholder="Repite la nueva contraseña"
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn-save" disabled={loading}>
                                        {loading ? 'Guardando...' : (<><Save size={20} /> Guardar Cambios</>)}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'pedidos' && (
                        <div className="perfil-pedidos-wrapper">
                            <MisPedidos />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
