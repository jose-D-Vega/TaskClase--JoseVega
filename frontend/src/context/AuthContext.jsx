import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axiosClient, { setLogoutCallback } from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Definimos logout con useCallback para que no cambie en cada render
  const logout = useCallback(async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      sessionStorage.removeItem('accessToken');
      setUser(null);
    }
  }, []);

  // Registramos el callback de logout en el cliente axios
  // Esto es fundamental para que el interceptor de Axios pueda cerrar la sesión
  // globalmente si el refresh token también expira, sin necesidad de recargar la página.
  useEffect(() => {
    setLogoutCallback(logout);
  }, [logout]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await axiosClient.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
          }
        } catch (error) {
          console.error('Error verificando sesión:', error);
          sessionStorage.removeItem('accessToken');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axiosClient.post('/auth/login', { email, password });
      if (res.data.success) {
        sessionStorage.setItem('accessToken', res.data.accessToken);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Error al iniciar sesión' 
      };
    }
  };

  const register = async (name, email, password, avatar) => {
    try {
      const res = await axiosClient.post('/auth/register', { name, email, password, avatar });
      return res.data;
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Error al registrarse' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
