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
  // eslint-disable-next-line no-unused-vars
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

      // Si es profesional, cargar datos de su negocio
      if (usuario?.rol === 'profesional') {
        const negocioRes = await fetch(`${API_URL}/api/profesionales/mi-negocio`, { headers: getAuthHeaders() });
        if (negocioRes.ok) {
          const negocio = await negocioRes.json();
          if (negocio && negocio.direccion) {
            setFormulario(prev => ({
              ...prev,
              calle: negocio.direccion.calle || '',
              numero: '0', // Adjust if needed
              ciudad: negocio.direccion.ciudad || '',
              codigoPostal: negocio.direccion.codigoPostal || '',
              provincia: negocio.direccion.provincia || '',
              pais: negocio.direccion.pais || 'España'
            }));
            // Trigger validation if possible or let user click verify
          }
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

      /* 
       * =========================================
       * [MODIFIED] Using GraphQL Mutation instead of REST
       * =========================================
       */
      const query = `
        mutation CrearPedido($datos: PedidoInput!) {
          crearPedido(datos: $datos) {
            id
            numeroPedido
            total
            estado
          }
        }
      `;

      const variables = {
        datos: {
          usuarioId: usuario.id || usuario._id,
          tipoEntrega,
          telefonoContacto: formulario.telefono,
          notasEntrega: formulario.notas,
          distanciaKm: formulario.distanciaKm,
          puntoVenta: tipoEntrega === 'recogida' ? formulario.puntoVenta : null,
          fechaRecogida: tipoEntrega === 'recogida' ? formulario.fechaRecogida : null,
          horaRecogida: tipoEntrega === 'recogida' ? formulario.horaRecogida : null,
          items: carrito.items.map(item => ({
            productoId: typeof item.producto === 'object' ? item.producto._id : item.producto,
            cantidad: item.cantidad
          })),
          direccionEnvio: tipoEntrega === 'domicilio' ? {
            calle: formulario.calle,
            numero: formulario.numero,
            piso: formulario.piso,
            codigoPostal: formulario.codigoPostal,
            ciudad: formulario.ciudad,
            provincia: formulario.provincia,
            pais: 'España'
          } : null
        }
      };

      // Cleanup undefined/null for GraphQL strict input if needed, though null is allowed for optionals
      if (tipoEntrega === 'recogida') {
        delete variables.datos.direccionEnvio;
        variables.datos.puntoVenta = formulario.puntoVenta; // Ensure field matches schema
      } else {
        delete variables.datos.puntoVenta;
        delete variables.datos.fechaRecogida;
        delete variables.datos.horaRecogida;
      }

      console.log('🚀 Sending GraphQL Mutation:', variables);

      const response = await fetch(`${API_URL}/graphql`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ query, variables })
      });

      const responseBody = await response.json();

      if (responseBody.errors) {
        throw new Error(responseBody.errors[0].message);
      }

      const data = responseBody.data;

      if (data && data.crearPedido) {
        // Success
        await fetch(`${API_URL}/api/carrito`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        navigate('/mis-pedidos');
      } else {
        throw new Error('Error desconocido al crear pedido');
      }

    } catch (err) {
      console.error('Error confirmando pedido:', err);
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
        <p>Cargando opciones...</p>
      </div>
    );
  }

  if (!carrito || !carrito.items || carrito.items.length === 0) {
    return (
      <div className="finalizar-container empty-state">
        <div className="carrito-vacio">
          <svg className="icon-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2>Tu carrito está vacío</h2>
          <p>Descubre nuestros productos artesanales.</p>
          <button onClick={() => navigate('/productos')} className="btn-primary">
            Ver catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="finalizar-container">
      {/* Hero Header Section */}
      <div className="checkout-hero">
        <div className="hero-content">
          <div className="hero-top-bar">
            <div className="brand-wrapper">
              <img
                src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
                alt="REGMA"
                className="hero-logo"
              />
            </div>
            <div className="hero-actions">
              <button onClick={() => navigate('/productos')} className="btn-hero-text">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Seguir comprando
              </button>
            </div>
          </div>
          <h1 className="hero-title">Finalizar Pedido</h1>
          <p className="hero-subtitle">Completa los datos para recibir tu pedido Regma</p>
        </div>
      </div>

      <div className="checkout-content">
        {error && (
          <div className="alert alert-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="checkout-grid">
          <div className="checkout-form-section">
            <form onSubmit={handleConfirmarPedido}>
              {/* Sección Tipo de Entrega */}
              <section className="form-section">
                <h3 className="section-title">
                  <span className="step-number">1</span>
                  Método de entrega
                </h3>
                <div className="delivery-options">
                  <label className={`delivery-option ${tipoEntrega === 'recogida' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="tipoEntrega"
                      value="recogida"
                      checked={tipoEntrega === 'recogida'}
                      onChange={() => handleTipoEntrega('recogida')}
                    />
                    <div className="option-content">
                      <div className="option-icon-wrapper">
                        <svg className="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </div>
                      <div className="option-info">
                        <span className="option-name">Recogida en tienda</span>
                        <span className="option-detail">Gratis • Listo en 24-48h</span>
                      </div>
                      <div className="check-circle"></div>
                    </div>
                  </label>

                  <label className={`delivery-option ${tipoEntrega === 'domicilio' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="tipoEntrega"
                      value="domicilio"
                      checked={tipoEntrega === 'domicilio'}
                      onChange={() => handleTipoEntrega('domicilio')}
                    />
                    <div className="option-content">
                      <div className="option-icon-wrapper">
                        <svg className="option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="1" y="3" width="15" height="13" rx="2" />
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                          <circle cx="5.5" cy="18.5" r="2.5" />
                          <circle cx="18.5" cy="18.5" r="2.5" />
                        </svg>
                      </div>
                      <div className="option-info">
                        <span className="option-name">Envío a domicilio</span>
                        <span className="option-detail">Radio 50km • Envío calculado</span>
                      </div>
                      <div className="check-circle"></div>
                    </div>
                  </label>
                </div>
              </section>

              {/* Sección Contacto */}
              <section className="form-section">
                <h3 className="section-title">
                  <span className="step-number">2</span>
                  Datos de contacto
                </h3>
                <div className="form-group">
                  <label>Teléfono de contacto</label>
                  <div className="input-with-icon">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <input
                      type="tel"
                      value={formulario.telefono}
                      onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                      placeholder="600 000 000"
                      required
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </section>

              {/* Sección Detalles Específicos */}
              {tipoEntrega === 'recogida' && (
                <section className="form-section animate-fade-in">
                  <h3 className="section-title">
                    <span className="step-number">3</span>
                    Punto de recogida
                  </h3>
                  <div className="form-group">
                    <label>Selecciona Tienda</label>
                    <div className="select-wrapper">
                      <select
                        value={formulario.puntoVenta}
                        onChange={(e) => setFormulario({ ...formulario, puntoVenta: e.target.value })}
                        required
                        className="select-field"
                      >
                        <option value="">-- Selecciona un punto --</option>
                        {puntosVenta.map(punto => (
                          <option key={punto._id} value={punto._id}>
                            {punto.nombre} — {punto.direccion?.calle}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label>Fecha</label>
                      <div className="select-wrapper">
                        <select
                          value={formulario.fechaRecogida}
                          onChange={(e) => setFormulario({ ...formulario, fechaRecogida: e.target.value })}
                          required
                          className="select-field"
                        >
                          <option value="">Día</option>
                          {generarFechasDisponibles().map(fecha => (
                            <option key={fecha} value={fecha}>
                              {new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short'
                              })}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group half">
                      <label>Hora</label>
                      <div className="select-wrapper">
                        <select
                          value={formulario.horaRecogida}
                          onChange={(e) => setFormulario({ ...formulario, horaRecogida: e.target.value })}
                          required
                          className="select-field"
                        >
                          <option value="">Hora</option>
                          {generarHorariosDisponibles().map(hora => (
                            <option key={hora} value={hora}>{hora}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {tipoEntrega === 'domicilio' && (
                <section className="form-section animate-fade-in">
                  <h3 className="section-title">
                    <span className="step-number">3</span>
                    Dirección de envío
                  </h3>
                  <div className="form-row to-3-1">
                    <div className="form-group">
                      <label>Calle</label>
                      <input
                        type="text"
                        value={formulario.calle}
                        onChange={(e) => setFormulario({ ...formulario, calle: e.target.value, direccionValidada: false })}
                        placeholder="Av. Libertad"
                        required
                        className="input-field"
                      />
                    </div>
                    <div className="form-group">
                      <label>Nº</label>
                      <input
                        type="text"
                        value={formulario.numero}
                        onChange={(e) => setFormulario({ ...formulario, numero: e.target.value, direccionValidada: false })}
                        placeholder="10"
                        required
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Piso/Puerta</label>
                      <input
                        type="text"
                        value={formulario.piso}
                        onChange={(e) => setFormulario({ ...formulario, piso: e.target.value })}
                        placeholder="2º C"
                        className="input-field"
                      />
                    </div>
                    <div className="form-group">
                      <label>C. Postal</label>
                      <input
                        type="text"
                        value={formulario.codigoPostal}
                        onChange={(e) => setFormulario({ ...formulario, codigoPostal: e.target.value, direccionValidada: false })}
                        placeholder="39001"
                        required
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Ciudad</label>
                      <input
                        type="text"
                        value={formulario.ciudad}
                        onChange={(e) => setFormulario({ ...formulario, ciudad: e.target.value, direccionValidada: false })}
                        placeholder="Santander"
                        required
                        className="input-field"
                      />
                    </div>
                    <div className="form-group">
                      <label>Provincia</label>
                      <input
                        type="text"
                        value={formulario.provincia}
                        onChange={(e) => setFormulario({ ...formulario, provincia: e.target.value, direccionValidada: false })}
                        placeholder="Cantabria"
                        required
                        className="input-field"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`btn-validate ${formulario.direccionValidada ? 'valid' : ''}`}
                    onClick={validarDireccion}
                    disabled={!formulario.calle || !formulario.numero || !formulario.codigoPostal || !formulario.ciudad}
                  >
                    {formulario.direccionValidada ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Dirección Verificada
                      </>
                    ) : 'Verificar disponibilidad de envío'}
                  </button>
                </section>
              )}

              <div className="form-section no-border">
                <div className="form-group">
                  <label>Notas para el repartidor (Opcional)</label>
                  <textarea
                    value={formulario.notas}
                    onChange={(e) => setFormulario({ ...formulario, notas: e.target.value })}
                    placeholder="Ej: El timbre no funciona..."
                    rows="2"
                    className="textarea-field"
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="checkout-summary-section">
            <div className="summary-card">
              <div className="summary-header">
                <h3>Resumen del Pedido</h3>
                <button onClick={() => navigate('/carrito')} className="btn-edit-cart">
                  Editar
                </button>
              </div>

              <div className="summary-items">
                {carrito.items.map((item) => (
                  <div key={item._id} className="summary-item">
                    <div className="item-details">
                      <span className="item-name">{item.nombreVariante}</span>
                      <span className="item-format">{item.nombreFormato}</span>
                    </div>
                    <div className="item-price-qty">
                      <span className="item-qty">x{item.cantidad}</span>
                      <span className="item-price">{item.subtotal?.toFixed(2)}€</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>{carrito.subtotal?.toFixed(2)}€</span>
                </div>
                <div className="total-row">
                  <span>Envío</span>
                  <span className={tipoEntrega === 'recogida' ? 'text-success' : ''}>
                    {tipoEntrega === 'recogida' ? 'Gratis' : 'Calculado'}
                  </span>
                </div>
                <div className="total-row main-total">
                  <span>Total</span>
                  <span className="total-amount">{carrito.total?.toFixed(2)}€</span>
                </div>
              </div>

              <button
                onClick={handleConfirmarPedido}
                className="btn-confirm-order"
                disabled={procesando || (tipoEntrega === 'domicilio' && !formulario.direccionValidada)}
              >
                {procesando ? (
                  <span className="spinner-loader"></span>
                ) : (
                  <>
                    Confirmar y Pagar
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              <div className="secure-checkout-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Pago 100% Seguro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
