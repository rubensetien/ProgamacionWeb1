const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const variantesService = {
  // Obtener todas las variantes
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_URL}/api/variantes${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener variantes');
    }
    
    return response.json();
  },

  // Obtener variantes por categoría
  async getByCategoria(categoriaId) {
    const response = await fetch(`${API_URL}/api/variantes/categoria/${categoriaId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener variantes');
    }
    
    return response.json();
  },

  // Obtener una variante por ID
  async getById(id) {
    const response = await fetch(`${API_URL}/api/variantes/${id}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener variante');
    }
    
    return response.json();
  },

  // Obtener variante por slug
  async getBySlug(slug) {
    const response = await fetch(`${API_URL}/api/variantes/slug/${slug}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener variante');
    }
    
    return response.json();
  },

  // Crear variante
  async create(varianteData) {
    const response = await fetch(`${API_URL}/api/variantes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(varianteData)
    });
    
    if (!response.ok) {
      throw new Error('Error al crear variante');
    }
    
    return response.json();
  },

  // Actualizar variante
  async update(id, varianteData) {
    const response = await fetch(`${API_URL}/api/variantes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(varianteData)
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar variante');
    }
    
    return response.json();
  },

  // Eliminar variante
  async delete(id) {
    const response = await fetch(`${API_URL}/api/variantes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar variante');
    }
    
    return response.json();
  }
};

export default variantesService;
