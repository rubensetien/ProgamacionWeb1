import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/cliente/FinalizarPedido.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export default function FinalizarPedido() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [carrito, setCarrito] = useState(null);
  const [tipoEntrega, setTipoEntrega] = useState('recogida');
  const [puntosVenta, setPuntosVenta] = useState([]);
  const [obrador, setObrador] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState(null);

  const [formulario, setFormulario] = useState({
    telefono: usuario?.telefono || '',
    notas: '',
    puntoVenta: '',
    fechaRecogida: '',
    horaRecogida: '',
    calle: '',
    numero: '',
    piso: '',
    codigoPostal: '',
    ciudad: '',
    provincia: 'Madrid',
    direccionValidada: false,
    distanciaKm: null
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);

      const [carritoRes, puntosRes, obradorRes] = await Promise.all([
        fetch(`${API_URL}/api/carrito`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/api/ubicaciones/puntos-venta`),
        fetch(`${API_URL}/api/ubicaciones/obrador`)
      ]);

      if (carritoRes.ok) {
        const carritoData = await carritoRes.json();
        if (carritoData.success && carritoData.data) {
          setCarrito(carritoData.data);
        }
      } else if (carritoRes.status === 404) {
        setCarrito({ items: [], total: 0, subtotal: 0 });
      }

      if (puntosRes.ok) {
        const puntosData = await puntosRes.json();
        if (puntosData.success) {
          setPuntosVenta(puntosData.data);
          if (puntosData.data.length > 0) {
            setFormulario(prev => ({ ...prev, puntoVenta: puntosData.data[0]._id }));
          }
        }
      }

      if (obradorRes.ok) {
        const obradorData = await obradorRes.json();
        if (obradorData.success) {
          setObrador(obradorData.data);
        }
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('No se pudieron cargar los datos. Por favor, recarga la página.');
    } finally {
      setCargando(false);
    }
  };

  const validarDireccion = async () => {
    try {
      const direccionCompleta = `${formulario.calle} ${formulario.numero}, ${formulario.codigoPostal} ${formulario.ciudad}, ${formulario.provincia}, España`;

      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(direccionCompleta)}&format=json&limit=1`
      );

      if (!geoRes.ok) {
        throw new Error('Error al geocodificar dirección');
      }

      const geoData = await geoRes.json();

      if (geoData.length === 0) {
        setError('No se pudo encontrar la dirección. Verifica que sea correcta.');
        return false;
      }

      const { lat, lon } = geoData[0];

      const validacionRes = await fetch(`${API_URL}/api/ubicaciones/validar-entrega`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitud: parseFloat(lat),
          longitud: parseFloat(lon)
        })
      });

      if (!validacionRes.ok) {
        throw new Error('Error al validar distancia');
      }

      const validacionData = await validacionRes.json();

      if (!validacionData.success) {
        throw new Error(validacionData.message);
      }

      const { distanciaKm, dentroDeRadio } = validacionData.data;

      setFormulario(prev => ({
        ...prev,
        direccionValidada: dentroDeRadio,
        distanciaKm
      }));

      if (!dentroDeRadio) {
        setError(`Tu dirección está a ${distanciaKm} km del obrador. Solo entregamos en un radio de 50 km.`);
        return false;
      }

      setError(null);
      return true;

    } catch (err) {
      console.error('Error validando dirección:', err);
      setError('Error al validar la dirección. Por favor, verifica los datos.');
      return false;
    }
  };

  const handleTipoEntrega = (tipo) => {
    setTipoEntrega(tipo);
    setError(null);
    setFormulario(prev => ({ ...prev, direccionValidada: false, distanciaKm: null }));
  };

  const validarFormulario = () => {
    if (!formulario.telefono || formulario.telefono.length < 9) {
      setError('Por favor, ingresa un teléfono válido.');
      return false;
    }

    if (tipoEntrega === 'recogida') {
      if (!formulario.puntoVenta) {
        setError('Por favor, selecciona un punto de recogida.');
        return false;
      }
      if (!formulario.fechaRecogida) {
        setError('Por favor, selecciona una fecha de recogida.');
        return false;
      }
      if (!formulario.horaRecogida) {
        setError('Por favor, selecciona una hora de recogida.');
        return false;
      }
    } else {
      if (!formulario.calle || !formulario.numero || !formulario.codigoPostal || !formulario.ciudad) {
        setError('Por favor, completa todos los campos de la dirección.');
        return false;
      }
      if (!formulario.direccionValidada) {
        setError('Por favor, valida tu dirección antes de continuar.');
        return false;
      }
    }

    return true;
  };

  const handleConfirmarPedido = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      setProcesando(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Debes iniciar sesión para realizar un pedido.');
        return;
      }

      const datosPedido = {
        items: carrito.items.map(item => ({
          producto: item.producto,
          variante: item.variante,
          formato: item.formato,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          // Snapshot de datos
          nombreProducto: item.nombreProducto,
          nombreVariante: item.nombreVariante,
          nombreFormato: item.nombreFormato,
          sku: item.sku,
          imagenVariante: item.imagenVariante
        })),
        tipoEntrega,
        telefonoContacto: formulario.telefono,
        notasEntrega: formulario.notas
      };

      if (tipoEntrega === 'recogida') {
        datosPedido.puntoVenta = formulario.puntoVenta;
        datosPedido.fechaRecogida = formulario.fechaRecogida;
        datosPedido.horaRecogida = formulario.horaRecogida;
      } else {
        datosPedido.direccionEnvio = {
          calle: formulario.calle,
          numero: formulario.numero,
          piso: formulario.piso,
          codigoPostal: formulario.codigoPostal,
          ciudad: formulario.ciudad,
          provincia: formulario.provincia,
          pais: 'España'
        };
        datosPedido.distanciaKm = formulario.distanciaKm;
      }

      console.log('📦 Datos del pedido a enviar:', datosPedido);

      const response = await fetch(`${API_URL}/api/pedidos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(datosPedido)
      });

      const data = await response.json();
      console.log('📬 Respuesta del servidor:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear el pedido');
      }

      if (data.success) {
        await fetch(`${API_URL}/api/carrito`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        alert('✅ Pedido realizado con éxito');
        navigate('/mis-pedidos');
      }

    } catch (err) {
      console.error('❌ Error confirmando pedido:', err);
      setError(err.message || 'Error al procesar el pedido.');
    } finally {
      setProcesando(false);
    }
  };

  const generarFechasDisponibles = () => {
    const fechas = [];
    for (let i = 1; i <= 7; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + i);
      fechas.push(fecha.toISOString().split('T')[0]);
    }
    return fechas;
  };

  const generarHorariosDisponibles = () => {
    const horarios = [];
    for (let hora = 10; hora <= 20; hora++) {
      horarios.push(`${hora.toString().padStart(2, '0')}:00`);
      if (hora < 20) {
        horarios.push(`${hora.toString().padStart(2, '0')}:30`);
      }
    }
    return horarios;
  };

  if (cargando) {
    return (
      <div className="finalizar-loading">
        <div className="spinner"></div>
        <p>Cargando opciones de entrega...</p>
      </div>
    );
  }

  if (!carrito || !carrito.items || carrito.items.length === 0) {
    return (
      <div className="finalizar-container">
        <div className="carrito-vacio">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <h2>Tu carrito está vacío</h2>
          <p>Añade productos para finalizar tu pedido</p>
          <button onClick={() => navigate('/productos')} className="btn-volver-catalogo">
            Ver catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="finalizar-container">
      <div className="finalizar-header">
        <h1>Finalizar Pedido</h1>
        <button onClick={() => navigate('/carrito')} className="btn-volver">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver al carrito
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}

      <div className="finalizar-content">
        <div className="finalizar-form-section">
          <form onSubmit={handleConfirmarPedido}>
            <div className="tipo-entrega-selector">
              <h3>Tipo de entrega</h3>
              <div className="tipo-opciones">
                <button
                  type="button"
                  className={`tipo-opcion ${tipoEntrega === 'recogida' ? 'active' : ''}`}
                  onClick={() => handleTipoEntrega('recogida')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span className="tipo-texto">
                    <strong>Recogida en tienda</strong>
                    <small>Gratis - Disponible en 24-48h</small>
                  </span>
                </button>

                <button
                  type="button"
                  className={`tipo-opcion ${tipoEntrega === 'domicilio' ? 'active' : ''}`}
                  onClick={() => handleTipoEntrega('domicilio')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <span className="tipo-texto">
                    <strong>Envío a domicilio</strong>
                    <small>Radio 50km desde obrador</small>
                  </span>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Teléfono de contacto *
              </label>
              <input
                type="tel"
                value={formulario.telefono}
                onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                placeholder="Ej: 611 222 333"
                required
              />
              <small>Te contactaremos si hay algún problema con tu pedido</small>
            </div>

            {tipoEntrega === 'recogida' && (
              <>
                <div className="form-group">
                  <label>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Punto de recogida *
                  </label>
                  <select
                    value={formulario.puntoVenta}
                    onChange={(e) => setFormulario({ ...formulario, puntoVenta: e.target.value })}
                    required
                  >
                    <option value="">Selecciona un punto de venta</option>
                    {puntosVenta.map(punto => (
                      <option key={punto._id} value={punto._id}>
                        {punto.nombre} - {punto.direccion?.calle}, {punto.direccion?.ciudad}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Fecha de recogida *
                    </label>
                    <select
                      value={formulario.fechaRecogida}
                      onChange={(e) => setFormulario({ ...formulario, fechaRecogida: e.target.value })}
                      required
                    >
                      <option value="">Selecciona una fecha</option>
                      {generarFechasDisponibles().map(fecha => (
                        <option key={fecha} value={fecha}>
                          {new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Hora de recogida *
                    </label>
                    <select
                      value={formulario.horaRecogida}
                      onChange={(e) => setFormulario({ ...formulario, horaRecogida: e.target.value })}
                      required
                    >
                      <option value="">Selecciona una hora</option>
                      {generarHorariosDisponibles().map(hora => (
                        <option key={hora} value={hora}>{hora}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {tipoEntrega === 'domicilio' && (
              <>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 3 }}>
                    <label>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </svg>
                      Calle *
                    </label>
                    <input
                      type="text"
                      value={formulario.calle}
                      onChange={(e) => setFormulario({ ...formulario, calle: e.target.value, direccionValidada: false })}
                      placeholder="Ej: Calle Mayor"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Número *</label>
                    <input
                      type="text"
                      value={formulario.numero}
                      onChange={(e) => setFormulario({ ...formulario, numero: e.target.value, direccionValidada: false })}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Piso / Puerta</label>
                    <input
                      type="text"
                      value={formulario.piso}
                      onChange={(e) => setFormulario({ ...formulario, piso: e.target.value })}
                      placeholder="Ej: 3º A"
                    />
                  </div>

                  <div className="form-group">
                    <label>Código Postal *</label>
                    <input
                      type="text"
                      value={formulario.codigoPostal}
                      onChange={(e) => setFormulario({ ...formulario, codigoPostal: e.target.value, direccionValidada: false })}
                      placeholder="28001"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ciudad *</label>
                    <input
                      type="text"
                      value={formulario.ciudad}
                      onChange={(e) => setFormulario({ ...formulario, ciudad: e.target.value, direccionValidada: false })}
                      placeholder="Madrid"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Provincia *</label>
                    <input
                      type="text"
                      value={formulario.provincia}
                      onChange={(e) => setFormulario({ ...formulario, provincia: e.target.value, direccionValidada: false })}
                      placeholder="Madrid"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className={`btn-validar-direccion ${formulario.direccionValidada ? 'validada' : ''}`}
                  onClick={validarDireccion}
                  disabled={!formulario.calle || !formulario.numero || !formulario.codigoPostal || !formulario.ciudad}
                >
                  {formulario.direccionValidada ? (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Dirección validada ({formulario.distanciaKm} km)
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Validar dirección
                    </>
                  )}
                </button>
              </>
            )}

            <div className="form-group">
              <label>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Notas adicionales (opcional)
              </label>
              <textarea
                value={formulario.notas}
                onChange={(e) => setFormulario({ ...formulario, notas: e.target.value })}
                placeholder="Instrucciones especiales para la entrega..."
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancelar-form"
                onClick={() => navigate('/carrito')}
                disabled={procesando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-confirmar"
                disabled={procesando || (tipoEntrega === 'domicilio' && !formulario.direccionValidada)}
              >
                {procesando ? (
                  <>
                    <div className="spinner-small"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    Confirmar pedido
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="finalizar-resumen-section">
          <div className="resumen-card">
            <h2>Resumen del pedido</h2>

            <div className="resumen-items">
              {carrito.items.map((item) => (
                <div key={item._id} className="resumen-item">
                  <div className="resumen-item-info">
                    <span className="resumen-item-nombre">{item.nombreVariante}</span>
                    <span className="resumen-item-formato">{item.nombreFormato}</span>
                  </div>
                  <div className="resumen-item-precio">
                    <span className="resumen-cantidad">x{item.cantidad}</span>
                    <span className="resumen-subtotal">
                      {item.subtotal?.toFixed(2)}€
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="resumen-totales">
              <div className="resumen-linea">
                <span>Subtotal:</span>
                <span>{carrito.subtotal?.toFixed(2)}€</span>
              </div>
              <div className="resumen-linea">
                <span>Envío:</span>
                <span>Gratis</span>
              </div>
              <div className="resumen-linea total">
                <span>Total:</span>
                <span>{carrito.total?.toFixed(2)}€</span>
              </div>
            </div>

            <div className="resumen-avisos">
              {tipoEntrega === 'recogida' && (
                <div className="aviso-importante">
                  <strong>Recogida en tienda</strong>
                  <p>Tu pedido estará listo en el punto de venta seleccionado en la fecha y hora indicadas.</p>
                </div>
              )}

              {tipoEntrega === 'domicilio' && formulario.direccionValidada && (
                <div className="aviso-secundario">
                  <strong>Envío a domicilio</strong>
                  <p>Entregaremos tu pedido en un plazo de 24-48 horas. Te contactaremos para coordinar la entrega.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
