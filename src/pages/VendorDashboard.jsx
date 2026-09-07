import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const vendorDraftKey = "paz-vendor-registration-draft";
const vendorTermsVersion = "2026-09-07";
const vendorTermsSections = [
  ["1. Marketplace relationship", "PAZ Thriving Tribe provides a marketplace and digital delivery service. You remain responsible for the accuracy, legality, quality, ownership, and support of every product you submit."],
  ["2. Platform commission", "For every paid sale of any vendor product, PAZ retains a mandatory 15% platform commission calculated on the gross product amount. You receive the remaining 85%, subject to refunds, chargebacks, taxes, payment costs, holds, and applicable law. This commission applies regardless of product category, price, currency, promotion, or payout method."],
  ["3. Product standards", "You must only upload content you are authorized to sell. Products must be accurately described, deliverable, safe, and compliant with applicable laws. PAZ may reject, suspend, remove, or restrict products or accounts that do not meet these requirements."],
  ["4. Orders, refunds, and payouts", "A sale is recorded after payment verification. Payouts may remain pending while an order, refund, dispute, fraud signal, or compliance review is assessed. You authorize PAZ to deduct the commission and any valid reversals or adjustments from amounts otherwise payable to you."],
  ["5. Account and compliance duties", "You must keep your account, identity, payout, tax, and contact information accurate and secure. You are responsible for customer support relating to your products and for complying with intellectual-property, consumer-protection, tax, privacy, and other applicable obligations."],
  ["6. Acceptance and changes", "By creating a vendor account, you accept these Vendor Marketplace Terms and authorize the 15% commission. PAZ may update these terms prospectively by publishing a new version and may require renewed acceptance before continued selling."],
];
const currencies = ["NGN", "USD", "GBP", "EUR", "GHS", "KES", "ZAR"];
const vendorThemes = [
  { id: "light", label: "Light", description: "Clean PAZ workspace", swatch: "#f1f5f3" },
  { id: "dark", label: "Dark", description: "Low-glare workspace", swatch: "#17212b" },
  { id: "sage", label: "Sage", description: "Soft green PAZ tones", swatch: "#dff5e8" },
  { id: "coral", label: "Coral", description: "Warm accent workspace", swatch: "#ffe4dc" },
  { id: "gold", label: "Gold", description: "Bright marketplace tones", swatch: "#fff1c7" },
];
const banks = [
  ["Access Bank", "044"], ["Citibank Nigeria", "023"], ["Ecobank Nigeria", "050"], ["FCMB", "214"], ["Fidelity Bank", "070"], ["First Bank of Nigeria", "011"], ["Globus Bank", "103"], ["Guaranty Trust Bank", "058"], ["Heritage Bank", "030"], ["Jaiz Bank", "301"], ["Keystone Bank", "082"], ["Kuda Bank", "090267"], ["Moniepoint", "50515"], ["Opay", "999992"], ["PalmPay", "999991"], ["Polaris Bank", "076"], ["Premium Trust Bank", "105"], ["Providus Bank", "101"], ["Stanbic IBTC Bank", "221"], ["Standard Chartered Bank Nigeria", "068"], ["Sterling Bank", "232"], ["SunTrust Bank", "100"], ["Taj Bank", "302"], ["UBA", "033"], ["Union Bank of Nigeria", "032"], ["Unity Bank", "215"], ["Wema Bank", "035"], ["Zenith Bank", "057"], ["Other / International bank", ""],
];
const fieldStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "9px",
  font: "inherit",
};
const productFieldStyle = {
  ...fieldStyle,
  padding: "8px 10px",
  minHeight: "32px",
  fontSize: ".78rem",
  borderRadius: "8px",
};
const money = (value, currency = "NGN") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
const appUrl = String(import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, "");
const normalizeUsername = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 30);
const withTimeout = (promise, message, timeoutMs = 15000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      window.setTimeout(() => reject(new Error(message)), timeoutMs),
    ),
  ]);
