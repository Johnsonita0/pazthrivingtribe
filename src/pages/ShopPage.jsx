import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { getCountries, getCountryCallingCode, isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js';
import { isSupabaseStub, setWebAuthRememberMe, supabase } from '../supabaseClient';
import ProductCover, { resolveProductCover } from '../components/ProductCover';
import ProductChat from '../components/ProductChat';
import LegalDocumentModal from '../components/LegalDocumentModal';
import { notifyAdminActivity } from '../utils/notifyAdminActivity';
import { getIndependenceDaySlides } from '../utils/independenceDaySlides';
import { getProductAvailability } from '../utils/productAvailability';
import { legalDocuments } from '../legalDocuments';

const isStorefrontProduct = (product) =>
  product.status === 'published' ||
  (!product.vendor_id && product.status === 'approved');

const canonicalShopCategory = (category) => {
  const value = String(category || '').trim();
  if (/\b(groceries|grocery|food|supermarket)\b/i.test(value)) return 'Groceries';
  if (/\b(gadgets?|electronics?|technology|devices?|accessories)\b/i.test(value)) return 'Gadgets';
  return value || 'Other';
};

const defaultBankAccount = {
  accountName: 'Paz Thriving Tribe',
  accountNumber: '0012345678',
  accountType: 'Savings',
  swiftCode: 'ABNGNGLA',
  note: 'Please include your order name and email in the transfer narration.'
};

const phoneCountries = getCountries().map((code) => ({
  code,
  dialCode: `+${getCountryCallingCode(code)}`
}));
const fallbackCurrencyRatesToNgn = { NGN: 1, USD: 1500, GBP: 1900, EUR: 1650, GHS: 95, KES: 11, ZAR: 85 };
const currencySymbols = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', GHS: 'GH₵', KES: 'KSh', ZAR: 'R' };
const promotionalSlides = [
  { eyebrow: 'PAZ Marketplace', title: 'Publish your books and earn from every sale.', action: 'Register as a vendor', url: '/vendor' },
  { eyebrow: 'Reach more readers', title: 'Put your guides, ebooks, and workbooks in front of a growing community.', action: 'Join as a vendor', url: '/vendor' },
  { eyebrow: 'Verified vendor network', title: 'Build trust with a professional storefront and secure product delivery.', action: 'Become a vendor', url: '/vendor' }
];
const independenceBookPromotion = {
  eyebrow: 'Nigeria Independence Day · New release',
  title: 'I Fainted… But I Didn’t Quit!',
  description: 'A story of resilience for Independence Day. Official release: 1 October 2026.',
  action: 'See the book',
  url: '/shop?product=i-fainted-but-i-didn-t-quit&app=1',
  isBookReleaseAd: true
};

const defaultProducts = [
  {
    id: 'ebook-confidence',
    title: 'Confidence for Teens - Complete Digital Guide',
    description: 'A step-by-step digital guide to help young people build confidence, healthy habits, and emotional resilience.',
    price: 5500,
    category: 'Ebook',
    cover: '/logo/logomain.png',
    fileUrl: '',
    rating: 4.5,
    reviews: 128,
    inStock: true,
    stockCount: 245,
    prime: true
  },
  {
    id: 'ebook-parent-guide',
    title: 'Thriving Parent Guide - Parenting Strategies',
    description: 'Practical strategies for communication, boundaries, and positive family routines with everyday life examples.',
    price: 7000,
    category: 'Guide',
    cover: '/logo/logo2.jpeg',
    fileUrl: '',
    rating: 4.8,
    reviews: 94,
    inStock: true,
    stockCount: 156,
    prime: true
  },
  {
    id: 'digital-workbook',
    title: 'Purpose Planner Workbook - Goal Setting Edition',
    description: 'A printable workbook for self-discovery, goal setting, and building a more intentional life.',
    price: 4500,
    category: 'Workbook',
    cover: '/logo/logo2.jpeg',
    fileUrl: '',
    rating: 4.3,
    reviews: 67,
    inStock: true,
    stockCount: 312,
    prime: false
  },
  {
    id: 'ebook-wellness',
    title: 'Wellness Journey - Complete Health Guide',
    description: 'Comprehensive guide to mental, physical, and emotional wellness for modern families.',
    price: 6000,
    category: 'Ebook',
    cover: '/logo/logomain.png',
    fileUrl: '',
    rating: 4.6,
    reviews: 156,
    inStock: true,
    stockCount: 89,
    prime: true
  },
  {
    id: 'guide-leadership',
    title: 'Youth Leadership Development Manual',
    description: 'Train young leaders with this comprehensive manual covering essential leadership skills.',
    price: 8500,
    category: 'Guide',
    cover: '/logo/logo2.jpeg',
    fileUrl: '',
    rating: 4.7,
    reviews: 112,
    inStock: true,
    stockCount: 78,
    prime: true
  },
  {
    id: 'workbook-academic',
    title: 'Academic Excellence Workbook',
    description: 'Study techniques, time management, and learning strategies for students of all ages.',
    price: 5200,
    category: 'Workbook',
    cover: '/logo/logomain.png',
    fileUrl: '',
    rating: 4.4,
    reviews: 203,
    inStock: true,
    stockCount: 298,
    prime: false
  },
  {
    id: 'ebook-emotional-intelligence',
    title: 'Emotional Intelligence Mastery Guide',
    description: 'Develop emotional awareness and interpersonal skills for personal and professional success.',
    price: 5800,
    category: 'Ebook',
    cover: '/logo/logomain.png',
    fileUrl: '',
    rating: 4.7,
    reviews: 89,
    inStock: true,
    stockCount: 145,
    prime: true
  },
  {
    id: 'guide-teen-mental-health',
    title: 'Teen Mental Health Complete Guide',
    description: 'Understanding and supporting teenage mental health challenges with practical interventions.',
    price: 7500,
    category: 'Guide',
    cover: '/logo/logo2.jpeg',
    fileUrl: '',
    rating: 4.6,
    reviews: 134,
    inStock: true,
    stockCount: 98,
    prime: true
  },
  {
    id: 'workbook-career-planning',
    title: 'Career Planning Workbook for Teens',
    description: 'Interactive workbook to explore career interests, skills, and create an actionable career plan.',
    price: 4800,
    category: 'Workbook',
    cover: '/logo/logomain.png',
    fileUrl: '',
    rating: 4.5,
    reviews: 76,
    inStock: true,
    stockCount: 267,
    prime: false
  },
  {
    id: 'ebook-communication-skills',
    title: 'Powerful Communication Skills for Families',
    description: 'Learn proven communication techniques to strengthen family relationships and resolve conflicts.',
    price: 5200,
    category: 'Ebook',
    cover: '/logo/logomain.png',
    fileUrl: '',
    rating: 4.4,
    reviews: 145,
    inStock: true,
    stockCount: 234,
    prime: true
  },
  {
    id: 'guide-financial-literacy',
    title: 'Financial Literacy for Young People',
    description: 'Master money management, budgeting, saving, and investing basics for financial independence.',
    price: 6500,
    category: 'Guide',
    cover: '/logo/logo2.jpeg',
    fileUrl: '',
    rating: 4.8,
    reviews: 267,
    inStock: true,
    stockCount: 189,
    prime: true
  },
  {
    id: 'workbook-self-esteem',
    title: 'Self-Esteem Building Workbook',
    description: 'Exercises and reflections to boost self-esteem, overcome self-doubt, and build positive self-image.',
    price: 4200,
    category: 'Workbook',
    cover: '/logo/logo2.jpeg',
    fileUrl: '',
    rating: 4.5,
    reviews: 92,
    inStock: true,
    stockCount: 356,
    prime: false
  },
  {
    id: 'ebook-digital-safety',
    title: 'Digital Safety & Online Wellness Guide',
    description: 'Navigate the digital world safely with strategies for cybersecurity, privacy, and healthy tech habits.',
    price: 5000,
    category: 'Ebook',
    cover: '/logo/logomain.png',
    fileUrl: '',
    rating: 4.3,
    reviews: 118,
    inStock: true,
    stockCount: 201,
    prime: true
  },
  {
    id: 'guide-social-skills',
    title: 'Social Skills Development Guide',
    description: 'Build genuine friendships and navigate social situations with confidence and authenticity.',
    price: 6200,
    category: 'Guide',
    cover: '/logo/logo2.jpeg',
    fileUrl: '',
    rating: 4.6,
    reviews: 156,
    inStock: true,
    stockCount: 124,
    prime: true
  },
  {
    id: 'workbook-mindfulness',
    title: 'Mindfulness & Meditation Workbook',
    description: 'Daily practices and exercises to develop mindfulness, reduce stress, and improve mental clarity.',
    price: 4600,
    category: 'Workbook',
    cover: '/logo/logomain.png',
    fileUrl: '',
    rating: 4.7,
    reviews: 234,
    inStock: true,
    stockCount: 279,
    prime: false
  },
  {
    id: 'ebook-goal-achievement',
    title: 'Goal Achievement Mastery - Your Path to Success',
    description: 'Strategic framework and actionable steps to set, track, and achieve ambitious life goals.',
    price: 5900,
    category: 'Ebook',
    cover: '/logo/logomain.png',
    fileUrl: '',
    rating: 4.5,
    reviews: 201,
    inStock: true,
    stockCount: 167,
    prime: true
  },
  {
    id: 'guide-study-excellence',
    title: 'Study Excellence Guide - Exam Success',
    description: 'Comprehensive strategies for effective studying, memory retention, and exam preparation.',
    price: 7200,
    category: 'Guide',
    cover: '/logo/logo2.jpeg',
    fileUrl: '',
    rating: 4.6,
    reviews: 189,
    inStock: true,
    stockCount: 143,
    prime: true
  },
  {
    id: 'workbook-time-management',
    title: 'Time Management Mastery Workbook',
    description: 'Practical tools and templates to organize your time, increase productivity, and reduce procrastination.',
    price: 4300,
    category: 'Workbook',
    cover: '/logo/logo2.jpeg',
    fileUrl: '',
    rating: 4.4,
    reviews: 178,
    inStock: true,
    stockCount: 334,
    prime: false
  },
  {
    id: 'ebook-resilience-building',
    title: 'Building Resilience in Challenging Times',
    description: 'Develop mental toughness and bounce back from setbacks with proven psychological techniques.',
    price: 5600,
    category: 'Ebook',
    cover: '/logo/logomain.png',
    fileUrl: '',
    rating: 4.8,
    reviews: 145,
    inStock: true,
    stockCount: 112,
    prime: true
  },
  {
    id: 'guide-conflict-resolution',
    title: 'Conflict Resolution Master Guide',
    description: 'Techniques for resolving disputes, mediating conflicts, and building harmonious relationships.',
    price: 6800,
    category: 'Guide',
    cover: '/logo/logo2.jpeg',
    fileUrl: '',
    rating: 4.7,
    reviews: 98,
    inStock: true,
    stockCount: 87,
    prime: true
  },
  {
    id: 'workbook-gratitude-journaling',
    title: 'Gratitude & Journaling Workbook',
    description: 'Transform your perspective through gratitude practice and reflective journaling exercises.',
    price: 3900,
    category: 'Workbook',
    cover: '/logo/logomain.png',
    fileUrl: '',
    rating: 4.6,
    reviews: 267,
    inStock: true,
    stockCount: 412,
    prime: false
  },
  {
    id: 'ebook-personal-branding',
    title: 'Personal Branding for Young Professionals',
    description: 'Build your personal brand online and offline to stand out in your career and pursuits.',
    price: 6100,
    category: 'Ebook',
    cover: '/logo/logomain.png',
    fileUrl: '',
    rating: 4.5,
    reviews: 112,
    inStock: true,
    stockCount: 156,
    prime: true
  },
  {
    id: 'guide-creative-thinking',
    title: 'Creative Thinking & Innovation Guide',
    description: 'Unlock your creative potential with techniques to generate ideas and solve problems innovatively.',
    price: 7100,
    category: 'Guide',
    cover: '/logo/logo2.jpeg',
    fileUrl: '',
    rating: 4.7,
    reviews: 134,
    inStock: true,
    stockCount: 101,
    prime: true
  },
  {
    id: 'workbook-relationship-building',
    title: 'Relationship Building Workbook',
    description: 'Develop authentic connections and nurture meaningful relationships in all areas of life.',
    price: 4700,
    category: 'Workbook',
    cover: '/logo/logo2.jpeg',
    fileUrl: '',
    rating: 4.4,
    reviews: 143,
    inStock: true,
    stockCount: 223,
    prime: false
  },
  {
    id: 'ebook-leadership-skills',
    title: 'Essential Leadership Skills for Teens',
    description: 'Develop leadership qualities and inspire others through practical skills and real-world examples.',
    price: 5700,
    category: 'Ebook',
    cover: '/logo/logomain.png',
    fileUrl: '',
    rating: 4.6,
    reviews: 167,
    inStock: true,
    stockCount: 198,
    prime: true
  },
  {
    id: 'guide-decision-making',
    title: 'Smart Decision Making Guide',
    description: 'Learn frameworks and strategies for making sound decisions that align with your values and goals.',
    price: 6300,
    category: 'Guide',
    cover: '/logo/logo2.jpeg',
    fileUrl: '',
    rating: 4.8,
    reviews: 156,
    inStock: true,
    stockCount: 119,
    prime: true
  },
  {
    id: 'workbook-passion-discovery',
    title: 'Passion & Purpose Discovery Workbook',
    description: 'Explore your interests and talents to discover your true passion and life purpose.',
    price: 5100,
    category: 'Workbook',
    cover: '/logo/logomain.png',
    fileUrl: '',
    rating: 4.5,
    reviews: 189,
    inStock: true,
    stockCount: 267,
    prime: false
  }
];

const money = (value, currency = 'NGN') => new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency,
  maximumFractionDigits: 0
}).format(Number(value || 0));

function OrderSuccessActions({ onShopMore }) {
  return (
    <div style={{ display: 'flex', gap: '10px', marginTop: '14px', width: '100%' }}>
      <button
        type="button"
        onClick={onShopMore}
        style={{
          flex: '1 1 100%',
          minWidth: 0,
          minHeight: '46px',
          padding: '10px 12px',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          background: '#fff',
          color: '#334155',
          fontWeight: 700,
          cursor: 'pointer',
          boxSizing: 'border-box'
        }}
      >
        Shop more
      </button>
    </div>
  );
}

const productPriceLabel = (product) => product.isFree ? 'Free' : `${currencySymbols[product.currency || 'NGN'] || ''}${Number(product.price || 0).toLocaleString()}`;

const productSlug = (product) => encodeURIComponent(String(product?.title || product?.id || 'product').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
const formatReviewTimestamp = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos'
  }).format(date);
};

const promotionalProductUrl = (value) => {
  const rawValue = String(value || '').trim();
  if (!rawValue) return '/shop';
  try {
    const parsedUrl = new URL(rawValue, window.location.origin);
    if (parsedUrl.pathname === '/shop' || parsedUrl.pathname.startsWith('/shop/')) {
      return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    }
    if (/^https?:/i.test(rawValue)) return rawValue;
  } catch {
  }
  if (rawValue.startsWith('/')) return rawValue;
  return `/shop/${encodeURIComponent(rawValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))}`;
};

const promotionalProductKey = (value) => {
  try {
    const parsedUrl = new URL(String(value || ''), window.location.origin);
    const pathProduct = parsedUrl.pathname.startsWith('/shop/') ? parsedUrl.pathname.slice('/shop/'.length) : '';
    return decodeURIComponent(parsedUrl.searchParams.get('product') || pathProduct).trim().toLowerCase();
  } catch {
    return '';
  }
};

let cartAudioContext;

const playCartFlightSound = async () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    cartAudioContext ||= new AudioContextClass();
    if (cartAudioContext.state === 'suspended') await cartAudioContext.resume();
    const audioContext = cartAudioContext;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(480, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(920, audioContext.currentTime + 0.14);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, audioContext.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.22);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.23);
  } catch {
    // Audio is optional and can be unavailable in restricted browsers.
  }
};

const normalizeProduct = (product = {}) => ({
  ...product,
  id: product.id || product.product_id,
  title: product.title || product.name || 'Untitled product',
  description: product.description || '',
  price: Number(product.price ?? product.amount ?? 0),
  currency: String(product.currency || 'NGN').toUpperCase(),
  isFree: Boolean(product.is_free ?? product.isFree ?? false),
  category: product.category || 'Ebook',
  cover: product.cover || product.cover_url || product.cover_image || product.image || product.image_url || product.imageUrl || '',
  fileUrl: product.file_url || product.fileUrl || '',
  inStock: product.in_stock ?? product.inStock ?? true,
  stockCount: Number(product.stock_count ?? product.stockCount ?? 0),
  rating: Number(product.rating ?? 0),
  reviews: Number(product.reviews ?? 0),
  vendorId: product.vendor_id || product.vendorId || null,
  vendorName: product.vendor_name || product.vendorName || '',
  releaseEnabled: Boolean(product.release_enabled ?? product.releaseEnabled ?? false),
  releaseAt: product.release_at || product.releaseAt || null,
  closeAt: product.close_at || product.closeAt || null,
  allowAfterClose: Boolean(product.allow_after_close ?? product.allowAfterClose ?? false),
  prime: Boolean(product.prime ?? false),
  createdAt: product.created_at || product.createdAt || null
});

const isNewProduct = (product) => {
  const createdAt = Date.parse(product?.createdAt || product?.created_at || '');
  return Number.isFinite(createdAt) && Date.now() - createdAt >= 0 && Date.now() - createdAt <= 7 * 24 * 60 * 60 * 1000;
};

