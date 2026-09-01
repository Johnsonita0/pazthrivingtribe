import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    title: 'Confidence for Teens',
    description: 'A step-by-step digital guide to help young people build confidence, healthy habits, and emotional resilience.',
    price: 5500,
    category: 'Ebook',
    cover: '/logo/logomain.png',
    fileUrl: 'https://example.com/files/confidence-for-teens.pdf'
  },
  {
    id: 'ebook-parent-guide',
    title: 'Thriving Parent Guide',
    description: 'Practical strategies for communication, boundaries, and positive family routines with everyday life examples.',
    price: 7000,
    category: 'Guide',
    cover: '/logo/logo2.jpeg',
    fileUrl: 'https://example.com/files/thriving-parent-guide.pdf'
  },
  {
    id: 'digital-workbook',
    title: 'Purpose Planner Workbook',
    description: 'A printable workbook for self-discovery, goal setting, and building a more intentional life.',
    price: 4500,
    category: 'Workbook',
    cover: '/logo/logo2.jpeg',
    fileUrl: 'https://example.com/files/purpose-planner-workbook.pdf'
  },
  {
    id: 'family-routine-kit',
    title: 'Family Routine Kit',
    description: 'A practical planner for mornings, chores, family rhythms, and calmer home routines.',
    price: 6200,
    category: 'Planner',
    cover: '/logo/logomain.png',
    fileUrl: 'https://example.com/files/family-routine-kit.pdf'
  },
  {
    id: 'mindful-moments',
    title: 'Mindful Moments Journal',
    description: 'A guided reflection journal for emotional regulation, gratitude, and self-awareness.',
    price: 4800,
    category: 'Journal',
    cover: '/logo/logo2.jpeg',
    fileUrl: 'https://example.com/files/mindful-moments-journal.pdf'
  },
  {
    id: 'teen-vision-board',
    title: 'Teen Vision Board Pack',
    description: 'Design and goal-setting activities that help young people dream bigger and act with intention.',
    price: 5300,
    category: 'Workbook',
    cover: '/logo/logomain.png',
    fileUrl: 'https://example.com/files/teen-vision-board-pack.pdf'
  },
  {
    id: 'boundaries-bundle',
    title: 'Boundaries Bundle',
    description: 'A supportive toolkit for healthy conversations, personal limits, and respectful relationships.',
    price: 6700,
    category: 'Guide',
    cover: '/logo/logo2.jpeg',
    fileUrl: 'https://example.com/files/boundaries-bundle.pdf'
  },
  {
    id: 'purpose-pathway',
    title: 'Purpose Pathway Mini Course',
    description: 'A short digital course that helps users discover their values, strengths, and next steps.',
    price: 8200,
    category: 'Course',
    cover: '/logo/logomain.png',
    fileUrl: 'https://example.com/files/purpose-pathway.pdf'
  },
  {
    id: 'calm-parenting',
    title: 'Calm Parenting Playbook',
    description: 'Simple routines and scripts for more patience, connection, and calm in everyday parenting.',
    price: 7100,
    category: 'Guide',
    cover: '/logo/logo2.jpeg',
    fileUrl: 'https://example.com/files/calm-parenting-playbook.pdf'
  },
  {
    id: 'summer-growth-plan',
    title: 'Summer Growth Plan',
    description: 'A seasonal planner that helps families set meaningful goals, habits, and joyful wins.',
    price: 5900,
    category: 'Planner',
    cover: '/logo/logomain.png',
    fileUrl: 'https://example.com/files/summer-growth-plan.pdf'
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
    const safeStoredProducts = Array.isArray(storedProducts) ? storedProducts.filter(Boolean) : [];
    const mergedProducts = [...safeStoredProducts];
    const seenIds = new Set(mergedProducts.map((product) => product?.id).filter(Boolean));

    defaultProducts.forEach((product) => {
      if (mergedProducts.length >= 20) return;
      if (!seenIds.has(product.id)) {
        mergedProducts.push(product);
        seenIds.add(product.id);
      }
    });

    return {
      products: mergedProducts.slice(0, 20),
      bankAccount: storedBank || defaultBankAccount
    };
  } catch (error) {
    return { products: defaultProducts, bankAccount: defaultBankAccount };
  }
};

