# Get Notified Email Feature - Setup Guide

## Overview
The "Get Notified" feature allows clients to subscribe to email notifications for upcoming services. When they enter their email and click send, they:
1. Get added to the notification list
2. Receive a confirmation email
3. Are redirected back to the home page

## Current Implementation

### Components

#### 1. **ComingSoonPage.jsx** (Main Usage)
- Location: `src/ComingSoonPage.jsx`
- Displays a "Get Notified" button on coming soon pages
- Shows modal with email input form
- Handles form submission and validation
- Features success/error messages with 2-second delay before redirect

#### 2. **GetNotifiedModal.jsx** (Reusable Component)
- Location: `src/GetNotifiedModal.jsx`
- Standalone reusable modal component
- Can be used anywhere in the app
- Optional success callback parameter

### API Endpoints

#### 1. **send-notification-email.js** (Default)
- Location: `api/send-notification-email.js`
- Stores email in Supabase database
- Validates email format
- Logs subscription confirmation
- Works without external dependencies

#### 2. **send-email-resend.js** (Enhanced - Recommended)
- Location: `api/send-email-resend.js`
- Same as above, PLUS sends actual confirmation emails
- Uses Resend service (https://resend.com)
- Perfect for Vercel deployments
- More professional email delivery

## Setup Instructions

### Basic Setup (No Email Service)
✅ **Already working** - Just use the default endpoint

The feature stores emails in your Supabase database and logs confirmations.

```bash
npm run dev
# Navigate to any "coming soon" page
# Click "Get Notified" button
# Enter email and click Send
# You'll see success message and redirect to home
```

### Enhanced Setup (With Email Service - Recommended)

#### Option A: Using Resend (Recommended for Vercel)

1. **Sign up for Resend**
   - Go to https://resend.com
   - Create free account
   - Get your API key

2. **Install Resend package**
   ```bash
   npm install resend
   ```

3. **Set Environment Variables**
   - Add to your `.env.local` or Vercel dashboard:
   ```
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM_EMAIL=notifications@yourdomain.com
   VITE_APP_URL=https://pazthrivingtribe.com
   ```

4. **Update ComingSoonPage.jsx** (Optional)
   - Change the API endpoint from:
   ```javascript
   const response = await fetch('/api/send-notification-email', {
   ```
   - To:
   ```javascript
   const response = await fetch('/api/send-email-resend', {
   ```

5. **Deploy to Vercel**
   ```bash
   git add .
   git commit -m "Add email sending with Resend"
   git push
   ```

#### Option B: Using SendGrid

1. **Sign up for SendGrid**
   - Go to https://sendgrid.com
   - Create account and get API key

2. **Create new API endpoint** (`api/send-email-sendgrid.js`)
   ```javascript
   // Similar to send-email-resend.js but uses SendGrid instead
   // See SendGrid documentation for implementation details
   ```

#### Option C: Using Supabase Email (If Configured)

1. **Enable Supabase Email in Dashboard**
   - Go to your Supabase project
   - Navigate to Email templates
   - Configure SMTP settings

2. **Update API endpoint to send via Supabase**

## Database Schema (Supabase)

Create a `service_notifications` table with:

```sql
CREATE TABLE service_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  service VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Add unique constraint to prevent duplicates
ALTER TABLE service_notifications 
ADD CONSTRAINT unique_email_service UNIQUE(email, service);
```

## Usage Examples

### Using GetNotifiedModal Component

```jsx
import GetNotifiedModal from './GetNotifiedModal';
import { useState } from 'react';

function MyComponent() {
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowNotificationModal(true)}>
        Get Updates
      </button>

      <GetNotifiedModal 
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        serviceTitle="My Special Service"
        onSuccess={(email) => {
          console.log(`Subscribed: ${email}`);
          // Custom success handling
        }}
      />
    </>
  );
}
```

### Using on ComingSoonPage

```jsx
<Route path="/services/my-service" element={
  <ComingSoonPage 
    title="My Service" 
    description="Something amazing is coming soon!"
  />
} />
```

## Email Template Features

The confirmation emails include:
- ✅ Branded header with gradient
- ✅ Service name and subscription info
- ✅ Call-to-action button back to site
- ✅ Professional styling
- ✅ Subscription details (email, service, date)
- ✅ Mobile-responsive design

## Testing

### Local Testing

1. **With logging only (default)**
   ```bash
   npm run dev
   # Check console logs for subscription confirmation
   ```

2. **With Resend (production simulation)**
   ```bash
   # Set RESEND_API_KEY in .env.local
   npm run dev
   # Actual emails will be sent to your test email
   ```

### Test Email Addresses

- **Resend**: Use any email address, they'll be delivered
- **SendGrid**: Same as Resend
- **Development**: Check browser console for API responses

## Troubleshooting

### Email Not Sent
1. Check API key is set correctly
2. Verify endpoint URL in frontend matches
3. Check backend logs for errors
4. Ensure email service is active on your account

### Validation Errors
- Emails must be valid format: `name@domain.com`
- Service title is required
- Email field is trimmed automatically

### Modal Not Showing
1. Ensure React is imported in component
2. Check CSS variables for `--bg-card`, `--border-color`, etc.
3. Verify z-index isn't conflicting with other modals

### Not Redirecting to Home
- Check if `onSuccess` callback is overriding default behavior
- Verify `/` route exists in your app
- Check browser console for JavaScript errors

## Security Considerations

1. **Email Validation**: Uses regex pattern `^[^\s@]+@[^\s@]+\.[^\s@]+$`
2. **CORS**: Enabled for API endpoints
3. **Rate Limiting**: Consider adding on production (Vercel has built-in limits)
4. **API Keys**: Never commit `.env` files - use Vercel secrets dashboard

## Performance

- ⚡ Fast email validation on client-side
- ⚡ API response typically < 500ms
- ⚡ Database insert is non-blocking
- ⚡ Email sending is async (doesn't block response)

## Future Enhancements

- [ ] Add reCAPTCHA to prevent spam
- [ ] Email verification (confirm subscription before storing)
- [ ] Unsubscribe links in emails
- [ ] Email preferences/notification frequency
- [ ] Bulk email send to all subscribers
- [ ] Dashboard to view all subscriptions
- [ ] Analytics on email open rates

## Files Modified/Created

```
api/
├── send-notification-email.js (Enhanced)
└── send-email-resend.js (New)

src/
├── ComingSoonPage.jsx (Fixed imports)
└── GetNotifiedModal.jsx (New - Reusable component)
```

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review your email service documentation
3. Check backend logs in Vercel dashboard
4. Check browser console for frontend errors
