import React, { useState, useEffect, useRef } from 'react';

export default function ThriverRegistrationModal({
  visible,
  mode = 'register',
  onClose,
  onRegister,
  paystackPublicKey,
  bookingForm,
  setBookingForm,
  bookingSubmitted,
  handleHeroBookingSubmit
}) {
  const isBookingMode = mode === 'booking';
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    age: '',
    gender: 'Female',
    schoolName: '',
    currentClassGrade: '',
    homeAddress: '',
    hobbies: '',
    parentName: '',
    relationship: '',
    phone1: '',
    phone2: '',
    parentEmail: '',
    occupation: '',
    allergies: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    signature: '',
    consentDate: new Date().toISOString().slice(0, 10),
    track: 'Thriving Pre-teen & Teens',
    amount: 10000
  });

  const [goalAreas, setGoalAreas] = useState({
    confidenceBuilding: true,
    publicSpeaking: false,
    communicationSkills: false,
    leadershipResilience: false,
    disciplineIntegrity: false,
    emotionalIntelligence: false,
    goalSetting: false,
    positiveCharacter: false,
    financialLiteracy: false,
    others: false
  });
  const [otherGoal, setOtherGoal] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [paystackReady, setPaystackReady] = useState(false);
  const [passportFile, setPassportFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [passportPreviewUrl, setPassportPreviewUrl] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const passportInputRef = useRef(null);
  const externalApplyUrl = 'https://pazthrivingtribe.schoolsfocus.net/apply';

  const handlePassportPreviewClick = () => {
    if (passportInputRef.current) {
      passportInputRef.current.click();
    }
  };

  const goalLabels = {
    confidenceBuilding: 'Confidence Building',
    publicSpeaking: 'Public Speaking',
    communicationSkills: 'Communication Skills',
    leadershipResilience: 'Leadership and Resilience Skills',
    disciplineIntegrity: 'Discipline, Integrity and Responsibility',
    emotionalIntelligence: 'Emotional Intelligence',
    goalSetting: 'Goal Setting',
    positiveCharacter: 'Positive Character Formation',
    financialLiteracy: 'Financial Literacy',
    others: 'Others'
  };

  useEffect(() => {
    if (!visible) return;
    if (window.PaystackPop) {
      setPaystackReady(true);
      return;
    }

    const existingScript = document.getElementById('paystack-inline-js');
    if (existingScript) {
      setPaystackReady(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'paystack-inline-js';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => setPaystackReady(true);
    script.onerror = () => setStatusMessage('Unable to load Paystack checkout. Please try again later.');
    document.body.appendChild(script);
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setFormData((prev) => ({
        ...prev,
        fullName: '',
        dateOfBirth: '',
        age: '',
        gender: 'Female',
        schoolName: '',
        currentClassGrade: '',
        homeAddress: '',
        hobbies: '',
        parentName: '',
        relationship: '',
        phone1: '',
        phone2: '',
        parentEmail: '',
        occupation: '',
        allergies: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
        signature: '',
        consentDate: new Date().toISOString().slice(0, 10),
        track: 'Thriving Pre-teen & Teens',
        amount: 10000
      }));
      setGoalAreas({
        confidenceBuilding: true,
        publicSpeaking: false,
        communicationSkills: false,
        leadershipResilience: false,
        disciplineIntegrity: false,
        emotionalIntelligence: false,
        goalSetting: false,
        positiveCharacter: false,
        financialLiteracy: false,
        others: false
      });
      setOtherGoal('');
      setStatusMessage('');
      setLoading(false);
      setPassportFile(null);
      setDocumentFile(null);
      setPassportPreviewUrl(null);
      setStepIndex(0);
    }
  }, [visible]);

  useEffect(() => {
    if (!passportFile) {
      setPassportPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(passportFile);
    setPassportPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [passportFile]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (key) => {
    setGoalAreas((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedGoals = Object.entries(goalAreas).reduce((acc, [key, checked]) => {
    if (!checked) return acc;
    if (key === 'others') {
      if (otherGoal.trim()) acc.push(otherGoal.trim());
      return acc;
    }
    acc.push(goalLabels[key]);
    return acc;
  }, []);

  const handlePaymentSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setStatusMessage('');

    if (!formData.parentEmail || !formData.phone1) {
      setStatusMessage('Please provide both parent email and a primary phone number.');
      return;
    }

    if (!paystackReady || !window.PaystackPop) {
      setStatusMessage('Paystack checkout is loading. Please wait a moment and try again.');
      return;
    }

    if (!paystackPublicKey || paystackPublicKey.includes('demo_key_update_from_admin')) {
      setStatusMessage('A valid Paystack test key is required. Please update the public key in admin settings.');
      return;
    }

    setLoading(true);

    const paymentHandler = window.PaystackPop.setup({
      key: paystackPublicKey,
      email: formData.parentEmail,
      amount: Number(formData.amount || 10000) * 100,
      currency: 'NGN',
      ref: `PTT-${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: 'Thriver Name', variable_name: 'thriver_name', value: formData.fullName },
          { display_name: 'Parent Phone', variable_name: 'parent_phone', value: formData.phone1 },
          { display_name: 'Selected Track', variable_name: 'selected_track', value: formData.track }
        ]
      },
      callback: async (response) => {
        const registrationData = {
          ...formData,
          developmentGoals: selectedGoals.join(', '),
          paymentReference: response.reference,
          paymentStatus: 'success',
          passportFile,
          documentFile
        };
        if (onRegister) await onRegister(registrationData);
        setStatusMessage('Payment successful and registration submitted. Thank you!');
        setLoading(false);
        setTimeout(() => {
          setStatusMessage('');
          onClose();
        }, 1200);
      },
      onClose: () => {
        setStatusMessage('Payment was cancelled. You can try again anytime.');
        setLoading(false);
      }
    });

    paymentHandler.openIframe();
  };

  const handlePayLater = async () => {
    setStatusMessage('');
    setLoading(true);
    try {
      const registrationData = {
        ...formData,
        developmentGoals: selectedGoals.join(', '),
        paymentStatus: 'pending',
        paymentMethod: 'bank_transfer',
        passportFile,
        documentFile
      };
      if (onRegister) await onRegister(registrationData);
      setStatusMessage('Registration submitted. Please complete payment via bank transfer using the details provided to you.');
      setLoading(false);
      setTimeout(() => {
        setStatusMessage('');
        onClose();
      }, 2500);
    } catch (err) {
      setStatusMessage('Unable to submit registration. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmitApplication = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setStepIndex(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayNow = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    await handlePaymentSubmit();
  };

  const handleNextStep = () => {
    setStepIndex((prev) => Math.min(prev + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousStep = () => {
    setStepIndex((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <div className="registration-modal-overlay" onClick={onClose}>
      <div className="registration-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="registration-modal-header">
          <div>
            <h3>{isBookingMode ? 'Talk & Thrive Booking' : 'Thriver Registration Form'}</h3>
            <p className="registration-prompt-banner">
              {isBookingMode
                ? 'Use this quick form to request a counseling session. We will contact you shortly.'
                : 'Use the step flow to complete your application. Preview and submit once all information is ready.'}
            </p>
          </div>
          <button className="registration-modal-close-btn" type="button" onClick={onClose} aria-label="Close registration form">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {isBookingMode ? (
          <div>
            {bookingSubmitted ? (
              <div className="status-feedback-banner" style={{ marginTop: '0.5rem' }}>
                <i className="fa-solid fa-circle-check"></i> Your booking request has been received and we will follow up soon.
              </div>
            ) : (
              <form onSubmit={handleHeroBookingSubmit} className="cms-creation-form-layout" style={{ marginTop: '0.7rem' }}>
                <div className="registration-fields-grid">
                  <div className="form-input-container">
                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Full Name</label>
                    <input
                      type="text"
                      required
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="plain-text-input"
                    />
                  </div>
                  <div className="form-input-container">
                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Email Address</label>
                    <input
                      type="email"
                      required
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="plain-text-input"
                    />
                  </div>
                </div>
                <div className="registration-fields-grid">
                  <div className="form-input-container">
                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+234..."
                      className="plain-text-input"
                    />
                  </div>
                  <div className="form-input-container">
                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Client Type</label>
                    <select
                      value={bookingForm.clientType}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, clientType: e.target.value }))}
                      className="plain-text-input"
                    >
                      <option value="Individual">Individual</option>
                      <option value="Parent">Parent / Guardian</option>
                      <option value="Teen">Teen</option>
                      <option value="Woman">Woman / Young Adult</option>
                    </select>
                  </div>
                </div>
                <div className="registration-fields-grid">
                  <div className="form-input-container">
                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Session Type</label>
                    <select
                      value={bookingForm.sessionType}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, sessionType: e.target.value }))}
                      className="plain-text-input"
                    >
                      <option value="Virtual">Virtual</option>
                      <option value="In-person">In-person</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div className="form-input-container">
                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Preferred Time</label>
                    <select
                      value={bookingForm.preferredTime}
                      onChange={(e) => setBookingForm((prev) => ({ ...prev, preferredTime: e.target.value }))}
                      className="plain-text-input"
                    >
                      <option value="Any time">Any time</option>
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening">Evening</option>
                    </select>
                  </div>
                </div>
                <div className="form-input-container">
                  <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>What would you like support with?</label>
                  <textarea
                    rows="5"
                    required
                    value={bookingForm.concern}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, concern: e.target.value }))}
                    placeholder="Share what you need help with."
                    className="plain-text-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.75rem' }}>
                  <button type="submit" className="form-submit-action-btn" style={{ minWidth: '220px' }}>
                    <i className="fa-solid fa-paper-plane"></i> Send Booking Request
                  </button>
                  <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Close
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="registration-modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div>
                  <h4 style={{ margin: 0 }}>Apply through the official registration form</h4>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>
                    Complete your application directly below. If the form does not load, use the button to open it in a new tab.
                  </p>
                </div>
                <a
                  href={externalApplyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="form-submit-action-btn"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  Open in new tab
                </a>
              </div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', minHeight: '70vh', background: '#fff' }}>
                <iframe
                  src={`/api/proxy-page?url=${encodeURIComponent(externalApplyUrl)}`}
                  title="Paz Thriving Tribe Application Form"
                  style={{ width: '100%', minHeight: '70vh', border: 'none' }}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        )}

        {stepIndex === 2 && (
          <div className="registration-preview-card">
            <div className="registration-preview-header">
              <h4>Preview Registration Details</h4>
              <button type="button" className="form-submit-action-btn" style={{ background: '#2563eb', borderColor: '#2563eb', marginLeft: 'auto' }} onClick={() => window.print()}>
                <i className="fa-solid fa-print"></i> Print / Save PDF
              </button>
            </div>
            <div className="registration-preview-row">
              <div className="registration-preview-photo">
                {passportPreviewUrl ? (
                  <img src={passportPreviewUrl} alt="passport" className="registration-preview-photo-img" />
                ) : (
                  <div className="registration-preview-photo-placeholder">Passport preview</div>
                )}
              </div>
              <div className="registration-preview-details">
                <div className="preview-item"><span>Full Name:</span> {formData.fullName}</div>
                <div className="preview-item"><span>DOB:</span> {formData.dateOfBirth}</div>
                <div className="preview-item"><span>Age:</span> {formData.age}</div>
                <div className="preview-item"><span>Gender:</span> {formData.gender}</div>
                <div className="preview-item"><span>School:</span> {formData.schoolName}</div>
                <div className="preview-item"><span>Class / Grade:</span> {formData.currentClassGrade}</div>
                <div className="preview-item"><span>Parent / Guardian:</span> {formData.parentName}</div>
                <div className="preview-item"><span>Primary Phone:</span> {formData.phone1}</div>
                <div className="preview-item"><span>Email:</span> {formData.parentEmail}</div>
                <div className="preview-item"><span>Selected Track:</span> {formData.track}</div>
                <div className="preview-item"><span>Development Goals:</span> {selectedGoals.join(', ') || 'Not specified'}</div>
                <div className="preview-item"><span>Home Address:</span> {formData.homeAddress}</div>
                <div className="preview-item"><span>Hobbies / Interests:</span> {formData.hobbies}</div>
                <div className="preview-item"><span>Allergies / Conditions:</span> {formData.allergies || 'None listed'}</div>
              </div>
            </div>
            <div className="registration-action-row">
              <button type="button" className="form-submit-action-btn" onClick={handleSubmitApplication} disabled={loading} style={{ flex: '1 1 220px' }}>
                <i className="fa-solid fa-file-circle-check"></i> Submit Application
              </button>
              <button type="button" className="form-cancel-action-btn" onClick={handlePreviousStep} style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.6rem 1rem', flex: '0 0 auto' }}>Edit</button>
              <button type="button" className="form-cancel-action-btn" onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.6rem 1rem', flex: '0 0 auto' }}>Cancel</button>
            </div>
          </div>
        )}

        {stepIndex === 3 && (
          <div className="registration-confirmation-card">
            <h3>Application Submitted</h3>
            <p>Your application has been successfully submitted and will be reviewed by an admin. Once approved, you can complete payment and join Paz Thriving Teens Academy.</p>
            <div className="registration-confirmation-actions">
              <button type="button" className="form-submit-action-btn" onClick={handlePayNow} disabled={loading}>
                <i className="fa-solid fa-credit-card"></i> Pay Now
              </button>
              <button type="button" className="form-submit-action-btn" onClick={handlePayLater} disabled={loading} style={{ background: '#f6ad55', borderColor: '#f6ad55' }}>
                <i className="fa-solid fa-money-bill-transfer"></i> Pay Later
              </button>
              <button type="button" className="form-cancel-action-tn" onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.6rem 1rem' }}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
