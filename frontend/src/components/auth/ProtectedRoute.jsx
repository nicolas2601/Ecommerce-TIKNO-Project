import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../UI/Loading';

const ProtectedRoute = ({ children, requireAuth = true, redirectTo = '/login' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <Loading fullScreen text="Verificando autenticación..." />;
  }

  // Si requiere autenticación y no hay usuario, redirigir al login
  if (requireAuth && !user) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Si no requiere autenticación y hay usuario, redirigir (para páginas como login/register)
  if (!requireAuth && user) {
    const from = location.state?.from || '/';
    return <Navigate to={from} replace />;
  }

  return children;
};

// Componente para rutas que requieren roles específicos
export const RoleProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/' 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen text="Verificando permisos..." />;
  }

  if (!user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

// Componente para rutas de administrador
export const AdminRoute = ({ children }) => {
  return (
    <RoleProtectedRoute allowedRoles={['admin', 'super_admin']}>
      {children}
    </RoleProtectedRoute>
  );
};

// Componente para rutas de vendedor
export const SellerRoute = ({ children }) => {
  return (
    <RoleProtectedRoute allowedRoles={['seller', 'admin', 'super_admin']}>
      {children}
    </RoleProtectedRoute>
  );
};

export default ProtectedRoute;