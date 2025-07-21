import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  TagIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    cartSubtotal, 
    cartTax,
    createOrder,
    loading 
  } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(item.product.id);
    } else if (newQuantity <= item.product.stock) {
      await updateCartItem(item.product.id, newQuantity);
    } else {
      toast.error(`Solo hay ${item.product.stock} unidades disponibles`);
    }
  };

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
  };

  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      clearCart();
      toast.success('Carrito vaciado');
    }
  };

  const applyCoupon = () => {
    // Simulate coupon validation
    const validCoupons = {
      'DESCUENTO10': { type: 'percentage', value: 10, description: '10% de descuento' },
      'ENVIOGRATIS': { type: 'shipping', value: 0, description: 'Envío gratuito' },
      'BIENVENIDO': { type: 'fixed', value: 5000, description: '$5.000 de descuento' }
    };

    if (validCoupons[couponCode.toUpperCase()]) {
      setAppliedCoupon({
        code: couponCode.toUpperCase(),
        ...validCoupons[couponCode.toUpperCase()]
      });
      toast.success('Cupón aplicado exitosamente');
      setShowCouponForm(false);
      setCouponCode('');
    } else {
      toast.error('Cupón inválido');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Cupón removido');
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    switch (appliedCoupon.type) {
      case 'percentage':
        return cartSubtotal * (appliedCoupon.value / 100);
      case 'fixed':
        return Math.min(appliedCoupon.value, cartSubtotal);
      default:
        return 0;
    }
  };

  const calculateShipping = () => {
    if (appliedCoupon?.type === 'shipping') return 0;
    return cartSubtotal >= 50000 ? 0 : 5000; // Free shipping over $50,000
  };

  const finalTotal = () => {
    const discount = calculateDiscount();
    const shipping = calculateShipping();
    return Math.max(0, cartSubtotal - discount + cartTax + shipping);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para continuar');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    try {
      setProcessingOrder(true);
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        coupon_code: appliedCoupon?.code,
        shipping_address: 'Default address', // This would come from user profile
        payment_method: 'pending' // This would be set in checkout process
      };
      
      const order = await createOrder(orderData);
      toast.success('Orden creada exitosamente');
      navigate(`/checkout/${order.id}`);
    } catch (error) {
      toast.error('Error al crear la orden');
    } finally {
      setProcessingOrder(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/products')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Continuar Comprando</span>
              </button>
            </div>
            
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Carrito de Compras
            </h1>
            
            <div className="flex items-center space-x-2">
              <ShoppingBagIcon className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-medium text-gray-900">
                {cartItems.length} {cartItems.length === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          // Empty Cart
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBagIcon className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Parece que no has agregado ningún producto a tu carrito. ¡Explora nuestros productos y encuentra algo que te guste!
            </p>
            <motion.button
              onClick={() => navigate('/products')}
              className="btn-primary inline-flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingBagIcon className="h-5 w-5" />
              <span>Explorar Productos</span>
            </motion.button>
          </motion.div>
        ) : (
          // Cart with Items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Clear Cart Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Productos en tu carrito</h2>
                <button
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200"
                >
                  Vaciar carrito
                </button>
              </div>

              {/* Items List */}
              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.product.id}
                      variants={itemVariants}
                      layout
                      className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.product.main_image_url || '/api/placeholder/150/150'}
                            alt={item.product.name}
                            className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity duration-200"
                            onClick={() => navigate(`/products/${item.product.id}`)}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-primary-600 transition-colors duration-200 truncate"
                            onClick={() => navigate(`/products/${item.product.id}`)}
                          >
                            {item.product.name}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mt-1">
                            Categoría: {item.product.category?.name || 'Sin categoría'}
                          </p>
                          
                          <div className="flex items-center space-x-4 mt-3">
                            <span className="text-2xl font-bold text-gray-900">
                              ${item.product.price?.toLocaleString()}
                            </span>
                            
                            {item.product.original_price && item.product.original_price > item.product.price && (
                              <span className="text-lg text-gray-500 line-through">
                                ${item.product.original_price.toLocaleString()}
                              </span>
                            )}
                          </div>
                          
                          {/* Stock Warning */}
                          {item.product.stock <= 5 && (
                            <p className="text-orange-600 text-sm mt-2 font-medium">
                              ¡Solo quedan {item.product.stock} unidades!
                            </p>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <motion.button
                              onClick={() => handleQuantityChange(item, item.quantity - 1)}
                              className="p-2 hover:bg-gray-50 transition-colors duration-200"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <MinusIcon className="h-4 w-4 text-gray-600" />
                            </motion.button>
                            
                            <span className="px-4 py-2 text-center min-w-[3rem] font-medium">
                              {item.quantity}
                            </span>
                            
                            <motion.button
                              onClick={() => handleQuantityChange(item, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="p-2 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <PlusIcon className="h-4 w-4 text-gray-600" />
                            </motion.button>
                          </div>
                          
                          {/* Subtotal */}
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              ${(item.product.price * item.quantity).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.quantity} × ${item.product.price?.toLocaleString()}
                            </p>
                          </div>
                          
                          {/* Remove Button */}
                          <motion.button
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-soft p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Resumen del Pedido</h2>
                
                {/* Coupon Section */}
                <div className="mb-6">
                  {!appliedCoupon ? (
                    <div>
                      {!showCouponForm ? (
                        <button
                          onClick={() => setShowCouponForm(true)}
                          className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-colors duration-200"
                        >
                          <TagIcon className="h-5 w-5" />
                          <span>¿Tienes un cupón?</span>
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              placeholder="Código del cupón"
                              className="flex-1 input"
                              onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                            />
                            <button
                              onClick={applyCoupon}
                              className="btn-primary px-4"
                            >
                              Aplicar
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              setShowCouponForm(false);
                              setCouponCode('');
                            }}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TagIcon className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">{appliedCoupon.code}</p>
                            <p className="text-sm text-green-700">{appliedCoupon.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-green-600 hover:text-green-700"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${cartSubtotal.toLocaleString()}</span>
                  </div>
                  
                  {appliedCoupon && calculateDiscount() > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento ({appliedCoupon.code})</span>
                      <span>-${calculateDiscount().toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Impuestos</span>
                    <span>${cartTax.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    <span>
                      {calculateShipping() === 0 ? (
                        <span className="text-green-600 font-medium">Gratis</span>
                      ) : (
                        `$${calculateShipping().toLocaleString()}`
                      )}
                    </span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>${finalTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Shipping Info */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <TruckIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Información de Envío</p>
                      <p className="text-blue-700 mt-1">
                        {cartSubtotal >= 50000 
                          ? 'Envío gratuito incluido'
                          : `Agrega $${(50000 - cartSubtotal).toLocaleString()} más para envío gratuito`
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Security Features */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Compra Segura</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCardIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Pago Protegido</span>
                  </div>
                </div>
                
                {/* Checkout Button */}
                <motion.button
                  onClick={handleCheckout}
                  disabled={processingOrder || cartItems.length === 0}
                  className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {processingOrder ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="loading-spinner w-5 h-5"></div>
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    'Proceder al Checkout'
                  )}
                </motion.button>
                
                {/* Continue Shopping */}
                <button
                  onClick={() => navigate('/products')}
                  className="w-full mt-4 btn-outline py-3"
                >
                  Continuar Comprando
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;