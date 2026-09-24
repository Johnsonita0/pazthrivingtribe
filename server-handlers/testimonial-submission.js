import { createClient } from '@supabase/supabase-js';
import { sendResendEmail } from './lib/resend.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const admins = () => [...new Set([globalThis.process?.env?.ADMIN_EMAILS, globalThis.process?.env?.VITE_ADMIN_EMAILS, 'pazthrivingtribe@gmail.com']
  .flatMap((value) => String(value || '').split(','))
  .map((value) => value.trim().toLowerCase())
  .filter((value) => emailPattern.test(value)))];
const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const json = (res, status, payload) => res.status(status).json(payload);

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  const author = String(req.body?.name || '').trim();
  const text = String(req.body?.message || '').trim();
  const origin = String(req.body?.origin || 'Parent').trim();
  if (!author || !text) return json(res, 400, { error: 'Name and testimonial are required.' });

  const url = globalThis.process?.env?.SUPABASE_URL || globalThis.process?.env?.VITE_SUPABASE_URL;
  const key = globalThis.process?.env?.SUPABASE_SERVICE_ROLE_KEY || globalThis.process?.env?.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !globalThis.process?.env?.RESEND_API_KEY) return json(res, 500, { error: 'Testimonial notifications are not configured.' });

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase.from('tribe_testimonials').insert({
      author,
      text,
      origin,
      status: 'pending'
    }).select('id,author,text,origin,status,created_at').single();
    if (error) throw error;

    await sendResendEmail({
      to: admins(),
      subject: 'New testimonial awaiting approval',
      html: `<p>A new testimonial was submitted and is waiting for admin approval.</p><p><strong>Author:</strong> ${escapeHtml(author)}</p><p><strong>Origin:</strong> ${escapeHtml(origin)}</p><blockquote>${escapeHtml(text).replace(/\n/g, '<br>')}</blockquote><p>Open the admin dashboard and use the Post to slider action only after review.</p>`,
      text: `New testimonial awaiting approval\n\nAuthor: ${author}\nOrigin: ${origin}\n\n${text}\n\nReview it in the admin dashboard before posting it to the slider.`,
      from: globalThis.process?.env?.RESEND_FROM_EMAIL || 'notifications@pazthrivingtribe.org'
    });
    return json(res, 200, { ok: true, data });
  } catch (error) {
    console.error('Testimonial submission failed:', error);
    return json(res, 500, { error: 'The testimonial could not be submitted for review.' });
  }
}