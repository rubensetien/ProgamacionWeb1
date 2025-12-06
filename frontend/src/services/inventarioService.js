const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const inventarioService = {
  // Obtener todo el inventario
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_URL}/api/inventario${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener inventario');
    }
    
    return response.json();
  },

  // Obtener inventario de un producto
  async getByProducto(productoId) {
    const response = await fetch(`${API_URL}/api/inventario/producto/${productoId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener inventario del producto');
    }
    
    return response.json();
  },

  // Obtener alertas de stock bajo
  async getAlertas() {
    const response = await fetch(`${API_URL}/api/inventario/alertas`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener alertas');
    }
    
    return response.json();
  },

  // Crear inventario
  async create(inventarioData) {
    const response = await fetch(`${API_URL}/api/inventario`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(inventarioData)
    });
    
    if (!response.ok) {
      throw new Error('Error al crear inventario');
    }
    
    return response.json();
  },

  // Actualizar inventario
  async update(id, inventarioData) {
    const response = await fetch(`${API_URL}/api/inventario/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(inventarioData)
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar inventario');
    }
    
    return response.json();
  },

  // Actualizar solo el stock
  async updateStock(productoId, stock) {
    const response = await fetch(`${API_URL}/api/inventario/producto/${productoId}/stock`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ stock })
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar stock');
    }
    
    return response.json();
  },

  // Reservar stock
  async reservarStock(productoId, cantidad) {
    const response = await fetch(`${API_URL}/api/inventario/producto/${productoId}/reservar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cantidad })
    });
    
    if (!response.ok) {
      throw new Error('Error al reservar stock');
    }
    
    return response.json();
  },

  // Confirmar venta
  async confirmarVenta(productoId, cantidad, canal = 'ecommerce') {
    const response = await fetch(`${API_URL}/api/inventario/producto/${productoId}/venta`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ cantidad, canal })
    });
    
    if (!response.ok) {
      throw new Error('Error al confirmar venta');
    }
    
    return response.json();
  },

  // Eliminar inventario
  async delete(id) {
    const response = await fetch(`${API_URL}/api/inventario/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar inventario');
    }
    
    return response.json();
  }
};

export default inventarioService;
