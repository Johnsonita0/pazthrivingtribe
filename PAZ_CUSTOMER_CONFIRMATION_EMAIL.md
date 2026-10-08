# PAZ customer confirmation email template

Supabase uses one **Confirm signup** email template for the project. This
conditional template personalizes PAZ Shop customer sign-ups and retains
vendor-specific copy for vendor registrations.

In the Supabase dashboard, open **Authentication → Email Templates → Confirm
signup**. Set the subject to:

```text
Confirm your PAZ account
```

Replace the email body with:

```html
<div style="margin:0;background:#f4f7f5;padding:32px 16px;font-family:Arial,sans-serif;color:#17212b">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #dbe7df;border-radius:18px;overflow:hidden">
    <div style="background:#166534;padding:28px 32px;color:#ffffff">
      <div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase">PAZ Thriving Tribe</div>
      {{ if eq .Data.account_type "customer" }}
      <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2">Confirm your PAZ Shop account</h1>
      {{ else }}
      <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2">Confirm your PAZ vendor account</h1>
      {{ end }}
    </div>
    <div style="padding:32px">
      {{ if eq .Data.account_type "customer" }}
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6">Hello {{ if .Data.first_name }}{{ .Data.first_name }}{{ else if .Data.full_name }}{{ .Data.full_name }}{{ else }}there{{ end }},</p>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.6">Thanks for joining PAZ Shop. Confirm your email to finish creating your customer account and continue browsing books and digital products.</p>
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;border-radius:9px;padding:13px 20px;font-weight:700">Confirm my customer account</a>
      <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.6">After confirmation, you will return to PAZ Shop. If you did not create this account, you can ignore this email.</p>
      {{ else }}
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6">Welcome to the PAZ Marketplace.</p>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.6">Confirm your email address so you can submit your vendor profile for review by the PAZ team.</p>
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;border-radius:9px;padding:13px 20px;font-weight:700">Confirm PAZ vendor email</a>
      <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.6">After confirmation, return to the vendor page and sign in. You will be asked to upload your identity document before your profile is sent for approval.</p>
      {{ end }}
      <p style="margin:20px 0 0;color:#64748b;font-size:13px;line-height:1.6">If the button does not work, copy and paste this link into your browser:</p>
      <p style="margin:8px 0 0;word-break:break-all;font-size:12px;color:#166534">{{ .ConfirmationURL }}</p>
    </div>
    <div style="border-top:1px solid #edf2ee;padding:18px 32px;color:#64748b;font-size:12px">PAZ Thriving Tribe</div>
  </div>
</div>
```

Customer sign-ups from PAZ Shop include `first_name`, `full_name`, and
`account_type=customer` in Supabase user metadata. The greeting uses the first
name when present, then the full name, and falls back to “there”. Vendor
registrations that do not set the customer account type keep the vendor copy.

Allow this customer redirect URL in **Authentication → URL Configuration →
Redirect URLs**:

```text
https://www.pazthrivingtribe.org/shop?account=customer-confirmed
```

Keep the vendor confirmation redirect URLs allow-listed as well.
