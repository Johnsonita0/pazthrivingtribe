import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import CustomDropdown from '../components/CustomDropdown';
import '../css/teens-registration.css';

const createChild = () => ({
  id: `child-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  childName: '',
  dateOfBirth: '',
  gender: '',
  schoolName: '',
  classGrade: '',
  strengths: '',
  improvementArea: '',
  focusArea: '',
  programType: '',
  preferredSession: '',
  note: ''
});

const initialForm = {
  registrationType: '',
  contactName: '',
  email: '',
  phone: '',
  homeAddress: '',
  children: [createChild()],
  hearAboutUs: '',
  note: ''
};

const baseSteps = {
  type: { id: 'type', label: 'Registering As', title: 'Who is registering?', description: 'Choose the person making the registration.' },
  contact: { id: 'contact', label: 'Contact Details', title: 'Parent or guardian details', description: 'Add the main contact details for this registration.' },
  children: { id: 'children', label: 'Children', title: 'Add your children', description: 'Add each child and complete their profile one by one.' },
  program: { id: 'program', label: 'Program Match', title: 'Program preferences', description: 'Choose the session and focus area for the selected child.' },
  review: { id: 'review', label: 'Review', title: 'Review and confirm', description: 'Check the full registration before submitting.' }
};

function DateOfBirthPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const parsedValue = value ? new Date(`${value}T12:00:00`) : null;
  const [viewDate, setViewDate] = useState(parsedValue || new Date());
  const [activeDate, setActiveDate] = useState(parsedValue || new Date());
  const pickerRef = useRef(null);
  const today = new Date();
  const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const firstWeekday = monthStart.getDay();
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: firstWeekday + daysInMonth }, (_, index) => index < firstWeekday ? null : index - firstWeekday + 1);
  const formatDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    const close = (event) => { if (!pickerRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const chooseDay = (day) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 12);
    if (selected > today) return;
    onChange(formatDate(selected));
    setActiveDate(selected);
    setOpen(false);
  };

  const moveActiveDate = (offset) => {
    const next = new Date(activeDate);
    next.setDate(next.getDate() + offset);
    if (next > today || next.getFullYear() < 1990) return;
    setActiveDate(next);
    setViewDate(next);
  };

  return <div ref={pickerRef} className="teens-registration-date-picker">
    <button type="button" className="teens-registration-date-trigger" aria-label="Date of birth" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <span>{value || 'Choose date of birth'}</span><span aria-hidden="true">▣</span>
    </button>
    {open && <div className="teens-registration-calendar" role="dialog" aria-label="Choose date of birth" onKeyDown={(event) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key === 'ArrowLeft') moveActiveDate(-1);
      if (event.key === 'ArrowRight') moveActiveDate(1);
      if (event.key === 'ArrowUp') moveActiveDate(-7);
      if (event.key === 'ArrowDown') moveActiveDate(7);
      if (event.key === 'Enter' && activeDate <= today) chooseDay(activeDate.getDate());
    }}>
      <div className="teens-registration-calendar-header"><button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} aria-label="Previous month">‹</button><strong>{viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong><button type="button" onClick={() => { const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1); if (next <= today) setViewDate(next); }} aria-label="Next month">›</button></div>
      <div className="teens-registration-calendar-weekdays">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
      <div className="teens-registration-calendar-grid">{days.map((day, index) => {
        if (!day) return <span key={`empty-${index}`} />;
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day, 12);
        const dateValue = formatDate(date);
        const isSelected = dateValue === value;
        const isActive = formatDate(activeDate) === dateValue;
        return <button key={dateValue} type="button" className={`${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''}`} disabled={date > today} onClick={() => chooseDay(day)}>{day}</button>;
      })}</div>
      <div className="teens-registration-calendar-hint">Use arrow keys to move · Enter to choose</div>
    </div>}
  </div>;
}

export default function TeensRegistrationPage({ paystackPublicKey = '' }) {
  const [formData, setFormData] = useState(initialForm);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [lastSubmittedEmail, setLastSubmittedEmail] = useState('');
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(true);
  const [formToast, setFormToast] = useState({ message: '', type: 'error' });
  const [paystackReady, setPaystackReady] = useState(false);
  const formCardRef = useRef(null);

  useEffect(() => {
    if (window.PaystackPop) {
      setPaystackReady(true);
      return undefined;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => setPaystackReady(true);
    document.body.appendChild(script);
    return () => { script.onload = null; };
  }, []);

  const currentChild = formData.children[selectedChildIndex] || formData.children[0];

  const completedSteps = useMemo(() => {
    const result = {};

    result.type = !!formData.registrationType;
    result.contact = !!(formData.contactName && formData.email && formData.phone && formData.homeAddress);
    result.children = formData.children.some((child) => child.childName && child.dateOfBirth && child.gender);
    result.program = formData.children.some((child) => child.programType && child.preferredSession && child.focusArea);
    result.review = true;

    return result;
  }, [formData]);

  const stepsDynamic = useMemo(() => {
    // Put children detail step before contact details (per request).
    const isSelf = formData.registrationType === 'self';
    const childrenLabel = isSelf ? 'Personal Details' : baseSteps.children.label;
    const childrenTitle = isSelf ? 'Personal Details' : baseSteps.children.title;
    const childrenDescription = isSelf
      ? 'Enter your personal details (name, DOB, gender, strengths) to help match you to a program.'
      : 'Add each child and complete their profile one by one. Use the "+ Add child" button to add more children and make sure to provide name, date of birth, and gender for each child.';

    return [
      baseSteps.type,
      { ...baseSteps.children, label: childrenLabel, title: childrenTitle, description: childrenDescription },
      baseSteps.contact,
      baseSteps.program,
      baseSteps.review
    ];
  }, [formData.registrationType]);

  const currentStepMeta = stepsDynamic[currentStep];

  useEffect(() => {
    if (!formToast.message) return undefined;

    const timer = window.setTimeout(() => {
      setFormToast({ message: '', type: 'error' });
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [formToast.message]);

  useEffect(() => {
    if (selectedChildIndex >= formData.children.length) {
      window.requestAnimationFrame(() => {
        setSelectedChildIndex(Math.max(0, formData.children.length - 1));
      });
    }
  }, [formData.children.length, selectedChildIndex]);

  useEffect(() => {
    // If the user chooses to register themselves, enforce a single child profile
    if (formData.registrationType === 'self') {
      if (formData.children.length !== 1) {
        // schedule updates to avoid synchronous setState inside effect
        window.requestAnimationFrame(() => {
          setFormData((current) => ({ ...current, children: [createChild()] }));
          setSelectedChildIndex(0);
        });
      }
    }
  }, [formData.registrationType]);

  useEffect(() => {
    requestAnimationFrame(() => {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [currentStep]);

  const getFriendlyRegistrationError = (error) => {
    const rawMessage = String(error?.message || error || '');
    const normalized = rawMessage.toLowerCase();

    if (
      normalized.includes('failed to fetch') ||
      normalized.includes('network error') ||
      normalized.includes('load failed') ||
      normalized.includes('fetch failed') ||
      normalized.includes('connection')
    ) {
      return 'We could not reach the server. Please check your internet connection and try again. If the issue continues, email pazthrivingtribe@gmail.com and we will help complete your registration.';
    }

    if (normalized.includes('timeout') || normalized.includes('timed out')) {
      return 'The request took too long to complete. Please try again in a moment.';
    }

    if (
      normalized.includes('502') ||
      normalized.includes('bad gateway') ||
      normalized.includes('503') ||
      normalized.includes('service unavailable') ||
      normalized.includes('unexpected end of json') ||
      normalized.includes('json input')
    ) {
      return 'Our server is temporarily busy. Please try again in a few minutes. Your registration is not lost, and we can still assist you by email if needed.';
    }

    if (normalized.includes('supabase') || normalized.includes('database')) {
      return 'The form is working, but the registration database is currently unavailable. Please try again in a moment or email pazthrivingtribe@gmail.com for help.';
    }

    return 'We could not complete your registration right now. Please try again in a moment, or email pazthrivingtribe@gmail.com for direct assistance.';
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (formToast.message) {
      setFormToast({ message: '', type: 'error' });
    }
  };

  const handleChildChange = (childIndex, field, value) => {
    setFormData((current) => ({
      ...current,
      children: current.children.map((child, index) =>
        index === childIndex ? { ...child, [field]: value } : child
      )
    }));

    if (formToast.message) {
      setFormToast({ message: '', type: 'error' });
    }
  };

  const addChild = () => {
    if (formData.registrationType === 'self') return;

    const newChild = createChild();
    setFormData((current) => {
      const children = [...current.children, newChild];
      // schedule selected index update after state is applied to avoid stale reads
      window.requestAnimationFrame(() => setSelectedChildIndex(children.length - 1));
      return { ...current, children };
    });
  };

  const removeChild = (childIndex) => {
    setFormData((current) => {
      // ensure at least one child remains
      if (current.children.length <= 1) {
        const single = [createChild()];
        window.requestAnimationFrame(() => setSelectedChildIndex(0));
        return { ...current, children: single };
      }

      const children = current.children.filter((_, index) => index !== childIndex);
      // schedule selected index update using the new children length
      window.requestAnimationFrame(() => {
        setSelectedChildIndex((currentIndex) => Math.max(0, Math.min(currentIndex, children.length - 1)));
      });

      return { ...current, children };
    });
  };

  const goToStep = (index) => {
    if (index < 0 || index >= stepsDynamic.length) return;
    setCurrentStep(index);
  };

  const validateCurrentStep = () => {
    const stepId = stepsDynamic[currentStep]?.id;

    if (stepId === 'type') {
      if (!formData.registrationType) {
        return 'Please choose who is registering before continuing.';
      }
    }

    if (stepId === 'contact') {
      if (!formData.contactName || !formData.email || !formData.phone || !formData.homeAddress) {
        return 'Please fill in the parent or guardian details before continuing.';
      }
    }

    if (stepId === 'children') {
      if (!formData.children.length || !formData.children.every((child) => child.childName && child.dateOfBirth && child.gender)) {
        return formData.registrationType === 'self'
          ? 'Please complete your personal details before continuing.'
          : 'Please complete each child profile before continuing.';
      }
    }

    if (stepId === 'program') {
      if (!formData.children.every((child) => child.programType && child.preferredSession && child.focusArea)) {
        return 'Please choose the program and session details for each child before continuing.';
      }
    }

    return '';
  };

  const handleNext = () => {
    const validationError = validateCurrentStep();
    if (validationError) {
      setFormToast({ message: validationError, type: 'error' });
      return;
    }

    setFormToast({ message: '', type: 'error' });
    setCurrentStep((prev) => Math.min(prev + 1, stepsDynamic.length - 1));
  };

  const handlePrevious = () => {
    setFormToast({ message: '', type: 'error' });
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const persistRegistration = async (paymentReference) => {
    const validationError = validateCurrentStep();
    if (validationError) {
      setFormToast({ message: validationError, type: 'error' });
      return;
    }

    setSaving(true);
    setFormToast({ message: '', type: 'error' });

    try {
      const summary = formData.children.map((child) => ({
        child_name: child.childName,
        dob: child.dateOfBirth,
        gender: child.gender,
        school: child.schoolName,
        class_grade: child.classGrade,
        strengths: child.strengths,
        improvement_area: child.improvementArea,
        focus_area: child.focusArea,
        program_type: child.programType,
        preferred_session: child.preferredSession,
        child_note: child.note
      }));

      const buildPayload = (withOptionalFields = true) => {
        const payload = {
          registration_type: formData.registrationType,
          parent_or_guardian_name: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          home_address: formData.homeAddress,
          notes: formData.note || 'No additional notes'
        };

        payload.payment_reference = paymentReference;
        payload.payment_status = 'paid';

        if (withOptionalFields) {
          payload.children_count = formData.children.length;
          payload.source = formData.hearAboutUs || 'Not provided';
          payload.children_details = JSON.stringify(summary);
          payload.full_name = formData.children[0]?.childName || formData.contactName;
        }

        return payload;
      };

      const candidatePayloads = [
        buildPayload(true),
        buildPayload(false),
        {
          registration_type: formData.registrationType,
          parent_or_guardian_name: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          home_address: formData.homeAddress,
          notes: formData.note || 'No additional notes'
        }
      ];

      let finalError = null;
      for (const payload of candidatePayloads) {
        const { error } = await supabase.from('tribe_applicants').insert([payload]);
        if (!error) {
          let emailSent = true;

          try {
            const emailResponse = await fetch('/api/send-registration-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                to: formData.email,
                name: formData.contactName || formData.children[0]?.childName || 'Parent / Guardian',
                registrationType: formData.registrationType,
                programType: formData.children[0]?.programType || 'Thriving Teens Academy',
                childrenCount: formData.children.length,
                hearAboutUs: formData.hearAboutUs || 'Website registration',
                note: formData.note || 'No additional notes',
                paymentReference,
                paymentStatus: 'paid'
              })
            });

            const emailData = await emailResponse.json().catch(() => ({}));
            if (!emailResponse.ok) {
              throw new Error(emailData?.error || 'Unable to send confirmation email.');
            }
          } catch (emailError) {
            console.error('Registration email notification failed:', emailError);
            emailSent = false;
          }

          setLastSubmittedEmail(formData.email);
          setConfirmationEmailSent(emailSent);
          setSubmitted(true);
          setFormData(initialForm);
          setSelectedChildIndex(0);
          setCurrentStep(0);
          return;
        }

        finalError = error;
        const message = String(error?.message || '');
        if (!/children_count|source|full_name|children_details/i.test(message)) {
          break;
        }
      }

      if (finalError) {
        console.error('Supabase insert error:', finalError);
        throw finalError;
      }
    } catch (err) {
      console.error('PTTA registration submission failed:', err);
      setSubmitted(false);
      setFormToast({
        message: getFriendlyRegistrationError(err),
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  void persistRegistration;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const validationError = validateCurrentStep();
    if (validationError) {
      setFormToast({ message: validationError, type: 'error' });
      return;
    }
    if (!paystackReady || !window.PaystackPop) {
      setFormToast({ message: 'Payment checkout is still loading. Please try again shortly.', type: 'error' });
      return;
    }
    if (!paystackPublicKey || paystackPublicKey.includes('demo_key_update_from_admin')) {
      setFormToast({ message: 'Paystack is not configured yet.', type: 'error' });
      return;
    }
    setSaving(true);
    const paymentHandler = window.PaystackPop.setup({
      key: paystackPublicKey,
      email: formData.email,
      amount: 500000,
      currency: 'NGN',
      ref: `REG-${Date.now()}`,
      metadata: { custom_fields: [{ display_name: 'Service', variable_name: 'service', value: 'Registration' }, { display_name: 'Program', variable_name: 'program', value: formData.children[0]?.programType || 'Thriving Teens Academy' }] },
      callback: async (response) => {
        try {
          const completionResponse = await fetch('/api/complete-service-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
            type: 'registration', reference: response.reference, email: formData.email,
            details: { registration_type: formData.registrationType, parent_or_guardian_name: formData.contactName, full_name: formData.children[0]?.childName || formData.contactName, phone: formData.phone, home_address: formData.homeAddress, children_count: formData.children.length, source: formData.hearAboutUs || 'Website registration', children_details: formData.children, notes: formData.note || 'No additional notes', track: formData.children[0]?.programType || 'Thriving Teens Academy' }
          }) });
          const completion = await completionResponse.json().catch(() => ({}));
          if (!completionResponse.ok) throw new Error(completion.error || 'Payment completed but registration could not be saved.');
          setLastSubmittedEmail(formData.email);
          setConfirmationEmailSent(true);
          setSubmitted(true);
          setFormData(initialForm);
          setSelectedChildIndex(0);
          setCurrentStep(0);
          setSaving(false);
        } catch (error) {
          setFormToast({ message: error.message, type: 'error' });
          setSaving(false);
        }
      },
      onClose: () => { setSaving(false); setFormToast({ message: 'Payment was cancelled.', type: 'error' }); }
    });
    paymentHandler.openIframe();
  };

  const renderRegistrantTypeStep = () => (
    <div className="teens-registration-form-grid type-grid">
      <label className="teens-registration-choice">
        <input
          type="radio"
          name="registrationType"
          value="self"
          checked={formData.registrationType === 'self'}
          onChange={handleChange}
        />
        <span>
          <strong>I am registering myself</strong>
          <small>I am the child and I am completing this form myself.</small>
        </span>
      </label>

      <label className="teens-registration-choice">
        <input
          type="radio"
          name="registrationType"
          value="parent"
          checked={formData.registrationType === 'parent'}
          onChange={handleChange}
        />
        <span>
          <strong>I am a parent</strong>
          <small>I want to register one or more children for the program.</small>
        </span>
      </label>

      <label className="teens-registration-choice">
        <input
          type="radio"
          name="registrationType"
          value="guardian"
          checked={formData.registrationType === 'guardian'}
          onChange={handleChange}
        />
        <span>
          <strong>I am a guardian</strong>
          <small>I am registering a child in my care and need to add their details.</small>
        </span>
      </label>
    </div>
  );

  const renderContactStep = () => (
    <div className="teens-registration-form-grid">
      <label className="teens-registration-field">
        <span>{formData.registrationType === 'self' ? 'Your Full Name' : 'Parent / Guardian Full Name'}</span>
        <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} placeholder="Enter full name" required />
      </label>

      <label className="teens-registration-field">
        <span>Email Address</span>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
      </label>

      <label className="teens-registration-field">
        <span>Phone Number</span>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
      </label>

      <label className="teens-registration-field full-width">
        <span>Home Address</span>
        <input type="text" name="homeAddress" value={formData.homeAddress} onChange={handleChange} placeholder="Your location / area" required />
      </label>
    </div>
  );

  const renderChildrenStep = () => (
    <div className="teens-registration-children-wrapper">
      <div className="teens-registration-child-tabs">
        {formData.children.map((child, index) => (
          <button
            key={child.id}
            type="button"
            className={`teens-child-tab ${selectedChildIndex === index ? 'active' : ''}`}
            onClick={() => setSelectedChildIndex(index)}
          >
            {formData.registrationType === 'self' ? 'Personal Details' : `Child ${index + 1}`}
          </button>
        ))}
        {formData.registrationType !== 'self' && (
          <button type="button" className="teens-add-child-btn" onClick={addChild}>
            + Add child
          </button>
        )}
      </div>

      <div className="teens-registration-form-grid child-editor">
        <label className="teens-registration-field">
          <span>{formData.registrationType === 'self' ? "Your Full Name" : "Child's Full Name"}</span>
          <input
            type="text"
            value={currentChild.childName}
            onChange={(event) => handleChildChange(selectedChildIndex, 'childName', event.target.value)}
            placeholder={formData.registrationType === 'self' ? 'Your full name' : 'Surname, First Name, Middle Name'}
          />
        </label>

        <label className="teens-registration-field">
          <span>Date of birth</span>
          <DateOfBirthPicker value={currentChild.dateOfBirth} onChange={(value) => handleChildChange(selectedChildIndex, 'dateOfBirth', value)} />
        </label>

        <label className="teens-registration-field">
          <span>Gender</span>
          <CustomDropdown value={currentChild.gender} onChange={(value) => handleChildChange(selectedChildIndex, 'gender', value)} ariaLabel="Gender" placeholder="Select gender" options={[{ value: '', label: 'Select gender' }, { value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]} />
        </label>

        <label className="teens-registration-field">
          <span>Current Class / Grade</span>
          <input
            type="text"
            value={currentChild.classGrade}
            onChange={(event) => handleChildChange(selectedChildIndex, 'classGrade', event.target.value)}
            placeholder="Primary 4, JSS 2, SS1..."
          />
        </label>

        <label className="teens-registration-field full-width">
          <span>{formData.registrationType === 'self' ? 'Your strengths' : 'Strength of the child'}</span>
          <textarea
            rows="3"
            value={currentChild.strengths}
            onChange={(event) => handleChildChange(selectedChildIndex, 'strengths', event.target.value)}
            placeholder={formData.registrationType === 'self' ? "Describe your strengths, talents, or positive qualities." : "Describe the child's strengths, talents, or positive qualities."}
          />
        </label>

        <label className="teens-registration-field full-width">
          <span>{formData.registrationType === 'self' ? 'What would you like to build or improve?' : 'What area would you like your child to build or improve?'}</span>
          <textarea
            rows="3"
            value={currentChild.improvementArea}
            onChange={(event) => handleChildChange(selectedChildIndex, 'improvementArea', event.target.value)}
            placeholder={formData.registrationType === 'self' ? "Example: confidence, focus, communication, discipline, emotional intelligence..." : "Example: confidence, focus, communication, discipline, emotional intelligence..."}
          />
        </label>

        {formData.children.length > 1 && (
          <div className="teens-registration-child-remove full-width">
            <button type="button" onClick={() => removeChild(selectedChildIndex)}>
              Remove this child
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderProgramStep = () => (
    <div className="teens-registration-children-wrapper">
      <div className="teens-registration-child-tabs">
        {formData.children.map((child, index) => (
          <button
            key={child.id}
            type="button"
            className={`teens-child-tab ${selectedChildIndex === index ? 'active' : ''}`}
            onClick={() => setSelectedChildIndex(index)}
          >
            {formData.registrationType === 'self' ? 'Personal Details' : (child.childName ? child.childName : `Child ${index + 1}`)}
          </button>
        ))}
      </div>

      <div className="teens-registration-form-grid">
        <label className="teens-registration-field">
          <span>{formData.registrationType === 'self' ? 'Program Type for you' : `Program Type for ${currentChild.childName || `Child ${selectedChildIndex + 1}`}`}</span>
          <CustomDropdown value={currentChild.programType} onChange={(value) => handleChildChange(selectedChildIndex, 'programType', value)} ariaLabel="Program type" placeholder="Select program type" options={[{ value: '', label: 'Select program type' }, { value: 'Thriving Kids', label: 'Thriving Pre-Teens (Ages 8-12)' }, { value: 'Thriving Teens', label: 'Thriving Teens (Ages 13-19)' }]} />
        </label>

        <label className="teens-registration-field">
          <span>Preferred Session</span>
          <CustomDropdown value={currentChild.preferredSession} onChange={(value) => handleChildChange(selectedChildIndex, 'preferredSession', value)} ariaLabel="Preferred session" placeholder="Select session" options={[{ value: '', label: 'Select session' }, { value: 'Saturday 3:00 PM - 5:00 PM', label: 'Saturday 3:00 PM - 5:00 PM' }, { value: 'One-on-One Coaching', label: 'One-on-One Coaching' }, { value: 'Flexible / To Be Discussed', label: 'Flexible / To Be Discussed' }]} />
        </label>

        <label className="teens-registration-field">
          <span>Primary Area of Interest</span>
          <CustomDropdown value={currentChild.focusArea} onChange={(value) => handleChildChange(selectedChildIndex, 'focusArea', value)} ariaLabel="Primary area of interest" placeholder="Select area of interest" options={['Confidence Building', 'Leadership Development', 'Communication Mastery', 'Character Formation', 'Financial Literacy', 'Faith and Values', 'Creative Expression', 'Academic Excellence Support', 'One-on-One Coaching'].map((option) => ({ value: option, label: option }))} />
        </label>

        <label className="teens-registration-field">
          <span>How did you hear about us?</span>
          <input
            type="text"
            name="hearAboutUs"
            value={formData.hearAboutUs}
            onChange={handleChange}
            placeholder="WhatsApp, Instagram, school, church, referral..."
          />
        </label>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="teens-registration-review">
      <div className="teens-registration-review-grid">
        <div className="review-group">
          <h4>Registration Type</h4>
          <p><strong>Registering as:</strong> {formData.registrationType === 'self' ? 'Me' : formData.registrationType === 'parent' ? 'Parent' : 'Guardian'}</p>
          <p><strong>Contact:</strong> {formData.contactName || 'Not provided'}</p>
          <p><strong>Email:</strong> {formData.email || 'Not provided'}</p>
          <p><strong>Phone:</strong> {formData.phone || 'Not provided'}</p>
        </div>

        {formData.children.map((child, index) => (
          <div key={child.id} className="review-group">
            <h4>{formData.registrationType === 'self' ? 'Personal Details' : `Child ${index + 1}`}</h4>
            <p><strong>Name:</strong> {child.childName || 'Not provided'}</p>
            <p><strong>Date of birth:</strong> {child.dateOfBirth || 'Not provided'}</p>
            <p><strong>School:</strong> {child.schoolName || 'Not provided'}</p>
            <p><strong>Grade:</strong> {child.classGrade || 'Not provided'}</p>
            <p><strong>Strengths:</strong> {child.strengths || 'Not provided'}</p>
            <p><strong>Area to improve:</strong> {child.improvementArea || 'Not provided'}</p>
            <p><strong>Program:</strong> {child.programType || 'Not provided'}</p>
            <p><strong>Session:</strong> {child.preferredSession || 'Not provided'}</p>
            <p><strong>Focus area:</strong> {child.focusArea || 'Not provided'}</p>
          </div>
        ))}
      </div>

      <label className="teens-registration-field full-width">
        <span>Anything you would like us to know?</span>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows="4"
            placeholder={formData.registrationType === 'self' ? "Share any additional information you'd like us to know." : "Share any additional information about the child or family."}
          />
      </label>
    </div>
  );

  const renderStepContent = () => {
    const stepId = currentStepMeta?.id;
    if (stepId === 'type') return renderRegistrantTypeStep();
    if (stepId === 'contact') return renderContactStep();
    if (stepId === 'children') return renderChildrenStep();
    if (stepId === 'program') return renderProgramStep();
    return renderReviewStep();
  };

  return (
    <div className="teens-registration-page">
      {formToast.message && (
        <div className={`teens-registration-toast ${formToast.type}`} role="alert" aria-live="assertive">
          <i
            className={`toast-status-icon fa-solid ${formToast.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}
            aria-hidden="true"
          ></i>
          <span>{formToast.message}</span>
          <button type="button" onClick={() => setFormToast({ message: '', type: 'error' })} aria-label="Dismiss notification">×</button>
        </div>
      )}

      <div className="teens-registration-card" ref={formCardRef}>
        <div className="teens-registration-header">
          <span className="teens-registration-badge">PTTA Registration</span>
          <h1>Paz Thriving Teens Academy</h1>
          <p>
            Raising Confident, Kind, and Purposeful Leaders through coaching, mentoring, life skills,
            leadership values, and character formation for children and teenagers.
          </p>
        </div>

        {submitted ? (
          <div className="teens-registration-success">
            <div className="teens-registration-success-icon">✓</div>
            <h2>Thank you for registering!</h2>
            <p>
              {confirmationEmailSent
                ? `A confirmation email has been sent to ${lastSubmittedEmail || 'your inbox'}. We have received your registration request for Paz Thriving Teens Academy and a member of our team will contact you shortly with the next steps and orientation details.`
                : `We have received your registration request for Paz Thriving Teens Academy. A member of our team will contact you at ${lastSubmittedEmail || 'your email address'} soon. If you do not receive a confirmation email within a few minutes, please email pazthrivingtribe@gmail.com for support.`}
            </p>
            <Link to="/" className="teens-registration-link-btn">
              Return Home
            </Link>
          </div>
        ) : (
          <form className="teens-registration-form" onSubmit={handleSubmit}>
            <div className="teens-registration-progress">
              {stepsDynamic.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  className={`teens-step-tab ${index === currentStep ? 'active' : ''} ${completedSteps[step.id] ? 'complete' : ''}`}
                  onClick={() => goToStep(index)}
                >
                  <span className="teens-step-number">{index + 1}</span>
                  <span className="teens-step-label">{step.label}</span>
                </button>
              ))}
            </div>

            <div className="teens-registration-step-header">
              <div>
                <div className="teens-step-breadcrumb">Step {currentStep + 1} of {stepsDynamic.length}</div>
                <h2>{currentStepMeta.title}</h2>
              </div>
              <p>{currentStepMeta.description}</p>
            </div>

            <div className="teens-mobile-step-view">
              <span className="teens-mobile-step-tag">Current tab</span>
              <strong>{currentStepMeta.label}</strong>
            </div>

            {renderStepContent()}

            <div className="teens-registration-actions">
              <button type="button" className="teens-registration-back" onClick={handlePrevious} disabled={currentStep === 0}>
                Back
              </button>

              {currentStep < stepsDynamic.length - 1 ? (
                <button type="button" className="teens-registration-submit" onClick={handleNext}>
                  Next: {stepsDynamic[currentStep + 1].label}
                </button>
              ) : (
                <button type="submit" className="teens-registration-submit" disabled={saving}>
                  {saving ? 'Submitting...' : 'Submit Registration'}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
