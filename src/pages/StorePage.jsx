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
    return {
      products: Array.isArray(storedProducts) && storedProducts.length ? storedProducts : defaultProducts,
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

  const recentProducts = (storeData.products || []).slice(0, 12);
  const featuredProductRotationMs = 7 * 1000;

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

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', background: '#f5f1ec', color: '#1b1b1b', fontFamily: 'Inter, Arial, sans-serif' }}>
      <style>{`
        @keyframes lift {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeSlideIn {
          0% {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .store-landing-card {
          animation: lift 5s ease-in-out infinite;
        }
        .store-landing-feature {
          animation: fadeSlideIn 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .store-landing-copy {
          animation: fadeSlideIn 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @media (max-width: 920px) {
          .store-landing-grid {
            grid-template-columns: 1fr !important;
            gap: 18px !important;
            align-items: start !important;
          }
          .store-landing-panel {
            min-height: 300px !important;
            max-height: none !important;
            width: 100% !important;
            margin-top: 0 !important;
          }
          .store-landing-card {
            max-width: 100% !important;
          }
          .store-landing-cta-row {
            margin-top: 18px !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .store-landing-cta-row button {
            width: 100% !important;
          }
          .store-landing-header {
            flex-wrap: wrap !important;
            gap: 12px !important;
          }
          .store-landing-header .store-badge {
            width: 100% !important;
            justify-content: center !important;
          }
        }

        @media (max-width: 620px) {
          .store-landing-body {
            padding-left: 14px !important;
            padding-right: 14px !important;
            min-height: auto !important;
          }
          .store-landing-header {
            margin-bottom: 18px !important;
          }
          .store-landing-header img {
            width: 42px !important;
            height: 42px !important;
          }
          .store-landing-header > div:first-child > div > div {
            font-size: 0.62rem !important;
            letter-spacing: 0.08em !important;
          }
          .store-landing-copy {
            text-align: left !important;
          }
          .store-landing-copy h1 {
            font-size: clamp(2.2rem, 9vw, 3.2rem) !important;
            line-height: 0.96 !important;
            max-width: 11ch !important;
          }
          .store-landing-copy p {
            font-size: 0.9rem !important;
            line-height: 1.55 !important;
          }
          .store-landing-feature {
            padding: 14px !important;
          }
          .store-landing-feature-grid {
            grid-template-columns: 1fr !important;
          }
          .store-landing-product-thumb {
            height: 150px !important;
          }
          .store-landing-product-meta {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .store-landing-product-meta strong {
            font-size: 1.45rem !important;
          }
          .store-landing-product-meta button {
            width: 100% !important;
          }
          .store-landing-panel {
            min-height: 0 !important;
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
        <div style={{
          position: 'absolute',
          inset: '0',
          background: 'radial-gradient(circle at top right, rgba(255, 211, 112, 0.24), transparent 30%), radial-gradient(circle at bottom left, rgba(119, 181, 168, 0.25), transparent 35%)',
          pointerEvents: 'none'
        }} />

        <div className="store-landing-body" style={{ maxWidth: '1360px', minHeight: '100vh', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <header className="store-landing-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img src="/logo/logomain.png" alt="Paz Thriving Tribe logo" style={{ width: '52px', height: '52px', borderRadius: '16px', objectFit: 'cover' }} />
              <div>
                <div style={{ color: '#f6f4ef', letterSpacing: '0.14em', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>Paz Thriving Tribe</div>
              </div>
            </div>

            <div className="store-badge" style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '999px',
                padding: '10px 18px',
                color: '#fff',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <i className="fa-solid fa-cart-shopping" aria-hidden="true"></i>
                <span>{cart.reduce((count, item) => count + item.quantity, 0)}</span>
              </div>
            </div>
          </header>

          <div className="store-landing-grid" style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: '20px', alignItems: 'center' }}>
            <div key={activeProduct.id} className="store-landing-copy">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '999px',
                background: 'rgba(255, 214, 95, 0.2)',
                border: '1px solid rgba(255, 214, 95, 0.5)',
                color: '#f8d879',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontSize: '0.72rem',
                padding: '8px 14px'
              }}>
                Digital growth resources
              </div>

              <div style={{ marginTop: '16px', color: '#f5d468', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.74rem' }}>
                {promoHeadline}
              </div>

              <h1 style={{ margin: '16px 0 12px', fontSize: 'clamp(2.6rem, 4vw, 5.2rem)', lineHeight: 0.92, letterSpacing: '-0.06em', color: '#fff', fontWeight: 900 }}>
                {activeProduct ? activeProduct.title : 'Build a stronger life,'}
              </h1>

              <p style={{ margin: '0', maxWidth: '590px', color: 'rgba(245, 244, 239, 0.82)', fontSize: '1rem', lineHeight: 1.6 }}>
                {activeProduct ? activeProduct.description : 'Thoughtful digital guides, planners, and workbooks designed to help teens, parents, and families grow with confidence, clarity, and purpose.'}
              </p>

              <div className="store-landing-cta-row" style={{ marginTop: '22px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => navigate('/shop')}
                  style={{
                    border: 'none',
                    borderRadius: '14px',
                    background: 'linear-gradient(180deg, #f5d468 0%, #ecb642 100%)',
                    color: '#142a29',
                    padding: '18px 28px',
                    fontSize: '1rem',
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    boxShadow: '0 18px 32px rgba(243, 184, 74, 0.26)'
                  }}
                >
                  Shop now
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/shop')}
                  style={{
                    border: '1px solid rgba(255,255,255,0.38)',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#fff',
                    padding: '18px 28px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Explore the catalog
                </button>
              </div>
            </div>

            <div className="store-landing-card store-landing-panel" style={{ position: 'relative', width: '100%', maxWidth: '680px', minHeight: '370px', maxHeight: '440px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginRight: '0' }}>
              <div style={{
                position: 'absolute',
                inset: '18px 24px 0 24px',
                background: 'linear-gradient(135deg, #f7f4ef 0%, #eef4ed 100%)',
                borderRadius: '32px',
                boxShadow: '0 28px 52px rgba(6, 18, 16, 0.22)'
              }} />

              {activeProduct && (
                <div
                  key={activeProduct.id}
                  className="store-landing-feature"
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    maxWidth: '600px',
                    borderRadius: '28px',
                    background: '#ffffff',
                    border: '1px solid rgba(16, 44, 39, 0.08)',
                    boxShadow: '0 30px 54px rgba(15, 23, 42, 0.12)',
                    padding: '18px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      borderRadius: '999px',
                      background: '#eef8f3',
                      color: '#1d6d60',
                      padding: '7px 12px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase'
                    }}>
                      {activeProduct.category}
                    </span>
                    <button type="button" onClick={() => addToCart(activeProduct)} style={{
                      border: 'none',
                      borderRadius: '12px',
                      background: 'linear-gradient(180deg, #1f766a 0%, #0f2d2a 100%)',
                      color: '#fff',
                      padding: '11px 16px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}>
                      Add to cart
                    </button>
                  </div>

                  <div className="store-landing-feature-grid" style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: '16px', alignItems: 'center' }}>
                    <div className="store-landing-product-thumb" style={{
                      borderRadius: '18px',
                      height: '170px',
                      overflow: 'hidden',
                      background: '#f4f1ec',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img src={activeProduct.cover} alt={activeProduct.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div>
                      <h2 style={{ margin: '0 0 8px', fontSize: 'clamp(1.5rem, 2vw, 2.2rem)', lineHeight: 1.08, color: '#1f2937', fontWeight: 900 }}>{activeProduct.title}</h2>
                      <p style={{ margin: 0, color: '#4b5563', lineHeight: 1.5, fontSize: '0.92rem' }}>{activeProduct.description}</p>
                      <div className="store-landing-product-meta" style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '1.9rem', color: '#101828' }}>{money(activeProduct.price)}</strong>
                        <button type="button" onClick={() => navigate('/shop')} style={{
                          border: '1px solid #d1d5db',
                          borderRadius: '12px',
                          background: '#fff',
                          color: '#1f2937',
                          padding: '10px 16px',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}>
                          View details
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flex: 1 }}>
                      {recentProducts.map((product, index) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => setActiveProductIndex(index)}
                          aria-label={`Open ${product.title}`}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            border: 'none',
                            background: index === activeProductIndex ? '#1f766a' : '#dfe7e4',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        />
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={showPreviousProduct}
                        aria-label="Previous product"
                        style={{
                          border: '1px solid #d1d5db',
                          borderRadius: '10px',
                          background: '#fff',
                          color: '#1f2937',
                          width: '36px',
                          height: '36px',
                          fontWeight: 900,
                          cursor: 'pointer'
                        }}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={showNextProduct}
                        aria-label="Next product"
                        style={{
                          border: '1px solid #d1d5db',
                          borderRadius: '10px',
                          background: '#fff',
                          color: '#1f2937',
                          width: '36px',
                          height: '36px',
                          fontWeight: 900,
                          cursor: 'pointer'
                        }}
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
