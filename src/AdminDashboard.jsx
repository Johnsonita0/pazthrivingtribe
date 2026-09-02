import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

const formatName = (value) => typeof value === 'string' ? value.replace(/\b\w/g, (letter) => letter.toUpperCase()) : value;
const formatReferenceId = (value) => {
  const compactId = String(value || '').replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase();
  return compactId ? `PT-${compactId}` : 'N/A';
};

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
    setPromoSlides,
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
    parentFeedback = [],
    setParentFeedback,
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
    refreshAdminData,
    refreshLoading = false,
    storeProducts = [],
    setStoreProducts,
    storeBankAccount = {},
    setStoreBankAccount,
    shopOrders = [],
    setShopOrders
  } = props;

  const [storeProductForm, setStoreProductForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Ebook',
    fileUrl: '',
    cover: '/logo/logomain.png',
    inStock: true,
    stockCount: ''
  });

  const [activeDashboardView, setActiveDashboardView] = useState('visitors');
  const [commerceSubTab, setCommerceSubTab] = useState('storefront');
  const [tableFilters, setTableFilters] = useState({});
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [viewingRow, setViewingRow] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderModalTab, setOrderModalTab] = useState('payment');
  const [deliveryMessageDraft, setDeliveryMessageDraft] = useState('');
  const [deliveryAttachment, setDeliveryAttachment] = useState(null);
  const [postingToSlider, setPostingToSlider] = useState(false);
  const [testimonialConfirmation, setTestimonialConfirmation] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [productDeleteTarget, setProductDeleteTarget] = useState(null);

  useEffect(() => {
    if (!selectedOrder) return;
    const defaultMessage = [
      `Hi ${selectedOrder.name || 'there'},`,
      '',
      `Your order ${selectedOrder.orderNumber || ''} is ready. Please find the purchased product attached below.`,
      '',
      'Thank you for shopping with PAZ Thriving Tribe.',
      'Warm regards,',
      'PAZ Thriving Tribe Team'
    ].join('\n');
    setDeliveryMessageDraft(selectedOrder.customerMessage || defaultMessage);
    setDeliveryAttachment(null);
    setOrderModalTab('payment');
  }, [selectedOrder]);

  const handleOrderPaymentConfirmation = async (order) => {
    if (!order) return;
    const nextOrder = { ...order, status: 'paid', paymentConfirmedAt: new Date().toISOString() };
    if (typeof setShopOrders === 'function') {
      setShopOrders((currentOrders = []) => currentOrders.map((item) => item.id === order.id || item.orderNumber === order.orderNumber ? nextOrder : item));
    }
    setSelectedOrder(nextOrder);
    showAdminToast('success', 'Payment confirmed', `Order ${nextOrder.orderNumber || 'N/A'} has been marked as paid.`);
  };

  const handleSendProductEmail = async (order) => {
    const orderEmail = String(
      order?.email ||
      order?.customerEmail ||
      order?.customer_email ||
      order?.contact_email ||
      order?.emailAddress ||
      ''
    ).trim();

    if (!order || !orderEmail) {
      showAdminToast('error', 'Missing customer email', 'This order does not include a delivery email address yet.');
      return;
    }

    try {
      const itemSummary = (order.items || []).map((item) => `• ${item.title || 'Product'} x${item.quantity || 1}`).join('\n');
      const finalMessage = deliveryMessageDraft.trim() || 'Your purchased product is ready to be released after payment confirmation.';
      const response = await fetch('/api/send-notification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: orderEmail,
          service: 'Product delivery',
          timestamp: new Date().toISOString(),
          orderNumber: order.orderNumber,
          itemSummary,
          customerName: order.name || 'Customer',
          message: finalMessage,
          productMessage: finalMessage,
          attachmentName: deliveryAttachment ? deliveryAttachment.name : null,
          customMessage: finalMessage
        })
      });

      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(responseData?.error || 'The delivery email could not be sent.');
      }

      const nextOrder = {
        ...order,
        email: orderEmail,
        productEmailSent: true,
        lastEmailSentAt: new Date().toISOString(),
        customerMessage: finalMessage,
        productAttachmentName: deliveryAttachment ? deliveryAttachment.name : order.productAttachmentName || null
      };
      if (typeof setShopOrders === 'function') {
        setShopOrders((currentOrders = []) => currentOrders.map((item) => item.id === order.id || item.orderNumber === order.orderNumber ? nextOrder : item));
      }
      setSelectedOrder(nextOrder);
      setDeliveryAttachment(null);
      showAdminToast('success', 'Delivery email sent', `The product details have been emailed to ${orderEmail}.`);
    } catch (error) {
      console.error('Failed to email product delivery:', error);
      showAdminToast('error', 'Email not sent', error.message || 'The product email could not be sent right now.');
    }
  };

  const openTestimonialConfirmation = () => {
    if (!viewingRow) return;
    const testimonialText = viewingRow.Testimonial || viewingRow.testimonial || viewingRow.text || '';
    if (!testimonialText.trim()) {
      showAdminToast('error', 'No testimonial found', 'This record does not contain a testimonial to publish.');
      return;
    }
    setTestimonialConfirmation({
      title: viewingRow.Parent || viewingRow['Parent name'] || viewingRow.Name || viewingRow.author || 'Anonymous',
      text: testimonialText,
      origin: viewingRow.Origin || viewingRow.origin || (activeDashboardView === 'feedback' ? 'Parent Feedback' : 'Community')
    });
  };

  const postTestimonialToSlider = async () => {
    if (!viewingRow || !['testimonials', 'feedback'].includes(activeDashboardView)) return;
    
    setPostingToSlider(true);
    try {
      const testimonialText = viewingRow.Testimonial || viewingRow.testimonial || viewingRow.text || '';
      if (!testimonialText.trim()) {
        showAdminToast('error', 'No testimonial found', 'This record does not contain a testimonial to publish.');
        return;
      }
      const newSlide = {
        id: viewingRow.id || `testimonial-${Date.now()}`,
        title: viewingRow.Parent || viewingRow['Parent name'] || viewingRow.Name || viewingRow.author || 'Anonymous',
        text: testimonialText,
        origin: viewingRow.Origin || viewingRow.origin || 'Community',
        image: '/logo/logomain.png',
        imageType: 'logo'
      };

      const token = session?.access_token || session?.accessToken || '';
      const response = await fetch('/api/admin-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: 'insert',
          table: 'tribe_testimonials',
          payload: [{ author: newSlide.title, origin: activeDashboardView === 'feedback' ? 'Parent Feedback' : newSlide.origin, text: newSlide.text, image_type: 'logo' }]
        })
      });
      if (!response.ok) {
        if (response.status !== 404 && response.status !== 502 && response.status !== 503) throw new Error('The testimonial could not be saved to the home slider.');
        const { error: directInsertError } = await supabase.from('tribe_testimonials').insert([{
          author: newSlide.title,
          origin: activeDashboardView === 'feedback' ? 'Parent Feedback' : newSlide.origin,
          text: newSlide.text,
          image_type: 'logo'
        }]);
        if (directInsertError) throw directInsertError;
      }
      
      if (typeof setPromoSlides === 'function') {
        setPromoSlides((prev) => [newSlide, ...prev]);
      }
      
      showAdminToast('success', 'Posted to slider', `Testimonial from ${newSlide.title} is now live on the main carousel.`);
      setTestimonialConfirmation(null);
      setViewingRow(null);
    } catch (err) {
      console.error('Failed to post testimonial:', err);
      showAdminToast('error', 'Post failed', 'Could not add testimonial to slider. Please try again.');
    } finally {
      setPostingToSlider(false);
    }
  };
  const [adminToast, setAdminToast] = useState(null);

  const getPaymentProofPreview = (order) => {
    if (!order) return null;
    const candidates = [
      order.paymentProofPreview,
      order.paymentProof,
      order.paymentProofUrl,
      order.paymentProofImage,
      order.receiptPreview,
      order.proofImage,
      order.proof_url,
      order.payment_proof_preview,
      order.paymentProofDataUrl,
      order.paymentProofDataUri
    ];
    return candidates.find((value) => typeof value === 'string' && value.trim().length > 0) || null;
  };

  const showAdminToast = (type, title, message, actions = []) => {
    setAdminToast({ type, title, message, actions });
  };

  useEffect(() => {
    if (!adminToast) return undefined;
    const timer = window.setTimeout(() => setAdminToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [adminToast]);

  useEffect(() => {
    if (mode !== 'dashboard' || activeDashboardView !== 'feedback' || typeof setParentFeedback !== 'function') return undefined;
    let active = true;
    supabase.from('tribe_parent_feedback').select('*').order('created_at', { ascending: false }).limit(200)
      .then(({ data, error }) => {
        if (active && !error && Array.isArray(data)) setParentFeedback(data);
      })
      .catch((error) => console.error('Parent feedback refresh failed:', error));
    return () => { active = false; };
  }, [activeDashboardView, mode, setParentFeedback]);

  const toggleSelectRow = (id) => {
    setSelectedRowIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const clearSelection = () => setSelectedRowIds([]);

  const tableMap = {
    visitors: 'tribe_activity',
    teens: 'tribe_applicants',
    messages: 'tribe_contact_messages',
    bookings: 'tribe_bookings',
    testimonials: 'tribe_testimonials',
    slider: 'tribe_testimonials',
    feedback: 'tribe_parent_feedback'
  };

  const uniqueVisitorCount = new Set(
    clientActivityLog
      .map((entry) => entry.ip_address || entry.session_id)
      .filter(Boolean)
  ).size;

  const extractDbId = (rowId) => {
    if (!rowId) return rowId;
    const parts = rowId.split('-');
    // Child rows use the database id plus a numeric child index.
    if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) return parts.slice(0, -1).join('-');
    if (parts.length > 2) return parts.slice(0, 5).join('-');
    if (parts.length === 2 && parts[0] && parts[0].includes('-')) return parts[0];
    return rowId;
  };

  const deleteRows = async (idsToDelete) => {
    if (!idsToDelete || idsToDelete.length === 0) return;
    const table = tableMap[activeDashboardView] || (activeDashboardView === 'visitors' ? 'tribe_activity' : null);
    if (!table) {
      showAdminToast('error', 'Delete not available', 'This table does not support row deletions from the current dashboard view.');
      return;
    }
    const token = session?.access_token || session?.accessToken || '';
    if (!token) {
      showAdminToast('error', 'Authentication required', 'Your admin session expired. Please sign in again to delete records.');
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
          if (resp.status === 502 || resp.status === 503 || resp.status === 404) {
            const { error: directDeleteError } = await supabase.from(table).delete().eq('id', dbId);
            if (!directDeleteError) continue;
            throw new Error(directDeleteError.message || errMsg);
          }
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
      showAdminToast('error', 'Delete failed', `${err?.message || 'One or more rows could not be deleted.'} Please check the database permissions if the problem continues.`);
      return false;
    }
  };

  const deleteSelected = () => {
    if (!selectedRowIds || selectedRowIds.length === 0) return;
    setDeleteConfirmation({ ids: selectedRowIds, message: ['testimonials', 'slider'].includes(activeDashboardView) ? `This will remove ${selectedRowIds.length} selected testimonial(s) from the public slider.` : `This will permanently remove ${selectedRowIds.length} selected record(s).` });
  };

  const deleteRow = (rowId) => {
    if (!rowId) return;
    setDeleteConfirmation({ ids: [rowId], message: ['testimonials', 'slider'].includes(activeDashboardView) ? 'This testimonial will be removed from the public slider.' : 'This record will be permanently removed from the system.' });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;
    const idsToDelete = deleteConfirmation.ids;
    setDeleteConfirmation(null);
    const ok = await deleteRows(idsToDelete);
    if (ok) showAdminToast('success', 'Rows deleted', `${idsToDelete.length} record(s) were removed successfully.`);
  };

  const viewRow = (row) => {
    if (!row) return;
    const rowData = row.details || (Array.isArray(row.columns) ? row.columns.reduce((acc, value, index) => {
      const key = dashboardTableColumns[activeDashboardView]?.[index] || `column_${index + 1}`;
      acc[key] = value;
      return acc;
    }, { id: row.id }) : row);
    setViewingRow(rowData);
  };

  const [editingStoreProductId, setEditingStoreProductId] = useState(null);

  const resetStoreProductForm = () => {
    setStoreProductForm({ title: '', description: '', price: '', category: 'Ebook', fileUrl: '', cover: '/logo/logomain.png', inStock: true, stockCount: '' });
    setEditingStoreProductId(null);
  };

  const handleStoreProductSubmit = (event) => {
    event.preventDefault();
    if (!storeProductForm.title || !storeProductForm.description || !storeProductForm.price) return;

    const normalizedInStock = storeProductForm.inStock !== false;
    const parsedStockCount = Number(storeProductForm.stockCount ?? 0);
    const productValues = {
      title: storeProductForm.title.trim(),
      description: storeProductForm.description.trim(),
      price: Number(storeProductForm.price) || 0,
      category: storeProductForm.category || 'Ebook',
      fileUrl: storeProductForm.fileUrl.trim() || 'https://example.com/file.pdf',
      cover: storeProductForm.cover.trim() || '/logo/logomain.png',
      inStock: normalizedInStock,
      stockCount: normalizedInStock ? (Number.isFinite(parsedStockCount) && parsedStockCount >= 0 ? parsedStockCount : 1) : 0
    };

    if (editingStoreProductId) {
      setStoreProducts((current = []) => (Array.isArray(current) ? current : []).map((product) => (
        product.id === editingStoreProductId
          ? { ...product, ...productValues }
          : product
      )));
      showAdminToast('success', 'Product updated', `${productValues.title} has been updated on the public store.`);
    } else {
      const newProduct = {
        id: `store-${Date.now()}`,
        ...productValues
      };
      setStoreProducts((current = []) => [...(Array.isArray(current) ? current : []), newProduct]);
      showAdminToast('success', 'Product saved', `${newProduct.title} is now available in the digital store.`);
    }

    resetStoreProductForm();
  };

  const handleEditStoreProduct = (product) => {
    if (!product) return;
    setEditingStoreProductId(product.id);
    setStoreProductForm({
      title: product.title || '',
      description: product.description || '',
      price: product.price ?? '',
      category: product.category || 'Ebook',
      fileUrl: product.fileUrl || '',
      cover: product.cover || '/logo/logomain.png',
      inStock: product.inStock !== false,
      stockCount: Number(product.stockCount ?? 0) > 0 ? Number(product.stockCount ?? 0) : ''
    });
  };

  const toggleStoreProductAvailability = (productId) => {
    setStoreProducts((current = []) => (Array.isArray(current) ? current : []).map((product) => {
      if (product.id !== productId) return product;
      const nextInStock = product.inStock === false;
      return {
        ...product,
        inStock: nextInStock,
        stockCount: nextInStock ? Math.max(Number(product.stockCount || 0), 1) : 0
      };
    }));
  };

  const handleDeleteStoreProduct = (productId) => {
    if (!productId) return;
    setStoreProducts((current = []) => (Array.isArray(current) ? current : []).filter((product) => product.id !== productId));
    if (editingStoreProductId === productId) {
      resetStoreProductForm();
    }
    showAdminToast('success', 'Product removed', 'That product has been removed from the storefront and shop pages.');
  };

  const confirmDeleteStoreProduct = (product) => {
    if (!product) return;
    setProductDeleteTarget(product);
  };

  const handleBankAccountChange = (field, value) => {
    setStoreBankAccount((current = {}) => ({ ...current, [field]: value }));
  };

  const printViewingRow = () => {
    window.print();
  };

  const adminFieldStyle = {
    width: '100%',
    maxWidth: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    display: 'block',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    padding: '11px 12px',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    background: '#f9fafb'
  };

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
                  className="publish-testimonial-button"
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
    { id: 'visitors', label: 'Visitors', color: '#2e7af0', value: uniqueVisitorCount },
    { id: 'teens', label: 'Teens Reg', color: '#f39a2b', value: Math.max(applicants.length || 0, 0) },
    { id: 'bookings', label: 'Bookings', color: '#16a34a', value: Math.max(bookings.length || 0, 0) },
    { id: 'messages', label: 'Messages', color: '#22a564', value: Math.max(contactMessages.length || 0, 0) },
    { id: 'commerce', label: 'Store & Orders', color: '#f59e0b', value: Math.max(shopOrders.length || 0, 0) },
    { id: 'testimonials', label: 'Testimonials', color: '#7c3aed', value: Math.max(promoSlides.length || 0, 0) },
    { id: 'slider', label: 'Published Slider', color: '#0f766e', value: Math.max(promoSlides.length || 0, 0) },
    { id: 'feedback', label: 'Parent Feedback', color: '#e88767', value: Math.max(parentFeedback.length || 0, 0) }
  ];

  const dashboardTableColumns = {
    visitors: ['Page', 'IP address', 'Device', 'Location', 'Visited at'],
    teens: ['Name', 'Email', 'Phone', 'Program', 'Parent', 'School', 'Session', 'Focus', 'Submitted'],
    messages: ['Name', 'Email', 'Subject', 'Message'],
    bookings: ['Name', 'Email', 'Phone', 'Program', 'Date', 'Time', 'Format', 'Notes'],
    testimonials: ['Name', 'Origin', 'Testimonial', 'Source'],
    slider: ['Name', 'Origin', 'Testimonial', 'Source'],
    feedback: ['Parent', 'Child', 'Duration', 'Impact', 'Satisfaction', 'Recommendation', 'Submitted']
  };

  const dashboardFilterDefinitions = {
    visitors: [{ key: 'Page', label: 'Page', index: 0 }],
    teens: [{ key: 'Program', label: 'Program', index: 3 }, { key: 'Parent', label: 'Parent', index: 4 }],
    messages: [{ key: 'Subject', label: 'Subject', index: 2 }],
    bookings: [{ key: 'Program', label: 'Program', index: 3 }, { key: 'Format', label: 'Format', index: 6 }],
    testimonials: [{ key: 'Origin', label: 'Origin', index: 1 }, { key: 'Source', label: 'Source', index: 3 }],
    slider: [{ key: 'Origin', label: 'Origin', index: 1 }, { key: 'Source', label: 'Source', index: 3 }],
    feedback: [
      { key: 'Duration', label: 'Duration', index: 2 },
      { key: 'Impact', label: 'Impact', index: 3 },
      { key: 'Satisfaction', label: 'Satisfaction', index: 4 },
      { key: 'Recommendation', label: 'Recommendation', index: 5 }
    ]
  };
  
  const formatVisitorPage = (path) => {
    if (path === '/') return 'Home';
    if (path === '/feedback') return 'Feedback page';
    return path;
  };

  const dashboardTableData = {
    visitors: clientActivityLog.slice(0, 10).map((entry) => ({
      id: entry.id || `${entry.session_id || 'activity'}-${entry.created_at || Date.now()}`,
      columns: [
        formatVisitorPage(entry.path || entry.pathname || '/'),
        entry.ip_address || 'Unavailable',
        entry.device_type || 'Unknown',
        entry.location || 'Unknown',
        new Date(entry.created_at || entry.createdAt || Date.now()).toLocaleString()
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

      return rows;
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
    })),
    slider: promoSlides.slice(0, 10).map((testimonial) => ({
      id: testimonial.id || `${testimonial.title || 'testimonial'}-${testimonial.createdAt || Date.now()}`,
      columns: [
        testimonial.title || 'Anonymous',
        testimonial.origin || 'Parent',
        testimonial.text || 'No testimonial added',
        testimonial.imageType || 'Website'
      ]
    })),
    feedback: (parentFeedback || []).slice(0, 50).map((response) => ({
      id: response.id || `${response.parent_name || 'feedback'}-${response.created_at || Date.now()}`,
      details: {
        'Parent name': formatName(response.parent_name || 'No parent name'),
        'Child name': formatName(response.child_name || 'No child name'),
        'Mentoring duration': response.mentoring_duration || 'N/A',
        'Positive changes': response.positive_changes || [],
        'Other change': response.other_change || 'N/A',
        'Significant change': response.significant_change || 'N/A',
        'Impact rating': response.impact_rating || 'N/A',
        'Support areas': response.support_areas || [],
        'Other support': response.other_support || 'N/A',
        'Future focus': response.future_focus || 'N/A',
        'Satisfaction': response.satisfaction || 'N/A',
        'Coach relationship': response.coach_relationship || 'N/A',
        'Child comments': response.child_comments || 'N/A',
        'Development notes': response.development_notes || 'N/A',
        'Improvement suggestions': response.improvement_suggestions || 'N/A',
        'Recommendation': response.recommendation || 'N/A',
        'Testimonial': response.testimonial || 'N/A',
        'Submitted at': response.created_at ? new Date(response.created_at).toLocaleString() : 'N/A'
      },
      columns: [
        formatName(response.parent_name || 'No parent name'),
        formatName(response.child_name || 'No child name'),
        response.mentoring_duration || 'N/A',
        response.impact_rating || 'N/A',
        response.satisfaction || 'N/A',
        response.recommendation || 'N/A',
        response.created_at ? new Date(response.created_at).toLocaleString() : 'N/A'
      ]
    }))
  };

  const activeFilterDefinitions = dashboardFilterDefinitions[activeDashboardView] || [];
  const activeFilters = tableFilters[activeDashboardView] || {};
  const activeTableRows = dashboardTableData[activeDashboardView] || [];
  const filteredDashboardRows = activeTableRows.filter((row) => activeFilterDefinitions.every((filter) => {
    const selectedValue = activeFilters[filter.key];
    if (!selectedValue) return true;
    return String(row.columns[filter.index] ?? '').toLowerCase() === selectedValue.toLowerCase();
  }));
  const filterOptions = activeFilterDefinitions.map((filter) => ({
    ...filter,
    options: Array.from(new Set(activeTableRows.map((row) => String(row.columns[filter.index] ?? '').trim()).filter(Boolean))).sort()
  }));

  const activeDashboardLabel = dashboardViews.find((view) => view.id === activeDashboardView)?.label || 'Visitors';
  const paymentProofPreview = getPaymentProofPreview(selectedOrder);

  return (
    <div className="admin-dashboard-page" style={{ minHeight: '100vh', background: '#f1f2f4', padding: '26px 20px 32px', fontFamily: 'Inter, Arial, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 'none', margin: '0 auto', border: '1px solid #dfe3e7', borderRadius: '22px', background: '#f3f2f0', padding: '28px 28px 24px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 'clamp(2.5rem, 3vw, 4rem)', lineHeight: 1.05, fontWeight: 800, color: '#1d1d1d' }}>Admin dashboard</h1>
            <p style={{ margin: '10px 0 0', fontSize: '1.1rem', fontWeight: 400, color: '#4b5563', maxWidth: '760px', lineHeight: 1.5 }}>
              Overview of survey responses, contact submissions, and parent testimonials.
            </p>
          </div>
        </div>

        <style>{`
          .dashboard-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:16px;justify-content:space-between;margin-top:30px}
          .stat-card{width:100%;min-width:0;border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;justify-content:center;align-items:center;color:#fff;text-align:center;box-sizing:border-box}
          .stat-card .label{font-weight:700;font-size:0.95rem;letter-spacing:0.04em;text-transform:uppercase;opacity:0.95}
          .stat-card .value{font-weight:900;font-size:2.4rem;margin-top:6px}
          .dashboard-actions-row{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:20px}
          .dashboard-filters{display:flex;gap:8px;align-items:center;margin-left:8px;flex-wrap:wrap}
          .dashboard-table-wrap{overflow-x:auto;margin-top:18px;-webkit-overflow-scrolling:touch;width:100%;border-radius:14px}
          .commerce-tab-row{display:flex;gap:8px;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;ms-overflow-style:none;padding-bottom:8px;border-bottom:1px solid #dfe7ef;width:100%}
          .commerce-tab-row button{flex:1 1 0;min-width:100px}
          .commerce-panel-shell{width:100%;max-width:none;box-sizing:border-box;overflow:hidden}
          .commerce-input-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;width:100%;max-width:100%;box-sizing:border-box}
          .commerce-product-list{display:grid;gap:12px}
          .commerce-product-card{display:grid;grid-template-columns:96px minmax(0,1fr) auto;gap:12px;align-items:center;background:linear-gradient(180deg,#ffffff,#f8fafc);border:1px solid #e2e8f0;border-radius:16px;padding:12px 14px;box-shadow:0 8px 18px rgba(15,23,42,0.04)}
          .commerce-product-media{width:96px;height:96px;border-radius:14px;overflow:hidden;background:#f1f5f9;border:1px solid #e2e8f0;display:flex;align-items:center;justify-content:center}
          .commerce-product-media img{width:100%;height:100%;object-fit:cover;display:block}
          .commerce-product-meta{min-width:0}
          .commerce-product-actions{display:flex;gap:8px;align-items:center;flex-shrink:0}
          .commerce-product-actions button{min-width:72px}
          .view-modal-content{max-width:100%;box-sizing:border-box}
          .table{min-width:1400px;width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-radius:14px}
          .table th,.table td{padding:12px 14px;text-align:left;vertical-align:top;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
          .table td{max-width:200px}
          .table th:last-child{position:relative;background:#f8fafc;border-left:1px solid #e5e7eb;text-align:center;max-width:none;min-width:120px;padding-right:16px}
          .table td:last-child{position:relative;background:#fff;border-left:1px solid #f3f4f6;text-align:center;padding-right:16px}
          .table tbody tr:hover td:last-child{background:#fff}
          .admin-toast{position:fixed;right:20px;bottom:22px;z-index:21000;max-width:420px;width:min(420px,calc(100vw - 24px));background:#111827;color:#fff;border-radius:14px;box-shadow:0 28px 50px rgba(15,23,42,.22);border:1px solid rgba(255,255,255,.08);overflow:hidden}
          .admin-toast[data-type='success']{background:#14532d;border-color:rgba(134,239,172,.3)}
          .admin-toast[data-type='error']{background:#7f1d1d;border-color:rgba(254,202,202,.3)}
          .admin-toast[data-type='warning']{background:#78350f;border-color:rgba(253,224,71,.3)}
          .admin-toast-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:14px 16px 8px}
          .admin-toast-content{display:flex;align-items:flex-start;gap:10px;min-width:0}
          .admin-toast-icon{flex:0 0 auto;font-size:1.1rem;line-height:1.4}
          .admin-toast-title{font-size:0.96rem;font-weight:800;margin:0}
          .admin-toast-close{background:transparent;border:none;color:#fff;font-size:1.2rem;cursor:pointer;opacity:.8;padding:0}
          .admin-toast-body{padding:2px 0 0;font-size:0.9rem;line-height:1.5;color:rgba(255,255,255,.92)}
          .admin-toast-actions{display:flex;justify-content:flex-end;gap:8px;padding:0 16px 14px;flex-wrap:wrap}
          .admin-toast-btn{border:none;border-radius:999px;padding:0.55rem 0.9rem;font-weight:700;cursor:pointer}
          .admin-toast-btn.secondary{background:rgba(255,255,255,.15);color:#fff}
          .admin-toast-btn.danger{background:#fff1f2;color:#991b1b}
          .delete-confirmation-backdrop{position:fixed;inset:0;z-index:13000;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.52);backdrop-filter:blur(4px)}
          .delete-confirmation-modal{width:min(440px,100%);background:#fff;border-radius:18px;padding:26px;box-shadow:0 28px 80px rgba(15,23,42,.3);border:1px solid #e5e7eb}
          .delete-confirmation-modal h3{margin:0 0 8px;color:#111827;font-size:1.25rem}.delete-confirmation-modal p{margin:0;color:#4b5563;line-height:1.55}.delete-confirmation-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:24px}.delete-confirmation-actions button{border:0;border-radius:9px;padding:10px 16px;font-weight:700;cursor:pointer}.delete-confirmation-cancel{background:#eef2f7;color:#374151}.delete-confirmation-delete{background:#b91c1c;color:#fff}
          .response-details-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px!important}.response-detail-row{display:block!important;border:1px solid #d7e1e7!important;border-bottom:1px solid #d7e1e7!important;break-inside:avoid}.response-detail-label{display:block!important;margin:0!important;padding:.55rem .7rem!important}.response-detail-row:nth-child(3n+1) .response-detail-label{background:#e8f0f5!important;color:#164568!important}.response-detail-row:nth-child(3n+2) .response-detail-label{background:#e6f4ee!important;color:#17634f!important}.response-detail-row:nth-child(3n) .response-detail-label{background:#fff1d2!important;color:#8a5a00!important}
          .printable-response-card{border-top:7px solid #3f8c78!important;font-family:Georgia,'Times New Roman',serif}.response-letterhead{background:#fffdf9!important;color:#24333a!important;border-bottom:1px solid #d8e5df!important;padding:1.15rem 1.25rem!important}.response-letterhead p,.response-letterhead h3{color:#24333a!important}.response-letterhead p:first-child{color:#3f8c78!important}.response-letterhead-meta span:first-child{background:#edf5f1!important}.response-letterhead-meta span:last-child{background:#fbf4df!important}.response-details-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px!important;padding:1rem 1.25rem 1.25rem!important}.response-detail-row{border:1px solid #dce6e1!important;background:#fff!important}.response-detail-label{background:#f1f5f3!important;color:#315b4f!important;border-bottom:1px solid #dce6e1!important;letter-spacing:.04em}.response-detail-row:nth-child(3n+1) .response-detail-label,.response-detail-row:nth-child(3n+2) .response-detail-label,.response-detail-row:nth-child(3n) .response-detail-label{background:#f1f5f3!important;color:#315b4f!important}.response-detail-row>div{color:#24333a!important;line-height:1.45}
          .testimonial-view-modal{display:flex!important;flex-direction:column;max-width:680px!important;max-height:82vh!important;overflow:hidden!important;border-radius:18px!important;background:#fff!important;border-top:7px solid #3f8c78!important}.testimonial-view-modal .response-letterhead{flex-shrink:0;background:linear-gradient(135deg,#f4faf6,#fffaf5)!important}.testimonial-view-modal .response-letterhead-meta{flex-shrink:0;margin:1rem 1.25rem 0!important}.testimonial-view-modal .response-details-grid{display:block!important;overflow-y:auto;min-height:0;flex:1;padding:1rem 1.25rem!important}.testimonial-view-modal .response-detail-row{display:block!important;margin-bottom:10px;border-radius:10px;overflow:hidden}.testimonial-view-modal .response-detail-label{display:block!important;padding:.6rem .8rem!important}.testimonial-view-modal .response-detail-row>div{padding:.85rem .9rem!important;font-family:inherit!important;line-height:1.6!important}.testimonial-view-modal .testimonial-modal-actions{flex-shrink:0;margin-top:0!important;padding:1rem 1.25rem!important;background:#fff;border-top:1px solid #dce6e1!important}
          .testimonial-confirmation-modal{display:flex!important;flex-direction:column;max-height:calc(100vh - 40px)!important;box-sizing:border-box;overflow:hidden}.testimonial-confirmation-preview{min-height:0;overflow:hidden;display:flex;flex-direction:column}.testimonial-confirmation-quote{max-height:min(46vh,420px);overflow-y:auto;-webkit-overflow-scrolling:touch}.testimonial-confirmation-actions{flex-shrink:0;padding-top:1rem;border-top:1px solid #e2e8f0}
          @media(max-width:640px){.testimonial-confirmation-modal{padding:20px!important}.testimonial-confirmation-quote{max-height:42vh}.testimonial-confirmation-actions{flex-wrap:wrap}.testimonial-confirmation-actions button{flex:1 1 120px}}
          @media(max-width:640px){.view-modal-content{padding:0!important;max-height:92vh!important}.response-letterhead{align-items:flex-start!important;padding:.8rem 1rem!important}.response-letterhead h3{font-size:1.1rem!important}.response-letterhead-meta{grid-template-columns:1fr!important;margin:1rem 1rem 0!important;line-height:1.7}.response-details-grid{grid-template-columns:1fr!important;padding:1rem!important}.response-details-grid>div{gap:.35rem!important}.response-details-grid label{font-size:.68rem!important}}
          @media print{@page{size:A4 portrait;margin:12mm}body *{visibility:hidden!important}.view-modal-overlay,.view-modal-overlay *{visibility:visible!important}.view-modal-overlay{position:static!important;background:transparent!important;padding:0!important}.printable-response-card{position:absolute!important;inset:0!important;width:100%!important;max-width:none!important;max-height:none!important;overflow:visible!important;padding:0!important;border:0!important;box-shadow:none!important;border-radius:0!important}.printable-response-card button,.printable-response-card i{display:none!important}.response-letterhead{border-bottom:2px solid #e88767!important}.response-details-grid{gap:6px!important;padding:10px 0!important}.response-detail-row{font-size:9pt!important;break-inside:avoid}.response-detail-label{font-size:7pt!important;padding:5px 7px!important}.response-detail-row>div{padding:5px 7px!important}}
          @media(min-width:900px){.stat-card{flex:1 1 calc(25% - 16px)}.stat-card .value{font-size:3rem}}
          @media(max-width:640px){.stat-card{min-width:0!important;width:100%;min-height:98px;padding:10px 4px}.stat-card .value{font-size:1.9rem}.dashboard-actions-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;align-items:center;width:100%}.dashboard-filters{grid-column:1/-1;margin-left:0;flex-wrap:nowrap;overflow-x:auto;max-width:100%;padding-bottom:2px}.dashboard-filters label{flex:0 0 auto}.dashboard-filters select{min-width:100px!important;width:100px}.dashboard-filters .dashboard-action-button{flex:0 0 46px}.table th,.table td{padding:10px}.table{min-width:1200px;width:100%;overflow-x:auto}.table th:last-child{position:relative;background:#f8fafc;border-left:1px solid #e5e7eb;text-align:center;max-width:none;min-width:120px}.table td:last-child{position:relative;background:#fff;border-left:1px solid #f3f4f6;text-align:center}.table tbody tr:hover td:last-child{background:#fff}.admin-toast{right:12px;bottom:12px;max-width:calc(100vw - 24px);z-index:21000}.commerce-panel-shell{padding:14px 12px!important;width:100% !important;max-width:100% !important}.commerce-tab-row{padding-bottom:6px;width:100%}.commerce-tab-row button{flex:1 1 0;min-width:90px}.commerce-input-grid{grid-template-columns:1fr!important;gap:10px!important;minmax:0!important}}
          @media(max-width:720px){.commerce-product-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.commerce-product-card{grid-template-columns:1fr;align-items:flex-start;min-height:260px}.commerce-product-media{width:100%;height:120px}.commerce-product-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));width:100%;gap:6px}.commerce-product-actions button{width:100%;min-width:0;padding:8px 6px!important}.commerce-product-meta{width:100%}.commerce-product-desc{display:none}.commerce-product-title{white-space:normal!important;line-height:1.35;font-size:0.88rem}.commerce-product-badges{margin-bottom:6px}.commerce-product-meta > div:last-child{gap:4px!important}}
          @media(max-width:640px){.admin-dashboard-page{padding:16px 8px 24px!important}.dashboard-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.stat-card{min-width:0!important;width:100%;min-height:98px;padding:10px 4px}.stat-card .label{font-size:.63rem;line-height:1.1}.stat-card .value{font-size:1.55rem;margin-top:6px}.dashboard-refresh-button,.dashboard-action-button{width:46px;height:46px;padding:0!important;display:inline-grid;place-items:center}.dashboard-refresh-button span,.dashboard-action-button span{display:none}.dashboard-action-button i{margin:0;font-size:1rem}.commerce-product-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.commerce-product-actions{grid-template-columns:1fr 1fr}.commerce-product-card{padding:10px;min-height:240px}.commerce-product-title{white-space:normal!important;line-height:1.35}.commerce-product-desc{display:none}.commerce-product-badges{margin-bottom:8px}.commerce-product-media{height:110px}.commerce-product-meta > div:last-child{font-size:0.72rem}} 
          .publish-testimonial-button{position:relative}.publish-testimonial-button::after{content:attr(data-tooltip);position:absolute;right:0;bottom:calc(100% + 9px);width:250px;padding:9px 11px;border-radius:6px;background:#24333a;color:#fff;font-size:.75rem;font-weight:600;line-height:1.4;text-align:left;opacity:0;pointer-events:none;transform:translateY(4px);transition:opacity .2s,transform .2s;z-index:3}.publish-testimonial-button::before{content:'';position:absolute;right:18px;bottom:calc(100% + 3px);border:6px solid transparent;border-top-color:#24333a;opacity:0;transition:opacity .2s;z-index:3}.publish-testimonial-button:hover::after,.publish-testimonial-button:hover::before,.publish-testimonial-button:focus-visible::after,.publish-testimonial-button:focus-visible::before{opacity:1;transform:translateY(0)}
          @media(max-width:640px){.publish-testimonial-button::after{right:auto;left:0;width:210px}.publish-testimonial-button::before{right:auto;left:18px}}
        `}</style>

        <div className="dashboard-stats">
          {dashboardViews.map((view) => (
            <button
              key={view.id}
              type="button"
              className="stat-card"
              onClick={() => setActiveDashboardView(view.id)}
              aria-label={`Open ${view.label}`}
              style={{ background: view.color, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)', border: 0, cursor: 'pointer', font: 'inherit' }}
            >
              <div className="label">{view.label}</div>
              <div className="value">{view.value}</div>
            </button>
          ))}
        </div>

        <div style={{ marginTop: '26px', padding: '0 2px' }}>
          <div style={{ marginTop: '18px', border: '1px solid #dfe3e7', borderRadius: '18px', background: '#f5f5f5', padding: '18px 20px 24px' }}>
            {activeDashboardView === 'commerce' ? (
              <>
                <div className="commerce-tab-row" style={{ marginBottom: '22px' }}>
                  {[
                    { id: 'storefront', label: 'Store' },
                    { id: 'payments', label: 'Pay' },
                    { id: 'orders', label: 'Orders' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setCommerceSubTab(tab.id)}
                      className="commerce-tab-button"
                      style={{
                        border: '1px solid #dfe7ef',
                        background: commerceSubTab === tab.id ? '#111827' : '#fff',
                        color: commerceSubTab === tab.id ? '#fff' : '#334155',
                        borderRadius: '999px',
                        padding: '9px 14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.83rem',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                        flex: '0 0 auto'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {commerceSubTab === 'storefront' && (
                  <div className="commerce-panel-shell" style={{ background: '#ffffff', border: '1px solid #dfe7ef', borderRadius: '20px', padding: '22px', boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)', minWidth: 0, width: '100%', maxWidth: 'none', margin: '0 auto', boxSizing: 'border-box', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
                      <div>
                        <p style={{ margin: 0, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.72rem', fontWeight: 800 }}>Storefront</p>
                        <h3 style={{ margin: '8px 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>Product manager</h3>
                      </div>
                      <div style={{ background: '#fff7ed', color: '#b45309', borderRadius: '999px', padding: '8px 12px', fontSize: '0.8rem', fontWeight: 700 }}>{storeProducts.length} live products</div>
                    </div>
                    <form onSubmit={handleStoreProductSubmit} style={{ display: 'grid', gap: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                        <input value={storeProductForm.title} onChange={(event) => setStoreProductForm((current) => ({ ...current, title: event.target.value }))} placeholder="Ebook title" style={adminFieldStyle} />
                        <input value={storeProductForm.category} onChange={(event) => setStoreProductForm((current) => ({ ...current, category: event.target.value }))} placeholder="Category" style={adminFieldStyle} />
                      </div>
                      <textarea value={storeProductForm.description} onChange={(event) => setStoreProductForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" style={{ ...adminFieldStyle, minHeight: '90px', resize: 'vertical' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                        <input type="number" value={storeProductForm.price} onChange={(event) => setStoreProductForm((current) => ({ ...current, price: event.target.value }))} placeholder="Price in NGN" style={adminFieldStyle} />
                        <input value={storeProductForm.fileUrl} onChange={(event) => setStoreProductForm((current) => ({ ...current, fileUrl: event.target.value }))} placeholder="File URL" style={adminFieldStyle} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                        <select
                          value={storeProductForm.inStock ? 'available' : 'out-of-stock'}
                          onChange={(event) => setStoreProductForm((current) => ({ ...current, inStock: event.target.value === 'available' }))}
                          style={adminFieldStyle}
                        >
                          <option value="available">Available</option>
                          <option value="out-of-stock">Out of stock</option>
                        </select>
                        <input
                          type="number"
                          min="0"
                          value={storeProductForm.stockCount}
                          onChange={(event) => setStoreProductForm((current) => ({ ...current, stockCount: event.target.value }))}
                          placeholder="Stock count"
                          style={adminFieldStyle}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                        <input value={storeProductForm.cover} onChange={(event) => setStoreProductForm((current) => ({ ...current, cover: event.target.value }))} placeholder="Cover image URL" style={{ ...adminFieldStyle, flex: 1 }} />
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <button type="submit" style={{ border: 'none', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff', borderRadius: '12px', padding: '12px 18px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 12px 20px rgba(245, 158, 11, 0.28)' }}>
                            {editingStoreProductId ? 'Update product' : 'Add product'}
                          </button>
                          {editingStoreProductId && (
                            <button type="button" onClick={resetStoreProductForm} style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#334155', borderRadius: '12px', padding: '12px 14px', fontWeight: 700, cursor: 'pointer' }}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </form>

                    <div style={{ marginTop: '24px' }}>
                      <div style={{ marginBottom: '12px', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' }}>Published products</div>
                      {storeProducts.length > 0 ? (
                        <div className="commerce-product-list">
                          {storeProducts.map((product) => {
                            const isAvailable = product.inStock !== false && Number(product.stockCount || 0) > 0;
                            return (
                              <div key={product.id} className="commerce-product-card">
                                <div className="commerce-product-media">
                                  <img src={product.cover || '/logo/logomain.png'} alt={product.title} />
                                </div>
                                <div className="commerce-product-meta">
                                  <div className="commerce-product-badges" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                    <span style={{ background: '#e0f2fe', color: '#0369a1', borderRadius: '999px', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{product.category || 'Ebook'}</span>
                                    <span style={{ background: isAvailable ? '#dcfce7' : '#fee2e2', color: isAvailable ? '#166534' : '#b91c1c', borderRadius: '999px', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{isAvailable ? 'Available' : 'Out of stock'}</span>
                                  </div>
                                  <div className="commerce-product-title" style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.title}</div>
                                  <div className="commerce-product-desc" style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.description || 'No description provided yet.'}</div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>₦{Number(product.price || 0).toLocaleString()}</span>
                                    <span style={{ color: '#64748b', fontSize: '0.78rem' }}>{product.fileUrl ? 'File attached' : 'No file URL'}</span>
                                  </div>
                                </div>
                                <div className="commerce-product-actions">
                                  <button type="button" onClick={() => toggleStoreProductAvailability(product.id)} style={{ border: '1px solid #d1d5db', background: '#f8fafc', color: '#1f2937', borderRadius: '10px', padding: '8px 10px', fontWeight: 700, cursor: 'pointer' }}>{isAvailable ? 'Mark sold out' : 'Mark available'}</button>
                                  <button type="button" onClick={() => handleEditStoreProduct(product)} style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#1f2937', borderRadius: '10px', padding: '8px 10px', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                                  <button type="button" onClick={() => confirmDeleteStoreProduct(product)} style={{ border: '1px solid #fecaca', background: '#fff1f2', color: '#b91c1c', borderRadius: '10px', padding: '8px 10px', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ color: '#64748b', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '18px', textAlign: 'center' }}>No products published yet.</div>
                      )}
                    </div>

                    {productDeleteTarget && (
                      <div onClick={() => setProductDeleteTarget(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: '20px' }}>
                        <div onClick={(event) => event.stopPropagation()} style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '18px', boxShadow: '0 30px 80px rgba(15, 23, 42, 0.28)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                          <div style={{ padding: '22px 22px 14px', borderBottom: '1px solid #eef2f7' }}>
                            <div style={{ fontSize: '0.76rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f97316', fontWeight: 800, marginBottom: '8px' }}>Delete product</div>
                            <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.3rem', fontWeight: 800 }}>Remove this item?</h4>
                          </div>
                          <div style={{ padding: '18px 22px', color: '#475569', lineHeight: 1.6 }}>
                            This will remove <strong style={{ color: '#0f172a' }}>{productDeleteTarget.title || 'this product'}</strong> from the storefront and shop pages.
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '0 22px 22px' }}>
                            <button type="button" onClick={() => setProductDeleteTarget(null)} style={{ border: '1px solid #d1d5db', background: '#fff', color: '#334155', borderRadius: '10px', padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                            <button type="button" onClick={() => {
                              handleDeleteStoreProduct(productDeleteTarget.id);
                              setProductDeleteTarget(null);
                            }} style={{ border: 'none', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff', borderRadius: '10px', padding: '10px 16px', fontWeight: 800, cursor: 'pointer' }}>Delete product</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {commerceSubTab === 'payments' && (
                  <div className="commerce-panel-shell" style={{ background: '#ffffff', border: '1px solid #dfe7ef', borderRadius: '20px', padding: '22px', boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)', minWidth: 0, width: '100%', maxWidth: 'none', margin: '0 auto', boxSizing: 'border-box', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ margin: 0, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.72rem', fontWeight: 800 }}>Payments</p>
                        <h3 style={{ margin: '8px 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>Bank transfer details</h3>
                      </div>
                    </div>
                    <div className="commerce-input-grid" style={{ display: 'grid', gap: '12px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                      <input value={storeBankAccount?.bankName || ''} onChange={(event) => handleBankAccountChange('bankName', event.target.value)} placeholder="Bank name" style={adminFieldStyle} />
                      <input value={storeBankAccount?.accountName || ''} onChange={(event) => handleBankAccountChange('accountName', event.target.value)} placeholder="Account name" style={adminFieldStyle} />
                      <input value={storeBankAccount?.accountNumber || ''} onChange={(event) => handleBankAccountChange('accountNumber', event.target.value)} placeholder="Account number" style={adminFieldStyle} />
                      <input value={storeBankAccount?.accountType || ''} onChange={(event) => handleBankAccountChange('accountType', event.target.value)} placeholder="Account type" style={adminFieldStyle} />
                      <input value={storeBankAccount?.swiftCode || ''} onChange={(event) => handleBankAccountChange('swiftCode', event.target.value)} placeholder="Swift code (optional)" style={adminFieldStyle} />
                      <textarea value={storeBankAccount?.note || ''} onChange={(event) => handleBankAccountChange('note', event.target.value)} placeholder="Transfer note" style={{ ...adminFieldStyle, minHeight: '88px', resize: 'vertical', gridColumn: '1 / -1' }} />
                    </div>
                  </div>
                )}

                {commerceSubTab === 'orders' && (
                  <div className="commerce-panel-shell" style={{ background: '#ffffff', border: '1px solid #dfe7ef', borderRadius: '20px', padding: '22px', boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08)', minWidth: 0, width: '100%', maxWidth: 'none', margin: '0 auto', boxSizing: 'border-box', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ margin: 0, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.72rem', fontWeight: 800 }}>Orders</p>
                        <h3 style={{ margin: '8px 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>Recent customer orders</h3>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '999px', padding: '8px 12px', color: '#334155', fontWeight: 700 }}>{shopOrders.length} total</div>
                    </div>

                    <div style={{ overflowX: 'auto', width: '100%' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.74rem' }}>
                            <th style={{ padding: '12px 14px', textAlign: 'left' }}>Order</th>
                            <th style={{ padding: '12px 14px', textAlign: 'left' }}>Customer</th>
                            <th style={{ padding: '12px 14px', textAlign: 'left' }}>Items</th>
                            <th style={{ padding: '12px 14px', textAlign: 'left' }}>Total</th>
                            <th style={{ padding: '12px 14px', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '12px 14px', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '12px 14px', textAlign: 'left' }}>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shopOrders.length > 0 ? shopOrders.map((order) => (
                            <tr key={order.id || order.orderNumber} onClick={() => setSelectedOrder(order)} style={{ borderBottom: '1px solid #e2e8f0', cursor: 'pointer', transition: 'background 0.2s ease' }} onMouseEnter={(event) => { event.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent'; }}>
                              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{order.orderNumber || 'N/A'}</td>
                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{order.name || 'Customer'}</div>
                                <div style={{ color: '#64748b', fontSize: '0.82rem' }}>{order.email || 'No email'}</div>
                              </td>
                              <td style={{ padding: '12px 14px', color: '#334155' }}>{(order.items || []).map((item) => `${item.title} x${item.quantity}`).join(', ') || 'No items'}</td>
                              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(order.total || 0))}</td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{ background: order.status === 'paid' ? '#dcfce7' : '#fff7ed', color: order.status === 'paid' ? '#166534' : '#b45309', borderRadius: '999px', padding: '6px 10px', fontSize: '0.76rem', fontWeight: 700, textTransform: 'capitalize' }}>{order.status || 'pending'}</span>
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{ background: order.productEmailSent ? '#dcfce7' : '#fef3c7', color: order.productEmailSent ? '#166534' : '#92400e', borderRadius: '999px', padding: '6px 10px', fontSize: '0.76rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                  {order.productEmailSent ? 'Sent' : 'Not sent'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 14px', color: '#475569' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="7" style={{ padding: '22px 14px', textAlign: 'center', color: '#64748b' }}>No checkout orders have been placed yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 800, color: '#1a1a1a' }}>{activeDashboardLabel}</h2>
                <p style={{ margin: '8px 0 0', fontSize: '1.05rem', color: '#4b5563' }}>
                  {activeDashboardView === 'visitors' ? 'Visitors logged from the main site.' : activeDashboardView === 'teens' ? 'Teens registration form details submitted through the public site.' : activeDashboardView === 'messages' ? 'Messages submitted via the main contact form.' : activeDashboardView === 'bookings' ? 'Session booking requests submitted through the public site.' : activeDashboardView === 'feedback' ? 'Parent mentoring feedback responses submitted through the public survey.' : activeDashboardView === 'slider' ? 'Testimonials currently published in the Client Voices slider on the home page.' : 'Testimonials submitted from the site and available for review.'}
                </p>
              </>
            )}
            <div className="dashboard-actions-row">
              <button className="dashboard-refresh-button" type="button" onClick={refreshAdminData} disabled={refreshLoading} title={refreshLoading ? 'Refreshing' : 'Refresh'} aria-label={refreshLoading ? 'Refreshing' : 'Refresh'} style={{ border: '1px solid #b7d9cf', background: refreshLoading ? '#dcebe6' : '#e8f6f1', color: '#17634f', borderRadius: '999px', padding: '0.8rem 1.2rem', fontSize: '1rem', fontWeight: 700, cursor: refreshLoading ? 'wait' : 'pointer' }}>
                <i className={`fa-solid ${refreshLoading ? 'fa-spinner fa-spin' : 'fa-rotate'}`} aria-hidden="true"></i> <span>Refresh</span>
              </button>
              <button type="button" className="dashboard-action-button" aria-label="All rows" title="All rows" style={{ border: '1px solid #d8dfe7', background: '#f0f1f2', color: '#1f2937', borderRadius: '999px', padding: '0.8rem 1.2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                <i className="fa-solid fa-table-list" aria-hidden="true"></i> <span>All rows</span>
              </button>
              <button type="button" className="dashboard-action-button" aria-label="Selected rows" title="Selected rows" style={{ border: '1px solid #d8dfe7', background: '#f0f1f2', color: '#1f2937', borderRadius: '999px', padding: '0.8rem 1.2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                <i className="fa-solid fa-square-check" aria-hidden="true"></i> <span>Selected rows (0)</span>
              </button>
              <button type="button" className="dashboard-action-button" onClick={deleteSelected} disabled={selectedRowIds.length === 0} aria-label={activeDashboardView === 'slider' ? 'Unpost selected' : 'Delete selected'} title={activeDashboardView === 'slider' ? 'Unpost selected' : 'Delete selected'} style={{ border: '1px solid #d8dfe7', background: selectedRowIds.length === 0 ? '#f7f7f7' : '#f0f1f2', color: '#1f2937', borderRadius: '999px', padding: '0.8rem 1.2rem', fontSize: '1rem', fontWeight: 700, cursor: selectedRowIds.length === 0 ? 'not-allowed' : 'pointer' }}>
                <i className={`fa-solid ${activeDashboardView === 'slider' ? 'fa-eye-slash' : 'fa-trash-can'}`} aria-hidden="true"></i> <span>{activeDashboardView === 'slider' ? 'Unpost selected' : 'Delete selected'} ({selectedRowIds.length})</span>
              </button>
              <button type="button" className="dashboard-action-button" aria-label="Preview PDF" title="Preview PDF" style={{ border: 'none', background: '#f0f1f2', color: '#1f2937', borderRadius: '999px', padding: '0.8rem 1.2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                <i className="fa-solid fa-file-pdf" aria-hidden="true"></i> <span>Preview PDF</span>
              </button>
              <button type="button" className="dashboard-action-button" aria-label="Print responses" title="Print responses" style={{ border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', borderRadius: '999px', padding: '0.8rem 1.5rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 12px 22px rgba(92,74,228,0.22)' }}>
                <i className="fa-solid fa-print" aria-hidden="true"></i> <span>Print responses</span>
              </button>
                {activeFilterDefinitions.length > 0 && (
                  <div className="dashboard-filters">
                    {filterOptions.map((filter) => (
                      <label key={filter.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', color: '#374151', fontWeight: 600 }}>
                        {filter.label}
                        <select value={activeFilters[filter.key] || ''} onChange={(e) => setTableFilters((current) => ({ ...current, [activeDashboardView]: { ...current[activeDashboardView], [filter.key]: e.target.value } }))} style={{ minWidth: '150px', padding: '8px', borderRadius: '8px' }}>
                          <option value="">All {filter.label.toLowerCase()}s</option>
                          {filter.options.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </label>
                    ))}
                    <button type="button" className="dashboard-action-button" onClick={() => setTableFilters((current) => ({ ...current, [activeDashboardView]: {} }))} aria-label="Clear filters" title="Clear filters" style={{ border: '1px solid #d8dfe7', background: '#fff', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer' }}><i className="fa-solid fa-filter-circle-xmark" aria-hidden="true"></i> <span>Clear</span></button>
                  </div>
                )}
            </div>

            <div className="dashboard-table-wrap">
              <table className="table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                        <th style={{ width: '48px', textAlign: 'center', padding: '14px 8px' }}>
                          <input type="checkbox" aria-label="Select all" onChange={(e) => {
                            if (!filteredDashboardRows) return;
                            if (e.target.checked) setSelectedRowIds(filteredDashboardRows.map((r) => r.id));
                            else clearSelection();
                          }} checked={selectedRowIds.length === filteredDashboardRows.length && filteredDashboardRows.length > 0} />
                        </th>
                        {dashboardTableColumns[activeDashboardView]?.map((column) => (
                          <th key={column} style={{ textAlign: 'left', padding: '14px 16px', color: '#374151', fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{column}</th>
                        ))}
                        <th style={{ textAlign: 'right', padding: '14px 16px', color: '#374151', fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDashboardRows.length > 0 ? (
                    filteredDashboardRows.map((row) => (
                          <tr key={row.id} style={{ borderTop: '1px solid #eef2f7' }}>
                            <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                              <input type="checkbox" checked={selectedRowIds.includes(row.id)} onChange={() => toggleSelectRow(row.id)} />
                            </td>
                            {row.columns.map((cell, index) => (
                              <td key={`${row.id}-${index}`} style={{ padding: index === 0 ? 0 : '14px 16px', color: '#4b5563', verticalAlign: 'top', maxWidth: '260px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                {index === 0 ? (
                                  <button type="button" onClick={() => viewRow(row)} style={{ display: 'block', width: '100%', minHeight: '52px', padding: '14px 16px', border: 0, background: 'transparent', color: '#14532d', fontWeight: 800, textAlign: 'left', textDecoration: 'none', cursor: 'pointer' }} aria-label={`View details for ${cell}`}>
                                    {cell}
                                  </button>
                                ) : cell}
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
                                  {activeDashboardView === 'slider' ? 'Unpost' : 'Delete'}
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

      {adminToast && (
        <div className="admin-toast" data-type={adminToast.type} role="status" aria-live="polite">
          <div className="admin-toast-header">
            <div className="admin-toast-content">
              <i
                className={`admin-toast-icon fa-solid ${adminToast.type === 'success' ? 'fa-circle-check' : adminToast.type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-exclamation'}`}
                aria-hidden="true"
              ></i>
              <div>
                <p className="admin-toast-title">{adminToast.title}</p>
                <div className="admin-toast-body">{adminToast.message}</div>
              </div>
            </div>
            <button type="button" className="admin-toast-close" onClick={() => setAdminToast(null)} aria-label="Close notification">×</button>
          </div>
          {adminToast.actions.length > 0 && (
            <div className="admin-toast-actions">
              {adminToast.actions.map((action, index) => (
                <button
                  key={`${action.label}-${index}`}
                  type="button"
                  className={`admin-toast-btn ${action.variant === 'danger' ? 'danger' : 'secondary'}`}
                  onClick={action.onClick}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {deleteConfirmation && (
        <div className="delete-confirmation-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteConfirmation(null); }}>
          <section className="delete-confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="delete-confirmation-title">
            <h3 id="delete-confirmation-title">Are you sure?</h3>
            <p>{deleteConfirmation.message} This action cannot be undone.</p>
            <div className="delete-confirmation-actions">
              <button type="button" className="delete-confirmation-cancel" onClick={() => setDeleteConfirmation(null)}>Cancel</button>
              <button type="button" className="delete-confirmation-delete" onClick={confirmDelete}>Delete</button>
            </div>
          </section>
        </div>
      )}

      {selectedOrder && (
        <div className="view-modal-overlay" onClick={() => setSelectedOrder(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 17000, padding: '20px' }}>
          <div className="view-modal-content" onClick={(event) => event.stopPropagation()} style={{ background: '#fff', borderRadius: '18px', width: 'min(760px, calc(100vw - 32px))', maxWidth: '100%', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 28px 90px rgba(15,23,42,0.35)', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
            <div style={{ padding: '22px 22px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '18px' }}>
                <div>
                  <p style={{ margin: 0, color: '#f59e0b', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Order review</p>
                  <h3 style={{ margin: '8px 0 0', fontSize: '1.7rem', fontWeight: 800, color: '#111827' }}>{selectedOrder.orderNumber || 'Order details'}</h3>
                </div>
                <button type="button" onClick={() => setSelectedOrder(null)} aria-label="Close order review" style={{ border: 'none', background: '#f1f5f9', color: '#334155', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '22px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px' }}>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Customer</div>
                  <div style={{ marginTop: '8px', fontWeight: 735, color: '#0f172a' }}>{selectedOrder.name || 'Customer'}</div>
                  <div style={{ color: '#475569', fontSize: '0.9rem' }}>{selectedOrder.email || 'No email'}</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px' }}>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Payment</div>
                  <div style={{ marginTop: '8px', fontWeight: 800, color: '#0f172a' }}>{selectedOrder.status === 'paid' ? 'Confirmed' : 'Pending confirmation'}</div>
                  <div style={{ color: '#475569', fontSize: '0.9rem' }}>{selectedOrder.paymentProofFile ? selectedOrder.paymentProofFile : 'No proof uploaded'}</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px' }}>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Amount</div>
                  <div style={{ marginTop: '8px', fontWeight: 800, color: '#0f172a' }}>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(selectedOrder.total || 0))}</div>
                  <div style={{ color: '#475569', fontSize: '0.9rem' }}>{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '18px', alignItems: 'start' }}>
                <section style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 12px', color: '#111827', fontSize: '1rem' }}>Items</h4>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {(selectedOrder.items || []).length > 0 ? (selectedOrder.items || []).map((item, index) => (
                      <div key={`${item.id || item.title || index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', borderBottom: index < (selectedOrder.items || []).length - 1 ? '1px solid #e2e8f0' : 'none', paddingBottom: index < (selectedOrder.items || []).length - 1 ? '10px' : 0 }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.title || 'Product'}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Qty: {item.quantity || 1}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(item.price || 0) * Number(item.quantity || 1))}</div>
                      </div>
                    )) : <div style={{ color: '#64748b' }}>No items recorded for this order.</div>}
                  </div>
                </section>

                <section style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 12px', color: '#111827', fontSize: '1rem' }}>Proof of payment</h4>
                  {paymentProofPreview ? (
                    <img src={paymentProofPreview} alt="Payment proof preview" style={{ width: '100%', borderRadius: '10px', border: '1px solid #cbd5e1', maxHeight: '220px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ color: '#64748b', padding: '20px 0', textAlign: 'center' }}>No proof image attached.</div>
                  )}
                </section>
              </div>

              <div style={{ display: 'flex', gap: '8px', margin: '16px 0 12px', padding: '4px', background: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0', width: 'fit-content', maxWidth: '100%', overflowX: 'auto' }}>
                {[
                  { id: 'payment', label: 'Pay' },
                  { id: 'email', label: 'Email' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setOrderModalTab(tab.id)}
                    style={{
                      border: 'none',
                      borderRadius: '9px',
                      background: orderModalTab === tab.id ? '#111827' : 'transparent',
                      color: orderModalTab === tab.id ? '#fff' : '#475569',
                      padding: '8px 14px',
                      fontWeight: 800,
                      fontSize: '0.76rem',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {orderModalTab === 'payment' ? (
                <div style={{ display: 'grid', gap: '12px', marginTop: '8px' }}>
                  <section style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px' }}>
                    <h4 style={{ margin: '0 0 12px', color: '#111827', fontSize: '1rem' }}>Proof of payment</h4>
                    {paymentProofPreview ? (
                      <img src={paymentProofPreview} alt="Payment proof preview" style={{ width: '100%', borderRadius: '10px', border: '1px solid #cbd5e1', maxHeight: '220px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ color: '#64748b', padding: '20px 0', textAlign: 'center' }}>No proof image attached.</div>
                    )}
                  </section>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingBottom: '8px' }}>
                    <button type="button" onClick={() => handleOrderPaymentConfirmation(selectedOrder)} style={{ background: selectedOrder.status === 'paid' ? '#dcfce7' : 'linear-gradient(135deg, #16a34a, #15803d)', color: selectedOrder.status === 'paid' ? '#166534' : '#fff', border: 'none', borderRadius: '10px', padding: '0.85rem 1.2rem', fontWeight: 800, cursor: 'pointer' }}>
                      {selectedOrder.status === 'paid' ? 'Payment confirmed' : 'Confirm payment'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1rem' }}>Send product</h4>
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{selectedOrder.email || 'No email'}</span>
                  </div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, color: '#334155' }}>Custom message</label>
                  <textarea
                    value={deliveryMessageDraft}
                    onChange={(event) => setDeliveryMessageDraft(event.target.value)}
                    placeholder="Write a note to the customer before sending the product."
                    style={{ width: '100%', minHeight: '110px', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px 14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '0.95rem' }}
                  />
                  <div style={{ marginTop: '14px' }}>
                    <label htmlFor="delivery-product-upload" style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#334155' }}>Attach product file</label>
                    <input
                      id="delivery-product-upload"
                      type="file"
                      onChange={(event) => setDeliveryAttachment(event.target.files?.[0] || null)}
                      style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '10px 12px', background: '#fff' }}
                    />
                    {deliveryAttachment && (
                      <div style={{ marginTop: '8px', color: '#166534', fontSize: '0.85rem', fontWeight: 700 }}>
                        Selected file: {deliveryAttachment.name}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '18px', background: '#ffffff', border: '1px solid #dfe8e3', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)' }}>
                    <div style={{ background: 'linear-gradient(135deg, #0b3a2c 0%, #123f2f 50%, #1a4b38 100%)', color: '#fff', padding: '22px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '10px 18px', boxShadow: '0 8px 20px rgba(0,0,0,0.12)' }}>
                        <img src="/logo/logo2.jpeg" alt="PAZ logo" style={{ width: '38px', height: '38px', borderRadius: '12px', marginRight: '12px', objectFit: 'cover' }} />
                        <div style={{ fontSize: '11px', letterSpacing: '0.12em', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.2, textAlign: 'left', color: '#0f172a' }}>
                          PAZ<br />Thriving Tribe
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '18px 16px 12px', background: '#fff' }}>
                      <div style={{ fontSize: '0.7rem', color: '#2d7a5c', letterSpacing: '0.08em', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>
                        Subject: {selectedOrder.orderNumber ? `Your PAZ order is ready — #${selectedOrder.orderNumber}` : 'Your PAZ order update'}
                      </div>

                      <div style={{ fontWeight: 800, color: '#111827', marginBottom: '10px', fontSize: '1.05rem' }}>
                        Hi {selectedOrder.name || selectedOrder.customerName || selectedOrder.customer_name || selectedOrder.full_name || 'there'},
                      </div>

                      <div style={{ color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontSize: '0.93rem', marginBottom: '14px' }}>
                        {deliveryMessageDraft || 'Your purchased product is now ready for delivery.'}
                      </div>

                      <div style={{ background: '#f3f9f6', border: '1px solid #d7e9e0', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
                        <div style={{ fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2d7a5c', fontWeight: 800, marginBottom: '8px' }}>
                          Order details
                        </div>
                        {selectedOrder.orderNumber && (
                          <div style={{ color: '#1f2937', fontSize: '0.9rem', marginBottom: '6px' }}>
                            <strong>Order number:</strong> {selectedOrder.orderNumber}
                          </div>
                        )}
                        {deliveryAttachment && (
                          <div style={{ color: '#1f2937', fontSize: '0.9rem', marginBottom: '6px' }}>
                            <strong>Product file:</strong> {deliveryAttachment.name}
                          </div>
                        )}
                        <div style={{ color: '#1f2937', fontSize: '0.9rem' }}>
                          <strong>Customer email:</strong> {selectedOrder.email || 'No email'}
                        </div>
                      </div>

                      {(selectedOrder.items || []).length > 0 && (
                        <div style={{ background: '#f8faf7', border: '1px solid #dfeae2', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
                          <div style={{ fontSize: '0.68rem', color: '#2d7a5c', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, marginBottom: '10px' }}>Your materials</div>
                          {(selectedOrder.items || []).map((item, index) => (
                            <div key={`${item.id || item.title || index}`} style={{ color: '#334155', fontSize: '0.9rem', marginBottom: '6px' }}>
                              • {item.title || 'Product'} x{item.quantity || 1}
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px', marginBottom: '14px' }}>
                        <a href="https://pazthrivingtribe.org/teens_reg" style={{ display: 'inline-block', background: '#1d9a63', color: '#fff', padding: '12px 18px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, textDecoration: 'none' }}>Apply for a section</a>
                        <a href="https://pazthrivingtribe.org/book-session" style={{ display: 'inline-block', background: '#fff', color: '#0f172a', border: '1px solid #dfe8e3', padding: '12px 18px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, textDecoration: 'none' }}>Book for a section</a>
                      </div>
                    </div>

                    <div style={{ background: '#f7faf8', borderTop: '1px solid #dfe8e3', padding: '18px 16px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Stay connected with PAZ</div>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <a href="https://www.instagram.com/pazthrivingtribe" target="_blank" rel="noreferrer" style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#e1306c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Instagram">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="5" stroke="white" strokeWidth="2"/><circle cx="12" cy="12" r="4.2" stroke="white" strokeWidth="2"/><circle cx="17.3" cy="6.7" r="1.3" fill="white"/></svg>
                        </a>
                        <a href="https://facebook.com/pazthrivingtribe" target="_blank" rel="noreferrer" style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1877f2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Facebook">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 8.5H16V5.5C15.5 5.4 14.7 5.3 13.8 5.3C11.7 5.3 10.3 6.5 10.3 9V11H7.7V14.2H10.3V19H13.5V14.2H15.7L16 11H13.5V9.4C13.5 8.9 13.9 8.5 14.5 8.5Z" fill="white"/></svg>
                        </a>
                        <a href="https://wa.me/2348037383820" target="_blank" rel="noreferrer" style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#25D366', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} aria-label="WhatsApp">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.52 3.48A11.83 11.83 0 0 0 12.08 1C6.26 1 1.53 5.72 1.53 11.52c0 2.05.54 4.05 1.57 5.82L1.5 22.5l5.3-1.38A10.5 10.5 0 0 0 12.08 21c5.82 0 10.55-4.72 10.55-10.52 0-2.82-1.1-5.48-3.11-7.5ZM12.08 18.98c-1.7 0-3.36-.45-4.82-1.31l-.34-.2-3.14.82.84-3.06-.2-.33A8.5 8.5 0 1 1 20.57 11.5c0 2.28-.88 4.42-2.49 6.06a8.4 8.4 0 0 1-6.0 1.42Zm4.63-6.25c-.25-.13-1.47-.72-1.7-.8-.23-.08-.4-.13-.57.12-.17.25-.64.8-.78.95-.14.16-.29.18-.54.06-.25-.13-1.04-.38-1.98-1.22-.73-.65-1.23-1.45-1.37-1.7-.14-.25-.02-.39.11-.52.11-.11.25-.29.38-.43.12-.14.16-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.57-1.37-.78-1.88-.2-.5-.41-.43-.57-.43h-.48c-.16 0-.42.06-.64.31-.22.25-.86.84-.86 2.05 0 1.21.88 2.38.99 2.55.12.17 1.72 2.73 4.15 3.82.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.12-.22-.18-.47-.31Z" fill="white"/></svg>
                        </a>
                        <a href="https://www.linkedin.com/company/pazthrivingtribe" target="_blank" rel="noreferrer" style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#0a66c2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} aria-label="LinkedIn">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.94 8.5C7.95 8.5 8.76 7.7 8.76 6.75C8.76 5.79 7.95 5 6.94 5C5.94 5 5.13 5.79 5.13 6.75C5.13 7.7 5.94 8.5 6.94 8.5ZM5.48 9.8H8.4V18.5H5.48V9.8ZM10.7 9.8H13.55V11H13.59C14.03 10.2 15.08 9.33 16.8 9.33C20.3 9.33 20.8 11.7 20.8 14.3V18.5H17.88V15C17.88 13.8 17.86 12.2 16.17 12.2C14.44 12.2 14.17 13.55 14.17 14.88V18.5H10.7V9.8Z" fill="white"/></svg>
                        </a>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                        <a href="https://pazthrivingtribe.org" style={{ display: 'inline-block', background: '#0f172a', color: '#fff', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, textDecoration: 'none' }}>PAZ website</a>
                        <a href="https://wa.me/2348037383820" style={{ display: 'inline-block', background: '#e8f6ef', color: '#0d5d46', border: '1px solid #cfeadf', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, textDecoration: 'none' }}>WhatsApp</a>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>© {new Date().getFullYear()} PAZ Thriving Tribe. All rights reserved.</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>Email: pazthrivingtribe@gmail.com | WhatsApp: +234 803 738 3820</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '18px' }}>
                    <button type="button" onClick={() => handleSendProductEmail(selectedOrder)} style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.85rem 1.2rem', fontWeight: 800, cursor: 'pointer' }}>
                      {selectedOrder.productEmailSent ? 'Resend email' : 'Send product'}
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '22px', paddingBottom: '22px' }}>
                <button type="button" onClick={() => setSelectedOrder(null)} style={{ background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.9rem 1.35rem', fontWeight: 800, cursor: 'pointer' }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Viewing Modal */}
      {viewingRow && (
        <div className="view-modal-overlay" onClick={() => setViewingRow(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 16000, padding: '20px' }}>
          <div className={`view-modal-content printable-response-card ${['testimonials', 'slider'].includes(activeDashboardView) ? 'testimonial-view-modal' : ''}`} onClick={(e) => e.stopPropagation()} style={{ background: '#f5f8fa', borderRadius: '4px', padding: 0, maxWidth: '760px', width: '100%', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.42)' }}>
            <div className="response-letterhead" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', margin: 0, background: '#164568', color: '#fff', padding: '0.9rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <img src="/logo/logomain.png" alt="Paz Thriving Tribe logo" style={{ width: '46px', height: '46px', objectFit: 'contain', background: '#fff', borderRadius: '50%', padding: '3px' }} />
                <div>
                  <p style={{ margin: 0, color: '#fff', fontSize: '0.66rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>PAZ THRIVING TRIBE</p>
                  <h3 style={{ margin: '5px 0 0', fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{['testimonials', 'slider'].includes(activeDashboardView) ? 'Testimonial Preview' : 'Parent Mentoring Feedback Form'}</h3>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button type="button" onClick={printViewingRow} style={{ border: '1px solid rgba(255,255,255,.35)', background: '#fff', color: '#164568', borderRadius: '3px', padding: '0.5rem 0.75rem', fontWeight: 800, cursor: 'pointer' }}><i className="fa-solid fa-print" aria-hidden="true" /> Print</button>
                <button type="button" onClick={() => setViewingRow(null)} aria-label="Close record details" style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#fff' }}>×</button>
              </div>
            </div>
            <div className="response-letterhead-meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, margin: '1rem 1.25rem 0', color: '#164568', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}><span style={{ background: '#e8f0f5', padding: '0.65rem' }}>Response ID<br /><strong style={{ fontSize: '0.8rem' }}>{formatReferenceId(viewingRow.id)}</strong></span><span style={{ background: '#fff4d5', padding: '0.65rem' }}>Prepared<br /><strong style={{ fontSize: '0.8rem' }}>{new Date().toLocaleDateString()}</strong></span></div>
            <div className="response-details-grid" style={{ display: 'grid', gap: 0, padding: '1rem 1.25rem 1.25rem' }}>
              {Object.entries(viewingRow).filter(([key]) => !(key.toLowerCase() === 'id' && ['testimonials', 'slider'].includes(activeDashboardView))).map(([key, value]) => {
                let displayValue = value;
                if (Array.isArray(value)) {
                  displayValue = value.length > 0 ? value.join(', ') : 'None selected';
                } else if (typeof value === 'object' && value !== null) {
                  try {
                    displayValue = JSON.stringify(value, null, 2);
                  } catch (e) {
                    displayValue = String(value);
                  }
                }
                if (/name|parent|child/i.test(key) && typeof displayValue === 'string') displayValue = formatName(displayValue);
                return (
                  <div className="response-detail-row" key={key} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1rem', alignItems: 'stretch', border: '1px solid #d7e1e7', borderBottom: 0, background: '#fff' }}>
                    <label className="response-detail-label" style={{ display: 'flex', alignItems: 'center', margin: 0, padding: '0.7rem 0.8rem', fontSize: '0.72rem', fontWeight: 800, color: '#164568', background: '#e8f0f5', textTransform: 'uppercase' }}>{key.replace(/_/g, ' ')}</label>
                    <div style={{ padding: '0.7rem 0.8rem', fontSize: '0.9rem', color: '#1f2937', wordBreak: 'break-word', whiteSpace: 'pre-wrap', fontFamily: typeof displayValue === 'string' && displayValue.includes('{') ? 'monospace' : 'inherit' }}>{displayValue || '—'}</div>
                  </div>
                );
              })}
            </div>
            <div className="testimonial-modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
              {['testimonials', 'slider'].includes(activeDashboardView) && viewingRow.id && (
                <button
                  type="button"
                  onClick={() => { const rowId = viewingRow.id; setViewingRow(null); deleteRow(rowId); }}
                  title="Remove this testimonial from the home page slider"
                  aria-label="Remove this testimonial from the home page slider"
                  style={{ marginLeft: 'auto', background: '#fff1f2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Unpost testimonial
                </button>
              )}
              {['testimonials', 'feedback'].includes(activeDashboardView) && (viewingRow.Testimonial || viewingRow.testimonial || viewingRow.text) && (
                <button 
                  type="button" 
                  onClick={openTestimonialConfirmation}
                  disabled={postingToSlider}
                  title="Publish this testimonial to the home page testimonial slider"
                  aria-label="Publish this testimonial to the home page testimonial slider"
                  data-tooltip="Posts only this testimonial to the Testimonial section on the home page."
                  style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: postingToSlider ? 'not-allowed' : 'pointer', opacity: postingToSlider ? 0.7 : 1 }}
                >
                  {postingToSlider ? 'Posting...' : 'Post testimonial'}
                </button>
              )}
              <button type="button" onClick={() => setViewingRow(null)} style={{ background: '#f0f1f2', color: '#1f2937', border: '1px solid #d8dfe7', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {testimonialConfirmation && (
        <div className="testimonial-confirmation-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setTestimonialConfirmation(null); }} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.58)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 17000, padding: '20px' }}>
          <section className="testimonial-confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="testimonial-confirmation-title" style={{ width: 'min(560px, 100%)', background: '#fff', borderRadius: '18px', padding: '28px', boxShadow: '0 28px 80px rgba(15,23,42,.32)', border: '1px solid #dbe7df' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <p style={{ margin: 0, color: '#1e7d5b', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Review before publishing</p>
                <h3 id="testimonial-confirmation-title" style={{ margin: '0.45rem 0 0', color: '#17212b', fontSize: '1.45rem' }}>Are you sure you want to post this?</h3>
              </div>
              <button type="button" onClick={() => setTestimonialConfirmation(null)} aria-label="Close testimonial preview" style={{ border: 0, background: 'transparent', color: '#64748b', fontSize: '1.5rem', lineHeight: 1, cursor: 'pointer' }}>×</button>
            </div>
            <div className="testimonial-confirmation-preview">
              <p style={{ margin: '0.85rem 0 1.25rem', color: '#64748b', lineHeight: 1.5 }}>This content will appear in the Client Voices testimonial slider on the home page.</p>
              <div className="testimonial-confirmation-quote" style={{ background: 'linear-gradient(135deg, #f0f8f3, #fff8f3)', border: '1px solid #dbe7df', borderRadius: '12px', padding: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.9rem' }}>
                <div>
                  <p style={{ margin: 0, color: '#17212b', fontWeight: 800 }}>{testimonialConfirmation.title}</p>
                  <p style={{ margin: '0.25rem 0 0', color: '#1e7d5b', fontSize: '0.8rem', fontWeight: 700 }}>{testimonialConfirmation.origin}</p>
                </div>
                <i className="fa-solid fa-quote-left" aria-hidden="true" style={{ color: '#e88767', fontSize: '1.15rem' }} />
              </div>
              <p style={{ margin: 0, color: '#334155', fontSize: '1.05rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>“{testimonialConfirmation.text}”</p>
              </div>
            </div>
            <div className="testimonial-confirmation-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setTestimonialConfirmation(null)} style={{ border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155', borderRadius: '8px', padding: '0.75rem 1.2rem', fontWeight: 800, cursor: 'pointer' }}>Decline</button>
              <button type="button" onClick={postTestimonialToSlider} disabled={postingToSlider} style={{ border: 0, background: 'linear-gradient(135deg, #1e7d5b, #22a06b)', color: '#fff', borderRadius: '8px', padding: '0.75rem 1.35rem', fontWeight: 800, cursor: postingToSlider ? 'not-allowed' : 'pointer', opacity: postingToSlider ? 0.7 : 1 }}>{postingToSlider ? 'Posting...' : 'Post to slider'}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
