const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const formatosService = {
  // Obtener todos los formatos
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_URL}/api/formatos${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener formatos');
    }
    
    return response.json();
  },

  // Obtener formatos por categoría
  async getByCategoria(categoriaId) {
    const response = await fetch(`${API_URL}/api/formatos/categoria/${categoriaId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener formatos');
    }
    
    return response.json();
  },

  // Obtener solo formatos envasados
  async getEnvasados() {
    const response = await fetch(`${API_URL}/api/formatos/envasados`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener formatos envasados');
    }
    
    return response.json();
  },

  // Obtener un formato por ID
  async getById(id) {
    const response = await fetch(`${API_URL}/api/formatos/${id}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener formato');
    }
    
    return response.json();
  },

  // Crear formato
  async create(formatoData) {
    const response = await fetch(`${API_URL}/api/formatos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(formatoData)
    });
    
    if (!response.ok) {
      throw new Error('Error al crear formato');
    }
    
    return response.json();
  },

  // Actualizar formato
  async update(id, formatoData) {
    const response = await fetch(`${API_URL}/api/formatos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(formatoData)
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar formato');
    }
    
    return response.json();
  },

  // Eliminar formato
  async delete(id) {
    const response = await fetch(`${API_URL}/api/formatos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar formato');
    }
    
    return response.json();
  }
};

export default formatosService;
