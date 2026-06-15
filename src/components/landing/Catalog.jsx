import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';
import { ArrowUpRight } from 'lucide-react';

const categories = ['Todos', 'Colchones', 'Canapés', 'Cabeceros', 'Camas articuladas', 'Somieres', 'Almohadas', 'Nórdicos', 'Protectores'];

const products = [
  {
    id: 1,
    name: 'Colchón Viscoelástico Premium',
    category: 'Colchones',
    madeInSpain: true,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&auto=format&fit=crop',
    from: 'Desde 349€',
  },
  {
    id: 2,
    name: 'Canapé Abatible de Madera',
    category: 'Canapés',
    madeInSpain: true,
    image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&q=80&auto=format&fit=crop',
    from: 'Desde 299€',
  },
  {
    id: 3,
    name: 'Cabecero Tapizado',
    category: 'Cabeceros',
    madeInSpain: true,
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80&auto=format&fit=crop',
    from: 'Desde 149€',
  },
  {
    id: 4,
    name: 'Cama Articulada Eléctrica',
    category: 'Camas articuladas',
    madeInSpain: false,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80&auto=format&fit=crop',
    from: 'Desde 499€',
  },
  {
    id: 5,
    name: 'Somier de Láminas',
    category: 'Somieres',
    madeInSpain: true,
    image: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=600&q=80&auto=format&fit=crop',
    from: 'Desde 129€',
  },
  {
    id: 6,
    name: 'Almohada Viscoelástica',
    category: 'Almohadas',
    madeInSpain: true,
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80&auto=format&fit=crop',
    from: 'Desde 39€',
  },
  {
    id: 7,
    name: 'Nórdico All-Seasons',
    category: 'Nórdicos',
    madeInSpain: false,
    image: 'https://images.unsplash.com/photo-1588515724527-074a7a56616c?w=600&q=80&auto=format&fit=crop',
    from: 'Desde 79€',
  },
  {
    id: 8,
    name: 'Protector Impermeable',
    category: 'Protectores',
    madeInSpain: true,
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80&auto=format&fit=crop',
    from: 'Desde 29€',
  },
];

export default function Catalog() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const ref = useScrollFadeIn();

  const filtered = activeCategory === 'Todos'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <section
      id="catalogo"
      className="py-28"
      style={{ backgroundColor: '#FFFFFF' }}
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="sartorial-rule" />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: '#C0392B', fontFamily: 'Inter, sans-serif' }}
              >
                Catálogo
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
                Nuestros productos
            </h2>
          </div>
          <p
            className="max-w-sm"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.975rem', color: 'rgba(26,26,26,0.5)', lineHeight: 1.7 }}
          >
            Ven a verlos, tocarlos y sentirlos. O llámanos y te asesoramos sin compromiso desde casa.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200"
              style={{
                fontFamily: 'Inter, sans-serif',
                backgroundColor: activeCategory === cat ? '#C0392B' : 'transparent',
                color: activeCategory === cat ? '#FFFFFF' : 'rgba(26,26,26,0.55)',
                border: activeCategory === cat ? '1px solid #C0392B' : '1px solid rgba(26,26,26,0.12)',
                boxShadow: activeCategory === cat ? '0 0 16px rgba(192,57,43,0.35)' : 'none',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="product-card group overflow-hidden cursor-pointer"
                style={{
                  backgroundColor: '#F8F6F3',
                  border: '1px solid rgba(26,26,26,0.07)',
                  borderRadius: '10px',
                  transition: 'border-color 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(192,57,43,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(26,26,26,0.07)'}
              >
                {/* Image */}
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Dark overlay on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ backgroundColor: 'rgba(248,246,243,0.3)' }}
                  />
                  {/* Made in Spain badge */}
                  {product.madeInSpain && (
                    <div
                      className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: 'rgba(192,57,43,0.9)',
                        color: '#fff',
                        fontFamily: 'Inter, sans-serif',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      ES · España
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <p
                    className="text-xs font-medium tracking-widest uppercase mb-1"
                    style={{ color: '#C0392B', fontFamily: 'Inter, sans-serif' }}
                  >
                    {product.category}
                  </p>
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: '1.05rem',
                      color: '#1A1A1A',
                      fontWeight: 600,
                      }}
                      >
                      {product.name}
                  </h3>
                  <p
                    className="text-sm mb-4"
                    style={{ color: 'rgba(26,26,26,0.5)', fontFamily: 'Inter, sans-serif' }}
                  >
                    {product.from}
                  </p>
                  <a
                    href="#contacto"
                    className="inline-flex items-center gap-1 text-xs font-semibold tracking-widest uppercase transition-all"
                    style={{
                      color: '#C0392B',
                      fontFamily: 'Inter, sans-serif',
                      textDecoration: 'none',
                    }}
                  >
                    Ver más <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p
            className="mb-6"
            style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'rgba(26,26,26,0.45)', fontStyle: 'italic' }}
          >
            ¿No encuentras lo que buscas? Cuéntanos y lo conseguimos.
          </p>
          <a
            href="tel:+34XXXXXXXXX"
            className="transition-all duration-200"
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
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: '0 0 24px rgba(192,57,43,0.4)',
            }}
          >
            Consultar ahora
          </a>
        </div>
      </div>
    </section>
  );
}