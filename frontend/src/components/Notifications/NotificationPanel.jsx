import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationPanel = ({ isOpen, onClose }) => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getRecentNotifications
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ duration: 0.3 }}
        className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Filters and Actions */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'unread', label: 'No leídas' },
              { key: 'read', label: 'Leídas' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  filter === key
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={markAllAsRead}
              className="flex-1 btn-outline text-sm py-2 flex items-center justify-center space-x-1"
              disabled={notifications.filter(n => !n.read).length === 0}
            >
              <EyeIcon className="h-4 w-4" />
              <span>Marcar todas como leídas</span>
            </button>
            <button
              onClick={clearAllNotifications}
              className="btn-outline text-sm py-2 px-3 text-red-600 border-red-300 hover:bg-red-50"
              disabled={notifications.length === 0}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <InformationCircleIcon className="h-12 w-12 mb-2" />
              <p className="text-sm">
                {filter === 'unread' ? 'No hay notificaciones sin leer' :
                 filter === 'read' ? 'No hay notificaciones leídas' :
                 'No hay notificaciones'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              <AnimatePresence>
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className={`p-3 rounded-lg border-l-4 transition-all duration-200 ${
                      getTypeColor(notification.type)
                    } ${
                      notification.read ? 'opacity-60' : 'shadow-sm'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {notification.title && (
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {notification.title}
                          </p>
                        )}
                        <p className="text-sm text-gray-700 break-words">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      
                      <div className="flex-shrink-0 flex space-x-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                            title="Marcar como leída"
                          >
                            <CheckIcon className="h-4 w-4 text-gray-600" />
                          </button>
                        )}
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                          title="Eliminar notificación"
                        >
                          <XMarkIcon className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default NotificationPanel;