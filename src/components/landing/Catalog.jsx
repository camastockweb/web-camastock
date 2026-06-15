import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function Catalog() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('TODOS');
  const [categories, setCategories] = useState(['TODOS']);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const ref = useScrollFadeIn();

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const { data: catData } = await supabase.from('categories').select('name').order('name', { ascending: true });
        if (catData) {
          setCategories(['TODOS', ...catData.map((c) => c.name.toUpperCase())]);
        }

        const { data: prodData } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(8);
        if (prodData) {
          setProducts(prodData);
        }
      } catch (error) {
        console.error('Error cargando el catálogo de inicio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const filtered = activeCategory === 'TODOS'
    ? products
    : products.filter((p) => p.category.toLowerCase().trim() === activeCategory.toLowerCase().trim());

  return (
    <section
      id="catalogo"
      className="py-28"
      style={{ backgroundColor: '#FFFFFF' }}
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#C0392B] mb-2" />
            <p className="text-sm">Cargando escaparate...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">No hay artículos disponibles en esta categoría.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((product) => {
                const estaAgotado = Number(product.stock || 0) <= 0;

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35 }}
                    className="product-card group overflow-hidden cursor-pointer flex flex-col"
                    style={{
                      backgroundColor: '#F8F6F3',
                      border: '1px solid rgba(26,26,26,0.07)',
                      borderRadius: '10px',
                      transition: 'border-color 0.3s',
                    }}
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(`/productos/${product.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/productos/${product.id}`);
                      }
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(192,57,43,0.4)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(26,26,26,0.07)')}
                  >
                    <div className="relative overflow-hidden aspect-[4/3] shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ backgroundColor: 'rgba(248,246,243,0.3)' }}
                      />
                      {product.made_in_spain && (
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
                      <div className="absolute bottom-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-sm">
                          Ver ficha <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      <p
                        className="text-xs font-medium tracking-widest uppercase mb-1"
                        style={{ color: '#C0392B', fontFamily: 'Inter, sans-serif' }}
                      >
                        {product.category}
                      </p>
                      <h3
                        className="mb-2 line-clamp-2"
                        style={{
                          fontFamily: 'Playfair Display, serif',
                          fontSize: '1.05rem',
                          color: '#1A1A1A',
                          fontWeight: 600,
                        }}
                      >
                        {product.name}
                      </h3>

                      <div className="mt-auto pt-2">
                        <p className="text-sm font-bold mb-4 text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {product.price}€
                        </p>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/productos/${product.id}`);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold tracking-widest uppercase transition-all"
                          style={{
                            color: '#C0392B',
                            fontFamily: 'Inter, sans-serif',
                            textDecoration: 'none',
                          }}
                        >
                          Ver ficha <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

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
