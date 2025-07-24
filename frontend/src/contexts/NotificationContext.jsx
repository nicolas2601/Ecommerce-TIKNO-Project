import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Cargar notificaciones desde localStorage al inicializar
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications_general');
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
        setNotifications([]);
      }
    }
  }, []);

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('notifications_general', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (message, type = 'info', title = null) => {
    const notification = {
      id: Date.now() + Math.random(),
      message,
      type, // 'success', 'error', 'warning', 'info'
      title,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [notification, ...prev]);
    return notification;
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  const getRecentNotifications = (limit = 10) => {
    return notifications.slice(0, limit);
  };

  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getUnreadCount,
    getRecentNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;