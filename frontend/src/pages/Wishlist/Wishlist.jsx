import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HeartIcon,
  ShoppingCartIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import ProductCard from '../../components/ProductCard';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { wishlist, clearWishlist, getWishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HeartIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Inicia sesión para ver tu lista de deseos
          </h2>
          <p className="text-gray-600 mb-6">
            Guarda tus productos favoritos para comprarlos más tarde
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-soft p-8">
            <div className="text-center">
              <HeartIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tu lista de deseos está vacía
              </h2>
              <p className="text-gray-600 mb-6">
                Explora nuestros productos y agrega tus favoritos aquí
              </p>
              <button
                onClick={() => navigate('/products')}
                className="btn-primary"
              >
                Explorar Productos
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddAllToCart = async () => {
    try {
      for (const product of wishlist) {
        await addToCart(product, 1);
      }
      toast.success(`${wishlist.length} productos agregados al carrito`);
    } catch (error) {
      toast.error('Error al agregar productos al carrito');
    }
  };

  const handleClearWishlist = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar tu lista de deseos?')) {
      clearWishlist();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-3">
                <HeartSolidIcon className="h-8 w-8 text-red-500" />
                Mi Lista de Deseos
              </h1>
              <p className="text-gray-600 mt-2">
                {getWishlistCount()} {getWishlistCount() === 1 ? 'producto' : 'productos'} en tu lista
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddAllToCart}
                className="btn-primary flex items-center justify-center gap-2"
                disabled={wishlist.length === 0}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                Agregar Todo al Carrito
              </button>
              
              <button
                onClick={handleClearWishlist}
                className="btn-secondary flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                disabled={wishlist.length === 0}
              >
                <TrashIcon className="h-5 w-5" />
                Limpiar Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {wishlist.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard
                product={product}
                viewMode="grid"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Wishlist;