import fs from 'fs';

const env = {};
for (const line of fs.readFileSync(new URL('../.env', import.meta.url), 'utf8').split(/\r?\n/)) {
  if (!line || line.trim().startsWith('#')) continue;
  const idx = line.indexOf('=');
  if (idx < 0) continue;
  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  env[key] = value;
}

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.VITE_SUPABASE_ANON_KEY;
const insertKey = serviceRoleKey || anonKey;

if (!supabaseUrl || !insertKey) {
  console.error('Missing Supabase environment variables in .env');
  process.exit(1);
}

const products = [
  { title: 'Confidence for Teens', description: 'Digital guide', price: 5500, category: 'Ebook', cover: '/logo/logomain.png', file_url: '', rating: 4.9, reviews: 28, in_stock: true, stock_count: 245, prime: true },
  { title: 'Thriving Parent Guide', description: 'Practical guide for parents', price: 7000, category: 'Guide', cover: '/logo/logo2.jpeg', file_url: '', rating: 4.8, reviews: 19, in_stock: true, stock_count: 156, prime: true },
  { title: 'Purpose Planner Workbook', description: 'Goal-setting workbook', price: 4500, category: 'Workbook', cover: '/logo/logo2.jpeg', file_url: '', rating: 4.7, reviews: 33, in_stock: true, stock_count: 312, prime: false },
  { title: 'Family Routine Kit', description: 'Routine planner', price: 6200, category: 'Planner', cover: '/logo/logomain.png', file_url: '', rating: 4.9, reviews: 22, in_stock: true, stock_count: 120, prime: true }
];

const bankAccount = {
  bank_name: 'Access Bank',
  account_name: 'Paz Thriving Tribe',
  account_number: '0012345678',
  account_type: 'Savings',
  swift_code: 'ABNGNGLA',
  note: 'Please include your order name and email in the transfer narration.'
};

const orders = [
  {
    order_number: 'PAZ-1001',
    customer_name: 'Ada Johnson',
    email: 'ada@example.com',
    phone: '+2348000000001',
    subtotal: 11000,
    total: 11000,
    notes: 'Priority delivery',
    status: 'paid'
  },
  {
    order_number: 'PAZ-1002',
    customer_name: 'Musa Bello',
    email: 'musa@example.com',
    phone: '+2348000000002',
    subtotal: 9500,
    total: 9500,
    notes: 'Follow-up by email',
    status: 'paid'
  },
  {
    order_number: 'PAZ-1003',
    customer_name: 'Grace Adebayo',
    email: 'grace@example.com',
    phone: '+2348000000003',
    subtotal: 7000,
    total: 7000,
    notes: 'Gift purchase',
    status: 'pending'
  }
];

const orderItems = {
  'PAZ-1001': [
    { title: 'Confidence for Teens', price: 5500, quantity: 1 },
    { title: 'Purpose Planner Workbook', price: 4500, quantity: 1 }
  ],
  'PAZ-1002': [
    { title: 'Thriving Parent Guide', price: 7000, quantity: 1 },
    { title: 'Family Routine Kit', price: 2500, quantity: 1 }
  ],
  'PAZ-1003': [
    { title: 'Thriving Parent Guide', price: 7000, quantity: 1 }
  ]
};

async function request(path, method, body) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: insertKey,
      Authorization: `Bearer ${insertKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = text; }

  if (!res.ok) {
    const message = typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
    throw new Error(`${method} ${path} failed: ${res.status} ${message}`);
  }

  return parsed;
}

console.log('Seeding demo commerce records...');

const insertedProducts = await request('store_products', 'POST', products);
console.log(`Inserted ${insertedProducts.length} products.`);

await request('store_bank_accounts', 'POST', bankAccount);
console.log('Inserted bank account.');

const insertedOrders = await request('shop_orders', 'POST', orders);
console.log(`Inserted ${insertedOrders.length} orders.`);

for (const order of insertedOrders) {
  const items = orderItems[order.order_number] || [];
  const rows = items.map((item) => ({
    order_id: order.id,
    product_id: item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: item.title,
    price: item.price,
    quantity: item.quantity
  }));

  if (rows.length > 0) {
    const result = await request('shop_order_items', 'POST', rows);
    console.log(`Inserted ${result.length} items for ${order.order_number}.`);
  }
}

console.log('Seed complete. Refresh the dashboard to see live commerce data.');
