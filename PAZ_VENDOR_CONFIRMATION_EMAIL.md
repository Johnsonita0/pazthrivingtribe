# PAZ Vendor Confirmation Email

Use this as the complete PAZ-branded vendor confirmation message.

Subject:

`Confirm your PAZ vendor account`

Email body:

```html
<div style="margin:0;background:#f4f7f5;padding:32px 16px;font-family:Arial,sans-serif;color:#17212b">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #dbe7df;border-radius:18px;overflow:hidden">
    <div style="background:#166534;padding:28px 32px;color:#ffffff">
      <div style="font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase">PAZ Thriving Tribe</div>
      <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2">Confirm your vendor account</h1>
    </div>
    <div style="padding:32px">
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6">Welcome to the PAZ Marketplace.</p>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.6">Confirm your email address so you can submit your vendor profile for review by the PAZ team.</p>
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;border-radius:9px;padding:13px 20px;font-weight:700">Confirm PAZ vendor email</a>
      <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.6">After confirmation, return to the vendor page and sign in. You will be asked to upload your identity document before your profile is sent for approval.</p>
      <p style="margin:20px 0 0;color:#64748b;font-size:13px;line-height:1.6">If the button does not work, copy and paste this link into your browser:</p>
      <p style="margin:8px 0 0;word-break:break-all;font-size:12px;color:#166534">{{ .ConfirmationURL }}</p>
    </div>
    <div style="border-top:1px solid #edf2ee;padding:18px 32px;color:#64748b;font-size:12px">PAZ Thriving Tribe · Vendor onboarding</div>
  </div>
</div>
```

Return links:

- `http://localhost:5173/vendor?confirmed=1`
- `https://pazthrivingtribe.org/vendor?confirmed=1`

The vendor confirmation button returns the user to the PAZ vendor page, where the registration details are restored and the vendor can complete identity verification.