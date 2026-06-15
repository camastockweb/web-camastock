import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';
import { CheckCircle } from 'lucide-react';

const benefits = [
  'Sin intereses ni cargos ocultos',
  'Sin necesidad de tarjeta de crédito',
  'Aprobación rápida en tienda',
  'Plazos flexibles adaptados a ti',
];

export default function Financing() {
  const ref = useScrollFadeIn();

  return (
    <section
      id="financiacion"
      className="py-28 overflow-hidden"
      style={{ backgroundColor: '#F8F6F3' }}
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Text */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="sartorial-rule" style={{ backgroundColor: '#C0392B' }} />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: '#C0392B', fontFamily: 'Inter, sans-serif' }}
              >
                Financiación
              </span>
            </div>

            <h2
              className="mb-6 leading-tight"
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                color: '#1A1A1A',
                fontWeight: 700,
              }}
            >
              Tu colchón ideal,{' '}
              <em style={{ color: '#C0392B', fontStyle: 'italic' }}>desde el primer día.</em>{' '}
              Paga después.
            </h2>

            <p
              className="mb-10"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem',
                color: 'rgba(26,26,26,0.55)',
                lineHeight: 1.7,
              }}
            >
              Financiación al <strong style={{ color: '#1A1A1A' }}>0% de interés</strong>, sin papeleos complicados ni letras pequeñas. El mejor descanso no tiene por qué esperar.
            </p>

            {/* Benefits */}
            <ul className="flex flex-col gap-4 mb-10">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#C0392B' }} />
                  <span
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.925rem', color: 'rgba(26,26,26,0.65)' }}
                  >
                    {b}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="#contacto"
              style={{
                backgroundColor: '#C0392B',
                color: '#fff',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '1rem 2.5rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                boxShadow: '0 0 24px rgba(192,57,43,0.4)',
              }}
            >
              Calcular mi financiación →
            </a>
          </div>

          {/* Right — Visual calculator */}
          <div
            className="relative p-10 lg:p-14"
            style={{
              background: '#FFFFFF',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(26,26,26,0.08)',
              borderRadius: '16px',
            }}
          >
            {/* Decorative glow corners */}
            <div
              className="absolute top-0 right-0 w-16 h-16"
              style={{ borderTop: '2px solid rgba(192,57,43,0.5)', borderRight: '2px solid rgba(192,57,43,0.5)', borderRadius: '0 16px 0 0' }}
            />
            <div
              className="absolute bottom-0 left-0 w-16 h-16"
              style={{ borderBottom: '2px solid rgba(192,57,43,0.5)', borderLeft: '2px solid rgba(192,57,43,0.5)', borderRadius: '0 0 0 16px' }}
            />

            <p
              className="mb-3 text-xs tracking-widest uppercase font-semibold"
              style={{ color: 'rgba(26,26,26,0.35)', fontFamily: 'Inter, sans-serif' }}
            >
              Ejemplo real
            </p>

            <div className="mb-4">
              <span
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 'clamp(3rem, 8vw, 5.5rem)',
                  color: '#1A1A1A',
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                600€
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter, sans-serif' }}
              >
                se convierte en
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                  color: '#C0392B',
                  fontWeight: 900,
                  lineHeight: 1,
                  textShadow: '0 0 20px rgba(192,57,43,0.5)',
                }}
              >
                50€
              </span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1.1rem',
                  color: 'rgba(26,26,26,0.5)',
                }}
              >
                / mes
              </span>
            </div>

            <p
              className="text-sm mb-8"
              style={{ color: 'rgba(26,26,26,0.4)', fontFamily: 'Inter, sans-serif' }}
            >
              12 cuotas · 0% TAE · Sin comisiones
            </p>

            <div
              className="pt-6"
              style={{ borderTop: '1px solid rgba(26,26,26,0.07)' }}
            >
              <p
                className="text-xs"
                style={{ color: 'rgba(26,26,26,0.35)', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}
              >
                * Ejemplo orientativo. Las condiciones finales se confirman en tienda según el producto elegido.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}