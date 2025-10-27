import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:3001/api';

export default function RegisterAdmin({ onClose }) {
  const { crearHeaderAuth, usuario } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    passwordConfirm: '',
    adminPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [erroresPassword, setErroresPassword] = useState([]);
  const [mostrarVerificacion, setMostrarVerificacion] = useState(false);

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
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

  const handleContinuar = (e) => {
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

    // Pasar a verificación
    setMostrarVerificacion(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.adminPassword) {
      mostrarMensaje('Debes ingresar tu contraseña de administrador', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register-admin`, {
        method: 'POST',
        headers: crearHeaderAuth(),
        credentials: 'include',
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          adminPassword: formData.adminPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.mensaje || 'Error al registrar administrador');
      }

      mostrarMensaje('✅ Administrador registrado exitosamente. Email enviado.', 'ok');
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      mostrarMensaje(err.message, 'error');
      setMostrarVerificacion(false);
      setFormData({ ...formData, adminPassword: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👨‍💼 Registrar Nuevo Administrador</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {!mostrarVerificacion ? (
          // PASO 1: Datos del nuevo admin
          <form className="modal-form" onSubmit={handleContinuar}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo</label>
              <input
                type="text"
                id="nombre"
                placeholder="Nombre del nuevo admin"
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
                placeholder="admin@ejemplo.com"
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
                placeholder="Contraseña temporal"
                value={formData.password}
                onChange={handlePasswordChange}
                disabled={loading}
                required
              />
              {formData.password && erroresPassword.length > 0 && (
                <div className="password-requirements">
                  <small style={{ color: '#666' }}>Requisitos:</small>
                  <ul>
                    {erroresPassword.map((error, index) => (
                      <li key={index} style={{ color: '#ff6600', fontSize: '12px' }}>
                        ✗ {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="passwordConfirm">Confirmar contraseña</label>
              <input
                type="password"
                id="passwordConfirm"
                placeholder="Repite la contraseña"
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                disabled={loading}
                required
              />
              {formData.passwordConfirm && (
                <small style={{ 
                  color: formData.password === formData.passwordConfirm ? 'green' : '#ff6600',
                  fontSize: '12px'
                }}>
                  {formData.password === formData.passwordConfirm ? '✓ Coinciden' : '✗ No coinciden'}
                </small>
              )}
            </div>

            {mensaje && (
              <div className={`mensaje ${mensaje.tipo}`}>
                {mensaje.texto}
              </div>
            )}

            <div className="modal-actions">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading || erroresPassword.length > 0}
              >
                Continuar →
              </button>
              <button 
                type="button" 
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          // PASO 2: Verificación de seguridad
          <form className="modal-form" onSubmit={handleSubmit}>
            <div className="verification-section">
              <div className="alert alert-warning">
                <strong>⚠️ Verificación de Seguridad</strong>
                <p>Por favor, confirma tu identidad ingresando tu contraseña de administrador.</p>
                <p style={{ fontSize: '12px', marginTop: '10px' }}>
                  Usuario actual: <strong>{usuario?.email}</strong>
                </p>
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label htmlFor="adminPassword">Tu contraseña (admin actual)</label>
                <input
                  type="password"
                  id="adminPassword"
                  placeholder="Ingresa tu contraseña"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  disabled={loading}
                  autoFocus
                  required
                />
              </div>

              {mensaje && (
                <div className={`mensaje ${mensaje.tipo}`}>
                  {mensaje.texto}
                </div>
              )}

              <div className="modal-actions">
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading || !formData.adminPassword}
                >
                  {loading ? '⏳ Registrando...' : '✅ Registrar Administrador'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setMostrarVerificacion(false);
                    setFormData({ ...formData, adminPassword: '' });
                  }}
                  className="btn-secondary"
                  disabled={loading}
                >
                  ← Volver
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}