// services/index.js - Exportar todos los servicios

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Servicios de Productos
export const productosService = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/productos`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },
  
  getById: async (id) => {
    const res = await fetch(`${API_URL}/api/productos/${id}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },
  
  create: async (data) => {
    const res = await fetch(`${API_URL}/api/productos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  update: async (id, data) => {
    const res = await fetch(`${API_URL}/api/productos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  delete: async (id) => {
    const res = await fetch(`${API_URL}/api/productos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  }
};

// Servicios de Variantes
export const variantesService = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/variantes`, {
      headers: getAuthHeaders()
    });
    return res.json();
  }
};

// Servicios de Formatos
export const formatosService = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/formatos`, {
      headers: getAuthHeaders()
    });
    return res.json();
  }
};
