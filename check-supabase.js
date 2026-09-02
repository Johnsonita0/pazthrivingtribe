import fs from 'fs';

const env = {};
for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
  if (!line || line.trim().startsWith('#')) continue;
  const idx = line.indexOf('=');
  if (idx < 0) continue;
  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim().replace(/^['\"]|['\"]$/g, '');
  env[key] = value;
}

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.log(JSON.stringify({ error: 'Missing Supabase configuration in .env' }, null, 2));
  process.exit(1);
}

const tables = ['store_products', 'store_bank_accounts', 'shop_orders', 'shop_order_items'];

for (const table of tables) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      Accept: 'application/json'
    }
  });

  const text = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }

  const rows = Array.isArray(parsed) ? parsed : [];
  console.log(JSON.stringify({
    table,
    status: res.status,
    count: rows.length,
    sample: rows.slice(0, 2)
  }, null, 2));
}
