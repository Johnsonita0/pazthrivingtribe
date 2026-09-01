import React, { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';

const defaultBankAccount = {
  bankName: 'Access Bank',
  accountName: 'Paz Thriving Tribe',
  accountNumber: '0012345678',
  accountType: 'Savings',
  swiftCode: 'ABNGNGLA',
  note: 'Please include your order name and email in the transfer narration.'
};

const defaultProducts = [
  {
    id: 'ebook-confidence',
    title: 'Confidence for Teens - Complete Digital Guide',
    description: 'A step-by-step digital guide to help young people build confidence, healthy habits, and emotional resilience.',
    price: 5500,
    category: 'Ebook',
    cover: '/logo/logomain.png',
    fileUrl: 'https://example.com/files/confidence-for-teens.pdf',
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
    fileUrl: 'https://example.com/files/thriving-parent-guide.pdf',
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
    fileUrl: 'https://example.com/files/purpose-planner-workbook.pdf',
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
    fileUrl: 'https://example.com/files/wellness-journey.pdf',
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
    fileUrl: 'https://example.com/files/leadership-manual.pdf',
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
    fileUrl: 'https://example.com/files/academic-workbook.pdf',
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
    fileUrl: 'https://example.com/files/emotional-intelligence.pdf',
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
    fileUrl: 'https://example.com/files/teen-mental-health.pdf',
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
    fileUrl: 'https://example.com/files/career-planning.pdf',
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
    fileUrl: 'https://example.com/files/communication-skills.pdf',
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
    fileUrl: 'https://example.com/files/financial-literacy.pdf',
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
    fileUrl: 'https://example.com/files/self-esteem.pdf',
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
    fileUrl: 'https://example.com/files/digital-safety.pdf',
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
    fileUrl: 'https://example.com/files/social-skills.pdf',
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
    fileUrl: 'https://example.com/files/mindfulness.pdf',
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
    fileUrl: 'https://example.com/files/goal-achievement.pdf',
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
    fileUrl: 'https://example.com/files/study-excellence.pdf',
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
    fileUrl: 'https://example.com/files/time-management.pdf',
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
    fileUrl: 'https://example.com/files/resilience.pdf',
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
    fileUrl: 'https://example.com/files/conflict-resolution.pdf',
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
    fileUrl: 'https://example.com/files/gratitude-journaling.pdf',
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
    fileUrl: 'https://example.com/files/personal-branding.pdf',
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
    fileUrl: 'https://example.com/files/creative-thinking.pdf',
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
    fileUrl: 'https://example.com/files/relationship-building.pdf',
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
    fileUrl: 'https://example.com/files/leadership-skills.pdf',
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
    fileUrl: 'https://example.com/files/decision-making.pdf',
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
    fileUrl: 'https://example.com/files/passion-discovery.pdf',
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

const readStoreData = () => {
  try {
    const storedProducts = JSON.parse(localStorage.getItem('paz_store_products') || 'null');
    const storedBank = JSON.parse(localStorage.getItem('paz_store_bank_account') || 'null');
    
    // Use new defaults if stored products are old/missing or fewer than 20
    const productsToUse = (Array.isArray(storedProducts) && storedProducts.length >= 20) ? storedProducts : defaultProducts;
    
    return {
      products: productsToUse,
      bankAccount: storedBank || defaultBankAccount
    };
  } catch (error) {
    return { products: defaultProducts, bankAccount: defaultBankAccount };
  }
};

export default function ShopPage({ onOrderSubmitted }) {
  const [storeData, setStoreData] = useState(readStoreData);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevant');
  const [cartOpen, setCartOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 900 : false);
  const [isVerySmallScreen, setIsVerySmallScreen] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 360 : false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;
  const [toast, setToast] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [checkoutStage, setCheckoutStage] = useState('details');
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [cartReminderVisible, setCartReminderVisible] = useState(false);

  useEffect(() => {
    localStorage.setItem('paz_store_products', JSON.stringify(storeData.products));
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
      }, 600000);
    };

    const eventNames = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    eventNames.forEach((eventName) => window.addEventListener(eventName, resetReminder));
    resetReminder();

    return () => {
      eventNames.forEach((eventName) => window.removeEventListener(eventName, resetReminder));
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [cart, submittedOrder]);

  const triggerSuccessConfetti = () => {
    const burst = (index = 0) => {
      let origin = {
        x: index % 3 === 1 ? 0.5 : index % 3 === 0 ? 0.18 : 0.82,
        y: 0.72
      };

      const modalElement = document.querySelector('[data-cart-modal="true"]');
      if (modalElement) {
        const rect = modalElement.getBoundingClientRect();
        const centerX = (rect.left + rect.width / 2) / window.innerWidth;
        const centerY = (rect.top + rect.height * 0.28) / window.innerHeight;
        origin = {
          x: Math.min(Math.max(centerX, 0.1), 0.9),
          y: Math.min(Math.max(centerY, 0.12), 0.82)
        };
      }

      confetti({
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
    const interval = window.setInterval(runBurst, 1400);

    window.setTimeout(() => {
      window.clearInterval(interval);
      confetti.reset();
    }, 5200);
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
    const inPriceRange = product.price >= priceRange[0] && product.price <= priceRange[1];
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

  const addToCart = (product) => {
    setCartReminderVisible(false);
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      const newCart = existing
        ? current.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        : [...current, { ...product, quantity: 1 }];
      
      // Show toast notification
      setToast({
        message: `✓ ${product.title} added to cart!`,
        type: 'success'
      });
      setTimeout(() => setToast(null), 3000);
      
      return newCart;
    });
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
    () => cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [cart]
  );

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

  const handleCheckout = async (event) => {
    event.preventDefault();
    if (!cart.length) return;

    const orderNumber = `PAZ-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      id: `shop-${Date.now()}`,
      orderNumber,
      name: checkoutForm.name || 'Customer',
      email: checkoutForm.email || 'customer@example.com',
      phone: checkoutForm.phone || 'N/A',
      total: subtotal,
      items: cart,
      notes: checkoutForm.notes || '',
      bankAccount: storeData.bankAccount,
      paymentProofFile: paymentProofFile ? paymentProofFile.name : null,
      paymentProofUploaded: !!paymentProofFile,
      paymentProofPreview: paymentProof || null,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setSubmittedOrder(newOrder);

    const itemSummary = (newOrder.items || [])
      .map((item) => `• ${item.title || 'Product'} x${item.quantity || 1}`)
      .join('\n');

    try {
      const emailResponse = await fetch('/api/send-notification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newOrder.email,
          service: 'Product purchase',
          timestamp: new Date().toISOString(),
          orderNumber: newOrder.orderNumber,
          itemSummary,
          customerName: newOrder.name,
          message: `Thank you for your order #${newOrder.orderNumber}. Your purchase has been received and is being processed by PAZ Thriving Tribe.`,
          productMessage: `Thank you for your order #${newOrder.orderNumber}. Your purchase has been received and is being processed by PAZ Thriving Tribe.`,
          customMessage: `Thank you for your order #${newOrder.orderNumber}. Your purchase has been received and is being processed by PAZ Thriving Tribe.`,
          attachmentName: null
        })
      });

      if (!emailResponse.ok) {
        const emailData = await emailResponse.json().catch(() => ({}));
        console.warn('Auto purchase email failed:', emailData?.error || 'Unknown email error');
      }
    } catch (emailError) {
      console.warn('Auto purchase email request failed:', emailError);
    }

    if (typeof onOrderSubmitted === 'function') {
      onOrderSubmitted((current = []) => [newOrder, ...current]);
    }

    setCheckoutStage('success');

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        triggerSuccessConfetti();
      }, 120);
    });

    setToast({
      message: `✓ Order #${orderNumber} created successfully!`,
      type: 'success'
    });
    setTimeout(() => setToast(null), 4000);

    setCheckoutForm({ name: '', email: '', phone: '', notes: '' });
    setCart([]);
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
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isSmallScreen ? '16px 14px 50px' : '20px 14px 50px', paddingLeft: isSmallScreen ? '14px' : '268px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
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
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      border: '1px solid #d5d9d9',
                      borderRadius: '4px',
                      padding: '6px 8px',
                      fontSize: '14px',
                      background: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="relevant">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest</option>
                  </select>
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
                  <div key={product.id} style={{
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
                      <img src={product.cover} alt={product.title} style={{
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
                        color: product.stockCount < 10 ? '#B12704' : '#188a00',
                        marginBottom: '8px',
                        fontWeight: product.stockCount < 10 ? '600' : 'normal',
                        letterSpacing: '0.2px'
                      }}>
                        {product.stockCount < 10 ? `Only ${product.stockCount} left` : 'In stock'}
                      </div>

                      {/* Price - Bold & Prominent */}
                      <div style={{
                        fontSize: isVerySmallScreen ? '12px' : isSmallScreen ? '14px' : '16px',
                        fontWeight: '700',
                        color: '#B12704',
                        marginBottom: isVerySmallScreen ? '6px' : isSmallScreen ? '8px' : '10px',
                        letterSpacing: '-0.5px'
                      }}>
                        {money(product.price)}
                      </div>
                    </div>

                    {/* Add to Cart Button - Fixed at Bottom */}
                    <button
                      onClick={() => addToCart(product)}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #FF9900 0%, #FF8C00 100%)',
                        border: 'none',
                        borderRadius: '0',
                        padding: isVerySmallScreen ? '8px 6px' : isSmallScreen ? '9px 8px' : '10px 12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: isVerySmallScreen ? '10px' : isSmallScreen ? '11px' : '13px',
                        color: '#111',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #FF8C00 0%, #FF7A00 100%)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #FF9900 0%, #FF8C00 100%)';
                      }}
                    >
                      <i className="fa-solid fa-cart-plus" style={{ fontSize: '14px' }}></i>
                      <span>Add to Cart</span>
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
                    ✕
                  </button>
                </div>
              </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: isSmallScreen ? '12px 14px' : '16px' }}>
              {cart.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', marginTop: '40px' }}>Your cart is empty</p>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                        <img src={item.cover} alt={item.title} style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 'bold' }}>{item.title}</h4>
                          <div style={{ color: '#666', fontSize: '12px' }}>Qty: {item.quantity}</div>
                          <div style={{ fontWeight: 'bold', color: '#111' }}>{money(item.price * item.quantity)}</div>
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
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={checkoutForm.phone}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                    style={{ padding: '10px 12px', border: '1px solid #d5d9d9', borderRadius: '8px', fontSize: '14px' }}
                  />

                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #FF9900, #FF8A00)',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      color: '#111',
                      fontSize: '14px',
                      marginTop: '6px',
                      boxShadow: '0 10px 18px rgba(255, 153, 0, 0.24)'
                    }}
                  >
                    Complete Order
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
                      <span style={{ fontWeight: '600' }}>{money(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', marginTop: '8px', color: '#065f46' }}>
                    <span>Total:</span>
                    <span>{money(submittedOrder.total)}</span>
                  </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: '8px', padding: '12px', marginBottom: '12px', fontSize: '12px', lineHeight: '1.8', color: '#047857' }}>
                  <strong style={{ display: 'block', marginBottom: '6px' }}>🏦 Payment Details</strong>
                  <div><strong>Bank:</strong> {submittedOrder.bankAccount.bankName}</div>
                  <div><strong>Account Name:</strong> {submittedOrder.bankAccount.accountName}</div>
                  <div><strong>Account Number:</strong> {submittedOrder.bankAccount.accountNumber}</div>
                  <div style={{ marginTop: '6px', fontStyle: 'italic' }}>📝 {submittedOrder.bankAccount.note}</div>
                </div>

                <div style={{ marginBottom: '12px', border: '1px dashed #86efac', borderRadius: '8px', padding: '12px', background: '#f0fdf4' }}>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', color: '#065f46', fontSize: '13px' }}>
                    📸 Upload Payment Proof
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
                </div>

                <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#92400e' }}>
                  <strong style={{ display: 'block', marginBottom: '6px' }}>📩 Delivery Notice</strong>
                  Your product will be sent to <strong>{submittedOrder.email}</strong> once our admin confirms payment.
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

        {cartReminderVisible && (
          <div
            onClick={() => {
              setCartOpen(true);
              setCartReminderVisible(false);
            }}
            style={{
              position: 'fixed',
              right: '20px',
              bottom: '84px',
              zIndex: 310,
              background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
              color: '#7c2d12',
              border: '1px solid #fdba74',
              borderRadius: '12px',
              boxShadow: '0 10px 20px rgba(0,0,0,0.12)',
              padding: '10px 14px',
              maxWidth: '270px',
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
                    <span style={{ fontWeight: '600' }}>{money(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', marginTop: '8px', paddingTop: '8px', borderTop: '2px solid #6ee7b7' }}>
                  <span>Total Amount:</span>
                  <span>{money(submittedOrder.total)}</span>
                </div>
              </div>
            </div>

            <div style={{
              background: '#fff',
              border: '1px solid #6ee7b7',
              borderRadius: '4px',
              padding: '12px',
              lineHeight: '1.8',
              fontSize: '14px',
              marginBottom: '12px'
            }}>
              <strong style={{ display: 'block', marginBottom: '8px', color: '#065f46' }}>🏦 Payment Details:</strong>
              <div><strong>Bank:</strong> {submittedOrder.bankAccount.bankName}</div>
              <div><strong>Account Name:</strong> {submittedOrder.bankAccount.accountName}</div>
              <div><strong>Account Number:</strong> {submittedOrder.bankAccount.accountNumber}</div>
            </div>

            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '4px',
              padding: '12px',
              fontSize: '12px',
              marginBottom: '12px'
            }}>
              <strong style={{ color: '#047857' }}>📩 Delivery Notice:</strong>
              <p style={{ margin: '8px 0 0', color: '#047857' }}>
                Your product will be sent to <strong>{submittedOrder.email}</strong> once our admin confirms payment.
              </p>
            </div>

            <p style={{ margin: 0, fontSize: '12px', color: '#047857' }}>
              📌 Please save your order number <strong>{submittedOrder.orderNumber}</strong> for your records.
            </p>
          </div>
        )}
      </div>

      <style>{`
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
