import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { supabase } from '../supabaseClient';
import './feedback.css';

const changeOptions = [
  'Increased confidence', 'Better communication', 'Improved listening', 'Better self-discipline',
  'Improved attitude', 'Greater responsibility', 'Better emotional control', 'Improved relationships',
  'Better focus', 'Improved decision-making', 'More willingness to learn', 'Better expression of thoughts and feelings'
];

const supportOptions = [
  'Confidence', 'Communication', 'Focus', 'Self-discipline', 'Emotional regulation', 'Anger management',
  'Accountability', 'Leadership', 'Decision-making', 'Relationships/friendships', 'Academic motivation',
  'Purpose and direction', 'Positive habits'
];

const initialForm = {
  parentName: '', childName: '', duration: '', changes: [], otherChange: '', significantChange: '', impact: '',
  support: [], otherSupport: '', futureFocus: '', satisfaction: '', relationship: '', childSays: '',
  development: '', valuable: '', recommend: '', testimonial: ''
};

const feedbackDraftKey = 'paz-thriving-tribe-feedback-draft';

const formatName = (value) => value.replace(/\b\w/g, (letter) => letter.toUpperCase());

const loadFeedbackDraft = () => {
  try {
    const savedDraft = window.localStorage.getItem(feedbackDraftKey);
    return savedDraft ? { ...initialForm, ...JSON.parse(savedDraft) } : initialForm;
  } catch {
    return initialForm;
  }
};

