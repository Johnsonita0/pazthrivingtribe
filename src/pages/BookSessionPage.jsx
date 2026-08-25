import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const createInitial = () => ({
  registrationType: '',
  contactName: '',
  email: '',
  phone: '',
  homeAddress: '',
  programType: '',
  preferredDate: '',
  preferredTime: '',
  sessionFormat: 'In-person',
  note: ''
});

export default function BookSessionPage() {
  const [form, setForm] = useState(createInitial());
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const programs = useMemo(() => ([
    'Thriving Kids', 'Thriving Teens', 'One-on-One Coaching', 'Counselling', 'Workshop'
  ]), []);

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.registrationType) return 'Please select who is booking.';
    if (!form.contactName || !form.email || !form.phone) return 'Please complete contact details.';
    if (!form.programType) return 'Please choose a program.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setToast(err);
    setSaving(true);
    try {
      const payload = {
        registration_type: form.registrationType,
        contact_name: form.contactName,
        email: form.email,
        phone: form.phone,
        home_address: form.homeAddress,
        program_type: form.programType,
        preferred_date: form.preferredDate || null,
        preferred_time: form.preferredTime || null,
        session_format: form.sessionFormat,
        notes: form.note || ''
      };

      const { error } = await supabase.from('tribe_bookings').insert([payload]);
      if (error) throw error;
      setToast('Booking request submitted successfully.');
      setSubmitted(true);
      setForm(createInitial());
    } catch (err) {
      console.error('Booking failed', err);
      setToast('Booking failed. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="teens-registration-page">
        {toast && (
          <div className="teens-registration-toast success" role="status" aria-live="polite">
            <i className="toast-status-icon fa-solid fa-circle-check" aria-hidden="true"></i>
            <span>{toast}</span>
          </div>
        )}
        <div className="teens-registration-card">
          <div className="teens-registration-success">
            <h2>Booking received</h2>
            <p>Thank you. We will contact you to confirm the session.</p>
            <button type="button" onClick={() => navigate('/')} className="teens-registration-link-btn">Return Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teens-registration-page">
      {toast && (
        <div className="teens-registration-toast error">
          <i className="toast-status-icon fa-solid fa-circle-exclamation" aria-hidden="true"></i>
          <span>{toast}</span>
        </div>
      )}
      <div className="teens-registration-card">
        <div className="teens-registration-header">
          <span className="teens-registration-badge">Session Booking</span>
          <h1>Book Your Session</h1>
          <p>Provide contact details and your preferred date/time. We'll reach out to confirm availability and next steps.</p>
        </div>

        <form className="teens-registration-form" onSubmit={handleSubmit}>
          <div className="teens-registration-form-grid type-grid">
            <label className="teens-registration-choice">
              <input type="radio" name="registrationType" value="self" checked={form.registrationType === 'self'} onChange={handleChange} />
              <span>
                <strong>For myself</strong>
                <small>I'm booking a session for myself.</small>
              </span>
            </label>
            <label className="teens-registration-choice">
              <input type="radio" name="registrationType" value="parent" checked={form.registrationType === 'parent'} onChange={handleChange} />
              <span>
                <strong>For my child</strong>
                <small>I'm booking a session on behalf of my child.</small>
              </span>
            </label>
            <label className="teens-registration-choice">
              <input type="radio" name="registrationType" value="other" checked={form.registrationType === 'other'} onChange={handleChange} />
              <span>
                <strong>On behalf of someone</strong>
                <small>I am booking for another person or organisation.</small>
              </span>
            </label>
          </div>

          <div className="teens-registration-form-grid">
            <label className="teens-registration-field">
              <span>Your full name</span>
              <input name="contactName" value={form.contactName} onChange={handleChange} required placeholder="Surname, First name" />
            </label>
            <label className="teens-registration-field">
              <span>Contact email</span>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
            </label>
            <label className="teens-registration-field">
              <span>Contact phone</span>
              <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+234 80..." />
            </label>
            <label className="teens-registration-field full-width">
              <span>Preferred location (optional)</span>
              <input name="homeAddress" value={form.homeAddress} onChange={handleChange} placeholder="City / area or 'Online'" />
            </label>

            <label className="teens-registration-field">
              <span>Which program / service are you booking?</span>
              <select name="programType" value={form.programType} onChange={handleChange} required>
                <option value="">Select a program or service</option>
                {programs.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>

            <label className="teens-registration-field">
              <span>Preferred Date</span>
              <input type="date" name="preferredDate" value={form.preferredDate} onChange={handleChange} />
            </label>

            <label className="teens-registration-field">
              <span>Preferred Time</span>
              <input type="time" name="preferredTime" value={form.preferredTime} onChange={handleChange} />
            </label>

            <label className="teens-registration-field">
              <span>Session Format</span>
              <select name="sessionFormat" value={form.sessionFormat} onChange={handleChange}>
                <option>In-person</option>
                <option>Online (Zoom)</option>
              </select>
            </label>

            <label className="teens-registration-field full-width">
              <span>Notes for the session</span>
              <textarea name="note" value={form.note} onChange={handleChange} rows="4" placeholder="Tell us the reason for booking, goals, or any access needs." />
            </label>
          </div>

          <div className="teens-registration-actions">
            <Link to="/" className="teens-registration-back">Cancel</Link>
            <button type="submit" className="teens-registration-submit" disabled={saving}>{saving ? 'Booking...' : 'Request booking'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
