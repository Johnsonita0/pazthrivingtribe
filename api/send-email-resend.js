/**
 * Enhanced Email Sending Endpoint using Resend
 * To use this endpoint:
 * 1. Install Resend: npm install resend
 * 2. Set RESEND_API_KEY in environment variables
 * 3. Update frontend to call /api/send-email-resend instead of /api/send-notification-email
 * 
 * Resend is a modern email service perfect for Vercel deployments
 * Get started at: https://resend.com
 */

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

    // Store email subscription in Supabase (optional)
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

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
        console.log('Note: Could not store email in database');
      }
    }

    // Send email via Resend (if API key is configured)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const emailHtml = buildPazEmailTemplate({
          title: `Welcome to ${service} - PAZ Thriving Tribe`,
          eyebrow: 'Welcome',
          intro: 'Hi there,',
          accentText: `Thank you for subscribing to ${service}. We are excited to have you on board.`,
          bodyHtml: `
            <p>We will notify you as soon as this service launches. In the meantime, feel free to explore our platform and check out our other programs.</p>
            <p>If you have any questions, reach out to us anytime — we are here to help.</p>
            <p><strong>Email:</strong> ${cleanEmail}</p>
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>WhatsApp:</strong> +234 803 738 3820</p>
            <p><strong>Subscribed:</strong> ${new Date(timestamp || Date.now()).toLocaleDateString()}</p>
          `,
          ctaLabel: 'Apply for a section',
          ctaUrl: `${process.env.VITE_APP_URL || 'https://pazthrivingtribe.org'}/teens_reg`,
          secondaryCtaLabel: 'Book for a section',
          secondaryCtaUrl: `${process.env.VITE_APP_URL || 'https://pazthrivingtribe.org'}/book-session`,
          footerNote: 'We are excited to journey with you.'
        });

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'notifications@pazthrivingtribe.com',
            to: cleanEmail,
            subject: `Welcome to ${service} - PAZ Thriving Tribe`,
            html: emailHtml,
          }),
        });

        const emailData = await emailResponse.json();
        if (!emailResponse.ok) {
          console.error('Resend API error:', emailData);
          throw new Error(emailData.message || 'Failed to send email via Resend');
        }

        console.log(`✓ Email sent successfully via Resend to: ${cleanEmail}`);
      } catch (emailError) {
        console.error('Error sending email via Resend:', emailError.message);
        // Continue to return success even if email service fails
      }
    } else {
      console.log(`✓ Email notification subscription recorded for: ${cleanEmail}`);
    }

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
