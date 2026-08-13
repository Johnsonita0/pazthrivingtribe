import React, { useEffect, useRef, useState, useMemo } from 'react';
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
    bookings = [],
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
  const [parentFilter, setParentFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [viewingRow, setViewingRow] = useState(null);

  const toggleSelectRow = (id) => {
    setSelectedRowIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const clearSelection = () => setSelectedRowIds([]);

  const tableMap = {
    visitors: null,
    teens: 'tribe_applicants',
    messages: 'tribe_contact_messages',
    bookings: 'tribe_bookings',
    testimonials: 'tribe_testimonials'
  };

  const extractDbId = (rowId) => {
    if (!rowId) return rowId;
    // If id looks like composite 'uuid-idx' where uuid contains dashes, return first segment
    const parts = rowId.split('-');
    if (parts.length > 2) return parts.slice(0, 5).join('-');
    if (parts.length === 2 && parts[0] && parts[0].includes('-')) return parts[0];
    return rowId;
  };

  const deleteRows = async (idsToDelete) => {
    if (!idsToDelete || idsToDelete.length === 0) return;
    const table = tableMap[activeDashboardView];
    if (!table) {
      alert('Delete not supported for this view.');
      return;
    }
    const token = session?.access_token || session?.accessToken || '';
    if (!token) {
      alert('No admin session token available for delete.');
      return;
    }

    try {
      for (const rid of idsToDelete) {
        const dbId = extractDbId(rid);
        const body = { action: 'delete', table, match: { id: dbId } };
        const resp = await fetch('/api/admin-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body)
        });
        if (!resp.ok) {
          let errMsg = 'Delete failed';
          try {
            const json = await resp.json();
            errMsg = json?.error || errMsg;
          } catch (parseErr) {
            errMsg = `${resp.status} ${resp.statusText}`;
          }
          console.error('Delete failed', errMsg);
          throw new Error(errMsg);
        }
        try {
          await resp.json();
        } catch (parseErr) {
          // Some endpoints return empty 200 responses; that's okay
          console.warn('Could not parse response JSON, but delete succeeded');
        }
      }
      clearSelection();
      if (typeof refreshAdminData === 'function') refreshAdminData();
      return true;
    } catch (err) {
      console.error('Bulk delete error', err);
      alert('One or more deletes failed. See console for details.');
      return false;
    }
  };

  const deleteSelected = async () => {
    if (!selectedRowIds || selectedRowIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedRowIds.length} selected row(s)? This cannot be undone.`)) return;
    const ok = await deleteRows(selectedRowIds);
    if (ok) alert('Deleted selected rows.');
  };

  const deleteRow = async (rowId) => {
    if (!rowId) return;
    if (!window.confirm('Delete this row? This cannot be undone.')) return;
    const ok = await deleteRows([rowId]);
    if (ok) alert('Row deleted.');
  };

  const viewRow = (row) => {
    if (!row) return;
    const rowData = Array.isArray(row.columns) ? row.columns.reduce((acc, value, index) => {
      const key = dashboardTableColumns[activeDashboardView]?.[index] || `column_${index + 1}`;
      acc[key] = value;
      return acc;
    }, {}) : row;
    setViewingRow(rowData);
  };
  const parentOptions = useMemo(() => {
    const set = new Set();
    (applicants || []).forEach((a) => {
      const name = a.parentName || a.parent_or_guardian_name || a.contactName || '';
      if (name) set.add(name);
    });
    return Array.from(set).sort();
  }, [applicants]);

  const programOptions = useMemo(() => {
    const set = new Set();
    (applicants || []).forEach((a) => {
      try {
        const children = a.childrenDetails ? (typeof a.childrenDetails === 'string' ? JSON.parse(a.childrenDetails) : a.childrenDetails) : null;
        if (Array.isArray(children)) {
          children.forEach((c) => {
            const p = c.program_type || c.programType || c.track || '';
            if (p) set.add(p);
          });
        } else if (a.track) {
          set.add(a.track);
        }
      } catch (err) {
        // ignore parse errors
      }
    });
    return Array.from(set).sort();
  }, [applicants]);

  

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
    { id: 'bookings', label: 'Bookings', color: '#16a34a', value: Math.max(bookings.length || 0, 0) },
    { id: 'messages', label: 'Messages', color: '#22a564', value: Math.max(contactMessages.length || 0, 0) },
    { id: 'testimonials', label: 'Testimonials', color: '#7c3aed', value: Math.max(promoSlides.length || 0, 0) }
  ];

  const dashboardTableColumns = {
    visitors: ['Page', 'Visited at', 'Session'],
    teens: ['Name', 'Email', 'Phone', 'Program', 'Parent', 'School', 'Session', 'Focus', 'Submitted'],
    messages: ['Name', 'Email', 'Subject', 'Message'],
    bookings: ['Name', 'Email', 'Phone', 'Program', 'Date', 'Time', 'Format', 'Notes'],
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
    teens: (() => {
      const rows = [];
      applicants.slice(0, 50).forEach((applicant) => {
        const baseParent = {
          email: applicant.email || 'No email',
          phone: applicant.phone || 'No phone',
          parentName: applicant.parentName || applicant.parent_or_guardian_name || 'N/A',
          submittedAt: applicant.submittedAt || applicant.created_at || null
        };

        if (applicant.childrenDetails) {
          try {
            const children = typeof applicant.childrenDetails === 'string' ? JSON.parse(applicant.childrenDetails) : applicant.childrenDetails;
            if (Array.isArray(children) && children.length > 0) {
            children.forEach((child, idx) => {
              rows.push({
                id: `${applicant.id || 'app'}-${idx}`,
                columns: [
                  child.child_name || child.childName || child.name || 'Unnamed child',
                  baseParent.email,
                  baseParent.phone,
                  // always prefer per-child program; no fallback to top-level 'track'
                  child.program_type || child.programType || 'N/A',
                  baseParent.parentName,
                  child.school || child.schoolName || 'N/A',
                  child.preferred_session || child.preferredSession || 'N/A',
                  child.focus_area || child.focusArea || child.development_goals || applicant.message || 'N/A',
                  baseParent.submittedAt ? new Date(baseParent.submittedAt).toLocaleString() : 'N/A'
                ]
              });
            });
              return;
            }
          } catch (err) {
            // fall back to single-row below
          }
        }

        // fallback: single row per applicant
        rows.push({
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
        });
      });

      // apply filters
      const filtered = rows.filter((r) => {
        const programCell = (r.columns[3] || '').toString();
        const parentCell = (r.columns[4] || '').toString();
        if (parentFilter && !parentCell.toLowerCase().includes(parentFilter.toLowerCase())) return false;
        if (programFilter && programCell !== programFilter) return false;
        return true;
      });

      return filtered;
    })(),
    messages: contactMessages.slice(0, 10).map((message) => ({
      id: message.id || `${message.email || 'message'}-${message.createdAt || Date.now()}`,
      columns: [
        message.name || 'Unknown sender',
        message.email || 'No email',
        message.subject || 'Message',
        message.message || 'No message provided'
      ]
    })),
    bookings: (bookings || []).slice(0, 50).map((b) => ({
      id: b.id || `${b.email || 'booking'}-${b.created_at || Date.now()}`,
      columns: [
        b.contact_name || b.contactName || 'No name',
        b.email || 'No email',
        b.phone || 'No phone',
        b.program_type || b.programType || 'N/A',
        b.preferred_date ? new Date(b.preferred_date).toLocaleDateString() : 'N/A',
        b.preferred_time || 'N/A',
        b.session_format || b.sessionFormat || 'N/A',
        b.notes || b.note || 'N/A'
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

        <style>{`
          .dashboard-stats{display:flex;gap:16px;flex-wrap:wrap;justify-content:space-between;margin-top:30px}
          .stat-card{flex:1 1 calc(50% - 16px);min-width:140px;border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;justify-content:center;align-items:center;color:#fff;text-align:center}
          .stat-card .label{font-weight:700;font-size:0.95rem;letter-spacing:0.04em;text-transform:uppercase;opacity:0.95}
          .stat-card .value{font-weight:900;font-size:2.4rem;margin-top:6px}
          .dashboard-actions-row{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:20px}
          .dashboard-filters{display:flex;gap:8px;align-items:center;margin-left:8px;flex-wrap:wrap}
          .dashboard-table-wrap{overflow-x:auto;margin-top:18px;-webkit-overflow-scrolling:touch;width:100%;border-radius:14px}
          .table{min-width:1200px;width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-radius:14px}
          .table th,.table td{padding:12px 14px;text-align:left;vertical-align:top;white-space:nowrap}
          .table th:last-child{position:sticky;right:0;background:#f8fafc;z-index:11;border-left:1px solid #e5e7eb;text-align:center}
          .table td:last-child{position:sticky;right:0;background:#fff;z-index:11;border-left:1px solid #f3f4f6;text-align:center}
          .table tbody tr:hover td:last-child{background:#f9fafb}
          @media(min-width:900px){.stat-card{flex:1 1 calc(25% - 16px)}.stat-card .value{font-size:3rem}}
          @media(max-width:640px){.stat-card{flex:1 1 100%;min-width:100%}.stat-card .value{font-size:1.9rem}.dashboard-actions-row{flex-direction:column;align-items:flex-start}.dashboard-filters{margin-left:0}.table th,.table td{padding:10px}.table{min-width:100%}.table th:last-child{position:sticky;right:0;background:#f8fafc;z-index:11;border-left:1px solid #e5e7eb}.table td:last-child{position:sticky;right:0;background:#fff;z-index:11;border-left:1px solid #f3f4f6}} 
        `}</style>

        <div className="dashboard-stats">
          {dashboardViews.map((view) => (
            <div key={view.id} className="stat-card" style={{ background: view.color, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)' }}>
              <div className="label">{view.label}</div>
              <div className="value">{view.value}</div>
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

            <div className="dashboard-actions-row">
              <button type="button" style={{ border: '1px solid #d8dfe7', background: '#f0f1f2', color: '#1f2937', borderRadius: '999px', padding: '0.8rem 1.2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                All rows
              </button>
              <button type="button" style={{ border: '1px solid #d8dfe7', background: '#f0f1f2', color: '#1f2937', borderRadius: '999px', padding: '0.8rem 1.2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                Selected rows (0)
              </button>
              <button type="button" onClick={deleteSelected} disabled={selectedRowIds.length === 0} style={{ border: '1px solid #d8dfe7', background: selectedRowIds.length === 0 ? '#f7f7f7' : '#f0f1f2', color: '#1f2937', borderRadius: '999px', padding: '0.8rem 1.2rem', fontSize: '1rem', fontWeight: 700, cursor: selectedRowIds.length === 0 ? 'not-allowed' : 'pointer' }}>
                Delete selected ({selectedRowIds.length})
              </button>
              <button type="button" style={{ border: 'none', background: '#f0f1f2', color: '#1f2937', borderRadius: '999px', padding: '0.8rem 1.2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                Preview PDF
              </button>
              <button type="button" style={{ border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', borderRadius: '999px', padding: '0.8rem 1.5rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 12px 22px rgba(92,74,228,0.22)' }}>
                Print responses
              </button>
                <div className="dashboard-filters">
                <label style={{ fontSize: '0.95rem', color: '#374151', fontWeight: 600 }}>Parent</label>
                <select value={parentFilter} onChange={(e) => setParentFilter(e.target.value)} style={{ minWidth: '160px', padding: '8px', borderRadius: '8px' }}>
                  <option value="">All parents</option>
                  {parentOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>

                <label style={{ fontSize: '0.95rem', color: '#374151', fontWeight: 600 }}>Program</label>
                <select value={programFilter} onChange={(e) => setProgramFilter(e.target.value)} style={{ minWidth: '180px', padding: '8px', borderRadius: '8px' }}>
                  <option value="">All programs</option>
                  {programOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>

                <button type="button" onClick={() => { setParentFilter(''); setProgramFilter(''); }} style={{ border: '1px solid #d8dfe7', background: '#fff', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer' }}>Clear</button>
              </div>
            </div>

            <div className="dashboard-table-wrap">
              <table className="table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                        <th style={{ width: '48px', textAlign: 'center', padding: '14px 8px' }}>
                          <input type="checkbox" aria-label="Select all" onChange={(e) => {
                            if (!dashboardTableData[activeDashboardView]) return;
                            if (e.target.checked) setSelectedRowIds(dashboardTableData[activeDashboardView].map((r) => r.id));
                            else clearSelection();
                          }} checked={dashboardTableData[activeDashboardView] && selectedRowIds.length === dashboardTableData[activeDashboardView].length && dashboardTableData[activeDashboardView].length > 0} />
                        </th>
                        {dashboardTableColumns[activeDashboardView]?.map((column) => (
                          <th key={column} style={{ textAlign: 'left', padding: '14px 16px', color: '#374151', fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{column}</th>
                        ))}
                        <th style={{ textAlign: 'right', padding: '14px 16px', color: '#374151', fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardTableData[activeDashboardView]?.length > 0 ? (
                        dashboardTableData[activeDashboardView].map((row) => (
                          <tr key={row.id} style={{ borderTop: '1px solid #eef2f7' }}>
                            <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                              <input type="checkbox" checked={selectedRowIds.includes(row.id)} onChange={() => toggleSelectRow(row.id)} />
                            </td>
                            {row.columns.map((cell, index) => (
                              <td key={`${row.id}-${index}`} style={{ padding: '14px 16px', color: '#4b5563', verticalAlign: 'top', maxWidth: '260px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                {cell}
                              </td>
                            ))}
                            <td style={{ padding: '14px 16px', textAlign: 'right', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  onClick={() => viewRow(row)}
                                  style={{ border: '1px solid #d5e8ff', background: '#edf6ff', color: '#14532d', borderRadius: '999px', padding: '0.55rem 0.9rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteRow(row.id)}
                                  style={{ border: '1px solid #fecaca', background: '#fff1f2', color: '#991b1b', borderRadius: '999px', padding: '0.55rem 0.9rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                  ) : (
                    <tr>
                          <td colSpan={(dashboardTableColumns[activeDashboardView]?.length || 1) + 2} style={{ padding: '18px 16px', color: '#6b7280', textAlign: 'center' }}>No records available yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Viewing Modal */}
      {viewingRow && (
        <div className="view-modal-overlay" onClick={() => setViewingRow(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="view-modal-content" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1a1a1a' }}>Record Details</h3>
              <button type="button" onClick={() => setViewingRow(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>×</button>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {Object.entries(viewingRow).map(([key, value]) => {
                let displayValue = value;
                if (typeof value === 'object' && value !== null) {
                  try {
                    displayValue = JSON.stringify(value, null, 2);
                  } catch (e) {
                    displayValue = String(value);
                  }
                }
                return (
                  <div key={key} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1rem', alignItems: 'start' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</label>
                    <div style={{ fontSize: '0.95rem', color: '#1f2937', wordBreak: 'break-word', whiteSpace: 'pre-wrap', fontFamily: typeof displayValue === 'string' && displayValue.includes('{') ? 'monospace' : 'inherit', background: '#f9fafb', padding: '0.75rem', borderRadius: '8px' }}>{displayValue || '—'}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
              <button type="button" onClick={() => setViewingRow(null)} style={{ background: '#f0f1f2', color: '#1f2937', border: '1px solid #d8dfe7', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
