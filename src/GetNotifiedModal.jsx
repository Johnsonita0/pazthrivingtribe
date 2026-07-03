import React from 'react';

/**
 * GetNotifiedModal Component
 * A reusable modal for capturing email notifications
 * 
 * Usage:
 * <GetNotifiedModal 
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   serviceTitle="Service Name"
 *   onSuccess={handleSuccess}
 * />
 */
export default function GetNotifiedModal({ 
  isOpen, 
  onClose, 
  serviceTitle = "our service",
  onSuccess = null 
}) {
  const [email, setEmail] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState(null); // 'success' or 'error'
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth <= 480);
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  const submitBtnStyle = {
    ...styles.emailSubmitBtn,
    opacity: isLoading ? 0.7 : 1,
    width: isMobile ? '100%' : 'auto',
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
          service: serviceTitle,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setTimeout(() => {
          setEmail('');
          setSubmitStatus(null);
          onClose();
          
          // Call success callback if provided
          if (onSuccess) {
            onSuccess(email);
          } else {
            // Default: redirect to home
            window.location.href = '/';
          }
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
      setEmail('');
      setSubmitStatus(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalBackdrop} onClick={handleCloseModal}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={handleCloseModal} aria-label="Close">×</button>
        
        <h2 style={styles.modalTitle}>🔔 Get Notified</h2>
        <p style={styles.modalDescription}>
          Be the first to know when <strong>{serviceTitle}</strong> launches! Enter your email and we'll send you an update.
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
            autoFocus
          />
          <button 
            type="submit" 
            style={submitBtnStyle}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
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
    padding: 0,
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
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  emailInput: {
    flex: '1 1 220px',
    minWidth: 0,
    padding: '0.95rem 1rem',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    fontSize: '0.95rem',
    color: 'var(--text-primary)',
    background: 'var(--bg-main)',
    transition: 'all 0.2s ease',
  },
  emailSubmitBtn: {
    flex: '0 0 auto',
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
};
