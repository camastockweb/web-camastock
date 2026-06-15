import Hero from '@/components/landing/Hero';
import TrustBar from '@/components/landing/TrustBar';
import WhyCamastock from '@/components/landing/WhyCamastock';
import Catalog from '@/components/landing/Catalog';
import Financing from '@/components/landing/Financing';
import Reviews from '@/components/landing/Reviews';
import Process from '@/components/landing/Process';
import Contact from '@/components/landing/Contact';
import Footer from '@/components/landing/Footer';
import WhatsAppButton from '@/components/landing/WhatsAppButton';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F6F3' }}>
      <main>
        <Hero />
        <TrustBar />
        <WhyCamastock />
        <Catalog />
        <Financing />
        <Reviews />
        <Process />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}