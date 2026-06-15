import nodemailer from 'nodemailer';
import { createInvoicePdfArrayBuffer, formatEuro, getInvoiceNumber } from '../src/lib/invoicePdf.js';

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const getSmtpConfig = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM_EMAIL;

  if (!host || !user || !pass || !fromEmail) {
    return null;
  }

  return {
    host,
    port,
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: {
      user,
      pass,
    },
    fromEmail,
    fromName: process.env.SMTP_FROM_NAME || 'CamaStock',
    replyTo: process.env.SMTP_REPLY_TO || fromEmail,
    adminCopy: process.env.ORDER_NOTIFICATION_EMAIL || '',
  };
};

export async function sendOrderConfirmationEmail({ to, order, appUrl }) {
  const smtp = getSmtpConfig();
  if (!smtp || !to || !order) {
    return { sent: false, skipped: true };
  }

  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth,
  });

  const invoiceNumber = getInvoiceNumber(order);
  const shipping = order.shipping_address || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const pdfBuffer = Buffer.from(createInvoicePdfArrayBuffer(order));
  const orderUrl = `${String(appUrl || '').replace(/\/$/, '')}/mi-cuenta`;

  const itemsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #ececec;">${escapeHtml(item.name)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #ececec;text-align:center;">${escapeHtml(item.quantity || 0)}</td>
          <td style="padding:10px 0;border-bottom:1px solid #ececec;text-align:right;">${escapeHtml(formatEuro(item.price))}</td>
        </tr>
      `,
    )
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;color:#1a1a1a;line-height:1.6;">
      <h1 style="margin:0 0 8px;font-size:24px;">Tu pedido está confirmado</h1>
      <p style="margin:0 0 16px;">Hola ${escapeHtml(shipping.destinatario || 'cliente')}, ya tenemos tu pedido <strong>${escapeHtml(invoiceNumber)}</strong>.</p>
      <div style="background:#f8f6f3;padding:16px;border-radius:12px;margin:0 0 18px;">
        <p style="margin:0 0 4px;"><strong>Total:</strong> ${escapeHtml(formatEuro(order.total))}</p>
        <p style="margin:0 0 4px;"><strong>Estado:</strong> ${escapeHtml(order.status || 'Procesando')}</p>
        <p style="margin:0;"><strong>Envío:</strong> ${escapeHtml(shipping.metodo_entrega === 'recogida' ? 'Recogida en tienda' : 'Envío a domicilio')}</p>
      </div>
      <h2 style="font-size:18px;margin:0 0 10px;">Resumen</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <thead>
          <tr>
            <th align="left" style="padding:10px 0;border-bottom:2px solid #1a1a1a;">Producto</th>
            <th align="center" style="padding:10px 0;border-bottom:2px solid #1a1a1a;">Cant.</th>
            <th align="right" style="padding:10px 0;border-bottom:2px solid #1a1a1a;">Precio</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="margin:18px 0 0;">La factura PDF va adjunta y también puedes descargarla desde tu cuenta.</p>
      <p style="margin:6px 0 0;">Accede a tu panel: <a href="${escapeHtml(orderUrl)}" style="color:#c0392b;">${escapeHtml(orderUrl)}</a></p>
    </div>
  `;

  const subject = `Confirmación de pedido ${invoiceNumber}`;
  const message = await transport.sendMail({
    from: `"${smtp.fromName}" <${smtp.fromEmail}>`,
    to,
    ...(smtp.adminCopy ? { bcc: smtp.adminCopy } : {}),
    replyTo: smtp.replyTo,
    subject,
    text: `Tu pedido ${invoiceNumber} está confirmado. Total: ${formatEuro(order.total)}. La factura PDF va adjunta.`,
    html,
    attachments: [
      {
        filename: `factura-${invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });

  return { sent: true, messageId: message.messageId };
}
