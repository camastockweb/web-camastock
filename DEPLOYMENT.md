# Despliegue de CamaStock

## 1. Variables de entorno

Configura estas variables en producción:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLIC_KEY`
- `STRIPE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `VITE_API_BASE_URL`
- `VITE_APP_URL`
- `APP_URL`
- `CORS_ORIGINS`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`
- `SMTP_REPLY_TO`
- `ORDER_NOTIFICATION_EMAIL`

## 2. Backend

1. Despliega `server.js` como proceso Node.
2. Arranca con `npm start`.
3. Asegúrate de que `CORS_ORIGINS` incluya el dominio del front.

## 3. Frontend

1. Compila el front con `npm run build`.
2. Sube el contenido de `dist/` a tu hosting estático o configúralo junto al backend.
3. Ajusta `VITE_API_BASE_URL` al dominio público del backend.

## 4. Stripe

Configura el webhook hacia:

- `POST https://tu-backend.com/api/webhooks/stripe`

Eventos recomendados:

- `checkout.session.completed`

## 5. Supabase

Verifica que existan estas tablas y permisos:

- `products`
- `categories`
- `orders`

La tabla `orders` debe aceptar `items` y `shipping_address` como JSON/JSONB.

## 6. SMTP

Para que salgan correos reales, define un proveedor SMTP válido.
Si no está configurado, la compra seguirá funcionando, pero no se enviará el email de confirmación.
