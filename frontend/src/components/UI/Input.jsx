import React, { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };
  
  const variants = {
    default: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
    filled: 'bg-gray-50 border-gray-200 focus:bg-white focus:border-primary-500 focus:ring-primary-500',
    outlined: 'border-2 border-gray-300 focus:border-primary-500 focus:ring-0'
  };
  
  const baseClasses = `
    block w-full rounded-lg border transition-all duration-200
    placeholder-gray-400 focus:outline-none focus:ring-1
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : variants[variant]}
    ${sizes[size]}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon || type === 'password' ? 'pr-10' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();
  
  const iconClasses = 'absolute top-1/2 transform -translate-y-1/2 text-gray-400';
  
  return (
    <div className={fullWidth ? 'w-full' : 'inline-block'}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className={`${iconClasses} left-3`}>
            {leftIcon}
          </div>
        )}
        
        <motion.input
          ref={ref}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={baseClasses}
          animate={{
            scale: isFocused ? 1.01 : 1,
          }}
          transition={{ duration: 0.2 }}
          {...props}
        />
        
        {type === 'password' && (
          <button
            type="button"
            className={`${iconClasses} right-3 hover:text-gray-600 focus:outline-none`}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        )}
        
        {rightIcon && type !== 'password' && (
          <div className={`${iconClasses} right-3`}>
            {rightIcon}
          </div>
        )}
        
        {error && (
          <div className={`${iconClasses} right-3`}>
            <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2"
        >
          {error ? (
            <p className="text-sm text-red-600 flex items-center">
              <ExclamationCircleIcon className="w-4 h-4 mr-1" />
              {error}
            </p>
          ) : (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </motion.div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Componente de Textarea
export const Textarea = forwardRef(({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  rows = 4,
  resize = true,
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const baseClasses = `
    block w-full rounded-lg border border-gray-300 px-4 py-3 text-base
    placeholder-gray-400 focus:outline-none focus:ring-1 focus:border-primary-500 focus:ring-primary-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    transition-all duration-200
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
    ${!resize ? 'resize-none' : 'resize-vertical'}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();
  
  return (
    <div className={fullWidth ? 'w-full' : 'inline-block'}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <motion.textarea
        ref={ref}
        value={value}
        onChange={onChange}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={baseClasses}
        animate={{
          scale: isFocused ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
        {...props}
      />
      
      {(error || helperText) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2"
        >
          {error ? (
            <p className="text-sm text-red-600 flex items-center">
              <ExclamationCircleIcon className="w-4 h-4 mr-1" />
              {error}
            </p>
          ) : (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </motion.div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Componente de Select
export const Select = forwardRef(({
  label,
  options = [],
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  placeholder = 'Seleccionar...',
  className = '',
  ...props
}, ref) => {
  const baseClasses = `
    block w-full rounded-lg border border-gray-300 px-4 py-3 text-base
    focus:outline-none focus:ring-1 focus:border-primary-500 focus:ring-primary-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    transition-all duration-200
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();
  
  return (
    <div className={fullWidth ? 'w-full' : 'inline-block'}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        ref={ref}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={baseClasses}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {(error || helperText) && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2"
        >
          {error ? (
            <p className="text-sm text-red-600 flex items-center">
              <ExclamationCircleIcon className="w-4 h-4 mr-1" />
              {error}
            </p>
          ) : (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </motion.div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Input;