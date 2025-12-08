import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/cliente/Carrito.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export default function Carrito() {
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarCarrito();
  }, []);

  const cargarCarrito = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/carrito`, {
        headers: getAuthHeaders()
      });

      // Si es 404, significa carrito vacío
      if (response.status === 404) {
        setCarrito({
          items: [],
          subtotal: 0,
          descuentos: 0,
          total: 0
        });
        setLoading(false);
        return;
      }

      const contentType = response.headers.get('content-type');

      // Verificar que sea JSON
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Respuesta no es JSON:', await response.text());
        throw new Error('El servidor no devolvió datos válidos');
      }

      const data = await response.json();

      if (data.success) {
        setCarrito(data.data || {
          items: [],
          subtotal: 0,
          descuentos: 0,
          total: 0
        });
      } else {
        // Si no hay carrito, crear uno vacío
        setCarrito({
          items: [],
          subtotal: 0,
          descuentos: 0,
          total: 0
        });
      }
    } catch (err) {
      console.error('Error cargando carrito:', err);
      // En caso de error, mostrar carrito vacío en lugar de error
      setCarrito({
        items: [],
        subtotal: 0,
        descuentos: 0,
        total: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const actualizarCantidad = async (itemId, nuevaCantidad) => {
    try {
      const response = await fetch(`${API_URL}/api/carrito/item/${itemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ cantidad: nuevaCantidad })
      });

      const data = await response.json();

      if (data.success) {
        setCarrito(data.data);
      } else {
        mostrarNotificacion(data.message, 'error');
      }
    } catch (err) {
      console.error('Error actualizando cantidad:', err);
      mostrarNotificacion('Error al actualizar la cantidad', 'error');
    }
  };

  const eliminarItem = async (itemId) => {
    if (!confirm('¿Eliminar este producto del carrito?')) return;

    try {
      const response = await fetch(`${API_URL}/api/carrito/item/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        setCarrito(data.data);
        mostrarNotificacion('Producto eliminado del carrito');
      } else {
        mostrarNotificacion(data.message, 'error');
      }
    } catch (err) {
      console.error('Error eliminando item:', err);
      mostrarNotificacion('Error al eliminar el producto', 'error');
    }
  };

  const vaciarCarrito = async () => {
    if (!confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) return;

    try {
      const response = await fetch(`${API_URL}/api/carrito`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        setCarrito(data.data || {
          items: [],
          subtotal: 0,
          descuentos: 0,
          total: 0
        });
        mostrarNotificacion('Carrito vaciado correctamente');
      } else {
        mostrarNotificacion(data.message, 'error');
      }
    } catch (err) {
      console.error('Error vaciando carrito:', err);
      mostrarNotificacion('Error al vaciar el carrito', 'error');
    }
  };

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    const notif = document.createElement('div');
    notif.className = `notificacion ${tipo}`;
    notif.textContent = mensaje;
    document.body.appendChild(notif);

    setTimeout(() => {
      notif.classList.add('show');
    }, 10);

    setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  };

  const irACheckout = () => {
    navigate('/finalizar-pedido');
  };

  if (loading) {
    return (
      <div className="carrito-container">
        <div className="carrito-loading">
          <div className="spinner"></div>
          <p>Cargando tu carrito...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="carrito-container">
        <div className="carrito-error">
          <p>{error}</p>
          <button onClick={cargarCarrito} className="btn-seguir-comprando">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const items = carrito?.items || [];
  const total = carrito?.total || 0;
  const subtotal = carrito?.subtotal || 0;
  const descuentos = carrito?.descuentos || 0;

  return (
    <div className="carrito-page">
      {/* Hero Header */}
      <header className="carrito-hero">
        <div className="hero-content">
          <div className="hero-top-bar">
            <div className="brand-wrapper">
              <img
                src="https://regma.es/wp-content/uploads/2024/09/240503-regma-logotipo-rgb-logo-con-tagline-e1721651920696.png"
                alt="REGMA"
                className="hero-logo"
                onClick={() => navigate('/')}
              />
            </div>
            <button className="btn-hero-text" onClick={() => navigate('/productos')}>
              ← Continuar Comprando
            </button>
          </div>
          <div className="hero-header-row">
            <div>
              <h1 className="hero-title">Mi Carrito</h1>
              <p className="hero-subtitle">
                {items.length} {items.length === 1 ? 'producto' : 'productos'} listos para saborear
              </p>
            </div>
            {items.length > 0 && (
              <button className="btn-vaciar" onClick={vaciarCarrito}>
                Vaciar todo
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="carrito-container">
        {/* Carrito vacío */}
        {items.length === 0 ? (
          <div className="carrito-vacio">
            <div className="icono-vacio">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <h2>Tu carrito está vacío</h2>
            <p>Explora nuestro catálogo y encuentra los productos perfectos para ti</p>
            <button
              className="btn-seguir-comprando"
              onClick={() => navigate('/productos')}
            >
              Explorar Productos
            </button>
          </div>
        ) : (
          <div className="carrito-content">
            {/* Items */}
            <div className="carrito-items">
              {items.map(item => (
                <div key={item._id} className="carrito-item">
                  {/* Imagen */}
                  <div className="item-imagen">
                    {item.imagenVariante ? (
                      <img
                        src={`${API_URL}${item.imagenVariante}`}
                        alt={item.nombreVariante}
                      />
                    ) : (
                      <div className="item-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="item-info">
                    <h3>{item.nombreVariante}</h3>
                    <p className="item-formato">{item.nombreFormato}</p>
                    <p className="item-precio-unitario">
                      {item.precioUnitario?.toFixed(2)}€ por unidad
                    </p>
                  </div>

                  {/* Controles */}
                  <div className="item-controles">
                    <div className="item-cantidad">
                      <button
                        className="btn-cantidad"
                        onClick={() => actualizarCantidad(item._id, item.cantidad - 1)}
                        disabled={item.cantidad <= 1}
                      >
                        −
                      </button>
                      <span className="cantidad-valor">{item.cantidad}</span>
                      <button
                        className="btn-cantidad"
                        onClick={() => actualizarCantidad(item._id, item.cantidad + 1)}
                      >
                        +
                      </button>
                    </div>

                    <div className="item-subtotal">
                      <p className="subtotal-valor">{item.subtotal?.toFixed(2)}€</p>
                    </div>
                  </div>

                  {/* Eliminar */}
                  <button
                    className="btn-eliminar-item"
                    onClick={() => eliminarItem(item._id)}
                    title="Eliminar producto"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div className="carrito-resumen">
              <h2>Resumen del Pedido</h2>

              <div className="resumen-linea">
                <span>Subtotal:</span>
                <span>{subtotal.toFixed(2)}€</span>
              </div>

              {descuentos > 0 && (
                <div className="resumen-linea descuento">
                  <span>Descuentos:</span>
                  <span>-{descuentos.toFixed(2)}€</span>
                </div>
              )}

              <div className="resumen-linea total">
                <span>Total:</span>
                <span>{total.toFixed(2)}€</span>
              </div>

              <button className="btn-finalizar" onClick={irACheckout}>
                <span>Finalizar Pedido</span>
              </button>

              <button
                className="btn-seguir-comprando-small"
                onClick={() => navigate('/productos')}
              >
                Seguir Comprando
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
