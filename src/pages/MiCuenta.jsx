import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  User,
  FileText,
  LogOut,
  Package,
  CheckCircle,
  Download,
  Truck,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { downloadInvoicePdf } from '@/lib/invoicePdf';

export default function MiCuenta() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('pedidos');
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nombre, setNombre] = useState(user?.user_metadata?.nombre || '');
  const [apellidos, setApellidos] = useState(user?.user_metadata?.apellidos || '');
  const [guardandoDatos, setGuardandoDatos] = useState(false);

  useEffect(() => {
    const cargarPedidosCliente = async () => {
      setLoading(true);

      if (!user?.id) {
        setPedidos([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) setPedidos(data);
      setLoading(false);
    };

    if (user) cargarPedidosCliente();
  }, [user]);

  const handleActualizarDatos = async (e) => {
    e.preventDefault();
    setGuardandoDatos(true);

    const { error } = await supabase.auth.updateUser({
      data: { nombre, apellidos },
    });

    if (!error) {
      alert('Tus datos personales se han actualizado correctamente.');
    } else {
      alert('Error al actualizar datos: ' + error.message);
    }

    setGuardandoDatos(false);
  };

  const obtenerBadgeEstado = (estado) => {
    switch (estado) {
      case 'Procesando':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Preparando':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'Listo para recogida':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Enviado':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Entregado':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelado':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const descargarFactura = (pedido) => {
    downloadInvoicePdf(pedido);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F3] pt-32 pb-24 text-gray-900">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="mb-10 border-b pb-6 border-gray-200">
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            Mi Cuenta
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Bienvenido, {user?.user_metadata?.nombre || 'Cliente'}. Gestiona tus compras e información desde aquí.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          <nav className="flex flex-col bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-left ${
                activeTab === 'pedidos' ? 'bg-[#C0392B] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Mis Pedidos
            </button>
            <button
              onClick={() => setActiveTab('perfil')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-left ${
                activeTab === 'perfil' ? 'bg-[#C0392B] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4" /> Datos Personales
            </button>
            <button
              onClick={() => setActiveTab('facturas')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-left ${
                activeTab === 'facturas' ? 'bg-[#C0392B] text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4" /> Facturas
            </button>
            <div className="border-t my-2 border-gray-100 pt-2">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
            </div>
          </nav>

          <div className="md:col-span-3 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm min-h-[400px]">
            {activeTab === 'pedidos' && (
              <div>
                <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Historial de Compras
                </h2>

                {loading ? (
                  <p className="text-gray-400 text-sm">Consultando tus pedidos...</p>
                ) : pedidos.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 flex flex-col items-center justify-center">
                    <Package className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-sm font-medium">Aún no has realizado ninguna compra en CamaStock.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pedidos.map((pedido) => (
                      <div key={pedido.id} className="border border-gray-200 rounded-xl overflow-hidden text-sm">
                        <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pedido ID</p>
                            <p className="font-mono text-gray-800 text-xs">#CS-{pedido.id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Fecha</p>
                            <p className="font-medium text-gray-700">{new Date(pedido.created_at).toLocaleDateString('es-ES')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total pagado</p>
                            <p className="font-bold text-gray-900">{pedido.total}€</p>
                          </div>
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border font-bold text-xs ${obtenerBadgeEstado(pedido.status)}`}>
                            <CheckCircle className="w-3.5 h-3.5" /> {pedido.status}
                          </div>
                        </div>

                        <div className="p-4 border-b border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Truck className="w-4 h-4 text-[#C0392B]" />
                            <span>{pedido.shipping_address?.metodo_entrega === 'recogida' ? 'Recogida en tienda' : 'Envío a domicilio'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin className="w-4 h-4 text-[#C0392B]" />
                            <span>{pedido.shipping_address?.metodo_entrega === 'recogida' ? 'Logística de recogida pendiente' : (pedido.shipping_address?.carrier || 'Logística pendiente')}</span>
                          </div>
                          <button
                            onClick={() => descargarFactura(pedido)}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-800 hover:bg-gray-50 transition-colors self-start sm:self-auto"
                          >
                            <Download className="w-3.5 h-3.5" /> Descargar factura
                          </button>
                        </div>

                        <div className="p-4 divide-y divide-gray-100">
                          {pedido.items?.map((item, idx) => (
                            <div key={idx} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                              <div>
                                <p className="font-bold text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-400 font-medium">Cantidad: {item.quantity || 1}</p>
                              </div>
                              <span className="font-semibold text-gray-600">{item.price}€</span>
                            </div>
                          ))}
                        </div>

                        {(pedido.shipping_address?.tracking_number || pedido.shipping_address?.estimated_delivery_date) && (
                          <div className="p-4 border-t border-gray-200 bg-[#F8F6F3] text-xs text-gray-600 space-y-1">
                            {pedido.shipping_address?.tracking_number && (
                              <p>
                                <span className="font-bold text-gray-800">Tracking:</span> {pedido.shipping_address.tracking_number}
                              </p>
                            )}
                            {pedido.shipping_address?.estimated_delivery_date && (
                              <p>
                                <span className="font-bold text-gray-800">Entrega estimada:</span>{' '}
                                {pedido.shipping_address.estimated_delivery_date}
                              </p>
                            )}
                          </div>
                        )}
                        {pedido.shipping_address?.metodo_entrega === 'recogida' && pedido.status === 'Listo para recogida' && (
                          <div className="p-4 border-t border-amber-200 bg-amber-50 text-xs text-amber-900">
                            Tu pedido ya está preparado. Puedes pasar a recogerlo por tienda cuando quieras dentro del horario habitual.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'perfil' && (
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Información Personal
                </h2>
                <p className="text-gray-400 text-xs mb-6">Modifica los datos de contacto que se imprimirán en tus hojas de entrega.</p>

                <form onSubmit={handleActualizarDatos} className="space-y-4 max-w-md text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full border rounded-xl p-3 bg-white border-gray-300 focus:outline-none focus:border-[#C0392B]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Apellidos</label>
                      <input
                        type="text"
                        value={apellidos}
                        onChange={(e) => setApellidos(e.target.value)}
                        className="w-full border rounded-xl p-3 bg-white border-gray-300 focus:outline-none focus:border-[#C0392B]"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Correo electrónico (No modificable)</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="w-full border rounded-xl p-3 bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={guardandoDatos}
                    className="px-6 py-3 bg-[#C0392B] hover:bg-red-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
                  >
                    {guardandoDatos ? 'Guardando...' : 'Actualizar mi perfil'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'facturas' && (
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Mis Facturas
                </h2>
                <p className="text-gray-400 text-xs mb-6">Descarga las facturas oficiales de tus compras en formato PDF.</p>

                {pedidos.length === 0 ? (
                  <p className="text-gray-400 text-sm">No hay facturas disponibles.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {pedidos.map((pedido) => (
                      <div key={pedido.id} className="py-4 flex items-center justify-between text-sm">
                        <div>
                          <p className="font-bold text-gray-900">Factura Simplificada CS-{pedido.id}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(pedido.created_at).toLocaleDateString('es-ES')} • Total: {pedido.total}€
                          </p>
                        </div>
                        <button
                          onClick={() => descargarFactura(pedido)}
                          className="inline-flex items-center gap-2 text-xs font-bold uppercase text-[#C0392B] hover:underline tracking-wider"
                        >
                          <Download className="w-3.5 h-3.5" /> Descargar PDF
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
