import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { cart, isDrawerOpen, setIsDrawerOpen, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Fondo oscuro translúcido de fondo */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
          />

          {/* Panel Lateral */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 z-[101] w-full sm:w-[450px] bg-white shadow-2xl flex flex-col"
          >
            {/* Cabecera */}
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'rgba(26,26,26,0.08)' }}>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" style={{ color: '#C0392B' }} />
                <h2 className="text-lg font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}>Tu Cesta</h2>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lista de productos */}
            <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                  <ShoppingBag className="w-12 h-12 mb-3 stroke-[1.2]" />
                  <p className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Tu carrito está vacío</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 border rounded-xl bg-white" style={{ borderColor: 'rgba(26,26,26,0.1)' }}>
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-[#F8F6F3]" />
                    <div className="flex flex-col flex-grow justify-between">
                      <div>
                        <h4 className="font-semibold text-sm line-clamp-2" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}>{item.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        {/* Selector Cantidad Corregido */}
                        <div className="flex items-center border rounded-md" style={{ borderColor: 'rgba(26,26,26,0.15)' }}>
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-gray-100 text-gray-700 transition-colors"><Minus className="w-3 h-3" /></button>
                          {/* Aquí está la corrección del número invisible */}
                          <span className="w-6 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-gray-100 text-gray-700 transition-colors"><Plus className="w-3 h-3" /></button>
                        </div>
                        {/* Precio y eliminar */}
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-gray-900">{item.price * item.quantity}€</span>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer con totales y botones */}
            {cart.length > 0 && (
              <div className="p-6 border-t bg-[#F8F6F3]/50" style={{ borderColor: 'rgba(26,26,26,0.08)' }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>Total aproximado:</span>
                  <span className="text-xl font-bold" style={{ fontFamily: 'Inter, sans-serif', color: '#1A1A1A' }}>{cartTotal}€</span>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      navigate('/carrito');
                    }}
                    className="w-full text-center font-semibold text-xs uppercase tracking-wider py-3.5 border transition-colors bg-white hover:bg-gray-50"
                    style={{ fontFamily: 'Inter, sans-serif', borderColor: 'rgba(26,26,26,0.2)', color: '#1A1A1A' }}
                  >
                    Ver detalle del carrito
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}