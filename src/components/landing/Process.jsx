import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';

const steps = [
  {
    num: '01',
    title: 'Visítanos o llámanos',
    desc: 'Acércate a nuestra tienda en Burgos o llámanos por teléfono. Te asesoramos sin ningún compromiso y con toda la paciencia del mundo.',
  },
  {
    num: '02',
    title: 'Elige tu producto',
    desc: 'Con nuestra ayuda, encontrarás el colchón, canapé o complemento ideal para tu cuerpo, tu habitación y tu presupuesto.',
  },
  {
    num: '03',
    title: 'Financiación y pago',
    desc: 'Paga como prefieras: al contado o en cómodos plazos al 0% de interés. Rápido, claro y sin sorpresas.',
  },
  {
    num: '04',
    title: 'Entrega y montaje',
    desc: 'En 24 horas está en tu casa, instalado y listo para que te estrenes. Retiramos lo que ya no necesitas.',
  },
];

export default function Process() {
  const ref = useScrollFadeIn();

  return (
    <section
      className="py-28"
      style={{ backgroundColor: '#FFFFFF' }}
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="max-w-2xl mb-20">
          <div className="flex items-center gap-3 mb-5">
            <span className="sartorial-rule" />
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: '#C0392B', fontFamily: 'Inter, sans-serif' }}
            >
              El proceso
            </span>
          </div>
          <h2
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: '#1A1A1A',
              fontWeight: 700,
            }}
          >
            Así de fácil es{' '}
            <em style={{ color: '#C0392B', fontStyle: 'italic' }}>comprar en CamaStock</em>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="relative p-8 group transition-all duration-300"
              style={{
                background: '#F8F6F3',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(26,26,26,0.07)',
                borderRadius: '12px',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(192,57,43,0.35)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(26,26,26,0.07)'}
            >
              {/* Big number */}
              <div
                className="mb-6 leading-none"
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '4rem',
                  fontWeight: 900,
                  color: 'rgba(192,57,43,0.2)',
                }}
              >
                {step.num}
              </div>

              {/* Accent line */}
              <div
                className="w-8 h-0.5 mb-6"
                style={{ backgroundColor: '#C0392B', boxShadow: '0 0 8px rgba(192,57,43,0.6)' }}
              />

              <h3
                className="mb-4"
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '1.15rem',
                  color: '#1A1A1A',
                  fontWeight: 600,
                  }}
                  >
                  {step.title}
              </h3>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.9rem',
                  color: 'rgba(26,26,26,0.55)',
                  lineHeight: 1.7,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}