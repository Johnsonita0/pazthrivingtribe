export async function sendMailjetEmail({
  to,
  subject,
  html,
  text,
  from = process.env.MAILJET_FROM_EMAIL || 'notifications@pazthrivingtribe.com',
  name = 'PAZ Thriving Tribe'
}) {
  const apiKey = process.env.MAILJET_API_KEY;
  const apiSecret = process.env.MAILJET_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('Mailjet API credentials are not configured.');
  }

  const recipients = Array.isArray(to) ? to : [to];

  const response = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`
    },
    body: JSON.stringify({
      Messages: [
        {
          From: {
            Email: from,
            Name: name
          },
          To: recipients.map((email) => ({
            Email: String(email).trim(),
            Name: String(email).trim()
          })),
          Subject: subject,
          HTMLPart: html || undefined,
          TextPart: text || (html ? stripHtml(html) : undefined)
        }
      ]
    })
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      responseBody?.ErrorMessage ||
      responseBody?.error ||
      `Mailjet request failed with status ${response.status}`
    );
  }

  return responseBody;
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
