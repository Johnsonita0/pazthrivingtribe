import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const currencies = ["NGN", "USD", "GBP", "EUR", "GHS", "KES", "ZAR"];
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
    logoUrl: "",
    idType: "National ID",
    idDocument: null,
    payoutName: "",
    payoutAccount: "",
    payoutBank: "",
    payoutCurrency: "NGN",
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
    if (vendor)
      setProfileForm((current) => ({
        ...current,
        companyName: vendor.company_name || "",
        logoUrl: vendor.logo_url || "",
        idType: vendor.id_type || "National ID",
        payoutName: vendor.payout_account_name || "",
        payoutAccount: vendor.payout_account_number || "",
        payoutBank: vendor.payout_bank_name || "",
        payoutCurrency: vendor.payout_currency || "NGN",
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

  const authenticate = async (event) => {
    event.preventDefault();
    setSaving(true);
    const result =
      authMode === "sign-in"
        ? await supabase.auth.signInWithPassword(authForm)
        : await supabase.auth.signUp(authForm);
    if (result.error) setNotice({ type: "error", text: result.error.message });
    else if (result.data?.session) {
      setSession(result.data.session);
      await loadData(result.data.session.user);
    } else {
      setAuthMode("sign-in");
      setNotice({
        type: "success",
        text: "Account created. Confirm your email, then sign in.",
      });
    }
    setSaving(false);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    let documentPath = profile?.id_document_path || "";
    if (profileForm.idDocument) {
      const safeName = profileForm.idDocument.name.replace(
        /[^a-z0-9._-]/gi,
        "-",
      );
      documentPath = `vendors/${session.user.id}/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage
        .from("vendor-verification")
        .upload(documentPath, profileForm.idDocument, {
          upsert: true,
          contentType:
            profileForm.idDocument.type || "application/octet-stream",
        });
      if (error) {
        setNotice({ type: "error", text: error.message });
        setSaving(false);
        return;
      }
    }
    const { data, error } = await supabase
      .from("vendor_profiles")
      .upsert({
        id: session.user.id,
        company_name: profileForm.companyName.trim(),
        logo_url: profileForm.logoUrl.trim(),
        contact_email: session.user.email,
        id_type: profileForm.idType,
        id_document_path: documentPath,
        payout_account_name: profileForm.payoutName.trim(),
        payout_account_number: profileForm.payoutAccount.trim(),
        payout_bank_name: profileForm.payoutBank.trim(),
        payout_currency: profileForm.payoutCurrency,
        status: profile?.status || "pending",
      })
      .select()
      .single();
    setSaving(false);
    if (error) setNotice({ type: "error", text: error.message });
    else {
      setProfile(data);
      setNotice({
        type: "success",
        text: "Verification details sent to the main admin.",
      });
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
            {authMode === "sign-in"
              ? "Vendor sign in"
              : "Create vendor account"}
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
            <input
              required
              minLength="8"
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={(event) =>
                setAuthForm({ ...authForm, password: event.target.value })
              }
              style={fieldStyle}
            />
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
              {saving
                ? "Please wait..."
                : authMode === "sign-in"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </div>
          {notice && <p>{notice.text}</p>}
          <button
            type="button"
            onClick={() =>
              setAuthMode(authMode === "sign-in" ? "sign-up" : "sign-in")
            }
            style={{
              marginTop: "12px",
              border: 0,
              background: "none",
              color: "#166534",
              fontWeight: 700,
            }}
          >
            {authMode === "sign-in"
              ? "Create a vendor account"
              : "Return to sign in"}
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
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              setSession(null);
              navigate("/vendor");
            }}
            style={{
              height: "40px",
              padding: "0 14px",
              border: "1px solid #cbd5e1",
              borderRadius: "9px",
              background: "#fff",
              fontWeight: 700,
            }}
          >
            Sign out
          </button>
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
        <form
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
          <h2>Verification and payout account</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: "10px",
            }}
          >
            <input
              required
              placeholder="Company name"
              value={profileForm.companyName}
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  companyName: event.target.value,
                })
              }
              style={fieldStyle}
            />
            <input
              placeholder="Company logo URL"
              value={profileForm.logoUrl}
              onChange={(event) =>
                setProfileForm({ ...profileForm, logoUrl: event.target.value })
              }
              style={fieldStyle}
            />
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
            <input
              type="file"
              accept="image/*,.pdf"
              required={!profile?.id_document_path}
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  idDocument: event.target.files?.[0] || null,
                })
              }
              style={fieldStyle}
            />
            <input
              placeholder="Payout account name"
              value={profileForm.payoutName}
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  payoutName: event.target.value,
                })
              }
              style={fieldStyle}
            />
            <input
              placeholder="Payout account number"
              value={profileForm.payoutAccount}
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  payoutAccount: event.target.value,
                })
              }
              style={fieldStyle}
            />
            <input
              placeholder="Bank name"
              value={profileForm.payoutBank}
              onChange={(event) =>
                setProfileForm({
                  ...profileForm,
                  payoutBank: event.target.value,
                })
              }
              style={fieldStyle}
            />
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
        </form>
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
            <h2>Product manager</h2>
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
