import { MessageCircle, Award, Wrench } from 'lucide-react';
import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';

const pillars = [
  {
    Icon: MessageCircle,
    title: 'Asesoramiento experto',
    desc: 'Te escuchamos, analizamos tus necesidades y te recomendamos la opción perfecta para tu cuerpo y presupuesto. Sin prisas, sin presión.',
  },
  {
    Icon: Award,
    title: 'Calidad española',
    desc: 'Todos nuestros productos están fabricados en España, seleccionados por su durabilidad, confort y materiales de primera.',
  },
  {
    Icon: Wrench,
    title: 'Servicio completo',
    desc: 'Te lo llevamos, montamos y retiramos lo anterior. Tú solo tienes que disfrutar del mejor descanso de tu vida.',
  },
];

export default function WhyCamastock() {
  const ref = useScrollFadeIn();

  return (
    <section
      className="py-28"
      style={{ backgroundColor: '#F8F6F3' }}
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="flex items-center gap-3 mb-5">
            <span className="sartorial-rule" />
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: '#C0392B', fontFamily: 'Inter, sans-serif' }}
            >
              Por qué CamaStock
            </span>
          </div>
          <h2
            className="mb-5"
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: '#1A1A1A',
              fontWeight: 700,
            }}
          >
            Invertir en descanso<br />
            <em style={{ color: '#C0392B', fontStyle: 'italic' }}>es invertir en salud</em>
          </h2>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.05rem',
              color: 'rgba(26,26,26,0.55)',
              lineHeight: 1.7,
            }}
          >
            No vendemos colchones; te ayudamos a recuperar las horas que mereces. Cada producto que encontrarás en CamaStock ha sido seleccionado con un único criterio: que duermas mejor.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => {
            const PillarIcon = pillar.Icon;
            return (
              <div
                key={pillar.title}
                className="group p-8 transition-all duration-300"
                style={{
                  background: '#FFFFFF',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(26,26,26,0.07)',
                  borderRadius: '12px',
                }}
                onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(192,57,43,0.35)'}
                onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(26,26,26,0.07)'}
              >
                {/* Number */}
                <div
                  className="text-6xl font-bold mb-6 leading-none"
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    color: 'rgba(192,57,43,0.2)',
                  }}
                >
                  0{i + 1}
                </div>
                {/* Icon */}
                <div
                  className="w-12 h-12 flex items-center justify-center mb-6"
                  style={{
                    backgroundColor: 'rgba(192,57,43,0.12)',
                    border: '1px solid rgba(192,57,43,0.25)',
                  }}
                >
                  <PillarIcon className="w-5 h-5" style={{ color: '#C0392B' }} />
                </div>
                {/* Text */}
                <h3
                  className="mb-4"
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '1.3rem',
                    color: '#1A1A1A',
                    fontWeight: 600,
                  }}
                >
                  {pillar.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.925rem',
                    color: 'rgba(26,26,26,0.55)',
                    lineHeight: 1.75,
                  }}
                >
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}