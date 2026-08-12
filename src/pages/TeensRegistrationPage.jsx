import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../css/teens-registration.css';

const initialForm = {
  childName: '',
  dateOfBirth: '',
  gender: '',
  schoolName: '',
  classGrade: '',
  parentName: '',
  email: '',
  phone: '',
  homeAddress: '',
  programType: '',
  preferredSession: '',
  focusArea: '',
  hearAboutUs: '',
  note: ''
};

const steps = [
  { id: 'child', label: 'Child Info', title: 'Tell us about your child', description: 'Basic profile and school details.' },
  { id: 'parent', label: 'Parent Details', title: 'Family contact details', description: 'How we can reach you and where you are based.' },
  { id: 'program', label: 'Program Match', title: 'Choose your program preferences', description: 'Session, focus area, and academy fit.' },
  { id: 'review', label: 'Review', title: 'Review and confirm', description: 'Check before sending your registration.' }
];

export default function TeensRegistrationPage() {
  const [formData, setFormData] = useState(initialForm);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formToast, setFormToast] = useState({ message: '', type: 'error' });
  const formCardRef = useRef(null);

  const completedSteps = useMemo(() => {
    const result = {};
    steps.forEach((step, index) => {
      result[step.id] = (() => {
        switch (index) {
          case 0:
            return !!(formData.childName && formData.dateOfBirth && formData.gender);
          case 1:
            return !!(formData.parentName && formData.email && formData.phone && formData.homeAddress);
          case 2:
            return !!(formData.programType && formData.preferredSession && formData.focusArea);
          default:
            return true;
        }
      })();
    });
    return result;
  }, [formData]);

  const currentStepMeta = steps[currentStep];

  useEffect(() => {
    if (!formToast.message) return undefined;

    const timer = window.setTimeout(() => {
      setFormToast({ message: '', type: 'error' });
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [formToast.message]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (formToast.message) {
      setFormToast({ message: '', type: 'error' });
    }
  };

  const goToStep = (index) => {
    if (index < 0 || index >= steps.length) return;
    setCurrentStep(index);
    requestAnimationFrame(() => {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [currentStep]);

  const validateCurrentStep = () => {
    if (currentStep === 0) {
      if (!formData.childName || !formData.dateOfBirth || !formData.gender) {
        return 'Please complete the child profile section before continuing.';
      }
    }

    if (currentStep === 1) {
      if (!formData.parentName || !formData.email || !formData.phone || !formData.homeAddress) {
        return 'Please fill in the parent and contact details before continuing.';
      }
    }

    if (currentStep === 2) {
      if (!formData.programType || !formData.preferredSession || !formData.focusArea) {
        return 'Please choose the program options before continuing.';
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
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
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
      const payload = {
        full_name: formData.childName,
        email: formData.email,
        phone: formData.phone,
        track: formData.programType,
        parent_name: formData.parentName,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.gender,
        school_name: formData.schoolName,
        current_class_grade: formData.classGrade,
        home_address: formData.homeAddress,
        development_goals: formData.focusArea,
        message: [
          `Preferred session: ${formData.preferredSession}`,
          `Source: ${formData.hearAboutUs || 'Not provided'}`,
          `Notes: ${formData.note || 'No additional notes'}`
        ].join(' | ')
      };

      const { error } = await supabase.from('tribe_applicants').insert([payload]);

      if (error) {
        throw error;
      }

      setSubmitted(true);
      setFormData(initialForm);
      setCurrentStep(0);
    } catch (err) {
      console.error('PTTA registration submission failed:', err);
      setSubmitted(false);
      setFormToast({
        message: 'Your application was not submitted because the database is unavailable right now. Please try again in a moment.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div className="teens-registration-form-grid">
          <label className="teens-registration-field">
            <span>Child's Full Name</span>
            <input type="text" name="childName" value={formData.childName} onChange={handleChange} placeholder="Surname, First Name, Middle Name" required />
          </label>

          <label className="teens-registration-field">
            <span>Date of birth</span>
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
          </label>

          <label className="teens-registration-field">
            <span>Gender</span>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="" disabled>Select gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </label>

          <label className="teens-registration-field">
            <span>School Name</span>
            <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} placeholder="Current school" />
          </label>

          <label className="teens-registration-field">
            <span>Current Class / Grade</span>
            <input type="text" name="classGrade" value={formData.classGrade} onChange={handleChange} placeholder="Primary 4, JSS 2, SS1..." />
          </label>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="teens-registration-form-grid">
          <label className="teens-registration-field">
            <span>Parent / Guardian Name</span>
            <input type="text" name="parentName" value={formData.parentName} onChange={handleChange} required />
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
            <input type="text" name="homeAddress" value={formData.homeAddress} onChange={handleChange} placeholder="Your location / area" />
          </label>
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <div className="teens-registration-form-grid">
          <label className="teens-registration-field">
            <span>Program Type</span>
            <select name="programType" value={formData.programType} onChange={handleChange}>
              <option value="" disabled>Select program type</option>
              <option value="Thriving Kids">Thriving Kids (Ages 7-12)</option>
              <option value="Thriving Teens">Thriving Teens (Ages 13-19)</option>
              <option value="Both">Both</option>
            </select>
          </label>

          <label className="teens-registration-field">
            <span>Preferred Session</span>
            <select name="preferredSession" value={formData.preferredSession} onChange={handleChange}>
              <option value="" disabled>Select session</option>
              <option value="Saturday 3:00 PM - 5:00 PM">Saturday 3:00 PM - 5:00 PM</option>
              <option value="One-on-One Coaching">One-on-One Coaching</option>
              <option value="Flexible / To Be Discussed">Flexible / To Be Discussed</option>
            </select>
          </label>

          <label className="teens-registration-field">
            <span>Primary Area of Interest</span>
            <select name="focusArea" value={formData.focusArea} onChange={handleChange}>
              <option value="" disabled>Select area of interest</option>
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
            <input type="text" name="hearAboutUs" value={formData.hearAboutUs} onChange={handleChange} placeholder="WhatsApp, Instagram, school, church, referral..." />
          </label>
        </div>
      );
    }

    return (
      <div className="teens-registration-review">
        <div className="teens-registration-review-grid">
          <div className="review-group">
            <h4>Child Profile</h4>
            <p><strong>Name:</strong> {formData.childName || 'Not provided'}</p>
            <p><strong>Date of birth:</strong> {formData.dateOfBirth || 'Not provided'}</p>
            <p><strong>School:</strong> {formData.schoolName || 'Not provided'}</p>
            <p><strong>Grade:</strong> {formData.classGrade || 'Not provided'}</p>
          </div>

          <div className="review-group">
            <h4>Parent Details</h4>
            <p><strong>Parent:</strong> {formData.parentName || 'Not provided'}</p>
            <p><strong>Email:</strong> {formData.email || 'Not provided'}</p>
            <p><strong>Phone:</strong> {formData.phone || 'Not provided'}</p>
            <p><strong>Address:</strong> {formData.homeAddress || 'Not provided'}</p>
          </div>

          <div className="review-group">
            <h4>Program Match</h4>
            <p><strong>Program:</strong> {formData.programType}</p>
            <p><strong>Preferred session:</strong> {formData.preferredSession}</p>
            <p><strong>Focus area:</strong> {formData.focusArea}</p>
            <p><strong>Source:</strong> {formData.hearAboutUs || 'Not provided'}</p>
          </div>
        </div>

        <label className="teens-registration-field full-width">
          <span>Anything you would like us to know?</span>
          <textarea name="note" value={formData.note} onChange={handleChange} rows="4" placeholder="Share any details about your child's needs, goals, or challenges." />
        </label>
      </div>
    );
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
              {steps.map((step, index) => (
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
                <div className="teens-step-breadcrumb">Step {currentStep + 1} of {steps.length}</div>
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

              {currentStep < steps.length - 1 ? (
                <button type="button" className="teens-registration-submit" onClick={handleNext}>
                  Next: {steps[currentStep + 1].label}
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
