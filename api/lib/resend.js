export async function sendResendEmail({
  to,
  subject,
  html,
  text,
  from = process.env.RESEND_FROM_EMAIL || 'notifications@pazthrivingtribe.org',
  replyTo,
  name = 'PAZ Thriving Tribe',
  attachments = []
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('Resend API key is not configured.');
  }

  const recipients = Array.isArray(to) ? to : [to];
  const normalizedAttachments = await Promise.all((attachments || []).map(async (attachment) => {
    if (!attachment) return null;

    if (attachment.content && attachment.filename) {
      return {
        filename: attachment.filename,
        content: String(attachment.content)
      };
    }

    if (attachment.url && attachment.filename) {
      try {
        const fileResponse = await fetch(attachment.url);
        if (!fileResponse.ok) {
          console.warn(`Skipping attachment because the file could not be fetched: ${attachment.url}`);
          return null;
        }

        const arrayBuffer = await fileResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return {
          filename: attachment.filename,
          content: buffer.toString('base64')
        };
      } catch (fetchError) {
        console.warn(`Skipping attachment because fetching failed: ${attachment.url}`, fetchError.message || fetchError);
        return null;
      }
    }

    return null;
  }));

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
      ...(replyTo ? { reply_to: replyTo } : {}),
      ...(normalizedAttachments.length ? { attachments: normalizedAttachments.filter(Boolean) } : {})
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