function SearchableOptionPicker({ value, options, onChange, label }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filteredOptions = options.filter((option) => option.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div style={{ position: 'relative' }}>
      <button type="button" aria-label={label} aria-expanded={open} onClick={() => setOpen((current) => !current)} style={{ width: '100%', minHeight: '43px', padding: '10px 12px', border: '1px solid #f3b562', borderRadius: '8px', background: '#fff', color: '#334155', fontWeight: 800, textAlign: 'left', cursor: 'pointer' }}>
        {value} <span style={{ float: 'right' }}>⌄</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', zIndex: 20, top: 'calc(100% + 6px)', left: 0, right: 0, maxHeight: '260px', overflow: 'auto', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#fff', boxShadow: '0 14px 30px rgba(15, 23, 42, 0.16)' }}>
          <div style={{ position: 'sticky', top: '-8px', zIndex: 1, paddingBottom: '6px', background: '#fff' }}><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${label.toLowerCase()}...`} style={{ width: '100%', boxSizing: 'border-box', padding: '9px 10px', border: '1px solid #cbd5e1', borderRadius: '7px' }} /></div>
          <div>{filteredOptions.length > 0 ? filteredOptions.map((option) => (
            <button key={option} type="button" onClick={() => { onChange(option); setOpen(false); setQuery(''); }} style={{ display: 'block', width: '100%', padding: '9px 10px', border: 0, borderRadius: '6px', background: option === value ? '#fff7ed' : '#fff', color: '#334155', textAlign: 'left', fontWeight: option === value ? 800 : 600, cursor: 'pointer' }}>{option}</button>
          )) : <div style={{ padding: '10px', color: '#64748b', fontSize: '0.8rem' }}>No matches found.</div>}</div>
        </div>
      )}
    </div>
  );
}

const readStoreData = () => {
  try {
    const storedBank = JSON.parse(localStorage.getItem('paz_store_bank_account') || 'null');
    return {
      products: defaultProducts,
      bankAccount: storedBank || defaultBankAccount
    };
  } catch (error) {
    return { products: defaultProducts, bankAccount: defaultBankAccount };
  }
};

export default function ShopPage({ onOrderSubmitted, paystackPublicKey = '', storeProducts, storeBankAccount, isIndependenceDay = false, independenceAnniversary = 66, isIndependencePreview = false }) {
  const navigate = useNavigate();
  const { productName } = useParams();
  const [searchParams] = useSearchParams();
  const sharedProductSlug = searchParams.get('product');
  const resolvedProductName = productName || sharedProductSlug;
  const isProductPage = Boolean(resolvedProductName);
  const shopUrl = isIndependencePreview ? '/shop?independencePreview=1' : '/shop';
  const productUrl = (product) => {
    const path = `/shop/${productSlug(product)}`;
    return isIndependencePreview ? `${path}?independencePreview=1` : path;
  };
  const [storeData, setStoreData] = useState(readStoreData);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [availabilityNow, setAvailabilityNow] = useState(() => Date.now());
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevant');
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [productRatingSummaries, setProductRatingSummaries] = useState({});
  const [productMetrics, setProductMetrics] = useState(null);
  const [ratingForm, setRatingForm] = useState({ reviewerName: '', reviewerEmail: '', rating: 0, comment: '' });
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [descriptionOverflow, setDescriptionOverflow] = useState({ description: '', hasOverflow: false });
  const [activePromotionalSlide, setActivePromotionalSlide] = useState(0);
  const [promotionalAds, setPromotionalAds] = useState([]);
  const [calculatorCurrency, setCalculatorCurrency] = useState('NGN');
  const [currencyRatesToNgn, setCurrencyRatesToNgn] = useState(fallbackCurrencyRatesToNgn);
  const [cartFlights, setCartFlights] = useState([]);
  const cartButtonRef = useRef(null);
  const fireworksCanvasRef = useRef(null);
  const fireworksControllerRef = useRef(null);
  const fireworksIntervalRef = useRef(null);
  const [isSmallScreen, setIsSmallScreen] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 900 : false);
  const [isVerySmallScreen, setIsVerySmallScreen] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 360 : false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const [toast, setToast] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    email: '',
    countryCode: 'NG',
    phoneNumber: '',
    notes: ''
  });
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [checkoutStage, setCheckoutStage] = useState('details');
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [cartReminderVisible, setCartReminderVisible] = useState(false);
  const [paymentProofSaving, setPaymentProofSaving] = useState(false);
  const [paystackReady, setPaystackReady] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [releaseNotificationProduct, setReleaseNotificationProduct] = useState(null);
  const [releaseNotificationSubmitting, setReleaseNotificationSubmitting] = useState(false);
  const [releaseNotificationError, setReleaseNotificationError] = useState('');
  const [shopAuthSession, setShopAuthSession] = useState(null);
  const [shopAccountOpen, setShopAccountOpen] = useState(false);
  const [shopAuthMode, setShopAuthMode] = useState('signIn');
  const [shopAuthName, setShopAuthName] = useState('');
  const [shopAuthEmail, setShopAuthEmail] = useState('');
  const [shopAuthPassword, setShopAuthPassword] = useState('');
  const [shopAuthConfirmPassword, setShopAuthConfirmPassword] = useState('');
  const [shopAuthPasswordVisible, setShopAuthPasswordVisible] = useState(false);
  const [shopAuthConfirmPasswordVisible, setShopAuthConfirmPasswordVisible] = useState(false);
  const [shopAuthRemember, setShopAuthRemember] = useState(false);
  const [shopAuthConsent, setShopAuthConsent] = useState(false);
  const [shopLegalPolicy, setShopLegalPolicy] = useState(null);
  const [shopAuthBusy, setShopAuthBusy] = useState(false);
  const [shopAuthError, setShopAuthError] = useState('');
  const [shopAuthNotice, setShopAuthNotice] = useState('');
  const [shopAuthProfile, setShopAuthProfile] = useState(null);
  const [shopAccountPage, setShopAccountPage] = useState(null);
  const [shopAccountMenuOpen, setShopAccountMenuOpen] = useState(false);
  const [shopNotificationsOpen, setShopNotificationsOpen] = useState(false);
  const [shopOrders, setShopOrders] = useState([]);
  const [shopConversations, setShopConversations] = useState([]);
  const [activeShopConversation, setActiveShopConversation] = useState(null);
  const [shopNotifications, setShopNotifications] = useState([]);
  const [shopAccountDataBusy, setShopAccountDataBusy] = useState(false);
  const [shopAccountDataError, setShopAccountDataError] = useState('');
  const [shopAddress, setShopAddress] = useState({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'Nigeria' });
  const [shopAddressNotice, setShopAddressNotice] = useState('');
  const [shopAccountTheme, setShopAccountTheme] = useState(() => window.localStorage.getItem('paz-shop-account-theme') || 'light');

  const descriptionRef = useRef(null);
  const shopAccountMenuCloseTimer = useRef(null);
  const shopAccountDrawerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(shopAccountMenuCloseTimer.current), []);

  useEffect(() => {
    if (!isSmallScreen || !shopAccountMenuOpen) return undefined;
    const closeDrawerOnOutsideClick = (event) => {
      if (!shopAccountDrawerRef.current?.contains(event.target)) setShopAccountMenuOpen(false);
    };
    window.addEventListener('pointerdown', closeDrawerOnOutsideClick, true);
    return () => window.removeEventListener('pointerdown', closeDrawerOnOutsideClick, true);
  }, [isSmallScreen, shopAccountMenuOpen]);

  useEffect(() => {
    window.localStorage.setItem('paz-shop-account-theme', shopAccountTheme);
  }, [shopAccountTheme]);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setShopAuthSession(session);
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error('Could not load the shop customer session:', error);
        return;
      }
      setShopAuthSession(data.session);
    }).catch((error) => {
      if (active) console.error('Could not load the shop customer session:', error);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!shopAccountOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !shopAuthBusy) {
        setShopAccountOpen(false);
        setShopAuthPassword('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shopAccountOpen, shopAuthBusy]);

  useEffect(() => {
    if (!shopAccountMenuOpen && !shopNotificationsOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      window.clearTimeout(shopAccountMenuCloseTimer.current);
      setShopAccountMenuOpen(false);
      setShopNotificationsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [shopAccountMenuOpen, shopNotificationsOpen]);

  useEffect(() => {
    let active = true;
    if (!shopAuthSession?.user?.id) {
      setShopAuthProfile(null);
      return () => { active = false; };
    }
    supabase.from('customer_profiles')
      .select('first_name,last_name,full_name,email,phone,avatar_url,delivery_address')
      .eq('id', shopAuthSession.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error('Could not load the shop customer profile:', error);
          setShopAccountDataError('Your profile details could not be loaded. Please retry.');
          return;
        }
        setShopAuthProfile(data || null);
        const address = data?.delivery_address;
        if (address && typeof address === 'object') {
          setShopAddress((current) => ({ ...current, ...address }));
        }
      })
      .catch((error) => {
        if (active) {
          console.error('Could not load the shop customer profile:', error);
          setShopAccountDataError('Your profile details could not be loaded. Please retry.');
        }
      });
    return () => { active = false; };
  }, [shopAuthSession?.user?.id]);

  useEffect(() => {
    if (!shopAuthSession?.user?.id || !shopAccountPage || !['orders', 'notifications', 'messages'].includes(shopAccountPage)) return undefined;
    let active = true;
    setShopAccountDataBusy(true);
    setShopAccountDataError('');
    const loadData = async () => {
      if (shopAccountPage === 'orders') {
        const queryOrders = () => supabase.from('shop_orders')
          .select('id,order_number,total,currency,status,created_at,shop_order_items(title,quantity)')
          .order('created_at', { ascending: false })
          .limit(50);
        const [byCustomer, byEmail] = await Promise.all([
          queryOrders().eq('customer_id', shopAuthSession.user.id),
          shopAuthSession.user.email
            ? queryOrders().eq('email', shopAuthSession.user.email.toLowerCase())
            : Promise.resolve({ data: [], error: null })
        ]);
        if (byCustomer.error) throw byCustomer.error;
        if (byEmail.error) throw byEmail.error;
        if (active) setShopOrders([...new Map([...(byCustomer.data || []), ...(byEmail.data || [])].map((order) => [order.id, order])).values()]);
      } else if (shopAccountPage === 'messages') {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session?.access_token) throw new Error('Sign in again to view your messages.');
        const response = await fetch('/api/product-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
          body: JSON.stringify({ action: 'list-account' })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Messages could not be loaded.');
        if (active) setShopConversations(Array.isArray(payload.data) ? payload.data : []);
      } else {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session?.access_token) throw new Error('Sign in again to view your notifications.');
        const response = await fetch('/api/customer-notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
          body: JSON.stringify({ action: 'list' })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Notifications could not be loaded.');
        if (active) setShopNotifications(Array.isArray(payload.notifications) ? payload.notifications : []);
      }
    };
    loadData()
      .catch((error) => {
        if (active) {
          console.error(`Could not load customer ${shopAccountPage}:`, error);
          setShopAccountDataError(error?.message || 'Your account information could not be loaded. Please retry.');
        }
      })
      .finally(() => { if (active) setShopAccountDataBusy(false); });
    return () => { active = false; };
  }, [shopAccountPage, shopAuthSession?.user?.id]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setAvailabilityNow(Date.now()), 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const descriptionElement = descriptionRef.current;
    if (!descriptionElement || descriptionExpanded) return undefined;

    const description = selectedProduct?.description || '';
    const measureOverflow = () => {
      setDescriptionOverflow({
        description,
        hasOverflow: descriptionElement.scrollHeight > descriptionElement.clientHeight + 1
      });
    };
    const frameId = window.requestAnimationFrame(measureOverflow);
    const resizeObserver = new ResizeObserver(measureOverflow);
    resizeObserver.observe(descriptionElement);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [descriptionExpanded, selectedProduct?.description]);

  const productNgnPrice = (product) => product.isFree ? 0 : Number(product.price || 0) * (currencyRatesToNgn[product.currency || 'NGN'] || 1);
  const calculatorRate = currencyRatesToNgn[calculatorCurrency] || 1;
  const calculatorAmount = selectedProduct?.isFree ? 0 : selectedProduct ? productNgnPrice(selectedProduct) / calculatorRate : 0;
  const productRatingAverage = productReviews.length
    ? productReviews.reduce((total, review) => total + Number(review.rating || 0), 0) / productReviews.length
    : Number(selectedProduct?.rating || 0);
  const productRatingPercentage = Math.round((productRatingAverage / 5) * 100);
  const selectedProductAvailability = selectedProduct ? getProductAvailability(selectedProduct, availabilityNow) : null;
  const selectedProductOutOfStock = Boolean(selectedProduct && (selectedProduct.inStock === false || Number(selectedProduct.stockCount || 0) <= 0));

  const promotionalProducts = storeData.products.map(normalizeProduct);
  const findPromotionalProduct = (item) => {
    const productKey = promotionalProductKey(item?.url);
    if (!productKey) return null;
    return promotionalProducts.find((product) =>
      productSlug(product).toLowerCase() === productKey || String(product.id || '').trim().toLowerCase() === productKey
    ) || null;
  };
  const hasPromotionalStock = (item) => {
    const productKey = promotionalProductKey(item?.url);
    if (!productKey) return true;
    const product = findPromotionalProduct(item);
    return Boolean(product && product.inStock !== false && Number(product.stockCount) > 0 && resolveProductCover(product));
  };
  const regularPromotionalSource = promotionalAds.length ? promotionalAds : promotionalSlides;
  const availableRegularPromotions = regularPromotionalSource.filter(hasPromotionalStock);
  const fallbackPromotions = promotionalSlides.filter(hasPromotionalStock);
  const bookProduct = findPromotionalProduct(independenceBookPromotion);
  const bookHasStock = Boolean(bookProduct && bookProduct.inStock !== false && Number(bookProduct.stockCount) > 0);
  const bookProductKey = promotionalProductKey(independenceBookPromotion.url);
  const regularPromotionalItems = [
    ...(bookHasStock ? [independenceBookPromotion] : []),
    ...(availableRegularPromotions.length ? availableRegularPromotions : fallbackPromotions)
  ].filter((item) => item?.isBookReleaseAd || promotionalProductKey(item?.url) !== bookProductKey);
  const independencePromotionalItems = isIndependenceDay
    ? getIndependenceDaySlides(independenceAnniversary).map((slide) => ({
      eyebrow: `${slide.eyebrow} · NAIJA @${independenceAnniversary}`,
      title: slide.title,
      description: slide.tagline,
      action: 'Read the story',
      url: isIndependencePreview ? '/?independencePreview=1' : '/',
      image: slide.image,
      imagePosition: slide.imageFit === 'contain' ? 'center' : 'center 30%',
      isIndependenceDay: true
    }))
    : [];
  const activePromotionalItems = isIndependenceDay
    ? [...independencePromotionalItems, ...(bookHasStock ? [independenceBookPromotion] : [])]
    : regularPromotionalItems;
  const activePromotionalIndex = activePromotionalSlide % activePromotionalItems.length;
  const activePromotionalItem = activePromotionalItems[activePromotionalIndex];
  const promotionalSlideCount = activePromotionalItems.length;
  const activePromotionalProduct = findPromotionalProduct(activePromotionalItem);
  const activePromotionalCover = activePromotionalItem?.image || (activePromotionalProduct ? resolveProductCover(activePromotionalProduct) : '');

  useEffect(() => {
    let active = true;
    supabase.from('promotional_ads').select('id,eyebrow,headline,product_url,action_label,vendor_name,is_platform_ad').in('status', ['approved', 'published']).order('created_at', { ascending: false }).limit(12)
      .then(({ data }) => {
        if (active && Array.isArray(data) && data.length) {
          const loadedAds = data.map((ad) => ({ eyebrow: ad.vendor_name ? `Vendor: ${ad.vendor_name}` : (ad.eyebrow || 'PAZ Marketplace'), title: ad.headline, action: ad.action_label || 'View product', url: promotionalProductUrl(ad.product_url), isPlatformAd: Boolean(ad.is_platform_ad) }));
          const platformAds = loadedAds.filter((ad) => ad.isPlatformAd);
          const productAds = loadedAds.filter((ad) => !ad.isPlatformAd);
          const orderedAds = [];
          const cycleLength = Math.max(platformAds.length, productAds.length);
          for (let index = 0; index < cycleLength; index += 1) {
            if (platformAds[index]) orderedAds.push(platformAds[index]);
            if (productAds[index]) orderedAds.push(productAds[index]);
          }
          setPromotionalAds(orderedAds);
        }
      }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActivePromotionalSlide((current) => (current + 1) % promotionalSlideCount);
    }, 9000);
    return () => window.clearInterval(timer);
  }, [promotionalSlideCount]);

  useEffect(() => {
    if (!resolvedProductName || !storeData.products?.length) return;
    const requestedSlug = decodeURIComponent(resolvedProductName).trim().toLowerCase();
    const product = storeData.products.map(normalizeProduct).find((item) => productSlug(item).toLowerCase() === requestedSlug || String(item.id).trim().toLowerCase() === requestedSlug);
    if (product) {
      const frame = window.requestAnimationFrame(() => {
        setSelectedProduct(product);
        setDescriptionExpanded(false);
        setCalculatorCurrency(product.currency || 'NGN');
      });
      return () => window.cancelAnimationFrame(frame);
    }
  }, [resolvedProductName, storeData.products]);

  useEffect(() => {
    if (!selectedProduct?.id) return undefined;
    let active = true;
    setProductReviews([]);
    supabase.from('product_ratings').select('id,reviewer_name,reviewer_email,rating,comment,created_at').eq('product_id', String(selectedProduct.id)).order('created_at', { ascending: false }).limit(100)
      .then(({ data, error }) => {
        if (!active || error || !Array.isArray(data)) return;
        setProductReviews(data);
        if (data.length > 0) {
          const average = data.reduce((total, review) => total + Number(review.rating || 0), 0) / data.length;
          setSelectedProduct((current) => current?.id === selectedProduct.id ? { ...current, rating: average, reviews: data.length } : current);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [selectedProduct?.id]);

  useEffect(() => {
    const productIds = [...new Set((storeData.products || []).map((product) => String(product.id || '').trim()).filter(Boolean))];
    if (!productIds.length) return undefined;
    let active = true;

    const loadProductRatingSummaries = async () => {
      const ratingsByProduct = new Map();
      for (let productIndex = 0; productIndex < productIds.length; productIndex += 100) {
        const productIdBatch = productIds.slice(productIndex, productIndex + 100);
        let offset = 0;
        while (true) {
          const { data, error } = await supabase
            .from('product_ratings')
            .select('product_id,rating')
            .in('product_id', productIdBatch)
            .order('created_at', { ascending: true })
            .range(offset, offset + 999);
          if (error) {
            console.warn('Product rating summaries could not be loaded:', error.message);
            return;
          }
          for (const item of data || []) {
            const ratings = ratingsByProduct.get(String(item.product_id)) || [];
            ratings.push(Number(item.rating || 0));
            ratingsByProduct.set(String(item.product_id), ratings);
          }
          if (!data || data.length < 1000) break;
          offset += 1000;
        }
      }

      const summaries = {};
      for (const [productId, ratings] of ratingsByProduct) {
        summaries[productId] = {
          rating: ratings.reduce((total, rating) => total + rating, 0) / ratings.length,
          reviews: ratings.length
        };
      }
      if (active) setProductRatingSummaries(summaries);
    };

    void loadProductRatingSummaries();
    return () => { active = false; };
  }, [storeData.products]);

  useEffect(() => {
    if (!isProductPage || !selectedProduct?.id) {
      setProductMetrics(null);
      return undefined;
    }

    let active = true;
    setProductMetrics(null);
    fetch(`/api/product-metrics?productId=${encodeURIComponent(selectedProduct.id)}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Product metrics could not be loaded.');
        if (active) setProductMetrics(payload);
      })
      .catch((error) => {
        if (active) console.warn('Product metrics unavailable:', error.message);
      });

    return () => {
      active = false;
    };
  }, [isProductPage, selectedProduct?.id]);

  const submitProductRating = async (event) => {
    event.preventDefault();
    if (!selectedProduct?.id || !ratingForm.reviewerName.trim() || !ratingForm.rating) {
      setToast({ message: 'Choose a star rating and enter your name first.', type: 'error' });
      window.setTimeout(() => setToast(null), 3000);
      return;
    }
    setRatingSubmitting(true);
    const { data, error } = await supabase.from('product_ratings').insert({
      product_id: String(selectedProduct.id),
      reviewer_name: ratingForm.reviewerName.trim(),
      reviewer_email: ratingForm.reviewerEmail.trim() || null,
      rating: Number(ratingForm.rating),
      comment: ratingForm.comment.trim() || null,
    }).select('id,reviewer_name,reviewer_email,rating,comment,created_at').single();
    setRatingSubmitting(false);
    if (error) {
      setToast({ message: error.message || 'Your rating could not be saved.', type: 'error' });
      window.setTimeout(() => setToast(null), 3500);
      return;
    }
    const updatedReviews = [data, ...productReviews];
    const average = updatedReviews.reduce((total, review) => total + Number(review.rating || 0), 0) / updatedReviews.length;
    setProductReviews(updatedReviews);
    setSelectedProduct((current) => ({ ...current, rating: average, reviews: updatedReviews.length }));
    setStoreData((current) => ({
      ...current,
      products: current.products.map((product) => product.id === selectedProduct.id ? { ...product, rating: average, reviews: updatedReviews.length } : product),
    }));
    setRatingForm({ reviewerName: '', reviewerEmail: '', rating: 0, comment: '' });
    void notifyAdminActivity('Product rating', 'New product rating submitted', {
      product: selectedProduct.title,
      reviewer: data.reviewer_name,
      rating: data.rating,
      comment: data.comment || 'No comment'
    });
    setToast({ message: 'Thank you. Your product rating has been added.', type: 'success' });
    window.setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    let active = true;
    fetch('/api/currency-rates')
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (active && payload?.ratesToNgn) setCurrencyRatesToNgn((current) => ({ ...current, ...payload.ratesToNgn }));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!Array.isArray(storeProducts) || storeProducts.length === 0) return;
    setStoreData((current) => ({
      ...current,
      products: storeProducts.filter(isStorefrontProduct).map(normalizeProduct),
      bankAccount: storeBankAccount || current.bankAccount
    }));
    setCart((current) => current.filter((item) => storeProducts.some((product) => product.id === item.id)));
  }, [storeProducts, storeBankAccount]);

  useEffect(() => {
    let active = true;

    const loadLatestProducts = async () => {
      const publicProductsResponse = await fetch('/api/store-products-public');
      const publicProductsPayload = await publicProductsResponse.json().catch(() => ({}));
      if (publicProductsResponse.ok && Array.isArray(publicProductsPayload.data)) {
        const publicProducts = publicProductsPayload.data.map(normalizeProduct);
        if (!active) return;
        setStoreData((current) => ({ ...current, products: publicProducts }));
        setCart((current) => current.filter((item) => publicProducts.some((product) => product.id === item.id)));
        return;
      }

      const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !Array.isArray(data) || data.length === 0) {
        const publicProductsResponse = await fetch('/api/store-products-public');
        const publicProductsPayload = await publicProductsResponse.json().catch(() => ({}));
        if (!active || !publicProductsResponse.ok || !Array.isArray(publicProductsPayload.data)) return;
        const fallbackProducts = publicProductsPayload.data.map(normalizeProduct);
        setStoreData((current) => ({ ...current, products: fallbackProducts }));
        setCart((current) => current.filter((item) => fallbackProducts.some((product) => product.id === item.id)));
        return;
      }

      const latestProducts = data.filter(isStorefrontProduct).map(normalizeProduct);
      setStoreData((current) => ({ ...current, products: latestProducts }));
      setCart((current) => current.filter((item) => latestProducts.some((product) => product.id === item.id)));
    };

    loadLatestProducts();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (window.PaystackPop) {
      setPaystackReady(true);
      return undefined;
    }

    const existingScript = document.getElementById('paystack-inline-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => setPaystackReady(true), { once: true });
      return undefined;
    }

    const script = document.createElement('script');
    script.id = 'paystack-inline-js';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => setPaystackReady(true);
    document.body.appendChild(script);
    return () => script.onload = null;
  }, []);

  useEffect(() => {
    localStorage.setItem('paz_store_bank_account', JSON.stringify(storeData.bankAccount));
  }, [storeData]);

  useEffect(() => {
    const handleResize = () => {
      const small = window.innerWidth <= 900;
      const verySmall = window.innerWidth <= 380;
      setIsSmallScreen(small);
      setIsVerySmallScreen(verySmall);
      if (!small) {
        setCategoryDrawerOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!categoryDrawerOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setCategoryDrawerOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [categoryDrawerOpen]);

  useEffect(() => {
    if (!cart.length || submittedOrder) {
      setCartReminderVisible(false);
      return undefined;
    }

    let timeoutId;
    const resetReminder = () => {
      setCartReminderVisible(false);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setCartReminderVisible(true);
      }, 30000);
    };

    const eventNames = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    eventNames.forEach((eventName) => window.addEventListener(eventName, resetReminder));
    resetReminder();

    return () => {
      eventNames.forEach((eventName) => window.removeEventListener(eventName, resetReminder));
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [cart, submittedOrder]);

  const stopSuccessConfetti = () => {
    if (fireworksIntervalRef.current) {
      window.clearInterval(fireworksIntervalRef.current);
      fireworksIntervalRef.current = null;
    }

    if (fireworksControllerRef.current) {
      fireworksControllerRef.current.reset();
      fireworksControllerRef.current = null;
    }
  };

  useEffect(() => {
    if (cartOpen) return undefined;
    stopSuccessConfetti();
    return undefined;
  }, [cartOpen]);

  const triggerSuccessConfetti = () => {
    stopSuccessConfetti();

    if (!fireworksCanvasRef.current) return;
    fireworksControllerRef.current = confetti.create(fireworksCanvasRef.current, {
      resize: true,
      useWorker: true
    });

    const launchFireworks = fireworksControllerRef.current;
    const burst = (index = 0) => {
      let origin = {
        x: index % 3 === 1 ? 0.5 : index % 3 === 0 ? 0.18 : 0.82,
        y: 0.68
      };

      launchFireworks({
        particleCount: index % 3 === 1 ? 90 : 65,
        spread: 82,
        startVelocity: 48,
        origin,
        colors: ['#facc15', '#fb7185', '#34d399', '#60a5fa', '#f97316']
      });
    };

    let burstIndex = 0;
    const runBurst = () => {
      burst(burstIndex);
      burstIndex += 1;
    };

    runBurst();
    fireworksIntervalRef.current = window.setInterval(runBurst, 1400);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, priceRange, minRating, sortBy]);

  const categories = [...new Set([
    'All',
    'Groceries',
    'Gadgets',
    ...(storeData.products || []).map((product) => canonicalShopCategory(product.category))
  ])];
  const getProductRating = (product) => Number(productRatingSummaries[String(product.id)]?.rating ?? product.rating ?? 0);
  const getProductReviewCount = (product) => Number(productRatingSummaries[String(product.id)]?.reviews ?? product.reviews ?? 0);

  const filteredBySearch = (storeData.products || []).filter((product) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    const textToSearch = [
      product.title,
      product.description,
      product.category,
      product.id
    ].join(' ').toLowerCase();

    return textToSearch.includes(query);
  });

  const filteredByCategory = selectedCategory === 'All'
    ? filteredBySearch
    : filteredBySearch.filter((product) => canonicalShopCategory(product.category) === selectedCategory);

  const allVisibleProducts = filteredByCategory.filter((product) => {
    const inPriceRange = productNgnPrice(product) >= priceRange[0] && productNgnPrice(product) <= priceRange[1];
    const hasMinRating = getProductRating(product) >= minRating;
    return inPriceRange && hasMinRating;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return getProductRating(b) - getProductRating(a);
    if (sortBy === 'newest') return b.id.localeCompare(a.id);
    return 0;
  });

  const totalPages = Math.ceil(allVisibleProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const visibleProducts = allVisibleProducts.slice(startIndex, startIndex + productsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (product, event) => {
    event?.stopPropagation?.();
    const availability = getProductAvailability(product, Date.now());
    if (!availability.available) {
      if (availability.reason === 'not-released') {
        setReleaseNotificationProduct(product);
        setReleaseNotificationError('');
      } else {
        setToast({ message: availability.message, type: 'error' });
        setTimeout(() => setToast(null), 8000);
      }
      return;
    }
    if (product.inStock === false || Number(product.stockCount || 0) <= 0) {
      setToast({ message: `${product.title} is currently out of stock.`, type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const productCurrency = product.currency || 'NGN';
    const existingPaidCurrency = cart.find((item) => !item.isFree)?.currency;
    if (existingPaidCurrency && productCurrency !== existingPaidCurrency && !product.isFree) {
      setToast({ message: `Your cart uses ${existingPaidCurrency}. Complete that order before adding a ${productCurrency} product.`, type: 'error' });
      setTimeout(() => setToast(null), 3500);
      return;
    }

    if (submittedOrder || checkoutStage === 'success') {
      setCart([]);
      setSubmittedOrder(null);
      setCheckoutStage('details');
      setPaymentProof(null);
      setPaymentProofFile(null);
      setCheckoutForm({ name: '', email: '', countryCode: 'NG', phoneNumber: '', notes: '' });
    }

    void playCartFlightSound();

    const originalTarget = event?.currentTarget?.getBoundingClientRect?.();
    const cartTarget = cartButtonRef.current?.getBoundingClientRect?.();
    const startX = originalTarget ? originalTarget.left + originalTarget.width / 2 : window.innerWidth / 2;
    const startY = originalTarget ? originalTarget.top + originalTarget.height / 2 : window.innerHeight / 2;
    const endX = cartTarget ? cartTarget.left + cartTarget.width / 2 : window.innerWidth - 52;
    const endY = cartTarget ? cartTarget.top + cartTarget.height / 2 : window.innerHeight / 2;
    const flightId = `cart-flight-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const animationDuration = 2000;
    const cartUpdateTime = 2000;

    setCartFlights((current) => [
      ...current,
      {
        id: flightId,
        product,
        startX,
        startY,
        endX,
        endY,
        progress: 0,
        opacity: 1,
        scale: 1
      }
    ]);

    const startTime = performance.now();
    const animateFlight = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const curveLift = -170 * Math.sin(Math.PI * progress);
      const x = startX + (endX - startX) * eased;
      const y = startY + (endY - startY) * eased + curveLift;
      const scale = 1 - progress * 0.78;
      const opacity = progress >= 0.96 ? 0 : 1;

      setCartFlights((current) =>
        current.map((flight) =>
          flight.id === flightId
            ? { ...flight, progress, x, y, scale, opacity }
            : flight
        )
      );

      if (elapsed < animationDuration) {
        requestAnimationFrame(animateFlight);
        return;
      }

      setCartFlights((current) => current.filter((flight) => flight.id !== flightId));
    };

    requestAnimationFrame(animateFlight);

    const cartUpdateDelay = window.setTimeout(() => {
      setCartReminderVisible(false);
      setCart((current) => {
        const existing = current.find((item) => item.id === product.id);
        const newCart = existing
          ? current.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            )
          : [...current, { ...product, quantity: 1 }];

        setToast({
          message: `✓ ${product.title} added to cart!`,
          type: 'success'
        });
        setTimeout(() => setToast(null), 3000);

        return newCart;
      });
    }, cartUpdateTime);

    window.setTimeout(() => {
      window.clearTimeout(cartUpdateDelay);
    }, animationDuration + 50);
  };

  const checkoutProduct = (product) => {
    const availability = getProductAvailability(product, Date.now());
    if (!availability.available) {
      if (availability.reason === 'not-released') {
        setReleaseNotificationProduct(product);
        setReleaseNotificationError('');
      } else {
        setToast({ message: availability.message, type: 'error' });
        setTimeout(() => setToast(null), 8000);
      }
      return;
    }
    if (product.inStock === false || Number(product.stockCount || 0) <= 0) return;
    const existingPaidCurrency = cart.find((item) => !item.isFree)?.currency;
    if (existingPaidCurrency && !product.isFree && existingPaidCurrency !== (product.currency || 'NGN')) {
      setToast({ message: `Your cart uses ${existingPaidCurrency}. Complete that order before adding a ${product.currency || 'NGN'} product.`, type: 'error' });
      setTimeout(() => setToast(null), 3500);
      return;
    }
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing
        ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
    if (!isProductPage) {
      setSelectedProduct(null);
      navigate(shopUrl);
    }
  };

  const submitReleaseNotification = async (event) => {
    event.preventDefault();
    if (!releaseNotificationProduct || releaseNotificationSubmitting) return;
    setReleaseNotificationSubmitting(true);
    setReleaseNotificationError('');
    try {
      const country = phoneCountries.find((item) => item.code === checkoutForm.countryCode);
      const response = await fetch('/api/product-release-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: releaseNotificationProduct.id,
          name: checkoutForm.name,
          email: checkoutForm.email,
          phone: [country?.dialCode, checkoutForm.phoneNumber].filter(Boolean).join(' ')
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Your notification could not be activated. Please try again.');
      setReleaseNotificationProduct(null);
      setToast({ message: `We'll email you when ${releaseNotificationProduct.title} is available.`, type: 'success' });
      window.setTimeout(() => setToast(null), 4500);
    } catch (error) {
      setReleaseNotificationError(error.message || 'Your notification could not be activated. Please try again.');
    } finally {
      setReleaseNotificationSubmitting(false);
    }
  };

  const updateQty = (productId, delta) => {
    setCartReminderVisible(false);
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    setCartOpen(false);
    setCheckoutStage('details');
    setSubmittedOrder(null);
    setPaymentProof(null);
    setPaymentProofFile(null);
    setCartReminderVisible(false);
  };

  const toggleCartDrawer = () => {
    setCartReminderVisible(false);
    setCartOpen((current) => {
      if (current) {
        return false;
      }
      return true;
    });
  };

  const cartCurrency = cart.find((item) => !item.isFree)?.currency || 'NGN';
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + (item.isFree ? 0 : Number(item.price || 0)) * Number(item.quantity || 0), 0),
    [cart]
  );
  const cartIsFree = cart.length > 0 && cart.every((item) => item.isFree);
  const cartUnavailableItems = cart.filter((item) => !getProductAvailability(item, availabilityNow).available);

  useEffect(() => {
    if (!submittedOrder || !paymentProof || typeof onOrderSubmitted !== 'function') return undefined;

    const syncedOrder = {
      ...submittedOrder,
      paymentProofFile: paymentProofFile ? paymentProofFile.name : submittedOrder.paymentProofFile || null,
      paymentProofUploaded: !!paymentProofFile,
      paymentProofPreview: paymentProof,
      status: submittedOrder.status || 'pending'
    };

    setSubmittedOrder((currentOrder) => currentOrder ? { ...currentOrder, ...syncedOrder } : syncedOrder);

    onOrderSubmitted((current = []) => {
      const existingIndex = current.findIndex((order) => order.id === submittedOrder.id || order.orderNumber === submittedOrder.orderNumber);
      if (existingIndex >= 0) {
        const updated = [...current];
        updated[existingIndex] = syncedOrder;
        return updated;
      }
      return [syncedOrder, ...current];
    });

    return undefined;
  }, [paymentProof, paymentProofFile, submittedOrder, onOrderSubmitted]);

  const persistOrderToSupabase = async (order) => {
    try {
      const itemRows = (order.items || []).map((item) => ({
        product_id: item.id || item.product_id || item.productId || '',
        title: item.title || 'Product',
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1)
      }));

      let paymentProofPath = null;
      let paymentProofUrl = null;

      if (paymentProofFile) {
        const fileExtension = paymentProofFile.name.includes('.')
          ? paymentProofFile.name.slice(paymentProofFile.name.lastIndexOf('.') + 1)
          : 'jpg';
        const safeFileName = `orders/${order.orderNumber || `proof-${Date.now()}`}.${fileExtension}`;
        const uploadPayload = {
          upsert: true,
          contentType: paymentProofFile.type || 'application/octet-stream'
        };

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('prof-upload')
          .upload(safeFileName, paymentProofFile, uploadPayload);

        if (uploadError) {
          console.warn('Payment proof upload failed:', uploadError);
        } else {
          paymentProofPath = uploadData?.path || safeFileName;
          const { data: publicUrlData } = supabase.storage.from('prof-upload').getPublicUrl(paymentProofPath);
          paymentProofUrl = publicUrlData?.publicUrl || paymentProof || null;
        }
      }

      const { data: insertedOrder, error: orderError } = await supabase
        .from('shop_orders')
        .insert([
          {
            order_number: order.orderNumber,
            customer_name: order.name,
            email: order.email,
            phone: order.phone,
            subtotal: Number(order.total || 0),
            total: Number(order.total || 0),
            currency: order.currency || cartCurrency || null,
            notes: order.notes || '',
            status: order.status || 'pending',
            payment_reference: order.paymentReference || order.payment_reference || null,
            payment_mode: order.paymentMode || order.payment_mode || 'live',
            payment_proof_path: paymentProofPath,
            payment_proof_url: paymentProofUrl || paymentProof || null
          }
        ])
        .select();

      if (orderError) {
        throw orderError;
      }

      const savedOrder = Array.isArray(insertedOrder) ? insertedOrder[0] : insertedOrder;
      if (!savedOrder?.id) return;

      const itemsPayload = itemRows.map((item) => ({
        order_id: savedOrder.id,
        product_id: item.product_id,
        title: item.title,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1)
      }));

      if (itemsPayload.length > 0) {
        const { error: itemError } = await supabase.from('shop_order_items').insert(itemsPayload);
        if (itemError) {
          console.warn('Order item persistence to Supabase failed:', itemError);
        }
      }

      if (paymentProofUrl || paymentProof) {
        setSubmittedOrder((currentOrder) => ({
          ...(currentOrder || order),
          paymentProofFile: paymentProofFile ? paymentProofFile.name : currentOrder?.paymentProofFile || null,
          paymentProofUploaded: !!paymentProofFile,
          paymentProofPreview: paymentProofUrl || paymentProof || currentOrder?.paymentProofPreview || null,
          paymentProofUrl: paymentProofUrl || paymentProof || currentOrder?.paymentProofUrl || null,
          payment_proof_url: paymentProofUrl || paymentProof || currentOrder?.payment_proof_url || null,
          payment_proof_path: paymentProofPath || currentOrder?.payment_proof_path || null
        }));
      }
    } catch (error) {
      console.warn('Order persistence to Supabase failed:', error);
    }
  };

  const savePaymentProofToSupabase = async (order) => {
    if (!order || !paymentProofFile) {
      setToast({ message: 'Upload a payment proof image first.', type: 'error' });
      setTimeout(() => setToast(null), 2500);
      return;
    }

    try {
      setPaymentProofSaving(true);

      const fileExtension = paymentProofFile.name.includes('.')
        ? paymentProofFile.name.slice(paymentProofFile.name.lastIndexOf('.') + 1)
        : 'jpg';
      const safeFileName = `orders/${order.orderNumber || 'proof'}-proof-${Date.now()}.${fileExtension}`;

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('prof-upload')
        .upload(safeFileName, paymentProofFile, {
          upsert: false,
          contentType: paymentProofFile.type || 'application/octet-stream'
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage.from('prof-upload').getPublicUrl(uploadData?.path || safeFileName);
      const paymentProofUrl = publicUrlData?.publicUrl || paymentProof || null;

      const { error: updateError } = await supabase
        .from('shop_orders')
        .update({
          payment_proof_path: uploadData?.path || safeFileName,
          payment_proof_url: paymentProofUrl
        })
        .eq('order_number', order.orderNumber);

      if (updateError) {
        throw updateError;
      }

      setSubmittedOrder((currentOrder) => ({
        ...(currentOrder || order),
        paymentProofFile: paymentProofFile.name,
        paymentProofUploaded: true,
        paymentProofPreview: paymentProofUrl || paymentProof || currentOrder?.paymentProofPreview || null,
        paymentProofUrl: paymentProofUrl || paymentProof || currentOrder?.paymentProofUrl || null,
        payment_proof_url: paymentProofUrl || paymentProof || currentOrder?.payment_proof_url || null,
        payment_proof_path: uploadData?.path || safeFileName
      }));

      setToast({ message: 'Payment proof saved successfully.', type: 'success' });
      setTimeout(() => setToast(null), 2500);
    } catch (error) {
      console.warn('Payment proof save failed:', error);
      setToast({ message: error?.message || 'Unable to save proof image right now.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setPaymentProofSaving(false);
    }
  };

  const handleShopMoreAfterOrder = () => {
    setCartOpen(false);
    setCheckoutStage('details');
    setPaymentProof(null);
    setPaymentProofFile(null);
    setSubmittedOrder(null);
    setSelectedProduct(null);
    navigate(shopUrl);
  };

  const handleCheckout = async (event) => {
    event.preventDefault();
    const customerEmail = checkoutForm.email.trim().toLowerCase();
    const selectedCountry = phoneCountries.find((country) => country.code === checkoutForm.countryCode) || phoneCountries[0];
    const localDigits = checkoutForm.phoneNumber.replace(/\D/g, '');
    const parsedPhone = parsePhoneNumberFromString(localDigits, selectedCountry.code);
    const internationalPhone = parsedPhone?.number || '';
    if (!cart.length || paymentLoading) return;
    const blockedItem = cart.find((item) => {
      const currentProduct = storeData.products.find((product) => String(product.id) === String(item.id)) || item;
      return !getProductAvailability(currentProduct, Date.now()).available;
    });
    if (blockedItem) {
      const currentProduct = storeData.products.find((product) => String(product.id) === String(blockedItem.id)) || blockedItem;
      const availability = getProductAvailability(currentProduct, Date.now());
      if (availability.reason === 'not-released') {
        setReleaseNotificationProduct(currentProduct);
        setReleaseNotificationError('');
      } else {
        setToast({ message: `${currentProduct.title}: ${availability.message}`, type: 'error' });
        setTimeout(() => setToast(null), 8000);
      }
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      setToast({ message: 'Please enter a valid email address for payment and delivery.', type: 'error' });
      setTimeout(() => setToast(null), 3500);
      return;
    }
    if (!parsedPhone || !isValidPhoneNumber(localDigits, selectedCountry.code)) {
      setToast({ message: `Enter a valid ${selectedCountry.code} phone number for ${selectedCountry.dialCode}.`, type: 'error' });
      setTimeout(() => setToast(null), 3500);
      return;
    }
    if (!cartIsFree && (!paystackReady || !window.PaystackPop)) {
      setToast({ message: 'Payment checkout is still loading. Please try again shortly.', type: 'error' });
      setTimeout(() => setToast(null), 3500);
      return;
    }
    if (!cartIsFree && (!paystackPublicKey || paystackPublicKey.includes('demo_key_update_from_admin'))) {
      setToast({ message: 'Paystack is not configured yet. Please contact the site administrator.', type: 'error' });
      setTimeout(() => setToast(null), 3500);
      return;
    }

    const orderNumber = `PAZ-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: `shop-${Date.now()}`,
      orderNumber,
      name: checkoutForm.name || 'Customer',
      email: customerEmail,
      phone: internationalPhone,
      total: subtotal,
      currency: cartCurrency,
      items: cart,
      notes: checkoutForm.notes || '',
      bankAccount: storeData.bankAccount,
      paymentProofFile: paymentProofFile ? paymentProofFile.name : null,
      paymentProofUploaded: !!paymentProofFile,
      paymentProofPreview: paymentProof || null,
      status: 'paid',
      paymentMode: String(paystackPublicKey).startsWith('pk_test_') ? 'test' : 'live',
      createdAt: new Date().toISOString()
    };

    setPaymentLoading(true);
    try {
      if (cartIsFree) {
        const freeResponse = await fetch('/api/complete-shop-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            free: true,
            orderNumber,
            email: customerEmail,
            customerName: newOrder.name,
            items: cart.map((item) => ({ id: item.id, quantity: item.quantity }))
          })
        });
        const freeData = await freeResponse.json().catch(() => ({}));
        if (!freeResponse.ok) throw new Error(freeData?.error || 'Free product delivery could not be completed.');
        const freeOrder = { ...newOrder, status: 'free', deliverySent: true };
        setSubmittedOrder(freeOrder);
        await persistOrderToSupabase(freeOrder);
        if (typeof onOrderSubmitted === 'function') onOrderSubmitted((current = []) => [freeOrder, ...current]);
        setCheckoutStage('success');
        window.requestAnimationFrame(() => window.setTimeout(triggerSuccessConfetti, 120));
        setToast({ message: `Your free product has been sent to ${customerEmail}.`, type: 'success' });
        setCheckoutForm({ name: '', email: '', countryCode: 'NG', phoneNumber: '', notes: '' });
        setCart([]);
        setCartOpen(true);
        return;
      }

      const paymentHandler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email: customerEmail,
        amount: Math.round(subtotal * 100),
        currency: cartCurrency,
        ref: orderNumber,
        metadata: {
          order_number: orderNumber,
          custom_fields: [
            { display_name: 'Customer name', variable_name: 'customer_name', value: newOrder.name },
            { display_name: 'Order number', variable_name: 'order_number', value: orderNumber }
          ]
        },
        callback: (response) => {
          void (async () => {
          try {
            const completionResponse = await fetch('/api/complete-shop-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reference: response.reference,
                orderNumber,
                email: customerEmail,
                currency: cartCurrency,
                customerName: newOrder.name,
                items: cart.map((item) => ({ id: item.id, quantity: item.quantity }))
              })
            });
            const completionData = await completionResponse.json().catch(() => ({}));
            if (!completionResponse.ok) throw new Error(completionData?.error || 'Payment completed, but delivery could not be confirmed.');

            const paidOrder = { ...newOrder, paymentReference: response.reference, deliverySent: true };
            setSubmittedOrder(paidOrder);
            await persistOrderToSupabase(paidOrder);
            if (typeof onOrderSubmitted === 'function') onOrderSubmitted((current = []) => [paidOrder, ...current]);
            setCheckoutStage('success');
            window.requestAnimationFrame(() => window.setTimeout(triggerSuccessConfetti, 120));
            setToast({ message: `Payment successful. Your file has been sent to ${customerEmail}.`, type: 'success' });
            setTimeout(() => setToast(null), 5000);
            setCheckoutForm({ name: '', email: '', countryCode: 'NG', phoneNumber: '', notes: '' });
            setCart([]);
            setCartOpen(true);
          } catch (error) {
            setToast({ message: error.message || 'Payment succeeded but delivery could not be completed.', type: 'error' });
            setTimeout(() => setToast(null), 5000);
          } finally {
            setPaymentLoading(false);
          }
          })();
        },
        onClose: () => setPaymentLoading(false)
      });
      paymentHandler.openIframe();
    } catch (error) {
      setPaymentLoading(false);
      setToast({ message: error.message || 'Unable to open Paystack checkout. Please try again.', type: 'error' });
      setTimeout(() => setToast(null), 5000);
    }
  };

  const StarRating = ({ rating }) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ display: 'flex', color: '#FDB913' }}>
          {[...Array(5)].map((_, i) => (
            <span key={i} style={{ fontSize: '0.85rem' }}>
              {i < Math.floor(rating) ? '★' : i < rating ? '★' : '☆'}
            </span>
          ))}
        </div>
        <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '4px' }}>({visibleProducts.find(p => p.rating === rating)?.reviews || 0})</span>
      </div>
    );
  };
  const openShopAccount = () => {
    setShopAuthError('');
    setShopAuthNotice('');
    setShopAccountOpen(true);
  };
  const closeShopAccount = () => {
    if (shopAuthBusy) return;
    setShopAccountOpen(false);
    setShopAuthPassword('');
    setShopAuthConfirmPassword('');
    setShopAuthPasswordVisible(false);
    setShopAuthConfirmPasswordVisible(false);
    setShopAuthConsent(false);
  };
  const submitShopAuth = async (event) => {
    event.preventDefault();
    setShopAuthBusy(true);
    setShopAuthError('');
    setShopAuthNotice('');
    try {
      if (isSupabaseStub) throw new Error('Customer accounts are unavailable because Supabase is not configured.');
      if (shopAuthMode === 'signUp' && shopAuthPassword !== shopAuthConfirmPassword) {
        throw new Error('Your passwords do not match.');
      }
      if (shopAuthMode === 'signUp' && !shopAuthConsent) {
        throw new Error('Please agree to the System Terms and acknowledge the Privacy Policy before creating an account.');
      }
      setWebAuthRememberMe(shopAuthRemember);
      const identifier = shopAuthEmail.trim();
      const isPhone = !identifier.includes('@');
      if (shopAuthMode === 'signUp') {
        const { data, error } = await supabase.auth.signUp({
          ...(isPhone ? { phone: identifier.replace(/[\s()-]/g, '') } : { email: identifier.toLowerCase() }),
          password: shopAuthPassword,
          options: {
            ...(isPhone ? {} : { emailRedirectTo: `${window.location.origin}/shop?account=customer-confirmed` }),
            data: {
              full_name: shopAuthName.trim(),
              first_name: shopAuthName.trim().split(/\s+/)[0] || '',
              account_type: 'customer',
              account_role: 'customer',
              app_source: 'paz-shop',
              legal_terms_accepted_at: new Date().toISOString(),
              privacy_policy_acknowledged_at: new Date().toISOString()
            }
          }
        });
        if (error) throw error;
        if (data.session) {
          setShopAccountOpen(false);
          setShopAuthPassword('');
          setShopAuthConfirmPassword('');
        } else {
          setShopAuthNotice(isPhone ? 'Account created. Check your phone for a verification code, then sign in.' : 'Account created. Check your email to confirm your account, then sign in.');
          setShopAuthMode('signIn');
          setShopAuthPassword('');
          setShopAuthConfirmPassword('');
        }
      } else {
        const credentials = isPhone
          ? { phone: identifier.replace(/[\s()-]/g, ''), password: shopAuthPassword }
          : { email: identifier.toLowerCase(), password: shopAuthPassword };
        const { data, error } = await supabase.auth.signInWithPassword(credentials);
        if (error) throw error;
        if (!data.session) throw new Error('Sign-in did not return an active session. Please try again.');
        setShopAccountOpen(false);
        setShopAuthPassword('');
        setShopAuthConfirmPassword('');
        setShopAuthPasswordVisible(false);
        setShopAuthConfirmPasswordVisible(false);
        setShopAccountPage(null);
        navigate('/shop', { replace: true });
      }
    } catch (error) {
      setShopAuthError(error?.message || 'Unable to complete account sign-in. Please try again.');
    } finally {
      setShopAuthBusy(false);
    }
  };
  const resetShopPassword = async () => {
    setShopAuthError('');
    setShopAuthNotice('');
    if (isSupabaseStub) {
      setShopAuthError('Customer accounts are unavailable because Supabase is not configured.');
      return;
    }
    if (!shopAuthEmail.includes('@')) {
      setShopAuthError('Enter your email address first so we can send a reset link.');
      return;
    }
    setShopAuthBusy(true);
    try {
      const redirectTo = new URL('/shop', window.location.origin).toString();
      const { error } = await supabase.auth.resetPasswordForEmail(shopAuthEmail.trim().toLowerCase(), { redirectTo });
      if (error) throw error;
      setShopAuthNotice('If an account exists for that email, a password reset link is on its way.');
    } catch (error) {
      setShopAuthError(error?.message || 'Unable to send a password reset link. Please try again.');
    } finally {
      setShopAuthBusy(false);
    }
  };
  const signOutShopAccount = async () => {
    setShopAuthBusy(true);
    setShopAuthError('');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setShopAccountOpen(false);
      setShopAccountPage(null);
      setShopAccountMenuOpen(false);
      setShopNotificationsOpen(false);
    } catch (error) {
      setShopAuthError(error?.message || 'Unable to sign out. Please try again.');
    } finally {
      setShopAuthBusy(false);
    }
  };
  const signInWithShopProvider = async (provider) => {
    if (isSupabaseStub) {
      setShopAuthError('Customer accounts are unavailable because Supabase is not configured.');
      return;
    }
    setShopAuthBusy(true);
    setShopAuthError('');
    setShopAuthNotice('');
    try {
      if (shopAuthMode === 'signUp' && !shopAuthConsent) {
        throw new Error('Please agree to the System Terms and acknowledge the Privacy Policy before creating an account.');
      }
      setWebAuthRememberMe(shopAuthRemember);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/shop?account=customer-confirmed`,
          skipBrowserRedirect: true
        }
      });
      if (error) throw error;
      if (!data.url) throw new Error(`${provider} sign-in could not be started.`);
      window.location.assign(data.url);
    } catch (error) {
      setShopAuthError(error?.message || `${provider} sign-in could not be completed.`);
      setShopAuthBusy(false);
    }
  };
  const openShopAccountPage = (page) => {
    setShopAccountPage(page);
    setShopAccountMenuOpen(false);
    window.clearTimeout(shopAccountMenuCloseTimer.current);
    setShopNotificationsOpen(false);
    setShopAddressNotice('');
  };
  const openShopAccountMenu = () => {
    window.clearTimeout(shopAccountMenuCloseTimer.current);
    setShopAccountMenuOpen(true);
  };
  const scheduleShopAccountMenuClose = () => {
    window.clearTimeout(shopAccountMenuCloseTimer.current);
    shopAccountMenuCloseTimer.current = window.setTimeout(() => setShopAccountMenuOpen(false), 300);
  };
  const loadShopNotificationPreview = async () => {
    if (!shopAuthSession?.user) return;
    setShopAccountDataError('');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session?.access_token) throw new Error('Sign in again to view your notifications.');
      const response = await fetch('/api/customer-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ action: 'list' })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Notifications could not be loaded.');
      setShopNotifications(Array.isArray(payload.notifications) ? payload.notifications : []);
    } catch (error) {
      setShopAccountDataError(error?.message || 'Notifications could not be loaded.');
    }
  };
  const markShopNotificationRead = async (notification) => {
    if (!shopAuthSession?.user || notification.read_at) return;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session?.access_token) throw new Error('Sign in again to update your notifications.');
      const response = await fetch('/api/customer-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ action: 'mark_read', id: notification.id })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Notification could not be marked as read.');
      setShopNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item));
    } catch (error) {
      setShopAccountDataError(error?.message || 'Notification could not be marked as read.');
    }
  };
  const saveShopAddress = async (event) => {
    event.preventDefault();
    if (!shopUser) {
      setShopAddressNotice('Sign in to save your delivery address.');
      return;
    }
    if (!shopAddress.fullName.trim() || !shopAddress.phone.trim() || !shopAddress.addressLine1.trim() || !shopAddress.city.trim() || !shopAddress.state.trim() || !shopAddress.country.trim()) {
      setShopAddressNotice('Fill in your name, phone, street, city, state, and country.');
      return;
    }
    setShopAccountDataBusy(true);
    setShopAddressNotice('');
    try {
      const { error } = await supabase.from('customer_profiles').upsert({
        id: shopUser.id,
        email: shopUser.email || null,
        full_name: shopAddress.fullName.trim(),
        phone: shopAddress.phone.trim(),
        delivery_address: shopAddress,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      if (error) throw error;
      setShopAuthProfile((current) => ({ ...current, full_name: shopAddress.fullName.trim(), phone: shopAddress.phone.trim(), delivery_address: shopAddress }));
      setShopAddressNotice('Your delivery address has been saved.');
    } catch (error) {
      setShopAddressNotice(error?.message || 'Your delivery address could not be saved.');
    } finally {
      setShopAccountDataBusy(false);
    }
  };
  const shopUser = shopAuthSession?.user || null;
  const shopUserName = shopAuthProfile?.full_name
    || [shopAuthProfile?.first_name, shopAuthProfile?.last_name].filter(Boolean).join(' ')
    || shopUser?.user_metadata?.full_name
    || shopUser?.user_metadata?.name
    || shopUser?.email
    || 'PAZ customer';
  const shopAvatarUrl = shopAuthProfile?.avatar_url || shopUser?.user_metadata?.avatar_url || shopUser?.user_metadata?.picture || '';
  const shopProfileMenu = [
    ['account', 'My profile', 'user'],
    ['orders', 'My orders', 'receipt'],
    ['wishlist', 'My wishlist', 'heart'],
    ['messages', 'Messages', 'comments'],
    ['notifications', 'Notifications', 'bell'],
    ['address', 'Address book', 'map-marker-alt'],
    ['payments', 'Payment methods', 'credit-card'],
    ['preferences', 'Preferences', 'sliders-h'],
    ['support', 'Help & support', 'question-circle'],
    ['about', 'About PAZ', 'info-circle']
  ];
  const wishlistIds = (() => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem('paz-shop-favorite-books-v1') || '[]');
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  })();
  const wishlistProducts = storeData.products.filter((product) => wishlistIds.includes(String(product.id)));
  const accountThemeColors = shopAccountTheme === 'dark'
    ? { surface: '#17231d', card: '#22332a', text: '#f3f7f4', muted: '#c0cec4', border: '#3c5144', accent: '#a5e2ba', softAccent: '#294936' }
    : { surface: '#f5f8f5', card: '#ffffff', text: '#25352b', muted: '#5d6e63', border: '#dce7dd', accent: '#176b3a', softAccent: '#e7f2e9' };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#1b1b1b', fontFamily: "'Amazon Ember', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div className="shop-promotional-board" style={{ minHeight: isSmallScreen ? '220px' : '190px', backgroundColor: '#145c3a', backgroundImage: activePromotionalCover ? `linear-gradient(90deg, rgba(0, 35, 21, 0.88), rgba(0, 70, 38, 0.68) 58%, rgba(0, 40, 25, 0.45)), url("${activePromotionalCover}")` : 'linear-gradient(90deg, #0f766e, #166534 52%, #0f172a)', backgroundSize: 'cover', backgroundPosition: `center, ${activePromotionalItem.imagePosition || 'center'}`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px', boxSizing: 'border-box' }}>
        <div key={activePromotionalIndex} style={{ width: 'min(1400px, 100%)', animation: 'fadeIn 0.35s ease-out' }}>
          <span style={{ display: 'block', fontSize: '10px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#d8f3e2' }}>{activePromotionalItem.eyebrow}</span>
          <strong style={{ display: 'block', maxWidth: '900px', marginTop: '5px', fontSize: isSmallScreen ? '21px' : '30px', lineHeight: 1.2, overflowWrap: 'anywhere', color: '#ffffff' }}>{activePromotionalItem.title}</strong>
          {activePromotionalItem.description && <span style={{ display: 'block', marginTop: '8px', maxWidth: '820px', fontSize: isSmallScreen ? '13px' : '16px', lineHeight: 1.45, color: '#f1faf5' }}>{activePromotionalItem.description}</span>}
          <button type="button" onClick={() => navigate(activePromotionalItem.url)} style={{ marginTop: '16px', border: '1px solid #bbf7d0', borderRadius: '7px', padding: '9px 13px', background: '#f0fdf4', color: '#166534', fontSize: '12px', fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {activePromotionalItem.action}
          </button>
        </div>
      </div>
      {/* Amazon-style Header */}
      <header style={{
        background: 'linear-gradient(to bottom, #131921, #1f2937)',
        color: '#fff',
        padding: '12px 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isVerySmallScreen ? '0 6px' : '0 14px' }}>
          <div style={{ display: isSmallScreen ? 'flex' : 'grid', gridTemplateColumns: isSmallScreen ? undefined : `120px minmax(280px, 1fr) ${shopUser ? '42px 42px 42px' : '148px'}`, gap: isSmallScreen ? isVerySmallScreen ? '3px' : '6px' : '10px', alignItems: 'center' }}>
            <button type="button" aria-label={`Open cart, ${cart.reduce((count, item) => count + item.quantity, 0)} items`} style={{ position: 'relative', order: 0, gridColumn: isSmallScreen ? undefined : '1', flex: isVerySmallScreen ? '0 0 32px' : undefined, width: isSmallScreen ? isVerySmallScreen ? '32px' : '38px' : '120px', border: 0, background: 'transparent', color: '#fff', cursor: 'pointer', textAlign: isSmallScreen ? 'center' : 'left', minHeight: isVerySmallScreen ? '34px' : '40px', padding: 0 }} onClick={() => setCartOpen(!cartOpen)}>
              <i className="fa-solid fa-cart-shopping" style={{ fontSize: isVerySmallScreen ? '19px' : '24px', marginRight: isSmallScreen ? 0 : '8px' }}></i>
              <span style={{ position: 'absolute', top: isVerySmallScreen ? '0' : '-2px', left: isSmallScreen ? isVerySmallScreen ? '19px' : '23px' : '24px', background: '#ff9900', color: '#111', borderRadius: '50%', width: isVerySmallScreen ? '16px' : '19px', height: isVerySmallScreen ? '16px' : '19px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isVerySmallScreen ? '9px' : '11px', fontWeight: 'bold' }}>
                {cart.reduce((count, item) => count + item.quantity, 0)}
              </span>
            </button>

            <div style={{ display: 'flex', flex: isSmallScreen ? '1 1 auto' : undefined, order: 1, gridColumn: isSmallScreen ? undefined : '2', minWidth: 0, alignItems: 'center', background: '#fff', borderRadius: '6px', overflow: 'hidden' }}>
              <input
                className="shop-product-search-input"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search products..."
                aria-label="Search PAZ products"
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: isVerySmallScreen ? '34px' : isSmallScreen ? '38px' : '42px',
                  boxSizing: 'border-box',
                  border: '2px solid #008751',
                  borderRadius: '6px 0 0 6px',
                  outline: 'none',
                  padding: isVerySmallScreen ? '0 5px' : isSmallScreen ? '0 8px' : '0 14px',
                  fontSize: isVerySmallScreen ? '10px' : isSmallScreen ? '12px' : '14px',
                  color: '#111'
                }}
              />
              <button type="button" aria-label="Search" style={{
                height: isVerySmallScreen ? '34px' : isSmallScreen ? '38px' : '42px',
                background: '#FF9900',
                border: 'none',
                padding: isVerySmallScreen ? '0 7px' : isSmallScreen ? '0 10px' : '0 14px',
                cursor: 'pointer',
                color: '#111',
                fontWeight: 'bold'
              }} onClick={() => document.querySelector('.shop-product-search-input')?.focus()}>
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              aria-label={shopUser ? `Open account for ${shopUserName}` : 'Sign in to PAZ Shop'}
              onClick={() => shopUser ? openShopAccountPage('account') : openShopAccount()}
              style={{ width: shopUser ? isVerySmallScreen ? '34px' : '42px' : isSmallScreen ? '36px' : '148px', height: shopUser ? isVerySmallScreen ? '34px' : '42px' : isVerySmallScreen ? '34px' : '40px', flex: isSmallScreen ? `0 0 ${shopUser ? isVerySmallScreen ? '34px' : '42px' : '36px'}` : undefined, marginLeft: isSmallScreen && !shopUser ? 'auto' : undefined, order: 4, gridColumn: isSmallScreen ? undefined : shopUser ? '5' : '3', justifySelf: 'center', padding: shopUser ? 0 : isSmallScreen ? 0 : '0 12px', border: shopUser ? '2px solid #b7e3c8' : '1px solid rgba(255,255,255,.42)', borderRadius: shopUser ? '50%' : '8px', background: shopUser && shopAvatarUrl ? '#243449' : shopUser ? '#176b3a' : '#243449', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontSize: '13px', fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', boxShadow: shopUser ? '0 0 0 2px rgba(255,255,255,.12)' : undefined }}
            >
              {shopUser
                ? shopAvatarUrl
                  ? <img src={shopAvatarUrl} alt={`${shopUserName}'s profile`} style={{ display: 'block', width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center' }} />
                  : <span aria-hidden="true">{shopUserName.slice(0, 1).toUpperCase()}</span>
                : <><i className="fa-solid fa-user" aria-hidden="true" />{!isSmallScreen ? <span>Sign in / Sign up</span> : null}</>}
            </button>

            {shopUser ? (
              <div
                style={{ position: 'relative', order: 2, gridColumn: isSmallScreen ? undefined : '3', justifySelf: 'center' }}
                onMouseEnter={() => { if (!isSmallScreen) openShopAccountMenu(); }}
                onMouseLeave={() => { if (!isSmallScreen) scheduleShopAccountMenuClose(); }}
              >
                <button type="button" aria-label="Profile settings" aria-expanded={shopAccountMenuOpen} onClick={() => { if (isSmallScreen) setShopAccountMenuOpen((open) => !open); else openShopAccountMenu(); }} style={{ width: isVerySmallScreen ? '32px' : '38px', height: isVerySmallScreen ? '32px' : '38px', padding: 0, border: '1px solid rgba(255,255,255,.35)', borderRadius: '10px', background: shopAccountMenuOpen ? '#008751' : 'transparent', color: '#fff', fontSize: isVerySmallScreen ? '13px' : '16px', cursor: 'pointer' }}>
                  <i className="fa-solid fa-gear" aria-hidden="true" />
                </button>
                {isSmallScreen && shopAccountMenuOpen ? (
                  <button type="button" aria-label="Close account settings" onClick={() => setShopAccountMenuOpen(false)} style={{ position: 'fixed', top: '64px', right: 0, bottom: 0, left: 0, zIndex: 1000, border: 0, background: 'rgba(15, 23, 42, .48)', cursor: 'pointer' }} />
                ) : null}
                {shopUser && shopAccountMenuOpen ? (
                  <>
                  {isSmallScreen ? <style>{'@keyframes pazShopAccountDrawerIn { from { transform: translateX(100%); } to { transform: translateX(0); } }'}</style> : null}
                  <div
                    ref={isSmallScreen ? shopAccountDrawerRef : undefined}
                    role={isSmallScreen ? 'dialog' : 'menu'}
                    aria-label="Profile and account settings"
                    aria-modal={isSmallScreen ? 'true' : undefined}
                    onMouseEnter={() => { if (!isSmallScreen) openShopAccountMenu(); }}
                    onMouseLeave={() => { if (!isSmallScreen) scheduleShopAccountMenuClose(); }}
                    style={isSmallScreen
                      ? { position: 'fixed', top: '64px', right: 0, bottom: 0, width: 'min(340px, 88vw)', maxHeight: 'calc(100dvh - 64px)', overflowY: 'auto', padding: '8px 9px', borderLeft: '1px solid #e2e8f0', borderRadius: '14px 0 0 14px', background: '#fff', color: '#1b1b1b', boxShadow: '-16px 0 42px rgba(15,23,42,.24)', zIndex: 1001, animation: 'pazShopAccountDrawerIn 220ms ease-out' }
                      : { position: 'absolute', top: 'calc(100% - 1px)', right: 0, width: 'min(290px, calc(100vw - 20px))', maxHeight: 'min(70vh, 520px)', overflowY: 'auto', padding: '9px', border: '1px solid #e2e8f0', borderRadius: '13px', background: '#fff', color: '#1b1b1b', boxShadow: '0 16px 42px rgba(15,23,42,.22)', zIndex: 300 }
                    }
                  >
                    {isSmallScreen ? <button type="button" aria-label="Close account settings" onClick={() => setShopAccountMenuOpen(false)} style={{ display: 'grid', placeItems: 'center', marginLeft: 'auto', width: '34px', height: '34px', border: '1px solid #e2e8f0', borderRadius: '50%', background: '#f8fafc', color: '#334155', fontSize: '22px', cursor: 'pointer' }}>×</button> : null}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderBottom: '1px solid #e2e8f0', marginBottom: '5px' }}>
                      {shopAvatarUrl ? <img src={shopAvatarUrl} alt={`${shopUserName}'s profile`} style={{ display: 'block', width: '44px', height: '44px', flex: '0 0 44px', border: '2px solid #d1ead8', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center' }} /> : <span style={{ display: 'grid', placeItems: 'center', width: '44px', height: '44px', flex: '0 0 44px', border: '2px solid #d1ead8', borderRadius: '50%', background: '#e7f2ee', color: '#356656', fontWeight: 900 }}>{shopUserName.slice(0, 1).toUpperCase()}</span>}
                      <span style={{ minWidth: 0 }}><strong style={{ display: 'block', fontSize: '13px', color: '#2e2a26' }}>{shopUserName}</strong><small style={{ display: 'block', marginTop: '3px', color: '#665f5a', overflowWrap: 'anywhere' }}>{shopUser.email}</small></span>
                    </div>
                    {shopProfileMenu.map(([page, label, icon]) => (
                      <button key={page} type="button" role="menuitem" onClick={() => openShopAccountPage(page)} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '11px', minHeight: '40px', padding: '0 10px', border: 0, borderRadius: '8px', background: 'transparent', color: '#334155', textAlign: 'left', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }} onMouseEnter={(event) => { event.currentTarget.style.background = '#f0fdf4'; }} onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent'; }}>
                        <i className={`fa-solid fa-${icon}`} aria-hidden="true" style={{ width: '17px', color: '#356656', textAlign: 'center' }} />{label}
                      </button>
                    ))}
                    <button type="button" onClick={() => void signOutShopAccount()} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '11px', minHeight: '40px', marginTop: '5px', padding: '0 10px', border: 0, borderTop: '1px solid #e2e8f0', borderRadius: '8px', background: 'transparent', color: '#b42318', textAlign: 'left', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}><i className="fa-solid fa-right-from-bracket" aria-hidden="true" />Sign out</button>
                  </div>
                  </>
                ) : null}
              </div>
            ) : null}

            {shopUser ? (
              <div style={{ position: 'relative', order: 3, gridColumn: isSmallScreen ? undefined : '4', justifySelf: 'center' }}>
                <button type="button" aria-label="Notifications" aria-expanded={shopNotificationsOpen} onClick={() => { const open = !shopNotificationsOpen; setShopNotificationsOpen(open); if (open) void loadShopNotificationPreview(); }} style={{ position: 'relative', width: isVerySmallScreen ? '32px' : '38px', height: isVerySmallScreen ? '32px' : '38px', padding: 0, border: '1px solid rgba(255,255,255,.35)', borderRadius: '10px', background: shopNotificationsOpen ? '#008751' : 'transparent', color: '#fff', fontSize: isVerySmallScreen ? '13px' : '15px', cursor: 'pointer' }}>
                  <i className="fa-solid fa-bell" aria-hidden="true" />
                  {shopNotifications.some((notification) => !notification.read_at) ? <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '9px', height: '9px', border: '2px solid #182333', borderRadius: '50%', background: '#ff9900' }} /> : null}
                </button>
                {shopNotificationsOpen ? (
                  <div role="region" aria-label="Recent notifications" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 'min(330px, calc(100vw - 20px))', maxHeight: 'min(65vh, 440px)', overflowY: 'auto', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '13px', background: '#fff', color: '#1b1b1b', boxShadow: '0 16px 42px rgba(15,23,42,.22)', zIndex: 300 }}>
                    <strong style={{ display: 'block', padding: '2px 4px 10px', color: '#2e2a26' }}>Notifications</strong>
                    {shopAccountDataError ? <p role="alert" style={{ margin: 0, padding: '9px', borderRadius: '8px', background: '#fff1f2', color: '#9f1239', fontSize: '12px' }}>{shopAccountDataError}</p> : null}
                    {shopNotifications.length ? shopNotifications.slice(0, 5).map((notification) => (
                      <button key={notification.id} type="button" onClick={() => { void markShopNotificationRead(notification); openShopAccountPage('notifications'); }} style={{ display: 'block', width: '100%', padding: '10px', border: 0, borderRadius: '8px', background: notification.read_at ? '#fff' : '#f0fdf4', color: '#334155', textAlign: 'left', cursor: 'pointer' }}>
                        <strong style={{ display: 'block', fontSize: '12px' }}>{notification.title || 'PAZ update'}</strong>
                        <span style={{ display: 'block', marginTop: '4px', fontSize: '11px', lineHeight: 1.4 }}>{notification.message || notification.body || 'You have a new update.'}</span>
                      </button>
                    )) : <p style={{ margin: 0, padding: '8px 4px', color: '#665f5a', fontSize: '12px' }}>No notifications yet.</p>}
                    <button type="button" onClick={() => openShopAccountPage('notifications')} style={{ width: '100%', minHeight: '36px', marginTop: '7px', border: 0, borderRadius: '8px', background: '#e7f2ee', color: '#356656', fontWeight: 800, cursor: 'pointer' }}>View all notifications</button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {shopAccountOpen ? (
        <div
          onClick={closeShopAccount}
          style={{ position: 'fixed', top: 'var(--app-visual-viewport-offset-top, 0px)', left: 0, right: 0, height: 'var(--app-visual-viewport-height, 100dvh)', zIndex: 1200, display: isSmallScreen ? 'block' : 'grid', placeItems: 'center', overflowY: isSmallScreen ? 'auto' : 'hidden', boxSizing: 'border-box', padding: isSmallScreen ? 'max(10px, env(safe-area-inset-top)) 12px max(10px, env(safe-area-inset-bottom))' : '18px', background: 'rgba(15, 23, 42, .66)' }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="shop-account-title"
            onClick={(event) => event.stopPropagation()}
            style={{ width: 'min(430px, 100%)', maxHeight: isSmallScreen ? 'calc(var(--app-visual-viewport-height, 100dvh) - 20px)' : '90dvh', margin: isSmallScreen ? '0 auto' : undefined, overflowY: 'auto', overscrollBehavior: 'contain', padding: isSmallScreen ? '18px' : '24px', boxSizing: 'border-box', borderRadius: '16px', background: '#fff', color: '#1b1b1b', boxShadow: '0 24px 70px rgba(0,0,0,.35)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' }}>
              <div>
                <span style={{ display: 'inline-flex', width: '38px', height: '38px', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', background: '#e7f2ee', color: '#356656' }}>
                  <i className={`fa-solid ${shopUser ? 'fa-user-check' : 'fa-user'}`} aria-hidden="true" />
                </span>
                <h2 id="shop-account-title" style={{ margin: '14px 0 4px', fontSize: '22px', lineHeight: 1.2, color: '#2e2a26' }}>
                  {shopUser ? 'Your PAZ account' : shopAuthMode === 'signIn' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p style={{ margin: 0, color: '#665f5a', fontSize: '13px', lineHeight: 1.5 }}>
                  {shopUser ? 'Manage your shop sign-in.' : 'Sign in or create an account to shop with PAZ.'}
                </p>
              </div>
              <button type="button" aria-label="Close account dialog" onClick={closeShopAccount} disabled={shopAuthBusy} style={{ width: '34px', height: '34px', border: 0, borderRadius: '50%', background: '#f3f4f6', color: '#334155', fontSize: '21px', lineHeight: 1, cursor: shopAuthBusy ? 'wait' : 'pointer' }}>×</button>
            </div>

            {isSupabaseStub ? <p role="alert" style={{ margin: '18px 0 0', padding: '10px 12px', borderRadius: '9px', background: '#fff1f2', color: '#9f1239', fontSize: '13px', lineHeight: 1.45 }}>Customer accounts are unavailable because Supabase is not configured.</p> : null}
            {shopAuthError ? <p role="alert" style={{ margin: '18px 0 0', padding: '10px 12px', borderRadius: '9px', background: '#fff1f2', color: '#9f1239', fontSize: '13px', lineHeight: 1.45 }}>{shopAuthError}</p> : null}
            {shopAuthNotice ? <p role="status" style={{ margin: '18px 0 0', padding: '10px 12px', borderRadius: '9px', background: '#ecfdf5', color: '#166534', fontSize: '13px', lineHeight: 1.45 }}>{shopAuthNotice}</p> : null}

            {shopUser ? (
              <div style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
                <div style={{ padding: '13px', border: '1px solid #eadfd5', borderRadius: '10px', background: '#f7f2ec' }}>
                  <strong style={{ display: 'block', color: '#2e2a26', fontSize: '14px' }}>{shopUserName}</strong>
                  {shopUser.email ? <span style={{ display: 'block', marginTop: '4px', color: '#665f5a', fontSize: '12px', overflowWrap: 'anywhere' }}>{shopUser.email}</span> : null}
                </div>
                <button type="button" onClick={() => void signOutShopAccount()} disabled={shopAuthBusy} style={{ minHeight: '46px', border: 0, borderRadius: '9px', background: '#356656', color: '#fff', fontWeight: 800, cursor: shopAuthBusy ? 'wait' : 'pointer' }}>{shopAuthBusy ? 'Please wait…' : 'Sign out'}</button>
              </div>
            ) : (
              <form onSubmit={(event) => void submitShopAuth(event)} style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
                {shopAuthMode === 'signUp' ? (
                  <label style={{ display: 'grid', gap: '6px', color: '#2e2a26', fontSize: '12px', fontWeight: 800 }}>
                    Full name
                    <input autoComplete="name" value={shopAuthName} onChange={(event) => setShopAuthName(event.target.value)} required maxLength={120} style={{ minHeight: '44px', boxSizing: 'border-box', padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#1b1b1b', fontSize: '14px' }} />
                  </label>
                ) : null}
                <label style={{ display: 'grid', gap: '6px', color: '#2e2a26', fontSize: '12px', fontWeight: 800 }}>
                  Email or phone number
                  <input type="text" autoComplete="username" value={shopAuthEmail} onChange={(event) => setShopAuthEmail(event.target.value)} required maxLength={254} style={{ minHeight: '44px', boxSizing: 'border-box', padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#1b1b1b', fontSize: '14px' }} />
                </label>
                <label style={{ display: 'grid', gap: '6px', color: '#2e2a26', fontSize: '12px', fontWeight: 800 }}>
                  Password
                  <span style={{ position: 'relative', display: 'block' }}>
                    <input type={shopAuthPasswordVisible ? 'text' : 'password'} autoComplete={shopAuthMode === 'signIn' ? 'current-password' : 'new-password'} value={shopAuthPassword} onChange={(event) => setShopAuthPassword(event.target.value)} required minLength={8} style={{ width: '100%', minHeight: '44px', boxSizing: 'border-box', padding: '0 42px 0 12px', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#1b1b1b', fontSize: '14px' }} />
                    <button type="button" aria-label={shopAuthPasswordVisible ? 'Hide password' : 'Show password'} aria-pressed={shopAuthPasswordVisible} onClick={() => setShopAuthPasswordVisible((visible) => !visible)} style={{ position: 'absolute', top: '50%', right: '5px', transform: 'translateY(-50%)', display: 'grid', placeItems: 'center', width: '34px', height: '34px', border: 0, borderRadius: '6px', background: 'transparent', color: '#475569', cursor: 'pointer' }}>
                      <i className={`fa-solid ${shopAuthPasswordVisible ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
                    </button>
                  </span>
                </label>
                {shopAuthMode === 'signUp' ? (
                  <label style={{ display: 'grid', gap: '6px', color: '#2e2a26', fontSize: '12px', fontWeight: 800 }}>
                    Confirm password
                    <span style={{ position: 'relative', display: 'block' }}>
                      <input type={shopAuthConfirmPasswordVisible ? 'text' : 'password'} autoComplete="new-password" value={shopAuthConfirmPassword} onChange={(event) => setShopAuthConfirmPassword(event.target.value)} required minLength={8} style={{ width: '100%', minHeight: '44px', boxSizing: 'border-box', padding: '0 42px 0 12px', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#1b1b1b', fontSize: '14px' }} />
                      <button type="button" aria-label={shopAuthConfirmPasswordVisible ? 'Hide confirm password' : 'Show confirm password'} aria-pressed={shopAuthConfirmPasswordVisible} onClick={() => setShopAuthConfirmPasswordVisible((visible) => !visible)} style={{ position: 'absolute', top: '50%', right: '5px', transform: 'translateY(-50%)', display: 'grid', placeItems: 'center', width: '34px', height: '34px', border: 0, borderRadius: '6px', background: 'transparent', color: '#475569', cursor: 'pointer' }}>
                        <i className={`fa-solid ${shopAuthConfirmPasswordVisible ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
                      </button>
                    </span>
                  </label>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: '#475569', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      <input type="checkbox" checked={shopAuthRemember} onChange={(event) => setShopAuthRemember(event.target.checked)} />
                      Remember me
                    </label>
                    <button type="button" onClick={() => void resetShopPassword()} disabled={shopAuthBusy || isSupabaseStub} style={{ border: 0, background: 'transparent', color: '#356656', fontSize: '12px', fontWeight: 800, cursor: shopAuthBusy || isSupabaseStub ? 'not-allowed' : 'pointer' }}>Forgot password?</button>
                  </div>
                )}
                {shopAuthMode === 'signUp' ? (
                  <div role="group" aria-label="Legal consent" style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', marginTop: '2px', color: '#475569', fontSize: '12px', lineHeight: 1.5 }}>
                    <input type="checkbox" aria-label="Agree to the System Terms and acknowledge the Privacy Policy" checked={shopAuthConsent} onChange={(event) => setShopAuthConsent(event.target.checked)} style={{ width: '17px', height: '17px', flex: '0 0 17px', margin: '2px 0 0', accentColor: '#176b3a' }} />
                    <span>I agree to the <button type="button" onClick={() => setShopLegalPolicy('terms')} style={{ padding: 0, border: 0, background: 'transparent', color: '#176b3a', font: 'inherit', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer' }}>System Terms</button> and acknowledge the <button type="button" onClick={() => setShopLegalPolicy('privacy')} style={{ padding: 0, border: 0, background: 'transparent', color: '#176b3a', font: 'inherit', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</button>, including how PAZ uses account and order information.</span>
                  </div>
                ) : null}
                <button type="submit" disabled={shopAuthBusy || isSupabaseStub || (shopAuthMode === 'signUp' && !shopAuthConsent)} style={{ minHeight: '46px', marginTop: '4px', border: 0, borderRadius: '9px', background: '#356656', color: '#fff', fontWeight: 900, cursor: shopAuthBusy || isSupabaseStub || (shopAuthMode === 'signUp' && !shopAuthConsent) ? 'not-allowed' : 'pointer', opacity: shopAuthBusy || isSupabaseStub || (shopAuthMode === 'signUp' && !shopAuthConsent) ? 0.65 : 1 }}>
                  {shopAuthBusy ? 'Please wait…' : shopAuthMode === 'signIn' ? 'Sign in' : 'Create account'}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '11px' }}><span style={{ height: '1px', flex: 1, background: '#e2e8f0' }} />or<span style={{ height: '1px', flex: 1, background: '#e2e8f0' }} /></div>
                <button type="button" onClick={() => void signInWithShopProvider('google')} disabled={shopAuthBusy || isSupabaseStub || (shopAuthMode === 'signUp' && !shopAuthConsent)} style={{ minHeight: '44px', border: '1px solid #cbd5e1', borderRadius: '9px', background: '#fff', color: '#334155', fontWeight: 800, cursor: shopAuthBusy || isSupabaseStub || (shopAuthMode === 'signUp' && !shopAuthConsent) ? 'not-allowed' : 'pointer', opacity: shopAuthMode === 'signUp' && !shopAuthConsent ? 0.65 : 1 }}>G&nbsp;&nbsp; Continue with Google</button>
                <button type="button" onClick={() => void signInWithShopProvider('facebook')} disabled={shopAuthBusy || isSupabaseStub || (shopAuthMode === 'signUp' && !shopAuthConsent)} style={{ minHeight: '44px', border: '1px solid #cbd5e1', borderRadius: '9px', background: '#fff', color: '#334155', fontWeight: 800, cursor: shopAuthBusy || isSupabaseStub || (shopAuthMode === 'signUp' && !shopAuthConsent) ? 'not-allowed' : 'pointer', opacity: shopAuthMode === 'signUp' && !shopAuthConsent ? 0.65 : 1 }}><span style={{ color: '#1877f2', marginRight: '10px' }}>f</span>Continue with Facebook</button>
                <p style={{ margin: '4px 0 0', textAlign: 'center', color: '#665f5a', fontSize: '12px' }}>
                  {shopAuthMode === 'signIn' ? 'New to PAZ? ' : 'Already have an account? '}
                  <button type="button" onClick={() => { setShopAuthMode((mode) => mode === 'signIn' ? 'signUp' : 'signIn'); setShopAuthConsent(false); setShopAuthConfirmPassword(''); setShopAuthPasswordVisible(false); setShopAuthConfirmPasswordVisible(false); setShopAuthError(''); setShopAuthNotice(''); }} style={{ padding: 0, border: 0, background: 'transparent', color: '#356656', fontWeight: 900, cursor: 'pointer' }}>
                    {shopAuthMode === 'signIn' ? 'Create an account' : 'Sign in'}
                  </button>
                </p>
              </form>
            )}
          </section>
        </div>
      ) : null}

      {shopLegalPolicy ? <LegalDocumentModal policy={legalDocuments[shopLegalPolicy]} onClose={setShopLegalPolicy} /> : null}

      {shopAccountPage ? (
        <main style={{ minHeight: 'calc(100vh - 76px)', padding: isSmallScreen ? '18px 14px 40px' : '32px 24px 56px', background: accountThemeColors.surface, color: accountThemeColors.text }}>
          <div style={{ width: 'min(1160px, 100%)', margin: '0 auto' }}>
            <button type="button" onClick={() => { setShopAccountPage(null); navigate('/shop'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '40px', padding: '0 13px', border: `1px solid ${accountThemeColors.border}`, borderRadius: '9px', background: accountThemeColors.card, color: accountThemeColors.text, fontWeight: 800, cursor: 'pointer' }}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to shop
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : '230px minmax(0, 1fr)', gap: '20px', marginTop: '20px', alignItems: 'start' }}>
              <aside aria-label="Account sections" style={{ display: isSmallScreen ? 'flex' : 'grid', gap: isSmallScreen ? '7px' : '4px', overflowX: isSmallScreen ? 'auto' : 'visible', padding: isSmallScreen ? '4px 0 9px' : '12px', border: `1px solid ${accountThemeColors.border}`, borderRadius: '13px', background: accountThemeColors.card }}>
                {shopProfileMenu.map(([page, label, icon]) => (
                  <button key={page} type="button" onClick={() => openShopAccountPage(page)} aria-current={shopAccountPage === page ? 'page' : undefined} style={{ display: 'flex', flex: isSmallScreen ? '0 0 auto' : undefined, alignItems: 'center', gap: '9px', minHeight: '39px', padding: '0 10px', border: 0, borderRadius: '8px', background: shopAccountPage === page ? accountThemeColors.softAccent : 'transparent', color: shopAccountPage === page ? accountThemeColors.accent : accountThemeColors.text, fontWeight: 750, whiteSpace: 'nowrap', textAlign: 'left', cursor: 'pointer' }}>
                    <i className={`fa-solid fa-${icon}`} aria-hidden="true" style={{ width: '17px' }} />{label}
                  </button>
                ))}
              </aside>

              <section aria-labelledby="shop-account-page-title" style={{ minWidth: 0, minHeight: '360px', padding: isSmallScreen ? '18px 14px' : '26px', border: `1px solid ${accountThemeColors.border}`, borderRadius: '14px', background: accountThemeColors.card, boxShadow: '0 8px 24px rgba(20, 45, 29, .06)' }}>
                <h1 id="shop-account-page-title" style={{ margin: '0 0 18px', fontSize: isSmallScreen ? '23px' : '28px', lineHeight: 1.2, color: accountThemeColors.text }}>
                  {shopProfileMenu.find(([page]) => page === shopAccountPage)?.[1] || 'My profile'}
                </h1>
                {shopAccountDataError ? <p role="alert" style={{ margin: '0 0 16px', padding: '11px 13px', borderRadius: '9px', background: shopAccountTheme === 'dark' ? '#4b2727' : '#fff1f2', color: shopAccountTheme === 'dark' ? '#ffdada' : '#9f1239' }}>{shopAccountDataError}</p> : null}
                {shopAccountDataBusy ? <p role="status" style={{ color: accountThemeColors.muted }}>Loading your account details…</p> : null}

                {shopAccountPage === 'account' ? (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px', border: `1px solid ${accountThemeColors.border}`, borderRadius: '12px', background: accountThemeColors.surface }}>
                      {shopAvatarUrl ? <img src={shopAvatarUrl} alt={`${shopUserName}'s profile`} style={{ width: '76px', height: '76px', borderRadius: '50%', objectFit: 'cover' }} /> : <span aria-hidden="true" style={{ display: 'grid', placeItems: 'center', width: '76px', height: '76px', flex: '0 0 76px', borderRadius: '50%', background: accountThemeColors.softAccent, color: accountThemeColors.accent, fontSize: '28px', fontWeight: 900 }}>{shopUserName.slice(0, 1).toUpperCase()}</span>}
                      <div style={{ minWidth: 0 }}><strong style={{ display: 'block', fontSize: '19px', overflowWrap: 'anywhere' }}>{shopUserName}</strong><span style={{ display: 'block', marginTop: '5px', color: accountThemeColors.muted, overflowWrap: 'anywhere' }}>{shopUser?.email || shopUser?.phone || 'Customer account'}</span></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                      {[['Email address', shopUser?.email || 'Not provided'], ['Phone number', shopAuthProfile?.phone || shopUser?.phone || 'Not provided'], ['Account name', shopAuthProfile?.full_name || shopUserName], ['Member since', shopUser?.created_at ? new Date(shopUser.created_at).toLocaleDateString() : '—']].map(([label, value]) => <div key={label} style={{ padding: '14px', border: `1px solid ${accountThemeColors.border}`, borderRadius: '10px' }}><span style={{ display: 'block', marginBottom: '5px', color: accountThemeColors.muted, fontSize: '12px', fontWeight: 700 }}>{label}</span><strong style={{ overflowWrap: 'anywhere' }}>{value}</strong></div>)}
                    </div>
                  </div>
                ) : null}

                {shopAccountPage === 'orders' ? (
                  shopOrders.length ? <div style={{ display: 'grid', gap: '12px' }}>{shopOrders.map((order) => <article key={order.id} style={{ padding: '15px', border: `1px solid ${accountThemeColors.border}`, borderRadius: '10px' }}><div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}><strong>Order {order.order_number || order.id}</strong><span>{order.status || 'Processing'}</span></div><p style={{ margin: '8px 0', color: accountThemeColors.muted }}>{(order.shop_order_items || []).map((item) => `${item.title} × ${item.quantity}`).join(', ') || 'Order items'}</p><small style={{ color: accountThemeColors.muted }}>{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</small><strong style={{ display: 'block', marginTop: '8px' }}>{order.currency || 'NGN'} {Number(order.total || 0).toLocaleString()}</strong></article>)}</div> : !shopAccountDataBusy && !shopAccountDataError ? <p style={{ color: accountThemeColors.muted }}>Your orders will appear here after you place an order.</p> : null
                ) : null}

                {shopAccountPage === 'wishlist' ? (
                  wishlistProducts.length ? <div style={{ display: 'grid', gridTemplateColumns: isSmallScreen ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>{wishlistProducts.map((product) => <button key={product.id} type="button" onClick={() => { setShopAccountPage(null); setSelectedProduct(product); navigate(`/shop?product=${encodeURIComponent(productSlug(product))}`); }} style={{ padding: '12px', border: `1px solid ${accountThemeColors.border}`, borderRadius: '10px', background: accountThemeColors.card, color: accountThemeColors.text, textAlign: 'left', cursor: 'pointer' }}><strong>{product.title}</strong><span style={{ display: 'block', marginTop: '8px', color: accountThemeColors.accent }}>View product</span></button>)}</div> : <p style={{ color: accountThemeColors.muted }}>Your saved products will appear here.</p>
                ) : null}

                {shopAccountPage === 'messages' ? (
                  activeShopConversation ? <div><button type="button" onClick={() => setActiveShopConversation(null)} style={{ marginBottom: '12px', border: 0, background: 'transparent', color: accountThemeColors.accent, fontWeight: 800, cursor: 'pointer' }}>← All messages</button><ProductChat product={{ id: activeShopConversation.product_id, title: activeShopConversation.product_title || 'Product conversation' }} /></div>
                    : shopConversations.length ? <div style={{ display: 'grid', gap: '11px' }}>{shopConversations.map((conversation) => <article key={conversation.id} style={{ padding: '15px', border: `1px solid ${accountThemeColors.border}`, borderRadius: '10px' }}><strong>{conversation.product_title || 'Product conversation'}</strong><p style={{ margin: '7px 0', color: accountThemeColors.muted }}>{conversation.last_message || 'No messages yet.'}</p><small style={{ display: 'block', marginBottom: '9px', color: accountThemeColors.muted }}>Status: {conversation.status || 'open'}{conversation.unread_count ? ` · ${conversation.unread_count} unread` : ''}</small><button type="button" onClick={() => { try { window.localStorage.setItem(`paz-product-chat-${String(conversation.product_id || '')}`, conversation.token || ''); } catch (error) { console.error('Could not store the customer conversation token:', error); setShopAccountDataError('This conversation could not be opened on this device.'); return; } setActiveShopConversation(conversation); }} style={{ minHeight: '36px', padding: '0 11px', border: `1px solid ${accountThemeColors.border}`, borderRadius: '8px', background: accountThemeColors.softAccent, color: accountThemeColors.accent, fontWeight: 800, cursor: 'pointer' }}>Open conversation</button></article>)}</div> : !shopAccountDataBusy && !shopAccountDataError ? <p style={{ color: accountThemeColors.muted }}>You do not have any product messages yet.</p> : null
                ) : null}

                {shopAccountPage === 'notifications' ? (
                  shopNotifications.length ? <div style={{ display: 'grid', gap: '9px' }}>{shopNotifications.map((notification) => <article key={notification.id} style={{ padding: '13px', border: `1px solid ${accountThemeColors.border}`, borderRadius: '10px', background: notification.read_at ? accountThemeColors.card : accountThemeColors.softAccent }}><strong>{notification.title || 'PAZ update'}</strong><p style={{ margin: '6px 0', color: accountThemeColors.muted }}>{notification.message || notification.body || 'You have a new update.'}</p>{!notification.read_at ? <button type="button" onClick={() => void markShopNotificationRead(notification)} style={{ padding: 0, border: 0, background: 'transparent', color: accountThemeColors.accent, fontWeight: 800, cursor: 'pointer' }}>Mark as read</button> : null}</article>)}</div> : !shopAccountDataBusy && !shopAccountDataError ? <p style={{ color: accountThemeColors.muted }}>You are all caught up. New notifications will appear here.</p> : null
                ) : null}

                {shopAccountPage === 'address' ? (
                  <form onSubmit={(event) => void saveShopAddress(event)} style={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                    {[[['fullName', 'Full name'], ['phone', 'Phone number'], ['addressLine1', 'Street address'], ['addressLine2', 'Apartment, unit (optional)'], ['city', 'City'], ['state', 'State / province'], ['postalCode', 'Postal code'], ['country', 'Country']]].flat().map(([field, label]) => <label key={field} style={{ display: 'grid', gap: '5px', color: accountThemeColors.muted, fontSize: '12px', fontWeight: 750 }}>{label}<input value={shopAddress[field] || ''} onChange={(event) => setShopAddress((current) => ({ ...current, [field]: event.target.value }))} required={!['addressLine2', 'postalCode'].includes(field)} style={{ minHeight: '42px', boxSizing: 'border-box', padding: '0 11px', border: `1px solid ${accountThemeColors.border}`, borderRadius: '8px', background: accountThemeColors.surface, color: accountThemeColors.text }} /></label>)}
                    <button type="submit" disabled={shopAccountDataBusy} style={{ gridColumn: isSmallScreen ? undefined : '1 / -1', minHeight: '44px', border: 0, borderRadius: '9px', background: accountThemeColors.accent, color: '#fff', fontWeight: 850, cursor: shopAccountDataBusy ? 'wait' : 'pointer' }}>Save address</button>
                    {shopAddressNotice ? <p role="status" style={{ gridColumn: isSmallScreen ? undefined : '1 / -1', margin: 0, color: accountThemeColors.accent }}>{shopAddressNotice}</p> : null}
                  </form>
                ) : null}

                {shopAccountPage === 'payments' ? <div style={{ padding: '16px', border: `1px solid ${accountThemeColors.border}`, borderRadius: '10px', background: accountThemeColors.surface }}><strong>Secure checkout</strong><p style={{ margin: '8px 0 0', color: accountThemeColors.muted, lineHeight: 1.6 }}>Payment details are handled securely when you check out. PAZ does not store full card numbers in your account.</p></div> : null}
                {shopAccountPage === 'preferences' ? <div><p style={{ marginTop: 0, color: accountThemeColors.muted }}>Choose how the account area looks on this device.</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>{[['light', 'Light theme'], ['dark', 'Dark theme']].map(([theme, label]) => <button key={theme} type="button" aria-pressed={shopAccountTheme === theme} onClick={() => setShopAccountTheme(theme)} style={{ minHeight: '42px', padding: '0 14px', border: `1px solid ${shopAccountTheme === theme ? accountThemeColors.accent : accountThemeColors.border}`, borderRadius: '9px', background: shopAccountTheme === theme ? accountThemeColors.softAccent : accountThemeColors.card, color: accountThemeColors.text, fontWeight: 800, cursor: 'pointer' }}>{label}</button>)}</div></div> : null}
                {shopAccountPage === 'support' ? <div style={{ display: 'grid', gap: '10px', color: accountThemeColors.muted }}><p style={{ marginTop: 0 }}>Need help with an order or your account? Contact the PAZ team.</p><a href="mailto:support@pazthrivingtribe.com" style={{ color: accountThemeColors.accent, fontWeight: 800 }}>Email customer support</a><button type="button" onClick={() => navigate('/shop')} style={{ justifySelf: 'start', minHeight: '40px', padding: '0 12px', border: `1px solid ${accountThemeColors.border}`, borderRadius: '8px', background: accountThemeColors.surface, color: accountThemeColors.text, fontWeight: 750, cursor: 'pointer' }}>Browse the shop</button></div> : null}
                {shopAccountPage === 'about' ? <div style={{ maxWidth: '680px', color: accountThemeColors.muted, lineHeight: 1.7 }}><p style={{ marginTop: 0 }}><strong style={{ color: accountThemeColors.text }}>PAZ Thriving Tribe</strong> brings books, helpful resources, groceries, and gadgets together in one marketplace.</p><p>Explore the shop, manage your customer account, and contact support whenever you need help.</p></div> : null}
              </section>
            </div>
          </div>
        </main>
      ) : null}

      {/* Main Content */}
      <div style={{ display: shopAccountPage ? 'none' : isProductPage ? 'contents' : 'block', maxWidth: '1400px', margin: '0 auto', padding: isSmallScreen ? '16px 14px 50px' : '20px 14px 50px', paddingLeft: isSmallScreen ? '14px' : '268px' }}>
        <div style={{ display: isProductPage ? 'none' : 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          {!isSmallScreen && (
            <aside style={{ 
              background: '#fff', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              padding: '16px',
              position: 'fixed',
              left: '14px',
              top: '330px',
              width: '220px',
              height: 'calc(100vh - 350px)',
              overflowY: 'auto',
              zIndex: 50
            }}>
              {/* Category Filter */}
              <div style={{ marginBottom: '20px', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 'bold', color: '#111' }}>Category</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {categories.map((cat) => (
                    <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                      <input
                        type="radio"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div style={{ marginBottom: '20px', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 'bold', color: '#111' }}>Price</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {[
                    { label: 'Under ₦5,000', min: 0, max: 5000 },
                    { label: '₦5,000 - ₦10,000', min: 5000, max: 10000 },
                    { label: '₦10,000 - ₦20,000', min: 10000, max: 20000 },
                    { label: 'Over ₦20,000', min: 20000, max: 50000 }
                  ].map((range) => (
                    <label key={range.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        checked={priceRange[0] === range.min && priceRange[1] === range.max}
                        onChange={() => setPriceRange([range.min, range.max])}
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div style={{ marginBottom: '20px', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 'bold', color: '#111' }}>Rating</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {[0, 2, 3, 4].map((stars) => (
                    <label key={stars} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                      <input
                        type="radio"
                        checked={minRating === stars}
                        onChange={() => setMinRating(stars)}
                      />
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {stars === 0 ? 'Any' : <>{[...Array(stars)].map((_, i) => <span key={i} style={{ color: '#FDB913' }}>★</span>)} & Up</>}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {isSmallScreen && categoryDrawerOpen && (
            <div
              onClick={() => setCategoryDrawerOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.28)',
                zIndex: 140,
                backdropFilter: 'blur(2px)'
              }}
            />
          )}

          {isSmallScreen && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <button
                type="button"
                onClick={() => setCategoryDrawerOpen(true)}
                aria-expanded={categoryDrawerOpen}
                aria-controls="shop-filter-drawer"
                style={{
                  background: '#fff',
                  border: '1px solid #d5d9d9',
                  borderRadius: '999px',
                  padding: '10px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#111',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 10px rgba(15, 23, 42, 0.06)'
                }}
              >
                <i className="fa-solid fa-sliders" aria-hidden="true" />
                Categories
              </button>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {allVisibleProducts.length} products
              </div>
            </div>
          )}

          {isSmallScreen && (
            <aside style={{
              position: 'fixed',
              left: categoryDrawerOpen ? 0 : 'calc(-1 * min(88vw, 360px) - 24px)',
              top: 'auto',
              bottom: 0,
              width: 'min(88vw, 360px)',
              maxWidth: 'calc(100vw - 18px)',
              background: '#fff',
              borderRight: '1px solid #e0e0e0',
              padding: '14px 14px 18px',
              overflowY: 'auto',
              zIndex: 180,
              transition: 'left 0.25s ease-in-out',
              boxShadow: '8px 0 24px rgba(15, 23, 42, 0.14)',
              borderRadius: '0 18px 18px 0',
              height: '84vh',
              borderTopRightRadius: '18px',
              borderBottomRightRadius: '18px',
              boxSizing: 'border-box'
            }} id="shop-filter-drawer" role="dialog" aria-modal="true" aria-labelledby="shop-filter-title" onClick={(event) => event.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontWeight: 800 }}><i className="fa-solid fa-sliders" aria-hidden="true" /></div>
                  <h3 id="shop-filter-title" style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111' }}>Shop filters</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setCategoryDrawerOpen(false)}
                    style={{ background: '#f3f4f6', border: 'none', borderRadius: '999px', padding: '6px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', color: '#111' }}
                  >
                    Continue
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryDrawerOpen(false)}
                    aria-label="Close shop filters"
                    style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#444' }}
                  >
                    ×
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '20px', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 'bold', color: '#111' }}>Category</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {categories.map((cat) => (
                    <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                      <input
                        type="radio"
                        checked={selectedCategory === cat}
                        onChange={() => {
                          setSelectedCategory(cat);
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 'bold', color: '#111' }}>Price</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {[
                    { label: 'Under ₦5,000', min: 0, max: 5000 },
                    { label: '₦5,000 - ₦10,000', min: 5000, max: 10000 },
                    { label: '₦10,000 - ₦20,000', min: 10000, max: 20000 },
                    { label: 'Over ₦20,000', min: 20000, max: 50000 }
                  ].map((range) => (
                    <label key={range.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        checked={priceRange[0] === range.min && priceRange[1] === range.max}
                        onChange={() => {
                          setPriceRange([range.min, range.max]);
                        }}
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 'bold', color: '#111' }}>Rating</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {[0, 2, 3, 4].map((stars) => (
                    <label key={stars} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                      <input
                        type="radio"
                        checked={minRating === stars}
                        onChange={() => {
                          setMinRating(stars);
                        }}
                      />
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {stars === 0 ? 'Any' : <>{[...Array(stars)].map((_, i) => <span key={i} style={{ color: '#FDB913' }}>★</span>)} & Up</>}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* Main Content Area */}
          <main>
            {/* Sort and Results Count */}
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: isSmallScreen ? 'nowrap' : 'wrap', gap: isSmallScreen ? '6px' : '12px' }}>
              <div aria-label={`Showing products ${allVisibleProducts.length === 0 ? 0 : startIndex + 1} to ${Math.min(startIndex + productsPerPage, allVisibleProducts.length)} of ${allVisibleProducts.length}`} style={{ minWidth: 0, fontSize: isSmallScreen ? '11px' : '14px', color: '#666', whiteSpace: 'nowrap' }}>
                {isSmallScreen ? <>Showing <strong>{allVisibleProducts.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + productsPerPage, allVisibleProducts.length)}/{allVisibleProducts.length}</strong></> : <>Showing <strong>{allVisibleProducts.length === 0 ? 0 : startIndex + 1}</strong>-<strong>{Math.min(startIndex + productsPerPage, allVisibleProducts.length)}</strong> of <strong>{allVisibleProducts.length}</strong> results</>}
              </div>
              <div style={{ flexShrink: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: isSmallScreen ? '4px' : '8px', fontSize: isSmallScreen ? '11px' : '14px', whiteSpace: 'nowrap' }}>
                  Sort by:
                  <div style={{ width: isVerySmallScreen ? '104px' : isSmallScreen ? '128px' : '180px', flexShrink: 0 }}>
                    <SearchableOptionPicker value={sortBy} options={['relevant', 'price-low', 'price-high', 'rating', 'newest']} onChange={setSortBy} label="Sort products" />
                  </div>
                </label>
              </div>
            </div>

            {/* Products Grid */}
            {visibleProducts.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                background: '#f5f5f5',
                borderRadius: '8px',
                color: '#666'
              }}>
                <p style={{ fontSize: '16px', margin: '0 0 10px' }}>No products found</p>
                <p style={{ fontSize: '14px', margin: 0, color: '#999' }}>Try adjusting your filters or search term</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: visibleProducts.length === 1 ? 'minmax(0, min(320px, 100%))' : isSmallScreen ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fill, minmax(220px, 280px))',
                gap: isSmallScreen ? (isVerySmallScreen ? '8px' : '12px') : '16px',
                gridAutoRows: '1fr',
                alignItems: 'stretch',
                justifyItems: 'stretch',
                justifyContent: 'start',
                width: '100%',
                maxWidth: '100%',
                minWidth: 0
              }}>
                {visibleProducts.map((product) => (
                  <div key={product.id} onClick={() => navigate(productUrl(product))} style={{
                    background: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '12px',
                    padding: '0',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    width: '100%',
                    minHeight: isVerySmallScreen ? '250px' : isSmallScreen ? '290px' : '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box'
                  }} onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }} onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    {/* Product Image Container */}
                    <div style={{
                      height: isVerySmallScreen ? '110px' : isSmallScreen ? '140px' : '200px',
                      background: 'linear-gradient(135deg, #f5f5f5 0%, #efefef 100%)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}>
                      <ProductCover product={product} style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }} />
                      
                      {/* Prime Badge - Positioned Absolutely */}
                      {product.prime && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#0066c0',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '900',
                          letterSpacing: '0.5px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                          <span>★</span>
                          <span>PRIME</span>
                        </div>
                      )}
                      {isNewProduct(product) && (
                        <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#dc2626', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 900, letterSpacing: '0.5px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>NEW</div>
                      )}
                    </div>

                    {/* Content Area - Flex Grow */}
                    <div style={{
                      padding: isVerySmallScreen ? '8px 6px 6px' : isSmallScreen ? '10px 8px 8px' : '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      justifyContent: 'flex-start'
                    }}>
                      {/* Title */}
                      <h3 style={{
                        margin: '0 0 6px',
                        fontSize: isVerySmallScreen ? '10px' : isSmallScreen ? '11px' : '13px',
                        fontWeight: '600',
                        lineHeight: '1.35',
                        color: '#111',
                        maxHeight: isVerySmallScreen ? '28px' : isSmallScreen ? '32px' : '39px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {product.title}
                      </h3>
                      {product.vendorName && <div style={{ marginBottom: '6px', color: '#64748b', fontSize: '10px' }}>By {product.vendorName}</div>}

                      {/* Rating - Compact */}
                      <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <div style={{ display: 'flex', color: '#FDB913', fontSize: '11px', letterSpacing: '-1px' }}>
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>
                              {i < Math.floor(getProductRating(product)) ? '★' : i < getProductRating(product) ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                        <span style={{ fontSize: '11px', color: '#666' }}>({getProductReviewCount(product)})</span>
                      </div>

                      {/* Stock Info - Tight */}
                      <div style={{
                        fontSize: '11px',
                        color: product.inStock === false || Number(product.stockCount || 0) <= 0 ? '#B12704' : product.stockCount < 10 ? '#B12704' : '#188a00',
                        marginBottom: '8px',
                        fontWeight: product.inStock === false || Number(product.stockCount || 0) <= 0 ? '600' : product.stockCount < 10 ? '600' : 'normal',
                        letterSpacing: '0.2px'
                      }}>
                        {product.inStock === false || Number(product.stockCount || 0) <= 0
                          ? 'Out of stock'
                          : product.stockCount < 10
                            ? `Only ${product.stockCount} left`
                            : 'In stock'}
                      </div>
                      {!getProductAvailability(product, availabilityNow).available && (
                        <div style={{ marginBottom: '8px', color: '#9a3412', fontSize: '11px', lineHeight: 1.4, fontWeight: 700 }}>
                          {getProductAvailability(product, availabilityNow).message}
                        </div>
                      )}

                      {/* Price - Bold & Prominent */}
                      <div style={{
                        fontSize: isVerySmallScreen ? '12px' : isSmallScreen ? '14px' : '16px',
                        fontWeight: '700',
                        color: '#B12704',
                        marginBottom: isVerySmallScreen ? '6px' : isSmallScreen ? '8px' : '10px',
                        letterSpacing: '-0.5px'
                      }}>
                        {productPriceLabel(product)}
                      </div>

                    </div>

                    {/* Add to Cart Button - Fixed at Bottom */}
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        addToCart(product, event);
                      }}
                      disabled={product.inStock === false || Number(product.stockCount || 0) <= 0}
                      style={{
                        width: '100%',
                        background: product.inStock === false || Number(product.stockCount || 0) <= 0 ? '#e5e7eb' : 'linear-gradient(135deg, #FF9900 0%, #FF8C00 100%)',
                        border: 'none',
                        borderRadius: '0',
                        padding: isVerySmallScreen ? '8px 6px' : isSmallScreen ? '9px 8px' : '10px 12px',
                        fontWeight: '600',
                        cursor: product.inStock === false || Number(product.stockCount || 0) <= 0 ? 'not-allowed' : 'pointer',
                        fontSize: isVerySmallScreen ? '10px' : isSmallScreen ? '11px' : '13px',
                        color: product.inStock === false || Number(product.stockCount || 0) <= 0 ? '#6b7280' : '#111',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)'
                      }}
                      onMouseEnter={(e) => {
                        if (product.inStock !== false && Number(product.stockCount || 0) > 0) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #FF8C00 0%, #FF7A00 100%)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (product.inStock !== false && Number(product.stockCount || 0) > 0) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #FF9900 0%, #FF8C00 100%)';
                        }
                      }}
                    >
                      <i className={`fa-solid ${getProductAvailability(product, availabilityNow).reason === 'not-released' ? 'fa-bell' : 'fa-cart-plus'}`} style={{ fontSize: '14px' }}></i>
                      <span>{product.inStock === false || Number(product.stockCount || 0) <= 0 ? 'Sold out' : getProductAvailability(product, availabilityNow).reason === 'not-released' ? 'Notify me' : 'Add to Cart'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                marginTop: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d5d9d9',
                    background: currentPage === 1 ? '#f0f0f0' : '#fff',
                    borderRadius: '4px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: currentPage === 1 ? '#999' : '#111'
                  }}
                >
                  ← Previous
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const showPage = totalPages <= 7 || 
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                  if (!showPage && i > 0 && [...Array(totalPages)][i - 1] && (i - 1) + 1 < pageNum - 1) {
                    return <span key={`ellipsis-${i}`} style={{ color: '#999' }}>...</span>;
                  }

                  if (showPage) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          padding: '8px 12px',
                          border: '1px solid #d5d9d9',
                          background: currentPage === pageNum ? '#FF9900' : '#fff',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: currentPage === pageNum ? '700' : '600',
                          color: currentPage === pageNum ? '#111' : '#111'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d5d9d9',
                    background: currentPage === totalPages ? '#f0f0f0' : '#fff',
                    borderRadius: '4px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: currentPage === totalPages ? '#999' : '#111'
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </main>
        </div>

        {cart.length > 0 && (
          <button
            ref={cartButtonRef}
            type="button"
            onClick={toggleCartDrawer}
            aria-label={cartOpen ? 'Close checkout drawer' : 'Open checkout drawer'}
            style={{
              position: 'fixed',
              right: cartOpen ? '362px' : '-2px',
              top: '52%',
              transform: 'translateY(-50%)',
              zIndex: 210,
              width: '54px',
              height: '60px',
              border: '1px solid rgba(17,17,17,0.08)',
              borderRight: 'none',
              borderRadius: '18px 0 0 18px',
              background: 'linear-gradient(180deg, #fff7e5 0%, #ffe7b8 100%)',
              color: '#111',
              cursor: 'pointer',
              boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'right 0.25s ease, box-shadow 0.2s ease',
              fontSize: '22px',
              fontWeight: '700'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 16px 28px rgba(0,0,0,0.18)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
            }}
          >
            <span
              key={cart.reduce((count, item) => count + item.quantity, 0)}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '6px',
                minWidth: '20px',
                height: '20px',
                borderRadius: '999px',
                background: '#111',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 6px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                animation: 'cartBadgePulse 0.4s ease-out'
              }}
            >
              {cart.reduce((count, item) => count + item.quantity, 0)}
            </span>
            <i className="fa-solid fa-cart-shopping" aria-hidden="true" />
          </button>
        )}

        {isProductPage && !selectedProduct && (
          <main style={{ minHeight: 'calc(100vh - 100px)', display: 'grid', placeItems: 'center', padding: isSmallScreen ? '32px 16px' : '64px 24px', background: '#f8fafc' }}>
            <section style={{ width: 'min(560px, 100%)', padding: isSmallScreen ? '28px 20px' : '40px', textAlign: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '18px', boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)' }}>
              <div style={{ color: '#f97316', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Product page</div>
              <h1 style={{ margin: '10px 0', color: '#111827', fontSize: '1.5rem' }}>{storeData.products?.length ? 'Product not found' : 'Loading product...'}</h1>
              <p style={{ margin: '0 0 22px', color: '#64748b', lineHeight: 1.6 }}>{storeData.products?.length ? 'This product link may be outdated or the product is no longer available.' : 'The product details are loading. Please wait a moment.'}</p>
              <button type="button" onClick={() => navigate(shopUrl)} style={{ border: 'none', borderRadius: '9px', padding: '11px 18px', background: '#166534', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Return to shop</button>
            </section>
          </main>
        )}

        {selectedProduct && isProductPage && (
          <div
            role="presentation"
            onClick={() => { setSelectedProduct(null); navigate(shopUrl); }}
            style={isProductPage ? { position: 'relative', zIndex: 1, display: 'block', padding: isSmallScreen ? '24px 12px 120px' : '36px 20px 120px', background: '#f8fafc' } : { position: 'fixed', inset: 0, zIndex: 260, display: 'grid', placeItems: 'start center', padding: isSmallScreen ? '78px 12px 12px' : '88px 20px 16px', background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)', overflow: 'hidden' }}
          >
            <div
              role={isProductPage ? 'main' : 'dialog'}
              aria-modal={isProductPage ? undefined : 'true'}
              aria-labelledby="product-details-title"
              onClick={(event) => event.stopPropagation()}
              style={isProductPage ? { width: 'min(980px, 100%)', margin: '0 auto', background: '#fff', borderRadius: isSmallScreen ? '14px' : '20px', boxShadow: '0 16px 44px rgba(15, 23, 42, 0.1)', padding: isSmallScreen ? '16px' : '30px', boxSizing: 'border-box' } : { width: 'min(720px, 100%)', maxHeight: 'calc(100vh - 104px)', overflow: 'hidden', background: '#fff', borderRadius: isSmallScreen ? '16px' : '22px', boxShadow: '0 28px 80px rgba(15, 23, 42, 0.3)', padding: isSmallScreen ? '12px' : '18px', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '12px' }}>
                <div>
                  <div style={{ color: '#f97316', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{selectedProduct.category || 'Product'}</div>
                  <h2 id="product-details-title" style={{ margin: 0, color: '#111827', fontSize: isSmallScreen ? '1.3rem' : '1.7rem', lineHeight: 1.2 }}>{selectedProduct.title}</h2>
                </div>
                <button type="button" onClick={() => { setSelectedProduct(null); navigate(shopUrl); }} aria-label={isProductPage ? 'Return to shop' : 'Close product details'} style={{ width: '34px', height: '34px', border: '1px solid #d1d5db', borderRadius: '50%', background: '#fff', color: '#334155', fontSize: '1.2rem', cursor: 'pointer', flexShrink: 0 }}>{isProductPage ? '←' : '×'}</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : '140px minmax(0, 1fr)', gap: isSmallScreen ? '8px' : '16px', alignItems: 'start' }}>
                <div style={{ width: '100%', maxWidth: isSmallScreen ? '140px' : 'none', justifySelf: isSmallScreen ? 'center' : 'stretch' }}>
                  <ProductCover product={selectedProduct} style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)' }} />
                  <div style={{ display: 'grid', gap: '4px', marginTop: '8px', padding: '9px 10px', borderRadius: '11px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', lineHeight: 1.35 }}>
                    <span><strong style={{ color: '#334155' }}>Category:</strong> {selectedProduct.category || 'Product'}</span>
                    <span><strong style={{ color: '#334155' }}>Delivery:</strong> Email attachment</span>
                    <span><strong style={{ color: '#334155' }}>Status:</strong> {selectedProduct.inStock === false || Number(selectedProduct.stockCount || 0) <= 0 ? 'Out of stock' : 'Available'}</span>
                  </div>
                </div>
                <div>
                  <div style={{ margin: '0 0 10px', color: '#475569' }}>
                    <p ref={descriptionRef} style={{
                      margin: '0 0 5px',
                      lineHeight: 1.55,
                      whiteSpace: 'pre-wrap',
                      display: descriptionExpanded ? 'block' : '-webkit-box',
                      WebkitLineClamp: descriptionExpanded ? 'unset' : 5,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {selectedProduct.description || 'No description provided yet.'}
                    </p>
                    {descriptionOverflow.description === (selectedProduct.description || '') && descriptionOverflow.hasOverflow && (
                      <button
                        type="button"
                        onClick={() => setDescriptionExpanded((current) => !current)}
                        style={{ border: 'none', padding: 0, background: 'none', color: '#166534', fontWeight: 800, fontSize: '0.86rem', cursor: 'pointer' }}
                      >
                        {descriptionExpanded ? 'Read less' : 'Read more'}
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <strong style={{ color: selectedProduct.isFree ? '#15803d' : '#b12704', fontSize: '1.35rem' }}>{productPriceLabel(selectedProduct)}</strong>
                    <span style={{ color: '#64748b', fontSize: '0.82rem' }}>{selectedProduct.isFree ? 'Free email delivery' : 'Digital product'}</span>
                  </div>
                  {selectedProduct.vendorName && <div style={{ marginBottom: '10px', color: '#475569', fontSize: '0.82rem' }}>Published by <strong>{selectedProduct.vendorName}</strong></div>}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px', color: '#64748b', fontSize: '0.8rem' }}>
                    <span>
                      {productRatingAverage > 0
                        ? `${'★'.repeat(Math.round(productRatingAverage))} ${productRatingAverage.toFixed(1)}/5 (${productRatingPercentage}%)${selectedProduct.reviews ? ` · ${selectedProduct.reviews} reviews` : ''}`
                        : 'No ratings yet'}
                    </span>
                    <span>{selectedProduct.inStock === false || Number(selectedProduct.stockCount || 0) <= 0 ? 'Out of stock' : `${selectedProduct.stockCount} available`}</span>
                  </div>
                  <div aria-label="Product interest" style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginBottom: '12px', color: '#475569', fontSize: '0.82rem' }}>
                    <span><strong>{productMetrics ? Number(productMetrics.views || 0).toLocaleString('en-NG') : '—'}</strong> Viewed</span>
                    <span><strong>{productMetrics ? Number(productMetrics.completedOrders || 0).toLocaleString('en-NG') : '—'}</strong> Completed Store Orders</span>
                    {productMetrics?.hasReleaseDate && <span><strong>{Number(productMetrics.notified || 0).toLocaleString('en-NG')}</strong> Notify signups</span>}
                  </div>
                  {!getProductAvailability(selectedProduct, availabilityNow).available && <div role="status" style={{ marginBottom: '10px', padding: '10px 12px', border: '1px solid #fed7aa', borderRadius: '8px', background: '#fff7ed', color: '#9a3412', fontSize: '.84rem', lineHeight: 1.45, fontWeight: 700 }}>{getProductAvailability(selectedProduct, availabilityNow).message}</div>}

                  {!selectedProduct.isFree && <div style={{ padding: '14px', border: '1px solid #fed7aa', borderRadius: '12px', background: '#fffaf5' }}>
                    <div style={{ color: '#9a3412', fontWeight: 800, marginBottom: '10px' }}>Currency calculator</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 112px', gap: '8px', alignItems: 'center' }}>
                      <div style={{ padding: '11px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', color: '#111827', fontWeight: 800 }}>{currencySymbols[calculatorCurrency] || calculatorCurrency}{calculatorAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                      <SearchableOptionPicker value={calculatorCurrency} options={Object.keys(currencyRatesToNgn)} onChange={setCalculatorCurrency} label="Calculator currency" />
                    </div>
                    <div style={{ marginTop: '8px', color: '#64748b', fontSize: '0.76rem' }}>Approximate equivalent based on current currency conversion.</div>
                  </div>}
                  <div style={{ marginTop: '14px', padding: '13px 14px', border: '1px solid #dbeafe', borderRadius: '12px', background: '#eff6ff', color: '#1e3a8a', fontSize: '0.82rem', lineHeight: 1.6 }}>
                    <strong style={{ display: 'block', marginBottom: '5px' }}>How delivery works</strong>
                    {selectedProduct.isFree ? 'Enter your details and request the free product. We will email the file directly to you.' : 'After payment is confirmed, we email the file as an attachment to the address you provide.'} Open the email, download the attachment, and use your device PDF or ZIP app to open it.
                  </div>
                  <section style={{ marginTop: '16px', padding: '14px', border: '1px solid #dbe7df', borderRadius: '12px', background: '#fbfdfb' }} aria-labelledby="product-rating-title">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'baseline', flexWrap: 'wrap' }}>
                      <strong id="product-rating-title" style={{ color: '#166534' }}>Rate this product</strong>
                      <span style={{ color: '#64748b', fontSize: '0.78rem' }}>{productReviews.length} review{productReviews.length === 1 ? '' : 's'}</span>
                    </div>
                    <form onSubmit={submitProductRating} style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
                      <div role="radiogroup" aria-label="Product rating" style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button key={value} type="button" role="radio" aria-label={`${value} star${value === 1 ? '' : 's'}`} aria-checked={ratingForm.rating === value} onClick={() => setRatingForm((current) => ({ ...current, rating: value }))} style={{ border: 0, background: 'transparent', color: value <= ratingForm.rating ? '#f59e0b' : '#cbd5e1', fontSize: '1.55rem', lineHeight: 1, padding: '2px', cursor: 'pointer' }}>★</button>
                        ))}
                      </div>
                      <input required placeholder="Your name" value={ratingForm.reviewerName} onChange={(event) => setRatingForm((current) => ({ ...current, reviewerName: event.target.value }))} style={{ padding: '9px 10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                      <input type="email" placeholder="Email (optional)" value={ratingForm.reviewerEmail} onChange={(event) => setRatingForm((current) => ({ ...current, reviewerEmail: event.target.value }))} style={{ padding: '9px 10px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
                      <textarea placeholder="Share a short review (optional)" value={ratingForm.comment} onChange={(event) => setRatingForm((current) => ({ ...current, comment: event.target.value }))} rows="3" style={{ padding: '9px 10px', border: '1px solid #cbd5e1', borderRadius: '8px', resize: 'vertical', font: 'inherit' }} />
                      <button type="submit" disabled={ratingSubmitting} style={{ justifySelf: 'start', border: 0, borderRadius: '8px', padding: '10px 14px', background: ratingSubmitting ? '#cbd5e1' : '#166534', color: ratingSubmitting ? '#475569' : '#fff', fontWeight: 800, cursor: ratingSubmitting ? 'wait' : 'pointer' }}>{ratingSubmitting ? 'Saving rating...' : 'Submit rating'}</button>
                    </form>
                    {productReviews.length > 0 && (
                      <div
                        role="region"
                        aria-label="Product reviews"
                        tabIndex={0}
                        style={{ display: 'grid', gap: '8px', marginTop: '14px', maxHeight: isSmallScreen ? 'min(42vh, 360px)' : 'min(45vh, 480px)', overflowY: 'auto', overscrollBehaviorY: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', paddingRight: '6px' }}
                      >
                        {productReviews.map((review) => {
                          const postedAt = formatReviewTimestamp(review.created_at);
                          return (
                            <article key={review.id} style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                                <strong>{review.reviewer_name}</strong>
                                <span style={{ color: '#f59e0b' }}>{'★'.repeat(Number(review.rating || 0))}</span>
                              </div>
                              {review.comment && <p style={{ margin: '4px 0 0', color: '#475569', lineHeight: 1.45 }}>{review.comment}</p>}
                              {postedAt && <time dateTime={review.created_at} style={{ display: 'block', marginTop: '5px', color: '#64748b', fontSize: '0.72rem' }}>Posted {postedAt}</time>}
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>
              </div>

              <ProductChat key={selectedProduct.id} product={selectedProduct} />

              {!isProductPage && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => { setSelectedProduct(null); navigate(shopUrl); }} style={{ border: '1px solid #cbd5e1', borderRadius: '9px', padding: '11px 18px', background: '#fff', color: '#334155', fontWeight: 700, cursor: 'pointer', flex: isSmallScreen ? '1 1 120px' : '0 0 auto' }}>Close</button>
                  <button type="button" onClick={(event) => { addToCart(selectedProduct, event); setSelectedProduct(null); }} disabled={selectedProduct.inStock === false || Number(selectedProduct.stockCount || 0) <= 0} style={{ border: 'none', borderRadius: '9px', padding: '11px 18px', background: selectedProduct.inStock === false || Number(selectedProduct.stockCount || 0) <= 0 ? '#e5e7eb' : '#f97316', color: selectedProduct.inStock === false || Number(selectedProduct.stockCount || 0) <= 0 ? '#64748b' : '#fff', fontWeight: 800, cursor: 'pointer', flex: isSmallScreen ? '1 1 160px' : '0 0 auto' }}>{getProductAvailability(selectedProduct, availabilityNow).reason === 'not-released' ? 'Activate release alert' : selectedProduct.isFree ? 'Request product' : 'Add to cart'}</button>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedProduct && isProductPage && !cartOpen && !releaseNotificationProduct && (
          <div role="region" aria-label="Product quick actions" style={{ position: 'fixed', zIndex: 220, right: 0, bottom: 0, left: 0, padding: '10px 16px calc(10px + env(safe-area-inset-bottom))', borderTop: '1px solid #e2e8f0', background: 'rgba(255, 255, 255, 0.97)', boxShadow: '0 -8px 24px rgba(15, 23, 42, 0.1)', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', gap: '10px', width: 'min(980px, 100%)', margin: '0 auto' }}>
              <button type="button" onClick={() => { setSelectedProduct(null); navigate(shopUrl); }} style={{ flex: '0 1 220px', minHeight: '48px', padding: '11px 16px', border: '1px solid #f97316', borderRadius: '8px', background: '#fff7ed', color: '#c2410c', fontWeight: 800, cursor: 'pointer' }}>Shop more</button>
              <button type="button" onClick={() => checkoutProduct(selectedProduct)} disabled={selectedProductOutOfStock || (!selectedProductAvailability?.available && selectedProductAvailability?.reason !== 'not-released')} style={{ flex: 1, minHeight: '48px', padding: '11px 16px', border: 0, borderRadius: '8px', background: selectedProductOutOfStock || (!selectedProductAvailability?.available && selectedProductAvailability?.reason !== 'not-released') ? '#e5e7eb' : '#166534', color: selectedProductOutOfStock || (!selectedProductAvailability?.available && selectedProductAvailability?.reason !== 'not-released') ? '#64748b' : '#fff', fontWeight: 800, cursor: selectedProductOutOfStock || (!selectedProductAvailability?.available && selectedProductAvailability?.reason !== 'not-released') ? 'not-allowed' : 'pointer' }}>
                {selectedProductOutOfStock ? 'Out of stock' : selectedProductAvailability?.reason === 'not-released' ? 'Notify me' : 'Download'}
              </button>
            </div>
          </div>
        )}

        {/* Cart Sidebar (when cart is open) */}
        {cartOpen && (
          <>
            {/* Backdrop/Overlay */}
            <div
              onClick={() => setCartOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.18)',
                zIndex: 190,
                animation: 'fadeIn 0.2s ease-out'
              }}
            />
            <div data-cart-modal="true" style={{
              position: 'fixed',
              right: isSmallScreen ? 0 : 0,
              top: isSmallScreen ? 'auto' : '80px',
              bottom: isSmallScreen ? 0 : 0,
              left: isSmallScreen ? 0 : 'auto',
              width: isSmallScreen ? '100%' : '360px',
              maxWidth: isSmallScreen ? '100vw' : '360px',
              height: isSmallScreen ? '84vh' : 'calc(100vh - 80px)',
              background: '#fff',
              boxShadow: isSmallScreen ? '0 -10px 24px rgba(15, 23, 42, 0.15)' : '-2px 0 8px rgba(0,0,0,0.1)',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              animation: isSmallScreen ? 'slideIn 0.28s ease-out' : 'slideIn 0.3s ease-out',
              borderTopLeftRadius: isSmallScreen ? '18px' : '0',
              borderTopRightRadius: isSmallScreen ? '18px' : '0'
            }}>
              <canvas
                ref={fireworksCanvasRef}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 5
                }}
              />
              {/* Close Button with Arrow */}
              <div style={{ padding: isSmallScreen ? '12px 14px' : '16px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontWeight: 800 }}>P</div>
                  <h2 style={{ margin: 0, fontSize: isSmallScreen ? '16px' : '18px', fontWeight: 'bold' }}>Shopping Cart</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => setCartOpen(false)} 
                    style={{
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '999px',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#111'
                    }}
                  >
                    {isSmallScreen ? 'Continue' : 'Close'}
                  </button>
                  <button 
                    onClick={() => setCartOpen(false)} 
                    style={{ 
                      background: 'none', 
                      border: '2px solid #e0e0e0',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      color: '#333',
                      transition: 'all 0.2s',
                      hover: { background: '#f5f5f5' }
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    title="Close cart"
                  >
                    ×
                  </button>
                </div>
              </div>

              {cart.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', padding: '8px 14px', borderBottom: '1px solid #e0e0e0', background: '#fffafa' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setCartOpen(false);
                      setSelectedProduct(null);
                      navigate(shopUrl);
                    }}
                    title="Shop more products"
                    style={{ flex: 1, background: '#fff7ed', border: '1px solid #fdba74', borderRadius: '8px', padding: '9px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 800, color: '#c2410c' }}
                  >
                    Shop more
                  </button>
                  <button
                    type="button"
                    onClick={clearCart}
                    title="Clear all cart items"
                    aria-label="Clear all cart items"
                    style={{ flex: 1, background: '#fff1f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '9px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 800, color: '#991b1b' }}
                  >
                    <i className="fa-solid fa-trash-can" aria-hidden="true" /> Clear all cart items
                  </button>
                </div>
              )}

            <div style={{ flex: 1, overflowY: 'auto', padding: isSmallScreen ? '12px 14px' : '16px' }}>
              {cart.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', marginTop: '40px' }}>Your cart is empty</p>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                        <ProductCover product={item} style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 'bold' }}>{item.title}</h4>
                          <div style={{ color: '#666', fontSize: '12px' }}>Qty: {item.quantity}</div>
                          <div style={{ fontWeight: 'bold', color: '#111' }}>{item.isFree ? 'Free' : money(Number(item.price || 0) * item.quantity, item.currency || cartCurrency)}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => updateQty(item.id, -1)} style={{ padding: '4px 8px', border: '1px solid #d5d9d9', background: '#fff', cursor: 'pointer', borderRadius: '4px' }}>-</button>
                        <button onClick={() => updateQty(item.id, 1)} style={{ padding: '4px 8px', border: '1px solid #d5d9d9', background: '#fff', cursor: 'pointer', borderRadius: '4px' }}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && checkoutStage === 'details' && (
              <div style={{ borderTop: '1px solid #e0e0e0', padding: isSmallScreen ? '12px 14px 16px' : '16px', overflowY: 'auto', maxHeight: '60vh' }}>
                <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', fontSize: isSmallScreen ? '15px' : '16px', fontWeight: 'bold' }}>
                  <span>Subtotal:</span>
                  <span>{money(subtotal, cartCurrency)}</span>
                </div>
                {cartUnavailableItems.length > 0 && <div role="alert" style={{ display: 'grid', gap: '5px', marginBottom: '12px', padding: '10px 12px', border: '1px solid #fed7aa', borderRadius: '8px', background: '#fff7ed', color: '#9a3412', fontSize: '.82rem', lineHeight: 1.45 }}>{cartUnavailableItems.map((item) => <div key={item.id}><strong>{item.title}:</strong> {getProductAvailability(item, availabilityNow).message}{getProductAvailability(item, availabilityNow).reason === 'not-released' && <button type="button" onClick={() => { setReleaseNotificationProduct(item); setReleaseNotificationError(''); }} style={{ display: 'block', marginTop: '6px', padding: '6px 9px', border: '1px solid #166534', borderRadius: '6px', background: '#fff', color: '#166534', fontWeight: 700, cursor: 'pointer' }}>Activate availability email</button>}</div>)}</div>}

                <form onSubmit={handleCheckout} style={{ display: 'grid', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={checkoutForm.name}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                    required
                    style={{ padding: '10px 12px', border: '1px solid #d5d9d9', borderRadius: '8px', fontSize: '14px' }}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={checkoutForm.email}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                    required
                    style={{ padding: '10px 12px', border: '1px solid #d5d9d9', borderRadius: '8px', fontSize: '14px' }}
                  />
                  <div className="checkout-phone-fields">
                    <SearchableOptionPicker value={checkoutForm.countryCode} options={phoneCountries.map((country) => `${country.code} (${country.dialCode})`)} onChange={(value) => setCheckoutForm({ ...checkoutForm, countryCode: value.split(' ')[0], phoneNumber: '' })} label="Country" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder={checkoutForm.countryCode === 'NG' ? 'Phone number (11 digits)' : 'Phone number'}
                      value={checkoutForm.phoneNumber}
                      onChange={(e) => {
                        const maxDigits = checkoutForm.countryCode === 'NG' ? 11 : 15;
                        setCheckoutForm({ ...checkoutForm, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, maxDigits) });
                      }}
                      required
                      maxLength={checkoutForm.countryCode === 'NG' ? 11 : 15}
                      aria-label="National phone number"
                      style={{ padding: '10px 12px', border: '1px solid #d5d9d9', borderRadius: '8px', fontSize: '14px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', color: '#334155', fontSize: '12px' }}>
                    <i className="fa-solid fa-lock" aria-hidden="true" />
                    <span>{cartIsFree ? 'Free delivery by email' : paystackReady ? 'Secure payment by Paystack' : 'Loading secure Paystack checkout...'}</span>
                  </div>

                  <button
                    type="submit"
                    disabled={paymentLoading || (!cartIsFree && !paystackReady) || cartUnavailableItems.length > 0}
                    aria-busy={paymentLoading}
                    style={{
                      background: paymentLoading || (!cartIsFree && !paystackReady) || cartUnavailableItems.length > 0 ? '#d1d5db' : 'linear-gradient(135deg, #FF9900, #FF8A00)',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      fontWeight: '800',
                      cursor: cartUnavailableItems.length > 0 ? 'not-allowed' : paymentLoading || (!cartIsFree && !paystackReady) ? 'wait' : 'pointer',
                      color: paymentLoading || (!cartIsFree && !paystackReady) || cartUnavailableItems.length > 0 ? '#6b7280' : '#111',
                      fontSize: '14px',
                      marginTop: '6px',
                      boxShadow: '0 10px 18px rgba(255, 153, 0, 0.24)'
                    }}
                  >
                    <i className={`fa-solid ${paymentLoading || (!cartIsFree && !paystackReady) ? 'fa-spinner fa-spin' : cartUnavailableItems.length > 0 ? 'fa-circle-exclamation' : cartIsFree ? 'fa-envelope' : 'fa-lock'}`} aria-hidden="true" />
                    {paymentLoading ? (cartIsFree ? 'Sending free product...' : 'Opening secure payment...') : cartUnavailableItems.length > 0 ? 'Unavailable product in cart' : cartIsFree ? 'Request free product' : paystackReady ? 'Pay with Paystack' : 'Loading Paystack...'}
                  </button>
                </form>
              </div>
            )}

            {checkoutStage === 'success' && submittedOrder && (
              <div style={{ borderTop: '1px solid #e0e0e0', padding: '16px', overflowY: 'auto', maxHeight: '70vh' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px' }}>✓</span>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#065f46' }}>Order Confirmed</h3>
                </div>

                <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#065f46' }}>
                  Thank you, <strong>{submittedOrder.name}</strong>. Your order number is <strong>{submittedOrder.orderNumber}</strong>.
                </p>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                  <strong style={{ display: 'block', marginBottom: '8px', color: '#065f46' }}>📦 Order Summary</strong>
                  {submittedOrder.items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', paddingBottom: '6px', marginBottom: '6px', borderBottom: '1px solid #d1fae5', fontSize: '12px' }}>
                      <span>{item.title} x {item.quantity}</span>
                      <span style={{ fontWeight: '600' }}>{item.isFree ? 'Free' : money(Number(item.price || 0) * item.quantity, item.currency || submittedOrder.currency || 'NGN')}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', marginTop: '8px', color: '#065f46' }}>
                    <span>Total:</span>
                    <span>{money(submittedOrder.total, submittedOrder.currency || 'NGN')}</span>
                  </div>
                </div>

                {false && <div style={{ marginBottom: '12px', border: '1px dashed #86efac', borderRadius: '8px', padding: '12px', background: '#f0fdf4' }}>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#065f46', fontSize: '13px' }}>
                    📷 Upload Payment Proof
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setPaymentProofFile(file || null);

                      if (!file) {
                        setPaymentProof(null);
                        return;
                      }

                      const reader = new FileReader();
                      reader.onload = () => {
                        const result = typeof reader.result === 'string' ? reader.result : null;
                        setPaymentProof(result);
                      };
                      reader.readAsDataURL(file);
                    }}
                    style={{
                      padding: '8px 12px',
                      border: '2px dashed #d5d9d9',
                      borderRadius: '4px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      background: '#fafafa',
                      width: '100%'
                    }}
                  />
                  {paymentProofFile && (
                    <div style={{ marginTop: '8px', padding: '8px', background: '#dcfce7', borderRadius: '4px', fontSize: '12px', color: '#166534' }}>
                      ✓ {paymentProofFile.name}
                    </div>
                  )}
                  {paymentProof && paymentProofFile && paymentProofFile.type.startsWith('image') && (
                    <img src={paymentProof} alt="Payment proof preview" style={{ marginTop: '8px', maxWidth: '100%', borderRadius: '4px', maxHeight: '100px' }} />
                  )}
                  {paymentProof && paymentProofFile && (
                    <button
                      type="button"
                      onClick={() => savePaymentProofToSupabase(submittedOrder)}
                      disabled={paymentProofSaving}
                      style={{
                        width: '100%',
                        marginTop: '12px',
                        background: paymentProofSaving ? '#e5e7eb' : '#16a34a',
                        color: paymentProofSaving ? '#4b5563' : '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        fontWeight: '700',
                        cursor: paymentProofSaving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {paymentProofSaving ? 'Saving proof...' : 'Save proof image'}
                    </button>
                  )}
                </div>}

                <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#92400e' }}>
                  <strong style={{ display: 'block', marginBottom: '6px' }}>📧 File delivery</strong>
                  Your product files have been sent to <strong>{submittedOrder.email}</strong>. Check your inbox and spam folder, open the delivery email, then download and open the attached PDF or ZIP file on your device.
                </div>

                <OrderSuccessActions onShopMore={handleShopMoreAfterOrder} />

                <button
                  type="button"
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutStage('details');
                    setPaymentProof(null);
                    setPaymentProofFile(null);
                  }}
                  style={{
                    width: '100%',
                    marginTop: '14px',
                    background: '#FF9900',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '10px 12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    color: '#111',
                    fontSize: '14px'
                  }}
                >
                  Close
                </button>
              </div>
            )}
            </div>
          </>
        )}

        {releaseNotificationProduct && (
          <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReleaseNotificationProduct(null); }} style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'grid', placeItems: 'center', padding: '16px', background: 'rgba(17, 24, 39, 0.58)' }}>
            <section role="dialog" aria-modal="true" aria-labelledby="release-notification-title" style={{ width: 'min(460px, 100%)', maxHeight: 'calc(100vh - 32px)', overflowY: 'auto', padding: isSmallScreen ? '22px 18px' : '28px', borderRadius: '10px', background: '#fff', boxShadow: '0 24px 70px rgba(0,0,0,.24)' }}>
              <button type="button" aria-label="Close" onClick={() => setReleaseNotificationProduct(null)} style={{ float: 'right', border: 0, background: 'transparent', color: '#475569', fontSize: '22px', cursor: 'pointer' }}>×</button>
              <p style={{ margin: '0 0 7px', color: '#166534', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Release notification</p>
              <h2 id="release-notification-title" style={{ margin: '0 28px 8px 0', color: '#17211b', fontSize: '22px', lineHeight: 1.2 }}>{releaseNotificationProduct.title}</h2>
              <p style={{ margin: '0 0 18px', color: '#475569', fontSize: '14px', lineHeight: 1.5 }}>{getProductAvailability(releaseNotificationProduct, availabilityNow).message} Get an email when checkout opens.</p>
              <form onSubmit={submitReleaseNotification} style={{ display: 'grid', gap: '11px' }}>
                <input required autoComplete="name" placeholder="Full name" value={checkoutForm.name} onChange={(event) => setCheckoutForm((current) => ({ ...current, name: event.target.value }))} style={{ minWidth: 0, padding: '11px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', font: 'inherit' }} />
                <input required type="email" autoComplete="email" placeholder="Email address" value={checkoutForm.email} onChange={(event) => setCheckoutForm((current) => ({ ...current, email: event.target.value }))} style={{ minWidth: 0, padding: '11px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', font: 'inherit' }} />
                <input type="tel" autoComplete="tel-national" placeholder={`Phone (optional, ${phoneCountries.find((item) => item.code === checkoutForm.countryCode)?.dialCode || ''})`} value={checkoutForm.phoneNumber} onChange={(event) => setCheckoutForm((current) => ({ ...current, phoneNumber: event.target.value }))} style={{ minWidth: 0, padding: '11px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', font: 'inherit' }} />
                {releaseNotificationError && <p role="alert" style={{ margin: 0, color: '#b42318', fontSize: '13px', lineHeight: 1.4 }}>{releaseNotificationError}</p>}
                <div style={{ display: 'flex', gap: '9px', marginTop: '3px' }}>
                  <button type="button" onClick={() => setReleaseNotificationProduct(null)} style={{ flex: 1, padding: '11px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', color: '#334155', fontWeight: 700, cursor: 'pointer' }}>Not now</button>
                  <button type="submit" disabled={releaseNotificationSubmitting} style={{ flex: 1.4, padding: '11px 12px', border: 0, borderRadius: '6px', background: releaseNotificationSubmitting ? '#94a3b8' : '#166534', color: '#fff', fontWeight: 800, cursor: releaseNotificationSubmitting ? 'wait' : 'pointer' }}>{releaseNotificationSubmitting ? 'Activating...' : 'Activate notification'}</button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: toast.type === 'success' ? '#10b981' : '#ef4444',
            color: '#fff',
            padding: '14px 20px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '14px',
            fontWeight: '600',
            zIndex: 300,
            animation: 'slideInToast 0.3s ease-out, slideOutToast 0.3s ease-out 2.7s forwards',
            maxWidth: '300px'
          }}>
            {toast.message}
          </div>
        )}

        {cartFlights.map((flight) => (
          <div
            key={flight.id}
            aria-hidden="true"
            style={{
              position: 'fixed',
              left: `${flight.x ?? flight.startX}px`,
              top: `${flight.y ?? flight.startY}px`,
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #fff7ed 0%, #ffca70 100%)',
              border: '1px solid rgba(17,17,17,0.08)',
              boxShadow: '0 14px 28px rgba(0,0,0,0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: '#111',
              pointerEvents: 'none',
              zIndex: 320,
              transform: `translate(-50%, -50%) scale(${flight.scale ?? 1})`,
              opacity: flight.opacity ?? 1
            }}
          >
            <ProductCover product={flight.product} style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }} />
          </div>
        ))}

        {cartReminderVisible && (
          <div
            onClick={() => {
              setCartOpen(true);
              setCartReminderVisible(false);
            }}
            style={{
              position: 'fixed',
              right: cartOpen ? '392px' : '68px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 310,
              background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
              color: '#7c2d12',
              border: '1px solid #fdba74',
              borderRadius: '12px',
              boxShadow: '0 10px 20px rgba(0,0,0,0.12)',
              padding: '10px 14px',
              maxWidth: '260px',
              cursor: 'pointer',
              animation: 'cartReminderFloat 1.6s ease-in-out infinite'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: '700' }}>
              <span style={{ fontSize: '18px' }}>🛒</span>
              <span>You still have items waiting to be checked out.</span>
            </div>
            <div style={{ marginTop: '6px', fontSize: '11px', color: '#9a4d1d' }}>Tap to continue checkout</div>
          </div>
        )}

        {/* Success Message */}
        {!cartOpen && submittedOrder && (
          <div style={{
            marginTop: '20px',
            background: '#ecfdf5',
            border: '2px solid #6ee7b7',
            borderRadius: '8px',
            padding: '20px',
            color: '#065f46'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px' }}>✓</span>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Order Confirmed!</h2>
            </div>

            <p style={{ margin: '0 0 12px' }}>
              Thank you for your order, <strong>{submittedOrder.name}</strong>. Your order number is <strong>{submittedOrder.orderNumber}</strong>.
            </p>

            <div style={{
              background: '#fff',
              border: '1px solid #6ee7b7',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '12px',
              fontSize: '13px'
            }}>
              <strong style={{ color: '#065f46', display: 'block', marginBottom: '8px' }}>📦 Order Items:</strong>
              <div style={{ display: 'grid', gap: '4px' }}>
                {submittedOrder.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0', paddingBottom: '4px' }}>
                    <span>{item.title} x {item.quantity}</span>
                      <span style={{ fontWeight: '600' }}>{item.isFree ? 'Free' : money(Number(item.price || 0) * item.quantity, item.currency || submittedOrder.currency || 'NGN')}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', marginTop: '8px', paddingTop: '8px', borderTop: '2px solid #6ee7b7' }}>
                  <span>Total Amount:</span>
                    <span>{money(submittedOrder.total, submittedOrder.currency || 'NGN')}</span>
                </div>
              </div>
            </div>

            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '4px',
              padding: '12px',
              fontSize: '12px',
              marginBottom: '12px'
            }}>
              <strong style={{ color: '#047857' }}>📧 File delivery:</strong>
              <p style={{ margin: '8px 0 0', color: '#047857' }}>
                Your product files have been sent to <strong>{submittedOrder.email}</strong>. Check your inbox and spam folder, open the delivery email, then download and open the attached PDF or ZIP file on your device.
              </p>
            </div>

            <p style={{ margin: 0, fontSize: '12px', color: '#047857' }}>
              📌 Please save your order number <strong>{submittedOrder.orderNumber}</strong> for your records.
            </p>

            <OrderSuccessActions onShopMore={handleShopMoreAfterOrder} />
          </div>
        )}
      </div>

      <style>{`
        .checkout-phone-fields {
          display: grid;
          grid-template-columns: minmax(82px, 0.55fr) minmax(0, 1.45fr);
          gap: 8px;
          width: 100%;
        }
        @media (max-width: 420px) {
          .checkout-phone-fields {
            grid-template-columns: minmax(74px, 0.45fr) minmax(0, 1.55fr);
          }
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInToast {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutToast {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        @keyframes cartBadgePulse {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.25);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes cartReminderFloat {
          0%, 100% {
            transform: translateY(0px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.12);
          }
          50% {
            transform: translateY(-3px);
            box-shadow: 0 14px 24px rgba(0,0,0,0.16);
          }
        }
      `}</style>
    </div>
  );
}

const fieldStyle = {
  width: '100%',
  border: '1px solid #d1d5db',
  borderRadius: '12px',
  padding: '12px 14px',
  fontSize: '1rem',
  background: '#f9fafb',
  fontFamily: 'inherit'
};
