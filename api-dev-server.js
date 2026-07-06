/**
 * Development API Server for PAZ Thriving Tribe
 * Runs on port 3001 and handles /api requests during local development
 * 
 * Usage: node api-dev-server.js
 */

import http from 'http';
import url from 'url';

const PORT = 3001;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Parse body for POST requests
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      if (pathname === '/api/proxy-page' && req.method === 'GET') {
        const targetUrl = parsedUrl.searchParams.get('url');
        if (!targetUrl) {
          res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Missing url parameter');
          return;
        }

        let parsedTargetUrl;
        try {
          parsedTargetUrl = new URL(targetUrl);
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Invalid url parameter');
          return;
        }

        try {
          const upstreamResponse = await fetch(parsedTargetUrl.toString(), {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'
            },
            redirect: 'follow'
          });

          const html = await upstreamResponse.text();
          const rewrittenHtml = html
            .replace(/<head[^>]*>/i, (match) => `${match}\n<base href="${parsedTargetUrl.origin}/">`)
            .replace(/(src|href|action)=["']\//gi, `$1="${parsedTargetUrl.origin}/`)
            .replace(/(src|href|action)=["'](?!https?:|\/|data:|mailto:|tel:|javascript:|#)/gi, '$1="' + parsedTargetUrl.origin + '/');

          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store'
          });
          res.end(rewrittenHtml);
        } catch (error) {
          res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`Unable to load the requested page: ${error.message}`);
        }
        return;
      }

      // Handle send-notification-email endpoint
      if (pathname === '/api/send-notification-email' && req.method === 'POST') {
        const data = body ? JSON.parse(body) : {};
        const { email, service, timestamp } = data;

        // Validation
        if (!email || !service) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Missing required fields' }));
          return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid email address' }));
          return;
        }

        // Success response
        console.log(`✓ [DEV API] Email subscription recorded: ${email} for service: ${service}`);
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: 'Thank you for subscribing! Check your email for confirmation.',
          data: {
            email: email.toLowerCase().trim(),
            service: service,
            subscribedAt: timestamp || new Date().toISOString()
          }
        }));
        return;
      }

      // Default 404
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'API route not found' }));
    } catch (error) {
      console.error('API Error:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  PAZ Thriving Tribe - Development API Server               ║
║  Running on http://localhost:${PORT}                       ║
║                                                            ║
║  Endpoints:                                                ║
║  - POST /api/send-notification-email                       ║
║  - GET /api/proxy-page                                     ║
║                                                            ║
║  💡 Keep this running alongside "npm run dev"              ║
╚════════════════════════════════════════════════════════════╝
  `);
});