function ToggleList({ name, options, selected, onChange }) {
  return (
    <div className="feedback-option-grid">
      {options.map((option) => (
        <label className={`feedback-option ${selected.includes(option) ? 'selected' : ''}`} key={option}>
          <input
            type="checkbox"
            name={name}
            value={option}
            checked={selected.includes(option)}
            onChange={() => onChange(option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const [introReady, setIntroReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(loadFeedbackDraft);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const formRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIntroReady(true), 6800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!submitted) return undefined;
    const fireworkBurst = (index = 0) => {
      confetti({
        particleCount: index % 3 === 1 ? 90 : 65,
        spread: 75,
        startVelocity: 42,
        origin: { x: index % 3 === 1 ? 0.5 : index % 3 === 0 ? 0.18 : 0.82, y: 0.72 },
        colors: ['#3f8c78', '#e88767', '#f0c75e', '#164568']
      });
    };
    let burstIndex = 0;
    fireworkBurst(burstIndex);
    const interval = window.setInterval(() => {
      burstIndex += 1;
      fireworkBurst(burstIndex);
    }, 1500);
    return () => {
      window.clearInterval(interval);
      confetti.reset();
    };
  }, [submitted]);

  useEffect(() => {
    if (submitted) {
      window.localStorage.removeItem(feedbackDraftKey);
      return;
    }
    try {
      window.localStorage.setItem(feedbackDraftKey, JSON.stringify(form));
    } catch {
      // Continue without draft storage when browser storage is unavailable.
    }
  }, [form, submitted]);

  useEffect(() => {
    if (!introDone || window.innerWidth > 760) return undefined;
    const timer = window.setTimeout(() => {
      const feedbackShell = formRef.current?.closest('.feedback-shell');
      feedbackShell?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [introDone, step]);

  const update = (event) => {
    const value = ['parentName', 'childName'].includes(event.target.name) ? formatName(event.target.value) : event.target.value;
    setForm((current) => ({ ...current, [event.target.name]: value }));
  };
  const handleFieldFocus = (event) => {
    if (window.innerWidth > 760 || !['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
    window.setTimeout(() => event.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
  };
  const toggle = (name, option) => setForm((current) => ({
    ...current,
    [name]: current[name].includes(option) ? current[name].filter((item) => item !== option) : [...current[name], option]
  }));

  const steps = [
    {
      eyebrow: 'A little context', title: 'Let’s start with your Pre-Teen or Teen’s journey.', cardTitle: 'Begin with the whole story', cardText: 'A little context helps us understand where your Pre-Teen or Teen is today and the season they are moving through.', cardNote: 'Context gives every answer a clearer meaning.',
      content: <>
        <label className="feedback-field"><span>Parent’s name</span><input name="parentName" value={form.parentName} onChange={update} required placeholder="Enter your full name" /></label>
        <label className="feedback-field"><span>Pre-Teen or Teen’s name</span><input name="childName" value={form.childName} onChange={update} required placeholder="Enter their name" /></label>
        <fieldset className="feedback-fieldset"><legend>How long has your Pre-Teen or Teen been receiving mentoring or coaching from us?</legend><div className="feedback-radio-grid">{['Less than 1 month', '1–3 months', '3–6 months', 'More than 6 months'].map((option) => <label className="feedback-radio" key={option}><input type="radio" name="duration" value={option} checked={form.duration === option} onChange={update} required /><span>{option}</span></label>)}</div></fieldset>
      </>
    },
    {
      eyebrow: 'Notice the shifts', title: 'What positive changes have you noticed?', cardTitle: 'Name the wins', cardText: 'Progress is often found in the small, everyday moments. Your observations help us celebrate the changes your Pre-Teen or Teen may not yet see.', cardNote: 'Noticing progress gives it room to grow.',
      content: <><p className="feedback-helper">Select every change that feels true. Small shifts matter here.</p><ToggleList name="changes" options={changeOptions} selected={form.changes} onChange={(option) => toggle('changes', option)} /><label className="feedback-field"><span>Other change</span><input name="otherChange" value={form.otherChange} onChange={update} placeholder="Tell us about another change" /></label></>
    },
    {
      eyebrow: 'Your perspective', title: 'Help us understand the impact.', cardTitle: 'Measure the difference', cardText: 'Your honest perspective shows us which parts of the mentoring are making a real difference in confidence, focus, and connection.', cardNote: 'Your view helps us keep what works.',
      content: <><label className="feedback-field"><span>What is the most significant change you have noticed?</span><textarea name="significantChange" value={form.significantChange} onChange={update} required rows="4" placeholder="Share the moment or change that stands out most" /></label><fieldset className="feedback-fieldset"><legend>How would you rate the impact of the mentoring sessions?</legend><div className="feedback-rating-grid">{['1 — Very little', '2 — Some impact', '3 — Good impact', '4 — Very good', '5 — Excellent'].map((option) => <label className="feedback-rating" key={option}><input type="radio" name="impact" value={option} checked={form.impact === option} onChange={update} required /><strong>{option.slice(0, 1)}</strong><span>{option.slice(4)}</span></label>)}</div></fieldset></>
    },
    {
      eyebrow: 'Keep growing', title: 'Where could we offer more support?', cardTitle: 'Point toward the next step', cardText: 'Growth is not a finish line. Naming the areas that still need care helps us make future sessions more personal and useful.', cardNote: 'The next step starts with an honest signal.',
      content: <><ToggleList name="support" options={supportOptions} selected={form.support} onChange={(option) => toggle('support', option)} /><label className="feedback-field"><span>Other area</span><input name="otherSupport" value={form.otherSupport} onChange={update} placeholder="Tell us about another area" /></label><label className="feedback-field"><span>What would you like us to focus on more during future sessions?</span><textarea name="futureFocus" value={form.futureFocus} onChange={update} rows="3" placeholder="Your hopes for the next season" /></label></>
    },
    {
      eyebrow: 'The full picture', title: 'One final, thoughtful check-in.', cardTitle: 'Shape what comes next', cardText: 'This final reflection brings your experience together. It gives our team the trust and direction to keep showing up well for your family.', cardNote: 'Together, we turn feedback into better care.',
      content: <><div className="feedback-two-col"><label className="feedback-field"><span>How satisfied are you?</span><select name="satisfaction" value={form.satisfaction} onChange={update} required><option value="">Choose one</option>{['Very satisfied', 'Satisfied', 'Fairly satisfied', 'Not satisfied'].map((option) => <option key={option}>{option}</option>)}</select></label><label className="feedback-field"><span>How would you rate the coach’s relationship with your Pre-Teen or Teen?</span><select name="relationship" value={form.relationship} onChange={update} required><option value="">Choose one</option>{['Excellent', 'Very good', 'Good', 'Needs improvement'].map((option) => <option key={option}>{option}</option>)}</select></label></div><label className="feedback-field"><span>What does your Pre-Teen or Teen say about the sessions?</span><textarea name="childSays" value={form.childSays} onChange={update} rows="3" /></label><label className="feedback-field"><span>Anything the coach should know about your Pre-Teen or Teen’s current development or behaviour?</span><textarea name="development" value={form.development} onChange={update} rows="3" /></label><label className="feedback-field"><span>What can we do differently to make this more valuable?</span><textarea name="valuable" value={form.valuable} onChange={update} rows="3" /></label><fieldset className="feedback-fieldset"><legend>Would you recommend Paz Thriving Tribe to another parent?</legend><div className="feedback-radio-grid compact">{['Definitely', 'Probably', 'Not sure', 'No'].map((option) => <label className="feedback-radio" key={option}><input type="radio" name="recommend" value={option} checked={form.recommend === option} onChange={update} required /><span>{option}</span></label>)}</div></fieldset><label className="feedback-field"><span>Testimonial (optional)</span><textarea name="testimonial" value={form.testimonial} onChange={update} rows="3" placeholder="In a few words, how has Paz Thriving Tribe impacted your Pre-Teen or Teen?" /></label></>
    }
  ];

  const goNext = (event) => { event.preventDefault(); if (event.currentTarget.checkValidity()) setStep((current) => Math.min(current + 1, steps.length - 1)); };
  const startSurvey = () => setIntroDone(true);
  const submitFeedback = async (event) => {
    event.preventDefault();
    if (!event.currentTarget.checkValidity() || saving) return;
    setSaving(true);
    setSubmitError('');
    try {
      const { error } = await supabase.from('tribe_parent_feedback').insert([{
        parent_name: form.parentName.trim(),
        child_name: form.childName.trim(),
        mentoring_duration: form.duration,
        positive_changes: form.changes,
        other_change: form.otherChange.trim(),
        significant_change: form.significantChange.trim(),
        impact_rating: form.impact,
        support_areas: form.support,
        other_support: form.otherSupport.trim(),
        future_focus: form.futureFocus.trim(),
        satisfaction: form.satisfaction,
        coach_relationship: form.relationship,
        child_comments: form.childSays.trim(),
        development_notes: form.development.trim(),
        improvement_suggestions: form.valuable.trim(),
        recommendation: form.recommend,
        testimonial: form.testimonial.trim()
      }]);
      if (error) throw error;
      setSubmitted(true);
    } catch (error) {
      console.error('Feedback submission failed:', error);
      setSubmitError('We could not save your feedback. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (submitted) return <main className="feedback-page feedback-success-page"><div className="feedback-firework feedback-firework-one" /><div className="feedback-firework feedback-firework-two" /><section className="feedback-success-backdrop"><div className="feedback-complete" aria-labelledby="feedback-success-title"><div className="feedback-thankyou-art" aria-hidden="true"><span className="thankyou-spark spark-a">✦</span><span className="thankyou-spark spark-b">✦</span><span className="thankyou-sun" /><span className="thankyou-person"><i /><b /></span><span className="thankyou-heart">♥</span></div><div className="feedback-complete-mark">✓</div><p className="feedback-kicker">Feedback received</p><h1 id="feedback-success-title">Thank you for supporting your Pre-Teen or Teen.</h1><p>Your thoughtful reflections help us understand what is working and where they need more care, attention, and encouragement.</p><Link className="feedback-primary-btn" to="/">Return to Paz Thriving Tribe <span>→</span></Link></div></section></main>;

  return (
    <main className={`feedback-page ${introDone ? 'intro-finished' : ''}`}>
      {!introDone && <section className={`feedback-intro ${introReady ? 'ready' : ''}`} aria-label="Why your feedback matters"><div className="feedback-intro-art"><div className="feedback-sun" /><div className="feedback-orbit orbit-one" /><div className="feedback-orbit orbit-two" /><div className="feedback-note note-one">Parent reflection</div><div className="feedback-note note-two">Growth journey</div><div className="feedback-spark spark-one">✦</div><div className="feedback-spark spark-two">✦</div><div className="feedback-reflection-scene"><div className="feedback-path"><span /><span /><span /></div><div className="feedback-person feedback-parent"><span className="figure-head" /><span className="figure-body" /><span className="figure-arm" /></div><div className="feedback-clipboard"><span /><i /><i /><i /></div><div className="feedback-person feedback-teen"><span className="figure-head" /><span className="figure-body" /><span className="figure-arm" /></div><div className="feedback-speech speech-one">I’m listening</div><div className="feedback-speech speech-two">Progress</div></div></div><div className="feedback-intro-copy"><span className="feedback-kicker">Paz Thriving Tribe · Parent voice</span><h1>Dear Parent, your perspective matters.</h1><p>Thank you for partnering with us in your Pre-Teen or Teen’s growth journey. Your feedback helps us understand the impact of our mentoring sessions and identify areas where we can provide better support.</p><div className="feedback-intro-actions"><div className="feedback-loading-line"><span /><small>{introReady ? 'Your reflection space is ready' : 'Preparing your reflection space'}</small></div><button type="button" className="feedback-primary-btn feedback-start-btn" onClick={startSurvey} disabled={!introReady}>Give your feedback <span>→</span></button></div></div></section>}
      <section className="feedback-shell"><header className="feedback-header"><Link className="feedback-brand" to="/"><span>PTT</span><strong>Paz Thriving Tribe</strong></Link><span className="feedback-progress-label">Parent mentoring feedback</span></header><div className="feedback-layout"><aside className="feedback-aside"><div className="feedback-progress-rail" aria-label={`Step ${step + 1} of ${steps.length}`}><span style={{ height: `${((step + 1) / steps.length) * 100}%` }} /></div><div className="feedback-aside-card" key={step}><span className="feedback-kicker">Step {step + 1} · {steps[step].eyebrow}</span><h1>{steps[step].cardTitle}</h1><p>{steps[step].cardText}</p><div className="feedback-aside-line" /><span className="feedback-aside-note">{steps[step].cardNote}</span></div></aside><section className="feedback-form-panel"><div className="feedback-stepper">{steps.map((item, index) => <span className={index <= step ? 'active' : ''} key={item.title}><i>{index + 1}</i>{index < steps.length - 1 && <b />}</span>)}</div><form ref={formRef} onFocus={handleFieldFocus} onSubmit={step === steps.length - 1 ? submitFeedback : goNext}><div className="feedback-step-copy"><span className="feedback-kicker">Step {step + 1} of {steps.length} · {steps[step].eyebrow}</span><h2>{steps[step].title}</h2></div><div className="feedback-fields">{steps[step].content}</div>{submitError && <p className="feedback-submit-error" role="alert">{submitError}</p>}<div className="feedback-actions">{step > 0 ? <button type="button" className="feedback-back-btn" onClick={() => setStep((current) => current - 1)}>← Back</button> : <Link className="feedback-back-btn" to="/">Exit</Link>}<button className="feedback-primary-btn" type="submit" disabled={saving}>{saving ? 'Saving...' : step === steps.length - 1 ? 'Send feedback' : 'Continue'} <span>→</span></button></div></form></section></div></section><div className={`feedback-arrow ${introDone ? 'visible' : ''}`}><span>Ready when you are</span><strong>↘</strong></div></main>
  );
}