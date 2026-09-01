export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Mailjet-Signature');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const webhookSecret = process.env.MAILJET_WEBHOOK_SECRET;
  const authHeader = req.headers.authorization || '';
  const sigHeader = req.headers['x-mailjet-signature'] || '';

  if (webhookSecret && authHeader !== `Bearer ${webhookSecret}` && String(sigHeader).trim() !== webhookSecret) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized webhook request' }));
    return;
  }

  let payload = req.body;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      return;
    }
  }

  const rawEvents = Array.isArray(payload) ? payload : Array.isArray(payload?.Data) ? payload.Data : [payload];

  if (!rawEvents.length) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'No Mailjet events received' }));
    return;
  }

  const sanitizedEvents = rawEvents.map((event, index) => {
    const eventData = event && typeof event === 'object' ? event : { raw: event };
    const eventType = eventData.EventType || eventData.event || eventData.event_type || 'unknown';
    const messageId = eventData.MessageID || eventData.message_id || eventData.MessageId || null;
    const email = eventData.Email || eventData.email || null;
    const state = eventData.State || eventData.state || null;
    const timestamp = eventData.TimeStamp || eventData.timestamp || eventData.Time || new Date().toISOString();

    return {
      index,
      eventType,
      messageId,
      email,
      state,
      timestamp,
      raw: eventData
    };
  });

  console.log('Mailjet webhook received:', JSON.stringify(sanitizedEvents, null, 2));

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: true,
    received: sanitizedEvents.length,
    events: sanitizedEvents.map(({ index, eventType, messageId, email, state, timestamp }) => ({
      index,
      eventType,
      messageId,
      email,
      state,
      timestamp
    }))
  }));
}
