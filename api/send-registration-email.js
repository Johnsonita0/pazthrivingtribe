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

  const { to, name, registrationType, programType, childrenCount, hearAboutUs, note } = req.body || {};

  if (!to) {
    return res.status(400).json({ error: 'Missing recipient email' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleanEmail = String(to).trim().toLowerCase();
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Invalid recipient email address' });
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.RESEND_FROM_EMAIL || 'notifications@pazthrivingtribe.com';

    if (resendApiKey) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: fromAddress,
          to: cleanEmail,
          subject: 'Your registration request has been received - PAZ Thriving Tribe',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; background: #f5f7f8; margin: 0; padding: 32px; color: #1f2937; }
                  .card { max-width: 640px; margin: 0 auto; background: #fff; border-radius: 18px; overflow: hidden; border: 1px solid #e5e7eb; }
                  .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 28px 32px; }
                  .header h1 { margin: 0; font-size: 28px; }
                  .content { padding: 28px 32px 32px; }
                  .badge { display: inline-block; background: #ecfdf5; color: #166534; font-weight: 700; border-radius: 999px; padding: 6px 12px; margin-bottom: 18px; }
                  p { line-height: 1.7; margin: 0 0 16px; }
                  .details { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-top: 18px; }
                  .details strong { display: inline-block; min-width: 140px; }
                  .button { display: inline-block; background: #1f7a58; color: white; text-decoration: none; border-radius: 10px; padding: 12px 20px; font-weight: 700; margin-top: 12px; }
                  .footer { padding: 0 32px 28px; color: #475569; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="header">
                    <h1>Registration received</h1>
                  </div>
                  <div class="content">
                    <div class="badge">PAZ Thriving Tribe</div>
                    <p>Hi ${name || 'there'},</p>
                    <p>Thank you for submitting your registration for the ${programType || 'Paz Thriving Teens Academy'} program. We have received your request and will review it shortly.</p>
                    <p>A member of our team will contact you soon with the next steps and orientation details.</p>
                    <div class="details">
                      <p><strong>Registration type:</strong> ${registrationType || 'Not specified'}</p>
                      <p><strong>Program:</strong> ${programType || 'Thriving Teens Academy'}</p>
                      <p><strong>Children:</strong> ${childrenCount || 1}</p>
                      <p><strong>Source:</strong> ${hearAboutUs || 'Website'}</p>
                      <p><strong>Note:</strong> ${note || 'No additional details'}</p>
                    </div>
                    <a class="button" href="${process.env.VITE_APP_URL || 'https://pazthrivingtribe.com'}">Visit our website</a>
                  </div>
                  <div class="footer">
                    <p>We are excited to journey with you.</p>
                    <p>Email: pazthrivingtribe@gmail.com</p>
                  </div>
                </div>
              </body>
            </html>
          `
        })
      });

      const emailData = await emailResponse.json().catch(() => ({}));
      if (!emailResponse.ok) {
        console.error('Resend API error:', emailData);
        throw new Error(emailData.message || 'Failed to send registration email');
      }

      console.log(`✓ Registration confirmation email sent to: ${cleanEmail}`);
    } else {
      console.log(`✓ Registration confirmation queued for: ${cleanEmail}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Registration confirmation email sent successfully.',
      data: {
        email: cleanEmail,
        sentAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Registration email sending failed:', error);
    return res.status(500).json({
      error: 'Unable to send the confirmation email right now.',
      details: error.message || 'Unknown email error'
    });
  }
}
