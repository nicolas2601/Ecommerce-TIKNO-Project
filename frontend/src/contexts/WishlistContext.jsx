import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist debe ser usado dentro de WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotifications();

  // Cargar wishlist desde localStorage al inicializar
  useEffect(() => {
    if (isAuthenticated && user) {
      const savedWishlist = localStorage.getItem(`wishlist_${user.id}`);
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch (error) {
          console.error('Error al cargar wishlist:', error);
          setWishlist([]);
        }
      }
    } else {
      setWishlist([]);
    }
  }, [isAuthenticated, user]);

  // Guardar wishlist en localStorage cuando cambie
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated, user]);

  const addToWishlist = (product) => {
    if (!isAuthenticated) {
      addNotification('Debes iniciar sesión para agregar productos a favoritos', 'error');
      return false;
    }

    if (isInWishlist(product.id)) {
      addNotification('Este producto ya está en tu lista de favoritos', 'error');
      return false;
    }

    setWishlist(prev => [...prev, product]);
    addNotification('Producto agregado a favoritos', 'success');
    return true;
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
    addNotification('Producto eliminado de favoritos', 'success');
  };

  const toggleWishlist = (product) => {
    if (!isAuthenticated) {
      addNotification('Debes iniciar sesión para agregar productos a favoritos', 'error');
      return false;
    }

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
    return true;
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
    addNotification('Lista de favoritos limpiada', 'success');
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;