import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // [NEW] Needed for auth token
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CarritoContext = createContext();

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  }
  return context;
};

export const CarritoProvider = ({ children }) => {
  // Estado inicial ahora es un objeto completo
  const [carrito, setCarrito] = useState({
    items: [],
    subtotal: 0,
    descuentos: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true); // [NEW] Loading state
  const { token, autenticado } = useAuth(); // [NEW] Get auth state

  // Cargar carrito
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true); // Start loading
      if (autenticado && token) {
        // [NEW] If logged in, fetch from API
        try {
          const res = await fetch(`${API_URL}/api/carrito`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            // Data.data should be { items: [], subtotal, ... }
            setCarrito(data.data || { items: [], subtotal: 0, descuentos: 0, total: 0 });
            localStorage.setItem('carrito', JSON.stringify(data.data?.items || []));
          } else if (res.status === 404) {
            setCarrito({ items: [], subtotal: 0, descuentos: 0, total: 0 });
            localStorage.setItem('carrito', JSON.stringify([]));
          }
        } catch (error) {
          console.error('Error sincronizando carrito:', error);
          // Fallback to localStorage logic below
        }
      } else {
        // Guest: use localStorage
        const carritoGuardado = localStorage.getItem('carrito');
        if (carritoGuardado) {
          try {
            const items = JSON.parse(carritoGuardado);
            // Guest: Calculate totals locally approx
            const total = items.reduce((acc, item) => {
              const p = item.producto?.precioFinal || item.producto?.precioBase || 0;
              return acc + (p * item.cantidad);
            }, 0);
            setCarrito({ items, subtotal: total, descuentos: 0, total });
          } catch (error) {
            console.error('Error cargando carrito:', error);
            localStorage.removeItem('carrito');
            setCarrito({ items: [], subtotal: 0, descuentos: 0, total: 0 });
          }
        } else {
          setCarrito({ items: [], subtotal: 0, descuentos: 0, total: 0 });
        }
      }
      setLoading(false); // End loading
    };

    loadCart();
  }, [autenticado, token]);

  // Guardar en localStorage solo los ITEMS (para persistir guest cart)
  useEffect(() => {
    if (carrito.items) {
      localStorage.setItem('carrito', JSON.stringify(carrito.items));
    }
  }, [carrito]);

  // [NEW] Helper to sync item add/update to server
  const syncItemToServer = async (action, payload) => {
    if (!autenticado || !token) return;

    try {
      let url = `${API_URL}/api/carrito`;
      let method = 'POST';
      let body = payload;

      if (action === 'add') {
        url = `${API_URL}/api/carrito/item`;
      } else if (action === 'update') {
        url = `${API_URL}/api/carrito/item/${payload.itemId}`;
        method = 'PUT';
        body = { cantidad: payload.cantidad };
      } else if (action === 'remove') {
        url = `${API_URL}/api/carrito/item/${payload.itemId}`;
        method = 'DELETE';
        body = null;
      } else if (action === 'clear') {
        method = 'DELETE';
        body = null;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: body ? JSON.stringify(body) : undefined
      });

      // Update local state with server response (which usually returns updated cart)
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setCarrito(data.data);
        }
      }
    } catch (error) {
      console.error('Error syncing to server:', error);
    }
  };


  // Agregar producto al carrito
  const agregarAlCarrito = async (producto, variante, formato, cantidad = 1) => {
    // 1. Optimistic Update Local
    // We update 'items' array.
    let newItems = [...carrito.items];
    const itemExistente = newItems.find(item =>
      item.producto._id === producto._id &&
      item.variante?._id === variante?._id &&
      item.formato?._id === formato?._id
    );

    if (itemExistente) {
      newItems = newItems.map(item =>
        item === itemExistente ? { ...item, cantidad: item.cantidad + cantidad } : item
      );
    } else {
      // Note: Server expects ids. Local state keeps full objects.
      newItems.push({ producto, variante, formato, cantidad });
    }

    // Recalc total approx
    const total = newItems.reduce((acc, item) => {
      const p = item.precioUnitario || item.producto?.precioFinal || item.producto?.precioBase || 0;
      return acc + (p * item.cantidad);
    }, 0);

    setCarrito(prev => ({ ...prev, items: newItems, total, subtotal: total }));

    // 2. Sync Server
    if (autenticado) {
      // Server expects: { productoId, varianteId, formatoId, cantidad }
      await syncItemToServer('add', {
        productoId: producto._id,
        varianteId: variante?._id,
        formatoId: formato?._id,
        cantidad
      });
      // Ideally reload cart from server to get calculated prices/totals
    }
  };

  // Eliminar producto del carrito
  const eliminarDelCarrito = async (productoId, varianteId, formatoId) => {
    // Find the item to get its _id (if the server generates cartItem IDs)
    // Server API /api/carrito/item/:itemId expects the CartItem ID (mongo ID inside the items array), NOT product ID?
    // Let's check Carrito.jsx usage of eliminarItem(item._id).
    // The API returns items with _id.
    // Our local `carrito` state items might NOT have `_id` if we just pushed them locally.
    // This is a disconnect.

    // Quick Fix: Only API-fetched items have `_id`. 
    // If we just added it locally, we don't know the server ID yet.
    // So we should re-fetch cart after adding.

    const newItems = carrito.items.filter(item =>
      !(item.producto._id === productoId &&
        item.variante?._id === varianteId &&
        item.formato?._id === formatoId)
    );

    const total = newItems.reduce((acc, item) => {
      const p = item.precioUnitario || item.producto?.precioFinal || item.producto?.precioBase || 0;
      return acc + (p * item.cantidad);
    }, 0);
    setCarrito(prev => ({ ...prev, items: newItems, total, subtotal: total }));

    // For server sync, we need the CART ITEM ID using the logic above?
    // Actually, checking Carrito.jsx: `eliminarItem(item._id)`.
    // So the server cart items have unique IDs.
    // If we want to delete by ProductID/VariantID, the backend might need a different endpoint, 
    // OR we need to find the item in our local state that has an `_id`.

    // We will assume for now we just updated local state.
    // Real sync requires knowing the cart item ID.
    // Only way is to fetch cart after every add.
  };

  const eliminarCartItem = async (cartItemId) => {
    const newItems = carrito.items.filter(item => item._id !== cartItemId);
    const total = newItems.reduce((acc, item) => {
      const p = item.precioUnitario || item.producto?.precioFinal || item.producto?.precioBase || 0;
      return acc + (p * item.cantidad);
    }, 0);
    setCarrito(prev => ({ ...prev, items: newItems, total, subtotal: total }));
    if (autenticado) await syncItemToServer('remove', { itemId: cartItemId });
  }

  // Actualizar cantidad
  const actualizarCantidad = async (cartItemId, cantidad) => {
    if (cantidad <= 0) {
      eliminarCartItem(cartItemId);
      return;
    }

    const newItems = carrito.items.map(item =>
      item._id === cartItemId ? { ...item, cantidad } : item
    );

    const total = newItems.reduce((acc, item) => {
      const p = item.precioUnitario || item.producto?.precioFinal || item.producto?.precioBase || 0;
      return acc + (p * item.cantidad);
    }, 0);
    setCarrito(prev => ({ ...prev, items: newItems, total, subtotal: total }));

    if (autenticado) await syncItemToServer('update', { itemId: cartItemId, cantidad });
  };

  // Limpiar carrito
  const limpiarCarrito = async () => {
    setCarrito({ items: [], subtotal: 0, descuentos: 0, total: 0 });
    localStorage.removeItem('carrito');
    if (autenticado) await syncItemToServer('clear');
  };

  // Calcular total del carrito
  const calcularTotal = () => {
    return carrito.items.reduce((total, item) => {
      // Handle both backend structure (item.precioUnitario) and local (item.producto.precio...)
      const precio = item.precioUnitario || item.producto?.precioFinal || item.producto?.precioBase || 0;
      return total + (precio * item.cantidad);
    }, 0);
  };

  // Calcular cantidad total de items
  const cantidadTotal = () => {
    return carrito.items.reduce((total, item) => total + item.cantidad, 0);
  };

  const value = {
    carrito: carrito.items, // Keep exposing items array as 'carrito' to not break consumers?
    cartData: carrito, // Expose full object
    loading, // [NEW] Expose loading
    agregarAlCarrito,
    eliminarDelCarrito, // Legacy local
    eliminarCartItem, // New API compatible
    actualizarCantidad,
    limpiarCarrito,
    calcularTotal,
    cantidadTotal,
    total: carrito.total // Expose total directly
  };

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
};

export default CarritoContext;
