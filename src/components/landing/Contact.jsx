import { Phone, MapPin, Clock, Navigation } from 'lucide-react';
import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';

export default function Contact() {
  const ref = useScrollFadeIn();

  return (
    <section
      id="contacto"
      className="py-28"
      style={{ backgroundColor: '#FFFFFF' }}
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left — CTA text */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="sartorial-rule" />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: '#C0392B', fontFamily: 'Inter, sans-serif' }}
              >
                Estamos aquí para ti
              </span>
            </div>

            <h2
              className="mb-6 leading-tight"
              style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                color: '#1A1A1A',
                fontWeight: 700,
              }}
            >
              ¿Listo para el descanso{' '}
              <em style={{ color: '#C0392B', fontStyle: 'italic' }}>de tu vida?</em>
            </h2>

            <p
              className="mb-10"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1rem',
                color: 'rgba(26,26,26,0.55)',
                lineHeight: 1.75,
                maxWidth: '440px',
              }}
            >
              Visítanos en Burgos o llámanos ahora. Te atendemos con la misma ilusión del primer día — sin prisas y con el único objetivo de que duermas mejor.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-14">
              <a
                href="tel:+34XXXXXXXXX"
                className="transition-all duration-200"
                style={{
                  backgroundColor: '#C0392B',
                  color: '#fff',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 2rem',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  boxShadow: '0 0 24px rgba(192,57,43,0.4)',
                }}
              >
                <Phone className="w-4 h-4" />
                Llamar ahora · +34 XXX XXX XXX
              </a>
              <a
                href="https://maps.google.com/?q=Burgos+España"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-200"
                style={{
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 2rem',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: '#1A1A1A',
                  border: '1px solid rgba(26,26,26,0.2)',
                  background: 'transparent',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(26,26,26,0.04)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Navigation className="w-4 h-4" />
                Cómo llegar
              </a>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className="p-6"
                style={{
                  background: '#F8F6F3',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(26,26,26,0.07)',
                  borderRadius: '10px',
                }}
              >
                <MapPin className="w-5 h-5 mb-3" style={{ color: '#C0392B' }} />
                <p
                  className="font-semibold mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#1A1A1A' }}
                >
                  Nuestra tienda
                </p>
                <p
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.825rem', color: 'rgba(26,26,26,0.5)', lineHeight: 1.6 }}
                >
                  Calle Vitoria, 113<br />
                  09006 Burgos, España
                </p>
              </div>

              <div
                className="p-6"
                style={{
                  background: '#F8F6F3',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(26,26,26,0.07)',
                  borderRadius: '10px',
                }}
              >
                <Clock className="w-5 h-5 mb-3" style={{ color: '#C0392B' }} />
                <p
                  className="font-semibold mb-1"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#1A1A1A' }}
                >
                  Horario
                </p>
                <p
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.825rem', color: 'rgba(26,26,26,0.5)', lineHeight: 1.6 }}
                >
                  Lun – Sáb<br />
                  10:00–14:00 / 16:30–20:00
                </p>
              </div>
            </div>
          </div>

          {/* Right — Map */}
          <div className="relative">
            <div
              className="overflow-hidden"
              style={{
                aspectRatio: '4/3',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px',
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d737.1993544703469!2d-3.6819728303958428!3d42.34684228938439!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd45fcb85c497119%3A0xcd6de1e0c8758ff3!2sCamaStock!5e0!3m2!1ses!2ses!4v1781474755379!5m2!1ses!2ses"
                width="100%"
                height="100%"
                style={{ border: 0,  }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="CamaStock en Burgos"
              />
            </div>
            {/* Overlay label */}
            <div
              className="absolute bottom-0 left-0 right-0 p-4"
              style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(8px)',
                borderRadius: '0 0 12px 12px',
                borderTop: '1px solid rgba(26,26,26,0.06)',
              }}
            >
              <p
                className="text-sm font-medium flex items-center gap-2"
                style={{ color: '#1A1A1A', fontFamily: 'Inter, sans-serif' }}
              >
                <MapPin className="w-3.5 h-3.5" style={{ color: '#C0392B' }} />
                CamaStock Burgos — Calle Vitoria, 113
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}