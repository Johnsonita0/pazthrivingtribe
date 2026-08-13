import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../css/teens-registration.css';
import confetti from 'canvas-confetti';

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

export default function TeensRegistrationPage() {
  const [formData, setFormData] = useState(initialForm);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [formToast, setFormToast] = useState({ message: '', type: 'error' });
  const formCardRef = useRef(null);

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
    const childrenLabel = formData.registrationType === 'self' ? 'Personal Details' : baseSteps.children.label;
    return [
      baseSteps.type,
      { ...baseSteps.children, label: childrenLabel },
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
    setFormData((current) => ({
      ...current,
      children: [...current.children, newChild]
    }));
    setSelectedChildIndex(formData.children.length);
  };

  const removeChild = (childIndex) => {
    if (formData.children.length === 1) {
      setFormData((current) => ({
        ...current,
        children: [createChild()]
      }));
      setSelectedChildIndex(0);
      return;
    }

    setFormData((current) => ({
      ...current,
      children: current.children.filter((_, index) => index !== childIndex)
    }));

    setSelectedChildIndex((currentIndex) => Math.max(0, Math.min(currentIndex, formData.children.length - 2)));
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

  const handleSubmit = async (event) => {
    event.preventDefault();
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

      const payload = {
        registration_type: formData.registrationType,
        parent_or_guardian_name: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        home_address: formData.homeAddress,
        children_count: formData.children.length,
        source: formData.hearAboutUs || 'Not provided',
        children_details: JSON.stringify(summary),
        notes: formData.note || 'No additional notes',
        full_name: formData.children[0]?.childName || formData.contactName
      };

      const { error } = await supabase.from('tribe_applicants').insert([payload]);

      if (error) {
        // include error details for easier debugging
        console.error('Supabase insert error:', error);
        throw error;
      }

      setSubmitted(true);
      // trigger confetti/fireworks on successful submit
      try {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      } catch (e) {
        // ignore if confetti fails
        // console.warn('Confetti failed', e);
      }

      setFormData(initialForm);
      setSelectedChildIndex(0);
      setCurrentStep(0);
    } catch (err) {
      console.error('PTTA registration submission failed:', err);
      setSubmitted(false);
      setFormToast({
        message: err?.message ? `Submission failed: ${err.message}` : 'Your application was not submitted because the database is unavailable right now. Please try again in a moment.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
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
          <span>Child's Full Name</span>
          <input
            type="text"
            value={currentChild.childName}
            onChange={(event) => handleChildChange(selectedChildIndex, 'childName', event.target.value)}
            placeholder="Surname, First Name, Middle Name"
          />
        </label>

        <label className="teens-registration-field">
          <span>Date of birth</span>
          <input
            type="date"
            value={currentChild.dateOfBirth}
            onChange={(event) => handleChildChange(selectedChildIndex, 'dateOfBirth', event.target.value)}
          />
        </label>

        <label className="teens-registration-field">
          <span>Gender</span>
          <select
            value={currentChild.gender}
            onChange={(event) => handleChildChange(selectedChildIndex, 'gender', event.target.value)}
          >
            <option value="">Select gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
        </label>

        <label className="teens-registration-field">
          <span>School Name</span>
          <input
            type="text"
            value={currentChild.schoolName}
            onChange={(event) => handleChildChange(selectedChildIndex, 'schoolName', event.target.value)}
            placeholder="Current school"
          />
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
          <span>Strength of the child</span>
          <textarea
            rows="3"
            value={currentChild.strengths}
            onChange={(event) => handleChildChange(selectedChildIndex, 'strengths', event.target.value)}
            placeholder="Describe the child's strengths, talents, or positive qualities."
          />
        </label>

        <label className="teens-registration-field full-width">
          <span>What area would you like your child to build or improve?</span>
          <textarea
            rows="3"
            value={currentChild.improvementArea}
            onChange={(event) => handleChildChange(selectedChildIndex, 'improvementArea', event.target.value)}
            placeholder="Example: confidence, focus, communication, discipline, emotional intelligence..."
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
            {child.childName ? child.childName : `Child ${index + 1}`}
          </button>
        ))}
      </div>

      <div className="teens-registration-form-grid">
        <label className="teens-registration-field">
          <span>Program Type for {currentChild.childName || `Child ${selectedChildIndex + 1}`}</span>
          <select
            value={currentChild.programType}
            onChange={(event) => handleChildChange(selectedChildIndex, 'programType', event.target.value)}
          >
            <option value="">Select program type</option>
            <option value="Thriving Kids">Thriving Kids (Ages 7-12)</option>
            <option value="Thriving Teens">Thriving Teens (Ages 13-19)</option>
            <option value="Both">Both</option>
          </select>
        </label>

        <label className="teens-registration-field">
          <span>Preferred Session</span>
          <select
            value={currentChild.preferredSession}
            onChange={(event) => handleChildChange(selectedChildIndex, 'preferredSession', event.target.value)}
          >
            <option value="">Select session</option>
            <option value="Saturday 3:00 PM - 5:00 PM">Saturday 3:00 PM - 5:00 PM</option>
            <option value="One-on-One Coaching">One-on-One Coaching</option>
            <option value="Flexible / To Be Discussed">Flexible / To Be Discussed</option>
          </select>
        </label>

        <label className="teens-registration-field">
          <span>Primary Area of Interest</span>
          <select
            value={currentChild.focusArea}
            onChange={(event) => handleChildChange(selectedChildIndex, 'focusArea', event.target.value)}
          >
            <option value="">Select area of interest</option>
            <option value="Confidence Building">Confidence Building</option>
            <option value="Leadership Development">Leadership Development</option>
            <option value="Communication Mastery">Communication Mastery</option>
            <option value="Character Formation">Character Formation</option>
            <option value="Financial Literacy">Financial Literacy</option>
            <option value="Faith and Values">Faith and Values</option>
            <option value="Creative Expression">Creative Expression</option>
            <option value="Academic Excellence Support">Academic Excellence Support</option>
            <option value="One-on-One Coaching">One-on-One Coaching</option>
          </select>
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
        <textarea name="note" value={formData.note} onChange={handleChange} rows="4" placeholder="Share any additional information about the child or family." />
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
            <h2>Thank you for registering!</h2>
            <p>
              We have received your registration request for Paz Thriving Teens Academy. A member of
              our team will contact you shortly with the next steps and orientation details.
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
