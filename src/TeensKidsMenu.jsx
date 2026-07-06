import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ThriverRegistrationModal from './ThriverRegistrationModal';

export default function TeensKidsMenu({ paystackPublicKey = 'pk_test_demo_key_update_from_admin', teensKidsMonthlyFee = 30000 }) {
  const teensHeroSlides = [
    {
      eyebrow: 'Thriving Pre-teen & Teens Academy',
      title: 'Building confidence, character, and purpose',
      text: 'A supportive environment where children and teenagers grow into responsible leaders with strong values, practical life skills, and self-belief.',
      image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1200'
    },
    {
      eyebrow: 'Leadership & personal growth',
      title: 'Mentorship that helps young people thrive',
      text: 'From public speaking to emotional resilience, each session is designed to help young people develop confidence and real-life skills.',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200'
    },
    {
      eyebrow: 'Family and community support',
      title: 'Practical learning with warmth and structure',
      text: 'Parents and young people receive clear guidance, encouragement, and progress support in a trusted, value-based space.',
      image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1200'
    }
  ];

  const [activeTab, setActiveTab] = useState('overview');
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [heroPopupMode, setHeroPopupMode] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    clientType: 'Individual',
    sessionType: 'Virtual',
    preferredTime: 'Any time',
    concern: ''
  });
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, offset: 100 });
    window.scrollTo(0, 0);
    const heroInterval = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % teensHeroSlides.length);
    }, 5500);

    return () => clearInterval(heroInterval);
  }, [teensHeroSlides.length]);

  useEffect(() => {
    document.body.style.overflow = heroPopupMode ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [heroPopupMode]);

  const openRegistrationPopup = (mode = 'register') => {
    setHeroPopupMode(mode);
    setBookingSubmitted(false);
  };

  const closeRegistrationPopup = () => {
    setHeroPopupMode(null);
    setBookingSubmitted(false);
  };

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
              Welcome to Thriving Pre-teen & Teens!
            </p>
            <p style={{ fontSize: '1rem', lineHeight: '1.8', color: '#4a5568', marginBottom: '1rem' }}>
              A place where we help you build positive values, empower you to reach your full potential and thrive.
            </p>
            <p style={{ fontSize: '1rem', lineHeight: '1.8', color: '#4a5568', marginBottom: '1rem' }}>
              At Thriving Pre-teen & Teens, you will build confidence, strengthen your character, discover your purpose, and develop the leadership skills needed to shine in your world.
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
              Lead Coach, Thriving Pre-teen & Teens
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

      {heroPopupMode && (
        <ThriverRegistrationModal
          visible={Boolean(heroPopupMode)}
          mode={heroPopupMode}
          onClose={closeRegistrationPopup}
          onRegister={async () => {
            setHeroPopupMode(null);
          }}
          paystackPublicKey={paystackPublicKey}
          bookingForm={bookingForm}
          setBookingForm={setBookingForm}
          bookingSubmitted={bookingSubmitted}
          handleHeroBookingSubmit={(e) => {
            e.preventDefault();
            setBookingSubmitted(true);
            setTimeout(() => {
              setHeroPopupMode(null);
              setBookingSubmitted(false);
            }, 1400);
          }}
        />
      )}

      {/* HERO BANNER */}
      <section className="service-view-hero-banner" style={{ minHeight: '460px', marginBottom: '3rem' }} data-aos="fade-down">
        <div
          className="service-banner-bg"
          style={{ backgroundImage: `url(${teensHeroSlides[activeHeroSlide].image})` }}
        />
        <div className="service-banner-content" key={activeHeroSlide}>
          <span className="section-label" style={{ color: '#e7f7ef', textTransform: 'uppercase' }}>{teensHeroSlides[activeHeroSlide].eyebrow}</span>
          <h1>{teensHeroSlides[activeHeroSlide].title}</h1>
          <p>{teensHeroSlides[activeHeroSlide].text}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={openRegistrationPopup}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '0.95rem 1.8rem',
                borderRadius: '999px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Register Now
            </button>
            <button
              type="button"
              className="service-banner-btn"
              onClick={() => setActiveHeroSlide((prev) => (prev - 1 + teensHeroSlides.length) % teensHeroSlides.length)}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
          </div>
          <div className="service-banner-controls" style={{ marginTop: '1.5rem' }}>
            <button
              type="button"
              className="service-banner-btn"
              onClick={() => setActiveHeroSlide((prev) => (prev - 1 + teensHeroSlides.length) % teensHeroSlides.length)}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            {teensHeroSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`service-banner-dot ${index === activeHeroSlide ? 'active' : ''}`}
                aria-label={`Show slide ${index + 1}`}
                onClick={() => setActiveHeroSlide(index)}
              />
            ))}
            <button
              type="button"
              className="service-banner-btn"
              onClick={() => setActiveHeroSlide((prev) => (prev + 1) % teensHeroSlides.length)}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
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
      {/* <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem', marginBottom: '3rem' }}>
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
            <p style={{ fontSize: '2rem', fontWeight: '900', color: '#667eea', marginBottom: '0.5rem' }}>₦30,000</p>
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
      </section> */}

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
                <p style={{ fontSize: '1rem', fontWeight: '600' }}>{event}</p>
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>COACH ROSELINE IRAOYA</h4>
            <p style={{ color: '#667eea', fontWeight: '600', marginBottom: '0.5rem' }}>Lead Coach</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Certified Children and Teen Coach, passionate about helping children and teens build positive values.</p>
          </div>
          <div data-aos="fade-up" data-aos-delay="50" style={{
            background: 'var(--bg-secondary)',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>SUPPORTING TEAM</h4>
            <p style={{ color: '#667eea', fontWeight: '600', marginBottom: '1rem' }}>Expert Facilitators</p>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <li>Assistant Coaches, Dance Instructor, Drama Facilitator and, Administrative Officer</li>
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
      {/* <section style={{
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
      </section> */}

      {/* CONTACT & ENROLLMENT CTA */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem', marginBottom: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>
          Ready to Transform Your Child's Future?
        </h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Limited slots available. Join us today and be part of a transformational academy.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <p style={{ maxWidth: '640px', color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7', margin: 0 }}>
            Kindly use any of the buttons below to register or book a session. For any inquiries, please contact us via phone or email.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => window.open('https://pazthrivingtribe.schoolsfocus.net/apply', '_blank', 'noopener')}
              style={{
                minWidth: '220px',
                padding: '0.95rem 1.5rem',
                borderRadius: '999px',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Register Now
            </button>
            <button
              type="button"
              onClick={() => openRegistrationPopup('booking')}
              style={{
                minWidth: '220px',
                padding: '0.95rem 1.5rem',
                borderRadius: '999px',
                border: '1px solid #667eea',
                background: 'white',
                color: '#1e293b',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Book Now
            </button>
          </div>
        </div>
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
            <p style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Lead Consultant</p>
            <p style={{ color: '#667eea', fontWeight: '600' }}>Coach Roseline Iraoya</p>
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