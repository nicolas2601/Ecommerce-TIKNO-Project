import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { formatCurrency } from '../../utils/formatters';

const Card = ({
  children,
  className = '',
  hover = true,
  padding = 'md',
  shadow = 'md',
  rounded = 'lg',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };
  
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl'
  };
  
  const baseClasses = `
    bg-white border border-gray-200 transition-all duration-300
    ${paddingClasses[padding]}
    ${shadowClasses[shadow]}
    ${roundedClasses[rounded]}
    ${hover ? 'hover:shadow-lg hover:-translate-y-1' : ''}
    ${className}
  `.trim();
  
  const CardComponent = hover ? motion.div : 'div';
  const motionProps = hover ? {
    whileHover: { y: -4, scale: 1.02 },
    transition: { duration: 0.2 }
  } : {};
  
  return (
    <CardComponent
      className={baseClasses}
      {...motionProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

// Componente de tarjeta de producto
export const ProductCard = ({
  product,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  isInWishlist = false,
  className = ''
}) => {
  const {
    id,
    name,
    price,
    originalPrice,
    image,
    images = [],
    rating = 0,
    reviewCount = 0,
    discount,
    isNew,
    isFeatured,
    stock = 0,
    category
  } = product;
  
  const discountPercentage = originalPrice && price < originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : discount;
  
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-sm ${
          index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };
  
  return (
    <Card className={`group relative overflow-hidden ${className}`} hover>
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col space-y-2">
        {isNew && (
          <span className="badge bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Nuevo
          </span>
        )}
        {isFeatured && (
          <span className="badge bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
            Destacado
          </span>
        )}
        {discountPercentage > 0 && (
          <span className="badge bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            -{discountPercentage}%
          </span>
        )}
      </div>
      
      {/* Actions */}
      <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggleWishlist?.(product)}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
        >
          {isInWishlist ? (
            <HeartSolidIcon className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-gray-600" />
          )}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onQuickView?.(product)}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
        >
          <EyeIcon className="w-5 h-5 text-gray-600" />
        </motion.button>
      </div>
      
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg mb-4">
        <LazyLoadImage
          src={image || images[0]}
          alt={name}
          effect="blur"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhcmdhbmRvLi4uPC90ZXh0Pjwvc3ZnPg=="
        />
        
        {stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Agotado</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        {category && (
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {category}
          </p>
        )}
        
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {name}
        </h3>
        
        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center space-x-1">
            <div className="flex">
              {renderStars(rating)}
            </div>
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-500 line-through">
              {formatCurrency(originalPrice)}
            </span>
          )}
        </div>
        
        {/* Stock info */}
        {stock > 0 && stock <= 10 && (
          <p className="text-xs text-orange-600">
            ¡Solo quedan {stock} unidades!
          </p>
        )}
      </div>
      
      {/* Add to Cart Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onAddToCart?.(product)}
        disabled={stock === 0}
        className="w-full mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <ShoppingCartIcon className="w-4 h-4" />
        <span>{stock === 0 ? 'Agotado' : 'Agregar al Carrito'}</span>
      </motion.button>
    </Card>
  );
};

// Componente de tarjeta de categoría
export const CategoryCard = ({ category, onClick, className = '' }) => {
  const { name, image, productCount, description } = category;
  
  return (
    <Card 
      className={`cursor-pointer group ${className}`} 
      hover
      onClick={() => onClick?.(category)}
    >
      <div className="relative aspect-video overflow-hidden rounded-lg mb-4">
        <LazyLoadImage
          src={image}
          alt={name}
          effect="blur"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold mb-1">{name}</h3>
          <p className="text-sm opacity-90">{productCount} productos</p>
        </div>
      </div>
      
      {description && (
        <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
      )}
    </Card>
  );
};

// Componente de tarjeta de estadística
export const StatCard = ({ title, value, icon, trend, trendValue, className = '' }) => {
  return (
    <Card className={`${className}`} shadow="lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm flex items-center ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="mr-1">
                {trend === 'up' ? '↗' : '↘'}
              </span>
              {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-primary-100 rounded-full">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;