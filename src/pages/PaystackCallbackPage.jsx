import { Link, useSearchParams } from 'react-router-dom';

export default function PaystackCallbackPage() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: '#f8fafc', color: '#111827' }}>
      <section style={{ width: 'min(520px, 100%)', padding: '32px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', textAlign: 'center', boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)' }}>
        <h1 style={{ margin: '0 0 12px', fontSize: '1.6rem' }}>Payment received</h1>
        <p style={{ margin: '0 0 20px', color: '#475569', lineHeight: 1.6 }}>
          Your payment is being confirmed. You can return to the shop while the order is processed.
        </p>
        {reference && <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '0.85rem' }}>Reference: {reference}</p>}
        <Link to="/shop" style={{ display: 'inline-block', padding: '11px 16px', borderRadius: '8px', background: '#f59e0b', color: '#111827', fontWeight: 800, textDecoration: 'none' }}>
          Return to shop
        </Link>
      </section>
    </main>
  );
}
