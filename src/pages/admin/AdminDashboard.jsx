import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, TrendingUp, Trash2, Edit2, Upload, FolderPlus, X, Eye, Calendar, MapPin, Phone, FileText, Download, Search, Truck, Save } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { downloadInvoicePdf } from '@/lib/invoicePdf';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('resumen');
  
  // Estados de carga y datos
  const [productos, setProductos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pedidos, setPedidos] = useState([]); // <-- Nuevo estado para almacenar las órdenes
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null); // <-- Guarda el pedido activo en el visor
  const [busquedaPedidos, setBusquedaPedidos] = useState('');
  const [filtroPedidos, setFiltroPedidos] = useState('todos');
  const [guardandoLogistica, setGuardandoLogistica] = useState(false);
  const [logisticaForm, setLogisticaForm] = useState({
    carrier: '',
    tracking_number: '',
    estimated_delivery_date: '',
    logistics_notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  // Estados del formulario unificado (Añadir / Editar)
  const [idEditando, setIdEditando] = useState(null);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('10');
  const [categoria, setCategoria] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [madeInSpain, setMadeInSpain] = useState(true);

  // Estado para la nueva categoría
  const [nuevaCategoriaNombre, setNuevaCategoriaNombre] = useState('');

  // --- RECOLECTOR CENTRAL DE INFORMACIÓN ---
  const cargarDatos = async () => {
    setLoading(true);
    try {
      // 1. Traer productos
      const { data: prodData } = await supabase.from('products').select('*').order('id', { ascending: false });
      if (prodData) setProductos(prodData);

      // 2. Traer categorías dinámicas
      const { data: catData } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (catData) {
        setCategories(catData);
        if (catData.length > 0 && !categoria) setCategoria(catData[0].name);
      }

      // 3. Traer pedidos globales
      const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (ordersData) setPedidos(ordersData);
    } catch (err) {
      console.error("Error cargando base de datos:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- ESCUCHADORES EN TIEMPO REAL (REALTIME) ---
  useEffect(() => {
    cargarDatos();

    // Canal en vivo para PRODUCTOS
    const canalProductos = supabase
      .channel('live-productos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        cargarDatos(); 
      })
      .subscribe();

    // Canal en vivo para PEDIDOS (Si un cliente compra, salta al instante)
    const canalPedidos = supabase
      .channel('live-pedidos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        cargarDatos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canalProductos);
      supabase.removeChannel(canalPedidos);
    };
  }, []);

  // Sincronizar el pedido abierto a la derecha si sufre cambios en tiempo real
  useEffect(() => {
    if (pedidoSeleccionado) {
      const pedidoActualizado = pedidos.find(p => p.id === pedidoSeleccionado.id);
      if (pedidoActualizado) setPedidoSeleccionado(pedidoActualizado);
    }
  }, [pedidos]);

  useEffect(() => {
    if (!pedidoSeleccionado) return;

    const shipping = pedidoSeleccionado.shipping_address || {};
    setLogisticaForm({
      carrier: shipping.carrier || '',
      tracking_number: shipping.tracking_number || '',
      estimated_delivery_date: shipping.estimated_delivery_date || '',
      logistics_notes: shipping.logistics_notes || '',
    });
  }, [pedidoSeleccionado?.id]);

  // --- LOGICA DE CAMBIO DE ESTADO DE UN PEDIDO ---
  const handleCambiarEstadoPedido = async (orderId, nuevoEstado) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: nuevoEstado })
      .eq('id', orderId);

    if (!error) {
      cargarDatos();
    } else {
      alert("No se pudo cambiar el estado: " + error.message);
    }
  };

  // --- SUBIDA DE IMÁGENES LOCALES ---
  const handleSubirImagenLocal = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoImagen(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      setImagenUrl(data.publicUrl);

    } catch (err) {
      alert("Error al subir la imagen: " + err.message);
    } finally {
      setSubiendoImagen(false);
    }
  };

  // --- GUARDAR PRODUCTO ---
  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    if (!nombre || !precio || !stock || !imagenUrl) {
      alert("Por favor, rellena todos los campos obligatorios.");
      return;
    }

    const productoPayload = {
      name: nombre,
      price: parseFloat(precio),
      stock: parseInt(stock),
      category: categoria,
      image: imagenUrl,
      made_in_spain: madeInSpain
    };

    if (idEditando) {
      const { error } = await supabase.from('products').update(productoPayload).eq('id', idEditando);
      if (!error) {
        setIdEditando(null);
        resetFormulario();
        cargarDatos();
      } else {
        alert("Error al actualizar: " + error.message);
      }
    } else {
      const { error } = await supabase.from('products').insert([productoPayload]);
      if (!error) {
        resetFormulario();
        cargarDatos();
      } else {
        alert("Error al guardar: " + error.message);
      }
    }
  };

  // --- GESTIÓN DE CATEGORÍAS ---
  const handleCrearCategoria = async (e) => {
    e.preventDefault();
    if (!nuevaCategoriaNombre.trim()) return;

    const { error } = await supabase.from('categories').insert([{ name: nuevaCategoriaNombre.trim() }]);
    if (!error) {
      setNuevaCategoriaNombre('');
      cargarDatos();
    } else {
      alert("La categoría ya existe.");
    }
  };

  const handleEliminarCategoria = async (id, nombreCat) => {
    if (confirm(`¿Seguro que quieres eliminar la categoría "${nombreCat}"?`)) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) cargarDatos();
    }
  };

  // --- AUXILIARES ---
  const activarModoEdicion = (prod) => {
    setIdEditando(prod.id);
    setNombre(prod.name);
    setPrecio(prod.price);
    setStock(prod.stock.toString());
    setCategoria(prod.category);
    setImagenUrl(prod.image);
    setMadeInSpain(prod.made_in_spain);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminarProducto = async (id) => {
    if (confirm('¿Seguro que quieres eliminar este producto definitivamente?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) cargarDatos();
    }
  };

  const resetFormulario = () => {
    setIdEditando(null);
    setNombre('');
    setPrecio('');
    setStock('10');
    setImagenUrl('');
    setMadeInSpain(true);
    if (categories.length > 0) setCategoria(categories[0].name);
  };

  // Retorna el estilo de color exacto según el estado de la venta
  const obtenerEstilosBadge = (estado) => {
    switch (estado) {
      case 'Procesando': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Preparando': return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'Listo para recogida': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Enviado': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Entregado': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelado': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const addr = pedido.shipping_address || {};
    const textoBusqueda = `${pedido.id} ${pedido.status} ${addr.destinatario || ''} ${addr.tracking_number || ''} ${addr.carrier || ''}`.toLowerCase();
    const coincideBusqueda = !busquedaPedidos.trim() || textoBusqueda.includes(busquedaPedidos.trim().toLowerCase());
    const coincideFiltro = filtroPedidos === 'todos' || pedido.status === filtroPedidos;
    return coincideBusqueda && coincideFiltro;
  });

  const handleGuardarLogistica = async () => {
    if (!pedidoSeleccionado) return;

    setGuardandoLogistica(true);
    try {
      const shipping = pedidoSeleccionado.shipping_address || {};
      const shippingAddress = {
        ...shipping,
        carrier: logisticaForm.carrier.trim(),
        tracking_number: logisticaForm.tracking_number.trim(),
        estimated_delivery_date: logisticaForm.estimated_delivery_date.trim(),
        logistics_notes: logisticaForm.logistics_notes.trim(),
      };

      const { error } = await supabase
        .from('orders')
        .update({ shipping_address: shippingAddress })
        .eq('id', pedidoSeleccionado.id);

      if (error) throw error;
      cargarDatos();
    } catch (error) {
      alert('No se pudo guardar la logística: ' + error.message);
    } finally {
      setGuardandoLogistica(false);
    }
  };

  const handleDescargarFactura = (pedido) => {
    downloadInvoicePdf(pedido);
  };

  // Calcula los ingresos totales de la tienda sumando los pedidos que no estén cancelados
  const calcularIngresosTotales = () => {
    return pedidos
      .filter(p => p.status !== 'Cancelado')
      .reduce((sum, p) => sum + parseFloat(p.total), 0)
      .toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-900">
      
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>CamaStock Admin</h2>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <button onClick={() => { setActiveTab('resumen'); setPedidoSeleccionado(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'resumen' ? 'bg-[#C0392B]' : 'hover:bg-gray-800'}`}>
            <TrendingUp className="w-4 h-4" /> Resumen
          </button>
          <button onClick={() => { setActiveTab('productos'); setPedidoSeleccionado(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'productos' ? 'bg-[#C0392B]' : 'hover:bg-gray-800'}`}>
            <Package className="w-4 h-4" /> Productos
          </button>
          <button onClick={() => { setActiveTab('categorias'); setPedidoSeleccionado(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'categorias' ? 'bg-[#C0392B]' : 'hover:bg-gray-800'}`}>
            <FolderPlus className="w-4 h-4" /> Categorías
          </button>
          {/* BOTÓN MAESTRO DE PEDIDOS CON CONTADOR DOCK */}
          <button onClick={() => { setActiveTab('pedidos'); setPedidoSeleccionado(null); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pedidos' ? 'bg-[#C0392B]' : 'hover:bg-gray-800'}`}>
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-4 h-4" /> Pedidos
            </div>
            {pedidos.filter(p => p.status === 'Procesando').length > 0 && (
              <span className="bg-white text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pedidos.filter(p => p.status === 'Procesando').length}
              </span>
            )}
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cerrar sesión</button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-grow p-10 overflow-y-auto">
        
        {/* PESTAÑA 1: RESUMEN FINANCIERO */}
        {activeTab === 'resumen' && (
          <>
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Panel de Control</h1>
              <p className="text-gray-500 mt-1">Hola {user?.user_metadata?.nombre || 'Administrador'}, este es el estado operativo de CamaStock.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Facturación Bruta</h3>
                <p className="text-3xl font-bold text-emerald-600">{calcularIngresosTotales()}€</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Artículos en Catálogo</h3>
                <p className="text-3xl font-bold text-gray-900">{productos.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Pedidos Recibidos</h3>
                <p className="text-3xl font-bold text-gray-900">{pedidos.length}</p>
              </div>
            </div>
          </>
        )}

        {/* PESTAÑA 2: GESTIÓN DE PRODUCTOS */}
        {activeTab === 'productos' && (
          <div>
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Gestión de Catálogo</h1>
              <p className="text-gray-500 mt-1">Crea nuevos productos o edita las tarifas, stock y fotos de los existentes.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              
              {/* Formulario */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {idEditando ? 'Editar Artículo' : 'Nuevo Artículo'}
                  </h3>
                  {idEditando && (
                    <button onClick={resetFormulario} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <form onSubmit={handleGuardarProducto} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Nombre del modelo</label>
                    <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Colchón Viscoelástico" className="w-full border rounded-lg p-2.5 bg-white border-gray-300 focus:outline-none focus:border-[#C0392B]" required />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Precio (€)</label>
                      <input type="number" min="0" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="349" className="w-full border rounded-lg p-2.5 bg-white border-gray-300 focus:outline-none focus:border-[#C0392B]" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Stock (Uds)</label>
                      <input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="10" className="w-full border rounded-lg p-2.5 bg-white border-gray-300 focus:outline-none focus:border-[#C0392B]" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Categoría</label>
                      <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full border rounded-lg p-2.5 bg-white border-gray-300 focus:outline-none focus:border-[#C0392B]">
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Fotografía del producto</label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center justify-center gap-2 w-full border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors text-gray-600">
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium">{subiendoImagen ? 'Subiendo archivo...' : 'Subir desde mi ordenador'}</span>
                        <input type="file" accept="image/*" onChange={handleSubirImagenLocal} className="hidden" disabled={subiendoImagen} />
                      </label>
                      <input type="text" value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} placeholder="O URL externa de imagen" className="w-full border rounded-lg p-2.5 bg-white border-gray-300 text-xs focus:outline-none focus:border-[#C0392B]" required />
                    </div>
                    {imagenUrl && (
                      <div className="mt-2 relative rounded-lg overflow-hidden border border-gray-100 h-24 w-full">
                        <img src={imagenUrl} alt="Vista previa" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="spain" checked={madeInSpain} onChange={(e) => setMadeInSpain(e.target.checked)} className="rounded border-gray-300 text-[#C0392B] focus:ring-[#C0392B] bg-white" />
                    <label htmlFor="spain" className="text-xs font-medium text-gray-700 select-none">Sello Fabricado en España</label>
                  </div>

                  <button type="submit" className={`w-full py-3 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors mt-2 ${idEditando ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#C0392B] hover:bg-red-800'}`}>
                    {idEditando ? 'Guardar Cambios' : 'Publicar en la Tienda'}
                  </button>
                </form>
              </div>

              {/* Listado de Exposición */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50/50 font-bold text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Artículos en exposición ({productos.length})
                </div>
                <div className="divide-y divide-gray-100">
                  {productos.map((prod) => (
                    <div key={prod.id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={prod.image} alt={prod.name} className="w-12 h-12 object-cover rounded border bg-gray-50" />
                        <div>
                          <h4 className="font-bold text-sm text-gray-950">{prod.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] uppercase font-bold text-red-600 tracking-wide">{prod.category}</span>
                            <span className="text-gray-300">•</span>
                            {prod.stock <= 0 ? (
                              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">¡AGOTADO!</span>
                            ) : prod.stock <= 3 ? (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Stock crítico: {prod.stock} ud(s)</span>
                            ) : (
                              <span className="text-[10px] font-medium text-gray-500">Stock: {prod.stock} uds</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-gray-900 mr-4">{prod.price}€</span>
                        <button onClick={() => activarModoEdicion(prod)} className="p-2 text-gray-400 hover:text-amber-600 transition-colors rounded-full hover:bg-amber-50">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEliminarProducto(prod.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PESTAÑA 3: GESTIÓN DE CATEGORÍAS */}
        {activeTab === 'categorias' && (
          <div>
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Categorías del E-commerce</h1>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Crear Nueva Categoría</h3>
                <form onSubmit={handleCrearCategoria} className="space-y-3">
                  <input type="text" value={nuevaCategoriaNombre} onChange={(e) => setNuevaCategoriaNombre(e.target.value)} placeholder="Ej. Somieres..." className="w-full text-sm border rounded-lg p-2.5 bg-white border-gray-300 focus:outline-none focus:border-[#C0392B]" required />
                  <button type="submit" className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors">Crear categoría</button>
                </form>
              </div>
              <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50/50 font-bold text-sm">Estructuras Registradas ({categories.length})</div>
                <div className="divide-y divide-gray-100">
                  {categories.map(cat => (
                    <div key={cat.id} className="p-4 flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-800">{cat.name}</span>
                      <button onClick={() => handleEliminarCategoria(cat.id, cat.name)} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* NUEVA PESTAÑA 4: CUADRO DE CONTROL DE PEDIDOS AVANZADO */}
        {/* ========================================================================= */}
        {activeTab === 'pedidos' && (
          <div>
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Gestión de Ventas</h1>
              <p className="text-gray-500 mt-1">Controla los envíos, revisa datos de facturación e imprime hojas de ruta.</p>
            </header>

            <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={busquedaPedidos}
                  onChange={(e) => setBusquedaPedidos(e.target.value)}
                  placeholder="Buscar pedidos por cliente, tracking, transportista o ID"
                  className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm bg-white border-gray-300 focus:outline-none focus:border-[#C0392B]"
                />
              </div>
              <select
                value={filtroPedidos}
                onChange={(e) => setFiltroPedidos(e.target.value)}
                className="border rounded-lg px-3 py-2.5 text-xs bg-white border-gray-300 focus:outline-none focus:border-[#C0392B]"
              >
                <option value="todos">Todos los estados</option>
                <option value="Procesando">Procesando</option>
                <option value="Preparando">Preparando</option>
                <option value="Listo para recogida">Listo para recogida</option>
                <option value="Enviado">Enviado</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{pedidos.length}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Procesando</p>
                <p className="text-2xl font-bold text-blue-600">{pedidos.filter(p => p.status === 'Procesando').length}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Listo para recogida</p>
                <p className="text-2xl font-bold text-amber-600">{pedidos.filter(p => p.status === 'Listo para recogida').length}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Entregado</p>
                <p className="text-2xl font-bold text-emerald-600">{pedidos.filter(p => p.status === 'Entregado').length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              
              {/* COLUMNA IZQUIERDA: LISTADO DE PEDIDOS RECIBIDOS (3 COLUMNAS) */}
              <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50/50 font-bold text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Pedidos Registrados ({pedidosFiltrados.length})
                </div>
                
                {pedidosFiltrados.length === 0 ? (
                  <div className="p-10 text-center text-gray-400 text-sm">No ha entrado ninguna venta todavía en CamaStock.</div>
                ) : (
                  <div className="divide-y divide-gray-100 text-sm">
                    {pedidosFiltrados.map((pedido) => {
                      const addr = pedido.shipping_address || {};
                      return (
                        <div 
                          key={pedido.id} 
                          onClick={() => setPedidoSeleccionado(pedido)}
                          className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors ${pedidoSeleccionado?.id === pedido.id ? 'bg-gray-50 border-l-4 border-[#C0392B]' : 'hover:bg-gray-50/50'}`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-gray-900">#CS-{pedido.id}</span>
                              <span className="text-gray-300">•</span>
                              <span className="font-semibold text-gray-800">{addr.destinatario || 'Cliente'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(pedido.created_at).toLocaleDateString('es-ES')}</span>
                              <span>•</span>
                              <span className="uppercase tracking-wider font-bold text-[9px] text-[#C0392B]">
                                {addr.metodo_entrega === 'envio' ? 'A casa' : 'Recogida'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-bold text-gray-900">{pedido.total}€</span>
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${obtenerEstilosBadge(pedido.status)}`}>
                              {pedido.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* COLUMNA DERECHA: FICHA DETALLADA DINÁMICA (2 COLUMNAS) */}
              <div className="lg:col-span-2">
                {pedidoSeleccionado ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6 text-sm animate-fadeIn">
                    
                    {/* Cabecera del visor */}
                    <div className="flex justify-between items-start border-b pb-4 border-gray-100">
                      <div>
                        <h3 className="font-mono font-black text-lg text-gray-900">PEDIDO #CS-{pedidoSeleccionado.id}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Recibido: {new Date(pedidoSeleccionado.created_at).toLocaleString('es-ES')}</p>
                      </div>
                      <button onClick={() => setPedidoSeleccionado(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100">
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDescargarFactura(pedidoSeleccionado)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Factura
                      </button>
                    </div>

                    {/* CONTROLADOR DE ESTADO DEL ENVÍO */}
                    <div className="bg-gray-50 border p-4 rounded-xl space-y-2 border-gray-200">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Estado de la Operación</label>
                      <select 
                        value={pedidoSeleccionado.status} 
                        onChange={(e) => handleCambiarEstadoPedido(pedidoSeleccionado.id, e.target.value)}
                        className="w-full border rounded-lg p-2 bg-white border-gray-300 font-semibold text-xs uppercase tracking-wide focus:outline-none focus:border-[#C0392B]"
                      >
                        <option value="Procesando">Procesando (En almacén)</option>
                        <option value="Preparando">Preparando (Listo para salida)</option>
                        <option value="Listo para recogida">Listo para recogida (Disponible en tienda)</option>
                        <option value="Enviado">Enviado (En reparto)</option>
                        <option value="Entregado">🟢 Entregado (Cerrado)</option>
                        <option value="Cancelado">🔴 Cancelado</option>
                      </select>
                    </div>

                    {pedidoSeleccionado.shipping_address?.metodo_entrega === 'recogida' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-amber-900">Pedido para recogida en tienda</p>
                          <p className="text-xs text-amber-700 mt-1">
                            Cuando el pedido esté preparado, márcalo como <span className="font-semibold">Listo para recogida</span> para que el cliente vea el estado correcto.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCambiarEstadoPedido(pedidoSeleccionado.id, 'Listo para recogida')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition-colors"
                        >
                          Marcar listo
                        </button>
                      </div>
                    )}

                    {/* BLOQUE 1: DATOS DEL CLIENTE */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Información de Contacto</h4>
                      <div className="bg-white p-3 border rounded-lg space-y-1.5 border-gray-100">
                        <p className="font-semibold text-gray-900">{pedidoSeleccionado.shipping_address?.destinatario}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" /> {pedidoSeleccionado.shipping_address?.telefono || 'No facilitado'}</p>
                      </div>
                    </div>

                    {/* BLOQUE 2: DIRECCIÓN DE REPARTO */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Destino de Logística</h4>
                      <div className="bg-white p-3 border rounded-lg border-gray-100">
                        {pedidoSeleccionado.shipping_address?.metodo_entrega === 'recogida' ? (
                          <p className="font-medium text-amber-700 bg-amber-50/50 p-1.5 rounded text-xs">El cliente pasará a recogerlo personalmente por la tienda de Burgos.</p>
                        ) : (
                          <div className="text-xs space-y-1 font-medium text-gray-700">
                            <p className="font-bold text-gray-900 text-sm">{pedidoSeleccionado.shipping_address?.datos_envio?.calle}</p>
                            <p>CP: {pedidoSeleccionado.shipping_address?.datos_envio?.cp} • {pedidoSeleccionado.shipping_address?.datos_envio?.ciudad} (España)</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* BLOQUE 3: DATOS FISCALES / FACTURACIÓN */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Dirección Fiscal</h4>
                      <div className="bg-white p-3 border rounded-lg text-xs border-gray-100 font-medium text-gray-700">
                        <p className="font-bold text-gray-900">{pedidoSeleccionado.shipping_address?.datos_facturacion?.calle || 'Misma que entrega'}</p>
                        <p>CP: {pedidoSeleccionado.shipping_address?.datos_facturacion?.cp} • {pedidoSeleccionado.shipping_address?.datos_facturacion?.ciudad}</p>
                      </div>
                    </div>

                    <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-[#C0392B]" /> Logística y Tracking
                        </h4>
                        <button
                          type="button"
                          onClick={handleGuardarLogistica}
                          disabled={guardandoLogistica}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60"
                        >
                          <Save className="w-3.5 h-3.5" /> {guardandoLogistica ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={logisticaForm.carrier}
                          onChange={(e) => setLogisticaForm(prev => ({ ...prev, carrier: e.target.value }))}
                          placeholder="Transportista"
                          className="w-full border rounded-lg p-2.5 bg-white border-gray-300 text-xs focus:outline-none focus:border-[#C0392B]"
                        />
                        <input
                          type="text"
                          value={logisticaForm.tracking_number}
                          onChange={(e) => setLogisticaForm(prev => ({ ...prev, tracking_number: e.target.value }))}
                          placeholder="Número de seguimiento"
                          className="w-full border rounded-lg p-2.5 bg-white border-gray-300 text-xs focus:outline-none focus:border-[#C0392B]"
                        />
                        <input
                          type="text"
                          value={logisticaForm.estimated_delivery_date}
                          onChange={(e) => setLogisticaForm(prev => ({ ...prev, estimated_delivery_date: e.target.value }))}
                          placeholder="Entrega estimada"
                          className="w-full border rounded-lg p-2.5 bg-white border-gray-300 text-xs focus:outline-none focus:border-[#C0392B]"
                        />
                        <input
                          type="text"
                          value={logisticaForm.logistics_notes}
                          onChange={(e) => setLogisticaForm(prev => ({ ...prev, logistics_notes: e.target.value }))}
                          placeholder="Notas internas"
                          className="w-full border rounded-lg p-2.5 bg-white border-gray-300 text-xs focus:outline-none focus:border-[#C0392B]"
                        />
                      </div>
                    </div>

                    {/* BLOQUE 4: CARRITO DE LA COMPRA INTERNO */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Bultos Cargados</h4>
                      <div className="border rounded-xl overflow-hidden divide-y divide-gray-100 border-gray-200">
                        {pedidoSeleccionado.items?.map((item, idx) => (
                          <div key={idx} className="p-3 bg-gray-50/30 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-gray-900">{item.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium mt-0.5">Cantidad: {item.quantity} ud(s) • Unid: {item.price}€</p>
                            </div>
                            <span className="font-bold text-gray-800">{item.price * item.quantity}€</span>
                          </div>
                        ))}
                        <div className="p-3 bg-gray-50 flex justify-between items-center text-sm font-bold border-t border-gray-200">
                          <span className="text-gray-500">Total Facturado</span>
                          <span className="text-lg text-[#C0392B]">{pedidoSeleccionado.total}€</span>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Marcador de posición si no hay selección */
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400 text-xs flex flex-col items-center justify-center h-48">
                    <Eye className="w-8 h-8 text-gray-300 mb-2 stroke-[1.5]" />
                    Selecciona un pedido de la lista para desglosar la hoja de ruta y gestionar su envío.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
