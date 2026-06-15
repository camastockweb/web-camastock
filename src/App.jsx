import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Productos from './pages/Productos'; 
import ProductoDetalle from './pages/ProductoDetalle';
import Navbar from './components/landing/Navbar'; 
import { CartProvider } from '@/lib/CartContext';
import Carrito from './pages/Carrito';
import CartDrawer from './components/landing/CartDrawer';
import Exito from './pages/Exito';
import ProtectedRoute from './components/ProtectedRoute'; // Ajusta la ruta si lo pusiste en otro sitio
import AdminDashboard from './pages/admin/AdminDashboard';
import MiCuenta from './pages/MiCuenta';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/productos" element={<Productos />} />
      <Route path="/productos/:id" element={<ProductoDetalle />} />
      <Route path="/producto/:id" element={<ProductoDetalle />} />
      <Route path="/carrito" element={<Carrito />} />
      <Route path="/exito" element={<Exito />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/mi-cuenta" element={
        <ProtectedRoute requireAdmin={false}>
          <MiCuenta />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        {/* ¡AQUÍ ESTÁ LA MAGIA! Envolvemos TODO con el AuthProvider */}
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            <Navbar /> 
            <CartDrawer />
            <AuthenticatedApp />
          </CartProvider>
        </AuthProvider>
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App;
