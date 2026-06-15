import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Loader2,
  Minus,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  Plus,
  ChevronRight,
  MapPin,
  Ruler,
  HeartHandshake,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/CartContext';

const money = (value) => {
  const number = Number(value || 0);
  return `${number.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`;
};

const buildSpecs = (product) => {
  const items = [
    { label: 'Categoría', value: product?.category || 'Sin categoría' },
    { label: 'Referencia', value: `#${product?.id}` },
    { label: 'Stock', value: `${Number(product?.stock || 0)} unidades` },
    { label: 'Origen', value: product?.made_in_spain ? 'Fabricado en España' : 'Selección premium' },
    { label: 'Descripción', value: product?.description },
    { label: 'Material', value: product?.materials || product?.material },
    { label: 'Medidas', value: product?.dimensions || product?.measurements },
    { label: 'Altura', value: product?.height },
    { label: 'Firmeza', value: product?.firmness },
    { label: 'Garantía', value: product?.warranty },
  ];

  return items.filter((item) => item.value && String(item.value).trim());
};

const buildHighlights = (product) => {
  const stock = Number(product?.stock || 0);
  return [
    product?.made_in_spain
      ? 'Fabricación nacional con control de calidad.'
      : 'Selección premium pensada para ofrecer presencia y durabilidad.',
    stock > 0
      ? `Stock real disponible: ${stock} unidades.`
      : 'Temporalmente agotado, pero puedes consultar disponibilidad.',
    'Añádelo al carrito en un clic y termina tu compra cuando quieras.',
    product?.category ? `Pertenece a la colección ${product.category}.` : 'Diseñado para integrarse con un dormitorio elegante.',
  ];
};

