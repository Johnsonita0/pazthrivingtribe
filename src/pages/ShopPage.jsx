import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { getCountries, getCountryCallingCode, isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js';
import { supabase } from '../supabaseClient';

const defaultBankAccount = {
  bankName: 'Access Bank',
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

const money = (value) => new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0
}).format(Number(value || 0));

const productPriceLabel = (product) => product.isFree ? 'Free' : `${currencySymbols[product.currency || 'NGN'] || ''}${Number(product.price || 0).toLocaleString()}`;

const productSlug = (product) => encodeURIComponent(String(product?.title || product?.id || 'product').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));

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
  currency: product.currency || 'NGN',
  isFree: Boolean(product.is_free ?? product.isFree ?? false),
  category: product.category || 'Ebook',
  cover: product.cover || product.cover_url || product.cover_image || product.image || product.image_url || product.imageUrl || '/logo/logomain.png',
  fileUrl: product.file_url || product.fileUrl || '',
  inStock: product.in_stock ?? product.inStock ?? true,
  stockCount: Number(product.stock_count ?? product.stockCount ?? 0),
  rating: Number(product.rating ?? 0),
  reviews: Number(product.reviews ?? 0),
  prime: Boolean(product.prime ?? false),
  createdAt: product.created_at || product.createdAt || null
});

const productCoverUrl = (product) => {
  const cover = String(product?.cover || product?.cover_url || product?.cover_image || product?.image || product?.image_url || product?.imageUrl || '').trim();
  if (!cover) return '/logo/logomain.png';
  if (/^(https?:|data:|blob:)/i.test(cover)) return cover;
  const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  if (cover.startsWith('/storage/v1/object/public/')) return `${supabaseUrl}${cover}`;
  const storagePath = cover.replace(/^\/+/, '');
  if (supabaseUrl && storagePath.startsWith('products/')) {
    return `${supabaseUrl}/storage/v1/object/public/prof-upload/${storagePath.split('/').map(encodeURIComponent).join('/')}`;
  }
  return `/${cover.replace(/^\/+/, '')}`;
};

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

