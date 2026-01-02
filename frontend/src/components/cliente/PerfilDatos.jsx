import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    User, Key, Save,
    Phone, Mail, Shield, AlertTriangle, CheckCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function PerfilDatos() {
    const { usuario } = useAuth();

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
                if (data.data.token) {
                    localStorage.setItem('token', data.data.token);
                }
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
    );
}
