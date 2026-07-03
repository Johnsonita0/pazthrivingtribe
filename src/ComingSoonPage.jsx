import React from 'react';

export default function ComingSoonPage({ title, description }) {
  const [showEmailModal, setShowEmailModal] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState(null); // 'success' or 'error'

  const handleGetNotified = () => {
    setShowEmailModal(true);
    setEmail('');
    setSubmitStatus(null);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    // Improved email validation to match backend
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setSubmitStatus('error');
      return;
    }

    setIsLoading(true);

    try {
      // Send email notification to client
      const response = await fetch('/api/send-notification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          service: title,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setTimeout(() => {
          setShowEmailModal(false);
          setEmail('');
          setSubmitStatus(null);
          window.location.href = '/';
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      setSubmitStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!isLoading) {
      setShowEmailModal(false);
      setEmail('');
      setSubmitStatus(null);
    }
  };
  // Render different illustrations based on title
  const renderIllustration = () => {
    if (title === "Thriving Parents") {
      return (
        <svg style={styles.illustration} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          {/* Parent figure (animated) */}
          <circle cx="100" cy="40" r="14" fill="#22C55E" style={{ animation: 'float 3s ease-in-out infinite' }} />
          <rect x="86" y="60" width="28" height="35" rx="4" fill="#22C55E" opacity="0.9" style={{ animation: 'float 3s ease-in-out infinite 0.2s' }} />
          
          {/* Left child (animated) */}
          <circle cx="60" cy="50" r="10" fill="#3B82F6" style={{ animation: 'bounce 2s ease-in-out infinite' }} />
          <rect x="50" y="65" width="20" height="25" rx="3" fill="#3B82F6" opacity="0.9" style={{ animation: 'bounce 2s ease-in-out infinite' }} />
          
          {/* Right child (animated) */}
          <circle cx="140" cy="50" r="10" fill="#F59E0B" style={{ animation: 'bounce 2s ease-in-out infinite 0.3s' }} />
          <rect x="130" y="65" width="20" height="25" rx="3" fill="#F59E0B" opacity="0.9" style={{ animation: 'bounce 2s ease-in-out infinite 0.3s' }} />
          
          {/* Heart connection lines (animated) */}
          <path d="M 95 100 Q 75 115 60 130" stroke="#22C55E" strokeWidth="2" fill="none" opacity="0.5" style={{ animation: 'drawPath 2s ease-in-out infinite' }} />
          <path d="M 105 100 Q 125 115 140 130" stroke="#22C55E" strokeWidth="2" fill="none" opacity="0.5" style={{ animation: 'drawPath 2s ease-in-out infinite 0.5s' }} />
          
          {/* Heart shapes (pulsing) */}
          <g style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
            <path d="M 100 100 m -5 -2 c 0 -3 2 -5 5 -5 s 5 2 5 5 c 0 2 -2 4 -5 7 c -3 -3 -5 -5 -5 -7" fill="#FF1493" opacity="0.8" />
          </g>
          
          {/* Growth arrows */}
          <path d="M 50 140 L 50 160 M 45 155 L 50 160 L 55 155" stroke="#22C55E" strokeWidth="1.5" fill="none" opacity="0.6" style={{ animation: 'moveUp 1.5s ease-in-out infinite' }} />
          <path d="M 150 140 L 150 160 M 145 155 L 150 160 L 155 155" stroke="#22C55E" strokeWidth="1.5" fill="none" opacity="0.6" style={{ animation: 'moveUp 1.5s ease-in-out infinite 0.4s' }} />
        </svg>
      );
    } else if (title === "Thriving Women") {
      return (
        <svg style={styles.illustration} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          {/* Head (animated) */}
          <circle cx="100" cy="45" r="16" fill="#F472B6" style={{ animation: 'glow 2s ease-in-out infinite' }} />
          
          {/* Hair (animated) */}
          <path d="M 85 35 Q 80 20 100 15 Q 120 20 115 35" fill="#E91E8C" opacity="0.9" style={{ animation: 'sway 3s ease-in-out infinite' }} />
          
          {/* Body (animated) */}
          <path d="M 100 63 Q 85 75 80 100 L 80 140" stroke="#F472B6" strokeWidth="18" fill="none" strokeLinecap="round" style={{ animation: 'expandBody 2.5s ease-in-out infinite' }} />
          
          {/* Left arm (animated) */}
          <path d="M 85 78 L 65 95" stroke="#F472B6" strokeWidth="12" fill="none" strokeLinecap="round" style={{ animation: 'rotateLeft 2s ease-in-out infinite' }} />
          
          {/* Right arm (animated) */}
          <path d="M 115 78 L 135 95" stroke="#F472B6" strokeWidth="12" fill="none" strokeLinecap="round" style={{ animation: 'rotateRight 2s ease-in-out infinite' }} />
          
          {/* Left leg (animated) */}
          <path d="M 80 140 L 75 165" stroke="#F472B6" strokeWidth="12" fill="none" strokeLinecap="round" style={{ animation: 'stepLeft 2s ease-in-out infinite' }} />
          
          {/* Right leg (animated) */}
          <path d="M 80 140 L 85 165" stroke="#F472B6" strokeWidth="12" fill="none" strokeLinecap="round" style={{ animation: 'stepRight 2s ease-in-out infinite' }} />
          
          {/* Crown/star elements (pulsing) */}
          <circle cx="70" cy="20" r="4" fill="#FFD700" style={{ animation: 'sparkle 1.5s ease-in-out infinite' }} />
          <circle cx="130" cy="25" r="4" fill="#FFD700" style={{ animation: 'sparkle 1.5s ease-in-out infinite 0.3s' }} />
          <circle cx="100" cy="10" r="5" fill="#FFD700" style={{ animation: 'sparkle 1.5s ease-in-out infinite 0.6s' }} />
          
          {/* Growth spiral (animated) */}
          <path d="M 140 60 Q 150 70 145 85 Q 135 100 150 110 Q 165 115 160 130" stroke="#F472B6" strokeWidth="2" fill="none" opacity="0.6" style={{ animation: 'drawSpiral 3s ease-in-out infinite' }} />
          
          {/* Energy waves (animated) */}
          <circle cx="100" cy="70" r="25" fill="none" stroke="#F472B6" strokeWidth="1" opacity="0.4" style={{ animation: 'expandWave 1.5s ease-in-out infinite' }} />
        </svg>
      );
    } else {
      // Default illustration
      return (
        <svg style={styles.illustration} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="50" r="12" fill="#22C55E" opacity="0.9" />
          <circle cx="60" cy="110" r="10" fill="#3B82F6" opacity="0.8" />
          <circle cx="140" cy="110" r="10" fill="#F59E0B" opacity="0.8" />
          <circle cx="100" cy="160" r="12" fill="#22C55E" opacity="0.9" />
          <path d="M 100 62 Q 80 80 60 100" stroke="#22C55E" strokeWidth="2" fill="none" strokeDasharray="5,5" opacity="0.6" />
          <path d="M 100 62 Q 120 80 140 100" stroke="#3B82F6" strokeWidth="2" fill="none" strokeDasharray="5,5" opacity="0.6" />
          <path d="M 60 120 Q 80 140 100 148" stroke="#F59E0B" strokeWidth="2" fill="none" strokeDasharray="5,5" opacity="0.6" />
          <path d="M 140 120 Q 120 140 100 148" stroke="#F59E0B" strokeWidth="2" fill="none" strokeDasharray="5,5" opacity="0.6" />
        </svg>
      );
    }
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.content}>
          {/* Animated Illustration */}
          {renderIllustration()}
          <h1 style={styles.heading}>{title}</h1>
          <p style={styles.subheading}>{description || "We're Building Something Amazing"}</p>
          <p style={styles.description}>
            This page is currently under construction. Our team is hard at work crafting an exceptional experience for you. Check back soon!
          </p>

          {/* Status Badge */}
          <div style={styles.statusBadge}>
            <span style={styles.statusDot}></span>
            <span style={styles.statusText}>Coming Soon</span>
          </div>

          {/* Call to Action */}
          <div style={styles.ctaContainer}>
            <button style={styles.primaryBtn} onClick={() => window.location.href = "/"}>
              ← Back to Home
            </button>
            <button style={styles.secondaryBtn} onClick={handleGetNotified}>
              Get Notified
            </button>
          </div>

          {/* Progress Indicator */}
          <div style={styles.progressSection}>
            <p style={styles.progressLabel}>Development Progress</p>
            <div style={styles.progressBar}>
              <div style={styles.progressFill}></div>
            </div>
            <p style={styles.progressText}>65% Complete</p>
          </div>
        </div>

        {/* Floating Code Elements */}
        <div style={styles.floatingElements}>
          <div style={{ ...styles.floatingBox, top: '15%', left: '10%', animationDelay: '0s' }}>
            &lt;/&gt;
          </div>
          <div style={{ ...styles.floatingBox, top: '60%', right: '15%', animationDelay: '1s' }}>
            { }
          </div>
          <div style={{ ...styles.floatingBox, bottom: '20%', left: '20%', animationDelay: '2s' }}>
            $
          </div>
        </div>

        {/* Email Notification Modal */}
        {showEmailModal && (
          <div style={styles.modalBackdrop} onClick={handleCloseModal}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button style={styles.closeBtn} onClick={handleCloseModal}>×</button>
              
              <h2 style={styles.modalTitle}>Get Notified</h2>
              <p style={styles.modalDescription}>
                Be the first to know when {title} launches! Enter your email and we'll send you an update.
              </p>

              {submitStatus === 'success' ? (
                <div style={styles.successMessage}>
                  ✓ Thanks for subscribing! Check your email for updates.
                </div>
              ) : submitStatus === 'error' ? (
                <div style={styles.errorMessage}>
                  ✗ Please enter a valid email address.
                </div>
              ) : null}

              <form onSubmit={handleEmailSubmit} style={styles.emailForm}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.emailInput}
                  disabled={isLoading}
                  required
                />
                <button 
                  type="submit" 
                  style={{...styles.emailSubmitBtn, opacity: isLoading ? 0.7 : 1}}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, var(--bg-main) 0%, rgba(34, 197, 94, 0.05) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    marginTop: '70px',
  },
  heroSection: {
    maxWidth: '800px',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    textAlign: 'center',
    position: 'relative',
    zIndex: 2,
  },
  illustration: {
    width: '180px',
    height: '180px',
    margin: '0 auto 2rem',
    filter: 'drop-shadow(0 10px 30px rgba(34, 197, 94, 0.15))',
  },
  heading: {
    fontSize: 'clamp(2rem, 5vw, 3.2rem)',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: '0 0 1rem 0',
    letterSpacing: '-0.5px',
  },
  subheading: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: 'var(--brand-green)',
    margin: '0 0 1rem 0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  description: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    lineHeight: '1.8',
    margin: '0 0 2rem 0',
    maxWidth: '500px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '999px',
    padding: '0.75rem 1.5rem',
    marginBottom: '2rem',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'var(--brand-green)',
    animation: 'pulse 2s infinite',
  },
  statusText: {
    fontWeight: '600',
    color: 'var(--brand-green)',
    fontSize: '0.95rem',
  },
  ctaContainer: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginBottom: '3rem',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    background: 'var(--brand-green)',
    color: 'white',
    border: 'none',
    padding: '0.95rem 2rem',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
  },
  secondaryBtn: {
    background: 'transparent',
    color: 'var(--brand-green)',
    border: '2px solid var(--brand-green)',
    padding: '0.85rem 2rem',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  progressSection: {
    marginTop: '3rem',
    padding: '2rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
  },
  progressLabel: {
    margin: '0 0 1rem 0',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    textAlign: 'left',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: 'var(--border-color)',
    borderRadius: '999px',
    overflow: 'hidden',
    marginBottom: '0.75rem',
  },
  progressFill: {
    width: '65%',
    height: '100%',
    background: 'linear-gradient(90deg, var(--brand-green) 0%, #36b560 100%)',
    borderRadius: '999px',
    animation: 'slideRight 1.5s ease-out',
  },
  progressText: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    textAlign: 'right',
  },
  floatingElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  floatingBox: {
    position: 'absolute',
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--brand-green)',
    opacity: '0.15',
    animation: 'float 6s ease-in-out infinite',
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10002,
  },
  modalContent: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '2.5rem',
    maxWidth: '450px',
    width: '90vw',
    position: 'relative',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: 'slideUp 0.3s ease-out',
  },
  closeBtn: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  },
  modalTitle: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    margin: '0 0 0.5rem 0',
  },
  modalDescription: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    margin: '0 0 1.5rem 0',
    lineHeight: '1.6',
  },
  emailForm: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  emailInput: {
    flex: 1,
    padding: '0.95rem 1rem',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
    background: 'var(--bg-main)',
    transition: 'all 0.2s ease',
  },
  emailSubmitBtn: {
    padding: '0.95rem 1.5rem',
    background: 'var(--brand-green)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  successMessage: {
    background: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid var(--brand-green)',
    color: 'var(--brand-green)',
    padding: '1rem',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  errorMessage: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #EF4444',
    color: '#DC2626',
    padding: '1rem',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  '@keyframes': {
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    slideRight: {
      '0%': { width: 0 },
      '100%': { width: '65%' },
    },
    slideUp: {
      '0%': { transform: 'translateY(20px)', opacity: 0 },
      '100%': { transform: 'translateY(0)', opacity: 1 },
    },
    float: {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-20px)' },
    },
    bounce: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-15px)' },
    },
    drawPath: {
      '0%': { strokeDashoffset: 100 },
      '100%': { strokeDashoffset: 0 },
    },
    moveUp: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    glow: {
      '0%, 100%': { filter: 'drop-shadow(0 0 5px rgba(244, 114, 182, 0.4))' },
      '50%': { filter: 'drop-shadow(0 0 15px rgba(244, 114, 182, 0.8))' },
    },
    sway: {
      '0%, 100%': { transform: 'rotateZ(-2deg)' },
      '50%': { transform: 'rotateZ(2deg)' },
    },
    expandBody: {
      '0%, 100%': { strokeWidth: '18' },
      '50%': { strokeWidth: '20' },
    },
    rotateLeft: {
      '0%, 100%': { transform: 'rotate(0deg)' },
      '50%': { transform: 'rotate(-30deg)' },
    },
    rotateRight: {
      '0%, 100%': { transform: 'rotate(0deg)' },
      '50%': { transform: 'rotate(30deg)' },
    },
    stepLeft: {
      '0%, 100%': { transform: 'translateX(0)' },
      '50%': { transform: 'translateX(-5px)' },
    },
    stepRight: {
      '0%, 100%': { transform: 'translateX(0)' },
      '50%': { transform: 'translateX(5px)' },
    },
    sparkle: {
      '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
      '50%': { opacity: 1, transform: 'scale(1.2)' },
    },
    drawSpiral: {
      '0%': { strokeDashoffset: 200 },
      '100%': { strokeDashoffset: 0 },
    },
    expandWave: {
      '0%': { r: '20', opacity: 0.8 },
      '100%': { r: '35', opacity: 0 },
    },
  },
};

