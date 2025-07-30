import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatCurrency } from '../../utils/formatters';
import './OrderConfirmation.css';

const OrderConfirmation = ({ orderData, onConfirm, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  
  const { cartItems, cartTotal, createOrder, clearCart } = useCart();
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirmOrder = async () => {
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.phone) {
      addNotification('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        shipping_address: `${shippingInfo.address}, ${shippingInfo.state}`,
        shipping_city: shippingInfo.city,
        shipping_postal_code: shippingInfo.zipCode,
        shipping_phone: shippingInfo.phone
      };

      const response = await createOrder(orderData);
      
      if (response) {
        addNotification(
          'Pedido creado exitosamente. Estado: Pendiente de confirmación', 
          'success'
        );
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      addNotification('Error al crear el pedido. Intenta nuevamente.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const shippingCost = 15000; // Costo fijo de envío
  const totalWithShipping = cartTotal + shippingCost;

  return (
    <div className="order-confirmation">
      <div className="order-confirmation-container">
        <h2>Confirmar Pedido</h2>
        
        {/* Resumen del pedido */}
        <div className="order-summary">
          <h3>Resumen del Pedido</h3>
          <div className="order-items">
            {cartItems.map(item => (
              <div key={item.id} className="order-item">
                <img 
                  src={item.product.images?.[0]?.image || '/placeholder.jpg'} 
                  alt={item.product.name}
                  className="item-image"
                />
                <div className="item-details">
                  <h4>{item.product.name}</h4>
                  {item.variant && (
                    <p className="variant-info">
                      {item.variant.color} - {item.variant.size}
                    </p>
                  )}
                  <p className="quantity">Cantidad: {item.quantity}</p>
                  <p className="price">{formatCurrency(item.product.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="order-totals">
            <div className="total-line">
              <span>Subtotal:</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="total-line">
              <span>Envío:</span>
              <span>{formatCurrency(shippingCost)}</span>
            </div>
            <div className="total-line total">
              <span>Total:</span>
              <span>{formatCurrency(totalWithShipping)}</span>
            </div>
          </div>
        </div>

        {/* Información de envío */}
        <div className="shipping-info">
          <h3>Información de Envío</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="address">Dirección *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={shippingInfo.address}
                onChange={handleInputChange}
                placeholder="Calle, número, apartamento"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="city">Ciudad *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={shippingInfo.city}
                onChange={handleInputChange}
                placeholder="Ciudad"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="state">Departamento</label>
              <input
                type="text"
                id="state"
                name="state"
                value={shippingInfo.state}
                onChange={handleInputChange}
                placeholder="Departamento"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="zipCode">Código Postal</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={shippingInfo.zipCode}
                onChange={handleInputChange}
                placeholder="Código postal"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Teléfono *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={shippingInfo.phone}
                onChange={handleInputChange}
                placeholder="Número de teléfono"
                required
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="notes">Notas adicionales</label>
              <textarea
                id="notes"
                name="notes"
                value={shippingInfo.notes}
                onChange={handleInputChange}
                placeholder="Instrucciones especiales para la entrega"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Método de pago */}
        <div className="payment-method">
          <h3>Método de Pago</h3>
          <div className="payment-options">
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="cash_on_delivery"
                checked={paymentMethod === 'cash_on_delivery'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-label">
                <strong>Pago Contra Entrega</strong>
                <small>Paga cuando recibas tu pedido</small>
              </span>
            </label>
            
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="bank_transfer"
                checked={paymentMethod === 'bank_transfer'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="payment-label">
                <strong>Transferencia Bancaria</strong>
                <small>Te enviaremos los datos bancarios</small>
              </span>
            </label>
          </div>
        </div>

        {/* Información importante */}
        <div className="order-info">
          <div className="info-box">
            <h4>📋 Información del Pedido</h4>
            <ul>
              <li>Tu pedido será creado con estado <strong>"Pendiente"</strong></li>
              <li>Recibirás una confirmación por email</li>
              <li>Nos pondremos en contacto contigo para confirmar la disponibilidad</li>
              <li>El tiempo de entrega es de 2-5 días hábiles</li>
              <li>Puedes seguir el estado de tu pedido en "Mis Pedidos"</li>
            </ul>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="order-actions">
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate('/cart')}
            disabled={isProcessing}
          >
            Volver al Carrito
          </button>
          
          <button 
            type="button" 
            className="btn-confirm"
            onClick={handleConfirmOrder}
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : 'Confirmar Pedido'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;