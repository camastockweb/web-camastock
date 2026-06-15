import React, { useState, useEffect } from 'react';
import { ShoppingBag, Loader2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function Productos() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState(['TODOS']);
  const [loading, setLoading] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState('TODOS');

  useEffect(() => {
    const cargarDatosTienda = async () => {
      setLoading(true);
      try {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('name')
          .order('name', { ascending: true });

        if (!catError && catData) {
          const listaDinamica = ['TODOS', ...catData.map((cat) => cat.name.toUpperCase())];
          setCategorias(listaDinamica);
        }

        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!prodError && prodData) {
          setProductos(prodData);
        }
      } catch (error) {
        console.error('Error sincronizando los datos de la tienda:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosTienda();
  }, []);

  const productosFiltrados = productos.filter((prod) => {
    if (categoriaActiva === 'TODOS') return true;
    return prod.category.toLowerCase().trim() === categoriaActiva.toLowerCase().trim();
  });

  return (
    <div className="min-h-screen bg-white pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1
            className="font-bold mb-4"
            style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#1A1A1A' }}
          >
            Colección
          </h1>
          <p className="text-gray-500 text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
            Descubre nuestra selección de productos para el descanso. Fabricación nacional, materiales de primera calidad y garantía de satisfacción.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`px-6 py-2.5 text-xs font-bold tracking-wider uppercase rounded-full border transition-all duration-200 ${
                categoriaActiva === cat
                  ? 'text-white border-transparent shadow-md'
                  : 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              style={{
                fontFamily: 'Inter, sans-serif',
                backgroundColor: categoriaActiva === cat ? '#C0392B' : undefined,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#C0392B] mb-2" />
            <p className="text-sm font-medium">Actualizando escaparate...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm font-medium">No hay artículos disponibles en esta categoría actualmente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {productosFiltrados.map((product) => {
              const estaAgotado = Number(product.stock || 0) <= 0;

              return (
                <div
                  key={product.id}
                  className={`group flex flex-col bg-white rounded-2xl border overflow-hidden p-4 transition-all duration-300 hover:shadow-xl hover:border-gray-200 ${estaAgotado ? 'opacity-75' : ''}`}
                  style={{ borderColor: 'rgba(26,26,26,0.06)' }}
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/productos/${product.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/productos/${product.id}`);
                    }
                  }}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#F8F6F3] mb-5">
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`h-full w-full object-cover transition-transform duration-500 ${estaAgotado ? 'grayscale' : 'group-hover:scale-105'}`}
                    />

                    {estaAgotado ? (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-white text-gray-900 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-red-600" /> Agotado
                        </span>
                      </div>
                    ) : product.made_in_spain ? (
                      <span
                        className="absolute top-3 left-3 text-[10px] font-bold text-white px-2.5 py-1 rounded shadow-sm"
                        style={{ backgroundColor: '#C0392B', fontFamily: 'Inter, sans-serif' }}
                      >
                        Fabricado en España
                      </span>
                    ) : null}

                    <div className="absolute bottom-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-sm">
                        Ver ficha <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  <div className="flex-grow flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-red-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {product.category}
                    </span>
                    <h3 className="font-bold text-lg mb-4 text-gray-900 line-clamp-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {product.name}
                    </h3>

                    <div className="mt-auto pt-4 border-t flex items-center justify-between gap-3" style={{ borderColor: 'rgba(26,26,26,0.06)' }}>
                      <span className="text-xl font-black text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {product.price}€
                      </span>

                      <div className="flex items-center gap-2">
                        {estaAgotado ? (
                          <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                            Sin existencias
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors hover:text-red-800"
                            style={{ color: '#C0392B', fontFamily: 'Inter, sans-serif' }}
                          >
                            Añadir <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/productos/${product.id}`);
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors text-gray-700 hover:text-gray-900"
                        >
                          Ficha <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
