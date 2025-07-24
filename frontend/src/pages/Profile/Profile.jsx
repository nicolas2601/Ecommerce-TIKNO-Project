import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ShoppingBagIcon,
  HeartIcon,
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser, changePassword, logout } = useAuth();
  const { wishlist, getWishlistCount, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    bio: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    reviews: 0,
    totalSpent: 0
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        bio: user.bio || ''
      });
      
      // Obtener estadísticas reales del usuario
      setStats({
        orders: Math.floor(Math.random() * 20) + 1, // TODO: Obtener de API real
        wishlist: getWishlistCount(),
        reviews: Math.floor(Math.random() * 10) + 1, // TODO: Obtener de API real
        totalSpent: Math.floor(Math.random() * 5000) + 500 // TODO: Obtener de API real
      });
    }
  }, [user, getWishlistCount]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await updateUser(profileData);
      setIsEditing(false);
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Error al actualizar el perfil';
      toast.error(errorMessage);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    try {
      setLoading(true);
      await changePassword(passwordData.current_password, passwordData.new_password);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setShowPasswordForm(false);
      toast.success('Contraseña actualizada exitosamente');
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Error al cambiar la contraseña';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, type = 'profile') => {
    const { name, value } = e.target;
    
    if (type === 'profile') {
      setProfileData(prev => ({ ...prev, [name]: value }));
    } else {
      setPasswordData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: UserIcon },
    { id: 'orders', name: 'Pedidos', icon: ShoppingBagIcon },
    { id: 'wishlist', name: 'Lista de Deseos', icon: HeartIcon },
    { id: 'settings', name: 'Configuración', icon: CogIcon },
    { id: 'security', name: 'Seguridad', icon: ShieldCheckIcon }
  ];

  const renderProfileTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <UserIcon className="w-12 h-12" />
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white text-primary-600 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
              <CameraIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-white/80 mb-4">{user?.email}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.orders}</div>
                <div className="text-sm text-white/80">Pedidos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.wishlist}</div>
                <div className="text-sm text-white/80">Favoritos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.reviews}</div>
                <div className="text-sm text-white/80">Reseñas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">${stats.totalSpent.toLocaleString()}</div>
                <div className="text-sm text-white/80">Total Gastado</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Editar</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="btn-outline flex items-center space-x-2"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Nombre</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input pl-10"
                  placeholder="Tu nombre"
                />
              </div>
            </div>

            <div>
              <label className="label">Apellido</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input pl-10"
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input pl-10"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="label">Teléfono</label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input pl-10"
                  placeholder="+57 300 123 4567"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="label">Dirección</label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input pl-10"
                  placeholder="Tu dirección completa"
                />
              </div>
            </div>

            <div>
              <label className="label">Ciudad</label>
              <input
                type="text"
                name="city"
                value={profileData.city}
                onChange={handleChange}
                disabled={!isEditing}
                className="input"
                placeholder="Tu ciudad"
              />
            </div>

            <div>
              <label className="label">País</label>
              <input
                type="text"
                name="country"
                value={profileData.country}
                onChange={handleChange}
                disabled={!isEditing}
                className="input"
                placeholder="Tu país"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Biografía</label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                rows={3}
                className="input"
                placeholder="Cuéntanos un poco sobre ti..."
              />
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-2"
              >
                {loading ? (
                  <div className="loading-spinner w-4 h-4" />
                ) : (
                  <CheckIcon className="w-4 h-4" />
                )}
                <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );

  const renderSecurityTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Seguridad de la Cuenta</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Contraseña</h3>
              <p className="text-sm text-gray-600">Última actualización hace 30 días</p>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="btn-secondary"
            >
              Cambiar
            </button>
          </div>

          <AnimatePresence>
            {showPasswordForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border rounded-lg p-6"
              >
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="label">Contraseña Actual</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        name="current_password"
                        value={passwordData.current_password}
                        onChange={(e) => handleChange(e, 'password')}
                        className="input pr-10"
                        placeholder="Tu contraseña actual"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPasswords.current ? (
                          <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="label">Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={(e) => handleChange(e, 'password')}
                        className="input pr-10"
                        placeholder="Tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPasswords.new ? (
                          <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="label">Confirmar Nueva Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        name="confirm_password"
                        value={passwordData.confirm_password}
                        onChange={(e) => handleChange(e, 'password')}
                        className="input pr-10"
                        placeholder="Confirma tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPasswords.confirm ? (
                          <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className="btn-outline"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Autenticación de Dos Factores</h3>
              <p className="text-sm text-gray-600">Añade una capa extra de seguridad</p>
            </div>
            <button className="btn-secondary">Configurar</button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Sesiones Activas</h3>
              <p className="text-sm text-gray-600">Gestiona tus dispositivos conectados</p>
            </div>
            <button className="btn-secondary">Ver Sesiones</button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderOrdersTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Mis Pedidos</h2>
        
        <div className="space-y-4">
          {[1, 2, 3].map((order) => (
            <div key={order} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">Pedido #TK{order.toString().padStart(6, '0')}</h3>
                  <p className="text-sm text-gray-600">Realizado el {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="badge badge-success mb-2">Entregado</div>
                  <p className="font-semibold text-gray-900">${(Math.random() * 500 + 100).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Producto de Ejemplo {order}</h4>
                  <p className="text-sm text-gray-600">Cantidad: 1</p>
                </div>
                <div className="flex space-x-2">
                  <button className="btn-outline btn-sm">Ver Detalles</button>
                  <button className="btn-secondary btn-sm">Reordenar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderWishlistTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Lista de Deseos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <h3 className="font-medium text-gray-900 mb-2">Producto Favorito {item}</h3>
              <p className="text-sm text-gray-600 mb-3">Descripción del producto...</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-primary-600">${(Math.random() * 200 + 50).toFixed(2)}</span>
                <div className="flex space-x-2">
                  <button className="btn-primary btn-sm">Añadir al Carrito</button>
                  <button className="btn-outline btn-sm">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderSettingsTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuración</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Notificaciones</h3>
            <div className="space-y-3">
              {[
                { id: 'email_orders', label: 'Actualizaciones de pedidos por email', checked: true },
                { id: 'email_promotions', label: 'Promociones y ofertas por email', checked: false },
                { id: 'sms_orders', label: 'Actualizaciones de pedidos por SMS', checked: true },
                { id: 'push_notifications', label: 'Notificaciones push', checked: true }
              ].map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">{setting.label}</label>
                  <input
                    type="checkbox"
                    defaultChecked={setting.checked}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-4">Privacidad</h3>
            <div className="space-y-3">
              {[
                { id: 'profile_public', label: 'Perfil público', checked: false },
                { id: 'show_reviews', label: 'Mostrar mis reseñas públicamente', checked: true },
                { id: 'marketing_emails', label: 'Recibir emails de marketing', checked: false }
              ].map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">{setting.label}</label>
                  <input
                    type="checkbox"
                    defaultChecked={setting.checked}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-4">Idioma y Región</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Idioma</label>
                <select className="input">
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
              </div>
              <div>
                <label className="label">Moneda</label>
                <select className="input">
                  <option value="COP">COP - Peso Colombiano</option>
                  <option value="USD">USD - Dólar Americano</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <button
              onClick={logout}
              className="btn-danger"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'orders':
        return renderOrdersTab();
      case 'wishlist':
        return renderWishlistTab();
      case 'settings':
        return renderSettingsTab();
      case 'security':
        return renderSecurityTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="card sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700 border-primary-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {renderTabContent()}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;