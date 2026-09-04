import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function VendorSupportChat() {
  const [session, setSession] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState([]);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data?.session || null));
  }, []);

  if (!session) return null;

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!message.trim() || sending) return;
    setSending(true);
    const response = await fetch('/api/vendor-support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ message: message.trim() })
    });
    const data = await response.json().catch(() => ({}));
    setSending(false);
    if (!response.ok) {
      setNotice(data.error || 'Unable to send your message.');
      return;
    }
    setSent((current) => [...current, { text: message.trim(), createdAt: new Date().toISOString() }]);
    setMessage('');
    setNotice('Sent. Admin has been notified by email.');
  };

  return <div style={{ position: 'fixed', right: '20px', bottom: '20px', zIndex: 3000 }}><button type="button" onClick={() => setOpen((current) => !current)} style={{ border: 0, borderRadius: '999px', padding: '12px 16px', background: '#166534', color: '#fff', fontWeight: 800, boxShadow: '0 12px 24px rgba(15,23,42,.2)', cursor: 'pointer' }}>Customer care</button>{open && <div style={{ position: 'absolute', right: 0, bottom: '54px', width: 'min(340px, calc(100vw - 32px))', background: '#fff', border: '1px solid #dbe7df', borderRadius: '14px', padding: '16px', boxShadow: '0 20px 50px rgba(15,23,42,.2)' }}><h2 style={{ margin: '0 0 6px', fontSize: '1.05rem' }}>Customer care chat</h2><p style={{ margin: '0 0 12px', color: '#64748b', fontSize: '.82rem' }}>Send a complaint or question. We will email the support team even when they are offline.</p><div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '10px' }}>{sent.map((item, index) => <div key={`${item.createdAt}-${index}`} style={{ padding: '8px', marginBottom: '6px', borderRadius: '8px', background: '#f0fdf4', color: '#166534', fontSize: '.82rem' }}>{item.text}</div>)}</div><form onSubmit={sendMessage}><textarea required rows="3" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type your message..." style={{ width: '100%', boxSizing: 'border-box', padding: '9px', border: '1px solid #cbd5e1', borderRadius: '8px', resize: 'vertical' }} /><button type="submit" disabled={sending} style={{ width: '100%', marginTop: '8px', padding: '10px', border: 0, borderRadius: '8px', background: '#f97316', color: '#fff', fontWeight: 800 }}>{sending ? 'Sending...' : 'Send to support'}</button></form>{notice && <div style={{ marginTop: '8px', color: notice.startsWith('Sent') ? '#166534' : '#b91c1c', fontSize: '.78rem' }}>{notice}</div>}</div>}</div>;
}
