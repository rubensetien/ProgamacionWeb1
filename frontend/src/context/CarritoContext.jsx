import { createContext, useContext, useState, useEffect } from 'react';

const CarritoContext = createContext();

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  }
  return context;
};

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      try {
        setCarrito(JSON.parse(carritoGuardado));
      } catch (error) {
        console.error('Error cargando carrito:', error);
        localStorage.removeItem('carrito');
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  // Agregar producto al carrito
  const agregarAlCarrito = (producto, variante, formato, cantidad = 1) => {
    setCarrito(prevCarrito => {
      // Buscar si el producto ya existe con la misma variante y formato
      const itemExistente = prevCarrito.find(item =>
        item.producto._id === producto._id &&
        item.variante?._id === variante?._id &&
        item.formato?._id === formato?._id
      );

      if (itemExistente) {
        // Incrementar cantidad
        return prevCarrito.map(item =>
          item.producto._id === producto._id &&
          item.variante?._id === variante?._id &&
          item.formato?._id === formato?._id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      } else {
        // Agregar nuevo item
        return [...prevCarrito, { producto, variante, formato, cantidad }];
      }
    });
  };

  // Eliminar producto del carrito
  const eliminarDelCarrito = (productoId, varianteId, formatoId) => {
    setCarrito(prevCarrito =>
      prevCarrito.filter(item =>
        !(item.producto._id === productoId &&
          item.variante?._id === varianteId &&
          item.formato?._id === formatoId)
      )
    );
  };

  // Actualizar cantidad de un producto
  const actualizarCantidad = (productoId, varianteId, formatoId, cantidad) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(productoId, varianteId, formatoId);
      return;
    }

    setCarrito(prevCarrito =>
      prevCarrito.map(item =>
        item.producto._id === productoId &&
        item.variante?._id === varianteId &&
        item.formato?._id === formatoId
          ? { ...item, cantidad }
          : item
      )
    );
  };

  // Limpiar carrito
  const limpiarCarrito = () => {
    setCarrito([]);
    localStorage.removeItem('carrito');
  };

  // Calcular total del carrito
  const calcularTotal = () => {
    return carrito.reduce((total, item) => {
      const precio = item.producto.precioFinal || item.producto.precioBase || 0;
      return total + (precio * item.cantidad);
    }, 0);
  };

  // Calcular cantidad total de items
  const cantidadTotal = () => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  };

  const value = {
    carrito,
    agregarAlCarrito,
    eliminarDelCarrito,
    actualizarCantidad,
    limpiarCarrito,
    calcularTotal,
    cantidadTotal
  };

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
};

export default CarritoContext;