export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (productError) throw productError;

        if (!active) return;

        setProduct(productData || null);
        setQuantity(1);

        if (!productData) {
          setRelated([]);
          return;
        }

        const baseRelatedQuery = supabase
          .from('products')
          .select('*')
          .neq('id', id)
          .order('created_at', { ascending: false })
          .limit(4);

        const sameCategoryQuery = productData.category
          ? baseRelatedQuery.eq('category', productData.category)
          : baseRelatedQuery;

        const { data: relatedData } = await sameCategoryQuery;

        if (active) {
          if (relatedData && relatedData.length > 0) {
            setRelated(relatedData);
          } else {
            const { data: fallbackRelated } = await supabase
              .from('products')
              .select('*')
              .neq('id', id)
              .order('created_at', { ascending: false })
              .limit(4);

            setRelated(fallbackRelated || []);
          }
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'No se pudo cargar el producto.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | CamaStock`;
    }

    return () => {
      document.title = 'CamaStock';
    };
  }, [product]);

  useEffect(() => {
    if (product?.stock) {
      setQuantity((prev) => Math.min(Math.max(1, prev), Number(product.stock)));
    }
  }, [product]);

  const stock = Number(product?.stock || 0);
  const price = money(product?.price);
  const specs = product ? buildSpecs(product) : [];
  const highlights = product ? buildHighlights(product) : [];

  const handleAddToCart = () => {
    if (!product || stock <= 0) return;

    const times = Math.min(quantity, stock);
    for (let i = 0; i < times; i += 1) {
      addToCart(product);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/carrito');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-[radial-gradient(circle_at_top,#f7efe9_0%,#ffffff_45%,#f8f6f3_100%)] flex items-center justify-center">
        <div className="flex flex-col items-center text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin text-[#C0392B] mb-3" />
          <p className="text-sm font-medium">Preparando la ficha del producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-[radial-gradient(circle_at_top,#f7efe9_0%,#ffffff_45%,#f8f6f3_100%)]">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm text-center">
            <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <Package className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Producto no encontrado
            </h1>
            <p className="text-gray-500 text-sm mb-8 max-w-xl mx-auto">
              {error || 'No pudimos localizar esta referencia. Puede que haya sido eliminada o que el enlace esté incompleto.'}
            </p>
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C0392B] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:brightness-110"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[radial-gradient(circle_at_top_left,#f6ece4_0%,#ffffff_42%,#f8f6f3_100%)] text-gray-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
          <Link to="/" className="hover:text-gray-700">Inicio</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/productos" className="hover:text-gray-700">Productos</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#C0392B]">{product.category}</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/productos')}
          className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </button>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-start">
          <section className="space-y-6">
            <div className="relative overflow-hidden rounded-[2rem] bg-white border border-gray-100 shadow-[0_20px_60px_rgba(26,26,26,0.08)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(192,57,43,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(26,26,26,0.05),transparent_40%)]" />
              <div className="grid md:grid-cols-[1fr_auto] gap-0 relative">
                <div className="relative min-h-[420px] md:min-h-[620px] bg-[#F8F6F3]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                  <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                    {product.made_in_spain && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C0392B] text-white text-[10px] font-black uppercase tracking-wider shadow-lg">
                        <BadgeCheck className="w-3.5 h-3.5" /> Fabricado en España
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-[10px] font-black uppercase tracking-wider text-gray-800 shadow-lg">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Producto premium
                    </span>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p className="text-[10px] uppercase tracking-[0.35em] font-bold text-white/70 mb-2">
                      {product.category}
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight max-w-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {product.name}
                    </h1>
                  </div>
                </div>

                <div className="hidden md:flex flex-col justify-between p-6 w-56 bg-white/85 backdrop-blur border-l border-gray-100">
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-[#F8F6F3] p-4 border border-gray-100">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Precio</p>
                      <p className="text-3xl font-black text-gray-900">{price}</p>
                    </div>
                    <div className="rounded-2xl bg-[#F8F6F3] p-4 border border-gray-100">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Stock</p>
                      <p className="text-lg font-bold text-gray-900">
                        {stock > 0 ? `${stock} unidades` : 'Sin stock'}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#F8F6F3] p-4 border border-gray-100">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Entrega</p>
                      <p className="text-sm font-semibold text-gray-700">
                        Reparto o recogida en tienda
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Compra segura con Stripe</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-[#C0392B]" />
                      <span>Asesoramiento personal antes y después de la compra</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                <Truck className="w-5 h-5 text-[#C0392B] mb-3" />
                <p className="text-sm font-bold mb-1">Compra flexible</p>
                <p className="text-xs text-gray-500">Añádelo al carrito y termina el pedido cuando quieras.</p>
              </div>
              <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                <Sparkles className="w-5 h-5 text-[#C0392B] mb-3" />
                <p className="text-sm font-bold mb-1">Presentación premium</p>
                <p className="text-xs text-gray-500">Ficha diseñada para transmitir calidad y confianza.</p>
              </div>
              <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-[#C0392B] mb-3" />
                <p className="text-sm font-bold mb-1">Pago protegido</p>
                <p className="text-xs text-gray-500">Checkout seguro con confirmación automática por email.</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-100 rounded-[1.75rem] p-7 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-[#C0392B]">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Por qué te va a gustar</span>
                </div>
                <p className="text-gray-600 leading-7 text-sm">
                  {product.description || `Este producto de ${product.category.toLowerCase()} está pensado para darte una experiencia de compra clara, elegante y directa. Su ficha recoge los datos esenciales para que puedas decidir rápido y comprar con seguridad.`}
                </p>
                <div className="mt-5 space-y-3">
                  {highlights.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-[1.75rem] p-7 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-[#C0392B]">
                  <Ruler className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Ficha técnica</span>
                </div>
                <div className="space-y-3">
                  {specs.map((spec) => (
                    <div key={`${spec.label}-${spec.value}`} className="flex items-start justify-between gap-6 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                      <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">{spec.label}</span>
                      <span className="text-sm font-medium text-gray-900 text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:sticky lg:top-28 space-y-6">
            <div className="bg-white border border-gray-100 rounded-[1.75rem] p-7 shadow-[0_16px_50px_rgba(26,26,26,0.08)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Resumen rápido</p>
                  <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {product.name}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Precio</p>
                  <p className="text-3xl font-black text-[#C0392B]">{price}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-wider">
                  <Package className="w-3.5 h-3.5" /> {product.category}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-wider">
                  <Clock3 className="w-3.5 h-3.5" /> Stock {stock > 0 ? 'disponible' : 'agotado'}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="h-12 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  disabled={stock <= 0}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center font-bold text-lg">
                  {quantity}
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.min(stock || 1, prev + 1))}
                  className="h-12 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  disabled={stock <= 0}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={stock <= 0}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-[#C0392B] text-white text-xs font-black uppercase tracking-wider shadow-lg hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Añadir al carrito
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={stock <= 0}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-4 rounded-xl border border-gray-200 bg-white text-gray-900 text-xs font-black uppercase tracking-wider hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Ir al carrito <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-6 space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Confirmación automática y seguimiento del pedido desde tu cuenta.</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C0392B] shrink-0 mt-0.5" />
                  <span>Disponible para envío a domicilio o recogida en tienda.</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] text-white rounded-[1.75rem] p-7 shadow-[0_16px_50px_rgba(26,26,26,0.12)]">
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/60 font-bold mb-3">Servicio premium</p>
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                Te ayudamos a elegir bien
              </h3>
              <p className="text-sm text-white/75 leading-7">
                Si quieres comparar este producto con otros similares, podemos prepararte una recomendación personalizada con los modelos más parecidos del catálogo.
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-20">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#C0392B] mb-2">Relacionados</p>
              <h2 className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                Productos parecidos
              </h2>
            </div>
            <Link to="/productos" className="text-sm font-semibold text-gray-500 hover:text-gray-900">
              Ver catálogo completo
            </Link>
          </div>

          {related.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-10 text-center text-gray-400 text-sm">
              No hemos encontrado productos similares todavía.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((item) => {
                const itemOut = Number(item.stock || 0) <= 0;

                return (
                  <div
                    key={item.id}
                    className="group cursor-pointer bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(`/productos/${item.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/productos/${item.id}`);
                      }
                    }}
                  >
                    <div className="relative aspect-[4/3] bg-[#F8F6F3]">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {itemOut && (
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                          <span className="bg-white text-gray-900 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                            Agotado
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#C0392B] mb-1">{item.category}</p>
                      <h3 className="font-bold text-base text-gray-900 line-clamp-2 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {item.name}
                      </h3>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-black text-gray-900">{money(item.price)}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/productos/${item.id}`);
                          }}
                          className="text-xs font-black uppercase tracking-wider text-[#C0392B]"
                        >
                          Ver ficha
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
