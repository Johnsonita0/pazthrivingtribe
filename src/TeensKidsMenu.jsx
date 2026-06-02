import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function TeensKidsMenu({ paystackPublicKey = 'pk_test_demo_key_update_from_admin', teensKidsMonthlyFee = 10000 }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [monthlyFee, setMonthlyFee] = useState(teensKidsMonthlyFee);
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [paymentStep, setPaymentStep] = useState('registration'); // 'registration' or 'payment'
  const [formData, setFormData] = useState({
    parentName: '',
    childName: '',
    childAge: '',
    email: '',
    phone: '',
    interest: ''
  });
  const [paymentFormData, setPaymentFormData] = useState({
    parentName: '',
    childName: '',
    email: '',
    phone: ''
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  useEffect(() => {
    setMonthlyFee(teensKidsMonthlyFee);
  }, [teensKidsMonthlyFee]);

  useEffect(() => {
    AOS.init({ duration: 800, offset: 100 });
    window.scrollTo(0, 0);
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    document.body.appendChild(script);
  }, []);

  const corePrograms = [
    {
      id: 1,
      icon: '🌟',
      title: 'Personal Development Coaching',
      items: ['Confidence Building', 'Self-Esteem', 'Emotional Intelligence', 'Goal Setting', 'Purpose Discovery']
    },
    {
      id: 2,
      icon: '👥',
      title: 'Leadership Development',
      items: ['Responsibility', 'Decision Making', 'Teamwork', 'Problem Solving', 'Integrity']
    },
    {
      id: 3,
      icon: '🎤',
      title: 'Communication Mastery',
      items: ['Public Speaking', 'Effective Communication', 'Debate', 'Presentation Skills']
    },
    {
      id: 4,
      icon: '💎',
      title: 'Character Formation',
      items: ['Respect', 'Discipline', 'Kindness', 'Honesty', 'Resilience']
    },
    {
      id: 5,
      icon: '💰',
      title: 'Financial Literacy',
      items: ['Saving', 'Budgeting', 'Wise Spending', 'Entrepreneurship']
    },
    {
      id: 6,
      icon: '✨',
      title: 'Creative Expression',
      items: ['Dance Club', 'Drama Club', 'Poetry and Spoken Word']
    },
    {
      id: 7,
      icon: '📚',
      title: 'Academic Excellence Support',
      items: ['Study Skills', 'Time Management', 'Concentration Techniques']
    },
    {
      id: 8,
      icon: '🙏',
      title: 'Faith and Values',
      items: ['Godly Character', 'Identity and Purpose', 'Biblical Principles for Living']
    }
  ];

  const uniqueSellingPoints = [
    'Certified Children and Teen Coach',
    'One-on-One Coaching Sessions',
    'Small Group Mentorship',
    'Dance and Drama Clubs',
    'Safe and Value-Based Environment',
    'Parent Feedback and Progress Reports',
    'Real-Life Practical Activities'
  ];

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegistrationNext = (e) => {
    e.preventDefault();
    setPaymentFormData({
      parentName: formData.parentName,
      childName: formData.childName,
      email: formData.email,
      phone: formData.phone
    });
    setPaymentStep('payment');
  };

  const handlePaystackPayment = () => {
    if (typeof window.PaystackPop === 'undefined') {
      alert('Paystack library not loaded. Please try again.');
      return;
    }
    
    const totalAmount = monthlyFee * selectedMonths * 100; // Convert to kobo
    
    const handler = window.PaystackPop.setup({
      key: paystackPublicKey,
      email: paymentFormData.email,
      amount: totalAmount,
      currency: 'NGN',
      ref: `PAZ-${Date.now()}`,
      onClose: function() {
        alert('Payment window closed.');
      },
      onSuccess: function(response) {
        alert(`Payment successful! Reference: ${response.reference}`);
        setSubmitSuccess(true);
        setTimeout(() => {
          setShowPaymentModal(false);
          setPaymentStep('registration');
          setFormData({
            parentName: '',
            childName: '',
            childAge: '',
            email: '',
            phone: '',
            interest: ''
          });
          setPaymentFormData({
            parentName: '',
            childName: '',
            email: '',
            phone: ''
          });
          setSubmitSuccess(false);
        }, 3000);
      }
    });
    handler.openIframe();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowPaymentModal(true);
    setPaymentStep('registration');
  };

  return (
    <div className="public-website-container">
      {showWelcomeModal && (
        <div
          className="teens-welcome-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setShowWelcomeModal(false)}
        >
          <div
            className="teens-welcome-card"
            style={{
              background: 'white',
              borderRadius: '20px',
              maxWidth: '760px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="teens-welcome-close-btn"
              onClick={() => setShowWelcomeModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: '#4a5568',
                fontSize: '1.4rem',
                cursor: 'pointer'
              }}
              aria-label="Close welcome message"
            >
              ×
            </button>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem', color: '#2d3748' }}>
              Welcome to Paz Thriving Teens Academy
            </h2>
            <p style={{ fontSize: '1rem', lineHeight: '1.8', color: '#4a5568', marginBottom: '1rem' }}>
              Dear Thriver,
            </p>
            <p style={{ fontSize: '1rem', lineHeight: '1.8', color: '#4a5568', marginBottom: '1rem' }}>
              Welcome to Pre-teens Mentorship Pathways!
            </p>
            <p style={{ fontSize: '1rem', lineHeight: '1.8', color: '#4a5568', marginBottom: '1rem' }}>
              A place where we help you build positive values, empower you to reach your full potential and thrive.
            </p>
            <p style={{ fontSize: '1rem', lineHeight: '1.8', color: '#4a5568', marginBottom: '1rem' }}>
              At Pre-teens Mentorship Pathways, you will build confidence, strengthen your character, discover your purpose, and develop the leadership skills needed to shine in your world.
            </p>
            <p style={{ fontSize: '1rem', lineHeight: '1.8', color: '#4a5568', marginBottom: '1.5rem' }}>
              We are excited to walk this journey with you.
            </p>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.25rem' }}>
              With love,
            </p>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.25rem', fontWeight: '700' }}>
              Coach Roseline Iraoya
            </p>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.4', color: '#4a5568', marginBottom: '1rem', fontStyle: 'italic' }}>
              Founder, Pre-teens Mentorship Pathways
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowWelcomeModal(false)}
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '0.9rem 1.8rem',
                  borderRadius: '999px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Continue to the Academy
              </button>
            </div>
          </div>
        </div>
      )}
      {/* HERO BANNER */}
      <section className="teens-kids-hero" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '4rem 2rem',
        textAlign: 'center',
        marginBottom: '3rem'
      }} data-aos="fade-down">
        <div className="teens-kids-hero-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem' }}>
            Pre-teens Mentorship Pathways
          </h1>
          <p style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1.5rem', opacity: 0.95 }}>
            Raising Confident, Kind, and Purposeful Leaders
          </p>
          <p style={{ fontSize: '1.05rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.7', opacity: 0.9 }}>
            Transforming children and teenagers into emotionally healthy, morally grounded, and purpose-driven leaders who will positively influence their world.
          </p>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem', marginBottom: '3rem' }}>
        <div className="teens-info-grid" style={{ display: 'grid', gap: '2rem', marginBottom: '3rem' }}>
          {/* Vision */}
          <div data-aos="fade-right" style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
            padding: '2rem',
            borderRadius: '12px',
            borderLeft: '4px solid #667eea'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: '#667eea' }}>
              Vision Statement
            </h3>
            <p style={{ lineHeight: '1.8', fontSize: '1rem', color: 'var(--text-primary)' }}>
              To raise a generation of confident, kind, and purposeful young leaders who are equipped with the character, skills, and values needed to thrive and positively impact their world.
            </p>
          </div>

          {/* Mission */}
          <div data-aos="fade-left" style={{
            background: 'linear-gradient(135deg, rgba(118, 75, 162, 0.1), rgba(102, 126, 234, 0.1))',
            padding: '2rem',
            borderRadius: '12px',
            borderLeft: '4px solid #764ba2'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem', color: '#764ba2' }}>
              Mission Statement
            </h3>
            <p style={{ lineHeight: '1.8', fontSize: '1rem', color: 'var(--text-primary)' }}>
              To empower children and teenagers through coaching, mentoring, leadership development, character formation, and life-skills training, helping them discover their potential, build confidence, and become responsible leaders of influence.
            </p>
          </div>
        </div>

        {/* Target Age Groups */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '2rem' }}>Target Age Groups</h3>
          <div className="teens-age-grid" style={{ display: 'grid', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
            <div data-aos="zoom-in" style={{
              background: 'var(--bg-secondary)',
              padding: '2rem',
              borderRadius: '12px',
              border: '2px solid #667eea'
            }}>
              <h4 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem' }}>🧒 Thriving Pre-teens</h4>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#667eea' }}>Ages 7–12 years</p>
            </div>
            <div data-aos="zoom-in" data-aos-delay="100" style={{
              background: 'var(--bg-secondary)',
              padding: '2rem',
              borderRadius: '12px',
              border: '2px solid #764ba2'
            }}>
              <h4 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem' }}>👦 Thriving Teens</h4>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#764ba2' }}>Ages 13–19 years</p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PROGRAM AREAS */}
      <section style={{ background: 'var(--bg-secondary)', padding: '3rem 2rem', marginBottom: '3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', textAlign: 'center', marginBottom: '3rem' }}>
            Core Program Areas
          </h2>
          <div className="teens-program-grid" style={{
            display: 'grid',
            gap: '2rem'
          }}>
            {corePrograms.map((program, index) => (
              <div
                key={program.id}
                data-aos="fade-up"
                data-aos-delay={index * 50}
                onClick={() => setSelectedProgram(selectedProgram === program.id ? null : program.id)}
                style={{
                  background: 'var(--bg-primary)',
                  padding: '2rem',
                  borderRadius: '12px',
                  border: selectedProgram === program.id ? '2px solid #667eea' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: selectedProgram === program.id ? 'translateY(-8px)' : 'translateY(0)'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{program.icon}</div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>
                  {program.title}
                </h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {program.items.map((item, idx) => (
                    <li key={idx} style={{
                      padding: '0.4rem 0',
                      fontSize: '0.95rem',
                      color: 'var(--text-muted)',
                      paddingLeft: '1.5rem',
                      position: 'relative'
                    }}>
                      <span style={{ position: 'absolute', left: 0 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UNIQUE SELLING POINTS */}
      <section style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '3rem 2rem', marginBottom: '3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '2rem', textAlign: 'center' }}>
            What Makes PTTA Different
          </h2>
          <div className="teens-benefit-grid" style={{
            display: 'grid',
            gap: '2rem'
          }}>
            {uniqueSellingPoints.map((point, index) => (
              <div key={index} data-aos="flip-left" data-aos-delay={index * 50} style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '1.5rem',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '1.05rem', fontWeight: '600' }}>✨ {point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COACHING PROCESS */}
      <section style={{ background: 'var(--bg-secondary)', padding: '3rem 2rem', marginBottom: '3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '2rem', textAlign: 'center' }}>
            One-on-One Coaching Process
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem'
          }}>
            {['Initial Assessment', 'Goal Setting', 'Personalized Action Plan', 'Monthly Coaching Sessions', 'Parent Feedback', 'Progress Tracking'].map((step, index) => (
              <div key={index} data-aos="zoom-in" data-aos-delay={index * 50} style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '2rem',
                borderRadius: '12px',
                textAlign: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'white',
                  color: '#667eea',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '1.2rem'
                }}>
                  {index + 1}
                </div>
                <p style={{ fontSize: '1.05rem', fontWeight: '600', marginTop: '1rem' }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING & REGISTRATION */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '2rem', textAlign: 'center' }}>
          Registration & Pricing
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          <div data-aos="fade-right" style={{
            background: 'var(--bg-secondary)',
            padding: '2rem',
            borderRadius: '12px',
            border: '2px solid #667eea',
            textAlign: 'center'
          }}>
            <h4 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem' }}>Registration Fee</h4>
            <p style={{ fontSize: '2rem', fontWeight: '900', color: '#667eea', marginBottom: '0.5rem' }}>₦10,000</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>One-time enrollment</p>
          </div>
          <div data-aos="fade-left" style={{
            background: 'var(--bg-secondary)',
            padding: '2rem',
            borderRadius: '12px',
            border: '2px solid #764ba2',
            textAlign: 'center'
          }}>
            <h4 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '1rem' }}>Monthly Fee</h4>
            <p style={{ fontSize: '2rem', fontWeight: '900', color: '#764ba2', marginBottom: '0.5rem' }}>₦15,000</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Basic program access</p>
          </div>
        </div>
      </section>

      {/* QUARTERLY EVENTS */}
      <section style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '3rem 2rem', marginBottom: '3rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '2rem', textAlign: 'center' }}>
            Quarterly Special Events
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem'
          }}>
            {['Public Speaking Showcase', 'Leadership Bootcamp', 'Parent Seminar', 'Talent Exhibition', 'Community Service Projects', 'Award Ceremony'].map((event, index) => (
              <div key={index} data-aos="bounce" data-aos-delay={index * 50} style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '1.5rem',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <p style={{ fontSize: '1rem', fontWeight: '600' }}>🎉 {event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STAFF TEAM */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '2rem', textAlign: 'center' }}>
          Our Expert Team
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem'
        }}>
          <div data-aos="fade-up" style={{
            background: 'var(--bg-secondary)',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👩‍🏫</div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>Coach Roseline Iraoya</h4>
            <p style={{ color: '#667eea', fontWeight: '600', marginBottom: '0.5rem' }}>Founder & Lead Coach</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Certified Children and Teen Coach, passionate about raising emotionally healthy children</p>
          </div>
          <div data-aos="fade-up" data-aos-delay="50" style={{
            background: 'var(--bg-secondary)',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎭</div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>Supporting Team</h4>
            <p style={{ color: '#764ba2', fontWeight: '600', marginBottom: '1rem' }}>Expert Facilitators</p>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <li>Assistant Coaches</li>
              <li>Dance Instructor</li>
              <li>Drama Facilitator</li>
              <li>Administrative Officer</li>
            </ul>
          </div>
        </div>
      </section>

      {/* PARENT AFFIRMATION/BENEFITS */}
      <section style={{ background: 'var(--bg-secondary)', padding: '3rem 2rem', marginBottom: '3rem', borderRadius: '12px', marginLeft: '2rem', marginRight: '2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '2rem' }}>
            What Parents Will Notice
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1.5rem'
          }}>
            {['Improved Confidence', 'Better Communication', 'Greater Responsibility', 'Stronger Values', 'Leadership Abilities', 'Positive Attitude'].map((benefit, index) => (
              <div key={index} data-aos="fade-up" data-aos-delay={index * 50} style={{
                background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <p style={{ fontSize: '1rem', fontWeight: '700' }}>✓ {benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGISTRATION PROCESS */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '2rem', textAlign: 'center' }}>
          How to Register
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.5rem'
        }}>
          {[
            { step: 1, title: 'Complete Registration Form', icon: '📋' },
            { step: 2, title: 'Pay Membership Fee', icon: '💳' },
            { step: 3, title: 'Attend Orientation', icon: '👋' },
            { step: 4, title: 'Begin Sessions', icon: '🚀' }
          ].map((item) => (
            <div key={item.step} data-aos="zoom-in" data-aos-delay={item.step * 50} style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              padding: '2rem',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Step {item.step}</div>
              <p style={{ fontSize: '1rem' }}>{item.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AFFIRMATION SECTION */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '3rem 2rem',
        marginBottom: '3rem',
        borderRadius: '12px',
        textAlign: 'center',
        marginLeft: '2rem',
        marginRight: '2rem'
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '2rem' }}>
          Thrivers Affirmation
        </h3>
        <p style={{
          fontSize: '1.05rem',
          lineHeight: '1.8',
          maxWidth: '800px',
          margin: '0 auto',
          fontStyle: 'italic',
          fontWeight: '500'
        }}>
          "I am special. So special. There is nothing regular about me. Nothing average about my life. Nothing common about my existence. I carry greatness in my spirit. I carry excellence in my mind. I carry light everywhere I go. I am irresistible. My presence cannot be ignored. My value cannot be hidden. My impact cannot be denied."
        </p>
      </section>

      {/* CONTACT & ENROLLMENT CTA */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem', marginBottom: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>
          Ready to Transform Your Child's Future?
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Limited slots available. Join us today and be part of a transformational academy.
        </p>

        {!showContactForm && !showPaymentModal ? (
          <button
            onClick={() => setShowContactForm(true)}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              fontWeight: '700',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            🎯 Enroll Your Child Now
          </button>
        ) : showPaymentModal ? (
          <div data-aos="fade-up" style={{
            background: 'var(--bg-secondary)',
            padding: '2.5rem',
            borderRadius: '12px',
            maxWidth: '600px',
            margin: '0 auto',
            border: '1px solid var(--border-color)'
          }}>
            {submitSuccess ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#28a745'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Payment Successful!</h3>
                <p>Welcome to Pre-teens Mentorship Pathways! We'll contact you with orientation details.</p>
              </div>
            ) : paymentStep === 'registration' ? (
              <form onSubmit={handleRegistrationNext}>
                <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Step 1: Registration Details</h3>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.95rem' }}>Parent/Guardian Name *</label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleFormChange}
                    required
                    placeholder="Your full name"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.95rem' }}>Child's Name *</label>
                  <input
                    type="text"
                    name="childName"
                    value={formData.childName}
                    onChange={handleFormChange}
                    required
                    placeholder="Your child's name"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.95rem' }}>Child's Age *</label>
                  <input
                    type="number"
                    name="childAge"
                    value={formData.childAge}
                    onChange={handleFormChange}
                    required
                    placeholder="Age"
                    min="7"
                    max="19"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.95rem' }}>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    placeholder="your@email.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.95rem' }}>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    required
                    placeholder="08012345678"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '700',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '1rem'
                  }}
                >
                  Next: Select Payment Plan →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setFormData({ parentName: '', childName: '', childAge: '', email: '', phone: '', interest: '' });
                  }}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <form>
                <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Step 2: Select Payment Plan</h3>
                <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Monthly Fee: ₦{monthlyFee.toLocaleString()}</p>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.95rem' }}>How many months? *</label>
                  <select
                    value={selectedMonths}
                    onChange={(e) => setSelectedMonths(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="1">1 Month - ₦{monthlyFee.toLocaleString()}</option>
                    <option value="3">3 Months - ₦{(monthlyFee * 3).toLocaleString()}</option>
                    <option value="6">6 Months - ₦{(monthlyFee * 6).toLocaleString()}</option>
                    <option value="12">12 Months - ₦{(monthlyFee * 12).toLocaleString()}</option>
                  </select>
                </div>
                <div style={{ background: '#667eea10', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', border: '2px solid #667eea' }}>
                  <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Total Amount: <strong style={{ fontSize: '1.3rem', color: '#667eea' }}>₦{(monthlyFee * selectedMonths).toLocaleString()}</strong></p>
                </div>
                <button
                  type="button"
                  onClick={handlePaystackPayment}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    padding: '0.85rem',
                    fontSize: '1rem',
                    fontWeight: '700',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '1rem'
                  }}
                >
                  💳 Pay with Paystack
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStep('registration')}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  ← Back
                </button>
              </form>
            )}
          </div>
        ) : (
          <div data-aos="fade-up" style={{
            background: 'var(--bg-secondary)',
            padding: '2.5rem',
            borderRadius: '12px',
            maxWidth: '600px',
            margin: '0 auto',
            border: '1px solid var(--border-color)'
          }}>
            {submitSuccess ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#28a745'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Enrollment Request Received!</h3>
                <p>We'll contact you within 24 hours with next steps.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Enrollment Form</h3>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.95rem' }}>Parent/Guardian Name *</label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleFormChange}
                    required
                    placeholder="Your full name"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.95rem' }}>Child's Name *</label>
                  <input
                    type="text"
                    name="childName"
                    value={formData.childName}
                    onChange={handleFormChange}
                    required
                    placeholder="Your child's name"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.95rem' }}>Child's Age *</label>
                  <input
                    type="number"
                    name="childAge"
                    value={formData.childAge}
                    onChange={handleFormChange}
                    required
                    placeholder="Age"
                    min="7"
                    max="19"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.95rem' }}>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    placeholder="your@email.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.95rem' }}>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    required
                    placeholder="08012345678"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.95rem' }}>Area of Interest</label>
                  <textarea
                    name="interest"
                    value={formData.interest}
                    onChange={handleFormChange}
                    placeholder="What programs interest you most?"
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '700',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '1rem'
                  }}
                >
                  Proceed to Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </form>
            )}
          </div>
        )}
      </section>

      {/* CONTACT INFO FOOTER */}
      <section style={{
        background: 'var(--bg-secondary)',
        padding: '3rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)'
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1.5rem' }}>
          Contact Information
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <div>
            <p style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Phone Numbers</p>
            <p style={{ color: '#667eea', fontWeight: '600' }}>08037383820 | 09077219215</p>
          </div>
          <div>
            <p style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Founder</p>
            <p style={{ color: '#764ba2', fontWeight: '600' }}>Coach Roseline Iraoya</p>
          </div>
          <div>
            <p style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Session Day</p>
            <p style={{ color: '#667eea', fontWeight: '600' }}>Every Saturday - 3:00 to 5:00 PM</p>
          </div>
        </div>
      </section>
    </div>
  );
}
