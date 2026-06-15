import { loadStripe } from '@stripe/stripe-js';

// Esto carga la clave pública de tu .env.local
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Inicializamos Stripe (usamos un patrón singleton para no cargarlo múltiples veces)
let stripePromise;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublicKey);
  }
  return stripePromise;
};