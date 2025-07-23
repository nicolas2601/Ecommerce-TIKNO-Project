import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { api } from '../../lib/axios';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import ProductCard from '../../components/ProductCard';
import toast from 'react-hot-toast';

const Categories = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [filterOpen, setFilterOpen] = useState(false);

  const sortOptions = [
    { value: 'name', label: 'Nombre A-Z' },
    { value: '-name', label: 'Nombre Z-A' },
    { value: 'price', label: 'Precio: Menor a Mayor' },
    { value: '-price', label: 'Precio: Mayor a Menor' },
    { value: '-created_at', label: 'Más Recientes' },
    { value: 'created_at', label: 'Más Antiguos' }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (category) {
      fetchProductsByCategory();
    }
  }, [category, sortBy]);

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      setCategories(response.data.results || response.data);
      
      // Encontrar la categoría actual
      const current = response.data.results?.find(cat => 
        cat.slug === category || cat.name.toLowerCase() === category?.toLowerCase()
      );
      setCurrentCategory(current);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProductsByCategory = async () => {
    setLoading(true);
    try {
      const params = {
        category: category,
        ordering: sortBy
      };
      
      const response = await api.getProducts(params);
      setProducts(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (newCategory) => {
    navigate(`/categories/${newCategory.slug || newCategory.name.toLowerCase()}`);
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <button 
              onClick={() => navigate('/')}
              className="hover:text-gray-700 transition-colors"
            >
              Inicio
            </button>
            <ChevronRightIcon className="h-4 w-4" />
            <button 
              onClick={() => navigate('/products')}
              className="hover:text-gray-700 transition-colors"
            >
              Productos
            </button>
            <ChevronRightIcon className="h-4 w-4" />
            <span className="text-gray-900 font-medium">
              {currentCategory?.name || category}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categorías */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Categorías
              </h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      (cat.slug === category || cat.name.toLowerCase() === category?.toLowerCase())
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:w-3/4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentCategory?.name || category}
                </h1>
                <p className="text-gray-600 mt-1">
                  {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Filtros y ordenamiento */}
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <FunnelIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de productos */}
            {products.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {products.map((product) => (
                  <ProductCard 
                    key={product.id}
                    product={product} 
                    viewMode={viewMode}
                    wishlist={wishlist}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay productos en esta categoría
                </h3>
                <p className="text-gray-600 mb-6">
                  Explora otras categorías o vuelve más tarde.
                </p>
                <button
                  onClick={() => navigate('/products')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Ver todos los productos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;