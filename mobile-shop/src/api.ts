const isLocalWeb = typeof window !== 'undefined'
  && typeof window.location !== 'undefined'
  && ['localhost', '127.0.0.1'].includes(window.location.hostname);
export const API_ROOT = isLocalWeb
  ? 'http://localhost:3001/api'
  : 'https://www.pazthrivingtribe.org/api';
export const SITE_ROOT = 'https://www.pazthrivingtribe.org';

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number | null;
  currency: string;
  isFree: boolean;
  category: string;
  cover: string;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviews: number;
  vendorName: string;
  fileFormats: string[];
  releaseEnabled: boolean;
  releaseAt: string | null;
  closeAt: string | null;
  allowAfterClose: boolean;
};

export type Rating = {
  id: string;
  reviewer_name: string;
  rating: number;
  comment?: string | null;
  created_at: string;
};

export type CartLine = { product: Product; quantity: number };
export type Availability = { available: boolean; reason: string; message: string };
export type DeliveryAddress = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export async function apiRequest(path: string, method: 'GET' | 'POST' = 'GET', body?: unknown, accessToken?: string): Promise<any> {
  const response = await fetch(`${API_ROOT}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'The shop could not complete that request.');
  return payload;
}

export function normalizeProduct(raw: Record<string, unknown>): Product {
  const stock = raw.stock_count ?? raw.stockCount;
  const originalPriceValue = raw.original_price ?? raw.compare_at_price ?? raw.regular_price ?? null;
  const originalPrice = originalPriceValue == null ? null : Number(originalPriceValue);
  const formatsValue = raw.file_formats ?? raw.formats ?? raw.file_format;
  const fileFormats = Array.isArray(formatsValue)
    ? formatsValue.map(String).filter(Boolean)
    : typeof formatsValue === 'string'
      ? formatsValue.split(/[;,]/).map((format) => format.trim()).filter(Boolean)
      : [];
  return {
    id: String(raw.id || raw.product_id || ''),
    title: String(raw.title || raw.name || 'Untitled product'),
    description: String(raw.description || ''),
    price: Number(raw.price ?? raw.amount ?? 0),
    originalPrice: Number.isFinite(originalPrice) ? originalPrice : null,
    currency: String(raw.currency || 'NGN').toUpperCase(),
    isFree: Boolean(raw.is_free ?? raw.isFree ?? false),
    category: String(raw.category || 'Digital product'),
    cover: String(raw.cover || raw.cover_url || raw.cover_image || raw.image_url || raw.image || ''),
    inStock: Boolean(raw.in_stock ?? raw.inStock ?? true),
    stockCount: stock == null ? 1 : Number(stock),
    rating: Number(raw.rating || 0),
    reviews: Number(raw.reviews || 0),
    vendorName: String(raw.vendor_name || raw.vendorName || ''),
    fileFormats,
    releaseEnabled: Boolean(raw.release_enabled ?? raw.releaseEnabled),
    releaseAt: (raw.release_at || raw.releaseAt || null) as string | null,
    closeAt: (raw.close_at || raw.closeAt || null) as string | null,
    allowAfterClose: Boolean(raw.allow_after_close ?? raw.allowAfterClose),
  };
}

export function categoryMatches(productCategory: string, selectedCategory: string) {
  const productValue = productCategory.trim().toLowerCase();
  const selectedValue = selectedCategory.trim().toLowerCase();
  if (!selectedValue || selectedValue === 'all') return true;
  if (selectedValue === 'groceries' || selectedValue === 'grocery') {
    return /grocer|grocery|food|produce|market/.test(productValue);
  }
  if (selectedValue === 'gadgets' || selectedValue === 'gadget') {
    return /gadget|electronic|technology|tech/.test(productValue);
  }
  if (selectedValue === 'ebooks' || selectedValue === 'ebook' || selectedValue === 'books') {
    return /ebook|book|stationery|guide/.test(productValue);
  }
  if (selectedValue === 'journals' || selectedValue === 'journal') {
    return /journal|planner|notebook|tracker/.test(productValue);
  }
  if (selectedValue === 'digital products' || selectedValue === 'digital product') {
    return /digital|template|course|software|download/.test(productValue);
  }
  return productValue === selectedValue;
}

export function productAvailability(product: Product): Availability {
  if (product.releaseEnabled && product.releaseAt) {
    const release = Date.parse(product.releaseAt);
    if (Number.isFinite(release) && Date.now() < release) {
      return { available: false, reason: 'not-released', message: `Available ${new Date(release).toLocaleString()}` };
    }
  }
  if (product.releaseEnabled && product.closeAt && !product.allowAfterClose) {
    const close = Date.parse(product.closeAt);
    if (Number.isFinite(close) && Date.now() >= close) {
      return { available: false, reason: 'closed', message: 'This product is no longer available.' };
    }
  }
  return { available: true, reason: '', message: '' };
}

export function formatPrice(product: Pick<Product, 'price' | 'currency' | 'isFree'>) {
  if (product.isFree) return 'Free';
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: product.currency,
      maximumFractionDigits: 0,
    }).format(product.price);
  } catch {
    return `${product.currency} ${product.price.toLocaleString()}`;
  }
}

export function productImageUrl(cover: string, storageBaseUrl: string) {
  if (!cover) return '';
  if (/^(https?:|data:|file:)/i.test(cover)) return cover;
  const base = storageBaseUrl.replace(/\/$/, '');
  if (cover.startsWith('/storage/v1/object/public/')) return `${base}${cover}`;
  if (cover.startsWith('products/')) {
    return `${base}/storage/v1/object/public/prof-upload/${cover.split('/').map(encodeURIComponent).join('/')}`;
  }
  return `${SITE_ROOT}/${cover.replace(/^\/+/, '')}`;
}

export function productSlug(title: string) {
  return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}