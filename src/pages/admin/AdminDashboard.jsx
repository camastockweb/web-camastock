import React, { useState, useEffect } from 'react';
import { User, Package, ShoppingCart, Users, TrendingUp, Trash2, Edit2, Upload, FolderPlus, X, Eye, Calendar, MapPin, Phone, FileText, Download, Search, Truck, Save, Mail } from 'lucide-react';import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { downloadInvoicePdf } from '@/lib/invoicePdf';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('resumen');
  
  // Estados de carga y datos
  const [productos, setProductos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pedidos, setPedidos] = useState([]); 
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null); 
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState(null); // <-- Estado para el perfil del cliente

  // Estados de filtros y logística
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

  // Estados del formulario unificado
  const [idEditando, setIdEditando] = useState(null);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('10');
  const [categoria, setCategoria] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [madeInSpain, setMadeInSpain] = useState(true);
  const [nuevaCategoriaNombre, setNuevaCategoriaNombre] = useState('');

  // --- RECOLECTOR CENTRAL DE INFORMACIÓN ---
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const { data: prodData } = await supabase.from('products').select('*').order('id', { ascending: false });
      if (prodData) setProductos(prodData);

      const { data: catData } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (catData) {
        setCategories(catData);
        if (catData.length > 0 && !categoria) setCategoria(catData[0].name);
      }

      const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (ordersData) setPedidos(ordersData);
    } catch (err) {
      console.error("Error cargando base de datos:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- ESCUCHADORES EN TIEMPO REAL ---
  useEffect(() => {
    cargarDatos();

    const canalProductos = supabase
      .channel('live-productos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => { cargarDatos(); })
      .subscribe();

    const canalPedidos = supabase
      .channel('live-pedidos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { cargarDatos(); })
      .subscribe();

    return () => {
      supabase.removeChannel(canalProductos);
      supabase.removeChannel(canalPedidos);
    };
  }, []);

  // Sincronizar pedido abierto
  useEffect(() => {
    if (pedidoSeleccionado) {
      const pedidoActualizado = pedidos.find(p => p.id === pedidoSeleccionado.id);
      if (pedidoActualizado) setPedidoSeleccionado(pedidoActualizado);
    }
  }, [pedidos]);

  // Sincronizar formulario de logística
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

  // --- ALGORITMO MAESTRO: EXTRACCIÓN DE CLIENTES ÚNICOS ---
  const obtenerClientesUnicos = () => {
    const clientesMap = {};
    pedidos.forEach(pedido => {
      const userId = pedido.user_id;
      const addr = pedido.shipping_address || {};
      
      if (!clientesMap[userId]) {
        clientesMap[userId] = {
          id: userId,
          nombre: addr.destinatario || 'Cliente de CamaStock',
          email: addr.email || 'Correo no vinculado',
          telefono: addr.telefono || 'No facilitado',
          pedidosAsociados: [],
          totalInvertido: 0
        };
      }
      clientesMap[userId].pedidosAsociados.push(pedido);
      if (pedido.status !== 'Cancelado') {
        clientesMap[userId].totalInvertido += parseFloat(pedido.total);
      }
    });
    return Object.values(clientesMap);
  };

  const listaClientes = obtenerClientesUnicos();
  const clienteSeleccionado = listaClientes.find(c => c.id === clienteSeleccionadoId);

  // --- INTERACCIÓN CRUZADA TELETRANSPORTE ---
  const irAFichaCliente = (userId) => {
    setClienteSeleccionadoId(userId);
    setActiveTab('clientes');
  };

  const irAPedidoDesdeCliente = (pedido) => {
    setPedidoSeleccionado(pedido);
    setActiveTab('pedidos');
  };

  // --- LÓGICAS DE NEGOCIO ---
  const handleCambiarEstadoPedido = async (orderId, nuevoEstado) => {
    const { error } = await supabase.from('orders').update({ status: nuevoEstado }).eq('id', orderId);
    if (!error) cargarDatos(); else alert("No se pudo cambiar el estado: " + error.message);
  };

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
      const { error } = await supabase.from('orders').update({ shipping_address: shippingAddress }).eq('id', pedidoSeleccionado.id);
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

  const handleSubirImagenLocal = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoImagen(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setImagenUrl(data.publicUrl);
    } catch (err) {
      alert("Error al subir la imagen: " + err.message);
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    if (!nombre || !precio || !stock || !imagenUrl) return alert("Rellena todos los campos.");
    const productoPayload = { name: nombre, price: parseFloat(precio), stock: parseInt(stock), category: categoria, image: imagenUrl, made_in_spain: madeInSpain };
    if (idEditando) {
      const { error } = await supabase.from('products').update(productoPayload).eq('id', idEditando);
      if (!error) { setIdEditando(null); resetFormulario(); cargarDatos(); }
    } else {
      const { error } = await supabase.from('products').insert([productoPayload]);
      if (!error) { resetFormulario(); cargarDatos(); }
    }
  };

  const handleCrearCategoria = async (e) => {
    e.preventDefault();
    if (!nuevaCategoriaNombre.trim()) return;
    const { error } = await supabase.from('categories').insert([{ name: nuevaCategoriaNombre.trim() }]);
    if (!error) { setNuevaCategoriaNombre(''); cargarDatos(); }
  };

  const handleEliminarCategoria = async (id, nombreCat) => {
    if (confirm(`¿Eliminar la categoría "${nombreCat}"?`)) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) cargarDatos();
    }
  };

  const activarModoEdicion = (prod) => {
    setIdEditando(prod.id); setNombre(prod.name); setPrecio(prod.price); setStock(prod.stock.toString()); setCategoria(prod.category); setImagenUrl(prod.image); setMadeInSpain(prod.made_in_spain);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminarProducto = async (id) => {
    if (confirm('¿Eliminar producto definitivamente?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) cargarDatos();
    }
  };

  const resetFormulario = () => {
    setIdEditando(null); setNombre(''); setPrecio(''); setStock('10'); setImagenUrl(''); setMadeInSpain(true);
    if (categories.length > 0) setCategoria(categories[0].name);
  };

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

  const calcularIngresosTotales = () => {
    return pedidos.filter(p => p.status !== 'Cancelado').reduce((sum, p) => sum + parseFloat(p.total), 0).toFixed(2);
  };

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const addr = pedido.shipping_address || {};
    const textoBusqueda = `${pedido.id} ${pedido.status} ${addr.destinatario || ''} ${addr.tracking_number || ''} ${addr.carrier || ''}`.toLowerCase();
    const coincideBusqueda = !busquedaPedidos.trim() || textoBusqueda.includes(busquedaPedidos.trim().toLowerCase());
    const coincideFiltro = filtroPedidos === 'todos' || pedido.status === filtroPedidos;
    return coincideBusqueda && coincideFiltro;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-900 pt-20 md:pt-24">
      
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
          {/* BOTÓN DE CLIENTES RESTAURADO */}
          <button onClick={() => { setActiveTab('clientes'); setClienteSeleccionadoId(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'clientes' ? 'bg-[#C0392B]' : 'hover:bg-gray-800'}`}>
            <Users className="w-4 h-4" /> Clientes
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cerrar sesión</button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-grow p-10 overflow-y-auto">
        
        {/* PESTAÑA 1: RESUMEN */}
        {activeTab === 'resumen' && (
          <>
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Panel de Control</h1>
              <p className="text-gray-500 mt-1">Hola {user?.user_metadata?.nombre || 'Administrador'}, este es el estado operativo de CamaStock.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Facturación Bruta</h3>
                <p className="text-3xl font-bold text-emerald-600">{calcularIngresosTotales()}€</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Pedidos</h3>
                <p className="text-3xl font-bold text-gray-900">{pedidos.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Clientes</h3>
                <p className="text-3xl font-bold text-gray-900">{listaClientes.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Artículos</h3>
                <p className="text-3xl font-bold text-gray-900">{productos.length}</p>
              </div>
            </div>
          </>
        )}

        {/* PESTAÑA 2: PRODUCTOS */}
        {activeTab === 'productos' && (
          <div>
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Gestión de Catálogo</h1>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {idEditando ? 'Editar Artículo' : 'Nuevo Artículo'}
                  </h3>
                  {idEditando && <button onClick={resetFormulario} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"><X className="w-4 h-4" /></button>}
                </div>
                <form onSubmit={handleGuardarProducto} className="space-y-4 text-sm">
                  <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del modelo" className="w-full border rounded-lg p-2.5 bg-white border-gray-300 focus:outline-none focus:border-[#C0392B]" required />
                  <div className="grid grid-cols-3 gap-3">
                    <input type="number" min="0" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Precio" className="w-full border rounded-lg p-2.5 bg-white border-gray-300" required />
                    <input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock" className="w-full border rounded-lg p-2.5 bg-white border-gray-300" required />
                    <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full border rounded-lg p-2.5 bg-white border-gray-300">
                      {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center justify-center gap-2 w-full border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 cursor-pointer text-gray-600">
                      <Upload className="w-4 h-4 text-gray-400" /> <span>{subiendoImagen ? 'Subiendo...' : 'Subir desde ordenador'}</span>
                      <input type="file" accept="image/*" onChange={handleSubirImagenLocal} className="hidden" disabled={subiendoImagen} />
                    </label>
                    <input type="text" value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} placeholder="O URL externa de imagen" className="w-full border rounded-lg p-2.5 bg-white border-gray-300 text-xs" required />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="spain" checked={madeInSpain} onChange={(e) => setMadeInSpain(e.target.checked)} className="rounded text-[#C0392B]" />
                    <label htmlFor="spain" className="text-xs font-medium text-gray-700 select-none">Sello Fabricado en España</label>
                  </div>
                  <button type="submit" className={`w-full py-3 text-white font-bold rounded-lg text-xs uppercase ${idEditando ? 'bg-amber-600' : 'bg-[#C0392B]'}`}>{idEditando ? 'Guardar Cambios' : 'Publicar'}</button>
                </form>
              </div>
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50/50 font-bold text-sm">Artículos en exposición ({productos.length})</div>
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
                            {prod.stock <= 0 ? <span className="text-[10px] font-bold text-red-600">¡AGOTADO!</span> : <span className="text-[10px] font-medium text-gray-500">Stock: {prod.stock} uds</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-gray-900 mr-4">{prod.price}€</span>
                        <button onClick={() => activarModoEdicion(prod)} className="p-2 text-gray-400 hover:text-amber-600"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleEliminarProducto(prod.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: CATEGORÍAS */}
        {activeTab === 'categorias' && (
          <div>
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Categorías Productos</h1>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Crear Nueva Categoría</h3>
                <form onSubmit={handleCrearCategoria} className="space-y-3">
                  <input type="text" value={nuevaCategoriaNombre} onChange={(e) => setNuevaCategoriaNombre(e.target.value)} placeholder="Ej. Somieres..." className="w-full text-sm border rounded-lg p-2.5 bg-white border-gray-300" required />
                  <button type="submit" className="w-full py-2.5 bg-gray-900 text-white font-semibold rounded-lg text-xs uppercase">Crear categoría</button>
                </form>
              </div>
              <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50/50 font-bold text-sm">Estructuras Registradas ({categories.length})</div>
                <div className="divide-y divide-gray-100">
                  {categories.map(cat => (
                    <div key={cat.id} className="p-4 flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-800">{cat.name}</span>
                      <button onClick={() => handleEliminarCategoria(cat.id, cat.name)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: PEDIDOS */}
        {activeTab === 'pedidos' && (
          <div>
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Gestión de Ventas</h1>
            </header>

            <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" value={busquedaPedidos} onChange={(e) => setBusquedaPedidos(e.target.value)}
                  placeholder="Buscar pedidos por cliente, tracking o ID"
                  className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm bg-white border-gray-300 focus:outline-none focus:border-[#C0392B]"
                />
              </div>
              <select value={filtroPedidos} onChange={(e) => setFiltroPedidos(e.target.value)} className="border rounded-lg px-3 py-2.5 text-xs bg-white border-gray-300 focus:outline-none focus:border-[#C0392B]">
                <option value="todos">Todos los estados</option>
                <option value="Procesando">Procesando</option>
                <option value="Preparando">Preparando</option>
                <option value="Listo para recogida">Listo para recogida</option>
                <option value="Enviado">Enviado</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50/50 font-bold text-sm">Pedidos Registrados ({pedidosFiltrados.length})</div>
                <div className="divide-y divide-gray-100 text-sm">
                  {pedidosFiltrados.map((pedido) => {
                    const addr = pedido.shipping_address || {};
                    return (
                      <div key={pedido.id} onClick={() => setPedidoSeleccionado(pedido)} className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors ${pedidoSeleccionado?.id === pedido.id ? 'bg-gray-50 border-l-4 border-[#C0392B]' : 'hover:bg-gray-50/50'}`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-gray-900">#CS-{pedido.id}</span>
                            <span className="text-gray-300">•</span>
                            <span className="font-semibold text-gray-800">{addr.destinatario || 'Cliente'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(pedido.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-gray-900">{pedido.total}€</span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${obtenerEstilosBadge(pedido.status)}`}>{pedido.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-2">
                {pedidoSeleccionado ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6 text-sm animate-fadeIn">
                    <div className="flex justify-between items-start border-b pb-4 border-gray-100">
                      <div>
                        <h3 className="font-mono font-black text-lg text-gray-900">PEDIDO #CS-{pedidoSeleccionado.id}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Recibido: {new Date(pedidoSeleccionado.created_at).toLocaleString('es-ES')}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleDescargarFactura(pedidoSeleccionado)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold hover:bg-gray-50"><Download className="w-3.5 h-3.5" /> Factura</button>
                        <button onClick={() => setPedidoSeleccionado(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"><X className="w-4 h-4" /></button>
                      </div>
                    </div>

                    <div className="bg-gray-50 border p-4 rounded-xl space-y-2 border-gray-200">
                      <label className="block text-xs font-bold text-gray-600 uppercase">Estado de la Operación</label>
                      <select value={pedidoSeleccionado.status} onChange={(e) => handleCambiarEstadoPedido(pedidoSeleccionado.id, e.target.value)} className="w-full border rounded-lg p-2 bg-white font-semibold text-xs uppercase focus:outline-none focus:border-[#C0392B]">
                        <option value="Procesando">Procesando (En almacén)</option>
                        <option value="Preparando">Preparando (Listo para salida)</option>
                        <option value="Listo para recogida">Listo para recogida</option>
                        <option value="Enviado">Enviado (En reparto)</option>
                        <option value="Entregado">🟢 Entregado (Cerrado)</option>
                        <option value="Cancelado">🔴 Cancelado</option>
                      </select>
                    </div>

                    {/* INTERACCIÓN CRUZADA: ENLACE A CLIENTES */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Contacto</h4>
                      <div onClick={() => irAFichaCliente(pedidoSeleccionado.user_id)} className="bg-white p-4 border rounded-xl border-gray-200 hover:border-[#C0392B] hover:bg-red-50/10 cursor-pointer transition-all group flex flex-col gap-1">
                        <p className="font-bold text-gray-900 group-hover:text-[#C0392B] flex items-center justify-between">
                          {pedidoSeleccionado.shipping_address?.destinatario}
                          <span className="text-[10px] font-bold bg-gray-100 text-gray-500 group-hover:bg-[#C0392B] group-hover:text-white px-2 py-0.5 rounded transition-colors">Ver Perfil →</span>
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {pedidoSeleccionado.shipping_address?.telefono}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Reparto</h4>
                      <div className="bg-white p-3 border rounded-lg border-gray-100">
                        {pedidoSeleccionado.shipping_address?.metodo_entrega === 'recogida' ? (
                          <p className="font-medium text-amber-700 bg-amber-50/50 p-1.5 rounded text-xs">Recogida personal en tienda.</p>
                        ) : (
                          <div className="text-xs font-medium text-gray-700">
                            <p className="font-bold text-gray-900 text-sm">{pedidoSeleccionado.shipping_address?.datos_envio?.calle}</p>
                            <p>CP: {pedidoSeleccionado.shipping_address?.datos_envio?.cp} • {pedidoSeleccionado.shipping_address?.datos_envio?.ciudad}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* LOGÍSTICA INTEGRADA */}
                    <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-[#C0392B]" /> Logística</h4>
                        <button onClick={handleGuardarLogistica} disabled={guardandoLogistica} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 disabled:opacity-60"><Save className="w-3.5 h-3.5" /> {guardandoLogistica ? '...' : 'Guardar'}</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" value={logisticaForm.carrier} onChange={(e) => setLogisticaForm(prev => ({ ...prev, carrier: e.target.value }))} placeholder="Transportista" className="w-full border rounded-lg p-2.5 text-xs" />
                        <input type="text" value={logisticaForm.tracking_number} onChange={(e) => setLogisticaForm(prev => ({ ...prev, tracking_number: e.target.value }))} placeholder="Nº de seguimiento" className="w-full border rounded-lg p-2.5 text-xs" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400 text-xs flex flex-col items-center justify-center h-48">
                    <Eye className="w-8 h-8 text-gray-300 mb-2 stroke-[1.5]" />
                    Selecciona un pedido de la lista para desglosar la hoja de ruta y gestionar su envío.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PESTAÑA 5: CLIENTES RESTAURADA */}
        {/* ========================================================================= */}
        {activeTab === 'clientes' && (
          <div>
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Expedientes de Clientes</h1>
              <p className="text-gray-500 mt-1">Historial analítico de compradores, canales de contacto y facturación acumulada.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              
              <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50/50 font-bold text-sm" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Compradores Registrados ({listaClientes.length})
                </div>
                {listaClientes.length === 0 ? (
                  <div className="p-10 text-center text-gray-400 text-sm">Aún no hay clientes registrados en el sistema.</div>
                ) : (
                  <div className="divide-y divide-gray-100 text-sm">
                    {listaClientes.map((cliente) => (
                      <div
                        key={cliente.id}
                        onClick={() => setClienteSeleccionadoId(cliente.id)}
                        className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors ${clienteSeleccionadoId === cliente.id ? 'bg-gray-50 border-l-4 border-[#C0392B]' : 'hover:bg-gray-50/50'}`}
                      >
                        <div className="space-y-1">
                          <p className="font-bold text-gray-900 text-sm">{cliente.nombre}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                            <span className="flex items-center gap-1 text-gray-600 font-medium"><Mail className="w-3 h-3 text-[#C0392B]" /> {cliente.email}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {cliente.telefono}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Inversión</p>
                          <p className="font-black text-gray-900">{cliente.totalInvertido.toFixed(2)}€</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-2">
                {clienteSeleccionado ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6 text-sm">
                    <div className="flex justify-between items-start border-b pb-4 border-gray-100">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>Ficha de Cliente</h3>
                        <p className="text-xs text-gray-400 mt-0.5">ID Única: {clienteSeleccionado.id.substring(0, 8)}...</p>
                      </div>
                      <button onClick={() => setClienteSeleccionadoId(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"><X className="w-4 h-4" /></button>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Canales de Comunicación</h4>
                      <div className="bg-gray-50 p-4 border rounded-xl border-gray-200 space-y-2.5 font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{clienteSeleccionado.nombre}</span>
                        </div>
                        <div className="flex items-center gap-2 border-t pt-2 border-gray-200/50">
                          <Mail className="w-4 h-4 text-[#C0392B]" />
                          <a href={`mailto:${clienteSeleccionado.email}`} className="text-blue-600 hover:underline">{clienteSeleccionado.email}</a>
                        </div>
                        <div className="flex items-center gap-2 border-t pt-2 border-gray-200/50">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a href={`tel:${clienteSeleccionado.telefono}`} className="hover:underline">{clienteSeleccionado.telefono}</a>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 border p-3 rounded-lg text-center border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Pedidos Totales</p>
                        <p className="text-xl font-black text-gray-900 mt-1">{clienteSeleccionado.pedidosAsociados.length}</p>
                      </div>
                      <div className="bg-gray-50 border p-3 rounded-lg text-center border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Volumen de Compra</p>
                        <p className="text-xl font-black text-emerald-600 mt-1">{clienteSeleccionado.totalInvertido.toFixed(2)}€</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Historial de Adquisición</h4>
                      <div className="border rounded-xl overflow-hidden divide-y divide-gray-100 border-gray-200">
                        {clienteSeleccionado.pedidosAsociados.map((item) => (
                          <div 
                            key={item.id}
                            onClick={() => irAPedidoDesdeCliente(item)}
                            className="p-3 bg-white hover:bg-gray-50 flex justify-between items-center text-xs cursor-pointer transition-colors group"
                            title="Ver desglose completo de este pedido"
                          >
                            <div className="space-y-0.5">
                              <p className="font-mono font-bold text-gray-900 group-hover:text-[#C0392B]">#CS-{item.id}</p>
                              <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-900">{item.total}€</span>
                              <span className="text-gray-300 group-hover:text-[#C0392B] font-bold transition-colors">→</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400 text-xs flex flex-col items-center justify-center h-48">
                    <Users className="w-8 h-8 text-gray-300 mb-2 stroke-[1.5]" />
                    Selecciona un cliente para desglosar sus canales de contacto directos e historial completo de facturas.
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