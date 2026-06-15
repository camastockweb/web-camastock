import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const whatsappNumber = '34XXXXXXXXX';
  const message = encodeURIComponent('Hola CamaStock, me gustaría recibir información sobre vuestros productos. ¡Gracias!');
  const href = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="whatsapp-pulse fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 shadow-2xl transition-transform hover:scale-110"
      style={{
        backgroundColor: '#C0392B',
        borderRadius: '50%',
        boxShadow: '0 0 24px rgba(192,57,43,0.5)',
      }}
    >
      <MessageCircle className="w-6 h-6 text-white" />
    </a>
  );
}