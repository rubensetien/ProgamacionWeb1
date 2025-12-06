  const agregarAlCarrito = async (productoId) => {
    try {
      setAgregandoCarrito(productoId);
      
      const response = await fetch(`${API_URL}/api/carrito/item`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          productoId,
          cantidad: 1
        })
      });

      // Verificar el tipo de contenido de la respuesta
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Respuesta no es JSON. Status:', response.status);
        
        if (response.status === 404) {
          mostrarNotificacion('⚠️ El carrito no está disponible. Verifica que el backend esté funcionando.', 'error');
        } else if (response.status === 401) {
          mostrarNotificacion('⚠️ Debes iniciar sesión para añadir productos al carrito', 'error');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          const text = await response.text();
          console.error('Respuesta del servidor:', text);
          mostrarNotificacion('⚠️ Error del servidor. Por favor, intenta más tarde.', 'error');
        }
        return;
      }

      const data = await response.json();

      if (data.success) {
        mostrarNotificacion('✓ Producto añadido al carrito correctamente');
      } else {
        mostrarNotificacion(data.message || 'Error al añadir al carrito', 'error');
      }
    } catch (err) {
      console.error('Error añadiendo al carrito:', err);
      
      if (err.message.includes('Failed to fetch')) {
        mostrarNotificacion('⚠️ No se pudo conectar con el servidor. Verifica que esté funcionando.', 'error');
      } else {
        mostrarNotificacion('⚠️ Por favor inicia sesión para añadir productos al carrito', 'error');
        setTimeout(() => navigate('/login'), 2000);
      }
    } finally {
      setAgregandoCarrito(null);
    }
  };
