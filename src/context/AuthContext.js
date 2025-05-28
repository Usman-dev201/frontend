import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading,setLoading] = useState(true);

  // Load user info from localStorage on mount
  useEffect(() => {
  const token = localStorage.getItem('accessToken');
  const userData = localStorage.getItem('User');

  if (token && userData) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(JSON.parse(userData));
    setIsAuthenticated(true);
  }
  setLoading(false);
}, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        userEmail: email,
        password: password
      });

      const { accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setIsAuthenticated(true);
      setUser({}); // Store placeholder or parsed token if needed
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/addUser', userData);
      const { accessToken, refreshToken } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setIsAuthenticated(true);
      setUser({}); // Store placeholder or parsed token if needed
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user,
      login, 
      logout,
      register,
      api
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