export default function ShopPage({ onOrderSubmitted, paystackPublicKey = '', storeProducts, storeBankAccount }) {
  const navigate = useNavigate();
  const { productName } = useParams();
  const [searchParams] = useSearchParams();
  const sharedProductSlug = searchParams.get('product');
  const resolvedProductName = productName || sharedProductSlug;
  const isProductPage = Boolean(resolvedProductName);
  const [storeData, setStoreData] = useState(readStoreData);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevant');
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
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
  const productNgnPrice = (product) => product.isFree ? 0 : Number(product.price || 0) * (currencyRatesToNgn[product.currency || 'NGN'] || 1);
  const calculatorRate = currencyRatesToNgn[calculatorCurrency] || 1;
  const calculatorAmount = selectedProduct?.isFree ? 0 : selectedProduct ? productNgnPrice(selectedProduct) / calculatorRate : 0;

  useEffect(() => {
    if (!resolvedProductName || !storeData.products?.length) return;
    const requestedSlug = decodeURIComponent(resolvedProductName).trim().toLowerCase();
    const product = storeData.products.map(normalizeProduct).find((item) => productSlug(item).toLowerCase() === requestedSlug || String(item.id).trim().toLowerCase() === requestedSlug);
    if (product) {
      const frame = window.requestAnimationFrame(() => {
        setSelectedProduct(product);
        setCalculatorCurrency(product.currency || 'NGN');
      });
      return () => window.cancelAnimationFrame(frame);
    }
    return undefined;
  }, [resolvedProductName, storeData.products]);

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
      products: storeProducts.map(normalizeProduct),
      bankAccount: storeBankAccount || current.bankAccount
    }));
    setCart((current) => current.filter((item) => storeProducts.some((product) => product.id === item.id)));
  }, [storeProducts, storeBankAccount]);

  useEffect(() => {
    let active = true;

    const loadLatestProducts = async () => {
      const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!active || error || !Array.isArray(data) || data.length === 0) return;

      const latestProducts = data.map(normalizeProduct);
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
      const verySmall = window.innerWidth <= 360;
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

  const categories = ['All', ...new Set((storeData.products || []).map((product) => product.category))];

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
    : filteredBySearch.filter((product) => product.category === selectedCategory);

  const allVisibleProducts = filteredByCategory.filter((product) => {
    const inPriceRange = productNgnPrice(product) >= priceRange[0] && productNgnPrice(product) <= priceRange[1];
    const hasMinRating = (product.rating || 0) >= minRating;
    return inPriceRange && hasMinRating;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
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
    if (product.inStock === false || Number(product.stockCount || 0) <= 0) {
      setToast({ message: `${product.title} is currently out of stock.`, type: 'error' });
      setTimeout(() => setToast(null), 3000);
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
    if (product.inStock === false || Number(product.stockCount || 0) <= 0) return;
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing
        ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, quantity: 1 }];
    });
    setSelectedProduct(null);
    setCartOpen(true);
    navigate('/shop');
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

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + productNgnPrice(item) * Number(item.quantity || 0), 0),
    [cart]
  );
  const cartIsFree = cart.length > 0 && cart.every((item) => item.isFree);

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
        price: productNgnPrice(item),
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

  const handleCheckout = async (event) => {
    event.preventDefault();
    const customerEmail = checkoutForm.email.trim().toLowerCase();
    const selectedCountry = phoneCountries.find((country) => country.code === checkoutForm.countryCode) || phoneCountries[0];
    const localDigits = checkoutForm.phoneNumber.replace(/\D/g, '');
    const parsedPhone = parsePhoneNumberFromString(localDigits, selectedCountry.code);
    const internationalPhone = parsedPhone?.number || '';
    if (!cart.length || paymentLoading) return;
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
        currency: 'NGN',
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

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#1b1b1b', fontFamily: "'Amazon Ember', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
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
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 14px' }}>
          {/* Top row: Logo and Search */}
          <div style={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '72px 1fr 64px' : '100px 1fr 120px', gap: isSmallScreen ? '8px' : '16px', alignItems: 'center' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <img src="/logo/logomain.png" alt="Paz" style={{ width: '40px', height: '40px', borderRadius: '6px' }} />
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Paz</div>
            </div>

            {/* Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '4px', overflow: 'hidden' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Paz products..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '10px 14px',
                  fontSize: '14px',
                  color: '#111'
                }}
              />
              <button style={{
                background: '#FF9900',
                border: 'none',
                padding: '8px 14px',
                cursor: 'pointer',
                color: '#111',
                fontWeight: 'bold'
              }}>
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>

            {/* Cart Icon */}
            <div style={{ position: 'relative', cursor: 'pointer', textAlign: 'right' }} onClick={() => setCartOpen(!cartOpen)}>
              <i className="fa-solid fa-cart-shopping" style={{ fontSize: '24px', marginRight: '8px' }}></i>
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '0px',
                background: '#FF9900',
                color: '#111',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {cart.reduce((count, item) => count + item.quantity, 0)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: isProductPage ? 'contents' : 'block', maxWidth: '1400px', margin: '0 auto', padding: isSmallScreen ? '16px 14px 50px' : '20px 14px 50px', paddingLeft: isSmallScreen ? '14px' : '268px' }}>
        <div style={{ display: isProductPage ? 'none' : 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          {!isSmallScreen && (
            <aside style={{ 
              background: '#fff', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              padding: '16px',
              position: 'fixed',
              left: '14px',
              top: '220px',
              width: '220px',
              height: 'calc(100vh - 240px)',
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
                <i className="fa-solid fa-bars" />
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
              left: categoryDrawerOpen ? 0 : '-100vw',
              top: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '100vw',
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
              borderBottomRightRadius: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontWeight: 800 }}>F</div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111' }}>Filters</h3>
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
                          setCategoryDrawerOpen(false);
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
                          setCategoryDrawerOpen(false);
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
                          setCategoryDrawerOpen(false);
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
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Showing <strong>{allVisibleProducts.length === 0 ? 0 : startIndex + 1}</strong>-<strong>{Math.min(startIndex + productsPerPage, allVisibleProducts.length)}</strong> of <strong>{allVisibleProducts.length}</strong> results
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  Sort by:
                  <SearchableOptionPicker value={sortBy} options={['relevant', 'price-low', 'price-high', 'rating', 'newest']} onChange={setSortBy} label="Sort products" />
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
                gridTemplateColumns: isSmallScreen ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: isSmallScreen ? (isVerySmallScreen ? '8px' : '12px') : '16px',
                alignItems: 'stretch',
                justifyItems: 'stretch',
                width: '100%',
                maxWidth: '100%',
                minWidth: 0
              }}>
                {visibleProducts.map((product) => (
                  <div key={product.id} onClick={() => {
                    navigate(`/shop/${productSlug(product)}`);
                    setSelectedProduct(product);
                    setCalculatorCurrency(product.currency || 'NGN');
                  }} style={{
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
                      <img src={productCoverUrl(product)} alt={product.title} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/logo/logomain.png'; }} style={{
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

                      {/* Rating - Compact */}
                      <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <div style={{ display: 'flex', color: '#FDB913', fontSize: '11px', letterSpacing: '-1px' }}>
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>
                              {i < Math.floor(product.rating) ? '★' : i < product.rating ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                        <span style={{ fontSize: '11px', color: '#666' }}>({product.reviews})</span>
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
                      <i className="fa-solid fa-cart-plus" style={{ fontSize: '14px' }}></i>
                      <span>{product.inStock === false || Number(product.stockCount || 0) <= 0 ? 'Sold out' : 'Add to Cart'}</span>
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
              <button type="button" onClick={() => navigate('/shop')} style={{ border: 'none', borderRadius: '9px', padding: '11px 18px', background: '#166534', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Return to shop</button>
            </section>
          </main>
        )}

        {selectedProduct && (
          <div
            role="presentation"
            onClick={() => { setSelectedProduct(null); navigate('/shop'); }}
            style={isProductPage ? { position: 'relative', zIndex: 1, display: 'block', padding: isSmallScreen ? '24px 12px 48px' : '36px 20px 64px', background: '#f8fafc' } : { position: 'fixed', inset: 0, zIndex: 260, display: 'grid', placeItems: 'start center', padding: isSmallScreen ? '78px 12px 12px' : '88px 20px 16px', background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)', overflow: 'hidden' }}
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
                <button type="button" onClick={() => { setSelectedProduct(null); navigate('/shop'); }} aria-label={isProductPage ? 'Return to shop' : 'Close product details'} style={{ width: '34px', height: '34px', border: '1px solid #d1d5db', borderRadius: '50%', background: '#fff', color: '#334155', fontSize: '1.2rem', cursor: 'pointer', flexShrink: 0 }}>{isProductPage ? '←' : '×'}</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : '140px minmax(0, 1fr)', gap: isSmallScreen ? '8px' : '16px', alignItems: 'start' }}>
                <div style={{ width: '100%', maxWidth: isSmallScreen ? '140px' : 'none', justifySelf: isSmallScreen ? 'center' : 'stretch' }}>
                  <img src={productCoverUrl(selectedProduct)} alt={selectedProduct.title} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/logo/logomain.png'; }} style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)' }} />
                  <div style={{ display: 'grid', gap: '4px', marginTop: '8px', padding: '9px 10px', borderRadius: '11px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', lineHeight: 1.35 }}>
                    <span><strong style={{ color: '#334155' }}>Category:</strong> {selectedProduct.category || 'Product'}</span>
                    <span><strong style={{ color: '#334155' }}>Delivery:</strong> Email attachment</span>
                    <span><strong style={{ color: '#334155' }}>Status:</strong> {selectedProduct.inStock === false || Number(selectedProduct.stockCount || 0) <= 0 ? 'Out of stock' : 'Available'}</span>
                  </div>
                </div>
                <div>
                  <p style={{ margin: '0 0 10px', color: '#475569', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{selectedProduct.description || 'No description provided yet.'}</p>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <strong style={{ color: selectedProduct.isFree ? '#15803d' : '#b12704', fontSize: '1.35rem' }}>{productPriceLabel(selectedProduct)}</strong>
                    <span style={{ color: '#64748b', fontSize: '0.82rem' }}>{selectedProduct.isFree ? 'Free email delivery' : 'Digital product'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px', color: '#64748b', fontSize: '0.8rem' }}>
                    <span>{'★'.repeat(Math.round(selectedProduct.rating || 0)) || 'No rating'}{selectedProduct.reviews ? ` (${selectedProduct.reviews} reviews)` : ''}</span>
                    <span>{selectedProduct.inStock === false || Number(selectedProduct.stockCount || 0) <= 0 ? 'Out of stock' : `${selectedProduct.stockCount} available`}</span>
                  </div>

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
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                {!isProductPage && <button type="button" onClick={() => { setSelectedProduct(null); navigate('/shop'); }} style={{ border: '1px solid #cbd5e1', borderRadius: '9px', padding: '11px 18px', background: '#fff', color: '#334155', fontWeight: 700, cursor: 'pointer', flex: isSmallScreen ? '1 1 120px' : '0 0 auto' }}>Close</button>}
                {isProductPage && <button type="button" onClick={() => { setSelectedProduct(null); navigate('/shop'); }} style={{ border: '1px solid #f97316', borderRadius: '9px', padding: '11px 18px', background: '#fff7ed', color: '#c2410c', fontWeight: 800, cursor: 'pointer', flex: isSmallScreen ? '1 1 120px' : '0 0 auto' }}>Shop more</button>}
                {!isProductPage && <button type="button" onClick={(event) => { addToCart(selectedProduct, event); setSelectedProduct(null); }} disabled={selectedProduct.inStock === false || Number(selectedProduct.stockCount || 0) <= 0} style={{ border: 'none', borderRadius: '9px', padding: '11px 18px', background: selectedProduct.inStock === false || Number(selectedProduct.stockCount || 0) <= 0 ? '#e5e7eb' : '#f97316', color: selectedProduct.inStock === false || Number(selectedProduct.stockCount || 0) <= 0 ? '#64748b' : '#fff', fontWeight: 800, cursor: 'pointer', flex: isSmallScreen ? '1 1 160px' : '0 0 auto' }}>{selectedProduct.isFree ? 'Request product' : 'Add to cart'}</button>}
                {isProductPage && <button type="button" onClick={() => checkoutProduct(selectedProduct)} disabled={selectedProduct.inStock === false || Number(selectedProduct.stockCount || 0) <= 0} style={{ border: 'none', borderRadius: '9px', padding: '11px 18px', background: selectedProduct.inStock === false || Number(selectedProduct.stockCount || 0) <= 0 ? '#e5e7eb' : '#166534', color: selectedProduct.inStock === false || Number(selectedProduct.stockCount || 0) <= 0 ? '#64748b' : '#fff', fontWeight: 800, cursor: 'pointer', flex: isSmallScreen ? '1 1 160px' : '0 0 auto' }}><i className="fa-solid fa-lock" aria-hidden="true" /> Checkout</button>}
              </div>
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
              top: isSmallScreen ? 'auto' : 0,
              bottom: isSmallScreen ? 0 : 0,
              left: isSmallScreen ? 0 : 'auto',
              width: isSmallScreen ? '100%' : '360px',
              maxWidth: isSmallScreen ? '100vw' : '360px',
              height: isSmallScreen ? '84vh' : '100vh',
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
                <div style={{ padding: '8px 14px', borderBottom: '1px solid #e0e0e0', background: '#fffafa' }}>
                  <button
                    type="button"
                    onClick={clearCart}
                    title="Clear all cart items"
                    aria-label="Clear all cart items"
                    style={{ width: '100%', background: '#fff1f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '9px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 800, color: '#991b1b' }}
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
                        <img src={productCoverUrl(item)} alt={item.title} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/logo/logomain.png'; }} style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 'bold' }}>{item.title}</h4>
                          <div style={{ color: '#666', fontSize: '12px' }}>Qty: {item.quantity}</div>
                          <div style={{ fontWeight: 'bold', color: '#111' }}>{item.isFree ? 'Free' : money(productNgnPrice(item) * item.quantity)}</div>
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
                  <span>{money(subtotal)}</span>
                </div>

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
                    disabled={paymentLoading || (!cartIsFree && !paystackReady)}
                    aria-busy={paymentLoading}
                    style={{
                      background: paymentLoading || (!cartIsFree && !paystackReady) ? '#d1d5db' : 'linear-gradient(135deg, #FF9900, #FF8A00)',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      fontWeight: '800',
                      cursor: paymentLoading || (!cartIsFree && !paystackReady) ? 'wait' : 'pointer',
                      color: paymentLoading || (!cartIsFree && !paystackReady) ? '#6b7280' : '#111',
                      fontSize: '14px',
                      marginTop: '6px',
                      boxShadow: '0 10px 18px rgba(255, 153, 0, 0.24)'
                    }}
                  >
                    <i className={`fa-solid ${paymentLoading || (!cartIsFree && !paystackReady) ? 'fa-spinner fa-spin' : cartIsFree ? 'fa-envelope' : 'fa-lock'}`} aria-hidden="true" />
                    {paymentLoading ? (cartIsFree ? 'Sending free product...' : 'Opening secure payment...') : cartIsFree ? 'Request free product' : paystackReady ? 'Pay with Paystack' : 'Loading Paystack...'}
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
                      <span style={{ fontWeight: '600' }}>{item.isFree ? 'Free' : money(productNgnPrice(item) * item.quantity)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', marginTop: '8px', color: '#065f46' }}>
                    <span>Total:</span>
                    <span>{money(submittedOrder.total)}</span>
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
            <img
              src={productCoverUrl(flight.product)}
              onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/logo/logomain.png'; }}
              alt=""
              style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }}
            />
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
                    <span style={{ fontWeight: '600' }}>{item.isFree ? 'Free' : money(productNgnPrice(item) * item.quantity)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', marginTop: '8px', paddingTop: '8px', borderTop: '2px solid #6ee7b7' }}>
                  <span>Total Amount:</span>
                  <span>{money(submittedOrder.total)}</span>
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

