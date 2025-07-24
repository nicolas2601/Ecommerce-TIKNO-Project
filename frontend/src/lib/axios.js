import axios from 'axios';
// import toast from 'react-hot-toast'; // Comentado para usar el sistema de notificaciones centralizado

// Crear instancia de axios con configuración base
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
axiosInstance.interceptors.request.use(
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

// Interceptor para manejar respuestas y errores
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró (401) y no hemos intentado renovarlo
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/auth/token/refresh/`,
            { refresh: refreshToken }
          );

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Reintentar la petición original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Si no se puede renovar el token, limpiar localStorage y redirigir
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Manejar otros errores
    // Nota: Los errores ahora se manejan en los componentes individuales usando el sistema de notificaciones
    // if (error.response?.status >= 500) {
    //   toast.error('Error del servidor. Por favor, intenta más tarde.');
    // } else if (error.response?.status === 404) {
    //   toast.error('Recurso no encontrado.');
    // } else if (error.response?.status === 403) {
    //   toast.error('No tienes permisos para realizar esta acción.');
    // }

    return Promise.reject(error);
  }
);

export default axiosInstance;

// Funciones helper para diferentes tipos de requests
export const api = {
  // Productos
  getProducts: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    return axiosInstance.get(`/products/?${searchParams.toString()}`);
  },
  
  getProduct: (id) => {
    return axiosInstance.get(`/products/${id}/`);
  },
  
  getCategories: () => {
    return axiosInstance.get('/categories/');
  },
  
  getProductReviews: (productId) => {
    return axiosInstance.get(`/products/${productId}/reviews/`);
  },
  
  createProductReview: (productId, reviewData) => {
    return axiosInstance.post(`/products/${productId}/reviews/`, reviewData);
  },
  
  // Carrito
  getCart: () => {
    return axiosInstance.get('/cart/');
  },
  
  addToCart: (productId, quantity = 1) => {
    return axiosInstance.post('/cart/add_item/', {
      product_id: productId,
      quantity
    });
  },
  
  updateCartItem: (itemId, quantity) => {
    return axiosInstance.put('/cart/update_item/', {
      item_id: itemId,
      quantity
    });
  },
  
  removeFromCart: (itemId) => {
    return axiosInstance.delete('/cart/remove_item/', {
      data: { item_id: itemId }
    });
  },
  
  clearCart: () => {
    return axiosInstance.delete('/cart/clear/');
  },
  
  // Órdenes
  getOrders: () => {
    return axiosInstance.get('/orders/orders/');
  },
  
  createOrder: (orderData) => {
    return axiosInstance.post('/orders/orders/', orderData);
  },
  
  // Autenticación
  login: (credentials) => axiosInstance.post('/auth/login/', credentials),
  register: (userData) => axiosInstance.post('/auth/register/', userData),
  logout: (refreshToken) => axiosInstance.post('/auth/logout/', { refresh: refreshToken }),
  refreshToken: (refreshToken) => axiosInstance.post('/auth/token/refresh/', { refresh: refreshToken }),
  resetPassword: (email) => axiosInstance.post('/auth/password-reset/', { email }),
  getProfile: () => axiosInstance.get('/auth/profile/'),
  updateProfile: (data) => axiosInstance.patch('/auth/profile/', data),
  
  // Upload de imágenes
  uploadImage: (file, folder = 'products') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    
    return axiosInstance.post('/products/upload-image/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};