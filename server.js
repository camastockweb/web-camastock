import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmationEmail } from './server/orderEmail.js';

dotenv.config({ path: '.env.local' });

const app = express();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl = process.env.APP_URL || process.env.VITE_APP_URL || 'http://localhost:5173';
const port = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.CORS_ORIGINS || appUrl)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;
const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
}));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !supabaseAdmin) {
    return res.status(500).json({ error: 'Stripe o Supabase no están configurados correctamente.' });
  }

  if (!stripeWebhookSecret) {
    return res.status(500).json({ error: 'STRIPE_WEBHOOK_SECRET is not configured.' });
  }

  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const cart = JSON.parse(session.metadata?.cart || '[]');
      const customer = JSON.parse(session.metadata?.customer || '{}');
      const checkoutSessionId = session.id;

      const { data: existingOrder, error: existingOrderError } = await supabaseAdmin
        .from('orders')
        .select('id')
        .contains('shipping_address', { checkout_session_id: checkoutSessionId })
        .maybeSingle();

      if (existingOrderError) {
        throw existingOrderError;
      }

      if (existingOrder) {
        return res.json({ received: true, skipped: true });
      }

      const orderItems = cart.map((item) => ({
        id: item.id,
        name: item.n,
        price: Number(item.p),
        quantity: Number(item.q),
      }));

      const shippingAddress = {
        destinatario: customer.n || session.customer_details?.name || 'Cliente',
        telefono: customer.t || session.customer_details?.phone || '',
        email: session.customer_email || session.customer_details?.email || session.metadata?.customer_email || '',
        metodo_entrega: customer.m || 'envio',
        datos_envio:
          customer.m === 'envio'
            ? customer.se || {
                calle: session.shipping_details?.address?.line1 || '',
                cp: session.shipping_details?.address?.postal_code || '',
                ciudad: session.shipping_details?.address?.city || '',
              }
            : 'Recogida en Tienda Burgos',
        datos_facturacion: customer.f || {
          calle: session.customer_details?.address?.line1 || '',
          cp: session.customer_details?.address?.postal_code || '',
          ciudad: session.customer_details?.address?.city || '',
        },
        checkout_session_id: checkoutSessionId,
      };

      const { data: createdOrder, error: orderError } = await supabaseAdmin.from('orders').insert([
        {
          user_id: session.metadata?.user_id,
          total: Number((session.amount_total || 0) / 100),
          items: orderItems,
          shipping_address: shippingAddress,
          status: 'Procesando',
        },
      ]).select('*').single();

      if (orderError) {
        throw orderError;
      }

      for (const item of cart) {
        const quantity = Number(item.q || item.quantity || 0);
        if (!quantity) continue;

        const { data: product, error: productError } = await supabaseAdmin
          .from('products')
          .select('id, stock')
          .eq('id', item.id)
          .maybeSingle();

        if (productError) {
          throw productError;
        }

        if (!product) continue;

        const updatedStock = Math.max(0, Number(product.stock || 0) - quantity);
        const { error: stockError } = await supabaseAdmin
          .from('products')
          .update({ stock: updatedStock })
          .eq('id', product.id);

        if (stockError) {
          throw stockError;
        }
      }

      try {
        const emailTo = shippingAddress.email || session.customer_email || session.customer_details?.email || session.metadata?.customer_email;
        if (emailTo) {
          await sendOrderConfirmationEmail({
            to: emailTo,
            order: createdOrder,
            appUrl,
          });
        }
      } catch (emailError) {
        console.warn('No se pudo enviar el email de confirmación:', emailError.message);
      }
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Error procesando webhook de Stripe:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.use(express.json());

