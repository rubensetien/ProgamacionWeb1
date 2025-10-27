import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginForm({ onRegistro }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email y contraseña son requeridos');
      return;
    }
    try {
      await login(email, password);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError('Email o contraseña incorrectos');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img 
          src="https://profesionales.regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png" 
          alt="Regma" 
          className="login-logo" 
        />
        <h1>Catálogo de Helados</h1>
        <p>Inicia sesión para continuar</p>
        
        {error && <div className="error-box">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            disabled={loading}
            required 
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            disabled={loading}
            required 
          />
          <button type="submit" disabled={loading}>
            {loading ? '⏳ Autenticando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* NUEVO: Botón de registro */}
        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
            ¿No tienes cuenta?
          </p>
          <button
            type="button"
            onClick={onRegistro}
            className="register-button"
            disabled={loading}
          >
            📝 Registrarse como Usuario
          </button>
        </div>

        <p className="test-info" style={{ marginTop: '20px' }}>
          Admin: admin@example.com / admin123<br />
          User: user@example.com / user123
        </p>
      </div>
    </div>
  );
}