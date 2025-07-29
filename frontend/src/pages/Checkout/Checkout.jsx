import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCardIcon,
  MapPinIcon,
  TruckIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XMarkIcon,
  LockClosedIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatCurrency } from '../../utils/formatters';

const Checkout = () => {
  const { cartItems, cartTotal, applyCoupon, removeCoupon, couponDiscount, createOrder, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  const [shippingInfo, setShippingInfo] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: '',
    postal_code: '',
    country: user?.country || 'Colombia',
    company: '',
    apartment: ''
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'card',
    card_number: '',
    card_name: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    save_card: false
  });
  
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [couponCode, setCouponCode] = useState('');
  const [errors, setErrors] = useState({});
  const [guestCheckout, setGuestCheckout] = useState(!isAuthenticated);

  const shippingMethods = [
    {
      id: 'standard',
      name: 'Envío Estándar',
      description: '5-7 días hábiles',
      price: 15000,
      icon: TruckIcon
    },
    {
      id: 'express',
      name: 'Envío Express',
      description: '2-3 días hábiles',
      price: 25000,
      icon: TruckIcon
    },
    {
      id: 'overnight',
      name: 'Envío Nocturno',
      description: '1 día hábil',
      price: 45000,
      icon: TruckIcon
    }
  ];

  const paymentMethods = [
    {
      id: 'card',
      name: 'Tarjeta de Crédito/Débito',
      description: 'Visa, Mastercard, American Express',
      icon: CreditCardIcon
    },
    {
      id: 'pse',
      name: 'PSE',
      description: 'Pago Seguro en Línea',
      icon: BuildingOfficeIcon
    },
    {
      id: 'cash',
      name: 'Pago Contra Entrega',
      description: 'Paga cuando recibas tu pedido',
      icon: GiftIcon
    }
  ];

  useEffect(() => {
    if (cartItems.length === 0 && !orderComplete) {
      navigate('/cart');
    }
  }, [cartItems, navigate, orderComplete]);

  const getSelectedShippingMethod = () => {
    return shippingMethods.find(method => method.id === shippingMethod);
  };

  const calculateTotal = () => {
    const subtotal = cartTotal;
    const shipping = getSelectedShippingMethod()?.price || 0;
    const tax = subtotal * 0.19; // IVA 19%
    const discount = couponDiscount || 0;
    const total = subtotal + shipping + tax - discount;
    
    return {
      subtotal,
      shipping,
      tax,
      discount,
      total: Math.max(0, total)
    };
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      // Validate shipping information
      if (!shippingInfo.first_name.trim()) newErrors.first_name = 'Nombre requerido';
      if (!shippingInfo.last_name.trim()) newErrors.last_name = 'Apellido requerido';
      if (!shippingInfo.email.trim()) newErrors.email = 'Email requerido';
      if (!shippingInfo.phone.trim()) newErrors.phone = 'Teléfono requerido';
      if (!shippingInfo.address.trim()) newErrors.address = 'Dirección requerida';
      if (!shippingInfo.city.trim()) newErrors.city = 'Ciudad requerida';
      if (!shippingInfo.postal_code.trim()) newErrors.postal_code = 'Código postal requerido';
      
      if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
        newErrors.email = 'Email inválido';
      }
    }
    
    if (step === 3 && paymentInfo.method === 'card') {
      // Validate payment information
      if (!paymentInfo.card_number.trim()) newErrors.card_number = 'Número de tarjeta requerido';
      if (!paymentInfo.card_name.trim()) newErrors.card_name = 'Nombre en la tarjeta requerido';
      if (!paymentInfo.expiry_month) newErrors.expiry_month = 'Mes de vencimiento requerido';
      if (!paymentInfo.expiry_year) newErrors.expiry_year = 'Año de vencimiento requerido';
      if (!paymentInfo.cvv.trim()) newErrors.cvv = 'CVV requerido';
      
      // Basic card number validation
      const cardNumber = paymentInfo.card_number.replace(/\s/g, '');
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        newErrors.card_number = 'Número de tarjeta inválido';
      }
      
      if (paymentInfo.cvv.length < 3 || paymentInfo.cvv.length > 4) {
        newErrors.cvv = 'CVV inválido';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (e, section) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    if (section === 'shipping') {
      setShippingInfo(prev => ({ ...prev, [name]: newValue }));
    } else if (section === 'payment') {
      setPaymentInfo(prev => ({ ...prev, [name]: newValue }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCouponApply = async () => {
    if (!couponCode.trim()) {
      addNotification('Ingresa un código de cupón', 'error');
      return;
    }
    
    try {
      await applyCoupon(couponCode);
      addNotification('Cupón aplicado exitosamente', 'success');
      setCouponCode('');
    } catch (error) {
      addNotification('Código de cupón inválido', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateStep(3)) {
      return;
    }
    
    try {
      setLoading(true);
      
      const orderData = {
        shipping_info: shippingInfo,
        payment_info: paymentInfo,
        shipping_method: shippingMethod,
        items: cartItems,
        totals: calculateTotal()
      };
      
      const order = await createOrder(orderData);
      setOrderId(order.id);
      setOrderComplete(true);
      setCurrentStep(4);
      clearCart();
      
      addNotification('¡Pedido realizado exitosamente!', 'success');
    } catch (error) {
      addNotification('Error al procesar el pedido', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const steps = [
    { id: 1, name: 'Información de Envío', icon: MapPinIcon },
    { id: 2, name: 'Método de Envío', icon: TruckIcon },
    { id: 3, name: 'Pago', icon: CreditCardIcon },
    { id: 4, name: 'Confirmación', icon: CheckCircleIcon }
  ];

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : isActive
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {isCompleted ? (
                  <CheckCircleIcon className="w-6 h-6" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div className={`w-full h-0.5 mx-4 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-between mt-2">
        {steps.map((step) => (
          <div key={step.id} className="text-xs text-center text-gray-600 max-w-24">
            {step.name}
          </div>
        ))}
      </div>
    </div>
  );

  const renderShippingStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Información de Envío</h2>
        
        {!isAuthenticated && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="guest-checkout"
                checked={guestCheckout}
                onChange={(e) => setGuestCheckout(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="guest-checkout" className="text-sm text-gray-700">
                Continuar como invitado
              </label>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Nombre *</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="first_name"
                value={shippingInfo.first_name}
                onChange={(e) => handleInputChange(e, 'shipping')}
                className={`input pl-10 ${errors.first_name ? 'border-red-500' : ''}`}
                placeholder="Tu nombre"
              />
            </div>
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
            )}
          </div>
          
          <div>
            <label className="label">Apellido *</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="last_name"
                value={shippingInfo.last_name}
                onChange={(e) => handleInputChange(e, 'shipping')}
                className={`input pl-10 ${errors.last_name ? 'border-red-500' : ''}`}
                placeholder="Tu apellido"
              />
            </div>
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
            )}
          </div>
          
          <div>
            <label className="label">Email *</label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={shippingInfo.email}
                onChange={(e) => handleInputChange(e, 'shipping')}
                className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="tu@email.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label className="label">Teléfono *</label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={shippingInfo.phone}
                onChange={(e) => handleInputChange(e, 'shipping')}
                className={`input pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="+57 300 123 4567"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
          
          <div>
            <label className="label">Empresa (Opcional)</label>
            <input
              type="text"
              name="company"
              value={shippingInfo.company}
              onChange={(e) => handleInputChange(e, 'shipping')}
              className="input"
              placeholder="Nombre de la empresa"
            />
          </div>
          
          <div>
            <label className="label">País *</label>
            <select
              name="country"
              value={shippingInfo.country}
              onChange={(e) => handleInputChange(e, 'shipping')}
              className="input"
            >
              <option value="Colombia">Colombia</option>
              <option value="México">México</option>
              <option value="Argentina">Argentina</option>
              <option value="Chile">Chile</option>
              <option value="Perú">Perú</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="label">Dirección *</label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="address"
                value={shippingInfo.address}
                onChange={(e) => handleInputChange(e, 'shipping')}
                className={`input pl-10 ${errors.address ? 'border-red-500' : ''}`}
                placeholder="Calle, número, barrio"
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>
          
          <div>
            <label className="label">Apartamento/Suite (Opcional)</label>
            <input
              type="text"
              name="apartment"
              value={shippingInfo.apartment}
              onChange={(e) => handleInputChange(e, 'shipping')}
              className="input"
              placeholder="Apt, suite, etc."
            />
          </div>
          
          <div>
            <label className="label">Ciudad *</label>
            <input
              type="text"
              name="city"
              value={shippingInfo.city}
              onChange={(e) => handleInputChange(e, 'shipping')}
              className={`input ${errors.city ? 'border-red-500' : ''}`}
              placeholder="Tu ciudad"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>
          
          <div>
            <label className="label">Estado/Departamento</label>
            <input
              type="text"
              name="state"
              value={shippingInfo.state}
              onChange={(e) => handleInputChange(e, 'shipping')}
              className="input"
              placeholder="Estado o departamento"
            />
          </div>
          
          <div>
            <label className="label">Código Postal *</label>
            <input
              type="text"
              name="postal_code"
              value={shippingInfo.postal_code}
              onChange={(e) => handleInputChange(e, 'shipping')}
              className={`input ${errors.postal_code ? 'border-red-500' : ''}`}
              placeholder="12345"
            />
            {errors.postal_code && (
              <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderShippingMethodStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Método de Envío</h2>
        
        <div className="space-y-4">
          {shippingMethods.map((method) => {
            const Icon = method.icon;
            return (
              <label
                key={method.id}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  shippingMethod === method.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="shipping_method"
                  value={method.id}
                  checked={shippingMethod === method.id}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="sr-only"
                />
                
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`p-2 rounded-lg ${
                    shippingMethod === method.id ? 'bg-primary-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      shippingMethod === method.id ? 'text-primary-600' : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                  
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(method.price)}
                    </span>
                  </div>
                </div>
                
                <div className={`ml-4 w-4 h-4 rounded-full border-2 ${
                  shippingMethod === method.id
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                }`}>
                  {shippingMethod === method.id && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </motion.div>
  );

  const renderPaymentStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Método de Pago</h2>
        
        <div className="space-y-4 mb-6">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <label
                key={method.id}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentInfo.method === method.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={method.id}
                  checked={paymentInfo.method === method.id}
                  onChange={(e) => setPaymentInfo(prev => ({ ...prev, method: e.target.value }))}
                  className="sr-only"
                />
                
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`p-2 rounded-lg ${
                    paymentInfo.method === method.id ? 'bg-primary-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      paymentInfo.method === method.id ? 'text-primary-600' : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
                
                <div className={`w-4 h-4 rounded-full border-2 ${
                  paymentInfo.method === method.id
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300'
                }`}>
                  {paymentInfo.method === method.id && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                  )}
                </div>
              </label>
            );
          })}
        </div>
        
        {paymentInfo.method === 'card' && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="label">Número de Tarjeta *</label>
              <input
                type="text"
                name="card_number"
                value={paymentInfo.card_number}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  setPaymentInfo(prev => ({ ...prev, card_number: formatted }));
                }}
                className={`input ${errors.card_number ? 'border-red-500' : ''}`}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
              {errors.card_number && (
                <p className="mt-1 text-sm text-red-600">{errors.card_number}</p>
              )}
            </div>
            
            <div>
              <label className="label">Nombre en la Tarjeta *</label>
              <input
                type="text"
                name="card_name"
                value={paymentInfo.card_name}
                onChange={(e) => handleInputChange(e, 'payment')}
                className={`input ${errors.card_name ? 'border-red-500' : ''}`}
                placeholder="JUAN PÉREZ"
              />
              {errors.card_name && (
                <p className="mt-1 text-sm text-red-600">{errors.card_name}</p>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Mes *</label>
                <select
                  name="expiry_month"
                  value={paymentInfo.expiry_month}
                  onChange={(e) => handleInputChange(e, 'payment')}
                  className={`input ${errors.expiry_month ? 'border-red-500' : ''}`}
                >
                  <option value="">Mes</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                {errors.expiry_month && (
                  <p className="mt-1 text-sm text-red-600">{errors.expiry_month}</p>
                )}
              </div>
              
              <div>
                <label className="label">Año *</label>
                <select
                  name="expiry_year"
                  value={paymentInfo.expiry_year}
                  onChange={(e) => handleInputChange(e, 'payment')}
                  className={`input ${errors.expiry_year ? 'border-red-500' : ''}`}
                >
                  <option value="">Año</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
                {errors.expiry_year && (
                  <p className="mt-1 text-sm text-red-600">{errors.expiry_year}</p>
                )}
              </div>
              
              <div>
                <label className="label">CVV *</label>
                <input
                  type="text"
                  name="cvv"
                  value={paymentInfo.cvv}
                  onChange={(e) => handleInputChange(e, 'payment')}
                  className={`input ${errors.cvv ? 'border-red-500' : ''}`}
                  placeholder="123"
                  maxLength={4}
                />
                {errors.cvv && (
                  <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="save-card"
                name="save_card"
                checked={paymentInfo.save_card}
                onChange={(e) => handleInputChange(e, 'payment')}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="save-card" className="text-sm text-gray-700">
                Guardar esta tarjeta para futuras compras
              </label>
            </div>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-800 font-medium">
              Tu información de pago está protegida con encriptación SSL de 256 bits
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderConfirmationStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="card">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Pedido Confirmado!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Tu pedido #{orderId} ha sido procesado exitosamente.
            Recibirás un email de confirmación en breve.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <EnvelopeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Confirmación por Email</h3>
              <p className="text-sm text-gray-600">Te enviaremos los detalles</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <TruckIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Preparando Envío</h3>
              <p className="text-sm text-gray-600">Procesaremos tu pedido</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <GiftIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Entrega</h3>
              <p className="text-sm text-gray-600">Recibirás tu pedido pronto</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/profile?tab=orders')}
              className="btn-primary"
            >
              Ver Mis Pedidos
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-outline"
            >
              Continuar Comprando
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderOrderSummary = () => {
    const totals = calculateTotal();
    
    return (
      <div className="card sticky top-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h3>
        
        <div className="space-y-4 mb-6">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </h4>
                <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        
        {currentStep < 4 && (
          <div className="mb-6">
            <div className="flex space-x-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Código de cupón"
                className="input flex-1"
              />
              <button
                onClick={handleCouponApply}
                className="btn-secondary whitespace-nowrap"
              >
                Aplicar
              </button>
            </div>
            
            {couponDiscount > 0 && (
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-green-600">Cupón aplicado</span>
                <button
                  onClick={removeCoupon}
                  className="text-red-600 hover:text-red-700"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{formatCurrency(totals.subtotal)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Envío</span>
            <span className="text-gray-900">{formatCurrency(totals.shipping)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">IVA (19%)</span>
            <span className="text-gray-900">{formatCurrency(totals.tax)}</span>
          </div>
          
          {totals.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Descuento</span>
              <span>-{formatCurrency(totals.discount)}</span>
            </div>
          )}
          
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>
        
        {currentStep < 4 && (
          <div className="mt-6 space-y-3">
            {currentStep === 3 ? (
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full btn-primary py-3 text-lg font-semibold"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="loading-spinner w-5 h-5"></div>
                    <span>Procesando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <LockClosedIcon className="w-5 h-5" />
                    <span>Confirmar Pedido</span>
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full btn-primary py-3 text-lg font-semibold"
              >
                Continuar
              </button>
            )}
            
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="w-full btn-outline"
              >
                Regresar
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderShippingStep();
      case 2:
        return renderShippingMethodStep();
      case 3:
        return renderPaymentStep();
      case 4:
        return renderConfirmationStep();
      default:
        return renderShippingStep();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Completa tu compra de forma segura</p>
        </div>
        
        {renderStepIndicator()}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </div>
          
          <div className="lg:col-span-1">
            {renderOrderSummary()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;