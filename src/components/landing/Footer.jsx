import { Instagram, Facebook } from 'lucide-react';

const navLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Productos', href: '#catalogo' },
  { label: 'Financiación', href: '#financiacion' },
  { label: 'Contacto', href: '#contacto' },
];

const legalLinks = [
  { label: 'Aviso Legal', href: '#' },
  { label: 'Política de Privacidad', href: '#' },
  { label: 'Política de Cookies', href: '#' },
];

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{ backgroundColor: '#1A1A1A' }}
    >
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(6rem, 18vw, 16rem)',
            fontWeight: 900,
            color: 'rgba(255,255,255,0.025)',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          CamaStock
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        {/* Top section */}
        <div
          className="pt-20 pb-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Brand */}
          <div className="lg:col-span-2">
            <h2
              className="mb-4"
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '2rem',
                color: '#FFFFFF',
                fontWeight: 700,
              }}
            >
              CamaStock
            </h2>
            <p
              className="mb-6"
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.35)',
                fontStyle: 'italic',
                lineHeight: 1.6,
              }}
            >
              "Tu descanso nos quita el sueño"
            </p>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.3)',
                lineHeight: 1.7,
                maxWidth: '340px',
              }}
            >
              Especialistas en colchones, canapés y complementos del descanso en Burgos. Productos fabricados en España, entrega en 24h y montaje incluido.
            </p>

            {/* Social */}
            <div className="flex items-center gap-3 mt-8">
              <a
                href="https://instagram.com/camastock"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 transition-all duration-200"
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                }}
                aria-label="Instagram CamaStock"
                onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/camastock"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 transition-all duration-200"
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                }}
                aria-label="Facebook CamaStock"
                onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3
              className="mb-6 text-xs font-semibold tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif' }}
            >
              Navegación
            </h3>
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif', textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color = '#FFFFFF'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="mb-6 text-xs font-semibold tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif' }}
            >
              Contacto
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="tel:+34XXXXXXXXX"
                  className="text-sm transition-colors"
                  style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = '#FFFFFF'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
                >
                  +34 XXX XXX XXX
                </a>
              </li>
              <li>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif' }}>
                  Calle Ejemplo, 00<br />
                  09000 Burgos
                </p>
              </li>
              <li>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif' }}>
                  Lun–Sáb: 10:00–14:00<br />
                  16:30–20:00
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter, sans-serif', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}
              >
                {link.label}
              </a>
            ))}
          </div>
          <p
            className="text-xs text-center"
            style={{ color: 'rgba(255,255,255,0.18)', fontFamily: 'Inter, sans-serif' }}
          >
            © {new Date().getFullYear()} CamaStock Burgos. Todos los derechos reservados.
          </p>
        </div>

        {/* Final tagline */}
        <div
          className="py-10 text-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <p
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(1.1rem, 3vw, 2rem)',
              color: 'rgba(255,255,255,0.15)',
              fontStyle: 'italic',
              letterSpacing: '0.01em',
            }}
          >
            Tu descanso nos quita el sueño — CamaStock, Burgos
          </p>
        </div>
      </div>
    </footer>
  );
}