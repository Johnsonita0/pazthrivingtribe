import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

function AdminTabBar({ selectedTab, onChangeTab }) {
  const adminTabs = [
    { id: 'content', label: 'Page Content' },
    { id: 'social', label: 'Social Preview' },
    { id: 'programs', label: 'Programs' },
    { id: 'clients', label: 'Client Activity Log' },
    { id: 'applicants', label: 'Applicants' },
    { id: 'payments', label: 'Payment Settings' }
  ];

  return (
    <div className="dashboard-tab-navigation">
      <div className="dashboard-tab-buttons">
        {adminTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`dashboard-tab-button ${selectedTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard(props) {
  const emailInputRef = useRef(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobileView(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const {
    mode = 'login',
    session,
    loading = false,
    authError,
    cmsErrorMessage,
    email,
    password,
    setEmail,
    setPassword,
    handleSignIn,
    handleSignOut,
    selectedAdminTab,
    setSelectedAdminTab,
    dashboardMessage,
    privacyContent,
    setPrivacyContent,
    termsContent,
    setTermsContent,
    faqContent,
    setFaqContent,
    updateFaqItem,
    handleSaveLegalAndFaqContent,
    cmsSuccessMessage,
    handleUpdateContentCMS,
    editTarget,
    setEditTarget,
    formTitle,
    setFormTitle,
    formSubtitle,
    setFormSubtitle,
    formDesc,
    setFormDesc,
    formMetric,
    setFormMetric,
    promoSlides,
    testimonialAuthor,
    setTestimonialAuthor,
    testimonialOrigin,
    setTestimonialOrigin,
    testimonialText,
    setTestimonialText,
    testimonialEditIndex,
    handleAddTestimonial,
    handleStartEditTestimonial,
    handleCancelEditTestimonial,
    handleDeleteTestimonial,
    socialEditTarget,
    setSocialEditTarget,
    socialPreviewTitle,
    setSocialPreviewTitle,
    socialPreviewSummary,
    setSocialPreviewSummary,
    socialPreviewBadgeText,
    setSocialPreviewBadgeText,
    socialPreviewTimestamp,
    setSocialPreviewTimestamp,
    socialPreviewUrl,
    setSocialPreviewUrl,
    socialPreviewEmbedUrl,
    setSocialPreviewEmbedUrl,
    socialMetadataLoading,
    fetchSocialUrlMetadata,
    handleUpdateSocialPreview,
    clientActivityLog = [],
    clientActivityLoading = false,
    contactMessages = [],
    programForm,
    setProgramForm,
    programs,
    handleCreateProgram,
    handleRemoveProgram,
    applicants,
    paystackPublicKey,
    teensKidsMonthlyFee,
    tempPaystackKey,
    setTempPaystackKey,
    tempMonthlyFee,
    setTempMonthlyFee,
    setPaystackPublicKey,
    setTeensKidsMonthlyFee,
    showForgotPasswordModal,
    setShowForgotPasswordModal,
    resetEmail,
    setResetEmail,
    resetLoading,
    resetMessage,
    handleForgotPassword,
    refreshAdminData
  } = props;

  const [activeDashboardView, setActiveDashboardView] = useState('visitors');

  if (mode === 'login' && session) {
    return <Navigate to="/dashboard" replace />;
  }

  if (mode === 'dashboard' && !session) {
    return <Navigate to="/admin" replace />;
  }

  if (mode === 'login' && !session) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f4f4',
        padding: '32px 16px',
        fontFamily: 'Inter, Arial, sans-serif'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '520px',
          background: '#f0f2f3',
          border: '1px solid #d8dfe5',
          borderRadius: '22px',
          padding: '30px 28px 22px',
          boxShadow: '0 18px 38px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <div style={{
              width: '82px',
              height: '82px',
              borderRadius: '22px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 22px rgba(0,0,0,0.08)'
            }}>
              <img
                src="/logo/logomain.png"
                alt="Paz Thriving Tribe logo"
                style={{ width: '56px', height: '56px', objectFit: 'contain' }}
              />
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              margin: '0 0 8px',
              fontSize: '0.82rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#3d3d3d',
              fontWeight: 700
            }}>
              Your Webapp Admin Portal
            </div>
            <h1 style={{
              margin: 0,
              fontSize: 'clamp(2.2rem, 3vw, 3.2rem)',
              lineHeight: 1.05,
              color: '#111111',
              fontWeight: 800
            }}>
              Admin Login
            </h1>
          </div>

          <form onSubmit={handleSignIn} style={{ display: 'grid', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '1.05rem', fontWeight: 700, color: '#1f1f1f' }}>
                Email
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#dde8f1',
                border: '1px solid #c7d4e0',
                borderRadius: '14px',
                padding: '0 16px',
                minHeight: '62px'
              }}>
                <span style={{ fontSize: '1.1rem', color: '#556778', marginRight: '12px' }}>✉</span>
                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@paztribe.org"
                  required
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '1.05rem',
                    color: '#1d1d1d',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '1.05rem', fontWeight: 700, color: '#1f1f1f' }}>
                Password
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#dde8f1',
                border: '1px solid #c7d4e0',
                borderRadius: '14px',
                padding: '0 16px',
                minHeight: '62px'
              }}>
                <span style={{ fontSize: '1.1rem', color: '#556778', marginRight: '12px' }}>🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '1.05rem',
                    color: '#1d1d1d',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {authError && (
              <div style={{
                color: '#b42318',
                background: '#fee4e2',
                border: '1px solid #fecdca',
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: '0.9rem',
                lineHeight: 1.4
              }}>
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                color: '#fff',
                background: 'linear-gradient(135deg, #ec4a8c, #d91f75)',
                borderRadius: '14px',
                minHeight: '64px',
                fontSize: '2rem',
                fontWeight: 800,
                boxShadow: '0 14px 24px rgba(217, 31, 117, 0.28)',
                opacity: loading ? 0.8 : 1
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div style={{
            marginTop: '22px',
            background: '#ececec',
            border: '1px solid #d6d6d6',
            borderRadius: '14px',
            padding: '22px 18px',
            textAlign: 'center',
            color: '#575757',
            fontSize: '1.15rem',
            lineHeight: 1.5,
            fontWeight: 500
          }}>
            Enter your administrator credentials to access the dashboard.
          </div>

          <div style={{ marginTop: '18px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setShowForgotPasswordModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#1a5ea8',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                textDecoration: 'underline',
                padding: 0,
                fontFamily: 'inherit'
              }}
            >
              Forgot your password?
            </button>
          </div>
        </div>

        {showForgotPasswordModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(17, 17, 17, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => !resetLoading && setShowForgotPasswordModal(false)}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '420px',
                background: '#ffffff',
                borderRadius: '18px',
                border: '1px solid #dfe6ef',
                padding: '22px 20px',
                boxShadow: '0 20px 44px rgba(0, 0, 0, 0.14)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <div style={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.72rem', fontWeight: 700 }}>
                    Password Recovery
                  </div>
                  <h3 style={{ margin: '6px 0 0', fontSize: '1.5rem' }}>Reset Your Password</h3>
                </div>
                <button
                  type="button"
                  onClick={() => !resetLoading && setShowForgotPasswordModal(false)}
                  disabled={resetLoading}
                  aria-label="Close dialog"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#4b5563',
                    fontSize: '2rem',
                    cursor: resetLoading ? 'not-allowed' : 'pointer',
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleForgotPassword} style={{ display: 'grid', gap: '14px' }}>
                <p style={{ margin: 0, color: '#5a6471', fontSize: '0.96rem', lineHeight: 1.5 }}>
                  Enter your admin email address and we’ll send you a reset link.
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#eef5fb',
                  border: '1px solid #d4dfeb',
                  borderRadius: '12px',
                  minHeight: '52px',
                  padding: '0 12px'
                }}>
                  <span style={{ marginRight: '8px', color: '#4f5d6a' }}>✉</span>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="admin@paztribe.org"
                    required
                    disabled={resetLoading}
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      color: '#1f2937'
                    }}
                  />
                </div>

                {resetMessage && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      backgroundColor: resetMessage.includes('✓') ? '#d4edda' : '#f8d7da',
                      color: resetMessage.includes('✓') ? '#155724' : '#842029',
                      border: `1px solid ${resetMessage.includes('✓') ? '#c3e6cb' : '#f5c2c7'}`
                    }}
                  >
                    {resetMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="form-submit-action-btn"
                  disabled={resetLoading || !resetEmail.trim()}
                  style={{
                    marginTop: '0.5rem',
                    minHeight: '52px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: '12px'
                  }}
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  const dashboardViews = [
    { id: 'visitors', label: 'Visitors', color: '#2e7af0', value: Math.max(clientActivityLog.length || 1, 1) },
    { id: 'teens', label: 'Teens Reg', color: '#f39a2b', value: Math.max(applicants.length || 0, 0) },
    { id: 'messages', label: 'Messages', color: '#22a564', value: Math.max(contactMessages.length || 0, 0) },
    { id: 'testimonials', label: 'Testimonials', color: '#7c3aed', value: Math.max(promoSlides.length || 0, 0) }
  ];

  const dashboardTableColumns = {
    visitors: ['Page', 'Visited at', 'Session'],
    teens: ['Name', 'Email', 'Phone', 'Track', 'Parent', 'School', 'Session', 'Focus', 'Submitted'],
    messages: ['Name', 'Email', 'Subject', 'Message'],
    testimonials: ['Name', 'Origin', 'Testimonial', 'Source']
  };

  const dashboardTableData = {
    visitors: clientActivityLog.slice(0, 10).map((entry) => ({
      id: entry.id || `${entry.session_id || 'activity'}-${entry.created_at || Date.now()}`,
      columns: [
        entry.path || entry.pathname || '/',
        new Date(entry.created_at || entry.createdAt || Date.now()).toLocaleString(),
        entry.session_id || 'Unknown session'
      ]
    })),
    teens: applicants.slice(0, 10).map((applicant) => ({
      id: applicant.id || `${applicant.email || 'survey'}-${applicant.submittedAt || Date.now()}`,
      columns: [
        applicant.fullName || 'Unnamed applicant',
        applicant.email || 'No email',
        applicant.phone || 'No phone',
        applicant.track || 'General',
        applicant.parentName || 'N/A',
        applicant.schoolName || 'N/A',
        applicant.preferredSession || 'N/A',
        applicant.developmentGoals || applicant.message || 'N/A',
        applicant.submittedAt ? new Date(applicant.submittedAt).toLocaleString() : 'N/A'
      ]
    })),
    messages: contactMessages.slice(0, 10).map((message) => ({
      id: message.id || `${message.email || 'message'}-${message.createdAt || Date.now()}`,
      columns: [
        message.name || 'Unknown sender',
        message.email || 'No email',
        message.subject || 'Message',
        message.message || 'No message provided'
      ]
    })),
    testimonials: promoSlides.slice(0, 10).map((testimonial) => ({
      id: testimonial.id || `${testimonial.title || 'testimonial'}-${testimonial.createdAt || Date.now()}`,
      columns: [
        testimonial.title || 'Anonymous',
        testimonial.origin || 'Parent',
        testimonial.text || 'No testimonial added',
        testimonial.imageType || 'Website'
      ]
    }))
  };

  const activeDashboardLabel = dashboardViews.find((view) => view.id === activeDashboardView)?.label || 'Visitors';

  return (
    <div style={{ minHeight: '100vh', background: '#f1f2f4', padding: '26px 20px 32px', fontFamily: 'Inter, Arial, sans-serif' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', border: '1px solid #dfe3e7', borderRadius: '22px', background: '#f3f2f0', padding: '28px 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 'clamp(2.5rem, 3vw, 4rem)', lineHeight: 1.05, fontWeight: 800, color: '#1d1d1d' }}>Admin dashboard</h1>
            <p style={{ margin: '10px 0 0', fontSize: '1.1rem', fontWeight: 400, color: '#4b5563', maxWidth: '760px', lineHeight: 1.5 }}>
              Overview of survey responses, contact submissions, and parent testimonials.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '22px', marginTop: '30px' }}>
          {dashboardViews.map((view) => (
            <div
              key={view.id}
              style={{
                background: view.color,
                borderRadius: '18px',
                padding: '20px 20px 18px',
                minHeight: '170px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
              <div style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {view.label}
              </div>
              <div style={{ color: '#fff', fontSize: '4.2rem', fontWeight: 800, lineHeight: 1 }}>{view.value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '26px', padding: '0 2px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderBottom: '1px solid #d9dde2', paddingBottom: '18px' }}>
            {dashboardViews.map((view) => {
              const isActive = activeDashboardView === view.id;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setActiveDashboardView(view.id)}
                  style={{
                    border: '1px solid rgba(255,255,255,0.35)',
                    background: isActive ? '#ef4a86' : '#f1f2f4',
                    color: isActive ? '#fff' : '#1f2937',
                    borderRadius: '999px',
                    padding: '0.65rem 1rem',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isActive ? '0 8px 18px rgba(239,74,134,0.22)' : 'none'
                  }}
                >
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: isActive ? '#fff' : '#ef4a86',
                    color: isActive ? '#ef4a86' : '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}>
                    {view.value}
                  </span>
                  {view.label}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '18px', border: '1px solid #dfe3e7', borderRadius: '18px', background: '#f5f5f5', padding: '18px 20px 24px' }}>
            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#1a1a1a' }}>{activeDashboardLabel}</h2>
            <p style={{ margin: '8px 0 0', fontSize: '1.05rem', color: '#4b5563' }}>
              {activeDashboardView === 'visitors' ? 'Visitors logged from the main site.' : activeDashboardView === 'teens' ? 'Teens registration form details submitted through the public site.' : activeDashboardView === 'messages' ? 'Messages submitted via the main contact form.' : 'Testimonials submitted from the site and available for review.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '20px' }}>
              <button type="button" style={{ border: '1px solid #d8dfe7', background: '#f0f1f2', color: '#1f2937', borderRadius: '999px', padding: '0.8rem 1.2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                All rows
              </button>
              <button type="button" style={{ border: '1px solid #d8dfe7', background: '#f0f1f2', color: '#1f2937', borderRadius: '999px', padding: '0.8rem 1.2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                Selected rows (0)
              </button>
              <button type="button" style={{ border: '1px solid #d8dfe7', background: '#f0f1f2', color: '#1f2937', borderRadius: '999px', padding: '0.8rem 1.2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                Delete selected
              </button>
              <button type="button" style={{ border: 'none', background: '#f0f1f2', color: '#1f2937', borderRadius: '999px', padding: '0.8rem 1.2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                Preview PDF
              </button>
              <button type="button" style={{ border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', borderRadius: '999px', padding: '0.8rem 1.5rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 12px 22px rgba(92,74,228,0.22)' }}>
                Print responses
              </button>
            </div>

            <div style={{ marginTop: '18px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', overflow: 'hidden', minWidth: '980px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {dashboardTableColumns[activeDashboardView]?.map((column) => (
                      <th key={column} style={{ textAlign: 'left', padding: '14px 16px', color: '#374151', fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dashboardTableData[activeDashboardView]?.length > 0 ? (
                    dashboardTableData[activeDashboardView].map((row) => (
                      <tr key={row.id} style={{ borderTop: '1px solid #eef2f7' }}>
                        {row.columns.map((cell, index) => (
                          <td key={`${row.id}-${index}`} style={{ padding: '14px 16px', color: '#4b5563', verticalAlign: 'top', maxWidth: '260px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={dashboardTableColumns[activeDashboardView]?.length || 1} style={{ padding: '18px 16px', color: '#6b7280', textAlign: 'center' }}>No records available yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
