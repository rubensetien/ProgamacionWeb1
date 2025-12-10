import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token')); // [NEW] Token state
  const [autenticado, setAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const verificarSesion = async () => {
      const tokenStorage = localStorage.getItem('token');

      if (!tokenStorage) {
        setToken(null);
        setCargando(false);
        setAutenticado(false);
        setUsuario(null);
        return;
      }

      setToken(tokenStorage); // Ensure state is synced

      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${tokenStorage}` // Use the variable, not state, to be safe in async
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setUsuario(data.data);
            setAutenticado(true);
          } else {
            logout();
          }
        } else {
          logout();
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
        logout();
      } finally {
        setCargando(false);
      }
    };

    verificarSesion();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Credenciales inválidas');
      }

      const userData = data.data;

      if (!userData.token || !userData._id) {
        throw new Error('Respuesta de login incompleta');
      }

      localStorage.setItem('token', userData.token);
      setToken(userData.token); // Update state

      const usuarioFormateado = {
        _id: userData._id,
        nombre: userData.nombre,
        email: userData.email,
        rol: userData.rol,
        avatar: userData.avatar,
        permisos: userData.permisos
      };

      localStorage.setItem('usuario', JSON.stringify(usuarioFormateado));
      setUsuario(usuarioFormateado);
      setAutenticado(true);

      return true;
    } catch (err) {
      console.error('Error en login:', err);
      throw err;
    }
  };

  const register = async ({ nombre, email, password, telefono }) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, telefono }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error al registrarse');
      }

      const userData = data.data;

      if (!userData.token || !userData._id) {
        throw new Error('Respuesta de registro incompleta');
      }

      localStorage.setItem('token', userData.token);
      setToken(userData.token); // Update state

      const usuarioFormateado = {
        _id: userData._id,
        nombre: userData.nombre,
        email: userData.email,
        rol: userData.rol,
        avatar: userData.avatar,
        permisos: userData.permisos
      };

      localStorage.setItem('usuario', JSON.stringify(usuarioFormateado));
      setUsuario(usuarioFormateado);
      setAutenticado(true);

      return true;
    } catch (err) {
      console.error('Error en registro:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null); // Clear state
    setUsuario(null);
    setAutenticado(false);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token, // Expose token
        autenticado,
        cargando,
        login,
        register,
        logout,
      }}
    >
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

export default AuthContext;
