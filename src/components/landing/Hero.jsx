import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: '#F8F6F3' }}
    >
      {/* Background image with light overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&q=90&auto=format&fit=crop"
          alt="Dormitorio de lujo"
          className="w-full h-full object-cover"
          style={{ opacity: 0.75 }}
        />
        {/* Light gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(248,246,243,0.97) 40%, rgba(248,246,243,0.7) 100%)',
          }}
        />
      </div>

      {/* Content card — glassmorphism */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full pt-32 pb-24">
        <div
          className="max-w-2xl p-10 lg:p-14"
          style={{
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(26,26,26,0.08)',
            borderRadius: '16px',
          }}
        >
          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mb-5 leading-tight"
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
              color: '#1A1A1A',
              fontWeight: 700,
            }}
          >
            Duerme como nunca.{' '}
            <em style={{ color: '#C0392B', fontStyle: 'italic' }}>
              Vive como siempre quisiste.
            </em>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mb-5 font-medium"
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.15rem',
              color: 'rgba(26,26,26,0.5)',
              fontStyle: 'italic',
            }}
          >
            "Tu descanso nos quita el sueño"
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mb-10 leading-relaxed"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.975rem',
              color: 'rgba(26,26,26,0.6)',
              maxWidth: '480px',
            }}
          >
            Somos especialistas en colchones, canapés y complementos del descanso. Te asesoramos de forma personalizada para que encuentres el producto perfecto para tu cuerpo. Todo fabricado en España, entregado en 24h con montaje incluido.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 mb-10"
          >
            <a
              href="#catalogo"
              className="text-base font-semibold tracking-wide transition-all duration-200"
              style={{
                backgroundColor: '#C0392B',
                color: '#fff',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.9rem 2rem',
                fontFamily: 'Inter, sans-serif',
                boxShadow: '0 0 24px rgba(192,57,43,0.45)',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 36px rgba(192,57,43,0.7)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(192,57,43,0.45)'}
            >
              Descubre tu colchón ideal
            </a>
            <a
              href="#contacto"
              className="text-base font-semibold tracking-wide transition-all duration-200"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.9rem 2rem',
                fontFamily: 'Inter, sans-serif',
                color: '#1A1A1A',
                border: '1px solid rgba(26,26,26,0.3)',
                background: 'transparent',
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(26,26,26,0.06)'; e.currentTarget.style.borderColor = 'rgba(26,26,26,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(26,26,26,0.3)'; }}
            >
              Visítanos en Burgos
            </a>
          </motion.div>

          {/* Badges — no emojis, icon-based */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="flex flex-wrap gap-6"
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid rgba(26,26,26,0.08)',
            }}
          >
            {[
              { icon: '🇪🇸', text: 'Fabricado en España' },
              { icon: '⚡', text: 'Entrega en 24h' },
              { icon: '💳', text: 'Financiación 0%' },
            ].map((badge) => (
              <div key={badge.text} className="flex items-center gap-2">
                <span style={{ fontSize: '1rem' }}>{badge.icon}</span>
                <span
                  className="text-xs font-medium"
                  style={{ color: 'rgba(26,26,26,0.55)', fontFamily: 'Inter, sans-serif' }}
                >
                  {badge.text}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(26,26,26,0.35)', fontFamily: 'Inter, sans-serif' }}>
          Descubrir
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <ArrowDown className="w-4 h-4" style={{ color: '#C0392B' }} />
        </motion.div>
      </motion.div>
    </section>
  );
}