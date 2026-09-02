export function buildPazEmailTemplate({
  title,
  eyebrow = 'PAZ Thriving Tribe',
  intro = 'Hello,',
  bodyHtml = '',
  ctaLabel = 'Apply for a section',
  ctaUrl = `${process.env.VITE_APP_URL || 'https://pazthrivingtribe.org'}/teens_reg`,
  secondaryCtaLabel = 'Book for a section',
  secondaryCtaUrl = `${process.env.VITE_APP_URL || 'https://pazthrivingtribe.org'}/book-session`,
  accentText = '',
  footerNote = 'We are here to help your growth journey.',
  productDownloadUrl = '',
  productName = 'your product'
}) {
  const websiteUrl = process.env.VITE_APP_URL || 'https://pazthrivingtribe.org';
  const logoUrl = `${websiteUrl}/logo/logo2.jpeg`;
  const contactPhone = '+234 803 738 3820';
  const whatsappUrl = 'https://wa.me/2348037383820';

  const safeTitle = String(title || 'PAZ Thriving Tribe');
  const safeEyebrow = String(eyebrow || 'PAZ Thriving Tribe');
  const safeIntro = String(intro || 'Hello,');
  const safeAccentText = accentText ? String(accentText) : '';
  const safeProductName = String(productName || 'your product');
  const safeProductDownloadUrl = String(productDownloadUrl || '').trim();

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${safeTitle}</title>
      </head>
      <body style="margin:0;padding:0;background:#edf4ef;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#edf4ef;padding:24px 12px;border-collapse:collapse;">
          <tr>
            <td align="center" style="text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;width:100%;background:#ffffff;border-collapse:separate;border-spacing:0;border-radius:18px;overflow:hidden;">
                <tr>
                  <td align="center" style="padding:24px 20px;background:linear-gradient(135deg,#0b2f2a 0%,#123d35 52%,#1c5c4a 100%);text-align:center;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:separate;border-spacing:0;">
                      <tr>
                        <td style="padding-right:12px;">
                          <img src="${logoUrl}" alt="PAZ logo" width="54" height="54" style="display:block;border:0;outline:none;border-radius:14px;background:#ffffff;padding:6px;" />
                        </td>
                        <td style="color:#f7e7b4;font-family:Arial,Helvetica,sans-serif;line-height:1.1;">
                          <div style="font-size:24px;font-weight:900;letter-spacing:0.08em;">PAZ</div>
                          <div style="font-size:10px;font-weight:800;letter-spacing:0.18em;opacity:0.92;">THRIVING TRIBE</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:26px 28px 10px;background:#ffffff;">
                    <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#1c6d5d;font-weight:800;">${safeEyebrow}</div>
                    <h1 style="margin:14px 0 10px;font-size:30px;line-height:1.2;color:#0d2f2a;font-weight:900;">${safeTitle}</h1>
                    <p style="margin:0 0 12px;font-size:16px;line-height:1.7;color:#1d3d39;">${safeIntro}</p>
                    ${safeAccentText ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#0b352d;font-weight:800;">${safeAccentText}</p>` : ''}
                  </td>
                </tr>

                <tr>
                  <td style="padding:0 28px 8px;background:#ffffff;">
                    <div style="background:#f6f9f6;border:1px solid #dfeee4;border-radius:14px;padding:18px 18px 10px;color:#1d3d39;font-size:15px;line-height:1.7;">
                      ${bodyHtml}
                    </div>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding:20px 20px 8px;background:#ffffff;text-align:center;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;border-collapse:separate;border-spacing:0;">
                      <tr>
                        <td style="padding-right:6px;">
                          <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#e3bf6a,#d4a848);color:#152b24;padding:14px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:900;">${ctaLabel}</a>
                        </td>
                        <td style="padding-left:6px;">
                          <a href="${secondaryCtaUrl}" style="display:inline-block;background:#edf7f0;color:#14392f;padding:14px 18px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:800;border:1px solid #d1e6d7;">${secondaryCtaLabel}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px 20px 26px;background:#0b2a23;color:#edf4f1;text-align:center;">
                    <div style="margin-bottom:12px;">
                      <a href="https://www.instagram.com/pazthrivingtribe" target="_blank" rel="noopener noreferrer" style="display:inline-block;width:34px;height:34px;line-height:34px;text-align:center;background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.15);border-radius:50%;margin:0 6px;vertical-align:middle;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" style="display:block;margin:9px auto;vertical-align:middle;">
                          <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="white" stroke-width="1.8" fill="none"/>
                          <circle cx="12" cy="12" r="4.2" stroke="white" stroke-width="1.8" fill="none"/>
                          <circle cx="17.2" cy="6.8" r="1.1" fill="white"/>
                        </svg>
                      </a>
                      <a href="https://facebook.com/pazthrivingtribe" target="_blank" rel="noopener noreferrer" style="display:inline-block;width:34px;height:34px;line-height:34px;text-align:center;background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.15);border-radius:50%;margin:0 6px;vertical-align:middle;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" style="display:block;margin:9px auto;vertical-align:middle;">
                          <path d="M13.7 20.5v-7.7h2.6l.4-3h-3V7.4c0-.9.3-1.5 1.6-1.5h1.7V2.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3h2.5v7.7h3.9Z" fill="white"/>
                        </svg>
                      </a>
                      <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;width:34px;height:34px;line-height:34px;text-align:center;background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.15);border-radius:50%;margin:0 6px;vertical-align:middle;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" style="display:block;margin:9px auto;vertical-align:middle;">
                          <path d="M18.9 5.1A9.4 9.4 0 0 0 4.7 17.4L3.5 20.5l3.2-1.1a9.5 9.5 0 0 0 12.2-12.3Zm-7.2 2.7c.2 0 .5 0 .7.1.2.1.4.4.5.7.1.3.4 1.1.1 1.4-.1.2-.2.3-.5.5l-.4.2c-.2.1-.5.1-.7-.1-.3-.2-.8-.7-.9-1.1-.1-.2-.2-.5.1-.7.1-.2.3-.4.4-.6.1-.2.1-.4 0-.5-.1-.1-.3-.1-.5-.1-.3 0-.7.1-1.1.5-.4.4-1 1-1 2.6 0 1.5.9 3.1 1.9 4.2.9.9 2.1 1.5 3.5 1.8.6.1 1.1.2 1.6.1.5-.1 1.5-.7 1.7-1.3.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.4-.3-.2-1.1-.6-1.3-.7-.2-.1-.4-.1-.6.1-.2.2-.7.7-.9.9-.2.2-.4.2-.7.1-.4-.2-1.5-.7-2.9-1.9-1.2-1.1-2-2.4-2.2-2.9-.2-.4-.1-.6.1-.8.1-.2.2-.4.4-.6.2-.2.3-.4.5-.6.1-.2.2-.4.2-.6.1-.1.1-.4 0-.5-.1-.1-.4-.8-.6-1.1-.2-.3-.4-.2-.6-.2h-.5Z" fill="white"/>
                        </svg>
                      </a>
                      <a href="https://www.linkedin.com/company/pazthrivingtribe" target="_blank" rel="noopener noreferrer" style="display:inline-block;width:34px;height:34px;line-height:34px;text-align:center;background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.15);border-radius:50%;margin:0 6px;vertical-align:middle;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" style="display:block;margin:9px auto;vertical-align:middle;">
                          <path d="M6.5 8.9A1.7 1.7 0 1 1 6.5 5.5a1.7 1.7 0 0 1 0 3.4ZM4.8 10.3h3.4v9.2H4.8v-9.2Zm5.6 0h3.3v1.3h.1c.5-.9 1.7-1.8 3.5-1.8 3.7 0 4.4 2.4 4.4 5.6v5.1h-3.4v-4.7c0-1.1 0-2.6-1.6-2.6s-1.8 1.2-1.8 2.5v4.8h-3.5v-9.2Z" fill="white"/>
                        </svg>
                      </a>
                    </div>
                    <div style="font-size:12px;line-height:1.8;color:#dfeeea;">
                      <div style="font-size:14px;font-weight:800;color:#f7d980;margin-bottom:4px;">PAZ Thriving Tribe</div>
                      <div>${footerNote}</div>
                      <div>Email: <a href="mailto:pazthrivingtribe@gmail.com" style="color:#f7d980;text-decoration:none;">pazthrivingtribe@gmail.com</a> | WhatsApp: <a href="${whatsappUrl}" style="color:#f7d980;text-decoration:none;">${contactPhone}</a></div>
                      <div>Website: <a href="${websiteUrl}" style="color:#f7d980;text-decoration:none;">${websiteUrl}</a></div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

