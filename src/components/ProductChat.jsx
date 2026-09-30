import { useEffect, useRef, useState } from 'react';
import { getCountries, getCountryCallingCode, isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js';
import CustomDropdown from './CustomDropdown';

const chatStorageKey = (productId) => `paz-product-chat-${String(productId || '')}`;
const phoneCountries = getCountries().map((code) => ({ code, dialCode: `+${getCountryCallingCode(code)}` }));

function tokenFromUrl() {
  if (typeof window === 'undefined' || !window.location.hash.startsWith('#chat=')) return '';
  try {
    return decodeURIComponent(window.location.hash.slice(6));
  } catch {
    return '';
  }
}

function initialToken(productId) {
  const linkedToken = tokenFromUrl();
  if (linkedToken) return linkedToken;
  try {
    return window.localStorage.getItem(chatStorageKey(productId)) || '';
  } catch {
    return '';
  }
}

export default function ProductChat({ product }) {
  const productId = String(product?.id || '');
  const [form, setForm] = useState({ name: '', email: '', countryCode: 'NG', phoneNumber: '', message: '', website: '' });
  const [token, setToken] = useState(() => initialToken(productId));
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [notice, setNotice] = useState('');
  const [sending, setSending] = useState(false);
  const [emailRepliesEnabled, setEmailRepliesEnabled] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const linkedToken = tokenFromUrl();
    if (linkedToken) window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    if (!token) return undefined;
    let active = true;
    fetch('/api/product-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'read', token })
    }).then(async (response) => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'This conversation could not be opened.');
      if (String(payload.conversation?.product_id) !== productId) throw new Error('This link belongs to a different product conversation.');
      if (!active) return;
      setConversation(payload.conversation);
      setMessages(payload.messages || []);
      setEmailRepliesEnabled(Boolean(payload.emailRepliesEnabled));
      setNotice('');
      if (linkedToken) {
        try { window.localStorage.setItem(chatStorageKey(productId), token); } catch { /* Storage is optional. */ }
      }
    }).catch((error) => {
      if (!active) return;
      setNotice(error.message);
      try { window.localStorage.removeItem(chatStorageKey(productId)); } catch { /* Storage is optional. */ }
      setToken('');
    });
    return () => { active = false; };
  }, [productId, token]);

  const conversationId = conversation?.id;
  useEffect(() => {
    if (!token || !conversationId) return undefined;
    let active = true;
    const refresh = async () => {
      const response = await fetch('/api/product-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read', token })
      });
      const payload = await response.json().catch(() => ({}));
      if (active && response.ok && String(payload.conversation?.product_id) === productId) {
        setMessages(payload.messages || []);
        setConversation(payload.conversation);
      }
    };
    const interval = window.setInterval(() => { void refresh(); }, 10000);
    return () => { active = false; window.clearInterval(interval); };
  }, [conversationId, productId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages.length]);

  const startConversation = async (event) => {
    event.preventDefault();
    const selectedCountry = phoneCountries.find((country) => country.code === form.countryCode) || phoneCountries[0];
    const localDigits = form.phoneNumber.replace(/\D/g, '');
    const parsedPhone = parsePhoneNumberFromString(localDigits, selectedCountry.code);
    if (!parsedPhone || !isValidPhoneNumber(localDigits, selectedCountry.code)) {
      setNotice(`Enter a valid ${selectedCountry.code} phone number for ${selectedCountry.dialCode}.`);
      return;
    }
    setSending(true);
    setNotice('');
    try {
      const response = await fetch('/api/product-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', productId, name: form.name, email: form.email, phone: parsedPhone.number, message: form.message, website: form.website })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Your message could not be sent.');
      setConversation(payload.conversation);
      setMessages(payload.messages || []);
      setToken(payload.token);
      setEmailRepliesEnabled(Boolean(payload.emailRepliesEnabled));
      setNotice(payload.emailSent
        ? 'Your message was sent. We emailed you a secure link to continue this conversation.'
        : 'Your message is saved, but the email could not be sent. Keep this page open to continue the conversation.');
      try { window.localStorage.setItem(chatStorageKey(productId), payload.token); } catch { /* Storage is optional. */ }
      setForm((current) => ({ ...current, message: '', website: '' }));
    } catch (error) {
      setNotice(error.message || 'Your message could not be sent.');
    } finally {
      setSending(false);
    }
  };

  const sendReply = async (event) => {
    event.preventDefault();
    if (!reply.trim() || !token) return;
    setSending(true);
    setNotice('');
    try {
      const response = await fetch('/api/product-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', token, message: reply })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Your reply could not be sent.');
      setMessages((current) => [...current, payload.message]);
      setReply('');
      setNotice(payload.emailSent ? 'Reply sent.' : 'Reply saved, but email notification could not be sent.');
    } catch (error) {
      setNotice(error.message || 'Your reply could not be sent.');
    } finally {
      setSending(false);
    }
  };

  const controlStyle = { width: '100%', boxSizing: 'border-box', padding: '11px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#172b25', font: 'inherit' };

  return (
    <section aria-labelledby="product-chat-title" style={{ marginTop: '24px', padding: '18px', border: '1px solid #d9e5dd', borderRadius: '8px', background: '#fbfdfb' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: '#a34a1c', fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase' }}>Product questions</div>
          <h3 id="product-chat-title" style={{ margin: '4px 0', color: '#173c2b', fontSize: '1.15rem' }}>Chat about this product</h3>
          <p style={{ margin: 0, color: '#53645b', fontSize: '.84rem', lineHeight: 1.5 }}>
            {conversation?.assigned_to === 'vendor' ? `Message ${conversation.vendor_name || 'the vendor'}.` : 'Message the PAZ product team.'}
            {' '}PAZ support can view the conversation and help oversee the discussion.
          </p>
        </div>
        {conversation && <span style={{ color: '#52665b', fontSize: '.75rem' }}>Conversation saved</span>}
      </div>

      {token && !conversation ? <p role="status" style={{ margin: '16px 0 0', color: '#52665b' }}>Opening your conversation…</p> : conversation ? (
        <>
          <div role="log" aria-label="Product chat messages" aria-live="polite" style={{ display: 'grid', gap: '9px', maxHeight: '320px', overflowY: 'auto', marginTop: '14px', padding: '12px', border: '1px solid #e0e8e2', borderRadius: '6px', background: '#fff' }}>
            {messages.map((item) => {
              const isCustomer = item.sender_role === 'customer';
              return <article key={item.id || `${item.sender_role}-${item.created_at}`} style={{ justifySelf: isCustomer ? 'end' : 'start', width: 'min(88%, 560px)', padding: '10px 12px', border: `1px solid ${isCustomer ? '#b8d7c1' : '#dce4df'}`, borderRadius: '6px', background: isCustomer ? '#edf7ef' : '#f7f9f7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#42544a', fontSize: '.74rem', fontWeight: 700 }}>
                  <span>{isCustomer ? 'You' : item.sender_name || 'Product team'}</span>
                  <time dateTime={item.created_at}>{item.created_at ? new Date(item.created_at).toLocaleString() : ''}</time>
                </div>
                <p style={{ margin: '6px 0 0', color: '#263a30', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{item.message}</p>
              </article>;
            })}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendReply} style={{ display: 'grid', gap: '9px', marginTop: '12px' }}>
            <label htmlFor="product-chat-reply" style={{ color: '#34483c', fontSize: '.82rem', fontWeight: 700 }}>Your reply</label>
            <textarea id="product-chat-reply" required maxLength={4000} rows="3" value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a message…" style={{ ...controlStyle, resize: 'vertical' }} />
            <button type="submit" disabled={sending || !reply.trim()} style={{ justifySelf: 'start', border: 0, borderRadius: '6px', padding: '10px 16px', background: sending || !reply.trim() ? '#a8b7ad' : '#17633e', color: '#fff', fontWeight: 800, cursor: sending || !reply.trim() ? 'wait' : 'pointer' }}>{sending ? 'Sending…' : 'Send reply'}</button>
          </form>
          <p style={{ margin: '10px 0 0', color: '#65756a', fontSize: '.77rem', lineHeight: 1.45 }}>
            {emailRepliesEnabled ? 'You can continue here or reply to the email notification.' : 'You can leave this page and continue later using the secure link sent to your email.'}
          </p>
        </>
      ) : (
        <form onSubmit={startConversation} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '9px', marginTop: '14px' }}>
          <label style={{ display: 'grid', gap: '5px', color: '#34483c', fontSize: '.8rem', fontWeight: 700 }}>Your name<input required maxLength={120} autoComplete="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} style={controlStyle} /></label>
          <label style={{ display: 'grid', gap: '5px', color: '#34483c', fontSize: '.8rem', fontWeight: 700 }}>Email address<input required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} style={controlStyle} /></label>
          <label style={{ display: 'grid', gap: '5px', color: '#34483c', fontSize: '.8rem', fontWeight: 700 }}>Phone number<div style={{ display: 'grid', gridTemplateColumns: 'minmax(105px, .8fr) minmax(0, 1.2fr)', gap: '6px' }}><CustomDropdown value={form.countryCode} options={phoneCountries.map((country) => ({ value: country.code, label: `${country.code} (${country.dialCode})` }))} onChange={(countryCode) => setForm((current) => ({ ...current, countryCode, phoneNumber: '' }))} ariaLabel="Phone country" /><input required type="tel" inputMode="numeric" autoComplete="tel-national" placeholder={form.countryCode === 'NG' ? 'Phone number (11 digits)' : 'Phone number'} value={form.phoneNumber} onChange={(event) => { const maxDigits = form.countryCode === 'NG' ? 11 : 15; setForm((current) => ({ ...current, phoneNumber: event.target.value.replace(/\D/g, '').slice(0, maxDigits) })); }} maxLength={form.countryCode === 'NG' ? 11 : 15} style={controlStyle} /></div></label>
          <label style={{ display: 'grid', gap: '5px', gridColumn: '1 / -1', color: '#34483c', fontSize: '.8rem', fontWeight: 700 }}>Your message<textarea required maxLength={4000} rows="4" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} placeholder="Ask about availability, delivery, or the product…" style={{ ...controlStyle, resize: 'vertical' }} /></label>
          <label aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} /></label>
          <button type="submit" disabled={sending} style={{ justifySelf: 'start', gridColumn: '1 / -1', border: 0, borderRadius: '6px', padding: '10px 16px', background: sending ? '#a8b7ad' : '#17633e', color: '#fff', fontWeight: 800, cursor: sending ? 'wait' : 'pointer' }}>{sending ? 'Starting chat…' : 'Start product chat'}</button>
        </form>
      )}

      {notice && <p role="status" style={{ margin: '10px 0 0', color: notice.toLowerCase().includes('could not') || notice.toLowerCase().includes('invalid') ? '#a32929' : '#17633e', fontSize: '.82rem', lineHeight: 1.45 }}>{notice}</p>}
    </section>
  );
}