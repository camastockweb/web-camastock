import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, ShoppingBag, LayoutDashboard, User, LogIn } from 'lucide-react'; // Importamos User y LogIn
import { Link } from 'react-router-dom';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext'; 

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Productos', href: '/productos' },
  { label: 'Financiación', href: '/#financiacion' },
  { label: 'Reseñas', href: '/#resenas' },
  { label: 'Contacto', href: '/#contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Extraemos los estados globales del carrito y del usuario
  const { cartCount, setIsDrawerOpen } = useCart();
  const { user } = useAuth();

  // Comprobamos de forma segura si el usuario actual es el administrador
  const isAdmin = user?.user_metadata?.role === 'admin';

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 60);
      if (currentY > lastScrollY && currentY > 120) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(currentY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: visible ? 0 : -100 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          backgroundColor: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.85)',
          borderBottom: '1px solid rgba(26,26,26,0.08)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img 
                src="/logo.png" 
                alt="Logo CamaStock" 
                className="h-10 w-auto object-contain"
              />
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm font-medium tracking-wide transition-colors duration-200"
                  style={{ color: 'rgba(26,26,26,0.65)', fontFamily: 'Inter, sans-serif' }}
                  onMouseEnter={e => e.target.style.color = '#1A1A1A'}
                  onMouseLeave={e => e.target.style.color = 'rgba(26,26,26,0.65)'}
                >
                  {link.label}
                </Link>
              ))}

              {/* ENLACE SECRETO: Solo visible para ti en ordenadores */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm font-bold tracking-wide transition-colors duration-200 flex items-center gap-1.5 px-3 py-1 bg-gray-900/5 hover:bg-gray-900/10 rounded-md text-gray-900"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#C0392B]" /> Panel Administrador
                </Link>
              )}
            </div>

            {/* CTA, Autenticación y Carrito */}
            <div className="hidden md:flex items-center gap-3">
              
              {/* BOTÓN DINÁMICO DE ENTRADA / PERFIL (Escritorio) */}
              {user ? (
                <Link
                  to="/mi-cuenta"
                  className="text-sm font-semibold tracking-wide text-gray-700 hover:text-gray-950 flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <User className="w-4 h-4 text-[#C0392B]" /> Mi Cuenta
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-sm font-semibold tracking-wide text-gray-700 hover:text-gray-950 flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <LogIn className="w-4 h-4 text-[#C0392B]" /> Iniciar Sesión
                </Link>
              )}

              {/* Icono Carrito Escritorio */}
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="relative p-2.5 text-gray-700 hover:bg-gray-100 rounded-full transition-colors mr-1"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span 
                    className="absolute top-0 right-0 w-5 h-5 text-[10px] font-bold rounded-full flex items-center justify-center text-white text-center shadow"
                    style={{ backgroundColor: '#C0392B' }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              <a
                href="tel:+34XXXXXXXXX"
                className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 transition-all duration-200 rounded"
                style={{
                  backgroundColor: '#C0392B',
                  color: '#fff',
                  textDecoration: 'none',
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 0 20px rgba(192,57,43,0.4)',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 28px rgba(192,57,43,0.7)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(192,57,43,0.4)'}
              >
                <Phone className="w-4 h-4" />
                Llámanos
              </a>
            </div>

            {/* Menú y Carrito (Móviles) */}
            <div className="flex md:hidden items-center gap-1">
              
              {/* Icono Carrito Móvil */}
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="relative p-2 text-gray-700 hover:bg-gray-50 rounded-full transition-colors"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartCount > 0 && (
                  <span 
                    className="absolute top-0 right-0 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center text-white text-center shadow"
                    style={{ backgroundColor: '#C0392B' }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                className="p-2"
                style={{ color: 'rgba(26,26,26,0.7)' }}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menú"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden"
              style={{
                backgroundColor: 'rgba(255,255,255,0.98)',
                borderTop: '1px solid rgba(26,26,26,0.06)',
              }}
            >
              <div className="px-6 py-6 flex flex-col gap-5">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-base font-medium"
                    style={{ color: 'rgba(26,26,26,0.7)', fontFamily: 'Inter, sans-serif' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* BOTÓN DINÁMICO DE ENTRADA / PERFIL (Móviles) */}
                {user ? (
                  <Link
                    to="/mi-cuenta"
                    className="text-base font-bold flex items-center gap-2 text-gray-900 border-t pt-2"
                    style={{ fontFamily: 'Inter, sans-serif', borderColor: 'rgba(26,26,26,0.06)' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="w-4 h-4 text-[#C0392B]" /> Mi Cuenta
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="text-base font-bold flex items-center gap-2 text-gray-900 border-t pt-2"
                    style={{ fontFamily: 'Inter, sans-serif', borderColor: 'rgba(26,26,26,0.06)' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    <LogIn className="w-4 h-4 text-[#C0392B]" /> Iniciar Sesión
                  </Link>
                )}

                {/* ENLACE SECRETO MÓVIL: Solo visible para ti */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-base font-bold flex items-center gap-2 text-gray-900 border-t pt-2"
                    style={{ fontFamily: 'Inter, sans-serif', borderColor: 'rgba(26,26,26,0.06)' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#C0392B]" /> Panel de Control
                  </Link>
                )}

                <a
                  href="tel:+34XXXXXXXXX"
                  className="text-sm font-semibold text-center mt-2 py-3 px-5 rounded"
                  style={{
                    backgroundColor: '#C0392B',
                    color: '#fff',
                    textDecoration: 'none',
                    fontFamily: 'Inter, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Phone className="w-4 h-4" />
                  Llámanos ahora
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </AnimatePresence>
  );
}