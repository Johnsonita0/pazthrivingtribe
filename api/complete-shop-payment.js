import { createClient } from '@supabase/supabase-js';
import { sendResendEmail } from './lib/resend.js';
import { buildPazEmailTemplate } from './lib/paz-email-template.js';

function sendJson(res, statusCode, payload) {
  if (typeof res.status === 'function') return res.status(statusCode).json(payload);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function cleanEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function safeFilename(value, fallback) {
  const filename = String(value || fallback).replace(/[^a-z0-9._-]/gi, '-');
  return filename || fallback;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  const body = req.body || {};
  const email = cleanEmail(body.email);
  const reference = String(body.reference || '').trim();
  const items = Array.isArray(body.items) ? body.items : [];

  if (!email) return sendJson(res, 400, { error: 'A valid customer email is required.' });
  if (!reference || !items.length) return sendJson(res, 400, { error: 'Payment reference and order items are required.' });

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!paystackSecret || !supabaseUrl || !serviceRoleKey || !process.env.RESEND_API_KEY) {
    return sendJson(res, 500, { error: 'Payment delivery is not configured on the server.' });
  }

  try {
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${paystackSecret}` }
    });
    const verifyData = await verifyResponse.json().catch(() => ({}));
    const transaction = verifyData?.data;

    if (!verifyResponse.ok || verifyData?.status !== true || transaction?.status !== 'success') {
      return sendJson(res, 402, { error: 'Paystack could not confirm this payment.' });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const productIds = [...new Set(items.map((item) => String(item.id || '').trim()).filter(Boolean))];
    const { data: products, error: productsError } = await supabase
      .from('store_products')
      .select('id,title,price,file_url')
      .in('id', productIds);

    if (productsError) throw productsError;

    const productMap = new Map((products || []).map((product) => [String(product.id), product]));
    const normalizedItems = items.map((item) => {
      const product = productMap.get(String(item.id || ''));
      return {
        product,
        quantity: Math.max(1, Number(item.quantity || 1))
      };
    });

    if (normalizedItems.some((item) => !item.product)) {
      return sendJson(res, 400, { error: 'One or more purchased products are no longer available.' });
    }

    const expectedAmount = normalizedItems.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0);
    if (Number(transaction.amount) !== Math.round(expectedAmount * 100)) {
      return sendJson(res, 402, { error: 'The payment amount does not match this order.' });
    }

    const attachments = [];
    for (const item of normalizedItems) {
      const filePath = String(item.product.file_url || '').trim();
      if (!filePath) continue;

      let fileResponse;
      let filename = safeFilename(item.product.title, 'product-file');
      if (/^https?:\/\//i.test(filePath)) {
        fileResponse = await fetch(filePath);
        filename = safeFilename(filePath.split('/').pop(), `${filename}.pdf`);
      } else {
        const { data: fileData, error: fileError } = await supabase.storage.from('product-files').download(filePath);
        if (fileError) {
          console.warn(`Product file unavailable for ${item.product.title}:`, fileError.message);
          continue;
        }
        const buffer = Buffer.from(await fileData.arrayBuffer());
        attachments.push({ filename: safeFilename(filePath.split('/').pop(), `${filename}.pdf`), content: buffer.toString('base64') });
        continue;
      }

      if (fileResponse?.ok) {
        const buffer = Buffer.from(await fileResponse.arrayBuffer());
        attachments.push({ filename, content: buffer.toString('base64') });
      }
    }

    if (attachments.length !== normalizedItems.length) {
      return sendJson(res, 503, { error: 'Payment was verified, but one or more product files are not available yet.' });
    }

    const orderNumber = String(body.orderNumber || `PAZ-${Date.now().toString().slice(-6)}`);
    const itemSummary = normalizedItems.map(({ product, quantity }) => `• ${product.title} x${quantity}`).join('\n');
    const customerName = String(body.customerName || 'Customer').trim();
    const subject = `Your PAZ products are ready — #${orderNumber}`;
    const html = buildPazEmailTemplate({
      title: subject,
      eyebrow: 'Payment confirmed',
      intro: `Hi ${customerName},`,
      accentText: 'Your payment was successful and your purchased files are attached to this email.',
      bodyHtml: `<p><strong>Payment confirmed.</strong></p><p>Your digital products are attached below.</p><p><strong>Order number:</strong> ${orderNumber}</p><p><strong>Order items:</strong><br>${itemSummary.replace(/\n/g, '<br>')}</p>`,
      productName: 'PAZ digital products',
      ctaLabel: 'Visit PAZ Thriving Tribe',
      ctaUrl: process.env.VITE_APP_URL || 'https://pazthrivingtribe.org',
      footerNote: 'Thank you for choosing PAZ Thriving Tribe.'
    });

    await sendResendEmail({
      to: email,
      subject,
      html,
      text: `Your payment was successful. Your purchased PAZ files are attached. Order: ${orderNumber}`,
      attachments
    });

    return sendJson(res, 200, { success: true, orderNumber, attachmentCount: attachments.length });
  } catch (error) {
    console.error('Shop payment completion failed:', error);
    return sendJson(res, 500, { error: 'Payment was verified, but product delivery could not be completed.', details: error.message });
  }
}
