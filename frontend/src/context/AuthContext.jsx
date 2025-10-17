import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [autenticado, setAutenticado] = useState(false);
  const [loading, setLoading] = useState(false);

  const crearHeaderAuth = () => {
    if (!usuario) return {};
    const credenciales = `${usuario.email}:${usuario.password}`;
    const base64 = btoa(credenciales);
    return {
      'Authorization': `Basic ${base64}`,
      'Content-Type': 'application/json',
    };
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const credenciales = `${email}:${password}`;
      const base64 = btoa(credenciales);

      // Obtener usuario desde backend para saber su rol
      const res = await fetch('http://localhost:3001/usuarios/perfil', {
        headers: {
          'Authorization': `Basic ${base64}`,
        },
      });

      if (!res.ok) throw new Error('Credenciales inválidas');

      const userData = await res.json();

      setUsuario({ 
        email, 
        password, 
        rol: userData.rol,
        nombre: userData.nombre,
        id: userData._id 
      });
      setAutenticado(true);
      return true;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAutenticado(false);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      autenticado,
      loading,
      login,
      logout,
      crearHeaderAuth,
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