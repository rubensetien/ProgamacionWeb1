import Avatar from '../../Avatar';

const ListaTrabajadores = ({
  trabajadores,
  trabajadoresOnline,
  conversacionActiva,
  conversaciones,
  mapaNoLeidos,
  busqueda,
  setBusqueda,
  onSeleccionarTrabajador
}) => {

  const obtenerUltimoMensaje = (trabajadorId) => {
    const mensajes = conversaciones[trabajadorId] || [];
    if (mensajes.length === 0) return null;
    return mensajes[mensajes.length - 1];
  };

  const contarMensajesNoLeidos = (trabajadorId) => {
    return mapaNoLeidos?.[trabajadorId] || 0;
  };

  const getRolBadge = (rol) => {
    const badges = {
      admin: { color: '#e74c3c', icon: '👑', text: 'Admin' },
      gestor: { color: '#3498db', icon: '📊', text: 'Gestor' },
      'gestor-tienda': { color: '#3498db', icon: '🏪', text: 'Gestor' },
      trabajador: { color: '#27ae60', icon: '👷', text: 'Trabajador' }
    };
    return badges[rol] || badges.trabajador;
  };

  return (
    <div className="lista-trabajadores">
      <div className="lista-header">
        <h2>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Equipo REGMA
        </h2>
        <span className="count-badge">{trabajadores.length}</span>
      </div>

      <div className="busqueda-container">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Buscar compañero..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="trabajadores-lista">
        {trabajadores.length === 0 ? (
          <div className="sin-trabajadores">
            <p>No se encontraron compañeros</p>
          </div>
        ) : (
          trabajadores.map(trabajador => {
            const ultimoMensaje = obtenerUltimoMensaje(trabajador._id);
            const noLeidos = contarMensajesNoLeidos(trabajador._id);
            const isOnline = trabajadoresOnline.has(trabajador._id);
            const isActive = conversacionActiva?.usuario?._id === trabajador._id;
            const rolBadge = getRolBadge(trabajador.rol);

            return (
              <div
                key={trabajador._id}
                className={`trabajador-item ${isActive ? 'active' : ''}`}
                onClick={() => onSeleccionarTrabajador(trabajador)}
              >
                <div className="trabajador-avatar-container">
                  <Avatar
                    email={trabajador.email}
                    name={trabajador.nombre}
                    size="medium"
                  />
                  <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`} />
                </div>

                <div className="trabajador-info">
                  <div className="trabajador-nombre-row">
                    <h4>{trabajador.nombre}</h4>
                    {ultimoMensaje && (
                      <span className="ultimo-mensaje-tiempo">
                        {new Date(ultimoMensaje.timestamp).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>

                  <div className="trabajador-detalles">
                    <span
                      className="rol-badge"
                      style={{ background: rolBadge.color + '20', color: rolBadge.color }}
                    >
                      {rolBadge.icon} {rolBadge.text}
                    </span>
                    <span className={`status-text ${isOnline ? 'online' : 'offline'}`}>
                      {isOnline ? 'En línea' : 'Desconectado'}
                    </span>
                  </div>

                  {ultimoMensaje && (
                    <p className="ultimo-mensaje">
                      {ultimoMensaje.de === trabajador._id ? '' : 'Tú: '}
                      {ultimoMensaje.texto}
                    </p>
                  )}
                </div>

                {noLeidos > 0 && (
                  <span className="badge-no-leidos">{noLeidos}</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ListaTrabajadores;
