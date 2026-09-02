import { sendResendEmail } from './lib/resend.js';
import { buildPazEmailTemplate } from './lib/paz-email-template.js';

function isRealProductDownloadUrl(value) {
  if (typeof value !== 'string') return false;

  const trimmed = value.trim();
  if (!trimmed) return false;

  return !/^(https?:\/\/)?(www\.)?example\.com(\/|$)/i.test(trimmed);
}

function sendJson(res, statusCode, payload) {
  if (typeof res.status === 'function') {
    return res.status(statusCode).json(payload);
  }

  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const body = req.body || {};
  const { email, service, timestamp, message, productMessage, customMessage, attachmentName, customerName, orderNumber, itemSummary, productFileUrl, fileUrl, productName, itemName } = body;

  if (!email || !service) {
    return sendJson(res, 400, { error: 'Missing required fields' });
  }

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendJson(res, 400, { error: 'Invalid email address' });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/service_notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({
            email: cleanEmail,
            service,
            status: 'active',
            created_at: timestamp || new Date().toISOString()
          })
        });
      } catch (dbError) {
        console.log('Note: Could not store email in database, continuing with notification');
      }
    }

    const deliveryMessage = (productMessage || customMessage || message || '').toString().trim();
    const itemList = itemSummary ? `<p><strong>Order items:</strong><br>${String(itemSummary).replace(/\n/g, '<br>')}</p>` : '';
    const resolvedCustomerName = (customerName || '').toString().trim() || 'there';
    const orderProductDownloadUrl = [productFileUrl, fileUrl, body?.downloadUrl, body?.productUrl].find((value) => isRealProductDownloadUrl(value)) || '';
    const resolvedProductName = (productName || itemName || 'your product').toString().trim() || 'your product';
    const resolvedAttachmentName = String(attachmentName || resolvedProductName || 'product-file.pdf').trim() || 'product-file.pdf';
    const subjectLine = orderNumber ? `Your PAZ order is ready — #${orderNumber}` : 'Your PAZ order update';

    const emailHTML = buildPazEmailTemplate({
      title: subjectLine,
      eyebrow: 'Order update',
      intro: `Hi ${resolvedCustomerName},`,
      accentText: deliveryMessage || 'Thank you for choosing PAZ Thriving Tribe.',
      bodyHtml: `
        <p><strong>We’re excited to share your order update.</strong></p>
        <p>${(deliveryMessage || 'Thank you for choosing PAZ Thriving Tribe.').replace(/\n/g, '<br>')}</p>
        ${itemList || '<p><strong>Delivery:</strong> Your product is now ready for access.</p>'}
        ${orderNumber ? `<p><strong>Order number:</strong> ${orderNumber}</p>` : ''}
        ${orderProductDownloadUrl ? `<p><strong>Download link:</strong> <a href="${orderProductDownloadUrl}" style="color:#123d35;font-weight:700;">Open product file</a></p>` : ''}
        ${resolvedAttachmentName ? `<p><strong>Product file:</strong> ${resolvedAttachmentName}</p>` : ''}
        <p><strong>Customer email:</strong> ${cleanEmail}</p>
      `,
      productDownloadUrl: orderProductDownloadUrl,
      productName: resolvedProductName,
      ctaLabel: orderProductDownloadUrl ? 'Download your product' : 'Apply for a section',
      ctaUrl: orderProductDownloadUrl || `${process.env.VITE_APP_URL || 'https://pazthrivingtribe.org'}/teens_reg`,
      secondaryCtaLabel: 'Book for a section',
      secondaryCtaUrl: `${process.env.VITE_APP_URL || 'https://pazthrivingtribe.org'}/book-session`,
      footerNote: 'Thank you for shopping with PAZ Thriving Tribe.'
    });

    const attachments = orderProductDownloadUrl
      ? [{
          filename: resolvedAttachmentName.includes('.') ? resolvedAttachmentName : `${resolvedProductName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
          url: orderProductDownloadUrl
        }]
      : [];

    await sendResendEmail({
      to: cleanEmail,
      subject: subjectLine,
      html: emailHTML,
      text: `PAZ Thriving Tribe\n\n${deliveryMessage || 'Thank you for choosing PAZ Thriving Tribe.'}`,
      from: process.env.RESEND_FROM_EMAIL || 'notifications@pazthrivingtribe.org',
      attachments
    });

    console.log(`✓ Resend notification sent to: ${cleanEmail}`);

    return sendJson(res, 200, {
      success: true,
      subject: subjectLine,
      message: 'Thank you for subscribing! Check your email for confirmation.',
      data: {
        email: cleanEmail,
        service,
        subject: subjectLine,
        subscribedAt: timestamp || new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error processing notification:', error);
    return sendJson(res, 500, {
      error: 'Failed to process subscription',
      details: error.message
    });
  }
}
