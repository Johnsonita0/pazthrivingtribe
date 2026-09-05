import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const vendorDraftKey = "paz-vendor-registration-draft";
const currencies = ["NGN", "USD", "GBP", "EUR", "GHS", "KES", "ZAR"];
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
const money = (value, currency = "NGN") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
const appUrl = String(import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, "");
const withTimeout = (promise, message, timeoutMs = 15000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      window.setTimeout(() => reject(new Error(message)), timeoutMs),
    ),
  ]);

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
  });
  const [adForm, setAdForm] = useState({
    eyebrow: "Vendor spotlight",
    headline: "",
    productUrl: "",
  });
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState("");
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [passwordResetMode, setPasswordResetMode] = useState(() =>
    new URLSearchParams(window.location.search).get("reset") === "1",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
        .select("*")
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
    setProducts(productRows || []);
    setSales(salesRows || []);
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
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data?.session || null);
      if (data?.session?.user) void loadData(data.session.user);
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
        status: existingProfile?.status || "pending",
      })
      .select()
      .single();
    if (error) throw error;
    return data;
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
    setSaving(true);
    try {
      if (authMode === "sign-up") {
        window.sessionStorage.setItem(vendorDraftKey, JSON.stringify({
          email: authForm.email,
          profile: {
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
          loadData(result.data.session.user),
          "You signed in, but loading the vendor workspace took too long. Refresh and try again.",
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
    if (!profileForm.companyName.trim() || !profileForm.payoutName.trim() || !profileForm.payoutAccount.trim() || !profileForm.payoutBank.trim() || (!profile?.id_document_path && !profileForm.idDocument) || !profileForm.verifiedAccountName) {
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
        text: "Verification details sent to the main admin.",
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
    const { data, error } = await supabase
      .from("store_products")
      .insert({
        title: productForm.title.trim(),
        description: productForm.description.trim(),
        price: Number(productForm.price || 0),
        currency: productForm.currency,
        category: productForm.category,
        file_url: productForm.fileUrl,
        vendor_id: session.user.id,
        vendor_name: profile.company_name,
        in_stock: true,
        stock_count: 1,
      })
      .select()
      .single();
    setSaving(false);
    if (error) setNotice({ type: "error", text: error.message });
    else {
      setProducts((current) => [data, ...current]);
      setProductForm({
        title: "",
        description: "",
        price: "",
        currency: "NGN",
        category: "Ebook",
        fileUrl: "",
      });
      setNotice({ type: "success", text: "Product published to the shop." });
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
          {notice && <p style={{ color: notice.type === "error" ? "#b91c1c" : "#166534" }}>{notice.text}</p>}
          <button type="button" onClick={() => { setPasswordResetMode(false); navigate("/vendor", { replace: true }); }} style={{ marginTop: "12px", border: 0, background: "none", color: "#166534", fontWeight: 700 }}>Return to sign in</button>
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
          background: "#f1f5f3",
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
            <button
              disabled={saving}
              style={{
                padding: "12px",
                background: "#166534",
                color: "#fff",
                border: 0,
                borderRadius: "9px",
                fontWeight: 800,
              }}
            >
              {saving ? "Please wait..." : authMode === "sign-in" ? "Sign in" : authMode === "reset" ? "Send reset link" : "Create account"}
            </button>
          </div>
          {notice && <p>{notice.text}</p>}
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
            onClick={() =>
              setAuthMode(authMode === "sign-up" ? "sign-in" : "sign-in")
            }
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
      </main>
    );
  if (loading)
    return (
      <main style={{ padding: "48px", textAlign: "center" }}>
        Loading vendor dashboard...
      </main>
    );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f1f5f3",
        padding: "28px 20px 48px",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div>
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
            <h1>{profile?.company_name || "Complete your vendor profile"}</h1>
            <p style={{ color: "#64748b" }}>
              {profile?.status === "approved"
                ? "Verified vendor"
                : "Pending admin verification"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button type="button" onClick={() => setSettingsOpen((current) => !current)} aria-label="Open vendor settings" title="Vendor settings" style={{ width: "40px", height: "40px", border: "1px solid #cbd5e1", borderRadius: "9px", background: settingsOpen ? "#166534" : "#fff", color: settingsOpen ? "#fff" : "#0f172a", fontSize: "1.15rem" }}>⚙</button>
            <button
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
          </div>
        </header>
        {notice && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px 14px",
              borderRadius: "9px",
              background: notice.type === "error" ? "#fef2f2" : "#ecfdf5",
              color: notice.type === "error" ? "#b91c1c" : "#166534",
            }}
          >
            {notice.text}
          </div>
        )}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          {[
            ["Products", products.length],
            ["Sales", sales.length],
            [
              "Earnings",
              money(
                sales.reduce(
                  (total, sale) => total + Number(sale.vendor_amount || 0),
                  0,
                ),
                profile?.payout_currency || "NGN",
              ),
            ],
            ["Ads", ads.length],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                padding: "18px",
                borderRadius: "14px",
                background: "#166534",
                color: "#fff",
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
            </div>
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
          }}
        >
          <div>
            <p style={{ margin: 0, color: "#15803d", fontSize: ".72rem", fontWeight: 800, letterSpacing: ".12em" }}>VENDOR SETTINGS</p>
            <h2 style={{ marginBottom: "6px" }}>Profile, verification and payout</h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: ".85rem" }}>Business identity and login email are locked. Update your phone and choose the account to use for payouts below.</p>
          </div>
          {profile?.id_document_path && (
            <section style={{ padding: "14px", border: "1px solid #dbe7df", borderRadius: "12px", background: "#f8fffb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <div><strong>Identity document</strong><p style={{ margin: "4px 0 0", color: "#64748b", fontSize: ".8rem" }}>Your submitted verification document.</p></div>
                {documentPreviewUrl && <button type="button" onClick={() => setDocumentPreviewOpen((current) => !current)} style={{ border: "1px solid #0f766e", borderRadius: "8px", background: documentPreviewOpen ? "#dff8ef" : "#fff", color: "#0f766e", padding: "8px 11px", fontWeight: 800, cursor: "pointer" }}>{documentPreviewOpen ? "Hide document" : "Preview document"}</button>}
              </div>
              {documentPreviewOpen && documentPreviewUrl && <iframe title="Your vendor identity document" src={documentPreviewUrl} style={{ display: "block", width: "100%", height: "340px", marginTop: "12px", border: "1px solid #dbe7df", borderRadius: "8px", background: "#fff" }} />}
            </section>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: "10px",
            }}
          >
            <input required placeholder="Business name (locked)" value={profileForm.companyName} readOnly style={{ ...fieldStyle, background: "#f1f5f9", color: "#475569" }} />
            <input required type="email" placeholder="Email (locked)" value={profile?.contact_email || session.user.email || ""} readOnly style={{ ...fieldStyle, background: "#f1f5f9", color: "#475569" }} />
            <input placeholder="Phone number" value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} style={fieldStyle} />
            <label onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files?.[0]; if (file?.type.startsWith("image/")) setProfileForm({ ...profileForm, logoFile: file }); }} style={{ display: "grid", gap: "6px", padding: "16px", border: "1px dashed #86efac", borderRadius: "10px", background: "#f0fdf4", color: "#166534", textAlign: "center", cursor: "copy" }}>
              <strong>Drag business logo here</strong>
              <span style={{ fontSize: ".78rem" }}>{profileForm.logoFile?.name || (profileForm.logoUrl ? "Existing logo will be kept" : "PNG, JPG, or WebP")}</span>
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
            <label onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files?.[0]; if (file?.type.startsWith("image/") || file?.type === "application/pdf") setProfileForm({ ...profileForm, idDocument: file }); }} style={{ display: "grid", gap: "6px", padding: "16px", border: "1px dashed #93c5fd", borderRadius: "10px", background: "#eff6ff", color: "#1d4ed8", textAlign: "center", cursor: "copy" }}>
              <strong>Drag identity document here</strong>
              <span style={{ fontSize: ".78rem" }}>{profileForm.idDocument?.name || (profile?.id_document_path ? "Existing document will be kept" : "ID image or PDF")}</span>
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
            <button type="button" onClick={verifyBankAccount} disabled={saving} style={{ border: 0, borderRadius: "9px", padding: "11px 12px", background: "#0f766e", color: "#fff", fontWeight: 800, cursor: saving ? "wait" : "pointer" }}>Verify account name</button>
            <select
              required
              value={profileForm.payoutBankCode}
              onChange={(event) => { const selected = banks.find(([, code]) => code === event.target.value); setProfileForm({ ...profileForm, payoutBankCode: event.target.value, payoutBank: selected?.[0] || "", verifiedAccountName: "" }); }}
              style={fieldStyle}
            >
              <option value="">Select bank</option>
              {banks.map(([name, code]) => <option key={name} value={code}>{name}</option>)}
            </select>
            <select
              value={profileForm.payoutCurrency}
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  payoutCurrency: event.target.value,
                })
              }
              style={fieldStyle}
            >
              {currencies.map((currency) => (
                <option key={currency}>{currency}</option>
              ))}
            </select>
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
            Save verification details
          </button>
        </form>}
        <div style={{ display: "flex", gap: "8px", marginTop: "22px" }}>
          <button
            type="button"
            onClick={() => setTab("products")}
            style={{
              flex: 1,
              padding: "12px",
              border: "1px solid #cbd5e1",
              borderRadius: "9px",
              background: tab === "products" ? "#166534" : "#fff",
              color: tab === "products" ? "#fff" : "#334155",
              fontWeight: 800,
            }}
          >
            Products
          </button>
          <button
            type="button"
            onClick={() => setTab("ads")}
            style={{
              flex: 1,
              padding: "12px",
              border: "1px solid #cbd5e1",
              borderRadius: "9px",
              background: tab === "ads" ? "#166534" : "#fff",
              color: tab === "ads" ? "#fff" : "#334155",
              fontWeight: 800,
            }}
          >
            Ads
          </button>
        </div>
        {tab === "products" ? (
          <section
            style={{
              marginTop: "14px",
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
            }}
          >
            <h2>My products</h2>
            {profile?.status === "approved" ? (
              <form
                onSubmit={publishProduct}
                style={{ display: "grid", gap: "10px" }}
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
                  style={fieldStyle}
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
                  style={{ ...fieldStyle, minHeight: "90px" }}
                />
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price"
                  value={productForm.price}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      price: event.target.value,
                    })
                  }
                  style={fieldStyle}
                />
                <select
                  value={productForm.currency}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      currency: event.target.value,
                    })
                  }
                  style={fieldStyle}
                >
                  {currencies.map((currency) => (
                    <option key={currency}>{currency}</option>
                  ))}
                </select>
                <input
                  placeholder="Category"
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      category: event.target.value,
                    })
                  }
                  style={fieldStyle}
                />
                <input
                  type="file"
                  accept=".pdf,.zip"
                  required
                  onChange={uploadProduct}
                  style={fieldStyle}
                />
                <button
                  disabled={saving}
                  style={{
                    padding: "11px",
                    border: 0,
                    borderRadius: "9px",
                    background: "#166534",
                    color: "#fff",
                    fontWeight: 800,
                  }}
                >
                  Publish product
                </button>
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
            <div style={{ marginTop: "20px" }}>
              {products.map((product) => (
                <div
                  key={product.id}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <strong>{product.title}</strong>{" "}
                  <span style={{ color: "#64748b" }}>
                    {product.currency} {product.price}
                  </span>
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
        )}
      </div>
    </main>
  );
}