// Add global keyframe animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes slideRight {
    0% { width: 0; }
    100% { width: 65%; }
  }

  @keyframes slideUp {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }

  @keyframes drawPath {
    0% { stroke-dashoffset: 100; }
    100% { stroke-dashoffset: 0; }
  }

  @keyframes moveUp {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes glow {
    0%, 100% { filter: drop-shadow(0 0 5px rgba(244, 114, 182, 0.4)); }
    50% { filter: drop-shadow(0 0 15px rgba(244, 114, 182, 0.8)); }
  }

  @keyframes sway {
    0%, 100% { transform: rotateZ(-2deg); }
    50% { transform: rotateZ(2deg); }
  }

  @keyframes expandBody {
    0%, 100% { stroke-width: 18; }
    50% { stroke-width: 20; }
  }

  @keyframes rotateLeft {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(-30deg); }
  }

  @keyframes rotateRight {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(30deg); }
  }

  @keyframes stepLeft {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(-5px); }
  }

  @keyframes stepRight {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(5px); }
  }

  @keyframes sparkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }

  @keyframes drawSpiral {
    0% { stroke-dashoffset: 200; }
    100% { stroke-dashoffset: 0; }
  }

  @keyframes expandWave {
    0% { r: 20; opacity: 0.8; }
    100% { r: 35; opacity: 0; }
  }
`;
document.head.appendChild(styleSheet);
