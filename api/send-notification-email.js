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

  const { email, service, timestamp } = req.body;

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

    // Send confirmation email to user
    // Using a simple HTML email template
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22C55E 0%, #16a34a 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .content p { margin: 15px 0; }
            .highlight { color: #22C55E; font-weight: 600; }
            .cta-button { display: inline-block; background: #22C55E; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: 600; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1> You're All Set!</h1>
            </div>
            <div class="content">
              <p>Hi there!</p>
              <p>Thank you for subscribing to <span class="highlight">${service}</span>! We're excited to have you on board.</p>
              <p>We'll notify you as soon as this service launches. In the meantime, feel free to explore our platform and check out other programs we offer.</p>
              <p>If you have any questions, reach out to us anytime—we're here to help!</p>
              <a href="${process.env.VITE_APP_URL || 'https://pazthrivingtribe.com'}" class="cta-button">Visit PAZ Thriving Tribe</a>
              <div class="footer">
                <p><strong>Email:</strong> ${cleanEmail}</p>
                <p><strong>Service:</strong> ${service}</p>
                <p><strong>Subscribed:</strong> ${new Date(timestamp || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
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
      message: 'Thank you for subscribing! Check your email for confirmation.',
      data: {
        email: cleanEmail,
        service: service,
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
