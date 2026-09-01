import { sendMailjetEmail } from './lib/mailjet.js';
import { buildPazEmailTemplate } from './lib/paz-email-template.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, service, timestamp, message, productMessage, customMessage, attachmentName, customerName, orderNumber, itemSummary } = req.body || {};

  if (!email || !service) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
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
        ${attachmentName ? `<p><strong>Product file:</strong> ${attachmentName}</p>` : ''}
        ${orderNumber ? `<p><strong>Order number:</strong> ${orderNumber}</p>` : ''}
        <p><strong>Customer email:</strong> ${cleanEmail}</p>
      `,
      ctaLabel: 'Open PAZ portal',
      ctaUrl: process.env.VITE_APP_URL || 'https://pazthrivingtribe.org',
      secondaryCtaLabel: 'Contact support',
      secondaryCtaUrl: 'mailto:pazthrivingtribe@gmail.com',
      footerNote: 'Thank you for shopping with PAZ Thriving Tribe.'
    });

    await sendMailjetEmail({
      to: cleanEmail,
      subject: subjectLine,
      html: emailHTML,
      text: `PAZ Thriving Tribe\n\n${deliveryMessage || 'Thank you for choosing PAZ Thriving Tribe.'}`
    });

    console.log(`✓ Mailjet notification sent to: ${cleanEmail}`);

    return res.status(200).json({
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
    return res.status(500).json({
      error: 'Failed to process subscription',
      details: error.message
    });
  }
}