export default function StorePage() {
  const navigate = useNavigate();
  const [storeData] = useState(readStoreData);
  const [cart, setCart] = useState([]);
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(() => window.innerWidth <= 768);

  const recentProducts = (storeData.products || []).slice(0, 12);
  const featuredProductRotationMs = 7 * 1000;

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!recentProducts.length) return undefined;

    const timer = window.setInterval(() => {
      setActiveProductIndex((current) => (current + 1) % recentProducts.length);
    }, featuredProductRotationMs);

    return () => window.clearInterval(timer);
  }, [recentProducts.length, featuredProductRotationMs]);

  const activeProduct = recentProducts[activeProductIndex] || recentProducts[0];

  const showPreviousProduct = () => {
    setActiveProductIndex((current) => (current === 0 ? recentProducts.length - 1 : current - 1));
  };

  const showNextProduct = () => {
    setActiveProductIndex((current) => (current + 1) % recentProducts.length);
  };

  const promoHeadline = activeProduct
    ? `You need ${activeProduct.title} to help you through this season.`
    : 'You need a guide to help you through this season.';

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

  const addToCart = (product) => {
    if (product.inStock === false || Number(product.stockCount || 0) <= 0) {
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const toggleCartDrawer = () => {
    setCartOpen((current) => !current);
  };

  const updateCartQuantity = (productId, delta) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', background: '#f5f1ec', color: '#1b1b1b', fontFamily: 'Inter, Arial, sans-serif', marginTop: 0 }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes storeHeroFade {
          0% {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .store-hero-shell {
          position: relative;
          z-index: 1;
          max-width: 1360px;
          margin: 0 auto;
          padding: 24px 24px 0;
        }
        .store-hero-slider {
          position: relative;
          width: 100%;
          min-height: 620px;
          border-radius: 34px;
          overflow: hidden;
          box-shadow: 0 28px 60px rgba(5, 17, 14, 0.28);
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: #0c1f1d;
        }
        .store-hero-slider::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(7, 15, 18, 0.82) 0%, rgba(7, 15, 18, 0.68) 38%, rgba(7, 15, 18, 0.42) 100%);
          z-index: 1;
        }
        .store-hero-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transform: scale(1.05);
          filter: saturate(0.9) contrast(1.06);
          transition: background-image 0.8s ease;
        }
        .store-hero-inner {
          position: relative;
          z-index: 2;
          min-height: 620px;
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(260px, 420px);
          gap: 2rem;
          align-items: end;
          padding: clamp(2rem, 5vw, 4.5rem);
        }
        .store-hero-copy {
          max-width: 680px;
          animation: storeHeroFade 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .store-hero-kicker,
        .store-hero-subline {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.7rem 1rem;
          border-radius: 999px;
          background: rgba(255, 214, 95, 0.18);
          border: 1px solid rgba(255, 214, 95, 0.4);
          color: #f8d879;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 0.7rem;
        }
        .store-hero-subline {
          margin-top: 1rem;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.16);
          color: #edf2ff;
          letter-spacing: 0.08em;
        }
        .store-hero-title {
          margin: 1.1rem 0 1rem;
          font-size: clamp(2.8rem, 5vw, 5.2rem);
          line-height: 0.92;
          letter-spacing: -0.06em;
          color: #ffffff;
          font-weight: 900;
          text-shadow: 0 14px 32px rgba(0, 0, 0, 0.42);
        }
        .store-hero-text {
          margin: 0;
          max-width: 620px;
          color: rgba(240, 244, 250, 0.9);
          font-size: 1.08rem;
          line-height: 1.7;
        }
        .store-hero-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.9rem;
          margin-top: 1.8rem;
        }
        .store-hero-btn-primary,
        .store-hero-btn-secondary,
        .store-hero-btn-cart,
        .store-hero-nav-btn {
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease, opacity 0.2s ease, background 0.2s ease;
        }
        .store-hero-btn-primary,
        .store-hero-btn-secondary,
        .store-hero-btn-cart {
          border-radius: 14px;
          padding: 1rem 1.6rem;
          font-size: 0.96rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .store-hero-btn-primary {
          background: linear-gradient(180deg, #f5d468 0%, #eab75c 100%);
          color: #132925;
          box-shadow: 0 18px 32px rgba(243, 184, 74, 0.28);
        }
        .store-hero-btn-secondary,
        .store-hero-btn-cart {
          background: rgba(255, 255, 255, 0.06);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.24);
        }
        .store-hero-btn-primary:hover,
        .store-hero-btn-secondary:hover,
        .store-hero-btn-cart:hover,
        .store-hero-nav-btn:hover {
          transform: translateY(-1px);
        }
        .store-hero-panel {
          align-self: end;
          justify-self: end;
          width: min(100%, 390px);
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 28px;
          box-shadow: 0 22px 46px rgba(6, 20, 17, 0.2);
          padding: 1rem;
          animation: storeHeroFade 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .store-hero-product {
          background: rgba(255,255,255,0.96);
          border-radius: 22px;
          padding: 1rem;
          box-shadow: 0 14px 30px rgba(11, 18, 15, 0.18);
        }
        .store-hero-product-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .store-hero-tag {
          display: inline-flex;
          padding: 0.45rem 0.7rem;
          border-radius: 999px;
          background: #ebf8f0;
          color: #1d6d60;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .store-hero-add-btn {
          border: none;
          border-radius: 12px;
          background: linear-gradient(180deg, #1f766a 0%, #0f2d2a 100%);
          color: #fff;
          padding: 0.72rem 1rem;
          font-weight: 800;
          cursor: pointer;
        }
        .store-hero-product-body {
          display: grid;
          grid-template-columns: 150px minmax(0, 1fr);
          gap: 1rem;
          align-items: center;
        }
        .store-hero-image {
          width: 100%;
          height: 170px;
          border-radius: 18px;
          object-fit: cover;
          background: #f2efe8;
        }
        .store-hero-product-name {
          margin: 0 0 0.5rem;
          color: #101828;
          font-size: clamp(1.5rem, 2vw, 2.1rem);
          line-height: 1.08;
          font-weight: 900;
        }
        .store-hero-product-description {
          margin: 0;
          color: #4b5563;
          line-height: 1.5;
          font-size: 0.9rem;
        }
        .store-hero-product-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }
        .store-hero-price {
          font-size: 1.8rem;
          color: #111827;
          font-weight: 900;
        }
        .store-hero-details-btn {
          border: 1px solid #d1d5db;
          background: #fff;
          color: #1f2937;
          border-radius: 12px;
          padding: 0.7rem 1rem;
          font-weight: 800;
          cursor: pointer;
        }
        .store-hero-controls {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          padding: 0 clamp(0.4rem, 1.2vw, 0.8rem);
        }
        .store-hero-controls-left,
        .store-hero-controls-right {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          pointer-events: auto;
        }
        .store-hero-controls-left { left: clamp(0.4rem, 1.2vw, 0.8rem); }
        .store-hero-controls-right { right: clamp(0.4rem, 1.2vw, 0.8rem); }
        .store-hero-dots {
          position: absolute;
          left: 50%;
          bottom: 0.75rem;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(8, 13, 18, 0.18);
          padding: 0.4rem 0.5rem;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .store-hero-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          border: none;
          background: rgba(255,255,255,0.55);
          cursor: pointer;
          padding: 0;
        }
        .store-hero-dot.active {
          width: 28px;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(255,255,255,0.14);
        }
        .store-hero-arrow-cluster {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .store-hero-nav-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.18);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          box-shadow: 0 10px 24px rgba(0,0,0,0.14);
        }
        @media (max-width: 920px) {
          .store-hero-inner {
            grid-template-columns: 1fr;
            align-items: end;
          }
          .store-hero-panel {
            justify-self: stretch;
            width: 100%;
          }
          .store-hero-shell {
            padding-left: 14px;
            padding-right: 14px;
          }
          .store-hero-slider,
          .store-hero-inner {
            min-height: 540px;
          }
        }
        @media (max-width: 620px) {
          .store-hero-slider,
          .store-hero-inner {
            min-height: 420px;
          }
          .store-hero-inner {
            display: block;
            padding: 1.25rem 1.1rem 4.4rem;
          }
          .store-hero-copy {
            max-width: 100%;
          }
          .store-hero-title {
            font-size: clamp(2.3rem, 10vw, 3.3rem);
          }
          .store-hero-text {
            font-size: 0.95rem;
            line-height: 1.6;
          }
          .store-hero-panel {
            display: none;
          }
          .store-hero-actions {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0.5rem;
            margin-top: 1.2rem;
          }
          .store-hero-btn-primary,
          .store-hero-btn-secondary,
          .store-hero-btn-cart {
            width: 100%;
            padding: 0.8rem 0.5rem;
            font-size: 0.66rem;
            letter-spacing: 0.05em;
            text-align: center;
            white-space: normal;
            line-height: 1.2;
          }
          .store-hero-controls {
            padding: 0 0.5rem;
          }
          .store-hero-dots {
            bottom: 0.6rem;
          }
        }
      `}</style>

      <div style={{
        background: 'linear-gradient(135deg, #0f2d2a 0%, #163f3b 32%, #1f766a 100%)',
        minHeight: '100vh',
        padding: '20px 0 32px',
        position: 'relative',
        overflowX: 'hidden'
      }}>
        {cartOpen && (
          <>
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
              right: 0,
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
              <div style={{ padding: isSmallScreen ? '12px 14px' : '16px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontWeight: 800 }}>P</div>
                  <h2 style={{ margin: 0, fontSize: isSmallScreen ? '16px' : '18px', fontWeight: 'bold', color: '#111' }}>Shopping Cart</h2>
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
                      color: '#333'
                    }}
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
                            <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 'bold', color: '#111' }}>{item.title}</h4>
                            <div style={{ color: '#666', fontSize: '12px' }}>Qty: {item.quantity}</div>
                            <div style={{ fontWeight: 'bold', color: '#111' }}>{money(item.price * item.quantity)}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button type="button" onClick={() => updateCartQuantity(item.id, -1)} style={{ padding: '4px 8px', border: '1px solid #d5d9d9', background: '#fff', cursor: 'pointer', borderRadius: '4px' }}>-</button>
                          <button type="button" onClick={() => updateCartQuantity(item.id, 1)} style={{ padding: '4px 8px', border: '1px solid #d5d9d9', background: '#fff', cursor: 'pointer', borderRadius: '4px' }}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div style={{ borderTop: '1px solid #e0e0e0', padding: isSmallScreen ? '12px 14px 16px' : '16px' }}>
                  <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', fontSize: isSmallScreen ? '15px' : '16px', fontWeight: 'bold', color: '#111' }}>
                    <span>Subtotal:</span>
                    <span>{money(subtotal)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCartOpen(false);
                      navigate('/shop');
                    }}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #FF9900, #FF8A00)',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      color: '#111',
                      fontSize: '14px',
                      boxShadow: '0 10px 18px rgba(255, 153, 0, 0.24)'
                    }}
                  >
                    Checkout
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <div style={{
          position: 'absolute',
          inset: '0',
          background: 'radial-gradient(circle at top right, rgba(255, 211, 112, 0.24), transparent 30%), radial-gradient(circle at bottom left, rgba(119, 181, 168, 0.25), transparent 35%)',
          pointerEvents: 'none'
        }} />

        <div className="store-hero-shell">
          <section className="store-hero-slider" aria-label="Store featured products slider">
            <div
              className="store-hero-bg"
              style={{
                backgroundImage: `url(${activeProduct.cover})`
              }}
            />

            <div className="store-hero-inner">
              <div className="store-hero-copy" key={activeProduct.id}>
                <span className="store-hero-kicker">Digital growth resources</span>
                <div className="store-hero-subline">{promoHeadline}</div>
                <h1 className="store-hero-title">{activeProduct.title}</h1>
                <p className="store-hero-text">{activeProduct.description}</p>

                <div className="store-hero-actions">
                  <button type="button" className="store-hero-btn-primary" onClick={() => navigate('/shop')}>
                    Shop now
                  </button>
                  <button type="button" className="store-hero-btn-secondary" onClick={() => navigate('/shop')}>
                    Explore
                  </button>
                  <button type="button" className="store-hero-btn-cart" onClick={() => addToCart(activeProduct)}>
                    Add to cart
                  </button>
                </div>
              </div>

              <div className="store-hero-panel">
                <div className="store-hero-product">
                  <div className="store-hero-product-top">
                    <span className="store-hero-tag">{activeProduct.category}</span>
                    <button type="button" className="store-hero-add-btn" onClick={() => addToCart(activeProduct)}>
                      Add to cart
                    </button>
                  </div>

                  <div className="store-hero-product-body">
                    <img src={activeProduct.cover} alt={activeProduct.title} className="store-hero-image" />
                    <div>
                      <h2 className="store-hero-product-name">{activeProduct.title}</h2>
                      <p className="store-hero-product-description">{activeProduct.description}</p>
                      <div className="store-hero-product-meta">
                        <strong className="store-hero-price">{money(activeProduct.price)}</strong>
                        <button type="button" className="store-hero-details-btn" onClick={() => navigate('/shop')}>
                          View details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="store-hero-controls">
              <div className="store-hero-controls-left" aria-label="Previous slide controls">
                <button type="button" className="store-hero-nav-btn" aria-label="Previous slide" onClick={showPreviousProduct}>
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
              </div>

              <div className="store-hero-controls-right" aria-label="Next slide controls">
                <button type="button" className="store-hero-nav-btn" aria-label="Next slide" onClick={showNextProduct}>
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              </div>

              <div className="store-hero-dots" aria-label="Product slide navigation">
                {recentProducts.map((product, index) => (
                  <button
                    key={product.id}
                    type="button"
                    aria-label={`Go to ${product.title}`}
                    className={`store-hero-dot ${index === activeProductIndex ? 'active' : ''}`}
                    onClick={() => setActiveProductIndex(index)}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
