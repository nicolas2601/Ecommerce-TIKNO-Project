import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  StarIcon,
  ShoppingCartIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { api } from '../../lib/axios';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('min_price') || '',
    maxPrice: searchParams.get('max_price') || '',
    inStock: searchParams.get('in_stock') === 'true',
    featured: searchParams.get('featured') === 'true',
    rating: searchParams.get('rating') || ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      
      // Add filters to params
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.min_price = filters.minPrice;
      if (filters.maxPrice) params.max_price = filters.maxPrice;
      if (filters.inStock) params.in_stock = 'true';
      if (filters.featured) params.is_featured = 'true';
      if (filters.rating) params.min_rating = filters.rating;
      
      // Add sorting
      const orderPrefix = sortOrder === 'desc' ? '-' : '';
      params.ordering = `${orderPrefix}${sortBy}`;
      
      // Add pagination
      params.page = currentPage.toString();
      params.page_size = '12';
      
      const response = await api.getProducts(params);
      
      setProducts(response.data.results || response.data);
      setTotalPages(Math.ceil((response.data.count || response.data.length) / 12));
      setTotalCount(response.data.count || response.data.length);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key === 'search' ? 'q' : key, value.toString());
      }
    });
    if (sortBy !== 'name') params.set('sort', sortBy);
    if (sortOrder !== 'asc') params.set('order', sortOrder);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  }, [filters, sortBy, sortOrder, currentPage, setSearchParams]);

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      setCategories(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };



  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      featured: false,
      rating: ''
    });
    setCurrentPage(1);
  };

  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
  };

  const { toggleWishlist, isInWishlist } = useWishlist();

  const handleToggleWishlist = (product) => {
    toggleWishlist(product);
  };

  const sortOptions = [
    { value: 'name', label: 'Nombre' },
    { value: 'price', label: 'Precio' },
    { value: 'created_at', label: 'Más Recientes' },
    { value: 'average_rating', label: 'Mejor Valorados' },
    { value: 'popularity', label: 'Más Populares' }
  ];

  const ratingOptions = [
    { value: '', label: 'Todas las valoraciones' },
    { value: '4', label: '4+ estrellas' },
    { value: '3', label: '3+ estrellas' },
    { value: '2', label: '2+ estrellas' },
    { value: '1', label: '1+ estrellas' }
  ];

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">
                Productos
              </h1>
              <p className="text-gray-600 mt-2">
                {totalCount > 0 ? `${totalCount} productos encontrados` : 'Cargando productos...'}
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full btn-outline flex items-center justify-center space-x-2"
              >
                <FunnelIcon className="h-5 w-5" />
                <span>Filtros</span>
              </button>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {(showFilters || window.innerWidth >= 1024) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-lg shadow-soft p-6 space-y-6"
                >
                  {/* Filter Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Limpiar
                    </button>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="label">Categoría</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="input"
                    >
                      <option value="">Todas las categorías</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="label">Rango de Precio</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Mín"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="input"
                      />
                      <input
                        type="number"
                        placeholder="Máx"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="input"
                      />
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="label">Valoración</label>
                    <select
                      value={filters.rating}
                      onChange={(e) => handleFilterChange('rating', e.target.value)}
                      className="input"
                    >
                      {ratingOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Solo en stock</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.featured}
                        onChange={(e) => handleFilterChange('featured', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Productos destacados</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-soft p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Sort Options */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {sortOrder === 'asc' ? '↑ Ascendente' : '↓ Descendente'}
                  </button>
                </div>

                {/* View Mode */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md ${
                      viewMode === 'grid'
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${
                      viewMode === 'list'
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="loading-spinner w-12 h-12"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
                <p className="text-gray-500 mb-4">Intenta ajustar tus filtros de búsqueda</p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Limpiar Filtros
                </button>
              </div>
            ) : (
              <motion.div
                className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-6'
                }
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className={viewMode === 'grid' ? 'card-hover group' : 'card-hover group flex'}
                  >
                    {viewMode === 'grid' ? (
                      // Grid View
                      <>
                        <div className="relative overflow-hidden">
                          <img
                            src={product.main_image || product.main_image_url || (product.images && product.images.length > 0 ? product.images[0].image_url : null) || 'https://via.placeholder.com/300x300?text=Sin+Imagen'}
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
                              onClick={() => handleToggleWishlist(product)}
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
                            onClick={() => handleAddToCart(product)}
                            className="w-full btn-primary flex items-center justify-center space-x-2"
                            disabled={product.stock === 0}
                          >
                            <ShoppingCartIcon className="h-5 w-5" />
                            <span>{product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}</span>
                          </motion.button>
                        </div>
                      </>
                    ) : (
                      // List View
                      <>
                        <div className="w-48 flex-shrink-0 relative overflow-hidden">
                          <img
                            src={product.main_image || product.main_image_url || (product.images && product.images.length > 0 ? product.images[0].image_url : null) || 'https://via.placeholder.com/300x300?text=Sin+Imagen'}
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
                                onClick={() => handleToggleWishlist(product)}
                                className="p-2 text-gray-600 hover:text-red-500 transition-colors duration-200"
                              >
                                {isInWishlist(product.id) ? (
                                  <HeartSolidIcon className="h-5 w-5 text-red-500" />
                                ) : (
                                  <HeartIcon className="h-5 w-5" />
                                )}
                              </motion.button>
                          
                              
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAddToCart(product)}
                                className="btn-primary flex items-center space-x-2"
                                disabled={product.stock === 0}
                              >
                                <ShoppingCartIcon className="h-5 w-5" />
                                <span>{product.stock === 0 ? 'Agotado' : 'Agregar'}</span>
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === page
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;