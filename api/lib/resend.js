export async function sendResendEmail({
  to,
  subject,
  html,
  text,
  from = process.env.RESEND_FROM_EMAIL || 'notifications@pazthrivingtribe.org',
  replyTo,
  name = 'PAZ Thriving Tribe'
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('Resend API key is not configured.');
  }

  const recipients = Array.isArray(to) ? to : [to];

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      from: `${name} <${from}>`,
      to: recipients.map((email) => String(email).trim()),
      subject,
      html: html || undefined,
      text: text || (html ? stripHtml(html) : undefined),
      ...(replyTo ? { reply_to: replyTo } : {})
    })
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      responseBody?.message ||
      responseBody?.error ||
      `Resend request failed with status ${response.status}`
    );
  }

  return responseBody;
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
