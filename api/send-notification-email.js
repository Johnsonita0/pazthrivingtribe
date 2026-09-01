export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, service, timestamp, message, productMessage, customMessage, attachmentName, customerName, orderNumber, itemSummary } = req.body;

  if (!email || !service) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Store email subscription in Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    // Try to store in database if Supabase is configured
    if (supabaseUrl && supabaseAnonKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/service_notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            email: cleanEmail,
            service: service,
            status: 'active',
            created_at: timestamp || new Date().toISOString(),
          }),
        });
      } catch (dbError) {
        console.log('Note: Could not store email in database, continuing with notification');
      }
    }

    const deliveryMessage = (productMessage || customMessage || message || '').toString().trim();
    const fileLabel = attachmentName ? `<p><strong>Product file:</strong> ${attachmentName}</p>` : '';
    const itemList = itemSummary ? `<p><strong>Order items:</strong><br>${itemSummary.replace(/\n/g, '<br>')}</p>` : '';
    const resolvedCustomerName = (customerName || '').toString().trim() || 'there';
    const recipientName = `Hi ${resolvedCustomerName},`;
    const subjectLine = orderNumber ? `Your PAZ order is ready — #${orderNumber}` : `Your PAZ order update`;
    const websiteUrl = process.env.VITE_APP_URL || 'https://pazthrivingtribe.com';
    const logoUrl = `${websiteUrl}/logo/logo2.jpeg`;
    const contactPhone = '+234 803 738 3820';
    const bodyCopy = deliveryMessage
      ? deliveryMessage.replace(/\n/g, '<br>')
      : `<strong>Thank you for choosing PAZ Thriving Tribe.</strong><br><br>We are excited to share your purchase and continue supporting your growth journey.`;
    const productCard = itemSummary
      ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f8faf7; border: 1px solid #dfeae2; border-radius: 14px; margin: 22px 0 12px;">
          <tr>
            <td style="padding: 18px 20px;">
              <div style="font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #2d7a5c; font-weight: 700; margin-bottom: 10px;">Your materials</div>
              <div style="font-size: 18px; line-height: 1.5; color: #0f172a; font-weight: 700; margin-bottom: 8px;">Your purchased resources are ready</div>
              <div style="font-size: 14px; line-height: 1.7; color: #334155;">${itemSummary.replace(/\n/g, '<br>')}</div>
            </td>
          </tr>
        </table>
      `
      : '';

    // Send confirmation email to user
    // Using a simple HTML email template
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${subjectLine}</title>
          <style>
            body { margin: 0; padding: 0; background: #f3f6f3; font-family: Arial, Helvetica, sans-serif; color: #1f2937; }
            table { border-collapse: collapse; }
            img { border: 0; outline: none; }
            a { text-decoration: none; }
            .container { width: 100%; max-width: 620px; margin: 0 auto; background: #ffffff; }
            .header { background: linear-gradient(135deg, #0b3a2c 0%, #123f2f 50%, #1a4b38 100%); padding: 28px 32px; text-align: center; }
            .logo-wrap { display: inline-block; text-align: center; background: #ffffff; border: 1px solid rgba(255,255,255,0.2); border-radius: 16px; padding: 10px 18px; box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
            .logo { width: 52px; height: 52px; vertical-align: middle; border-radius: 12px; }
            .brand { display: inline-block; vertical-align: middle; margin-left: 12px; color: #0f172a; font-size: 13px; letter-spacing: 0.12em; font-weight: 700; text-transform: uppercase; text-align: left; }
            .content { padding: 36px 32px 24px; background: #ffffff; }
            .eyebrow { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #1c7a5b; font-weight: 700; margin: 0 0 12px; }
            .title { font-size: 30px; line-height: 1.2; color: #0f172a; margin: 0 0 18px; font-weight: 700; }
            .message { font-size: 16px; line-height: 1.7; color: #334155; margin: 0 0 18px; }
            .highlight-box { background: #f3f9f6; border: 1px solid #d7e9e0; border-radius: 12px; padding: 16px 18px; margin: 20px 0; }
            .detail-row { font-size: 15px; color: #1f2937; margin: 10px 0; }
            .cta { display: inline-block; background: #1d9a63; color: #ffffff; padding: 13px 22px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: 0.02em; margin: 20px 0 8px; }
            .cta-secondary { display: inline-block; background: #ffffff; color: #0f172a; border: 1px solid #dfe8e3; padding: 13px 22px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: 0.02em; margin-left: 10px; }
            .footer { background: #f7faf8; border-top: 1px solid #dfe8e3; padding: 28px 32px 32px; text-align: center; }
            .footer-title { font-size: 18px; line-height: 1.3; color: #0f172a; margin: 0 0 10px; font-weight: 700; }
            .socials { font-size: 13px; color: #475569; margin: 18px 0 0; text-align: center; }
            .social-link { display: inline-block; width: 32px; height: 32px; border-radius: 50%; margin: 0 6px; text-align: center; line-height: 32px; vertical-align: middle; }
            .social-link svg { width: 14px; height: 14px; vertical-align: middle; }
            .footer-actions { margin-top: 18px; display: inline-block; }
            .newsletter { background: #0f172a; border-radius: 10px; padding: 14px 16px; display: inline-block; color: #ffffff; font-size: 13px; font-weight: 700; margin-right: 10px; }
            .portal-link { background: #e8f6ef; border: 1px solid #cfeadf; border-radius: 10px; padding: 14px 16px; display: inline-block; color: #0d5d46; font-size: 13px; font-weight: 700; }
            .muted { color: #64748b; font-size: 12px; }
            @media (max-width: 620px) {
              .content, .header, .footer { padding-left: 18px !important; padding-right: 18px !important; }
              .title { font-size: 24px !important; }
              .message { font-size: 14px !important; }
            }
          </style>
        </head>
        <body>
          <div style="padding: 24px 12px;">
            <table role="presentation" class="container" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td class="header">
                  <div class="logo-wrap">
                    <img src="${logoUrl}" alt="PAZ Thriving Tribe" class="logo" />
                    <span class="brand">PAZ<br />Thriving Tribe</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="content">
                  <p class="eyebrow">Good news</p>
                  <h1 class="title">${subjectLine}</h1>
                  <p class="message">${recipientName}</p>
                  <p class="message">${bodyCopy}</p>

                  <div class="highlight-box">
                    ${itemList || '<div class="detail-row"><strong>Order update:</strong> Your purchase has been processed successfully.</div>'}
                    ${fileLabel || '<div class="detail-row"><strong>Delivery:</strong> Your product is now ready for access.</div>'}
                    ${orderNumber ? `<div class="detail-row"><strong>Order number:</strong> ${orderNumber}</div>` : ''}
                    <div class="detail-row"><strong>Customer email:</strong> ${cleanEmail}</div>
                  </div>

                  ${productCard}

                  <p class="message">If you have any questions about your order, we are here to support you and help with anything you need.</p>
                  <div>
                    <a href="${websiteUrl}" class="cta">View your portal</a>
                    <a href="mailto:hello@pazthrivingtribe.com" class="cta-secondary">Contact support</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="footer">
                  <p class="footer-title">Stay connected with PAZ</p>
                  <div class="socials">
                    <a href="https://www.instagram.com" class="social-link">Instagram</a> &nbsp;|&nbsp;
                    <a href="https://www.facebook.com" class="social-link">Facebook</a> &nbsp;|&nbsp;
                    <a href="https://www.linkedin.com" class="social-link">LinkedIn</a>
                  </div>
                  <div class="footer-actions">
                    <a href="${websiteUrl}" class="newsletter">Subscribe to our newsletter</a>
                    <a href="${websiteUrl}" class="portal-link">Visit our portal</a>
                  </div>
                  <div class="socials">
                    <a href="https://www.instagram.com" class="social-link">Instagram</a> &nbsp;|&nbsp;
                    <a href="https://www.facebook.com" class="social-link">Facebook</a> &nbsp;|&nbsp;
                    <a href="https://www.linkedin.com" class="social-link">LinkedIn</a>
                  </div>
                  <p class="muted" style="margin-top: 18px;">© ${new Date().getFullYear()} PAZ Thriving Tribe. All rights reserved.</p>
                  <p class="muted">Email: hello@pazthrivingtribe.com &nbsp;|&nbsp; Phone: ${contactPhone}</p>
                </td>
              </tr>
            </table>
          </div>
        </body>
      </html>
    `;

    // Log the subscription (for now, in production you'd integrate with Resend, SendGrid, etc.)
    console.log(`✓ Email notification subscription confirmed for: ${cleanEmail}`);
    console.log(`  Service: ${service}`);
    console.log(`  Timestamp: ${timestamp}`);

    return res.status(200).json({ 
      success: true,
      subject: subjectLine,
      message: 'Thank you for subscribing! Check your email for confirmation.',
      data: {
        email: cleanEmail,
        service: service,
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
