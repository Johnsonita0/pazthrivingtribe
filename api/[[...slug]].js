import adminAuthHandler from '../api-handlers/admin-auth.js';
import adminHealthHandler from '../api-handlers/admin-health.js';
import adminPasswordResetHandler from '../api-handlers/admin-password-reset.js';
import adminUpdateHandler from '../api-handlers/admin-update.js';
import fetchMetaHandler from '../api-handlers/fetch-meta.js';
import sendEmailResendHandler from '../api-handlers/send-email-resend.js';
import sendNotificationEmailHandler from '../api-handlers/send-notification-email.js';
import sendRegistrationEmailHandler from '../api-handlers/send-registration-email.js';
import trackVisitorHandler from '../api-handlers/track-visitor.js';
import resendWebhookHandler from '../api-handlers/resend-webhook.js';

const ROUTES = {
  'admin-auth': adminAuthHandler,
  'admin-health': adminHealthHandler,
  'admin-password-reset': adminPasswordResetHandler,
  'admin-update': adminUpdateHandler,
  'fetch-meta': fetchMetaHandler,
  'send-email-resend': sendEmailResendHandler,
  'send-notification-email': sendNotificationEmailHandler,
  'send-registration-email': sendRegistrationEmailHandler,
  'track-visitor': trackVisitorHandler,
  'resend-webhook': resendWebhookHandler,
};

const readRequestBody = async (req) => {
  if (req.body !== undefined && req.body !== null) {
    return req.body;
  }

  const contentType = String(req.headers['content-type'] || '');
  if (!contentType.includes('application/json') && !contentType.includes('text/plain')) {
    return {};
  }

  return await new Promise((resolve, reject) => {
    let rawBody = '';

    req.on('data', (chunk) => {
      rawBody += chunk.toString();
    });

    req.on('end', () => {
      if (!rawBody.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch {
        resolve(rawBody);
      }
    });

    req.on('error', reject);
  });
};

export default async function handler(req, res) {
  const requestUrl = new URL(req.url || '/', 'http://localhost');
  const pathname = requestUrl.pathname.replace(/^\/api\/?/, '').replace(/^\//, '');
  const matchKey = pathname.split('/')[0];
  const routeHandler = ROUTES[matchKey];

  if (!routeHandler) {
    if (typeof res.status === 'function') {
      return res.status(404).json({ error: 'API route not found', path: pathname || 'root' });
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'API route not found', path: pathname || 'root' }));
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version');
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'OPTIONS') {
    req.body = await readRequestBody(req);
  }

  return routeHandler(req, res);
}
