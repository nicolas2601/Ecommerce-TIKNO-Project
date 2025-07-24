import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNotifications } from '../contexts/NotificationContext';

const ProductCard = ({ 
  product, 
  viewMode = 'grid'
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addNotification } = useNotifications();
  const { isAuthenticated } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = async () => {
    await addToCart(product, 1);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
  };

  const getImageUrl = () => {
    return product.main_image || 
           product.main_image_url || 
           (product.images && product.images.length > 0 ? product.images[0].image_url : null) || 
           'https://via.placeholder.com/300x300?text=Sin+Imagen';
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ y: -5 }}
        className="card-hover group flex"
      >
        <div className="w-48 flex-shrink-0 relative overflow-hidden">
          <img
            src={getImageUrl()}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x300?text=Sin+Imagen';
            }}
          />
          
          {/* Discount Badge */}
          {product.discount_percentage > 0 && (
            <div className="absolute top-4 left-4">
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
                -{product.discount_percentage}%
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
              {product.name}
            </h3>
            
            <p className="text-gray-600 mb-4 line-clamp-2">
              {product.description}
            </p>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.average_rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-2">
                ({product.review_count || 0})
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            {/* Price */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                ${product.price?.toLocaleString()}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-lg text-gray-500 line-through">
                  ${product.original_price.toLocaleString()}
                </span>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleToggleWishlist}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-medium hover:shadow-large transition-shadow duration-200"
              >
                {isInWishlist(product.id) ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5 text-gray-600" />
                )}
              </motion.button>
              

              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="btn-primary flex items-center space-x-2 px-4 py-2"
                disabled={product.stock === 0}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span>{product.stock === 0 ? 'Agotado' : 'Agregar'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid View
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="card-hover group"
    >
      <div className="relative overflow-hidden">
        <img
          src={getImageUrl()}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300?text=Sin+Imagen';
          }}
        />
        
        {/* Product Actions */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleWishlist}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-medium hover:shadow-large transition-shadow duration-200"
          >
            {isInWishlist(product.id) ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600" />
            )}
          </motion.button>
          

        </div>
        
        {/* Discount Badge */}
        {product.discount_percentage > 0 && (
          <div className="absolute top-4 left-4">
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
              -{product.discount_percentage}%
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.average_rating || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">
            ({product.review_count || 0})
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              ${product.price?.toLocaleString()}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-lg text-gray-500 line-through">
                ${product.original_price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          className="w-full btn-primary flex items-center justify-center space-x-2"
          disabled={product.stock === 0}
        >
          <ShoppingCartIcon className="h-5 w-5" />
          <span>{product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;