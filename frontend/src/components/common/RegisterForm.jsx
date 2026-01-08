import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/common/Auth.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: ''
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumber;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Pre-validations
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('La contraseña debe tener mayúsculas, minúsculas y números');
      return;
    }

    setCargando(true);

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...dataToSend } = formData;
      await register(dataToSend);
      // La redirección se maneja en App.jsx
    } catch (err) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Partículas flotantes de fondo */}
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
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Contenedor principal */}
      <div className="auth-container">
        <div className="auth-card">
          {/* Logo y Header */}
          <div className="auth-header">
            <div className="logo-wrapper">
              <img
                src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
                alt="REGMA"
                className="auth-logo"
              />
              <div className="logo-glow"></div>
            </div>
            <h1 className="auth-title">
              <span className="title-word">Únete</span>{' '}
              <span className="title-word">a</span>{' '}
              <span className="title-word">REGMA</span>
            </h1>
            <p className="auth-subtitle fade-in">Crea tu cuenta y disfruta de nuestros helados artesanales</p>
          </div>

          {/* Error */}
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

          {/* Formulario */}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group float-label">
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  disabled={cargando}
                  placeholder=" "
                  autoComplete="name"
                />
                <label htmlFor="nombre">Nombre Completo</label>
                <div className="input-border"></div>
              </div>
            </div>

            <div className="form-group float-label">
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={cargando}
                  placeholder=" "
                  autoComplete="email"
                />
                <label htmlFor="email">Correo Electrónico</label>
                <div className="input-border"></div>
              </div>
            </div>

            <div className="form-group float-label">
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={cargando}
                  placeholder=" "
                  autoComplete="tel"
                />
                <label htmlFor="telefono">Teléfono (opcional)</label>
                <div className="input-border"></div>
              </div>
            </div>

            <div className="form-group float-label">
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password"
                  name="password"
                  type={mostrarPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={cargando}
                  placeholder=" "
                  autoComplete="new-password"
                  minLength="6"
                />
                <label htmlFor="password">Contraseña</label>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  disabled={cargando}
                  tabIndex="-1"
                >
                  {mostrarPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
                <div className="input-border"></div>
              </div>
            </div>

            <div className="form-group float-label">
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={mostrarConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={cargando}
                  placeholder=" "
                  autoComplete="new-password"
                  minLength="6"
                />
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                  disabled={cargando}
                  tabIndex="-1"
                >
                  {mostrarConfirmPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
                <div className="input-border"></div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <span className="btn-spinner"></span>
                  Creando cuenta...
                </>
              ) : (
                <>
                  <span>Crear Cuenta</span>
                  <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  <div className="btn-shine"></div>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
              <span>
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  className="link-button link-animated"
                  onClick={() => navigate('/login')}
                  disabled={cargando}
                >
                  Inicia sesión aquí
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </span>

              <span className="auth-separator">o</span>

              <button
                type="button"
                className="link-button link-animated feature-link"
                onClick={() => navigate('/profesionales/registro-negocio')}
                disabled={cargando}
                style={{ color: '#FF5722', fontWeight: 600 }}
              >
                ¿Eres un negocio? Solicitar alta profesional
              </button>
            </p>
          </div>
        </div>

        {/* Info adicional */}
        <div className="auth-info fade-in-up">
          <p>© 2026 REGMA - El sabor de lo natural</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
