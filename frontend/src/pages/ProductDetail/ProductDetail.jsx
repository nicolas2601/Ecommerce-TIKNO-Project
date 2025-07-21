import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { api } from '../../lib/axios';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showImageModal, setShowImageModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.getProduct(id);
      setProduct(response.data);
      
      // Fetch related products
      if (response.data.category) {
        const relatedResponse = await api.getProducts({
          category: response.data.category.slug,
          exclude: id,
          limit: 4
        });
        setRelatedProducts(relatedResponse.data.results || relatedResponse.data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Error al cargar el producto');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.getProductReviews(id);
      setReviews(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleAddToCart = async () => {
    await addToCart(product, quantity);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const toggleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para agregar a favoritos');
      return;
    }
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Eliminado de favoritos' : 'Agregado a favoritos');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para escribir una reseña');
      return;
    }

    try {
      await api.createProductReview(id, newReview);
      toast.success('Reseña enviada exitosamente');
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
      fetchReviews();
    } catch (error) {
      toast.error('Error al enviar la reseña');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h2>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Volver a productos
          </button>
        </div>
      </div>
    );
  }

  const images = product.images || [{ image_url: product.main_image_url }];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700">
              Inicio
            </button>
            <span className="text-gray-400">/</span>
            <button onClick={() => navigate('/products')} className="text-gray-500 hover:text-gray-700">
              Productos
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div 
              className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-soft cursor-pointer"
              onClick={() => setShowImageModal(true)}
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={images[selectedImageIndex]?.image_url || product.main_image_url || product.get_main_image_url || 'https://via.placeholder.com/600x600?text=Sin+Imagen'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x600?text=Sin+Imagen';
                }}
              />
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1);
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-medium hover:bg-white transition-colors duration-200"
                  >
                    <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow-medium hover:bg-white transition-colors duration-200"
                  >
                    <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                  </button>
                </>
              )}
              
              {/* Zoom Icon */}
              <div className="absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center">
                <PhotoIcon className="h-5 w-5 text-gray-600" />
              </div>
            </motion.div>
            
            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImageIndex === index
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={image.image_url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarSolidIcon
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.average_rating || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.average_rating?.toFixed(1) || '0.0'} ({product.review_count || 0} reseñas)
                </span>
              </div>
              
              {/* Price */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${product.price?.toLocaleString()}
                </span>
                {product.original_price && product.original_price > product.price && (
                  <>
                    <span className="text-2xl text-gray-500 line-through">
                      ${product.original_price.toLocaleString()}
                    </span>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                product.stock > 10 ? 'text-green-700' : product.stock > 0 ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {product.stock > 10 ? 'En stock' : product.stock > 0 ? `Solo ${product.stock} disponibles` : 'Agotado'}
              </span>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Cantidad:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 btn-primary flex items-center justify-center space-x-2 py-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span>{product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}</span>
              </motion.button>
              
              <motion.button
                onClick={toggleWishlist}
                className={`px-6 py-4 border-2 rounded-lg font-medium transition-all duration-200 ${
                  isWishlisted
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isWishlisted ? (
                  <HeartSolidIcon className="h-6 w-6" />
                ) : (
                  <HeartIcon className="h-6 w-6" />
                )}
              </motion.button>
              
              <motion.button
                onClick={handleShare}
                className="px-6 py-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-gray-400 transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShareIcon className="h-6 w-6" />
              </motion.button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-3">
                <TruckIcon className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Envío gratis</p>
                  <p className="text-xs text-gray-500">En compras +$50.000</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Garantía</p>
                  <p className="text-xs text-gray-500">12 meses</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <ArrowPathIcon className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Devoluciones</p>
                  <p className="text-xs text-gray-500">30 días</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Descripción' },
                { id: 'specifications', label: 'Especificaciones' },
                { id: 'reviews', label: `Reseñas (${reviews.length})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="prose max-w-none"
                >
                  <p className="text-gray-700 leading-relaxed">
                    {product.description || 'No hay descripción disponible para este producto.'}
                  </p>
                </motion.div>
              )}

              {activeTab === 'specifications' && (
                <motion.div
                  key="specifications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Información General</h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Categoría:</dt>
                          <dd className="font-medium">{product.category?.name}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">SKU:</dt>
                          <dd className="font-medium">{product.sku || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Stock:</dt>
                          <dd className="font-medium">{product.stock} unidades</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Peso:</dt>
                          <dd className="font-medium">{product.weight || 'N/A'}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    {product.specifications && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Especificaciones Técnicas</h4>
                        <dl className="space-y-2">
                          {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <dt className="text-gray-600 capitalize">{key.replace('_', ' ')}:</dt>
                              <dd className="font-medium">{value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Review Summary */}
                  <div className="bg-white rounded-lg p-6 shadow-soft">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          {product.average_rating?.toFixed(1) || '0.0'}
                        </div>
                        <div className="flex items-center justify-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <StarSolidIcon
                              key={i}
                              className={`h-6 w-6 ${
                                i < Math.floor(product.average_rating || 0)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600">{product.review_count || 0} reseñas</p>
                      </div>
                      
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = reviews.filter(r => Math.floor(r.rating) === rating).length;
                          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                          
                          return (
                            <div key={rating} className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600 w-8">{rating}★</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-8">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Write Review Button */}
                  {isAuthenticated && (
                    <div className="text-center">
                      <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="btn-primary flex items-center space-x-2 mx-auto"
                      >
                        <ChatBubbleLeftRightIcon className="h-5 w-5" />
                        <span>Escribir Reseña</span>
                      </button>
                    </div>
                  )}

                  {/* Review Form */}
                  <AnimatePresence>
                    {showReviewForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white rounded-lg p-6 shadow-soft"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Escribir Reseña</h3>
                        <form onSubmit={submitReview} className="space-y-4">
                          <div>
                            <label className="label">Calificación</label>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  type="button"
                                  onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                                  className="p-1"
                                >
                                  <StarSolidIcon
                                    className={`h-6 w-6 ${
                                      rating <= newReview.rating
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <label className="label">Comentario</label>
                            <textarea
                              value={newReview.comment}
                              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                              rows={4}
                              className="input"
                              placeholder="Comparte tu experiencia con este producto..."
                              required
                            />
                          </div>
                          
                          <div className="flex space-x-4">
                            <button type="submit" className="btn-primary">
                              Enviar Reseña
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowReviewForm(false)}
                              className="btn-outline"
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reseñas aún</h3>
                        <p className="text-gray-500">Sé el primero en reseñar este producto</p>
                      </div>
                    ) : (
                      reviews.map((review) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-lg p-6 shadow-soft"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-primary-600 font-medium">
                                  {review.user?.first_name?.[0] || review.user?.username?.[0] || 'U'}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {review.user?.first_name || review.user?.username || 'Usuario'}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <StarSolidIcon
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < Math.floor(review.rating)
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {formatDate(review.created_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-8">Productos Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <motion.div
                  key={relatedProduct.id}
                  className="card-hover group cursor-pointer"
                  onClick={() => navigate(`/products/${relatedProduct.id}`)}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={relatedProduct.main_image_url || '/api/placeholder/300/300'}
                      alt={relatedProduct.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200">
                      {relatedProduct.name}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        ${relatedProduct.price?.toLocaleString()}
                      </span>
                      
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(relatedProduct.average_rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[selectedImageIndex]?.image_url || product.main_image_url}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
              />
              
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;