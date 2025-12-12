import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';



const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [sessionWarning, setSessionWarning] = useState(false);

  const navigate = useNavigate();

  // --- Load token and user on initial mount ---
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('User');

    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      if (userData && userData !== 'undefined') {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Invalid user data in localStorage:', error);
          setUser(null);
        }
      }
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  // --- Logout function ---
  const logout = useCallback(() => {
    try {
      api.post('/auth/logout').catch(() => {});
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  // --- Login function ---
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { userEmail: email, password });
      const accessToken = response.data;
      localStorage.setItem('accessToken', accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setIsAuthenticated(true);
      setUser({}); // Optional: parse token if needed
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // --- Register function ---
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/addUser', userData);
      return { success: true, message: response.data?.message || 'Registered successfully' };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      console.error('Registration error:', err);
      return { success: false, message };
    }
  };

  // --- Refresh token ---
  const refreshToken = useCallback(async () => {
    if (sessionExpired) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await api.post('/auth/refresh', token, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const newAccessToken = response.data;
      localStorage.setItem('accessToken', newAccessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      setSessionWarning(false); // reset warning
    } catch (error) {
      console.error('Token refresh failed', error);
      setSessionExpired(true);
      logout();
    }
  }, [sessionExpired, logout]);

  // --- Check token expiration and show warning ---
useEffect(() => {
  const checkToken = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const exp = decoded.exp * 1000;
      const now = Date.now();
      const remaining = exp - now;

      // Show warning 15 seconds before expiry
      if (remaining <= 15000 && remaining > 0) {
        setSessionWarning(true);
      }

      // Show expired modal if token expired
      if (remaining <= 0) {
        setSessionExpired(true);
        setSessionWarning(false);
      }
    } catch (err) {
      console.error('Error decoding token', err);
    }
  };

  const interval = setInterval(checkToken, 1000);
  return () => clearInterval(interval);
}, []); // no dependencies



  // --- Auto-refresh token every 1 min ---
  useEffect(() => {
    const interval = setInterval(refreshToken, 1 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshToken]);

  // --- Refresh on activity ---
  useEffect(() => {
    const handleActivity = () => refreshToken();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [refreshToken]);

  // --- Axios interceptors ---
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (sessionExpired) return Promise.reject({ message: 'SESSION_EXPIRED' });
        const token = localStorage.getItem('accessToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setSessionExpired(true);
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [logout, sessionExpired]);

  const handleSessionExpired = () => {
    setSessionExpired(false);
    setSessionWarning(false);
    logout();
    navigate('/login');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register, api }}>
      {sessionWarning && !sessionExpired && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#ffc107', color: '#000', padding: '15px', borderRadius: '8px', boxShadow: '0px 0px 10px rgba(0,0,0,0.3)', zIndex: 9999 }}>
          ⚠️ Your session will expire soon!
        </div>
      )}
      {sessionExpired && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '10px',
              textAlign: 'center',
              width: '350px',
              boxShadow: '0px 0px 20px rgba(0,0,0,0.3)',
            }}
          >
            <h2>Session Expired</h2>
            <p>You were inactive for too long. Please login again.</p>
            <button
              onClick={handleSessionExpired}
              style={{
                padding: '10px 20px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px',
              }}
            >
              Login Again
            </button>
          </div>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

