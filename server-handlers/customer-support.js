import { createClient } from '@supabase/supabase-js';
import { sendResendEmail } from './lib/resend.js';

const adminEmails = () => [...new Set([process.env.ADMIN_EMAILS, process.env.VITE_ADMIN_EMAILS, 'pazthrivingtribe@gmail.com'].flatMap((value) => String(value || '').split(',')).map((value) => value.trim().toLowerCase()).filter((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)))];
const json = (res, status, payload) => res.status(status).json(payload);

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const message = String(req.body?.message || '').trim();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) return json(res, 400, { error: 'Name, valid email, and message are required.' });
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !process.env.RESEND_API_KEY) return json(res, 500, { error: 'Support notifications are not configured.' });
  try {
    const supabase = createClient(url, key);
    await supabase.from('customer_support_messages').insert({ sender_name: name, sender_email: email, message, status: 'open' });
    await sendResendEmail({ to: adminEmails(), subject: `Customer care message from ${name}`, html: `<p>A customer sent a new support message.</p><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>`, text: `Customer care message from ${name} (${email}): ${message}`, from: process.env.RESEND_FROM_EMAIL || 'notifications@pazthrivingtribe.org' });
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('Customer support notification failed:', error);
    return json(res, 500, { error: 'The support message could not be sent.' });
  }
}
