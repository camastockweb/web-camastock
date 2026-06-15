import React from 'react';

export default function AuthLayout({ children, icon: Icon, title, subtitle, footer }) {
  return (
    // Añadimos min-h-screen para ocupar toda la pantalla, pt-32 para esquivar el Navbar y el color de fondo suave
    <div className="min-h-screen bg-[#F8F6F3] pt-32 pb-12 flex flex-col justify-center sm:px-6 lg:px-8">
      
      {/* Cabecera (Icono, Título y Subtítulo) */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {Icon && (
          <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4 text-[#C0392B]">
            <Icon className="w-6 h-6" />
          </div>
        )}
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-center text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Tarjeta blanca del formulario */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-red-900/5 sm:rounded-2xl sm:px-10 border border-gray-100">
          {children}
        </div>
        
        {/* Footer (Enlaces para cambiar entre Login y Registro) */}
        {footer && (
          <div className="mt-6 text-center text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}