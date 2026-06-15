import { useState, useEffect } from 'react';
import { useCart } from '@/lib/CartContext';
import { useAuth } from '@/lib/AuthContext'; 
import { supabase } from '@/lib/supabase';   
import { apiFetch } from '@/lib/api';
import { Trash2, Plus, Minus, CreditCard, ShieldCheck, MapPin, Phone, User, Store, Truck, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Carrito() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const { user } = useAuth(); 
  const navigate = useNavigate();
  
  // Control de pasos: 1 = Revisar Cesta, 2 = Datos de Entrega o Recogida
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- ESTADOS DEL FORMULARIO DE CHECKOUT ---
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [metodoEntrega, setMetodoEntrega] = useState('envio'); // 'envio' o 'recogida'
  const esRecogida = metodoEntrega === 'recogida';
  const tituloPasoDos = esRecogida ? 'Recogida y Pago' : 'Envío y Pago';
  const tituloAccionPasoUno = esRecogida ? 'Continuar a Recogida' : 'Continuar al Envío';
  
  // Dirección de Entrega
  const [calleEnvio, setCalleEnvio] = useState('');
  const [cpEnvio, setCpEnvio] = useState('');
  const [ciudadEnvio, setCiudadEnvio] = useState('Burgos');

  // Dirección de Facturación
  const [mismaDireccion, setMismaDireccion] = useState(true); // Switch/Botón espejo
  const [calleFacturacion, setCalleFacturacion] = useState('');
  const [cpFacturacion, setCpFacturacion] = useState('');
  const [ciudadFacturacion, setCiudadFacturacion] = useState('Burgos');

  // Auto-llenado de datos del cliente cuando la sesión esté lista
  useEffect(() => {
    if (user?.user_metadata) {
      setNombre(user.user_metadata.nombre || '');
      setApellidos(user.user_metadata.apellidos || '');
    }
  }, [user]);

  // Efecto espejo: Si el botón de "utilizar misma dirección" está activo, copiamos los campos en caliente
  useEffect(() => {
    if (mismaDireccion && !esRecogida) {
      setCalleFacturacion(calleEnvio);
      setCpFacturacion(cpEnvio);
      setCiudadFacturacion(ciudadEnvio);
    }
  }, [calleEnvio, cpEnvio, ciudadEnvio, mismaDireccion, esRecogida]);

  useEffect(() => {
    if (esRecogida) {
      setMismaDireccion(false);
    } else {
      setMismaDireccion(true);
    }
  }, [esRecogida]);

  const handleIrAlEnvio = () => {
    if (!user) {
      alert("Para tramitar el pedido necesitas iniciar sesión o registrarte.");
      navigate('/login');
      return;
    }
    setStep(2); // Avanzamos al paso de datos de envío
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProcederAlPago = async (e) => {
    e.preventDefault();
    
    // Validaciones estrictas antes de conectar con el banco
    if (!telefono.trim()) return alert("El número de teléfono es obligatorio para el transportista.");
    if (!esRecogida && (!calleEnvio.trim() || !cpEnvio.trim())) {
      return alert("Por favor, rellena todos los campos de la dirección de entrega.");
    }
    if (!mismaDireccion && (!calleFacturacion.trim() || !cpFacturacion.trim() || !ciudadFacturacion.trim())) {
      return alert("Por favor, rellena la dirección de facturación o marca la opción de usar la misma.");
    }

    setIsProcessing(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        throw new Error('No se pudo comprobar tu sesión. Vuelve a iniciar sesión e inténtalo de nuevo.');
      }

      const response = await apiFetch('/api/crear-sesion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          cart,
          customer: {
            nombre,
            apellidos,
            telefono,
            metodoEntrega,
            ...(esRecogida ? {} : {
              calleEnvio,
              cpEnvio,
              ciudadEnvio,
            }),
            mismaDireccion: esRecogida ? false : mismaDireccion,
            ...(esRecogida
              ? {}
              : {
                  calleFacturacion,
                  cpFacturacion,
                  ciudadFacturacion,
                }),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo iniciar el proceso de pago.');
      }

      if (data.url) {
        window.location.href = data.url; 
      } else {
        throw new Error('Stripe no devolvió una URL de pago válida.');
      }
    } catch (error) {
      console.error("Error en la transacción:", error);
      alert("Hubo un problema al procesar tu solicitud: " + error.message);
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 text-gray-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        
        {/* Cabecera y migas de pan dinámicas */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b pb-6 border-gray-100">
          <div>
            <h1 className="font-bold text-3xl sm:text-4xl" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A' }}>
              Tramitación del Pedido
            </h1>
            <p className="text-gray-400 text-sm mt-1">Sigue los pasos para asegurar tu descanso.</p>
          </div>
          
          {/* Indicador visual de pasos */}
          <div className="flex items-center gap-3 text-xs font-bold tracking-wider uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
            <span className={`px-3 py-1.5 rounded-md ${step === 1 ? 'bg-[#C0392B] text-white' : 'bg-gray-100 text-gray-400'}`}>1. Cesta</span>
            <span className="text-gray-300">→</span>
            <span className={`px-3 py-1.5 rounded-md ${step === 2 ? 'bg-[#C0392B] text-white' : 'bg-gray-100 text-gray-400'}`}>2. {tituloPasoDos}</span>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white border rounded-2xl p-16 text-center max-w-xl mx-auto flex flex-col items-center" style={{ borderColor: 'rgba(26,26,26,0.08)' }}>
            <p className="text-lg font-medium text-gray-600 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Tu cesta está vacía actualmente.</p>
            <Link to="/productos" className="px-8 py-3.5 text-white text-xs font-semibold tracking-wider uppercase transition-colors hover:brightness-110" style={{ backgroundColor: '#C0392B' }}>Ver productos</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* ========================================================================= */}
            {/* PARTE IZQUIERDA: CONFIGURABLE SEGÚN EL PASO ACTIVO */}
            {/* ========================================================================= */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* PASO 1: REVISIÓN DE LOS PRODUCTOS DE LA CESTA */}
              {step === 1 && (
                <div className="flex flex-col gap-5">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl border p-6 flex flex-col sm:flex-row gap-6 items-center" style={{ borderColor: 'rgba(26,26,26,0.08)' }}>
                      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-[#F8F6F3]" />
                      <div className="flex-grow text-center sm:text-left">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-red-600 px-2 py-1 bg-red-50 rounded">{item.category}</span>
                        <h3 className="font-bold text-lg mt-2 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{item.name}</h3>
                        {item.made_in_spain && <p className="text-xs text-emerald-600 font-medium">✓ Envío nacional garantizado</p>}
                      </div>
                      <div className="flex items-center gap-6 justify-between w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0" style={{ borderColor: 'rgba(26,26,26,0.06)' }}>
                        <div className="flex items-center border rounded-lg bg-white" style={{ borderColor: 'rgba(26,26,26,0.15)' }}>
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-[#F8F6F3] text-gray-700"><Minus className="w-3.5 h-3.5" /></button>
                          <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-[#F8F6F3] text-gray-700"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{item.price * item.quantity}€</p>
                          <button onClick={() => removeFromCart(item.id)} className="text-xs text-gray-400 hover:text-red-600 mt-1 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Eliminar</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PASO 2: EL FORMULARIO AVANZADO DE ENVÍO Y FACTURACIÓN */}
              {step === 2 && (
                <div className="space-y-6">
                  
                  {/* Selector Premium de Entrega vs Recogida */}
                  <div className="bg-gray-50 p-2 rounded-xl grid grid-cols-2 gap-2 border border-gray-200">
                    <button 
                      type="button"
                      onClick={() => setMetodoEntrega('envio')}
                      className={`py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${metodoEntrega === 'envio' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      <Truck className={`w-4 h-4 ${metodoEntrega === 'envio' ? 'text-[#C0392B]' : ''}`} /> Envío a Domicilio
                    </button>
                    <button 
                      type="button"
                      onClick={() => setMetodoEntrega('recogida')}
                      className={`py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${metodoEntrega === 'recogida' ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      <Store className={`w-4 h-4 ${metodoEntrega === 'recogida' ? 'text-[#C0392B]' : ''}`} /> Recogida en Tienda
                    </button>
                  </div>

                  {esRecogida && (
                    <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <Store className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-amber-950">Tu pedido quedará listo para recogida en tienda</p>
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              Pendiente de preparar
                            </span>
                          </div>
                          <p className="text-sm text-amber-800">
                            No te pediremos dirección de envío. Solo necesitaremos tus datos de contacto y facturación para dejarlo preparado y avisarte cuando puedas pasar a recogerlo.
                          </p>
                          <p className="text-xs text-amber-700">
                            Recogida central en Burgos. Cuando el pedido cambie a <span className="font-semibold">Listo para recogida</span>, podrás pasar a por él sin coste adicional.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleProcederAlPago} className="space-y-6">
                    
                    {/* BLOQUE A: DATOS IDENTIFICATIVOS (AUTOCOMPLETADOS) */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2 border-b pb-3 border-gray-100">
                        <User className="w-4 h-4 text-[#C0392B]" /> Información de Contacto
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre</label>
                          <input type="text" value={nombre} className="w-full p-3 border rounded-xl bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed font-medium" disabled />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Apellidos</label>
                          <input type="text" value={apellidos} className="w-full p-3 border rounded-xl bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed font-medium" disabled />
                        </div>
                      </div>
                      <div className="text-sm">
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Número de Teléfono móvil {esRecogida ? '(Necesario para avisarte)' : '(Obligatorio para reparto)'}
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Phone className="w-4 h-4" /></span>
                            <input type="tel" placeholder="Ej: 600 123 456" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full pl-10 p-3 border rounded-xl bg-white border-gray-300 focus:outline-none focus:border-[#C0392B]" required />
                          </div>
                        </div>
                      </div>

                    {/* BLOQUE B: DIRECCIÓN DE ENVÍO (SOLO SI ES ENVÍO) */}
                    {!esRecogida && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2 border-b pb-3 border-gray-100">
                          <MapPin className="w-4 h-4 text-[#C0392B]" /> Dirección de Destino
                        </h3>
                        <div className="text-sm">
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Calle, Número, Piso y Puerta</label>
                          <input type="text" placeholder="Ej: Avenida del Cid Nº 42, 3º Izquierda" value={calleEnvio} onChange={(e) => setCalleEnvio(e.target.value)} className="w-full p-3 border rounded-xl bg-white border-gray-300 focus:outline-none focus:border-[#C0392B]" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Código Postal</label>
                            <input type="text" placeholder="Ej: 09005" value={cpEnvio} onChange={(e) => setCpEnvio(e.target.value)} className="w-full p-3 border rounded-xl bg-white border-gray-300 focus:outline-none focus:border-[#C0392B]" required />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Provincia / Ciudad</label>
                            <input type="text" value={ciudadEnvio} className="w-full p-3 border rounded-xl bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed font-medium" disabled />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* BLOQUE C: DIRECCIÓN DE FACTURACIÓN CON FUNCIÓN ESPEJO */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-gray-100">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#C0392B]" /> Datos de Facturación
                        </h3>
                        {/* El interruptor espejo solicitado */}
                        {!esRecogida && (
                          <button
                            type="button"
                            onClick={() => setMismaDireccion(!mismaDireccion)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${mismaDireccion ? 'bg-gray-900 border-transparent text-white' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                          >
                            {mismaDireccion ? '✓ Misma que la de Entrega' : 'Usar dirección diferente'}
                          </button>
                        )}
                      </div>

                      {/* Si desactivan el botón espejo, abrimos los campos de facturación */}
                      {!mismaDireccion && (
                        <div className="space-y-4 animate-fadeIn">
                          <div className="text-sm">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Domicilio Fiscal (Calle y número)</label>
                            <input type="text" placeholder="Ej: Calle Santander Nº 12, 1º" value={calleFacturacion} onChange={(e) => setCalleFacturacion(e.target.value)} className="w-full p-3 border rounded-xl bg-white border-gray-300 focus:outline-none focus:border-[#C0392B]" required />
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Código Postal</label>
                              <input type="text" placeholder="Ej: 09003" value={cpFacturacion} onChange={(e) => setCpFacturacion(e.target.value)} className="w-full p-3 border rounded-xl bg-white border-gray-300 focus:outline-none focus:border-[#C0392B]" required />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Ciudad de Facturación</label>
                              <input type="text" value={ciudadFacturacion} onChange={(e) => setCiudadFacturacion(e.target.value)} className="w-full p-3 border rounded-xl bg-white border-gray-300 focus:outline-none focus:border-[#C0392B]" required />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {mismaDireccion && !esRecogida && (
                        <p className="text-xs text-gray-400 font-medium italic">Se emitirá la factura vinculada al mismo domicilio de entrega indicado arriba.</p>
                      )}
                      {esRecogida && (
                        <p className="text-xs text-gray-400 font-medium italic">En recogida no pedimos dirección de envío. La factura se emitirá con los datos que nos facilites para facturación.</p>
                      )}
                    </div>

                    {/* BOTÓN INVISIBLE / CONTROLADORES DE SUBMIT */}
                    <button type="submit" id="submit-pago-oculto" className="hidden" />
                  </form>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* PARTE DERECHA: RESUMEN FINANCIERO FIJO */}
            {/* ========================================================================= */}
            <div className="bg-[#F8F6F3] rounded-xl p-8 sticky top-28 border border-gray-100">
              <h3 className="text-lg font-bold mb-4 border-b pb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1A1A', borderColor: 'rgba(26,26,26,0.08)' }}>Resumen del pedido</h3>
              
              <div className="flex justify-between text-sm text-gray-600 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span>Subtotal ({cartCount} uds.)</span>
                <span>{cartTotal}€</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span>Método seleccionado</span>
                <span className="text-gray-900 font-semibold uppercase text-xs">
                  {esRecogida ? 'Recogida Tienda' : 'Reparto a Casa'}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span>Gastos de gestión</span>
                <span className="text-emerald-600 font-semibold">Gratis</span>
              </div>

              <div className="flex justify-between border-t pt-4 mb-6" style={{ borderColor: 'rgba(26,26,26,0.08)' }}>
                <span className="font-bold text-base text-gray-900">Total</span>
                <span className="font-bold text-2xl" style={{ color: '#C0392B', fontFamily: 'Inter, sans-serif' }}>{cartTotal}€</span>
              </div>

              {/* ACCIONES DINÁMICAS SEGÚN EL PASO */}
              {step === 1 ? (
                <button
                  onClick={handleIrAlEnvio}
                  className="w-full text-center font-bold text-xs uppercase tracking-wider py-4 text-white transition-all shadow-lg hover:brightness-110"
                  style={{ backgroundColor: '#C0392B', fontFamily: 'Inter, sans-serif' }}
                >
                  {tituloAccionPasoUno}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => document.getElementById('submit-pago-oculto').click()}
                    disabled={isProcessing}
                    className={`w-full text-center font-bold text-xs uppercase tracking-wider py-4 text-white transition-all shadow-lg hover:brightness-110 flex items-center justify-center gap-2 ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: '#C0392B', fontFamily: 'Inter, sans-serif' }}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Enlazando pasarela...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" /> {esRecogida ? 'Confirmar y pagar' : 'Tramitar Pago Seguro'}
                        </>
                      )}
                  </button>
                  
                  <button
                    onClick={() => setStep(1)}
                    disabled={isProcessing}
                    className="w-full text-center font-bold text-[10px] uppercase tracking-wider py-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ← Modificar la Cesta
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 justify-center text-xs text-gray-500 mt-4">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Garantía de descanso CamaStock</span>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
