import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/common/Auth.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Credenciales inválidas');
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
          {/* Logo con efecto shine */}
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
              <span className="title-word">Bienvenido</span>{' '}
              <span className="title-word">de</span>{' '}
              <span className="title-word">nuevo</span>
            </h1>
            <p className="auth-subtitle fade-in">
              Inicia sesión para disfrutar de nuestros productos artesanales
            </p>
          </div>

          {/* Error con animación */}
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
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password"
                  type={mostrarPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={cargando}
                  placeholder=" "
                  autoComplete="current-password"
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

            <button
              type="submit"
              className="btn-primary btn-magnetic"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <div className="btn-spinner"></div>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span className="btn-text">Iniciar Sesión</span>
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
                ¿No tienes cuenta?{' '}
                <button
                  type="button"
                  className="link-button link-animated"
                  onClick={() => navigate('/register')}
                  disabled={cargando}
                >
                  Regístrate aquí
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </span>

              <button
                type="button"
                className="link-button link-animated"
                onClick={() => navigate('/')}
                disabled={cargando}
                style={{ fontSize: '14px', opacity: 0.8 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'rotate(180deg)' }}>
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
                Volver al inicio
              </button>
            </p>
          </div>


        </div>

        {/* Info adicional */}
        <div className="auth-info fade-in-up">
          <p>© 2025 REGMA - El sabor de lo natural</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
