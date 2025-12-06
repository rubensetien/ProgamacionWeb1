import { useState, useEffect, useRef } from 'react';
import Avatar from '../../Avatar';

const VentanaChat = ({
  conversacionActiva,
  mensajes,
  usuarioActual,
  onEnviarMensaje,
  onEscribiendo
}) => {
  const [inputMensaje, setInputMensaje] = useState('');
  const mensajesEndRef = useRef(null);

  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMensaje.trim()) {
      onEnviarMensaje(inputMensaje);
      setInputMensaje('');
    }
  };

  const handleInputChange = (e) => {
    setInputMensaje(e.target.value);
    if (e.target.value.trim()) {
      onEscribiendo();
    }
  };

  if (!conversacionActiva) {
    return (
      <div className="ventana-chat-vacia">
        <div className="chat-vacio-content">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <h3>Selecciona un trabajador</h3>
          <p>Elige un trabajador de la lista para comenzar a chatear</p>
        </div>
      </div>
    );
  }

  const { usuario: trabajador, escribiendo, nombreEscribiendo } = conversacionActiva;

  return (
    <div className="ventana-chat">
      {/* Header de la conversación */}
      <div className="chat-header">
        <Avatar
          email={trabajador.email}
          name={trabajador.nombre}
          size="medium"
        />
        <div className="chat-header-info">
          <h3>{trabajador.nombre}</h3>
          <p>{trabajador.email}</p>
        </div>
      </div>

      {/* Mensajes */}
      <div className="chat-mensajes">
        {mensajes.length === 0 ? (
          <div className="sin-mensajes">
            <p>No hay mensajes aún. ¡Inicia la conversación!</p>
          </div>
        ) : (
          mensajes.map((mensaje, index) => {
            const esMio = mensaje.de === usuarioActual._id;
            const mostrarAvatar = index === 0 || mensajes[index - 1].de !== mensaje.de;

            return (
              <div
                key={index}
                className={`mensaje ${esMio ? 'propio' : 'ajeno'}`}
              >
                {!esMio && mostrarAvatar && (
                  <Avatar
                    email={trabajador.email}
                    name={trabajador.nombre}
                    size="small"
                    className="mensaje-avatar"
                  />
                )}
                {!esMio && !mostrarAvatar && <div className="mensaje-avatar-spacer" />}

                <div className="mensaje-contenido">
                  <p>{mensaje.texto}</p>
                  <span className="mensaje-timestamp">
                    {new Date(mensaje.timestamp).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {escribiendo && (
          <div className="escribiendo-indicador">
            <Avatar email={trabajador.email} name={trabajador.nombre} size="small" />
            <div className="escribiendo-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={mensajesEndRef} />
      </div>

      {/* Input para escribir */}
      <form onSubmit={handleSubmit} className="chat-input-container">
        <Avatar
          email={usuarioActual.email}
          name={usuarioActual.nombre}
          size="small"
        />
        <input
          type="text"
          value={inputMensaje}
          onChange={handleInputChange}
          placeholder={`Mensaje para ${trabajador.nombre}...`}
          className="chat-input"
        />
        <button type="submit" className="btn-enviar" disabled={!inputMensaje.trim()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          Enviar
        </button>
      </form>
    </div>
  );
};

export default VentanaChat;
