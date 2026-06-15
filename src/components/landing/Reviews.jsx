import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';

const reviews = [
  {
    id: 1,
    name: 'M.G.',
    stars: 5,
    text: 'Con el colchón que me recomendó Noelia descanso muy bien. Una chica simpática, campechana, agradable y muy paciente.',
  },
  {
    id: 2,
    name: 'Monica D.',
    stars: 5,
    text: 'La atención de Ana fue inmejorable desde el primer momento, y sus conocimientos a la hora de elegir un buen colchón. No puedo estar más contenta con la compra.',
  },
  {
    id: 3,
    name: 'Virginia M.',
    stars: 5,
    text: 'Compré 3 canapés, 2 colchones y 2 cabeceros. Ana es fantástica, aconseja muy bien y tiene paciencia infinita.',
  },
  {
    id: 4,
    name: 'Tamaruchi G.',
    stars: 5,
    text: 'Relación calidad-precio de lo mejor en Burgos después de mirar varios sitios. Además te facilitan retirar los colchones antiguos, para mí es un plus.',
  },
  {
    id: 5,
    name: 'Jose R.',
    stars: 5,
    text: 'Excelente trato tanto en tienda como con los repartidores, de principio a fin. Un placer trabajar con esta empresa.',
  },
  {
    id: 6,
    name: 'Pancho A.',
    stars: 5,
    text: '¡Fantástico trato personal y profesional por parte de Ana! Los montadores también de diez, rápidos y todo perfecto.',
  },
];

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: '#C0392B' }} />
      ))}
    </div>
  );
}

export default function Reviews() {
  const ref = useScrollFadeIn();
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? reviews.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === reviews.length - 1 ? 0 : c + 1));

  return (
    <section
      id="resenas"
      className="py-28"
      style={{ backgroundColor: '#F8F6F3' }}
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="sartorial-rule" />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: '#C0392B', fontFamily: 'Inter, sans-serif' }}
              >
                Lo que dicen nuestros clientes
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
              Ellos ya duermen{' '}
              <em style={{ color: '#C0392B', fontStyle: 'italic' }}>como se merecen</em>
            </h2>
          </div>

          {/* Rating badge */}
          <div
            className="flex items-center gap-4 px-6 py-4 self-start"
            style={{
              background: '#FFFFFF',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(26,26,26,0.08)',
              borderRadius: '10px',
            }}
          >
            <div>
              <span
                className="block font-bold"
                style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', color: '#1A1A1A', lineHeight: 1 }}
              >
                4.9
              </span>
              <StarRating count={5} />
            </div>
            <div>
              <p
                className="font-semibold text-sm"
                style={{ color: '#1A1A1A', fontFamily: 'Inter, sans-serif' }}
              >
                Valoración en Google
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'rgba(26,26,26,0.45)', fontFamily: 'Inter, sans-serif' }}
              >
                +50 clientes satisfechos
              </p>
            </div>
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-8 flex flex-col gap-5 transition-all duration-300"
              style={{
                background: '#FFFFFF',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(26,26,26,0.07)',
                borderRadius: '10px',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(192,57,43,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(26,26,26,0.07)'}
            >
              <StarRating count={review.stars} />
              <p
                className="flex-1"
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '1rem',
                  color: 'rgba(26,26,26,0.75)',
                  lineHeight: 1.75,
                  fontStyle: 'italic',
                }}
              >
                "{review.text}"
              </p>
              <p
                className="font-semibold text-sm"
                style={{ color: 'rgba(26,26,26,0.4)', fontFamily: 'Inter, sans-serif' }}
              >
                — {review.name}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="p-8"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(26,26,26,0.07)',
                borderRadius: '10px',
              }}
            >
              <StarRating count={reviews[current].stars} />
              <p
                className="mt-5 mb-6"
                style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '1.05rem',
                  color: 'rgba(26,26,26,0.75)',
                  lineHeight: 1.75,
                  fontStyle: 'italic',
                }}
              >
                "{reviews[current].text}"
              </p>
              <p
                className="font-semibold text-sm"
                style={{ color: 'rgba(26,26,26,0.4)', fontFamily: 'Inter, sans-serif' }}
              >
                — {reviews[current].name}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={prev}
              className="p-2 transition-colors"
              style={{ border: '1px solid rgba(26,26,26,0.12)', borderRadius: '4px' }}
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" style={{ color: 'rgba(26,26,26,0.5)' }} />
            </button>
            <div className="flex gap-1.5">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ backgroundColor: i === current ? '#C0392B' : 'rgba(26,26,26,0.15)' }}
                  aria-label={`Reseña ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="p-2 transition-colors"
              style={{ border: '1px solid rgba(26,26,26,0.12)', borderRadius: '4px' }}
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" style={{ color: 'rgba(26,26,26,0.5)' }} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}