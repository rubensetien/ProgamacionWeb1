import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
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

    if (!formData.nombre || formData.nombre.length < 3) {
      mostrarMensaje('❌ El nombre debe tener al menos 3 caracteres', 'error');
      return;
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      mostrarMensaje('❌ Email inválido', 'error');
      return;
    }

    if (erroresPassword.length > 0) {
      mostrarMensaje('❌ La contraseña no cumple los requisitos', 'error');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      mostrarMensaje('❌ Las contraseñas no coinciden', 'error');
      return;
    }

    setMostrarVerificacion(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.adminPassword) {
      mostrarMensaje('❌ Debes ingresar tu contraseña de administrador', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register-admin`, {
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

      mostrarMensaje('✅ Administrador registrado exitosamente', 'ok');
      
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      mostrarMensaje(`❌ ${err.message}`, 'error');
      setMostrarVerificacion(false);
      setFormData({ ...formData, adminPassword: '' });
    } finally {
      setLoading(false);
    }
  };

  const volverAtras = () => {
    setMostrarVerificacion(false);
    setFormData({ ...formData, adminPassword: '' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content register-admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {mostrarVerificacion ? 'Verificación de Seguridad' : 'Registrar Nuevo Administrador'}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {!mostrarVerificacion ? (
            /* ========== PASO 1: Datos del nuevo admin ========== */
            <form className="modal-form register-admin-form" onSubmit={handleContinuar}>
              
              {/* Info Card */}
              <div className="info-card">
                <span className="info-icon">ℹ️</span>
                <p>Registra un nuevo administrador para tu plataforma. Se enviará un email con las credenciales.</p>
              </div>

              {/* Nombre */}
              <div className="modal-form-group">
                <label className="modal-form-label">
                  <span className="label-icon">👤</span>
                  Nombre Completo
                </label>
                <input
                  type="text"
                  className="modal-form-input"
                  placeholder="Ej: Juan Pérez García"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>

              {/* Email */}
              <div className="modal-form-group">
                <label className="modal-form-label">
                  <span className="label-icon">📧</span>
                  Email Corporativo
                </label>
                <input
                  type="email"
                  className="modal-form-input"
                  placeholder="admin@regma.es"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>

              {/* Contraseña */}
              <div className="modal-form-group">
                <label className="modal-form-label">
                  <span className="label-icon">🔒</span>
                  Contraseña Temporal
                </label>
                <input
                  type="password"
                  className="modal-form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  required
                />
                
                {/* Requisitos de contraseña */}
                {formData.password && (
                  <div className="password-strength-card">
                    <div className="strength-header">
                      <span className="strength-title">Requisitos de seguridad:</span>
                      <span className={`strength-badge ${erroresPassword.length === 0 ? 'strong' : 'weak'}`}>
                        {erroresPassword.length === 0 ? '✓ Segura' : `${4 - erroresPassword.length}/4`}
                      </span>
                    </div>
                    <div className="strength-requirements">
                      <div className={`requirement-item ${formData.password.length >= 8 ? 'met' : ''}`}>
                        <span className="requirement-icon">{formData.password.length >= 8 ? '✓' : '○'}</span>
                        <span>Mínimo 8 caracteres</span>
                      </div>
                      <div className={`requirement-item ${/[A-Z]/.test(formData.password) ? 'met' : ''}`}>
                        <span className="requirement-icon">{/[A-Z]/.test(formData.password) ? '✓' : '○'}</span>
                        <span>Una letra mayúscula</span>
                      </div>
                      <div className={`requirement-item ${/[a-z]/.test(formData.password) ? 'met' : ''}`}>
                        <span className="requirement-icon">{/[a-z]/.test(formData.password) ? '✓' : '○'}</span>
                        <span>Una letra minúscula</span>
                      </div>
                      <div className={`requirement-item ${/\d/.test(formData.password) ? 'met' : ''}`}>
                        <span className="requirement-icon">{/\d/.test(formData.password) ? '✓' : '○'}</span>
                        <span>Un número</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="modal-form-group">
                <label className="modal-form-label">
                  <span className="label-icon">🔒</span>
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  className="modal-form-input"
                  placeholder="Repite la contraseña"
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                  disabled={loading}
                  required
                />
                {formData.passwordConfirm && (
                  <div className={`match-indicator ${formData.password === formData.passwordConfirm ? 'match' : 'no-match'}`}>
                    <span className="match-icon">
                      {formData.password === formData.passwordConfirm ? '✓' : '✗'}
                    </span>
                    <span className="match-text">
                      {formData.password === formData.passwordConfirm ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                    </span>
                  </div>
                )}
              </div>

              {/* Mensaje */}
              {mensaje && (
                <div className={`mensaje ${mensaje.tipo}`}>
                  {mensaje.texto}
                </div>
              )}

              {/* Botones */}
              <div className="modal-actions">
                <button 
                  type="submit" 
                  className="modal-btn modal-btn-primary"
                  disabled={loading || erroresPassword.length > 0}
                >
                  <span className="btn-icon">→</span>
                  Continuar
                </button>
                <button 
                  type="button" 
                  onClick={onClose}
                  className="modal-btn modal-btn-secondary"
                  disabled={loading}
                >
                  <span className="btn-icon">✕</span>
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            /* ========== PASO 2: Verificación de seguridad ========== */
            <form className="modal-form verification-form" onSubmit={handleSubmit}>
              
              {/* Alert de verificación */}
              <div className="verification-alert">
                <div className="alert-icon-wrapper">
                  <span className="alert-icon">🔐</span>
                </div>
                <div className="alert-content">
                  <h3>Confirma tu Identidad</h3>
                  <p>Por seguridad, necesitamos verificar que eres tú antes de crear un nuevo administrador.</p>
                </div>
              </div>

              {/* Datos del nuevo admin */}
              <div className="admin-summary-card">
                <h4>📋 Resumen del Nuevo Administrador</h4>
                <div className="summary-item">
                  <span className="summary-label">Nombre:</span>
                  <span className="summary-value">{formData.nombre}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Email:</span>
                  <span className="summary-value">{formData.email}</span>
                </div>
              </div>

              {/* Usuario actual */}
              <div className="current-admin-card">
                <div className="current-admin-avatar">
                  {usuario?.nombre?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="current-admin-info">
                  <span className="current-admin-label">Administrador actual:</span>
                  <span className="current-admin-email">{usuario?.email}</span>
                </div>
              </div>

              {/* Input de contraseña */}
              <div className="modal-form-group">
                <label className="modal-form-label">
                  <span className="label-icon">🔑</span>
                  Tu Contraseña (Verificación)
                </label>
                <input
                  type="password"
                  className="modal-form-input verification-input"
                  placeholder="Ingresa tu contraseña de administrador"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  disabled={loading}
                  autoFocus
                  required
                />
              </div>

              {/* Mensaje */}
              {mensaje && (
                <div className={`mensaje ${mensaje.tipo}`}>
                  {mensaje.texto}
                </div>
              )}

              {/* Botones */}
              <div className="modal-actions">
                <button 
                  type="submit" 
                  className="modal-btn modal-btn-primary modal-btn-success"
                  disabled={loading || !formData.adminPassword}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Registrando...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">✓</span>
                      Registrar Administrador
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={volverAtras}
                  className="modal-btn modal-btn-secondary"
                  disabled={loading}
                >
                  <span className="btn-icon">←</span>
                  Volver
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}