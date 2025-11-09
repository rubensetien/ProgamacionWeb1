import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // TEMPORAL: Clave de prueba de Google

export default function RegisterForm({ onVolver }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [erroresPassword, setErroresPassword] = useState([]);
  const recaptchaRef = useRef();

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 5000);
  };

  const validarPassword = (password) => {
    const errores = [];
    
    if (password.length < 8) {
      errores.push('Mínimo 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errores.push('Al menos una mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errores.push('Al menos una minúscula');
    }
    if (!/\d/.test(password)) {
      errores.push('Al menos un número');
    }
    
    return errores;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    setErroresPassword(validarPassword(password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre || formData.nombre.length < 3) {
      mostrarMensaje('El nombre debe tener al menos 3 caracteres', 'error');
      return;
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      mostrarMensaje('Email inválido', 'error');
      return;
    }

    if (erroresPassword.length > 0) {
      mostrarMensaje('La contraseña no cumple los requisitos', 'error');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      mostrarMensaje('Las contraseñas no coinciden', 'error');
      return;
    }

    // Obtener token de reCAPTCHA
    const recaptchaToken = recaptchaRef.current.getValue();
    if (!recaptchaToken) {
      mostrarMensaje('Por favor, completa la verificación reCAPTCHA', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          recaptchaToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'Error al registrarse');
      }

      mostrarMensaje('¡Registro exitoso! Revisa tu email. Redirigiendo al login...', 'ok');
      
      // Limpiar formulario
      setFormData({ nombre: '', email: '', password: '', passwordConfirm: '' });
      recaptchaRef.current.reset();

      // Volver al login después de 3 segundos
      setTimeout(() => {
        onVolver();
      }, 3000);

    } catch (err) {
      mostrarMensaje(err.message, 'error');
      recaptchaRef.current.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <img 
            src="https://profesionales.regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png" 
            alt="Regma" 
            className="login-logo" 
          />
          <h1>Crear Cuenta de Usuario</h1>
          <p>Regístrate para acceder al catálogo</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              type="text"
              id="nombre"
              placeholder="Juan Pérez"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={handlePasswordChange}
              disabled={loading}
              required
            />
            {formData.password && (
              <div className="password-requirements">
                <small style={{ color: erroresPassword.length === 0 ? 'green' : '#666' }}>
                  {erroresPassword.length === 0 ? '✓ Contraseña válida' : 'Requisitos:'}
                </small>
                {erroresPassword.length > 0 && (
                  <ul>
                    {erroresPassword.map((error, index) => (
                      <li key={index} style={{ color: '#ff6600' }}>
                        ✗ {error}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm">Confirmar contraseña</label>
            <input
              type="password"
              id="passwordConfirm"
              placeholder="Repite tu contraseña"
              value={formData.passwordConfirm}
              onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
              disabled={loading}
              required
            />
{formData.passwordConfirm && (
  <div className={`password-match-indicator ${formData.password === formData.passwordConfirm ? 'match' : 'no-match'}`}>
    <span className="icon">
      {formData.password === formData.passwordConfirm ? '✓' : '✗'}
    </span>
    <span>
      {formData.password === formData.passwordConfirm ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
    </span>
  </div>
)}
</div>
<div className="form-group">
  <div className="recaptcha-container">
    <ReCAPTCHA
      ref={recaptchaRef}
      sitekey={RECAPTCHA_SITE_KEY}
      theme="light"
    />
  </div>
</div>
          
          {mensaje && (
            <div className={`mensaje ${mensaje.tipo}`} style={{ marginTop: '15px' }}>
              {mensaje.texto}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
            style={{ marginTop: '20px' }}
          >
            {loading ? '⏳ Registrando...' : '✅ Registrarse'}
          </button>

          <button
            type="button"
            onClick={onVolver}
            className="login-button"
            style={{ 
              marginTop: '10px', 
              backgroundColor: '#ccc', 
              color: '#333' 
            }}
            disabled={loading}
          >
            ← Volver al Login
          </button>
        </form>

        <div className="login-footer">
          <p style={{ fontSize: '12px', color: '#666', marginTop: '20px' }}>
            Al registrarte, recibirás un email de bienvenida
          </p>
        </div>
      </div>
    </div>
  );
}