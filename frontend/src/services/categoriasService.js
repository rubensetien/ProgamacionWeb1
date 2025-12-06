const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const categoriasService = {
  // Obtener todas las categorías
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_URL}/api/categorias${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener categorías');
    }
    
    return response.json();
  },

  // Obtener una categoría por ID
  async getById(id) {
    const response = await fetch(`${API_URL}/api/categorias/${id}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener categoría');
    }
    
    return response.json();
  },

  // Obtener categoría por slug
  async getBySlug(slug) {
    const response = await fetch(`${API_URL}/api/categorias/slug/${slug}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener categoría');
    }
    
    return response.json();
  },

  // Crear categoría
  async create(categoriaData) {
    const response = await fetch(`${API_URL}/api/categorias`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoriaData)
    });
    
    if (!response.ok) {
      throw new Error('Error al crear categoría');
    }
    
    return response.json();
  },

  // Actualizar categoría
  async update(id, categoriaData) {
    const response = await fetch(`${API_URL}/api/categorias/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoriaData)
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar categoría');
    }
    
    return response.json();
  },

  // Eliminar categoría
  async delete(id) {
    const response = await fetch(`${API_URL}/api/categorias/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar categoría');
    }
    
    return response.json();
  }
};

export default categoriasService;
