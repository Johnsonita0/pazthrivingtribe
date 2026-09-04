import React, { useState } from 'react';

export default function CustomerSupportChat() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [notice, setNotice] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    const response = await fetch('/api/customer-support', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await response.json().catch(() => ({}));
    setSending(false);
    if (!response.ok) { setNotice(data.error || 'Unable to send your message.'); return; }
    setForm({ name: '', email: '', message: '' });
    setNotice('Message sent. Our support team has been notified by email.');
  };

  return <div style={{ position: 'fixed', right: '20px', bottom: '20px', zIndex: 3000 }}><button type="button" onClick={() => setOpen((current) => !current)} style={{ border: 0, borderRadius: '999px', padding: '12px 16px', background: '#166534', color: '#fff', fontWeight: 800, boxShadow: '0 12px 24px rgba(15,23,42,.2)', cursor: 'pointer' }}>Customer care</button>{open && <div style={{ position: 'absolute', right: 0, bottom: '54px', width: 'min(340px, calc(100vw - 32px))', background: '#fff', border: '1px solid #dbe7df', borderRadius: '14px', padding: '16px', boxShadow: '0 20px 50px rgba(15,23,42,.2)' }}><h2 style={{ margin: '0 0 6px', fontSize: '1.05rem' }}>Customer care chat</h2><p style={{ margin: '0 0 12px', color: '#64748b', fontSize: '.82rem' }}>Send a question or complaint. We will email the team even when they are offline.</p><form onSubmit={submit} style={{ display: 'grid', gap: '8px' }}><input required placeholder="Your name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} style={{ padding: '9px', border: '1px solid #cbd5e1', borderRadius: '8px' }} /><input required type="email" placeholder="Your email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} style={{ padding: '9px', border: '1px solid #cbd5e1', borderRadius: '8px' }} /><textarea required rows="3" placeholder="Type your message..." value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} style={{ padding: '9px', border: '1px solid #cbd5e1', borderRadius: '8px', resize: 'vertical' }} /><button type="submit" disabled={sending} style={{ padding: '10px', border: 0, borderRadius: '8px', background: '#f97316', color: '#fff', fontWeight: 800 }}>{sending ? 'Sending...' : 'Send to support'}</button></form>{notice && <div style={{ marginTop: '8px', color: notice.startsWith('Message') ? '#166534' : '#b91c1c', fontSize: '.78rem' }}>{notice}</div>}</div>}</div>;
}
