import React, { useRef } from 'react';
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
    handleForgotPassword
  } = props;

  if (mode === 'login' && session) {
    return <Navigate to="/dashboard" replace />;
  }

  if (mode === 'dashboard' && !session) {
    return <Navigate to="/admin" replace />;
  }

  if (mode === 'login' && !session) {
    return (
      <div className="auth-page-wrapper">
        <div className="login-card-layout" data-aos="fade-up">
          <h2 className="login-brand-title">Admin Gateway</h2>

          <form onSubmit={handleSignIn} className="standard-login-form">
            <div className="form-input-container">
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Admin Email Account</label>
              <input ref={emailInputRef} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@paztribe.org" required className="plain-text-input" />
            </div>
            <div className="form-input-container">
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Account Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="plain-text-input" />
            </div>
            <button type="submit" className="form-submit-action-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Portal Credentials'}
            </button>
          </form>

          <div style={{ marginTop: '1.2rem', textAlign: 'center' }}>
            <button 
              type="button" 
              onClick={() => setShowForgotPasswordModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--brand-blue)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                textDecoration: 'underline',
                padding: 0,
                fontFamily: 'inherit'
              }}
            >
              Forgot your password?
            </button>
          </div>
        </div>

        {/* Password Reset Modal */}
        {showForgotPasswordModal && (
          <div 
            className="regulatory-modal-overlay" 
            onClick={() => !resetLoading && setShowForgotPasswordModal(false)}
          >
            <div 
              className="regulatory-modal-card" 
              onClick={(event) => event.stopPropagation()}
              style={{ maxWidth: '420px' }}
            >
              <div className="regulatory-modal-header">
                <div>
                  <p className="regulatory-modal-eyebrow">Password Recovery</p>
                  <h3>Reset Your Password</h3>
                </div>
                <button 
                  type="button" 
                  className="regulatory-modal-close-btn" 
                  onClick={() => !resetLoading && setShowForgotPasswordModal(false)}
                  disabled={resetLoading}
                  aria-label="Close dialog"
                >
                  ×
                </button>
              </div>
              <div className="regulatory-modal-body">
                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                    Enter your admin email address and we'll send you a link to reset your password.
                  </p>
                  
                  <div className="form-input-container" style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>Email Address</label>
                    <input 
                      type="email" 
                      value={resetEmail} 
                      onChange={(e) => setResetEmail(e.target.value)} 
                      placeholder="admin@paztribe.org" 
                      required 
                      disabled={resetLoading}
                      className="plain-text-input" 
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
                    style={{ marginTop: '0.5rem' }}
                  >
                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="portal-workspace-grid">
      <aside className="portal-sidebar-panel">
        <div className="portal-sidebar-title">PTT Admin</div>
        <nav className="portal-sidebar-links">
          <Link to="/" className="sidebar-link-item" style={{ textDecoration: 'none' }}>← Exit to Live Website</Link>
          <div className="sidebar-link-item active">Core Studio Engine</div>
        </nav>
        <button onClick={handleSignOut} className="sidebar-disconnect-btn">Logout to Sign In</button>
      </aside>

      <div className="portal-main-workspace">
        <div className="portal-workspace-header-shell">
          <header className="portal-workspace-header">
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)' }}>Paz Tribe Dynamic Website CMS Engine</h2>
              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Secure admin console for content, applicants, and programs.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ background: 'var(--bg-main)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid var(--border-color)' }}>{session.user.email}</div>
              <button onClick={handleSignOut} className="dashboard-logout-btn">Logout</button>
            </div>
          </header>
        </div>

        <AdminTabBar selectedTab={selectedAdminTab} onChangeTab={setSelectedAdminTab} />

        <main className="portal-workspace-body-content">
          {dashboardMessage && <div className="status-feedback-banner" style={{ marginBottom: '1.5rem' }}>{dashboardMessage}</div>}

          {selectedAdminTab === 'content' && (
            <section className="dashboard-editor-card">
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Modify Core Specialty Menus Content</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Select your menu configuration channel to synchronize text details onto deep pages dynamically.</p>

              <form onSubmit={handleSaveLegalAndFaqContent} className="cms-creation-form-layout" style={{ marginTop: '1.5rem' }}>
                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Privacy Policy Content</label>
                  <textarea value={privacyContent} onChange={(e) => setPrivacyContent(e.target.value)} rows="7" className="plain-text-input" style={{ resize: 'vertical', minHeight: '140px' }} />
                </div>

                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Terms & Conditions Content</label>
                  <textarea value={termsContent} onChange={(e) => setTermsContent(e.target.value)} rows="7" className="plain-text-input" style={{ resize: 'vertical', minHeight: '140px' }} />
                </div>

                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Frequently Asked Questions</label>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {faqContent.map((item, index) => (
                      <div key={index} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', background: 'var(--bg-main)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>FAQ {index + 1}</strong>
                          {faqContent.length > 1 && (
                            <button type="button" onClick={() => setFaqContent((prev) => prev.filter((_, itemIndex) => itemIndex !== index))} className="form-cancel-action-btn" style={{ padding: '0.45rem 0.8rem' }}>
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="form-input-container" style={{ marginTop: '0.75rem' }}>
                          <label style={{ fontWeight: '600' }}>Question</label>
                          <input type="text" value={item.question} onChange={(e) => updateFaqItem(index, 'question', e.target.value)} className="plain-text-input" />
                        </div>

                        <div className="form-input-container">
                          <label style={{ fontWeight: '600' }}>Answer</label>
                          <textarea value={item.answer} onChange={(e) => updateFaqItem(index, 'answer', e.target.value)} rows="4" className="plain-text-input" style={{ resize: 'vertical' }} />
                        </div>

                        <div className="form-input-container">
                          <label style={{ fontWeight: '600' }}>Link Label</label>
                          <input type="text" value={item.linkLabel} onChange={(e) => updateFaqItem(index, 'linkLabel', e.target.value)} className="plain-text-input" placeholder="e.g. View our service offerings" />
                        </div>

                        <div className="form-input-container">
                          <label style={{ fontWeight: '600' }}>Link Destination</label>
                          <input type="text" value={item.linkTo} onChange={(e) => updateFaqItem(index, 'linkTo', e.target.value)} className="plain-text-input" placeholder="/care-counseling" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setFaqContent((prev) => [...prev, { question: '', answer: '', linkLabel: '', linkTo: '/' }])} className="form-cancel-action-btn" style={{ marginTop: '0.9rem' }}>
                    Add FAQ Item
                  </button>
                </div>

                <button type="submit" className="form-submit-action-btn" style={{ maxWidth: '280px' }}>Save Legal & FAQ Content</button>
              </form>

              {cmsSuccessMessage && <div className="status-feedback-banner" style={{ marginTop: '1.5rem' }}>{cmsSuccessMessage}</div>}
              {cmsErrorMessage && <div className="status-feedback-banner" style={{ marginTop: '1rem', color: '#842029', background: '#f8d7da', border: '1px solid #f5c2c7' }}>{cmsErrorMessage}</div>}

              <form onSubmit={handleUpdateContentCMS} className="cms-creation-form-layout">
                <div className="form-input-container">
                  <label style={{ color: 'var(--brand-blue)', fontWeight: '600' }}>Select Targeted Menu Category to Update</label>
                  <select value={editTarget} onChange={(e) => setEditTarget(e.target.value)} className="plain-text-input" style={{ height: '46px', border: '1px solid var(--brand-blue)' }}>
                    <option value="family">Thriving Parents</option>
                    <option value="marriage">Thriving Women</option>
                    <option value="children">Thriving Pre-teen & Teens</option>
                  </select>
                </div>

                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Display Heading Title</label>
                  <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="plain-text-input" required />
                </div>

                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Subtitle & Specialist Roles</label>
                  <input type="text" value={formSubtitle} onChange={(e) => setFormSubtitle(e.target.value)} className="plain-text-input" required />
                </div>

                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Impact Score / Metric Total Text</label>
                  <input type="text" value={formMetric} onChange={(e) => setFormMetric(e.target.value)} className="plain-text-input" required />
                </div>

                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Detailed Menu Context Description</label>
                  <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows="5" className="plain-text-input" style={{ resize: 'vertical', fontFamily: 'inherit' }} required></textarea>
                </div>

                <button type="submit" className="form-submit-action-btn" style={{ maxWidth: '250px' }}>Publish Dynamic Update</button>
              </form>

              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ marginBottom: '0.75rem' }}>Client Testimonials (Homepage Slider)</h4>
                <p style={{ color: 'var(--text-muted)', marginTop: 0 }}>Add or preview client reviews shown in the homepage testimonial slider.</p>

                {cmsSuccessMessage && <div className="status-feedback-banner" style={{ marginTop: '0.75rem' }}>{cmsSuccessMessage}</div>}
                {cmsErrorMessage && <div className="status-feedback-banner" style={{ marginTop: '0.75rem', color: '#842029', background: '#f8d7da', border: '1px solid #f5c2c7' }}>{cmsErrorMessage}</div>}

                <form onSubmit={handleAddTestimonial} className="cms-creation-form-layout" style={{ marginTop: '1rem' }}>
                  <div className="form-input-container">
                    <label style={{ fontWeight: '600' }}>Client / Author</label>
                    <input type="text" value={testimonialAuthor} onChange={(e) => setTestimonialAuthor(e.target.value)} className="plain-text-input" placeholder="Author name or tag" />
                  </div>
                  <div className="form-input-container">
                    <label style={{ fontWeight: '600' }}>Origin / Tag</label>
                    <input type="text" value={testimonialOrigin} onChange={(e) => setTestimonialOrigin(e.target.value)} className="plain-text-input" placeholder="e.g., Oniru Client" />
                  </div>
                  <div className="form-input-container">
                    <label style={{ fontWeight: '600' }}>Testimonial</label>
                    <textarea value={testimonialText} onChange={(e) => setTestimonialText(e.target.value)} rows="4" className="plain-text-input" style={{ resize: 'vertical' }} required />
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <button type="submit" className="form-submit-action-btn" style={{ maxWidth: '250px' }}>{testimonialEditIndex !== null ? 'Save Testimonial' : 'Add Testimonial'}</button>
                    {testimonialEditIndex !== null && (
                      <button type="button" onClick={handleCancelEditTestimonial} className="form-cancel-action-btn" style={{ maxWidth: '140px' }}>Cancel</button>
                    )}
                  </div>
                </form>

                <div style={{ marginTop: '1.25rem' }}>
                  <h5 style={{ marginBottom: '0.6rem' }}>Current Testimonials</h5>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {promoSlides.map((t, idx) => (
                      <div key={idx} style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <div style={{ flex: 1 }}>
                          <strong style={{ display: 'block' }}>{t.title}</strong>
                          <div style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>{t.text.slice(0, 220)}{t.text.length > 220 ? '…' : ''}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button onClick={() => handleStartEditTestimonial(idx)} className="form-submit-action-btn" style={{ padding: '0.45rem 0.7rem' }}>Edit</button>
                          <button onClick={() => handleDeleteTestimonial(idx)} className="form-cancel-action-btn" style={{ padding: '0.45rem 0.7rem' }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {selectedAdminTab === 'social' && (
            <section className="dashboard-editor-card">
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Social Media Preview Editor</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Update the featured social card content and YouTube playback URL displayed on the homepage.</p>

              {cmsSuccessMessage && <div className="status-feedback-banner" style={{ marginTop: '1.5rem' }}>{cmsSuccessMessage}</div>}
              {cmsErrorMessage && <div className="status-feedback-banner" style={{ marginTop: '1rem', color: '#842029', background: '#f8d7da', border: '1px solid #f5c2c7' }}>{cmsErrorMessage}</div>}

              <form onSubmit={handleUpdateSocialPreview} className="cms-creation-form-layout" style={{ marginTop: '1.5rem' }}>
                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Select Social Platform</label>
                  <select value={socialEditTarget} onChange={(e) => setSocialEditTarget(e.target.value)} className="plain-text-input" style={{ height: '46px' }}>
                    {props.socialNewsFeed.map((item) => (
                      <option key={item.platform} value={item.platform}>{item.platform}</option>
                    ))}
                  </select>
                </div>

                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Social Preview Headline</label>
                  <input type="text" value={socialPreviewTitle} onChange={(e) => setSocialPreviewTitle(e.target.value)} className="plain-text-input" required />
                </div>

                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Preview Description</label>
                  <textarea value={socialPreviewSummary} onChange={(e) => setSocialPreviewSummary(e.target.value)} rows="4" className="plain-text-input" style={{ resize: 'vertical', fontFamily: 'inherit' }} required />
                </div>

                <div className="form-input-container" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontWeight: '600' }}>Action Link URL</label>
                    <input type="url" value={socialPreviewUrl} onChange={(e) => setSocialPreviewUrl(e.target.value)} className="plain-text-input" required />
                  </div>
                  <button type="button" onClick={fetchSocialUrlMetadata} className="form-submit-action-btn" style={{ minWidth: '220px' }} disabled={!socialPreviewUrl || socialMetadataLoading}>
                    {socialMetadataLoading ? 'Fetching...' : 'Fetch details from URL'}
                  </button>
                </div>

                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Post Timestamp</label>
                  <input type="text" value={socialPreviewTimestamp} onChange={(e) => setSocialPreviewTimestamp(e.target.value)} className="plain-text-input" placeholder="Posted 4 hours ago" />
                </div>

                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Badge Label</label>
                  <input type="text" value={socialPreviewBadgeText} onChange={(e) => setSocialPreviewBadgeText(e.target.value)} className="plain-text-input" required />
                </div>

                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>YouTube Embed URL</label>
                  <input type="url" value={socialPreviewEmbedUrl} onChange={(e) => setSocialPreviewEmbedUrl(e.target.value)} className="plain-text-input" placeholder="https://www.youtube.com/watch?v=..." />
                  <small style={{ color: 'var(--text-muted)' }}>This URL will be used for the homepage video player when YouTube is selected.</small>
                </div>

                <button type="submit" className="form-submit-action-btn" style={{ maxWidth: '250px' }}>Update Social Preview</button>
              </form>
            </section>
          )}

          {selectedAdminTab === 'programs' && (
            <section className="dashboard-editor-card">
              <h3 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)' }}>Create Programs</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Add new curriculum offerings for any service category and make them available on the customer-facing pages.</p>

              <form onSubmit={handleCreateProgram} className="cms-creation-form-layout" style={{ marginTop: '1.5rem' }}>
                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Service Category</label>
                  <select value={programForm.service} onChange={(e) => setProgramForm((prev) => ({ ...prev, service: e.target.value }))} className="plain-text-input" style={{ height: '46px' }}>
                    <option value="family">Thriving Parents</option>
                    <option value="marriage">Thriving Women</option>
                    <option value="children">Thriving Pre-teen & Teens</option>
                  </select>
                </div>

                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Program Name</label>
                  <input type="text" value={programForm.title} onChange={(e) => setProgramForm((prev) => ({ ...prev, title: e.target.value }))} className="plain-text-input" required />
                </div>

                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Program Level / Age Group</label>
                  <input type="text" value={programForm.level} onChange={(e) => setProgramForm((prev) => ({ ...prev, level: e.target.value }))} className="plain-text-input" required />
                </div>

                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Duration</label>
                  <input type="text" value={programForm.duration} onChange={(e) => setProgramForm((prev) => ({ ...prev, duration: e.target.value }))} className="plain-text-input" required />
                </div>

                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Schedule</label>
                  <input type="text" value={programForm.schedule} onChange={(e) => setProgramForm((prev) => ({ ...prev, schedule: e.target.value }))} className="plain-text-input" required />
                </div>

                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Program Overview</label>
                  <textarea value={programForm.description} onChange={(e) => setProgramForm((prev) => ({ ...prev, description: e.target.value }))} rows="4" className="plain-text-input" style={{ resize: 'vertical', fontFamily: 'inherit' }} required></textarea>
                </div>

                <button type="submit" className="form-submit-action-btn" style={{ maxWidth: '250px' }}>Create Program</button>
              </form>

              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Programs by Category</h4>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {programs.map((program) => (
                    <div key={program.id} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
                        <div>
                          <strong>{program.name}</strong>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{program.service.toUpperCase()}</div>
                        </div>
                        <button type="button" onClick={() => handleRemoveProgram(program.id)} style={{ background: '#ff4757', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.55rem 0.85rem', cursor: 'pointer' }}>Remove</button>
                      </div>
                      <p style={{ margin: '0.85rem 0 0 0', color: 'var(--text-muted)' }}>{program.description}</p>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                        <span>{program.duration}</span>
                        <span>{program.level}</span>
                        <span>{program.schedule}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {selectedAdminTab === 'clients' && (
            <section className="dashboard-editor-card">
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)' }}>Client Activity Log</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>See the latest pages visitors viewed and the exact timestamp for each visit.</p>
                </div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 700, minWidth: '150px' }}>
                  Recent Visits: {clientActivityLog.length}
                </div>
              </div>

              {clientActivityLoading ? (
                <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>Loading recent website activity...</p>
                </div>
              ) : clientActivityLog.length === 0 ? (
                <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>No client activity has been recorded yet.</p>
                </div>
              ) : (
                <div className="applicants-table-wrapper" style={{ marginTop: '1.5rem' }}>
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Visited Page</th>
                        <th>Session</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientActivityLog.slice(0, 100).map((entry) => (
                        <tr key={entry.id || `${entry.session_id}-${entry.created_at}-${entry.path}`}>
                          <td>{new Date(entry.created_at || entry.createdAt).toLocaleString()}</td>
                          <td>{entry.path || entry.pathname || '/'}</td>
                          <td>{entry.session_id || 'Unknown session'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {selectedAdminTab === 'applicants' && (
            <section className="dashboard-editor-card">
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)' }}>Recent Applicants</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Review the latest intake submissions and track their requested service path.</p>
                </div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 700, minWidth: '150px' }}>
                  Total Registered: {applicants.length}
                </div>
              </div>

              {applicants.length === 0 ? (
                <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>No applicants have submitted yet.</p>
                </div>
              ) : (
                <div className="applicants-table-wrapper">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Track</th>
                        <th>Status</th>
                        <th>Payment Ref</th>
                        <th>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.slice(0, 50).map((applicant) => (
                        <tr key={applicant.id}>
                          <td>{applicant.fullName}</td>
                          <td>{applicant.email}</td>
                          <td>{applicant.phone}</td>
                          <td>{applicant.track}</td>
                          <td><span className={`status-pill ${applicant.paymentStatus === 'success' ? 'success' : 'pending'}`}>{applicant.paymentStatus}</span></td>
                          <td>{applicant.paymentReference || 'N/A'}</td>
                          <td>{new Date(applicant.submittedAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {selectedAdminTab === 'payments' && (
            <section className="dashboard-editor-card">
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Paystack Payment Settings</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Configure your Paystack API key and pricing for Pre-teen & Teens Academy program.</p>

              {dashboardMessage && <div className="status-feedback-banner" style={{ marginTop: '1.5rem' }}>{dashboardMessage}</div>}

              <form onSubmit={(e) => {
                e.preventDefault();
                setPaystackPublicKey(tempPaystackKey);
                setTeensKidsMonthlyFee(parseInt(tempMonthlyFee) || 30000);
                props.setDashboardMessage('✓ Payment settings saved successfully!');
                setTimeout(() => props.setDashboardMessage(null), 3000);
              }} style={{ marginTop: '1.5rem' }}>
                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Paystack Public Key</label>
                  <input
                    type="text"
                    value={tempPaystackKey}
                    onChange={(e) => setTempPaystackKey(e.target.value)}
                    className="plain-text-input"
                    placeholder="pk_live_... or pk_test_..."
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                    Your Paystack public API key. Switch between test and live keys as needed.
                  </small>
                </div>

                <div className="form-input-container">
                  <label style={{ fontWeight: '600' }}>Program Registration Fee (NGN)</label>
                  <input
                    type="number"
                    value={tempMonthlyFee}
                    onChange={(e) => setTempMonthlyFee(e.target.value)}
                    className="plain-text-input"
                    placeholder="10000"
                    min="1000"
                    max="1000000"
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                    Update the academy registration fee for the Pre-teen & Teens program. This value drives the displayed pricing for clients.
                  </small>
                </div>

                <button
                  type="submit"
                  className="form-submit-action-btn"
                  style={{ marginTop: '1.5rem', width: '100%', maxWidth: '200px' }}
                >
                  Save Payment Settings
                </button>
              </form>

              <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)' }}>Current Configuration</h4>
                <div style={{ display: 'grid', gap: '0.75rem', color: 'var(--text-muted)' }}>
                  <span><strong>Active Public Key:</strong> {paystackPublicKey.substring(0, 20)}...</span>
                  <span><strong>Monthly Fee:</strong> ₦{teensKidsMonthlyFee.toLocaleString()}</span>
                  <span><strong>3 Months:</strong> ₦{(teensKidsMonthlyFee * 3).toLocaleString()}</span>
                  <span><strong>6 Months:</strong> ₦{(teensKidsMonthlyFee * 6).toLocaleString()}</span>
                  <span><strong>12 Months:</strong> ₦{(teensKidsMonthlyFee * 12).toLocaleString()}</span>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
