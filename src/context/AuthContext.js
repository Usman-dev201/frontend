import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token and user on initial mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('User');

    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      if (userData) {
        setUser(JSON.parse(userData));
      }
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  // ⏱ Auto-refresh token every 5 minutes
  
const refreshToken = useCallback(async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return;

  try {
    const response = await api.post('/auth/refresh', token, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const newAccessToken = response.data;
    localStorage.setItem('accessToken', newAccessToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
  } catch (error) {
    console.error('Token refresh failed', error);
    logout(); // Optional
  }
}, []);
useEffect(() => {
  const interval = setInterval(() => {
    refreshToken();
  }, 5 * 60 * 1000); // 5 minutes

  return () => clearInterval(interval);
}, [refreshToken]);
// Refresh on activity
useEffect(() => {
  const handleActivity = () => {
    refreshToken();
  };

  window.addEventListener('mousemove', handleActivity);
  window.addEventListener('keydown', handleActivity);

  return () => {
    window.removeEventListener('mousemove', handleActivity);
    window.removeEventListener('keydown', handleActivity);
  };
}, [refreshToken]);
 
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        userEmail: email,
        password: password,
      });

      const accessToken = response.data;
      localStorage.setItem('accessToken', accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setIsAuthenticated(true);
      setUser({}); // Optional: parse token to get user info
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/addUser', userData);
      const accessToken = response.data;
      localStorage.setItem('accessToken', accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setIsAuthenticated(true);
      setUser({});
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
