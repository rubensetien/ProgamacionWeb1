import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/common/Auth.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: ''
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await register(formData);
      // La redirección se maneja en App.jsx
    } catch (err) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Fondo animado */}
      <div className="auth-background">
        <div className="auth-blob blob-1"></div>
        <div className="auth-blob blob-2"></div>
        <div className="auth-blob blob-3"></div>
      </div>

      {/* Contenedor principal */}
      <div className="auth-container">
        <div className="auth-card">
          {/* Logo y Header */}
          <div className="auth-header">
            <img 
              src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png" 
              alt="REGMA" 
              className="auth-logo"
            />
            <h1 className="auth-title">Únete a REGMA</h1>
            <p className="auth-subtitle">Crea tu cuenta y disfruta de nuestros helados</p>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Formulario */}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">
                <span className="label-icon">👤</span>
                Nombre Completo
              </label>
              <div className="input-wrapper">
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  disabled={cargando}
                  placeholder="Juan Pérez"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <span className="label-icon">📧</span>
                Correo Electrónico
              </label>
              <div className="input-wrapper">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={cargando}
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="telefono">
                <span className="label-icon">📱</span>
                Teléfono (opcional)
              </label>
              <div className="input-wrapper">
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={cargando}
                  placeholder="+34 600 000 000"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <span className="label-icon">🔒</span>
                Contraseña
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={mostrarPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={cargando}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  minLength="6"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  disabled={cargando}
                  tabIndex="-1"
                >
                  {mostrarPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <span className="spinner-small"></span>
                  Creando cuenta...
                </>
              ) : (
                <>
                  <span>Crear Cuenta</span>
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                className="link-button"
                onClick={() => navigate('/login')}
                disabled={cargando}
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </div>

        {/* Info adicional */}
        <div className="auth-info">
          <p>© 2024 REGMA - El sabor de lo natural</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
