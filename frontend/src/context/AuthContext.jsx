import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [autenticado, setAutenticado] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    const token = localStorage.getItem('accessToken');
    if (usuarioGuardado && token) {
      setUsuario(JSON.parse(usuarioGuardado));
      setAutenticado(true);
    }
  }, []);

  const crearHeaderAuth = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return { 'Content-Type': 'application/json' };
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error('Credenciales inválidas');

      const data = await res.json();

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      setUsuario(data.usuario);
      setAutenticado(true);
      return true;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('usuario');
      setAutenticado(false);
      setUsuario(null);
    }
  };

  // Maneja errores 401 (token expirado)
  const manejarError401 = (response) => {
    if (response.status === 401) {
      logout();
      alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      autenticado,
      loading,
      login,
      logout,
      crearHeaderAuth,
      manejarError401,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};