import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { apiFetch } from '@/lib/api';
import { motion } from 'framer-motion';

export default function Exito() {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verifying, setVerifying] = useState(Boolean(sessionId));
  const [paid, setPaid] = useState(!sessionId);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const verificarPago = async () => {
      if (!sessionId) {
        clearCart();
        return;
      }

      try {
        const response = await apiFetch(`/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`);
        const data = await response.json();

        if (!isMounted) return;

        const estaPagado = data.payment_status === 'paid';
        setPaid(estaPagado);

        if (estaPagado) {
          clearCart();
          setMessage('Hemos confirmado el cobro y ya estamos preparando tu pedido.');
        } else {
          setMessage('Stripe todavía está terminando de confirmar el pago. Si ya has pagado, refresca en unos segundos.');
        }
      } catch (error) {
        if (!isMounted) return;
        setPaid(false);
        setMessage('No hemos podido verificar el pago todavía. Si el cobro se ha completado, el pedido aparecerá en tu cuenta en breve.');
      } finally {
        if (isMounted) setVerifying(false);
      }
    };

    verificarPago();

    return () => {
      isMounted = false;
    };
  }, [clearCart, sessionId]);

  return (
    <div className="min-h-screen bg-white pt-40 pb-24 flex items-center justify-center">
      <div className="max-w-xl mx-auto px-6 text-center">
        {verifying ? (
          <div className="bg-[#F8F6F3] rounded-2xl p-10 border border-gray-100">
            <Loader2 className="w-10 h-10 text-[#C0392B] animate-spin mx-auto mb-4" />
            <h1 className="mb-2 font-bold" style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 2.5rem)', color: '#1A1A1A' }}>
              Verificando el pago...
            </h1>
            <p className="text-gray-600 text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
              Estamos comprobando con Stripe que tu compra se ha completado correctamente.
            </p>
          </div>
        ) : paid ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500"
            >
              <CheckCircle className="w-12 h-12" />
            </motion.div>

            <h1 className="mb-4 font-bold" style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 2.5rem)', color: '#1A1A1A' }}>
              ¡Pago completado con éxito!
            </h1>

            <p className="text-gray-600 mb-6 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
              Hemos recibido tu pedido correctamente. {message || 'Te hemos enviado un correo de confirmación con los detalles de tu compra.'}
            </p>

            <div className="bg-[#F8F6F3] rounded-2xl p-6 mb-10 border text-left flex items-start gap-4" style={{ borderColor: 'rgba(26,26,26,0.08)' }}>
              <Package className="w-6 h-6 text-[#C0392B] shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Siguiente paso: preparación</h3>
                <p className="text-sm text-gray-600">
                  Nuestro equipo ya está procesando tu pedido. Te avisaremos en cuanto salga del almacén para coordinar la entrega o la recogida.
                </p>
              </div>
            </div>

            <Link
              to="/productos"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white text-sm font-bold tracking-wider uppercase transition-all shadow-lg hover:brightness-110"
              style={{ backgroundColor: '#C0392B', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 14px rgba(192,57,43,0.25)' }}
            >
              Seguir comprando <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        ) : (
          <div className="bg-white border border-amber-200 rounded-2xl p-8 text-left">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
              <div>
                <h1 className="mb-2 font-bold" style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.3rem)', color: '#1A1A1A' }}>
                  Estamos cerrando el pago
                </h1>
                <p className="text-gray-600 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {message || 'Si has completado el pago, tu pedido aparecerá en tu cuenta en unos segundos.'}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/carrito"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    Volver al carrito
                  </Link>
                  <Link
                    to="/productos"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#C0392B] rounded-lg text-sm font-semibold text-white hover:brightness-110 transition-colors"
                  >
                    Seguir comprando
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
