import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/axios';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartId, setCartId] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  // Calculate cart totals
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const cartSubtotal = cartTotal;
  const cartTax = cartTotal * 0.19; // 19% IVA
  const cartGrandTotal = cartSubtotal + cartTax;

  // Load cart from localStorage for guest users
  useEffect(() => {
    if (!isAuthenticated) {
      const savedCart = localStorage.getItem('guest_cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart);
        } catch (error) {
          console.error('Error parsing saved cart:', error);
          localStorage.removeItem('guest_cart');
        }
      }
    }
  }, [isAuthenticated]);

  // Load cart from server for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCart();
    } else {
      // Clear cart items if user is not authenticated
      setCartItems([]);
      setCartId(null);
    }
  }, [isAuthenticated, user]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (!isAuthenticated && cartItems.length > 0) {
      localStorage.setItem('guest_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  const fetchCart = async () => {
    // Only fetch cart if user is authenticated
    if (!isAuthenticated) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.getCart();
      
      if (response.data) {
        setCartItems(response.data.items || []);
        setCartId(response.data.id);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching cart:', error);
        // Don't show error notification for 401 (unauthorized) errors
        if (error.response?.status !== 401) {
          addNotification('Error al cargar el carrito', 'error');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1, selectedVariant = null) => {
    try {
      setLoading(true);

      if (isAuthenticated) {
        // Add to server cart
        const response = await api.addToCart(product.id, quantity);

        if (response.data) {
          await fetchCart(); // Refresh cart from server
          addNotification(`${product.name} agregado al carrito`, 'success');
        }
      } else {
        // Add to guest cart
        const existingItemIndex = cartItems.findIndex(
          item => item.product.id === product.id && 
                 item.variant?.id === selectedVariant?.id
        );

        if (existingItemIndex >= 0) {
          // Update existing item
          const updatedItems = [...cartItems];
          updatedItems[existingItemIndex].quantity += quantity;
          setCartItems(updatedItems);
        } else {
          // Add new item
          const newItem = {
            id: Date.now(), // Temporary ID for guest cart
            product,
            quantity,
            variant: selectedVariant,
            created_at: new Date().toISOString()
          };
          setCartItems([...cartItems, newItem]);
        }
        
        addNotification(`${product.name} agregado al carrito`, 'success');
      }
    } catch (error) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     'Error al agregar al carrito';
      addNotification(message, 'error');
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      setLoading(true);

      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      if (isAuthenticated) {
        // Update server cart
        await api.updateCartItem(itemId, quantity);
        await fetchCart(); // Refresh cart from server
      } else {
        // Update guest cart
        const updatedItems = cartItems.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        );
        setCartItems(updatedItems);
      }

      addNotification('Cantidad actualizada', 'success');
    } catch (error) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     'Error al actualizar el carrito';
      addNotification(message, 'error');
      console.error('Error updating cart item:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);

      if (isAuthenticated) {
        // Remove from server cart
        await api.removeFromCart(itemId);
        await fetchCart(); // Refresh cart from server
      } else {
        // Remove from guest cart
        const updatedItems = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedItems);
      }

      addNotification('Producto eliminado del carrito', 'success');
    } catch (error) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     'Error al eliminar del carrito';
      addNotification(message, 'error');
      console.error('Error removing from cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);

      if (isAuthenticated && cartId) {
        // Clear server cart
        // Note: We'll implement this endpoint or use existing clear functionality
        await fetchCart();
        setCartItems([]);
      }

      // Clear local cart
      setCartItems([]);
      setCartId(null);
      localStorage.removeItem('guest_cart');

      addNotification('Carrito vaciado', 'success');
    } catch (error) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     'Error al vaciar el carrito';
      addNotification(message, 'error');
      console.error('Error clearing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncGuestCart = async () => {
    // Sync guest cart with server when user logs in
    if (!isAuthenticated || cartItems.length === 0) return;

    try {
      setLoading(true);
      
      for (const item of cartItems) {
        await api.addToCart(item.product.id, item.quantity);
      }

      // Clear guest cart and fetch server cart
      localStorage.removeItem('guest_cart');
      await fetchCart();
      
      addNotification('Carrito sincronizado', 'success');
    } catch (error) {
      console.error('Error syncing guest cart:', error);
      addNotification('Error al sincronizar el carrito', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCartItem = (productId, variantId = null) => {
    return cartItems.find(
      item => item.product.id === productId && 
             item.variant?.id === variantId
    );
  };

  const isInCart = (productId, variantId = null) => {
    return !!getCartItem(productId, variantId);
  };

  const getItemQuantity = (productId, variantId = null) => {
    const item = getCartItem(productId, variantId);
    return item ? item.quantity : 0;
  };

  const createOrder = async (shippingAddress, paymentMethod) => {
    try {
      setLoading(true);

      if (!isAuthenticated) {
        throw new Error('Debes iniciar sesión para realizar un pedido');
      }

      if (cartItems.length === 0) {
        throw new Error('El carrito está vacío');
      }

      const orderData = {
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          variant_id: item.variant?.id
        }))
      };

      const response = await api.createOrder(orderData);
      
      // Clear cart after successful order
      await clearCart();
      
      addNotification('¡Pedido creado exitosamente!', 'success');
      return { success: true, order: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     error.message || 
                     'Error al crear el pedido';
      addNotification(message, 'error');
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    cartSubtotal,
    cartTax,
    cartGrandTotal,
    cartId,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    syncGuestCart,
    getCartItem,
    isInCart,
    getItemQuantity,
    createOrder,
    fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;