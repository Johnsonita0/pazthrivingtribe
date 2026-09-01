export function buildPazEmailTemplate({
  title,
  eyebrow = 'PAZ Thriving Tribe',
  intro = '',
  bodyHtml = '',
  ctaLabel = 'Visit PAZ',
  ctaUrl = process.env.VITE_APP_URL || 'https://pazthrivingtribe.org',
  secondaryCtaLabel = 'Contact us',
  secondaryCtaUrl = 'mailto:pazthrivingtribe@gmail.com',
  accentText = '',
  footerNote = 'We are here to help your growth journey.'
}) {
  const websiteUrl = process.env.VITE_APP_URL || 'https://pazthrivingtribe.org';
  const logoUrl = `${websiteUrl}/logo/logo2.jpeg`;
  const contactPhone = '+234 803 738 3820';

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <style>
          body { margin: 0; padding: 0; background: #f5efe6; font-family: Arial, Helvetica, sans-serif; color: #143a2f; }
          table { border-collapse: collapse; }
          img { border: 0; outline: none; }
          a { text-decoration: none; }
          .container { width: 100%; max-width: 660px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #0d3b2d 0%, #1b5d4b 50%, #1f7a5a 100%); padding: 26px 28px 22px; }
          .brand-row { display: flex; align-items: center; justify-content: center; gap: 14px; }
          .brand-logo { width: 62px; height: 62px; border-radius: 16px; background: #f8f1df; padding: 8px; box-sizing: border-box; }
          .brand-text { text-align: left; }
          .brand-name { font-size: 24px; font-weight: 800; letter-spacing: 0.04em; color: #f6f0df; }
          .brand-tag { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #d1b97a; font-weight: 700; }
          .content { background: #ffffff; padding: 30px 30px 20px; }
          .eyebrow { margin: 0 0 12px; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #1b654d; font-weight: 800; }
          .title { margin: 0 0 18px; font-size: 30px; line-height: 1.2; color: #0d2f27; font-weight: 800; }
          .intro { margin: 0 0 18px; font-size: 16px; line-height: 1.7; color: #1d3d39; }
          .card { background: linear-gradient(180deg, #f7f7f1 0%, #edf7f0 100%); border: 1px solid #dfeee4; border-radius: 16px; padding: 22px 20px; margin: 20px 0; }
          .card p { margin: 0 0 12px; font-size: 15px; line-height: 1.7; color: #1d3d39; }
          .card strong { color: #0a3329; }
          .cta-wrap { margin: 26px 0 10px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #d4a843 0%, #c29327 100%); color: #102b24; font-weight: 800; font-size: 14px; padding: 14px 22px; border-radius: 10px; }
          .cta-secondary { display: inline-block; background: #eaf3ee; color: #143a2f; font-weight: 700; font-size: 14px; padding: 14px 22px; border-radius: 10px; border: 1px solid #cfe0d3; margin-left: 10px; }
          .footer { background: #0b2a23; padding: 28px 24px 30px; color: #edf4f1; }
          .social-row { text-align: center; padding: 8px 0 12px; }
          .social-link { display: inline-block; font-weight: 700; padding: 8px 12px; border-radius: 999px; margin: 0 8px; color: #ffffff; }
          .ig { background: linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4); }
          .fb { background: #1877f2; }
          .li { background: #0a66c2; }
          .footer-text { font-size: 12px; line-height: 1.8; color: #d7e7e2; text-align: center; }
          .footer-text a { color: #f3cf73; }
          @media (max-width: 620px) {
            .content, .header, .footer { padding-left: 18px !important; padding-right: 18px !important; }
            .title { font-size: 24px !important; }
            .cta-secondary { margin-left: 0; margin-top: 12px; }
          }
        </style>
      </head>
      <body>
        <div style="padding: 24px 12px;">
          <table class="container" role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td class="header">
                <table width="100%" role="presentation">
                  <tr>
                    <td align="center">
                      <div class="brand-row">
                        <img class="brand-logo" src="${logoUrl}" alt="PAZ Thriving Tribe logo" />
                        <div class="brand-text">
                          <div class="brand-name">PAZ</div>
                          <div class="brand-tag">Thriving Tribe</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="content">
                <p class="eyebrow">${eyebrow}</p>
                <h1 class="title">${title}</h1>
                ${intro ? `<p class="intro">${intro}</p>` : ''}
                ${accentText ? `<p class="intro" style="margin-bottom:0; color:#0d3b2d; font-weight:700;">${accentText}</p>` : ''}
                <div class="card">${bodyHtml}</div>
                <div class="cta-wrap">
                  <a href="${ctaUrl}" class="cta-button">${ctaLabel}</a>
                  <a href="${secondaryCtaUrl}" class="cta-secondary">${secondaryCtaLabel}</a>
                </div>
              </td>
            </tr>
            <tr>
              <td class="footer">
                <div class="social-row">
                  <a class="social-link ig" href="https://www.instagram.com">Instagram</a>
                  <a class="social-link fb" href="https://www.facebook.com">Facebook</a>
                  <a class="social-link li" href="https://www.linkedin.com">LinkedIn</a>
                </div>
                <div class="footer-text">
                  <div style="font-size: 14px; font-weight:700; color:#f7e2a7; margin-bottom: 6px;">PAZ Thriving Tribe</div>
                  <div>${footerNote}</div>
                  <div>Email: <a href="mailto:pazthrivingtribe@gmail.com">pazthrivingtribe@gmail.com</a> | Phone: ${contactPhone}</div>
                  <div>Website: <a href="${websiteUrl}">${websiteUrl}</a></div>
                  <div style="margin-top: 8px;">© ${new Date().getFullYear()} PAZ Thriving Tribe. All rights reserved.</div>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `;
}
