import { jsPDF } from 'jspdf';

const COMPANY_NAME = 'CamaStock';
const ACCENT = [192, 57, 43];
const TEXT = [26, 26, 26];
const MUTED = [107, 114, 128];

export const formatEuro = (value) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export const getInvoiceNumber = (order) => {
  const rawId = order?.id ?? '000000';
  return `CS-${String(rawId).padStart(6, '0')}`;
};

const getOrderItems = (order) => (Array.isArray(order?.items) ? order.items : []);

const getShippingAddress = (order) => order?.shipping_address || {};

const ensurePage = (doc, y, spaceNeeded, drawHeader) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + spaceNeeded <= pageHeight - 16) return y;

  doc.addPage();
  if (drawHeader) drawHeader();
  return 18;
};

const drawWrappedLines = (doc, text, x, y, maxWidth, lineHeight = 5) => {
  const lines = doc.splitTextToSize(String(text || ''), maxWidth);
  lines.forEach((line, index) => {
    doc.text(line, x, y + index * lineHeight);
  });
  return lines.length * lineHeight;
};

const drawHeader = (doc, order) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...TEXT);
  doc.rect(0, 0, pageWidth, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(COMPANY_NAME, 16, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Factura simplificada', 16, 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(getInvoiceNumber(order), pageWidth - 16, 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Emitida: ${new Date(order?.created_at || Date.now()).toLocaleDateString('es-ES')}`, pageWidth - 16, 24, { align: 'right' });
};

export const createInvoicePdfDocument = (order) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  let y = 46;

  drawHeader(doc, order);

  const shipping = getShippingAddress(order);
  const items = getOrderItems(order);

  const sections = [
    {
      title: 'Cliente',
      lines: [
        `Destinatario: ${shipping.destinatario || 'Cliente'}`,
        `Telefono: ${shipping.telefono || 'No facilitado'}`,
        `Metodo de entrega: ${shipping.metodo_entrega === 'recogida' ? 'Recogida en tienda' : 'Envio a domicilio'}`,
      ],
    },
    {
      title: 'Pedido',
      lines: [
        `Estado: ${order?.status || 'Procesando'}`,
        `Total: ${formatEuro(order?.total)}`,
        `Referencia: ${getInvoiceNumber(order)}`,
      ],
    },
  ];

  sections.forEach((section) => {
    y = ensurePage(doc, y, 34, () => drawHeader(doc, order));

    doc.setFillColor(248, 246, 243);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 26, 3, 3, 'F');

    doc.setTextColor(...TEXT);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(section.title, margin + 4, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    let lineY = y + 14;
    section.lines.forEach((line) => {
      doc.text(line, margin + 4, lineY);
      lineY += 4.7;
    });

    y += 32;
  });

  y = ensurePage(doc, y, 16, () => drawHeader(doc, order));
  doc.setTextColor(...TEXT);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Linea de productos', margin, y);
  y += 4;

  let tableHeaderY = y + 4;
  const col = {
    product: margin,
    qty: 110,
    unit: 130,
    total: 164,
  };

  const drawTableHeader = (headerY) => {
    doc.setFillColor(241, 241, 241);
    doc.rect(margin, headerY, pageWidth - margin * 2, 9, 'F');
    doc.setTextColor(...TEXT);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Producto', col.product + 2, headerY + 6);
    doc.text('Cant.', col.qty, headerY + 6);
    doc.text('P. unit.', col.unit, headerY + 6);
    doc.text('Importe', col.total, headerY + 6);
  };

  drawTableHeader(tableHeaderY);
  y = tableHeaderY + 13;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  items.forEach((item) => {
    const productName = String(item?.name || 'Producto');
    const qty = Number(item?.quantity || 0);
    const unitPrice = Number(item?.price || 0);
    const rowTotal = unitPrice * qty;
    const wrapped = doc.splitTextToSize(productName, 82);
    const rowHeight = Math.max(12, wrapped.length * 4.5 + 4);

    const ensuredY = ensurePage(doc, y, rowHeight + 6, () => {
      drawHeader(doc, order);
      tableHeaderY = 50;
      drawTableHeader(tableHeaderY);
    });
    if (ensuredY !== y) {
      y = tableHeaderY + 13;
    }

    wrapped.forEach((line, index) => {
      doc.text(line, col.product + 2, y + 4 + index * 4.5);
    });

    doc.text(String(qty), col.qty, y + 4);
    doc.text(formatEuro(unitPrice), col.unit, y + 4);
    doc.text(formatEuro(rowTotal), col.total, y + 4);

    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);
    y += rowHeight;
  });

  y += 6;
  y = ensurePage(doc, y, 28, () => drawHeader(doc, order));

  const subtotal = items.reduce((sum, item) => sum + Number(item?.price || 0) * Number(item?.quantity || 0), 0);

  doc.setFillColor(248, 246, 243);
  doc.roundedRect(pageWidth - margin - 74, y, 74, 24, 3, 3, 'F');
  doc.setTextColor(...MUTED);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Subtotal', pageWidth - margin - 68, y + 7);
  doc.text('Total facturado', pageWidth - margin - 68, y + 15);

  doc.setTextColor(...TEXT);
  doc.setFont('helvetica', 'bold');
  doc.text(formatEuro(subtotal), pageWidth - margin - 6, y + 7, { align: 'right' });
  doc.setTextColor(...ACCENT);
  doc.setFontSize(12);
  doc.text(formatEuro(order?.total ?? subtotal), pageWidth - margin - 6, y + 15, { align: 'right' });

  y += 34;

  y = ensurePage(doc, y, 28, () => drawHeader(doc, order));
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const footerText = 'Gracias por comprar en CamaStock. Conserva esta factura para cualquier gestion de garantia o seguimiento del pedido.';
  drawWrappedLines(doc, footerText, margin, y, pageWidth - margin * 2, 4);

  doc.setDrawColor(229, 231, 235);
  doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
  doc.setTextColor(...MUTED);
  doc.text('CamaStock - Burgos', margin, pageHeight - 12);
  doc.text(`Pedido ${getInvoiceNumber(order)}`, pageWidth - margin, pageHeight - 12, { align: 'right' });

  return doc;
};

export const createInvoicePdfArrayBuffer = (order) => {
  const doc = createInvoicePdfDocument(order);
  return doc.output('arraybuffer');
};

export const downloadInvoicePdf = (order) => {
  const doc = createInvoicePdfDocument(order);
  doc.save(`factura-${getInvoiceNumber(order)}.pdf`);
};
