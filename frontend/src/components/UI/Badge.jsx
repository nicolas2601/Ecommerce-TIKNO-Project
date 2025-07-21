import React from 'react';
import { motion } from 'framer-motion';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = true,
  className = '',
  ...props
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    dark: 'bg-gray-800 text-white',
    light: 'bg-white text-gray-800 border border-gray-200'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };
  
  const baseClasses = `
    inline-flex items-center font-medium
    ${variants[variant]}
    ${sizes[size]}
    ${rounded ? 'rounded-full' : 'rounded'}
    ${className}
  `.trim();
  
  return (
    <span className={baseClasses} {...props}>
      {children}
    </span>
  );
};

// Badge con animación
export const AnimatedBadge = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', duration: 0.3 }}
    >
      <Badge {...props}>{children}</Badge>
    </motion.div>
  );
};

// Badge con punto de notificación
export const NotificationBadge = ({
  count,
  max = 99,
  showZero = false,
  dot = false,
  className = '',
  children
}) => {
  const displayCount = count > max ? `${max}+` : count;
  const shouldShow = showZero || count > 0;
  
  if (!shouldShow) return children;
  
  return (
    <div className="relative inline-block">
      {children}
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`
          absolute -top-2 -right-2 flex items-center justify-center
          ${dot ? 'w-3 h-3' : 'min-w-[1.25rem] h-5 px-1'}
          bg-red-500 text-white text-xs font-bold rounded-full
          ${className}
        `}
      >
        {!dot && displayCount}
      </motion.span>
    </div>
  );
};

// Badge de estado
export const StatusBadge = ({ status, className = '' }) => {
  const statusConfig = {
    active: { variant: 'success', text: 'Activo' },
    inactive: { variant: 'error', text: 'Inactivo' },
    pending: { variant: 'warning', text: 'Pendiente' },
    completed: { variant: 'success', text: 'Completado' },
    cancelled: { variant: 'error', text: 'Cancelado' },
    processing: { variant: 'info', text: 'Procesando' },
    shipped: { variant: 'primary', text: 'Enviado' },
    delivered: { variant: 'success', text: 'Entregado' },
    returned: { variant: 'warning', text: 'Devuelto' },
    refunded: { variant: 'info', text: 'Reembolsado' }
  };
  
  const config = statusConfig[status] || { variant: 'default', text: status };
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.text}
    </Badge>
  );
};

// Badge con icono
export const IconBadge = ({ icon, children, iconPosition = 'left', ...props }) => {
  return (
    <Badge {...props}>
      {iconPosition === 'left' && icon && (
        <span className="mr-1">{icon}</span>
      )}
      {children}
      {iconPosition === 'right' && icon && (
        <span className="ml-1">{icon}</span>
      )}
    </Badge>
  );
};

// Badge removible
export const RemovableBadge = ({ children, onRemove, ...props }) => {
  return (
    <Badge {...props}>
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </Badge>
  );
};

export default Badge;