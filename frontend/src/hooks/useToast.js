import { useNotifications } from '../contexts/NotificationContext';
// import toast from 'react-hot-toast'; // Comentado - ahora usamos solo el sistema de notificaciones personalizado

// Hook personalizado que reemplaza react-hot-toast completamente
export const useToast = () => {
  const { addNotification } = useNotifications();

  const showToast = {
    success: (message, title = 'Éxito') => {
      addNotification(message, 'success', title);
      return { id: Date.now(), type: 'success', message, title };
    },
    
    error: (message, title = 'Error') => {
      addNotification(message, 'error', title);
      return { id: Date.now(), type: 'error', message, title };
    },
    
    warning: (message, title = 'Advertencia') => {
      addNotification(message, 'warning', title);
      return { id: Date.now(), type: 'warning', message, title };
    },
    
    info: (message, title = 'Información') => {
      addNotification(message, 'info', title);
      return { id: Date.now(), type: 'info', message, title };
    },
    
    // Método genérico
    show: (message, type = 'info', title = null) => {
      addNotification(message, type, title);
      return { id: Date.now(), type, message, title };
    }
  };

  return showToast;
};

// Función para crear notificaciones directamente (sin hook)
export const createNotificationToast = (addNotification) => {
  return {
    success: (message, title = 'Éxito') => {
      addNotification(message, 'success', title);
      return { id: Date.now(), type: 'success', message, title };
    },
    error: (message, title = 'Error') => {
      addNotification(message, 'error', title);
      return { id: Date.now(), type: 'error', message, title };
    },
    warning: (message, title = 'Advertencia') => {
      addNotification(message, 'warning', title);
      return { id: Date.now(), type: 'warning', message, title };
    },
    info: (message, title = 'Información') => {
      addNotification(message, 'info', title);
      return { id: Date.now(), type: 'info', message, title };
    }
  };
};

export default useToast;