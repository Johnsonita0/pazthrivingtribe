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

function formatMoney(value, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function getAdminEmails() {
  return [...new Set([
    process.env.ADMIN_EMAILS,
    process.env.VITE_ADMIN_EMAILS,
    'pazthrivingtribe@gmail.com'
  ]
    .flatMap((value) => String(value || '').split(','))
    .map((value) => value.trim().toLowerCase())
    .filter((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)))];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (error) {
      return sendJson(res, 400, { error: 'Invalid JSON body.' });
    }
  }
  const email = cleanEmail(body.email);
  const reference = String(body.reference || '').trim();
  const items = Array.isArray(body.items) ? body.items : [];
  const isFreeOrder = body.free === true;

  if (!email) return sendJson(res, 400, { error: 'A valid customer email is required.' });
  if ((!isFreeOrder && !reference) || !items.length) return sendJson(res, 400, { error: isFreeOrder ? 'Order items are required.' : 'Payment reference and order items are required.' });

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey || !process.env.RESEND_API_KEY || (!isFreeOrder && !paystackSecret)) {
    return sendJson(res, 500, { error: 'Payment delivery is not configured on the server.' });
  }

  try {
    let transaction = null;
    if (!isFreeOrder) {
      const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${paystackSecret}` }
      });
      const verifyData = await verifyResponse.json().catch(() => ({}));
      transaction = verifyData?.data;
      if (!verifyResponse.ok || verifyData?.status !== true || transaction?.status !== 'success') {
        return sendJson(res, 402, { error: 'Paystack could not confirm this payment.' });
      }
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const productIds = [...new Set(items.map((item) => String(item.id || '').trim()).filter(Boolean))];
    const { data: products, error: productsError } = await supabase
      .from('store_products')
      .select('id,title,price,currency,file_url,is_free')
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

    if (isFreeOrder && normalizedItems.some((item) => !item.product.is_free)) {
      return sendJson(res, 400, { error: 'This free delivery request includes a paid product.' });
    }

    const paidCurrencies = [...new Set(normalizedItems
      .filter((item) => !item.product.is_free)
      .map((item) => String(item.product.currency || 'NGN').toUpperCase()))];
    if (paidCurrencies.length > 1) {
      return sendJson(res, 400, { error: 'Products with different currencies must be purchased separately.' });
    }

    const orderCurrency = paidCurrencies[0] || 'NGN';
    const expectedAmount = normalizedItems.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0);
    if (!isFreeOrder && String(transaction.currency || 'NGN').toUpperCase() !== orderCurrency) {
      return sendJson(res, 402, { error: `This payment must be completed in ${orderCurrency}.` });
    }
    if (!isFreeOrder && Number(transaction.amount) !== Math.round(expectedAmount * 100)) {
      return sendJson(res, 402, { error: 'The payment amount does not match this order.' });
    }

    if (!isFreeOrder) {
      const vendorSales = normalizedItems
        .filter((item) => item.product.vendor_id)
        .map((item) => {
          const grossAmount = Number(item.product.price || 0) * item.quantity;
          return {
            vendor_id: item.product.vendor_id,
            order_number: orderNumber,
            product_id: item.product.id,
            product_title: item.product.title,
            quantity: item.quantity,
            gross_amount: grossAmount,
            vendor_amount: grossAmount,
            currency: orderCurrency,
            payout_status: 'pending'
          };
        });
      if (vendorSales.length) {
        const { error: vendorSalesError } = await supabase.from('vendor_sales').insert(vendorSales);
        if (vendorSalesError) console.warn('Vendor sale ledger update failed:', vendorSalesError.message);
      }
    }

    const attachments = [];
    const missingFiles = [];
    for (const item of normalizedItems) {
      const filePath = String(item.product.file_url || '').trim();
      if (!filePath) {
        missingFiles.push(item.product.title || 'Untitled product');
        continue;
      }

      let fileResponse;
      const sourceFilename = filePath.split('?')[0].split('/').pop() || '';
      const extensionMatch = sourceFilename.match(/(\.[a-z0-9]{1,8})$/i);
      const productFilename = `${safeFilename(item.product.title, 'product-file')}${extensionMatch ? extensionMatch[1].toLowerCase() : ''}`;
      if (/^https?:\/\//i.test(filePath)) {
        fileResponse = await fetch(filePath);
      } else {
        const storagePath = filePath
          .replace(/^\/storage\/v1\/object\/(?:public|authenticated|sign)\/product-files\//i, '')
          .replace(/^product-files\//i, '')
          .replace(/^\/+/, '');
        const { data: fileData, error: fileError } = await supabase.storage.from('product-files').download(storagePath);
        if (fileError) {
          console.warn(`Product file unavailable for ${item.product.title}:`, fileError.message);
          missingFiles.push(item.product.title || 'Untitled product');
          continue;
        }
        const buffer = Buffer.from(await fileData.arrayBuffer());
        attachments.push({ filename: productFilename, content: buffer.toString('base64') });
        continue;
      }

      if (fileResponse?.ok) {
        const buffer = Buffer.from(await fileResponse.arrayBuffer());
        attachments.push({ filename: productFilename, content: buffer.toString('base64') });
      } else {
        missingFiles.push(item.product.title || 'Untitled product');
      }
    }

    if (attachments.length !== normalizedItems.length) {
      const missingProductNames = [...new Set(missingFiles)].join(', ') || 'one or more selected products';
      return sendJson(res, 503, {
        error: `Payment was verified, but downloadable files are missing for: ${missingProductNames}. Upload each product file in the admin Store panel, then retry delivery from the verified order.`
      });
    }

    const orderNumber = String(body.orderNumber || `PAZ-${Date.now().toString().slice(-6)}`);
    const itemSummary = normalizedItems.map(({ product, quantity }) => `• ${product.title} x${quantity}`).join('\n');
    const customerName = String(body.customerName || 'Customer').trim();
    const subject = `Your PAZ products are ready — #${orderNumber}`;
    const adminRecipients = getAdminEmails();
    const adminSubject = isFreeOrder ? `Free product requested — ${orderNumber}` : `Payment received — ${orderNumber}`;
    const adminHtml = buildPazEmailTemplate({
      title: adminSubject,
      eyebrow: 'Payment received',
      intro: 'Hello PAZ team,',
      accentText: isFreeOrder ? 'A free product request has been completed.' : 'A Paystack payment has been verified successfully.',
      bodyHtml: `<p><strong>${isFreeOrder ? 'Free product request completed.' : 'Payment confirmed.'}</strong> A customer has completed a ${isFreeOrder ? 'free product request' : 'purchase'} on the PAZ storefront.</p><p><strong>Order number:</strong> ${orderNumber}</p><p><strong>Customer:</strong> ${customerName}</p><p><strong>Customer email:</strong> ${email}</p><p><strong>Items:</strong><br>${itemSummary.replace(/\n/g, '<br>')}</p>${isFreeOrder ? '' : `<p><strong>Verified amount:</strong> ${formatMoney(transaction.amount / 100, orderCurrency)}</p>`}<p>The customer has received the selected product files as email attachments.</p>`,
      productName: 'PAZ digital products',
      ctaLabel: 'Open admin dashboard',
      ctaUrl: `${process.env.VITE_APP_URL || 'https://pazthrivingtribe.org'}/admin`,
      showSecondaryCta: true,
      secondaryCtaLabel: 'Payment history',
      secondaryCtaUrl: `${process.env.VITE_APP_URL || 'https://pazthrivingtribe.org'}/dashboard?view=payment-history&reference=${encodeURIComponent(reference)}`,
      footerNote: 'Internal payment notification for PAZ Thriving Tribe.'
    });
    const html = buildPazEmailTemplate({
      title: subject,
      eyebrow: isFreeOrder ? 'Free product delivery' : 'Payment confirmed',
      intro: `Hi ${customerName},`,
      accentText: isFreeOrder ? 'Your requested free product is attached to this email.' : 'Your payment was successful and your purchased files are attached to this email.',
      bodyHtml: `<p><strong>${isFreeOrder ? 'Free product request confirmed.' : 'Payment confirmed.'}</strong></p><p>Your digital products are attached below.</p><p><strong>Order number:</strong> ${orderNumber}</p><p><strong>Order items:</strong><br>${itemSummary.replace(/\n/g, '<br>')}</p>`,
      productName: 'PAZ digital products',
      ctaLabel: 'Visit PAZ Thriving Tribe',
      ctaUrl: process.env.VITE_APP_URL || 'https://pazthrivingtribe.org',
      footerNote: 'Thank you for choosing PAZ Thriving Tribe.'
    });

    await Promise.all([
      sendResendEmail({
        to: email,
        subject,
        html,
        text: `${isFreeOrder ? 'Your requested free PAZ products' : 'Payment confirmed. Your selected PAZ products'} are attached to this email. Order: ${orderNumber}`,
        attachments
      }),
      ...adminRecipients.map((recipient) => sendResendEmail({
        to: recipient,
        subject: adminSubject,
        html: adminHtml,
        text: `${isFreeOrder ? 'Free product request received' : 'Payment received and verified'}. Order: ${orderNumber}. Customer: ${customerName} (${email}). Items: ${itemSummary}.${isFreeOrder ? '' : ` Amount: ${formatMoney(transaction.amount / 100, orderCurrency)}.`}`,
        attachments: []
      }))
    ]);

    return sendJson(res, 200, { success: true, orderNumber, attachmentCount: attachments.length });
  } catch (error) {
    console.error('Shop payment completion failed:', error);
    return sendJson(res, 500, { error: 'Payment was verified, but product delivery could not be completed.', details: error.message });
  }
}
