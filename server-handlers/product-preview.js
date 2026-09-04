import { createClient } from '@supabase/supabase-js';

const fallbackCover = 'https://pazthrivingtribe.org/logo/logomain.png';

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const slugify = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const coverUrl = (cover) => {
  const value = String(cover || '').trim();
  if (!value) return fallbackCover;
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  const supabaseUrl = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const storagePath = value.replace(/^\/+/, '').replace(/^storage\/v1\/object\/public\//, '');
  if (supabaseUrl && (storagePath.startsWith('products/') || value.includes('/storage/v1/object/public/'))) {
    const path = storagePath.startsWith('products/') ? `prof-upload/${storagePath}` : storagePath;
    return `${supabaseUrl}/storage/v1/object/public/${path}`;
  }
  return `https://pazthrivingtribe.org/${value.replace(/^\/+/, '')}`;
};

const sendHtml = (res, html) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Vary', 'User-Agent');
  res.end(html);
};

const redirectToProduct = (res, location) => {
  res.statusCode = 302;
  res.setHeader('Location', location);
  res.setHeader('Cache-Control', 'no-store');
  res.end();
};

const isSocialCrawler = (userAgent = '') => /facebookexternalhit|facebot|whatsapp|twitterbot|linkedinbot|pinterest|slackbot|discordbot|telegrambot/i.test(userAgent);

const isInAppBrowser = (userAgent = '') => /fb_iab|fbav|fban|messenger|instagram/i.test(userAgent);

export default async function handler(req, res) {
  const requestedSlug = slugify(req.query?.slug || '');
  let product = null;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey && requestedSlug) {
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
    const { data } = await supabase.from('store_products').select('id,title,description,cover').limit(200);
    product = (data || []).find((item) => slugify(item.title || item.id) === requestedSlug || String(item.id || '').toLowerCase() === requestedSlug) || null;
  }

  const title = product?.title || 'Paz Thriving Tribe';
  const description = product?.description || 'Digital resources from Paz Thriving Tribe.';
  const cover = coverUrl(product?.cover || product?.cover_url || product?.cover_image || product?.image || product?.image_url || product?.imageUrl);
  const browserUrl = `https://pazthrivingtribe.org/shop?product=${encodeURIComponent(requestedSlug)}`;
  const canonicalUrl = `https://pazthrivingtribe.org/shop/${encodeURIComponent(requestedSlug)}`;

  const userAgent = req.headers?.['user-agent'] || req.headers?.['User-Agent'] || '';
  if (isInAppBrowser(userAgent) || !isSocialCrawler(userAgent)) {
    return redirectToProduct(res, browserUrl);
  }

  sendHtml(res, `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta property="og:type" content="product"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:image" content="${escapeHtml(cover)}"><meta property="og:url" content="${escapeHtml(canonicalUrl)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${escapeHtml(cover)}"><meta http-equiv="refresh" content="0;url=${escapeHtml(browserUrl)}"></head><body><p>Opening ${escapeHtml(title)}...</p><p><a href="${escapeHtml(browserUrl)}">Continue to product</a></p></body></html>`);
}
