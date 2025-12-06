import { useState } from 'react';
import '../../styles/admin/RegisterAdmin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const RegisterAdmin = ({ onClose }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'gestor-tienda',
    telefono: ''
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const rolesInfo = {
    'admin': {
      titulo: 'Administrador',
      descripcion: 'Acceso total al sistema. Puede gestionar productos, usuarios, pedidos y configuración.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      ),
      color: '#e74c3c'
    },
    'gestor-tienda': {
      titulo: 'Gestor de Tienda',
      descripcion: 'Gestiona una tienda específica. Controla inventario, pedidos y personal de su tienda.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
      color: '#3498db'
    },
    'trabajador': {
      titulo: 'Trabajador',
      descripcion: 'Personal operativo. Puede trabajar en tienda, obrador u oficina según asignación.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      color: '#27ae60'
    }
  };

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
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_URL}/api/usuarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          rol: formData.rol,
          telefono: formData.telefono || undefined,
          activo: true
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al crear usuario');
      }

      setExito(true);
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const rolSeleccionado = rolesInfo[formData.rol];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            <div>
              <h2>Registrar Nuevo Usuario</h2>
              <p className="header-subtitle">Complete el formulario para crear un nuevo usuario</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {exito && (
          <div className="alert-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Usuario creado exitosamente
          </div>
        )}

        {error && (
          <div className="alert-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {error}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          {/* Información Personal */}
          <div className="form-section">
            <h3 className="section-title">Información Personal</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  disabled={cargando}
                  placeholder="Juan Pérez García"
                />
              </div>

              <div className="form-group">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={cargando}
                  placeholder="juan@regma.es"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Contraseña *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={cargando}
                  placeholder="Mínimo 6 caracteres"
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={cargando}
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>
          </div>

          {/* Selección de Rol */}
          <div className="form-section">
            <h3 className="section-title">Rol y Permisos</h3>
            
            <div className="roles-grid">
              {Object.entries(rolesInfo).map(([key, info]) => (
                <label
                  key={key}
                  className={`rol-card ${formData.rol === key ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="rol"
                    value={key}
                    checked={formData.rol === key}
                    onChange={handleChange}
                    disabled={cargando}
                  />
                  <div className="rol-icon" style={{ color: info.color }}>
                    {info.icon}
                  </div>
                  <h4>{info.titulo}</h4>
                  <p>{info.descripcion}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={cargando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={cargando}
            >
              {cargando ? (
                <>
                  <div className="btn-spinner"></div>
                  Creando...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Crear Usuario
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterAdmin;
