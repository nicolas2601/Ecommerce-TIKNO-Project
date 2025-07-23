import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post('/auth/token/refresh/', {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          
          // Verify token is still valid before setting authenticated state
          await axios.get('/auth/profile/');
          
          // Only set user and authenticated state if token is valid
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, clear storage
          console.log('Token validation failed, clearing storage:', error.message);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // No token or user data found
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/login/', {
        email,
        password
      });

      const { access, refresh, user: userData } = response.data;
      
      // Store tokens and user data
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      toast.success('¡Bienvenido de vuelta!');
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     'Error al iniciar sesión';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/register/', userData);
      
      const { access, refresh, user: newUser } = response.data;
      
      // Store tokens and user data
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      toast.success('¡Cuenta creada exitosamente!');
      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     'Error al crear la cuenta';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          await axios.post('/auth/logout/', {
            refresh: refreshToken
          });
        } catch (serverError) {
          // Log server error but don't throw - we still want to clear local storage
          console.error('Server logout error:', serverError);
        }
      }
      
      // Clear all stored data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      setUser(null);
      setIsAuthenticated(false);
      
      return { success: true };
    } catch (error) {
      // This should rarely happen since we're handling server errors above
      console.error('Logout error:', error);
      
      // Still clear local storage even if there's an unexpected error
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      setUser(null);
      setIsAuthenticated(false);
      
      return { success: false, error: error.message };
    }
  };

  const updateUser = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.patch('/auth/profile/', userData);
      
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Perfil actualizado exitosamente');
      return { success: true, user: updatedUser };
    } catch (error) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     'Error al actualizar el perfil';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      await axios.post('/auth/password/change/', {
        current_password: currentPassword,
        new_password: newPassword
      });
      
      toast.success('Contraseña cambiada exitosamente');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     'Error al cambiar la contraseña';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      setLoading(true);
      await axios.post('/auth/password/reset/', { email });
      
      toast.success('Se ha enviado un enlace de recuperación a tu email');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     'Error al solicitar recuperación de contraseña';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      await axios.post('/auth/password/reset/confirm/', {
        token,
        password: newPassword
      });
      
      toast.success('Contraseña restablecida exitosamente');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     'Error al restablecer la contraseña';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await axios.get('/auth/profile/');
      const userData = response.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    requestPasswordReset,
    resetPassword,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;