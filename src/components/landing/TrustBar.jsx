import { Truck, Zap, Shield, CreditCard, Wrench } from 'lucide-react';
import { useScrollFadeIn } from '@/hooks/useScrollFadeIn';

const trustItems = [
  { Icon: Truck, title: 'Envío peninsular gratis', desc: 'A toda la Península' },
  { Icon: Zap, title: 'Entrega en 24h', desc: 'Rápido y puntual' },
  { Icon: Shield, title: 'Fabricado en España', desc: 'Calidad nacional' },
  { Icon: CreditCard, title: 'Financiación 0%', desc: 'Sin intereses' },
  { Icon: Wrench, title: 'Montaje incluido', desc: 'En tu domicilio' },
];

export default function TrustBar() {
  const ref = useScrollFadeIn();

  return (
    <section
      className="py-10"
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid rgba(26,26,26,0.06)',
        borderBottom: '1px solid rgba(26,26,26,0.06)',
      }}
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {trustItems.map((item, i) => {
            const ItemIcon = item.Icon;
            return (
              <div
                key={item.title}
                className="flex flex-col items-center text-center gap-3"
              >
                <div
                  className="w-10 h-10 flex items-center justify-center"
                  style={{
                    backgroundColor: 'rgba(192,57,43,0.15)',
                    border: '1px solid rgba(192,57,43,0.3)',
                  }}
                >
                  <ItemIcon className="w-4 h-4" style={{ color: '#C0392B' }} />
                </div>
                <span
                  className="font-semibold text-sm"
                  style={{ color: '#1A1A1A', fontFamily: 'Inter, sans-serif' }}
                >
                  {item.title}
                </span>
                <span
                  className="text-xs"
                  style={{ color: 'rgba(26,26,26,0.5)', fontFamily: 'Inter, sans-serif' }}
                >
                  {item.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}