const userFacingError = (error, fallback) => {
  const message = String(error?.message || error || "");
  if (/failed to fetch|network|fetch/i.test(message)) return "We could not reach the vendor workspace. Check your connection and try again.";
  if (/jwt|token|session|unauthorized|401/i.test(message)) return "Your vendor session needs to be refreshed. Please sign in again.";
  return message && !/^typeerror:/i.test(message) ? message : fallback;
};
const productReviewColumns = "id,vendor_id,title,price,currency,status,name_verified,description_verified,cover_verified,attachment_verified,updated_at";
const vendorProfileColumns = "id,company_name,logo_url,contact_email,id_type,id_document_path,status,payout_account_name,payout_account_number,payout_bank_name,payout_currency,rejection_reason,approved_at,approved_by,created_at,updated_at,phone,username,payout_accounts,selected_payout_account_id,vendor_terms_version,vendor_terms_accepted_at";

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [ads, setAds] = useState([]);
  const [tab, setTab] = useState("products");
  const [authMode, setAuthMode] = useState("sign-in");
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [profileForm, setProfileForm] = useState({
    username: "",
    companyName: "",
    phone: "",
    logoUrl: "",
    logoFile: null,
    idType: "National ID",
    idDocument: null,
    payoutName: "",
    payoutAccount: "",
    payoutBank: "",
    payoutBankCode: "",
    verifiedAccountName: "",
    payoutCurrency: "NGN",
    payoutAccounts: [],
    selectedPayoutAccountId: "",
  });
  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    price: "",
    currency: "NGN",
    category: "Ebook",
    fileUrl: "",
    cover: "/logo/logomain.png",
    isFree: false,
    stockCount: "1",
    inStock: true,
  });
  const [productFile, setProductFile] = useState(null);
  const [productFilePreviewUrl, setProductFilePreviewUrl] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);
  const [adForm, setAdForm] = useState({
    eyebrow: "Vendor spotlight",
    headline: "",
    productUrl: "",
  });
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [productsRefreshing, setProductsRefreshing] = useState(false);
  const [refreshingProductId, setRefreshingProductId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState("");
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");
  const [idDocumentPreviewUrl, setIdDocumentPreviewUrl] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pinMode, setPinMode] = useState(null);
  const [vendorPin, setVendorPin] = useState("");
  const [vendorPinConfirm, setVendorPinConfirm] = useState("");
  const [vendorPinError, setVendorPinError] = useState("");
  const [vendorLogoUrl, setVendorLogoUrl] = useState("");
  const [vendorCompanyName, setVendorCompanyName] = useState("");
  const vendorPinInputRefs = React.useRef([]);
  const vendorPinFormRef = React.useRef(null);
  const dashboardContentRef = React.useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const focusVendorSection = (targetTab) => {
    setSettingsOpen(false);
    setTab(targetTab);
    window.requestAnimationFrame(() => {
      dashboardContentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const [passwordResetMode, setPasswordResetMode] = useState(() =>
    new URLSearchParams(window.location.search).get("reset") === "1",
  );
  const [pinResetMode] = useState(() =>
    new URLSearchParams(window.location.search).get("reset_pin") === "1",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [vendorTermsOpen, setVendorTermsOpen] = useState(false);
  const [vendorTermsAccepted, setVendorTermsAccepted] = useState(false);
  const [usernameAvailability, setUsernameAvailability] = useState("unknown");
  const [usernameSuggestion, setUsernameSuggestion] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [vendorTheme, setVendorTheme] = useState(() => {
    try {
      return window.localStorage.getItem("paz-vendor-theme") || "light";
    } catch {
      return "light";
    }
  });
  const accountCurrency = profileForm.payoutCurrency || "NGN";

  useEffect(() => {
    try {
      window.localStorage.setItem("paz-vendor-theme", vendorTheme);
    } catch {
      // Preferences remain active for the current session if storage is unavailable.
    }
  }, [vendorTheme]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    try {
      const savedDraft = JSON.parse(window.sessionStorage.getItem(vendorDraftKey) || "null");
      if (!savedDraft) return;
      setAuthForm((current) => ({ ...current, email: savedDraft.email || current.email }));
      setProfileForm((current) => ({ ...current, ...savedDraft.profile, logoFile: null, idDocument: null }));
    } catch (error) {
      window.sessionStorage.removeItem(vendorDraftKey);
    }
  }, []);

  useEffect(() => {
    const logoUrl = profileForm.logoFile ? URL.createObjectURL(profileForm.logoFile) : "";
    const idUrl = profileForm.idDocument && profileForm.idDocument.type.startsWith("image/")
      ? URL.createObjectURL(profileForm.idDocument)
      : "";
    setLogoPreviewUrl(logoUrl);
    setIdDocumentPreviewUrl(idUrl);
    return () => {
      if (logoUrl) URL.revokeObjectURL(logoUrl);
      if (idUrl) URL.revokeObjectURL(idUrl);
    };
  }, [profileForm.logoFile, profileForm.idDocument]);

  useEffect(() => {
    const previewUrl = productFile ? URL.createObjectURL(productFile) : "";
    setProductFilePreviewUrl(previewUrl);
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [productFile]);

  useEffect(() => {
    const previewUrl = coverFile ? URL.createObjectURL(coverFile) : "";
    setCoverPreviewUrl(previewUrl);
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [coverFile]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("confirmed") === "1") {
      setNotice({
        type: "success",
        text: "Your PAZ vendor email is confirmed. Sign in below to finish submitting your vendor profile.",
      });
    }
  }, []);

  const loadData = async (user) => {
    const [
      { data: vendor },
      { data: productRows },
      { data: salesRows },
      { data: adRows },
    ] = await Promise.all([
      supabase
        .from("vendor_profiles")
        .select(vendorProfileColumns)
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("store_products")
        .select("*")
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("vendor_sales")
        .select("*")
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("promotional_ads")
        .select("*")
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false }),
    ]);
    setProfile(vendor || null);
    const selectedCurrency = vendor?.payout_currency || "NGN";
    setProducts((productRows || []).map((product) => ({ ...product, currency: selectedCurrency })));
    setSales((salesRows || []).map((sale) => ({ ...sale, currency: selectedCurrency })));
    setAds(adRows || []);
    if (vendor?.id_document_path) {
      const { data: documentUrlData } = await supabase.storage
        .from("vendor-verification")
        .createSignedUrl(vendor.id_document_path, 3600);
      setDocumentPreviewUrl(documentUrlData?.signedUrl || "");
    } else {
      setDocumentPreviewUrl("");
    }
    if (vendor)
      setProfileForm((current) => ({
        ...current,
        companyName: vendor.company_name || "",
        username: vendor.username || "",
        phone: vendor.phone || "",
        logoUrl: vendor.logo_url || "",
        logoFile: null,
        idType: vendor.id_type || "National ID",
        payoutName: vendor.payout_account_name || "",
        payoutAccount: vendor.payout_account_number || "",
        payoutBank: vendor.payout_bank_name || "",
        payoutBankCode: banks.find(([name]) => name === vendor.payout_bank_name)?.[1] || "",
        verifiedAccountName: vendor.payout_account_name || "",
        payoutCurrency: vendor.payout_currency || "NGN",
        payoutAccounts: Array.isArray(vendor.payout_accounts) && vendor.payout_accounts.length
          ? vendor.payout_accounts
          : vendor.payout_account_number
            ? [{ id: "legacy-primary", accountName: vendor.payout_account_name || "", accountNumber: vendor.payout_account_number || "", bankName: vendor.payout_bank_name || "", currency: vendor.payout_currency || "NGN", verified: true }]
            : [],
        selectedPayoutAccountId: vendor.selected_payout_account_id || (vendor.payout_account_number ? "legacy-primary" : ""),
      }));
    setProductForm((current) => ({ ...current, currency: vendor?.payout_currency || "NGN" }));
    setLoading(false);
  };

  const prepareVendorAccess = async (user) => {
    const [{ data: vendor }, { data: pinIsSet, error: pinError }] = await Promise.all([
      supabase
      .from("vendor_profiles")
        .select("logo_url,company_name")
      .eq("id", user.id)
      .maybeSingle(),
      supabase.rpc("vendor_pin_is_set"),
    ]);
    if (pinError) throw pinError;
    setVendorLogoUrl(vendor?.logo_url || "");
    setVendorCompanyName(vendor?.company_name || "");
    if (pinResetMode && pinIsSet) {
      const { error: clearPinError } = await supabase.rpc("clear_vendor_pin");
      if (clearPinError) throw clearPinError;
    }
    setPinMode(pinResetMode || !pinIsSet ? "setup" : "unlock");
    setVendorPin("");
    setVendorPinConfirm("");
    setVendorPinError("");
    setLoading(false);
  };

  const unlockVendor = async (event) => {
    event.preventDefault();
    if (!/^\d{4}$/.test(vendorPin)) {
      setNotice({ type: "error", text: "Enter all 4 digits of your vendor PIN." });
      return;
    }
    if (pinMode === "setup" && vendorPin !== vendorPinConfirm) {
      setNotice({ type: "error", text: "The PINs do not match. Check them and try again." });
      return;
    }
    setSaving(true);
    try {
      if (pinMode === "unlock") {
        const { data: validPin, error } = await supabase.rpc("verify_vendor_pin", { p_pin: vendorPin });
        if (error) throw error;
        if (!validPin) {
          setNotice({ type: "error", text: "That PIN is not correct. Try again." });
          return;
        }
      } else {
        const { error } = await supabase.rpc("set_vendor_pin", { p_pin: vendorPin });
        if (error) throw error;
      }
      setVendorPinError("");
      await loadData(session.user);
      setPinMode(null);
      setVendorPin("");
      setVendorPinConfirm("");
      if (pinResetMode) navigate("/vendor", { replace: true });
    } catch (error) {
      setVendorPinError("");
      setNotice({ type: "error", text: userFacingError(error, "The PIN could not be saved. Try again.") });
    } finally {
      setSaving(false);
    }
  };

  const sendPasswordChangeEmail = async () => {
    setSaving(true);
    try {
      const response = await withTimeout(
        fetch("/api/vendor-password-reset-email", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        "The password reset email is taking too long. Check your connection and try again.",
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "The password change email could not be sent.");
      setNotice({ type: "success", text: "A password change link has been sent to your vendor email." });
    } catch (error) {
      setNotice({ type: "error", text: error.message || "The password change email could not be sent." });
    } finally {
      setSaving(false);
    }
  };

  const startPinChange = async () => {
    setSaving(true);
    try {
      const emailResponse = await fetch("/api/vendor-pin-changed-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ event: "change_requested" }),
      });
      if (!emailResponse.ok) {
        const emailPayload = await emailResponse.json().catch(() => ({}));
        throw new Error(emailPayload.error || "The PIN security email could not be sent.");
      }
      setNotice({ type: "success", text: "A secure PIN reset link has been sent to your vendor email. Your current PIN is still active until you use that link." });
    } catch (error) {
      setNotice({ type: "error", text: error.message || "The PIN could not be reset." });
    } finally {
      setSaving(false);
    }
  };

  const refreshProducts = async () => {
    if (!session?.user?.id || productsRefreshing) return;
    setProductsRefreshing(true);
    const { data, error } = await supabase
      .from("store_products")
      .select(productReviewColumns)
      .eq("vendor_id", session.user.id)
      .order("created_at", { ascending: false });
    setProductsRefreshing(false);
    if (error) {
      setNotice({ type: "error", text: error.message || "Product statuses could not be refreshed." });
      return;
    }
    setProducts((current) => Array.isArray(data) ? data.map((freshProduct) => ({
      ...(current.find((product) => product.id === freshProduct.id) || {}),
      ...freshProduct,
      currency: accountCurrency,
    })) : current);
    setNotice({ type: "success", text: "Product verification statuses refreshed." });
  };

  const refreshProductStatus = async (productId) => {
    if (!session?.user?.id || !productId || refreshingProductId) return;
    setRefreshingProductId(productId);
    const { data, error } = await supabase
      .from("store_products")
      .select(productReviewColumns)
      .eq("id", productId)
      .eq("vendor_id", session.user.id)
      .maybeSingle();
    setRefreshingProductId(null);
    if (error || !data) {
      setNotice({ type: "error", text: error?.message || "This product status could not be refreshed." });
      return;
    }
    setProducts((current) => current.map((product) => product.id === productId ? { ...product, ...data, currency: accountCurrency } : product));
    setNotice({ type: "success", text: `${data.title} verification status refreshed.` });
  };

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data?.session || null);
      if (data?.session?.user) {
        void prepareVendorAccess(data.session.user).catch((error) => {
          setLoading(false);
          setNotice({ type: "error", text: userFacingError(error, "The vendor workspace could not be loaded. Please try again.") });
        });
      }
      else setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return undefined;
    const timer = window.setInterval(async () => {
      const { data } = await supabase
        .from("promotional_ads")
        .select("*")
        .eq("vendor_id", session.user.id)
        .order("created_at", { ascending: false });
      if (!Array.isArray(data)) return;
      setAds((current) => {
        const previous = new Map(current.map((ad) => [ad.id, ad.status]));
        const changed = data.find(
          (ad) => previous.has(ad.id) && previous.get(ad.id) !== ad.status,
        );
        if (changed)
          setNotice({
            type: changed.status === "rejected" ? "error" : "success",
            text: `Your ad "${changed.headline}" is now ${changed.status}.`,
          });
        return data;
      });
    }, 15000);
    return () => window.clearInterval(timer);
  }, [session]);

  useEffect(() => {
    if (!session?.user?.id || pinMode) return undefined;
    let inactivityTimer;
    const lockDashboard = () => {
      setPinMode("unlock");
      setVendorPin("");
      setVendorPinConfirm("");
      setVendorPinError("");
      setLoading(false);
    };
    const resetInactivityTimer = () => {
      window.clearTimeout(inactivityTimer);
      inactivityTimer = window.setTimeout(lockDashboard, 5 * 60 * 1000);
    };
    const activityEvents = ["click", "keydown", "pointerdown", "scroll", "touchstart"];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, resetInactivityTimer, { passive: true }));
    resetInactivityTimer();
    return () => {
      window.clearTimeout(inactivityTimer);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, resetInactivityTimer));
    };
  }, [session?.user?.id, pinMode]);

  useEffect(() => {
    if (!session?.user?.id) return undefined;
    const timer = window.setInterval(async () => {
      const { data } = await supabase
        .from("store_products")
        .select("*")
        .eq("vendor_id", session.user.id)
        .order("created_at", { ascending: false });
      if (!Array.isArray(data)) return;
      setProducts((current) => {
        const previous = new Map(current.map((product) => [product.id, product]));
        const changed = data.find((product) => {
          const oldProduct = previous.get(product.id);
          return oldProduct && (oldProduct.status !== product.status || Boolean(oldProduct.name_verified) !== Boolean(product.name_verified));
        });
        if (changed) {
          const statusText = changed.status === "published"
            ? "is now published in the shop"
            : changed.name_verified
              ? "has a verified name"
              : `is now ${changed.status || "in review"}`;
          setNotice({ type: changed.status === "rejected" ? "error" : "success", text: `${changed.title} ${statusText}.` });
        }
        return data;
      });
    }, 15000);
    return () => window.clearInterval(timer);
  }, [session]);

  const persistVendorProfile = async (user, values, existingProfile = null) => {
    let documentPath = existingProfile?.id_document_path || "";
    let logoUrl = values.logoUrl.trim();
    if (values.logoFile) {
      const safeLogoName = values.logoFile.name.replace(/[^a-z0-9._-]/gi, "-");
      const logoPath = `vendors/logos/${user.id}/${Date.now()}-${safeLogoName}`;
      const { data: logoData, error: logoError } = await supabase.storage
        .from("prof-upload")
        .upload(logoPath, values.logoFile, {
          upsert: true,
          contentType: values.logoFile.type || "image/*",
        });
      if (logoError) throw logoError;
      const { data: publicLogo } = supabase.storage
        .from("prof-upload")
        .getPublicUrl(logoData?.path || logoPath);
      logoUrl = publicLogo?.publicUrl || logoData?.path || logoPath;
    }
    if (values.idDocument) {
      const safeName = values.idDocument.name.replace(/[^a-z0-9._-]/gi, "-");
      documentPath = `vendors/${user.id}/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage
        .from("vendor-verification")
        .upload(documentPath, values.idDocument, {
          upsert: true,
          contentType: values.idDocument.type || "application/octet-stream",
        });
      if (error) throw error;
    }
    const { data, error } = await supabase
      .from("vendor_profiles")
      .upsert({
        id: user.id,
        username: normalizeUsername(values.username),
        company_name: values.companyName.trim(),
        phone: values.phone.trim(),
        logo_url: logoUrl,
        contact_email: user.email,
        id_type: values.idType,
        id_document_path: documentPath,
        payout_account_name: values.payoutName.trim(),
        payout_account_number: values.payoutAccount.trim(),
        payout_bank_name: values.payoutBank.trim(),
        payout_currency: values.payoutCurrency,
        payout_accounts: values.payoutAccounts || [],
        selected_payout_account_id: values.selectedPayoutAccountId || null,
        vendor_terms_version: vendorTermsVersion,
        vendor_terms_accepted_at: new Date().toISOString(),
        status: existingProfile?.status || "pending",
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  const checkVendorAvailability = async () => {
    const username = normalizeUsername(profileForm.username);
    const companyName = profileForm.companyName.trim();
    const email = authForm.email.trim().toLowerCase();
    if (!username || !companyName || !email) return false;
    setUsernameAvailability("checking");
    const { data: availability, error } = await supabase.rpc("check_vendor_identity_availability", {
      p_username: username,
      p_email: email,
      p_company_name: companyName,
    });
    if (error) {
      setUsernameAvailability("unknown");
      setNotice({ type: "error", text: "Vendor availability could not be checked. Please try again." });
      return false;
    }
    if (availability?.email_taken) {
      setUsernameAvailability("unknown");
      setNotice({ type: "error", text: "This email already belongs to a vendor record." });
      return false;
    }
    if (availability?.company_name_taken) {
      setUsernameAvailability("unknown");
      setNotice({ type: "error", text: "This business name is already registered." });
      return false;
    }
    if (availability?.username_taken) {
      const suggestion = `${username}${Math.floor(100 + Math.random() * 900)}`.slice(0, 30);
      setUsernameSuggestion(suggestion);
      setUsernameAvailability("taken");
      setNotice({ type: "error", text: `That username is already taken. Try ${suggestion}.` });
      return false;
    }
    setUsernameSuggestion("");
    setUsernameAvailability("available");
    return true;
  };

  const verifyBankAccount = async () => {
    if (!/^\d{10}$/.test(profileForm.payoutAccount) || !profileForm.payoutBankCode) {
      setNotice({ type: "error", text: "Select a supported bank and enter a 10-digit account number before verifying." });
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/resolve-bank-account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accountNumber: profileForm.payoutAccount, bankCode: profileForm.payoutBankCode }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "The bank could not verify this account.");
      setProfileForm((current) => ({ ...current, payoutName: payload.accountName, verifiedAccountName: payload.accountName }));
      setNotice({ type: "success", text: `Account verified: ${payload.accountName}` });
    } catch (error) {
      setProfileForm((current) => ({ ...current, verifiedAccountName: "" }));
      setNotice({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const authenticate = async (event) => {
    event.preventDefault();
    if (authMode === "reset") {
      setSaving(true);
      try {
        const { error } = await withTimeout(
          supabase.auth.resetPasswordForEmail(authForm.email, {
            redirectTo: `${appUrl}/vendor?reset=1`,
          }),
          "The reset request is taking too long. Check your connection and try again.",
        );
        if (error) throw error;
        setNotice({ type: "success", text: "If that email belongs to a vendor account, a reset link has been sent." });
        setAuthMode("sign-in");
      } catch (error) {
        setNotice({ type: "error", text: error.message || "The password reset email could not be sent." });
      } finally {
        setSaving(false);
      }
      return;
    }
    if (authMode === "sign-up" && (!profileForm.idDocument || !profileForm.verifiedAccountName)) {
      setNotice({ type: "error", text: !profileForm.idDocument ? "Drag in your identity document before creating your vendor account." : "Verify the payout account name before creating your vendor account." });
      return;
    }
    if (authMode === "sign-up" && !vendorTermsAccepted) {
      setNotice({ type: "error", text: "Read and accept the Vendor Marketplace Terms before creating your account." });
      return;
    }
    setSaving(true);
    try {
      if (authMode === "sign-up") {
        if (!(await checkVendorAvailability())) {
          setSaving(false);
          return;
        }
        window.sessionStorage.setItem(vendorDraftKey, JSON.stringify({
          email: authForm.email,
          profile: {
            username: profileForm.username,
            companyName: profileForm.companyName,
            logoUrl: profileForm.logoUrl,
            idType: profileForm.idType,
            payoutName: profileForm.payoutName,
            payoutAccount: profileForm.payoutAccount,
            payoutBank: profileForm.payoutBank,
            payoutBankCode: profileForm.payoutBankCode,
            verifiedAccountName: profileForm.verifiedAccountName,
            payoutCurrency: profileForm.payoutCurrency,
          },
        }));
      }
      const result =
        authMode === "sign-in"
          ? await withTimeout(
              supabase.auth.signInWithPassword(authForm),
              "Sign-in is taking too long. Check your connection and try again.",
            )
          : await withTimeout(
              supabase.auth.signUp({
                email: authForm.email,
                password: authForm.password,
                options: { emailRedirectTo: `${appUrl}/vendor?confirmed=1` },
              }),
              "Account creation is taking too long. Check your connection and try again.",
            );
      if (result.error) throw result.error;
      if (result.data?.session) {
        setSession(result.data.session);
        if (authMode === "sign-up") {
          await withTimeout(
            persistVendorProfile(result.data.session.user, profileForm),
            "Your account was created, but loading the vendor profile took too long. Refresh and try again.",
          );
          window.sessionStorage.removeItem(vendorDraftKey);
        } else {
          const { data: existingProfile, error: profileError } = await supabase
            .from("vendor_profiles")
            .select("id")
            .eq("id", result.data.session.user.id)
            .maybeSingle();
          if (profileError) throw profileError;
          if (!existingProfile && profileForm.idDocument && profileForm.verifiedAccountName) {
            await withTimeout(
              persistVendorProfile(result.data.session.user, profileForm),
              "Your account was opened, but saving the vendor profile took too long. Refresh and try again.",
            );
            window.sessionStorage.removeItem(vendorDraftKey);
          }
        }
        await withTimeout(
          prepareVendorAccess(result.data.session.user),
          "You signed in, but preparing the vendor PIN took too long. Refresh and try again.",
        );
      } else {
        setAuthMode("sign-in");
        setNotice({
          type: "success",
          text: "PAZ vendor account started. Check your email for the PAZ confirmation link, then return here, sign in, and upload your identity document to submit your vendor profile.",
        });
      }
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Your vendor account could not be created." });
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      setNotice({ type: "error", text: "Use a password with at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotice({ type: "error", text: "The passwords do not match." });
      return;
    }
    setSaving(true);
    try {
      const { error } = await withTimeout(
        supabase.auth.updateUser({ password: newPassword }),
        "Password update is taking too long. Check your connection and try again.",
      );
      if (error) throw error;
      await supabase.auth.signOut();
      setPasswordResetMode(false);
      setNewPassword("");
      setConfirmPassword("");
      setNotice({ type: "success", text: "Password updated. Sign in with your new password." });
      navigate("/vendor", { replace: true });
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Your password could not be updated." });
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    const isNewVendorProfile = !profile?.id;
    setNotice(null);
    if (!profileForm.username.trim() || !profileForm.companyName.trim()) {
      setNotice({ type: "error", text: "Username and business name are required to update your profile." });
      return;
    }
    if (isNewVendorProfile && (!profileForm.payoutName.trim() || !profileForm.payoutAccount.trim() || !profileForm.payoutBank.trim() || (!profile?.id_document_path && !profileForm.idDocument) || !profileForm.verifiedAccountName)) {
      setNotice({ type: "error", text: !profile?.id_document_path && !profileForm.idDocument ? "Drag in your identity document before saving your vendor profile." : "Business name, bank, account number, and a successfully verified account name are required for vendor verification." });
      return;
    }
    setSaving(true);
    try {
      const accountId = profileForm.selectedPayoutAccountId || "legacy-primary";
      const currentAccount = {
        id: accountId,
        accountName: profileForm.payoutName.trim(),
        accountNumber: profileForm.payoutAccount.trim(),
        bankName: profileForm.payoutBank.trim(),
        currency: profileForm.payoutCurrency,
        verified: Boolean(profileForm.verifiedAccountName),
      };
      const existingAccounts = Array.isArray(profileForm.payoutAccounts) ? profileForm.payoutAccounts : [];
      const accountIndex = existingAccounts.findIndex((account) => account.id === accountId);
      const payoutAccounts = [...existingAccounts];
      if (accountIndex >= 0) payoutAccounts[accountIndex] = currentAccount;
      else payoutAccounts.push(currentAccount);
      const values = { ...profileForm, payoutAccounts, selectedPayoutAccountId: accountId };
      const data = await persistVendorProfile(session.user, values, profile);
      setProfile(data);
      setProfileForm(values);
      setNotice({
        type: "success",
        text: isNewVendorProfile ? "Verification details sent to the main admin." : "Your vendor profile was updated.",
      });
    } catch (error) {
      setNotice({ type: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const uploadProduct = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProductFile(file);
    const path = `vendors/${session.user.id}/${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, "-")}`;
    const { data, error } = await supabase.storage
      .from("product-files")
      .upload(path, file, {
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });
    if (error) setNotice({ type: "error", text: error.message });
    else
      setProductForm((current) => ({
        ...current,
        fileUrl: data?.path || path,
      }));
  };

  const uploadCover = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const path = `vendors/${session.user.id}/covers/${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, "-")}`;
    const { data, error } = await supabase.storage.from("prof-upload").upload(path, file, { upsert: true, contentType: file.type || "image/*" });
    if (error) {
      setNotice({ type: "error", text: error.message });
      return;
    }
    const { data: publicData } = supabase.storage.from("prof-upload").getPublicUrl(data?.path || path);
    setProductForm((current) => ({ ...current, cover: publicData?.publicUrl || data?.path || path }));
  };

  const toggleProductStock = async (product) => {
    setSaving(true);
    const nextInStock = product.in_stock === false;
    const { data, error } = await supabase
      .from("store_products")
      .update({ in_stock: nextInStock, stock_count: nextInStock ? Math.max(Number(product.stock_count || 1), 1) : 0, updated_at: new Date().toISOString() })
      .eq("id", product.id)
      .eq("vendor_id", session.user.id)
      .select()
      .single();
    setSaving(false);
    if (error) {
      setNotice({ type: "error", text: error.message });
      return;
    }
    setProducts((current) => current.map((item) => item.id === product.id ? { ...data, currency: accountCurrency } : item));
    setNotice({ type: "success", text: nextInStock ? "Product marked as available." : "Product marked as sold out." });
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Remove ${product.title} from your product list?`)) return;
    setSaving(true);
    const { error } = await supabase.from("store_products").delete().eq("id", product.id).eq("vendor_id", session.user.id);
    setSaving(false);
    if (error) {
      setNotice({ type: "error", text: error.message });
      return;
    }
    setProducts((current) => current.filter((item) => item.id !== product.id));
    setNotice({ type: "success", text: "Product removed from your product list." });
  };

  const editProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({ title: product.title || "", description: product.description || "", price: product.price || "", currency: accountCurrency, category: product.category || "Ebook", fileUrl: product.file_url || "", cover: product.cover || "/logo/logomain.png", isFree: Boolean(product.is_free), stockCount: String(product.stock_count ?? 1), inStock: product.in_stock !== false });
    setProductFile(null);
    setCoverFile(null);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const copyProductLink = async (product) => {
    const slug = encodeURIComponent(
      String(product?.title || product?.id || "product")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    );
    const productLink = `${window.location.origin}/shop/${slug}`;
    try {
      await navigator.clipboard.writeText(productLink);
      setNotice({ type: "success", text: "Product link copied and ready to share." });
    } catch {
      setNotice({ type: "error", text: "Copy failed. Select the product link manually from the shop." });
    }
  };

  const publishProduct = async (event) => {
    event.preventDefault();
    if (profile?.status !== "approved") {
      setNotice({
        type: "error",
        text: "Your vendor account must be approved before publishing products.",
      });
      return;
    }
    setSaving(true);
    const productPayload = {
        title: productForm.title.trim(),
        description: productForm.description.trim(),
        price: Number(productForm.price || 0),
        currency: accountCurrency,
        category: productForm.category,
        file_url: productForm.fileUrl,
        cover: productForm.cover || "/logo/logomain.png",
        is_free: Boolean(productForm.isFree),
        vendor_id: session.user.id,
        vendor_name: profile.company_name,
        status: "in_review",
        name_verified: false,
        name_verified_at: null,
        description_verified: false,
        cover_verified: false,
        attachment_verified: false,
        amount_verified: false,
        published_at: null,
        in_stock: productForm.inStock !== false,
        stock_count: Math.max(Number(productForm.stockCount || 0), 0),
        updated_at: new Date().toISOString(),
      };
    const query = editingProductId
      ? supabase.from("store_products").update(productPayload).eq("id", editingProductId).eq("vendor_id", session.user.id)
      : supabase.from("store_products").insert(productPayload);
    const { data, error } = await query.select().single();
    setSaving(false);
    if (error) setNotice({ type: "error", text: error.message });
    else {
      setProducts((current) => editingProductId ? current.map((item) => item.id === editingProductId ? data : item) : [data, ...current]);
      setProductForm({
        title: "",
        description: "",
        price: "",
        currency: accountCurrency,
        category: "Ebook",
        fileUrl: "",
        cover: "/logo/logomain.png",
        isFree: false,
        stockCount: "1",
        inStock: true,
      });
      setNotice({ type: "success", text: editingProductId ? "Product updated." : "Product published to the shop." });
      setEditingProductId(null);
      setProductFile(null);
      setCoverFile(null);
    }
  };

  const publishAd = async (event) => {
    event.preventDefault();
    if (profile?.status !== "approved") {
      setNotice({
        type: "error",
        text: "Your vendor account must be approved before this ad can be sent to admin.",
      });
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("promotional_ads")
      .insert({
        eyebrow: adForm.eyebrow.trim(),
        headline: adForm.headline.trim(),
        product_url: adForm.productUrl.trim(),
        action_label: "View product",
        posted_by: session.user.id,
        posted_by_email: session.user.email,
        vendor_id: session.user.id,
        vendor_name: profile.company_name,
        status: "pending",
      })
      .select()
      .single();
    setSaving(false);
    if (error) setNotice({ type: "error", text: error.message });
    else {
      setAds((current) => [data, ...current]);
      setAdForm({ eyebrow: "Vendor spotlight", headline: "", productUrl: "" });
      setNotice({
        type: "success",
        text: "Ad sent to the admin dashboard for approval.",
      });
    }
  };

  const requestAdUnpublish = async (ad) => {
    if (!ad?.id || !["published", "approved"].includes(ad.status)) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("promotional_ads")
      .update({ status: "unpublish_requested" })
      .eq("id", ad.id)
      .eq("vendor_id", session.user.id)
      .select()
      .single();
    setSaving(false);
    if (error) {
      setNotice({ type: "error", text: error.message });
      return;
    }
    setAds((current) =>
      current.map((item) => (item.id === ad.id ? data : item)),
    );
    setNotice({
      type: "success",
      text: "Unpublish request sent to the main admin.",
    });
  };

  const requestAdPublish = async (ad) => {
    if (!ad?.id || ad.status !== "archived") return;
    setSaving(true);
    const { data, error } = await supabase
      .from("promotional_ads")
      .update({ status: "publish_requested" })
      .eq("id", ad.id)
      .eq("vendor_id", session.user.id)
      .select()
      .single();
    setSaving(false);
    if (error) {
      setNotice({ type: "error", text: error.message });
      return;
    }
    setAds((current) => current.map((item) => (item.id === ad.id ? data : item)));
    setNotice({ type: "success", text: "Publish request sent to the main admin." });
  };

  const logoDisplayUrl = logoPreviewUrl || profileForm.logoUrl || "";
  const identityImageDisplayUrl = idDocumentPreviewUrl || (
    /\.(jpe?g|png|webp)$/i.test(profile?.id_document_path || "")
      ? documentPreviewUrl
      : ""
  );
  const totalEarnings = sales.reduce(
    (total, sale) => total + Number(sale.vendor_amount || 0),
    0,
  );
  const canCreateVendorAccount = Boolean(
    authForm.email.trim()
    && authForm.password.length >= 8
    && profileForm.companyName.trim()
    && normalizeUsername(profileForm.username).length >= 3
    && profileForm.idType
    && profileForm.idDocument
    && profileForm.payoutName.trim()
    && /^\d{10}$/.test(profileForm.payoutAccount)
    && profileForm.payoutBankCode
    && profileForm.verifiedAccountName
    && profileForm.payoutCurrency
    && vendorTermsAccepted
  );

  if (passwordResetMode)
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px", background: "#f1f5f3" }}>
        <form onSubmit={updatePassword} style={{ width: "min(460px,100%)", background: "#fff", padding: "28px", borderRadius: "18px" }}>
          <h1>Reset vendor password</h1>
          <p style={{ color: "#64748b" }}>Choose a new password for your PAZ vendor account.</p>
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <input required minLength="8" type={showNewPassword ? "text" : "password"} placeholder="New password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} style={{ ...fieldStyle, paddingRight: "46px" }} />
              <button type="button" onClick={() => setShowNewPassword((current) => !current)} aria-label={showNewPassword ? "Hide new password" : "Show new password"} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", border: 0, background: "transparent", padding: "6px", fontSize: "1.05rem" }}>{showNewPassword ? "🙈" : "👁"}</button>
            </div>
            <div style={{ position: "relative" }}>
              <input required minLength="8" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} style={{ ...fieldStyle, paddingRight: "46px" }} />
              <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", border: 0, background: "transparent", padding: "6px", fontSize: "1.05rem" }}>{showConfirmPassword ? "🙈" : "👁"}</button>
            </div>
            <button disabled={saving} style={{ padding: "12px", background: "#166534", color: "#fff", border: 0, borderRadius: "9px", fontWeight: 800 }}>{saving ? "Updating..." : "Update password"}</button>
          </div>
          {notice && <div role="status" aria-live="polite" style={{ position: "fixed", top: "20px", right: "20px", zIndex: 100, width: "min(380px, calc(100vw - 40px))", padding: "13px 16px", borderRadius: "10px", border: `1px solid ${notice.type === "error" ? "#fecaca" : "#bbf7d0"}`, background: notice.type === "error" ? "#fef2f2" : "#ecfdf5", color: notice.type === "error" ? "#b91c1c" : "#166534", boxShadow: "0 12px 28px rgba(15, 23, 42, .16)", fontWeight: 700 }}>{notice.text}</div>}
          <button type="button" onClick={() => { setPasswordResetMode(false); navigate("/vendor", { replace: true }); }} style={{ marginTop: "12px", border: 0, background: "none", color: "#166534", fontWeight: 700 }}>Return to sign in</button>
        </form>
      </main>
    );

  if (session && pinMode)
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "clamp(18px, 4vw, 48px)",
          backgroundImage: `linear-gradient(135deg, rgba(6, 36, 28, .78), rgba(22, 101, 52, .52)), url("${vendorLogoUrl || "/logo/logomain.png"}")`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        {notice && <div role="status" aria-live="polite" style={{ position: "fixed", top: "20px", right: "20px", zIndex: 100, width: "min(380px, calc(100vw - 40px))", padding: "13px 16px", borderRadius: "10px", border: `1px solid ${notice.type === "error" ? "#fecaca" : "#bbf7d0"}`, background: notice.type === "error" ? "#fef2f2" : "#ecfdf5", color: notice.type === "error" ? "#b91c1c" : "#166534", boxShadow: "0 12px 28px rgba(15, 23, 42, .16)", fontWeight: 700 }}>{notice.text}</div>}
        <form
          ref={vendorPinFormRef}
          onSubmit={unlockVendor}
          style={{
            width: "min(430px, 100%)",
            display: "grid",
            gap: "20px",
            padding: "clamp(24px, 6vw, 42px)",
            background: "rgba(255, 255, 255, .97)",
            border: "1px solid rgba(255, 255, 255, .72)",
            borderRadius: "26px",
            boxShadow: "0 28px 80px rgba(2, 24, 17, .32)",
            textAlign: "center",
          }}
        >
          <img
            src={vendorLogoUrl || "/logo/logomain.png"}
            alt="Vendor logo"
            style={{ width: "88px", height: "88px", objectFit: "cover", borderRadius: "22px", justifySelf: "center", border: "6px solid #fff", boxShadow: "0 10px 26px rgba(15, 23, 42, .16)" }}
          />
          <div>
            <p style={{ margin: "0 0 8px", color: "#15803d", fontSize: ".7rem", fontWeight: 900, letterSpacing: ".18em", textTransform: "uppercase" }}>
              {vendorCompanyName || "Vendor workspace"}
            </p>
            <h1 style={{ margin: 0, color: "#102a20", fontSize: "clamp(1.55rem, 5vw, 2rem)", letterSpacing: "-.02em" }}>
              {pinMode === "setup" ? "Create your vendor PIN" : "Welcome back"}
            </h1>
            <p style={{ margin: "10px auto 0", maxWidth: "32rem", color: "#64756e", lineHeight: 1.6, fontSize: ".92rem" }}>
              {pinMode === "setup"
                ? "Set a private 4-digit PIN to open your vendor workspace."
                : "Enter your 4-digit PIN to continue to your vendor workspace."}
            </p>
          </div>
          <div style={{ display: "grid", gap: "10px" }}>
            <p style={{ margin: 0, color: "#385449", fontSize: ".78rem", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>
              {pinMode === "setup" ? "Choose PIN" : "Enter PIN"}
            </p>
            <div role="group" aria-label="4-digit vendor PIN" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px", maxWidth: "260px", width: "100%", margin: "0 auto" }}>
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={`pin-${index}`}
                  ref={(element) => { vendorPinInputRefs.current[index] = element; }}
                  required
                  autoFocus={index === 0}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength="1"
                  value={vendorPin[index] || ""}
                  onChange={(event) => {
                    const digit = event.target.value.replace(/\D/g, "").slice(-1);
                    const nextPin = vendorPin.padEnd(4, " ").split("");
                    nextPin[index] = digit;
                    setVendorPin(nextPin.join("").replace(/ /g, ""));
                    setVendorPinError("");
                    if (digit && index < 3) vendorPinInputRefs.current[index + 1]?.focus();
                    if (digit && index === 3 && pinMode === "unlock") {
                      window.setTimeout(() => vendorPinFormRef.current?.requestSubmit(), 0);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && !vendorPin[index] && index > 0) vendorPinInputRefs.current[index - 1]?.focus();
                  }}
                  aria-label={`PIN digit ${index + 1}`}
                  style={{ ...fieldStyle, minWidth: 0, height: "62px", padding: "8px 4px", textAlign: "center", fontSize: "1.5rem", fontWeight: 800, border: "2px solid #b7d6c3", borderRadius: "14px", background: "#f8fcf9", color: "#14532d", boxShadow: "inset 0 1px 2px rgba(15, 23, 42, .04)" }}
                />
              ))}
            </div>
            {pinMode === "setup" && (
              <>
                <p style={{ margin: "4px 0 0", color: "#385449", fontSize: ".78rem", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>Confirm PIN</p>
                <div role="group" aria-label="Confirm 4-digit vendor PIN" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px", maxWidth: "260px", width: "100%", margin: "0 auto" }}>
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={`confirm-pin-${index}`}
                    ref={(element) => { vendorPinInputRefs.current[index + 4] = element; }}
                    required
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength="1"
                    value={vendorPinConfirm[index] || ""}
                    onChange={(event) => {
                      const digit = event.target.value.replace(/\D/g, "").slice(-1);
                      const nextPin = vendorPinConfirm.padEnd(4, " ").split("");
                      nextPin[index] = digit;
                      setVendorPinConfirm(nextPin.join("").replace(/ /g, ""));
                      setVendorPinError("");
                      if (digit && index < 3) vendorPinInputRefs.current[index + 5]?.focus();
                      if (digit && index === 3) {
                        window.setTimeout(() => vendorPinFormRef.current?.requestSubmit(), 0);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Backspace" && !vendorPinConfirm[index] && index > 0) vendorPinInputRefs.current[index + 3]?.focus();
                    }}
                    aria-label={`Confirm PIN digit ${index + 1}`}
                    style={{ ...fieldStyle, minWidth: 0, height: "62px", padding: "8px 4px", textAlign: "center", fontSize: "1.5rem", fontWeight: 800, border: "2px solid #b7d6c3", borderRadius: "14px", background: "#f8fcf9", color: "#14532d", boxShadow: "inset 0 1px 2px rgba(15, 23, 42, .04)" }}
                  />
                ))}
                </div>
              </>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{ padding: "14px 16px", border: 0, borderRadius: "12px", background: "#166534", color: "#fff", fontWeight: 850, fontSize: ".95rem", cursor: saving ? "wait" : "pointer", opacity: saving ? .65 : 1, boxShadow: "0 10px 20px rgba(22, 101, 52, .2)" }}
          >
            {saving ? "Opening dashboard..." : pinMode === "setup" ? "Save PIN and open dashboard" : "Open dashboard"}
          </button>
        </form>
      </main>
    );

  if (!session)
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          backgroundImage: "linear-gradient(rgba(241, 245, 243, .72), rgba(241, 245, 243, .72)), url('/logo/logomain.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <form
          onSubmit={authenticate}
          style={{
            width: "min(460px,100%)",
            background: "#fff",
            padding: "28px",
            borderRadius: "18px",
          }}
        >
          <h1>
            {authMode === "sign-in" ? "Vendor sign in" : authMode === "reset" ? "Reset vendor password" : "Create vendor account"}
          </h1>
          <div style={{ display: "grid", gap: "12px" }}>
            <input
              required
              type="email"
              placeholder="Business email"
              value={authForm.email}
              onChange={(event) =>
                setAuthForm({ ...authForm, email: event.target.value })
              }
              style={fieldStyle}
            />
            {authMode !== "reset" && <div style={{ position: "relative" }}>
              <input
                required
                minLength="8"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={authForm.password}
                onChange={(event) =>
                  setAuthForm({ ...authForm, password: event.target.value })
                }
                style={{ ...fieldStyle, paddingRight: "46px" }}
              />
              <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", border: 0, background: "transparent", padding: "6px", fontSize: "1.05rem" }}>{showPassword ? "🙈" : "👁"}</button>
            </div>}
            {authMode === "sign-up" && (
              <>
                <input required placeholder="Business or brand name" value={profileForm.companyName} onChange={(event) => setProfileForm({ ...profileForm, companyName: event.target.value })} style={fieldStyle} />
                <div style={{ display: "grid", gap: "5px" }}>
                  <input required minLength="3" maxLength="30" pattern="[A-Za-z0-9._-]+" placeholder="Username (shown in your vendor dashboard)" value={profileForm.username} onChange={(event) => { setProfileForm({ ...profileForm, username: normalizeUsername(event.target.value) }); setUsernameAvailability("unknown"); setUsernameSuggestion(""); }} onBlur={checkVendorAvailability} style={fieldStyle} />
                  <small style={{ color: usernameAvailability === "taken" ? "#b91c1c" : "#64748b" }}>{usernameAvailability === "checking" ? "Checking username..." : usernameAvailability === "available" ? "Username is available." : usernameSuggestion ? `Suggested username: ${usernameSuggestion}` : "3-30 letters, numbers, dots, underscores, or hyphens."}</small>
                  {usernameSuggestion && <button type="button" onClick={() => { setProfileForm({ ...profileForm, username: usernameSuggestion }); setUsernameSuggestion(""); setUsernameAvailability("unknown"); }} style={{ width: "fit-content", border: "1px solid #166534", borderRadius: "7px", padding: "5px 8px", background: "#f0fdf4", color: "#166534", fontWeight: 700, cursor: "pointer" }}>Use {usernameSuggestion}</button>}
                </div>
                <label onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files?.[0]; if (file?.type.startsWith("image/")) setProfileForm({ ...profileForm, logoFile: file }); }} style={{ display: "grid", gap: "6px", padding: "16px", border: "1px dashed #86efac", borderRadius: "10px", background: "#f0fdf4", color: "#166534", textAlign: "center", cursor: "copy" }}>
                  <strong>Drag business logo here</strong>
                  <span style={{ fontSize: ".78rem" }}>{profileForm.logoFile?.name || "PNG, JPG, or WebP"}</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setProfileForm({ ...profileForm, logoFile: event.target.files?.[0] || null })} style={{ display: "none" }} />
                </label>
                <select required value={profileForm.idType} onChange={(event) => setProfileForm({ ...profileForm, idType: event.target.value })} style={fieldStyle}>
                  <option value="">Select identity document type</option>
                  <option>National ID</option>
                  <option>Passport</option>
                  <option>Driver's licence</option>
                  <option>Business registration</option>
                </select>
                <label onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files?.[0]; if (file?.type.startsWith("image/") || file?.type === "application/pdf") setProfileForm({ ...profileForm, idDocument: file }); }} style={{ display: "grid", gap: "6px", padding: "16px", border: "1px dashed #93c5fd", borderRadius: "10px", background: "#eff6ff", color: "#1d4ed8", textAlign: "center", cursor: "copy" }}>
                  <strong>Drag identity document here</strong>
                  <span style={{ fontSize: ".78rem" }}>{profileForm.idDocument?.name || "ID image or PDF"}</span>
                  <input type="file" accept="image/*,.pdf" onChange={(event) => setProfileForm({ ...profileForm, idDocument: event.target.files?.[0] || null })} style={{ display: "none" }} />
                </label>
                <input required placeholder="Account holder name (must match vendor)" value={profileForm.payoutName} readOnly={Boolean(profileForm.verifiedAccountName)} onChange={(event) => setProfileForm({ ...profileForm, payoutName: event.target.value })} style={{ ...fieldStyle, background: profileForm.verifiedAccountName ? "#ecfdf5" : "#fff" }} />
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "8px" }}><input required inputMode="numeric" placeholder="Payout account number" value={profileForm.payoutAccount} onChange={(event) => setProfileForm({ ...profileForm, payoutAccount: event.target.value.replace(/\D/g, ""), verifiedAccountName: "" })} style={fieldStyle} /><button type="button" onClick={verifyBankAccount} disabled={saving} style={{ border: 0, borderRadius: "9px", padding: "0 12px", background: "#0f766e", color: "#fff", fontWeight: 800, cursor: saving ? "wait" : "pointer" }}>Verify</button></div>
                <select required value={profileForm.payoutBankCode} onChange={(event) => { const selected = banks.find(([, code]) => code === event.target.value); setProfileForm({ ...profileForm, payoutBankCode: event.target.value, payoutBank: selected?.[0] || "", verifiedAccountName: "" }); }} style={fieldStyle}>
                  <option value="">Select bank</option>
                  {banks.map(([name, code]) => <option key={name} value={code}>{name}</option>)}
                </select>
                <p style={{ margin: "-4px 0 0", color: "#64748b", fontSize: ".78rem", lineHeight: 1.4 }}>Use the legal account-holder name connected to this vendor account. The admin will verify the account details before approval.</p>
                <select required value={profileForm.payoutCurrency} onChange={(event) => setProfileForm({ ...profileForm, payoutCurrency: event.target.value })} style={fieldStyle}>
                  {currencies.map((currency) => <option key={currency}>{currency}</option>)}
                </select>
              </>
            )}
            {authMode === "sign-up" && (
              <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", color: "#334155", fontSize: ".82rem", lineHeight: 1.45 }}>
                <input type="checkbox" name="vendor-terms-acceptance" required checked={vendorTermsAccepted} onChange={(event) => setVendorTermsAccepted(event.target.checked)} aria-label="Accept Vendor Marketplace Terms" style={{ appearance: "none", width: "15px", height: "15px", flex: "0 0 15px", marginTop: "3px", border: "2px solid #166534", borderRadius: "50%", background: vendorTermsAccepted ? "#166534" : "#fff", boxShadow: vendorTermsAccepted ? "inset 0 0 0 3px #fff" : "none", cursor: "pointer" }} />
                <span>I agree to the <button type="button" onClick={() => setVendorTermsOpen(true)} style={{ border: 0, padding: 0, background: "none", color: "#166534", font: "inherit", fontWeight: 800, textDecoration: "underline", cursor: "pointer" }}>Vendor Marketplace Terms</button>, including PAZ's mandatory 15% commission on every paid product sale.</span>
              </label>
            )}
            <button
              disabled={saving || (authMode === "sign-up" && !canCreateVendorAccount)}
              style={{
                padding: "12px",
                background: "#166534",
                color: "#fff",
                border: 0,
                borderRadius: "9px",
                fontWeight: 800,
                opacity: saving || (authMode === "sign-up" && !canCreateVendorAccount) ? 0.55 : 1,
                cursor: saving || (authMode === "sign-up" && !canCreateVendorAccount) ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Please wait..." : authMode === "sign-in" ? "Sign in" : authMode === "reset" ? "Send reset link" : "Create account"}
            </button>
          </div>
          {notice && <div role="status" aria-live="polite" style={{ position: "fixed", top: "20px", right: "20px", zIndex: 100, width: "min(380px, calc(100vw - 40px))", padding: "13px 16px", borderRadius: "10px", border: `1px solid ${notice.type === "error" ? "#fecaca" : "#bbf7d0"}`, background: notice.type === "error" ? "#fef2f2" : "#ecfdf5", color: notice.type === "error" ? "#b91c1c" : "#166534", boxShadow: "0 12px 28px rgba(15, 23, 42, .16)", fontWeight: 700 }}>{notice.text}</div>}
          {authMode === "sign-in" && (
            <button
              type="button"
              onClick={() => { setAuthMode("reset"); setNotice(null); }}
              style={{ marginTop: "12px", border: 0, background: "none", color: "#c2410c", fontWeight: 700 }}
            >
              Forgot password?
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              const openingSignup = authMode === "sign-in";
              setAuthMode(openingSignup ? "sign-up" : "sign-in");
              if (openingSignup) setVendorTermsAccepted(false);
            }}
            style={{
              marginTop: "12px",
              border: 0,
              background: "none",
              color: "#166534",
              fontWeight: 700,
            }}
          >
            {authMode === "sign-in" ? "Create a vendor account" : "Return to sign in"}
          </button>
        </form>
        {vendorTermsOpen && (
          <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setVendorTermsOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center", padding: "20px", background: "rgba(15, 23, 42, .58)" }}>
            <section role="dialog" aria-modal="true" aria-labelledby="vendor-terms-title" style={{ width: "min(680px, 100%)", maxHeight: "min(760px, 90vh)", overflow: "auto", background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 24px 60px rgba(15,23,42,.25)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px" }}>
                <div><p style={{ margin: 0, color: "#15803d", fontSize: ".72rem", fontWeight: 800, letterSpacing: ".12em" }}>VERSION {vendorTermsVersion}</p><h2 id="vendor-terms-title" style={{ margin: "6px 0 0" }}>Vendor Marketplace Terms</h2></div>
                <button type="button" onClick={() => setVendorTermsOpen(false)} aria-label="Close Vendor Marketplace Terms" style={{ border: "1px solid #cbd5e1", borderRadius: "8px", background: "#fff", padding: "6px 10px", fontSize: "1.1rem", cursor: "pointer" }}>×</button>
              </div>
              <p style={{ color: "#475569", lineHeight: 1.55 }}>Please review these terms before creating or continuing to use a PAZ vendor account.</p>
              <div style={{ display: "grid", gap: "16px", color: "#334155", lineHeight: 1.55 }}>{vendorTermsSections.map(([heading, text]) => <div key={heading}><h3 style={{ margin: 0, fontSize: "1rem", color: "#0f172a" }}>{heading}</h3><p style={{ margin: "4px 0 0" }}>{text}</p></div>)}</div>
              <button type="button" onClick={() => { setVendorTermsAccepted(true); setVendorTermsOpen(false); }} style={{ marginTop: "20px", width: "100%", border: 0, borderRadius: "9px", padding: "12px", background: "#166534", color: "#fff", fontWeight: 800, cursor: "pointer" }}>I understand and accept these terms</button>
            </section>
          </div>
        )}
      </main>
    );
  if (loading)
    return (
      <div className="app-preloader-overlay" role="alert" aria-busy="true">
        <div className="app-preloader-box">
          <img
            src="/logo/logomain.png"
            alt="Paz Thriving Tribe logo"
            className="app-preloader-logo"
          />
          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.6" }}>
            Loading vendor dashboard...
          </p>
        </div>
      </div>
    );

  return (
    <main
      className={`vendor-dashboard-theme vendor-dashboard-theme-${vendorTheme}`}
      style={{
        minHeight: "100vh",
        background: "#f1f5f3",
        padding: "28px 20px 48px",
      }}
    >
      <style>{`
        .vendor-dashboard-theme{--vendor-bg:#f1f5f3;--vendor-surface:#fff;--vendor-soft:#f8fffb;--vendor-text:#0f172a;--vendor-muted:#64748b;--vendor-border:#dbe7df;--vendor-accent:#166534;--vendor-accent-soft:#ecfdf5;--vendor-input:#fff;color:var(--vendor-text);background:var(--vendor-bg)!important;transition:background .2s ease,color .2s ease}
        .vendor-dashboard-theme-dark{--vendor-bg:#17212b;--vendor-surface:#202d38;--vendor-soft:#263743;--vendor-text:#f1f5f9;--vendor-muted:#b6c4cf;--vendor-border:#405563;--vendor-accent:#86efac;--vendor-accent-soft:#234b3b;--vendor-input:#263743}
        .vendor-dashboard-theme-sage{--vendor-bg:#e7f4ed;--vendor-surface:#fbfffc;--vendor-soft:#effaf3;--vendor-text:#16352b;--vendor-muted:#527066;--vendor-border:#b9dac8;--vendor-accent:#0f766e;--vendor-accent-soft:#dff8ef;--vendor-input:#fff}
        .vendor-dashboard-theme-coral{--vendor-bg:#fff1ec;--vendor-surface:#fffdfc;--vendor-soft:#fff7f3;--vendor-text:#42251f;--vendor-muted:#86645d;--vendor-border:#f2c8bb;--vendor-accent:#c2412d;--vendor-accent-soft:#ffe4dc;--vendor-input:#fff}
        .vendor-dashboard-theme-gold{--vendor-bg:#fff8e7;--vendor-surface:#fffefa;--vendor-soft:#fffaf0;--vendor-text:#3f3217;--vendor-muted:#806d43;--vendor-border:#ead79f;--vendor-accent:#a16207;--vendor-accent-soft:#fff1c7;--vendor-input:#fff}
        .vendor-dashboard-theme>div>header h1,.vendor-dashboard-theme h2,.vendor-dashboard-theme h3,.vendor-dashboard-theme strong{color:var(--vendor-text)}
        .vendor-dashboard-theme p,.vendor-dashboard-theme small,.vendor-dashboard-theme label,.vendor-dashboard-theme [style*="color: #64748b"],.vendor-dashboard-theme [style*="color: \"#64748b\""],.vendor-dashboard-theme [style*="color: #475569"]{color:var(--vendor-muted)!important}
        .vendor-dashboard-theme>div>section>button,.vendor-dashboard-theme button[aria-label^="Open"]{background:var(--vendor-accent)!important;color:#fff!important}
        .vendor-dashboard-theme form,.vendor-dashboard-theme section[style*="background: #fff"],.vendor-dashboard-theme section[style*="background: \"#fff\""],.vendor-dashboard-theme [style*="background: #fff"],.vendor-dashboard-theme [style*="background: #f8fffb"],.vendor-dashboard-theme [style*="background: \"#f8fffb\""]{background:var(--vendor-surface)!important;border-color:var(--vendor-border)!important;color:var(--vendor-text)!important}
        .vendor-dashboard-theme input,.vendor-dashboard-theme textarea,.vendor-dashboard-theme select{background:var(--vendor-input)!important;color:var(--vendor-text)!important;border-color:var(--vendor-border)!important}
        .vendor-dashboard-theme button{color:var(--vendor-text)}
        .vendor-dashboard-theme button[style*="background: #166534"],.vendor-dashboard-theme button[style*="background: \"#166534\""],.vendor-dashboard-theme button[style*="background: linear-gradient"]{background:var(--vendor-accent)!important;color:#fff!important}
        .vendor-dashboard-theme .vendor-dashboard-mobile-toggle,.vendor-dashboard-theme .vendor-dashboard-mobile-menu,.vendor-dashboard-theme .vendor-dashboard-mobile-menu button{background:var(--vendor-surface)!important;color:var(--vendor-text)!important;border-color:var(--vendor-border)!important}
        .vendor-dashboard-theme .vendor-dashboard-mobile-menu button:last-child{color:#b91c1c!important}
        .vendor-dashboard-theme .vendor-settings-button{background:var(--vendor-surface)!important;color:var(--vendor-text)!important;border-color:var(--vendor-border)!important}
        .vendor-dashboard-theme .vendor-settings-button[aria-pressed="true"]{background:var(--vendor-accent)!important;color:#fff!important}
        .vendor-theme-choice{display:grid;gap:5px;text-align:left;padding:12px;border:2px solid var(--vendor-border);border-radius:12px;background:var(--vendor-surface);color:var(--vendor-text);cursor:pointer;font:inherit}
        .vendor-theme-choice[aria-pressed="true"]{border-color:var(--vendor-accent);box-shadow:0 0 0 3px color-mix(in srgb, var(--vendor-accent) 18%, transparent)}
        .vendor-theme-swatch{width:30px;height:30px;border-radius:9px;border:2px solid rgba(15,23,42,.12)}
        @media(max-width:640px){.vendor-theme-choice{grid-template-columns:30px minmax(0,1fr);align-items:center;padding:10px}.vendor-theme-choice small{grid-column:2}.vendor-theme-choice:first-child,.vendor-theme-choice:nth-child(2){grid-column:span 1}.vendor-theme-swatch{grid-row:span 2}}
        .vendor-dashboard-header{position:relative;display:flex;justify-content:space-between;align-items:flex-start;gap:18px;flex-wrap:wrap}
        .vendor-dashboard-header-copy{min-width:0}
        .vendor-dashboard-header-actions{position:relative;display:flex;align-items:center;gap:8px;flex-shrink:0}
        .vendor-dashboard-monitor-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:24px}
        .vendor-dashboard-mobile-toggle{display:none}
        .vendor-dashboard-mobile-menu{display:none}
        @media(max-width:640px){
          .vendor-dashboard-header{align-items:center;gap:10px;flex-wrap:nowrap}
          .vendor-dashboard-header-copy{flex:1;min-width:0}
          .vendor-dashboard-header-copy h1{margin:5px 0 0;font-size:1.35rem;line-height:1.2;overflow-wrap:anywhere}
          .vendor-dashboard-header-copy>p:last-child{margin:5px 0 0;font-size:.82rem}
          .vendor-dashboard-header-actions{gap:0}
          .vendor-dashboard-monitor-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:24px}
          .vendor-dashboard-header-actions>.vendor-settings-button,.vendor-dashboard-header-actions>.vendor-signout-button{display:none!important}
          .vendor-dashboard-mobile-toggle{display:inline-grid;place-items:center;width:42px;height:42px;border:1px solid #cbd5e1;border-radius:10px;background:#fff;color:#166534;font-size:1.15rem;cursor:pointer}
          .vendor-dashboard-mobile-menu{position:absolute;top:calc(100% + 10px);right:0;z-index:20;display:grid;gap:6px;width:min(220px,calc(100vw - 40px));padding:8px;background:#fff;border:1px solid #dbe7df;border-radius:12px;box-shadow:0 16px 32px rgba(15,23,42,.14)}
          .vendor-dashboard-mobile-menu button{width:100%;min-height:42px;padding:0 12px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;color:#0f172a;text-align:left;font:inherit;font-weight:700;cursor:pointer}
          .vendor-dashboard-mobile-menu button:last-child{color:#b91c1c;background:#fff7f7}
        }
      `}</style>
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <header
          className="vendor-dashboard-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div className="vendor-dashboard-header-copy">
            <p
              style={{
                margin: 0,
                color: "#15803d",
                fontWeight: 800,
                letterSpacing: ".12em",
              }}
            >
              VENDOR WORKSPACE
            </p>
            <h1>{profile?.username ? `Welcome, ${profile.username}` : profile?.company_name || "Complete your vendor profile"}</h1>
            <p style={{ color: "#64748b" }}>
              {profile?.username && profile?.company_name ? `${profile.company_name} · ` : ""}
              {profile?.status === "approved" ? "Verified vendor" : "Pending admin verification"}
            </p>
          </div>
          <div className="vendor-dashboard-header-actions">
            <button className="vendor-settings-button" type="button" onClick={() => setSettingsOpen((current) => !current)} aria-pressed={settingsOpen} aria-label="Open vendor settings" title="Vendor settings" style={{ width: "40px", height: "40px", border: "1px solid #cbd5e1", borderRadius: "9px", background: settingsOpen ? "#166534" : "#fff", color: settingsOpen ? "#fff" : "#0f172a", fontSize: "1.15rem" }}>⚙</button>
            <button
              className="vendor-signout-button"
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                setSession(null);
                navigate("/vendor");
              }}
              style={{ height: "40px", padding: "0 14px", border: "1px solid #cbd5e1", borderRadius: "9px", background: "#fff", fontWeight: 700 }}
            >
              Sign out
            </button>
            <button
              className="vendor-dashboard-mobile-toggle"
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              aria-expanded={mobileMenuOpen}
              aria-label="Open vendor workspace menu"
            >
              <i className={mobileMenuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"} aria-hidden="true" />
            </button>
            {mobileMenuOpen && (
              <div className="vendor-dashboard-mobile-menu">
                <button
                  type="button"
                  onClick={() => {
                    setSettingsOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  <i className="fa-solid fa-gear" aria-hidden="true" /> Settings
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setSession(null);
                    navigate("/vendor");
                  }}
                >
                  <i className="fa-solid fa-right-from-bracket" aria-hidden="true" /> Sign out
                </button>
              </div>
            )}
          </div>
        </header>
        {notice && (
          <div role="status" aria-live="polite" style={{ position: "fixed", top: "20px", right: "20px", zIndex: 100, width: "min(380px, calc(100vw - 40px))", padding: "13px 16px", borderRadius: "10px", border: `1px solid ${notice.type === "error" ? "#fecaca" : "#bbf7d0"}`, background: notice.type === "error" ? "#fef2f2" : "#ecfdf5", color: notice.type === "error" ? "#b91c1c" : "#166534", boxShadow: "0 12px 28px rgba(15, 23, 42, .16)", fontWeight: 700 }}>
            {notice.text}
          </div>
        )}
        <section className="vendor-dashboard-monitor-grid">
          {[
            ["Products", products.length, "products"],
            ["Sales", sales.length, "sales"],
            [
              "Earnings",
              money(totalEarnings, profile?.payout_currency || "NGN"),
              "earnings",
            ],
            ["Ads", ads.length, "ads"],
          ].map(([label, value, targetTab]) => (
            <button
              key={label}
              type="button"
              onClick={() => focusVendorSection(targetTab)}
              aria-label={`Open ${label}`}
              style={{
                width: "100%",
                border: 0,
                textAlign: "left",
                padding: "18px",
                borderRadius: "14px",
                background: "#166534",
                color: "#fff",
                cursor: "pointer",
                font: "inherit",
              }}
            >
              <div style={{ fontSize: ".75rem", opacity: 0.8 }}>{label}</div>
              <strong
                style={{
                  display: "block",
                  marginTop: "8px",
                  fontSize: "1.5rem",
                }}
              >
                {value}
              </strong>
            </button>
          ))}
        </section>
        {settingsOpen && <form
          onSubmit={saveProfile}
          style={{
            marginTop: "22px",
            display: "grid",
            gap: "10px",
            background: "#fff",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid #dbe7df",
            boxShadow: "0 12px 30px rgba(15, 23, 42, .06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px", flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: 0, color: "#15803d", fontSize: ".72rem", fontWeight: 800, letterSpacing: ".12em" }}>VENDOR SETTINGS</p>
              <h2 style={{ marginBottom: "6px" }}>Profile, verification and payout</h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: ".85rem" }}>Business identity and login email are locked. Update your phone and choose the account to use for payouts below.</p>
            </div>
            <button type="button" onClick={() => setSettingsOpen(false)} style={{ display: "inline-flex", alignItems: "center", gap: "7px", border: "1px solid #cbd5e1", borderRadius: "9px", padding: "9px 12px", background: "#fff", color: "#166534", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to preview
            </button>
          </div>
          <section style={{ display: "grid", gap: "10px", padding: "14px", border: "1px solid #dbe7df", borderRadius: "12px", background: "#f8fffb" }}>
            <div>
              <strong>Preferences</strong>
              <p style={{ margin: "4px 0 0", fontSize: ".8rem" }}>Choose your vendor dashboard theme. This preference is saved on this browser.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: "8px" }}>
              {vendorThemes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className="vendor-theme-choice"
                  aria-pressed={vendorTheme === theme.id}
                  onClick={() => setVendorTheme(theme.id)}
                >
                  <span className="vendor-theme-swatch" style={{ background: theme.swatch }} aria-hidden="true" />
                  <strong>{theme.label}</strong>
                  <small>{theme.description}</small>
                </button>
              ))}
            </div>
          </section>
          {profile?.id_document_path && (
            <section style={{ padding: "14px", border: "1px solid #dbe7df", borderRadius: "12px", background: "#f8fffb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <div><strong>Identity document</strong><p style={{ margin: "4px 0 0", color: "#64748b", fontSize: ".8rem" }}>Your submitted verification document.</p></div>
                {documentPreviewUrl && <button type="button" onClick={() => setDocumentPreviewOpen((current) => !current)} style={{ border: "1px solid #0f766e", borderRadius: "8px", background: documentPreviewOpen ? "#dff8ef" : "#fff", color: "#0f766e", padding: "8px 11px", fontWeight: 800, cursor: "pointer" }}>{documentPreviewOpen ? "Hide document" : "Preview document"}</button>}
              </div>
              {documentPreviewOpen && documentPreviewUrl && <iframe title="Your vendor identity document" src={documentPreviewUrl} style={{ display: "block", width: "100%", height: "340px", marginTop: "12px", border: "1px solid #dbe7df", borderRadius: "8px", background: "#fff" }} />}
            </section>
          )}
          <section style={{ display: "grid", gap: "10px", padding: "16px", border: "1px solid #dbe7df", borderRadius: "12px", background: "#f8fffb" }}>
            <div>
              <strong>Account security</strong>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: ".8rem", lineHeight: 1.45 }}>Manage the password and 4-digit PIN used to protect your vendor workspace.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
              <button type="button" onClick={sendPasswordChangeEmail} disabled={saving} style={{ padding: "11px 12px", border: "1px solid #166534", borderRadius: "9px", background: "#fff", color: "#166534", fontWeight: 800, cursor: saving ? "wait" : "pointer" }}>
                <i className="fa-solid fa-envelope" aria-hidden="true" /> Change password
              </button>
              <button type="button" onClick={startPinChange} disabled={saving} style={{ padding: "11px 12px", border: "1px solid #0f766e", borderRadius: "9px", background: "#fff", color: "#0f766e", fontWeight: 800, cursor: saving ? "wait" : "pointer" }}>
                <i className="fa-solid fa-key" aria-hidden="true" /> Change PIN
              </button>
            </div>
          </section>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "12px",
            }}
          >
            <input required placeholder="Username (locked)" value={profileForm.username} readOnly style={{ ...fieldStyle, background: "#f1f5f9", color: "#475569" }} />
            <input required placeholder="Business name (locked)" value={profileForm.companyName} readOnly style={{ ...fieldStyle, background: "#f1f5f9", color: "#475569" }} />
            <input required type="email" placeholder="Email (locked)" value={profile?.contact_email || session.user.email || ""} readOnly style={{ ...fieldStyle, background: "#f1f5f9", color: "#475569" }} />
            <input placeholder="Phone number" value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} style={fieldStyle} />
            <label onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files?.[0]; if (file?.type.startsWith("image/")) setProfileForm({ ...profileForm, logoFile: file }); }} style={{ display: "grid", gap: "7px", alignContent: "center", minHeight: "142px", padding: "12px", border: "1px dashed #86efac", borderRadius: "10px", background: "#f0fdf4", color: "#166534", textAlign: "center", cursor: "copy" }}>
              {logoDisplayUrl ? <img src={logoDisplayUrl} alt="Business logo thumbnail" style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "12px", justifySelf: "center", border: "1px solid #bbf7d0" }} /> : <strong>Drag business logo here</strong>}
              <strong style={{ fontSize: ".82rem", wordBreak: "break-word" }}>{profileForm.logoFile?.name || (profileForm.logoUrl ? "Current logo" : "Drag or choose a logo")}</strong>
              <span style={{ fontSize: ".72rem", color: "#4d7c5c" }}>{profileForm.logoFile ? `${Math.ceil(profileForm.logoFile.size / 1024)} KB · ready to upload` : profileForm.logoUrl ? "Stored logo preview" : "PNG, JPG, or WebP"}</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setProfileForm({ ...profileForm, logoFile: event.target.files?.[0] || null })} style={{ display: "none" }} />
            </label>
            <select
              value={profileForm.idType}
              onChange={(event) =>
                setProfileForm({ ...profileForm, idType: event.target.value })
              }
              style={fieldStyle}
            >
              <option>National ID</option>
              <option>Passport</option>
              <option>Driver's licence</option>
              <option>Business registration</option>
            </select>
            <label onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files?.[0]; if (file?.type.startsWith("image/") || file?.type === "application/pdf") setProfileForm({ ...profileForm, idDocument: file }); }} style={{ display: "grid", gap: "7px", alignContent: "center", minHeight: "142px", padding: "12px", border: "1px dashed #93c5fd", borderRadius: "10px", background: "#eff6ff", color: "#1d4ed8", textAlign: "center", cursor: "copy" }}>
              {identityImageDisplayUrl ? <img src={identityImageDisplayUrl} alt="Identity document thumbnail" style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "10px", justifySelf: "center", border: "1px solid #bfdbfe" }} /> : <span style={{ fontSize: "2rem" }} aria-hidden="true">📄</span>}
              <strong style={{ fontSize: ".82rem", wordBreak: "break-word" }}>{profileForm.idDocument?.name || (profile?.id_document_path ? profile.id_document_path.split("/").pop() : "Drag or choose ID")}</strong>
              <span style={{ fontSize: ".72rem", color: "#416db1" }}>{profileForm.idDocument ? `${Math.ceil(profileForm.idDocument.size / 1024)} KB · ready to upload` : profile?.id_document_path ? "Stored document · preview available" : "Image or PDF"}</span>
              <input type="file" accept="image/*,.pdf" onChange={(event) => setProfileForm({ ...profileForm, idDocument: event.target.files?.[0] || null })} style={{ display: "none" }} />
            </label>
            <input
              placeholder="Payout account name"
              required
              value={profileForm.payoutName}
              readOnly={Boolean(profileForm.verifiedAccountName)}
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  payoutName: event.target.value,
                })
              }
              style={{ ...fieldStyle, background: profileForm.verifiedAccountName ? "#ecfdf5" : "#fff" }}
            />
            <input
              placeholder="Payout account number"
              required
              inputMode="numeric"
              value={profileForm.payoutAccount}
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  payoutAccount: event.target.value.replace(/\D/g, ""),
                  verifiedAccountName: "",
                })
              }
              style={fieldStyle}
            />
            <button type="button" onClick={verifyBankAccount} disabled={saving} style={{ width: "100%", border: 0, borderRadius: "9px", padding: "11px 12px", background: "#0f766e", color: "#fff", fontWeight: 800, cursor: saving ? "wait" : "pointer" }}>Verify account name</button>
            <select
              required
              value={profileForm.payoutBankCode}
              onChange={(event) => { const selected = banks.find(([, code]) => code === event.target.value); setProfileForm({ ...profileForm, payoutBankCode: event.target.value, payoutBank: selected?.[0] || "", verifiedAccountName: "" }); }}
              style={fieldStyle}
            >
              <option value="">Select bank</option>
              {banks.map(([name, code]) => <option key={name} value={code}>{name}</option>)}
            </select>
            <label style={{ display: "grid", gap: "6px" }}>
              <span style={{ color: "#334155", fontWeight: 800 }}>
                Receive payouts in
              </span>
              <select
                value={profileForm.payoutCurrency}
                onChange={(event) => {
                  const nextCurrency = event.target.value;
                  setProfileForm({ ...profileForm, payoutCurrency: nextCurrency });
                  setProductForm((current) => ({ ...current, currency: nextCurrency }));
                }}
                aria-label="Receive payouts in"
                style={fieldStyle}
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
              <span style={{ color: "#64748b", fontSize: ".78rem", lineHeight: 1.4 }}>
                Choose the currency PAZ should use when recording your vendor earnings.
              </span>
            </label>
          </div>
          <section style={{ display: "grid", gap: "8px", padding: "14px", border: "1px solid #dbe7df", borderRadius: "12px", background: "#f8fffb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <div><strong>Payout accounts</strong><p style={{ margin: "4px 0 0", color: "#64748b", fontSize: ".8rem" }}>Select the account PAZ should use for your payouts.</p></div>
              <button type="button" onClick={() => setProfileForm({ ...profileForm, selectedPayoutAccountId: `new-${Date.now()}`, payoutName: "", payoutAccount: "", payoutBank: "", payoutBankCode: "", payoutCurrency: "NGN", verifiedAccountName: "" })} style={{ border: "1px solid #0f766e", borderRadius: "8px", background: "#fff", color: "#0f766e", padding: "8px 10px", fontWeight: 800 }}>Add another account</button>
            </div>
            {(profileForm.payoutAccounts || []).map((account) => (
              <button key={account.id} type="button" onClick={() => setProfileForm({ ...profileForm, selectedPayoutAccountId: account.id, payoutName: account.accountName || "", payoutAccount: account.accountNumber || "", payoutBank: account.bankName || "", payoutBankCode: banks.find(([name]) => name === account.bankName)?.[1] || "", payoutCurrency: account.currency || "NGN", verifiedAccountName: account.verified ? account.accountName || "verified" : "" })} style={{ display: "flex", justifyContent: "space-between", gap: "10px", textAlign: "left", padding: "10px 12px", border: "1px solid", borderColor: profileForm.selectedPayoutAccountId === account.id ? "#0f766e" : "#cbd5e1", borderRadius: "9px", background: profileForm.selectedPayoutAccountId === account.id ? "#ecfdf5" : "#fff", color: "#334155" }}><span><strong>{account.accountName || "Account holder"}</strong><br /><small>{account.bankName || "Bank"} · {account.accountNumber || "Account number"} · {account.currency || "NGN"}</small></span><span>{profileForm.selectedPayoutAccountId === account.id ? "Selected for payout" : "Use this account"}</span></button>
            ))}
          </section>
          <button
            disabled={saving}
            style={{
              width: "fit-content",
              padding: "11px 16px",
              border: 0,
              borderRadius: "9px",
              background: "#f97316",
              color: "#fff",
              fontWeight: 800,
            }}
          >
            {profile?.id ? "Update profile" : "Save verification details"}
          </button>
        </form>}
        {!settingsOpen && <div ref={dashboardContentRef}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px", marginTop: "22px" }}>
          {["products", "sales", "earnings", "ads"].map((sectionTab) => (
            <button
              key={sectionTab}
              type="button"
              onClick={() => focusVendorSection(sectionTab)}
              style={{
                padding: "12px 8px",
                border: "1px solid #cbd5e1",
                borderRadius: "9px",
                background: tab === sectionTab ? "#166534" : "#fff",
                color: tab === sectionTab ? "#fff" : "#334155",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {sectionTab[0].toUpperCase() + sectionTab.slice(1)}
            </button>
          ))}
        </div>
        {tab === "products" ? (
          <section
            style={{
              marginTop: "14px",
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
              border: "1px solid #dfe7ef",
              boxShadow: "0 12px 28px rgba(15, 23, 42, .06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "18px" }}><div><p style={{ margin: 0, color: "#f59e0b", textTransform: "uppercase", letterSpacing: ".12em", fontSize: ".7rem", fontWeight: 800 }}>Storefront</p><h2 style={{ margin: "6px 0 0", color: "#111827", fontSize: "1.35rem" }}>Product manager</h2></div><span style={{ background: "#fff7ed", color: "#b45309", border: "1px solid #fed7aa", borderRadius: "999px", padding: "7px 11px", fontSize: ".74rem", fontWeight: 800 }}>{products.length} products</span></div>
            {profile?.status === "approved" ? (
              <form
                onSubmit={publishProduct}
                style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}
              >
                <input
                  required
                  placeholder="Product title"
                  value={productForm.title}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      title: event.target.value,
                    })
                  }
                  style={{ ...productFieldStyle, gridColumn: "1", gridRow: "1" }}
                />
                <textarea
                  required
                  placeholder="Description"
                  value={productForm.description}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      description: event.target.value,
                    })
                  }
                  style={{ ...productFieldStyle, minHeight: "58px", gridColumn: "1 / -1", gridRow: "2", resize: "vertical" }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: "7px", gridColumn: "1", gridRow: "3" }}>
                  <span aria-hidden="true" style={{ display: "grid", placeItems: "center", minWidth: "42px", height: "32px", color: "#475569", fontWeight: 800, fontSize: ".78rem" }}>{accountCurrency}</span>
                  <input
                    required
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="Enter amount"
                    aria-label="Product price amount"
                    value={productForm.price}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        price: event.target.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"),
                      })
                    }
                    style={{ ...productFieldStyle, width: "100%" }}
                  />
                </div>
                <div style={{ ...productFieldStyle, gridColumn: "2", gridRow: "3", display: "flex", alignItems: "center", color: "#475569", background: "#f8fafc", fontWeight: 800 }}>
                  Product currency: {accountCurrency}
                </div>
                <select
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      category: event.target.value,
                    })
                  }
                  style={{ ...productFieldStyle, gridColumn: "2", gridRow: "1" }}
                >
                  {["Ebook", "Planner", "Guide", "Workbook", "Journal", "Course", "Audio", "Bundle"].map((category) => <option key={category}>{category}</option>)}
                </select>
                <label style={{ display: "flex", alignItems: "center", gap: "7px", color: "#334155", fontWeight: 700, fontSize: ".7rem", gridColumn: "1 / -1", gridRow: "4" }}>
                  <input type="checkbox" checked={productForm.isFree} onChange={(event) => setProductForm({ ...productForm, isFree: event.target.checked, price: event.target.checked ? "0" : (Number(productForm.price) > 0 ? productForm.price : "1") })} />
                  Free product (email delivery without Paystack)
                </label>
                <select value={productForm.inStock ? "available" : "out-of-stock"} onChange={(event) => setProductForm({ ...productForm, inStock: event.target.value === "available" })} aria-label="Stock status" style={{ ...productFieldStyle, gridColumn: "1", gridRow: "5" }}>
                  <option value="available">Available</option>
                  <option value="out-of-stock">Out of stock</option>
                </select>
                <div style={{ display: "grid", gap: "8px", gridColumn: "2", gridRow: "5" }}>
                  <input type="number" min="0" value={productForm.stockCount} onChange={(event) => setProductForm({ ...productForm, stockCount: event.target.value })} placeholder="Stock count" style={productFieldStyle} />
                </div>
                <label style={{ display: "grid", gap: "4px", color: "#475569", fontSize: ".68rem", fontWeight: 700, gridColumn: "1", gridRow: "6" }}>
                  Cover image
                  <span onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files?.[0]; if (file) uploadCover({ target: { files: [file] } }); }} style={{ display: "grid", placeItems: "center", gap: "4px", minHeight: "38px", padding: "6px 8px", border: "1px dashed #cbd5e1", borderRadius: "9px", background: "#f8fafc", color: "#475569", cursor: "copy", textAlign: "center", fontSize: ".72rem" }}>
                    {coverPreviewUrl || (productForm.cover && productForm.cover !== "/logo/logomain.png") ? <img src={coverPreviewUrl || productForm.cover} alt="Product cover preview" style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "7px" }} /> : null}
                    <strong>{coverFile?.name || (productForm.cover && productForm.cover !== "/logo/logomain.png" ? "Current cover image" : "Drag image here or click to choose")}</strong>
                    <input type="file" accept="image/*" onChange={uploadCover} style={{ display: "none" }} />
                  </span>
                </label>
                <label
                  aria-label="Product file"
                  onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }}
                  onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files?.[0]; if (file) { setProductFile(file); uploadProduct({ target: { files: [file] } }); } }}
                  style={{ display: "grid", gap: "4px", alignContent: "center", minHeight: "38px", marginTop: "16px", padding: "6px 8px", border: "1px dashed #cbd5e1", borderRadius: "9px", background: "#f8fafc", color: "#475569", textAlign: "center", cursor: "copy", gridColumn: "2", gridRow: "3", fontSize: ".72rem" }}
                >
                  {productFilePreviewUrl && productFile?.type.startsWith("image/") ? <img src={productFilePreviewUrl} alt="Product file thumbnail" style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "7px", justifySelf: "center" }} /> : null}
                  <strong>{productFile?.name || (productForm.fileUrl ? productForm.fileUrl.split("/").pop() : "Drag PDF or ZIP here, or click to choose")}</strong>
                  <span style={{ fontSize: ".66rem", color: "#64748b" }}>{productFile ? `${Math.ceil(productFile.size / 1024)} KB · ready to upload` : productForm.fileUrl ? "Existing product file" : ""}</span>
                  <input type="file" accept=".pdf,.zip" required={!editingProductId && !productForm.fileUrl} onChange={uploadProduct} style={{ display: "none" }} />
                </label>
                <button
                  disabled={saving}
                  style={{
                    padding: "11px",
                    border: 0,
                    borderRadius: "9px",
                    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                    color: "#fff",
                    fontWeight: 800,
                    gridColumn: "2",
                    gridRow: "6",
                    boxShadow: "0 8px 16px rgba(245, 158, 11, .2)",
                  }}
                >
                  {editingProductId ? "Save product changes" : "Publish product"}
                </button>
                {editingProductId && <button type="button" onClick={() => { setEditingProductId(null); setProductFile(null); setCoverFile(null); setProductForm({ title: "", description: "", price: "", currency: "NGN", category: "Ebook", fileUrl: "", cover: "/logo/logomain.png", isFree: false, stockCount: "1", inStock: true }); }} style={{ padding: "11px", border: "1px solid #cbd5e1", borderRadius: "9px", background: "#fff", color: "#334155", fontWeight: 800 }}>Cancel edit</button>}
              </form>
            ) : (
              <p
                style={{
                  color: "#92400e",
                  background: "#fff7ed",
                  padding: "12px",
                  borderRadius: "9px",
                }}
              >
                Your account must be approved before you can publish products.
              </p>
            )}
            <div style={{ marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "12px" }}><div style={{ fontSize: ".8rem", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#64748b" }}>Your products and review status</div><button type="button" onClick={refreshProducts} disabled={productsRefreshing} aria-label="Refresh product verification statuses" title="Refresh product verification statuses" style={{ display: "inline-grid", placeItems: "center", width: "36px", height: "36px", flex: "0 0 36px", border: "1px solid #0f766e", borderRadius: "50%", background: "#fff", color: "#0f766e", fontSize: "1.15rem", fontWeight: 900, cursor: productsRefreshing ? "wait" : "pointer", opacity: productsRefreshing ? .65 : 1 }}>{productsRefreshing ? "..." : "↻"}</button></div>
              {products.length ? products.map((product) => (
                <div
                  key={product.id}
                  style={{
                    display: "grid",
                    gap: "8px",
                    padding: "14px 0",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    paddingLeft: "12px",
                    paddingRight: "12px",
                    marginBottom: "10px",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}><img src={product.cover || "/logo/logomain.png"} alt="" style={{ width: "58px", height: "58px", objectFit: "cover", borderRadius: "9px", border: "1px solid #e2e8f0" }} /><div style={{ minWidth: 0, flex: 1 }}><div style={{ display: "flex", alignItems: "center", gap: "7px" }}><strong>{product.title}</strong><button type="button" onClick={() => refreshProductStatus(product.id)} disabled={refreshingProductId === product.id} aria-label={`Refresh ${product.title} verification status`} title="Refresh this product verification status" style={{ display: "inline-grid", placeItems: "center", width: "27px", height: "27px", flex: "0 0 27px", border: "1px solid #0f766e", borderRadius: "50%", background: "#fff", color: "#0f766e", fontSize: "1rem", fontWeight: 900, cursor: refreshingProductId === product.id ? "wait" : "pointer", opacity: refreshingProductId === product.id ? .6 : 1 }}>{refreshingProductId === product.id ? "..." : "↻"}</button></div><div style={{ color: "#64748b", fontSize: ".82rem", marginTop: "3px" }}>{product.is_free ? "Free" : `${product.currency} ${product.price}`} · {product.category || "Product"}</div><div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}><span style={{ color: product.in_stock === false ? "#b91c1c" : "#166534", fontSize: ".8rem", fontWeight: 800 }}>{product.in_stock === false ? "Sold out" : `Available · ${product.stock_count ?? 0} in stock`}</span><span style={{ color: product.status === "published" ? "#166534" : product.status === "rejected" ? "#b91c1c" : product.status === "approved" ? "#0369a1" : "#b45309", fontSize: ".8rem", fontWeight: 800 }}>· {product.status === "published" ? "Published in shop" : product.status === "approved" ? "Admin approved · awaiting publish" : product.status === "rejected" ? "Rejected by admin" : "Awaiting admin review"}</span><span style={{ color: product.name_verified ? "#166534" : "#64748b", fontSize: ".8rem", fontWeight: 800 }}>· Name {product.name_verified ? "verified" : "not verified yet"}</span><span style={{ color: product.description_verified ? "#166534" : "#64748b", fontSize: ".8rem", fontWeight: 800 }}>· Description {product.description_verified ? "verified" : "not verified yet"}</span><span style={{ color: product.cover_verified ? "#166534" : "#64748b", fontSize: ".8rem", fontWeight: 800 }}>· Cover {product.cover_verified ? "verified" : "not verified yet"}</span><span style={{ color: product.attachment_verified ? "#166534" : "#64748b", fontSize: ".8rem", fontWeight: 800 }}>· Attachment {product.attachment_verified ? "verified" : "not verified yet"}</span></div></div></div>
                    <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}><button type="button" disabled={saving} onClick={() => toggleProductStock(product)} style={{ border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px 10px", background: "#f8fafc", color: "#334155", fontWeight: 800 }}>{product.in_stock === false ? "Mark available" : "Mark sold out"}</button><button type="button" onClick={() => editProduct(product)} style={{ border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px 10px", background: "#fff", color: "#334155", fontWeight: 800 }}>Edit</button><button type="button" onClick={() => copyProductLink(product)} style={{ border: "1px solid #86efac", borderRadius: "8px", padding: "8px 10px", background: "#f0fdf4", color: "#166534", fontWeight: 800 }}>Copy link</button><button type="button" disabled={saving} onClick={() => deleteProduct(product)} style={{ border: "1px solid #fecaca", borderRadius: "8px", padding: "8px 10px", background: "#fef2f2", color: "#b91c1c", fontWeight: 800 }}>Delete</button></div>
                  </div>
                  {product.file_url && <div style={{ color: "#64748b", fontSize: ".78rem", overflowWrap: "anywhere" }}>File: {product.file_url.split("/").pop()}</div>}
                </div>
              )) : <p style={{ color: "#64748b" }}>No products posted yet.</p>}
            </div>
          </section>
        ) : tab === "ads" ? (
          <section
            style={{
              marginTop: "14px",
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
            }}
          >
            <h2>Promotional ads</h2>
            <form onSubmit={publishAd} style={{ display: "grid", gap: "10px" }}>
              <input
                placeholder="Ad label"
                value={adForm.eyebrow}
                onChange={(event) =>
                  setAdForm({ ...adForm, eyebrow: event.target.value })
                }
                style={fieldStyle}
              />
              <input
                required
                placeholder="Ad headline"
                value={adForm.headline}
                onChange={(event) =>
                  setAdForm({ ...adForm, headline: event.target.value })
                }
                style={fieldStyle}
              />
              <input
                required
                placeholder="Product link, e.g. /shop/book-name"
                value={adForm.productUrl}
                onChange={(event) =>
                  setAdForm({ ...adForm, productUrl: event.target.value })
                }
                style={fieldStyle}
              />
              <button
                disabled={saving || profile?.status !== "approved"}
                style={{
                  padding: "11px",
                  border: 0,
                  borderRadius: "9px",
                  background:
                    profile?.status === "approved" ? "#f97316" : "#cbd5e1",
                  color: profile?.status === "approved" ? "#fff" : "#64748b",
                  fontWeight: 800,
                }}
              >
                {profile?.status === "approved"
                  ? "Submit ad for approval"
                  : "Waiting for vendor approval"}
              </button>
            </form>
            <p
              style={{
                color: "#92400e",
                background: "#fff7ed",
                padding: "12px",
                borderRadius: "9px",
              }}
            >
              Every ad is reviewed by the main admin before appearing on the
              promotional board.
            </p>
            <div style={{ marginTop: "20px" }}>
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div>
                      <strong>{ad.headline}</strong>
                      <div style={{ color: ad.status === "rejected" ? "#b91c1c" : "#64748b" }}>
                        {ad.status} · {ad.product_url}
                      </div>
                      <div style={{ color: "#64748b", fontSize: ".8rem" }}>
                        Published by: {ad.vendor_name || profile?.company_name || "Vendor"} · Created by: {ad.posted_by_email || session.user.email}
                      </div>
                    </div>
                    {["published", "approved"].includes(ad.status) && (
                      <button type="button" disabled={saving} onClick={() => requestAdUnpublish(ad)} style={{ border: "1px solid #f59e0b", borderRadius: "8px", padding: "8px 10px", background: "#fffbeb", color: "#92400e", fontWeight: 800, cursor: saving ? "wait" : "pointer" }}>
                        Request unpublish
                      </button>
                    )}
                    {ad.status === "archived" && (
                      <button type="button" disabled={saving} onClick={() => requestAdPublish(ad)} style={{ border: "1px solid #166534", borderRadius: "8px", padding: "8px 10px", background: "#f0fdf4", color: "#166534", fontWeight: 800, cursor: saving ? "wait" : "pointer" }}>
                        Request publish
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section
            style={{
              marginTop: "14px",
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
              border: "1px solid #dfe7ef",
              boxShadow: "0 12px 28px rgba(15, 23, 42, .06)",
            }}
          >
            <p style={{ margin: 0, color: "#15803d", textTransform: "uppercase", letterSpacing: ".12em", fontSize: ".7rem", fontWeight: 800 }}>
              {tab === "earnings" ? "Earnings overview" : "Sales history"}
            </p>
            <h2 style={{ margin: "6px 0 18px", color: "#111827", fontSize: "1.35rem" }}>
              {tab === "earnings"
                ? money(totalEarnings, profile?.payout_currency || "NGN")
                : `${sales.length} sales recorded`}
            </h2>
            {sales.length ? (
              <div style={{ display: "grid", gap: "10px" }}>
                {sales.map((sale) => (
                  <div key={sale.id} style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", padding: "12px 0", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                    <span><strong style={{ color: "#0f172a" }}>{sale.product_title || "Product sale"}</strong><br /><small>{sale.order_number || "No order number"} · Qty {sale.quantity || 1}</small></span>
                    <span style={{ color: "#166534", fontWeight: 800 }}>{sale.currency || profile?.payout_currency || "NGN"} {sale.vendor_amount || 0} · {sale.payout_status || "pending"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#64748b" }}>No sales have been recorded yet.</p>
            )}
          </section>
        )}
        </div>}
      </div>
    </main>
  );
}