app.post('/api/crear-sesion', async (req, res) => {
  try {
    if (!stripe || !supabaseAdmin) {
      return res.status(500).json({ error: 'Stripe o Supabase no están configurados correctamente.' });
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Debes iniciar sesión para pagar.' });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'No hemos podido validar tu sesión.' });
    }

    const { cart = [], customer = {} } = req.body || {};
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío.' });
    }

    const normalizedCart = cart
      .map((item) => ({
        id: item?.id,
        quantity: Number(item?.quantity || 0),
      }))
      .filter((item) => item.id != null && item.quantity > 0);

    if (normalizedCart.length === 0) {
      return res.status(400).json({ error: 'No hay productos válidos en el carrito.' });
    }

    const productIds = normalizedCart.map((item) => item.id);
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, price, image, stock')
      .in('id', productIds);

    if (productsError) {
      throw productsError;
    }

    const productMap = new Map((products || []).map((product) => [String(product.id), product]));

    const missingProducts = normalizedCart.filter((item) => !productMap.has(String(item.id)));
    if (missingProducts.length > 0) {
      return res.status(400).json({ error: 'Uno o varios productos ya no existen en el catálogo.' });
    }

    const insufficientStock = normalizedCart.find((item) => {
      const product = productMap.get(String(item.id));
      return Number(product.stock || 0) < item.quantity;
    });

    if (insufficientStock) {
      const product = productMap.get(String(insufficientStock.id));
      return res.status(400).json({
        error: `No hay stock suficiente para "${product.name}".`,
      });
    }

    const compactCart = normalizedCart.map((item) => {
      const product = productMap.get(String(item.id));
      return {
        id: item.id,
        q: item.quantity,
        n: product.name,
        p: Number(product.price),
      };
    });

    const shippingAddress = {
      destinatario: `${customer.nombre || ''} ${customer.apellidos || ''}`.trim() || userData.user.user_metadata?.nombre || 'Cliente',
      telefono: String(customer.telefono || '').trim(),
      metodo_entrega: customer.metodoEntrega || 'envio',
      datos_envio:
        customer.metodoEntrega === 'envio'
          ? {
              calle: String(customer.calleEnvio || '').trim(),
              cp: String(customer.cpEnvio || '').trim(),
              ciudad: String(customer.ciudadEnvio || '').trim(),
            }
          : 'Recogida en Tienda Burgos',
      datos_facturacion:
        customer.metodoEntrega === 'envio' && customer.mismaDireccion
          ? {
              calle: String(customer.calleEnvio || '').trim(),
              cp: String(customer.cpEnvio || '').trim(),
              ciudad: String(customer.ciudadEnvio || '').trim(),
            }
          : {
              calle: String(customer.calleFacturacion || '').trim(),
              cp: String(customer.cpFacturacion || '').trim(),
              ciudad: String(customer.ciudadFacturacion || '').trim(),
            },
    };

    const lineItems = compactCart.map((item) => ({
      ...(productMap.get(String(item.id)).image ? {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.n,
            images: [productMap.get(String(item.id)).image],
          },
          unit_amount: Math.round(item.p * 100),
        },
      } : {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.n,
          },
          unit_amount: Math.round(item.p * 100),
        },
      }),
      quantity: item.q,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: userData.user.email,
      line_items: lineItems,
      success_url: `${appUrl.replace(/\/$/, '')}/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl.replace(/\/$/, '')}/carrito`,
      locale: 'es',
      metadata: {
        user_id: userData.user.id,
        customer_email: userData.user.email,
        customer: JSON.stringify({
          n: shippingAddress.destinatario,
          t: shippingAddress.telefono,
          m: shippingAddress.metodo_entrega,
          se: shippingAddress.datos_envio === 'Recogida en Tienda Burgos' ? null : shippingAddress.datos_envio,
          f: shippingAddress.datos_facturacion,
        }),
        cart: JSON.stringify(compactCart),
      },
      ...(shippingAddress.metodo_entrega === 'envio'
        ? {
            shipping_address_collection: {
              allowed_countries: ['ES'],
            },
          }
        : {}),
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
    });

    return res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Error en Stripe:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/checkout-session', async (req, res) => {
  try {
    if (!stripe || !supabaseAdmin) {
      return res.status(500).json({ error: 'Stripe o Supabase no están configurados correctamente.' });
    }

    const { session_id: sessionId } = req.query;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Falta el identificador de sesión.' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    let order = null;
    if (session.payment_status === 'paid') {
      const { data } = await supabaseAdmin
        .from('orders')
        .select('*')
        .contains('shipping_address', { checkout_session_id: sessionId })
        .maybeSingle();

      order = data || null;
    }

    return res.json({
      session_id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      order,
    });
  } catch (error) {
    console.error('Error recuperando la sesión de Stripe:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`CamaStock backend listening on http://localhost:${port}`);
});
