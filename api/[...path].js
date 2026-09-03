import adminAuthHandler from '../server-handlers/admin-auth.js';
import adminHealthHandler from '../server-handlers/admin-health.js';
import adminUpdateHandler from '../server-handlers/admin-update.js';
import completeShopPaymentHandler from '../server-handlers/complete-shop-payment.js';
import currencyRatesHandler from '../server-handlers/currency-rates.js';
import fetchMetaHandler from '../server-handlers/fetch-meta.js';
import paystackWebhookHandler from '../server-handlers/paystack-webhook.js';
import resendWebhookHandler from '../server-handlers/resend-webhook.js';
import sendNotificationEmailHandler from '../server-handlers/send-notification-email.js';
import sendRegistrationEmailHandler from '../server-handlers/send-registration-email.js';
import trackVisitorHandler from '../server-handlers/track-visitor.js';
import completeServicePaymentHandler from '../server-handlers/complete-service-payment.js';
import productPreviewHandler from '../server-handlers/product-preview.js';

const handlers = {
  '/admin-auth': adminAuthHandler,
  '/admin-health': adminHealthHandler,
  '/admin-update': adminUpdateHandler,
  '/complete-shop-payment': completeShopPaymentHandler,
  '/complete-service-payment': completeServicePaymentHandler,
  '/product-preview': productPreviewHandler,
  '/currency-rates': currencyRatesHandler,
  '/fetch-meta': fetchMetaHandler,
  '/paystack-webhook': paystackWebhookHandler,
  '/resend-webhook': resendWebhookHandler,
  '/send-notification-email': sendNotificationEmailHandler,
  '/send-registration-email': sendRegistrationEmailHandler,
  '/track-visitor': trackVisitorHandler,
  '/webhook': resendWebhookHandler
};

function sendJson(res, statusCode, payload) {
  if (typeof res.status === 'function') return res.status(statusCode).json(payload);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const route = requestUrl.pathname.startsWith('/api/')
    ? requestUrl.pathname.slice('/api'.length)
    : requestUrl.pathname;
  const routeHandler = handlers[route];

  if (!routeHandler) return sendJson(res, 404, { error: 'API route not found' });

  req.query = Object.fromEntries(requestUrl.searchParams.entries());

  try {
    return await routeHandler(req, res);
  } catch (error) {
    console.error(`API Error (${route}):`, error);
    return sendJson(res, 500, { error: 'Internal server error' });
  }
}