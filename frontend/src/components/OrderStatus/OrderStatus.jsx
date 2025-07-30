import React from 'react';
import {
  ClockIcon,
  CogIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import './OrderStatus.css';

const OrderStatus = ({ status, size = 'md', showText = true }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: ClockIcon,
          text: 'Pendiente',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          description: 'Tu pedido está siendo revisado'
        };
      case 'processing':
        return {
          icon: CogIcon,
          text: 'Procesando',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          description: 'Estamos preparando tu pedido'
        };
      case 'shipped':
        return {
          icon: TruckIcon,
          text: 'Enviado',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          borderColor: 'border-purple-200',
          description: 'Tu pedido está en camino'
        };
      case 'delivered':
        return {
          icon: CheckCircleIcon,
          text: 'Entregado',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          description: 'Tu pedido ha sido entregado'
        };
      case 'cancelled':
        return {
          icon: XCircleIcon,
          text: 'Cancelado',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          description: 'Este pedido ha sido cancelado'
        };
      default:
        return {
          icon: ClockIcon,
          text: 'Desconocido',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          description: 'Estado desconocido'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'h-3 w-3',
      text: 'text-xs'
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'h-4 w-4',
      text: 'text-sm'
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'h-5 w-5',
      text: 'text-base'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="order-status-wrapper">
      <div 
        className={`
          order-status-badge inline-flex items-center gap-2 rounded-full border font-medium
          ${config.color} ${config.bgColor} ${config.borderColor}
          ${currentSize.container}
        `}
        title={config.description}
      >
        <Icon className={`${currentSize.icon} ${config.color}`} />
        {showText && (
          <span className={currentSize.text}>
            {config.text}
          </span>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;