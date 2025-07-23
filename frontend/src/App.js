import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Categories from './pages/Categories/Categories';
import Contact from './pages/Contact/Contact';
import Cart from './pages/Cart/Cart';
import Wishlist from './pages/Wishlist/Wishlist';
import Checkout from './pages/Checkout/Checkout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile/Profile';
import './styles/globals.css';

// Componente de ruta protegida
const ProtectedRoute = ({ children }) => {
  // Por ahora permitimos acceso a todas las rutas
  // En una implementación real, verificarías la autenticación aquí
  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  theme: {
                    primary: '#4ade80',
                    secondary: '#000',
                  },
                },
                error: {
                  duration: 4000,
                  theme: {
                    primary: '#ef4444',
                    secondary: '#000',
                  },
                },
              }}
            />
            
            <Routes>
              {/* Rutas públicas con Layout */}
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/products" element={<Layout><Products /></Layout>} />
              <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
              <Route path="/categories" element={<Layout><Categories /></Layout>} />
              <Route path="/categories/:category" element={<Layout><Categories /></Layout>} />
              <Route path="/contact" element={<Layout><Contact /></Layout>} />
              <Route path="/cart" element={<Layout><Cart /></Layout>} />
              <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
              
              {/* Rutas de autenticación sin Layout */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Rutas protegidas con Layout */}
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <Layout><Checkout /></Layout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Layout><Profile /></Layout>
                  </ProtectedRoute>
                } 
              />
              
              {/* Rutas adicionales */}
              <Route path="/search" element={<Layout><Products /></Layout>} />
              
              {/* Ruta 404 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
