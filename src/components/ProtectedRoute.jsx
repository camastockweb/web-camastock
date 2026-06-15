import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isLoadingAuth } = useAuth();

  // 1. Mientras Supabase piensa, mostramos carga
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F6F3]">
        <div className="w-8 h-8 border-4 border-red-200 border-t-[#C0392B] rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. Si no hay usuario logueado, a la página de login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si la ruta exige ser Admin y el usuario NO lo es, lo echamos al inicio
  if (requireAdmin && user.user_metadata?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Si pasa todos los controles, le dejamos ver la página
  return children;
}