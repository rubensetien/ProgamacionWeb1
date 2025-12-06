const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const productosService = {
  // Obtener todos los productos con filtros
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_URL}/api/productos${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener productos');
    }
    
    return response.json();
  },

  // Obtener productos por categoría
  async getByCategoria(categoriaId) {
    const response = await fetch(`${API_URL}/api/productos/categoria/${categoriaId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener productos');
    }
    
    return response.json();
  },

  // Obtener productos por canal
  async getByCanal(canal) {
    const response = await fetch(`${API_URL}/api/productos/canal/${canal}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener productos');
    }
    
    return response.json();
  },

  // Obtener productos destacados
  async getDestacados(limit = 10) {
    const response = await fetch(`${API_URL}/api/productos/destacados?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener productos destacados');
    }
    
    return response.json();
  },

  // Obtener un producto por ID
  async getById(id) {
    const response = await fetch(`${API_URL}/api/productos/${id}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener producto');
    }
    
    return response.json();
  },

  // Obtener producto por SKU
  async getBySku(sku) {
    const response = await fetch(`${API_URL}/api/productos/sku/${sku}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener producto');
    }
    
    return response.json();
  },

  // Crear producto
  async create(productoData) {
    const response = await fetch(`${API_URL}/api/productos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productoData)
    });
    
    if (!response.ok) {
      throw new Error('Error al crear producto');
    }
    
    return response.json();
  },

  // Actualizar producto
  async update(id, productoData) {
    const response = await fetch(`${API_URL}/api/productos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(productoData)
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar producto');
    }
    
    return response.json();
  },

  // Actualizar solo el stock
  async updateStock(id, stock) {
    const response = await fetch(`${API_URL}/api/productos/${id}/stock`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ stock })
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar stock');
    }
    
    return response.json();
  },

  // Eliminar producto
  async delete(id) {
    const response = await fetch(`${API_URL}/api/productos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar producto');
    }
    
    return response.json();
  },

  // Buscar productos
  async search(query, params = {}) {
    const allParams = { ...params, buscar: query };
    return this.getAll(allParams);
  }
};

export default productosService;
