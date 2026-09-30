# Product Chat Setup

## Database

In the Supabase SQL Editor for the project used by PAZ, run `supabase-product-chat-setup.sql`. This creates the private product conversation and message tables, adds the required token columns to tables created by an earlier version, and enables row-level security. The chat APIs use the server-side service-role key; do not add public access policies to these tables.

## Web Chat and Notifications

The product route requires no client account. Customers provide their name, email, phone number, and first message. The site emails them a secure link to continue the conversation. Vendor-owned products route to the approved vendor; PAZ admins are copied and can view every thread in Admin Dashboard > Support Chat. Vendors see their own threads in Vendor Dashboard > Chats.

The chat form tells customers that PAZ support can view the conversation.

## Enable Replies to Email

Secure links let customers resume on the site even before inbound email is configured. To let them reply directly to notification emails:

Production is configured as of 2026-09-30: Resend Receiving uses `pazthrivingtribe.org`, and the enabled `email.received` webhook points to `https://www.pazthrivingtribe.org/api/resend-inbound`. The unrelated webhook no longer subscribes to inbound email events. Do not create another webhook unless this configuration is intentionally replaced.

1. In Resend, open **Emails > Receiving** and use a receiving domain. A Resend-managed `*.resend.app` domain avoids changing the website domain's existing mail DNS. Copy the exact receiving domain shown in your account.
2. In Vercel, add `RESEND_INBOUND_DOMAIN` to the Production environment with that receiving domain (without an `@`).
3. In Resend, create a receiving webhook for `https://www.pazthrivingtribe.org/api/resend-inbound` and select the `email.received` event.
4. Copy that webhook's signing secret into a new Vercel Production environment variable named `RESEND_INBOUND_WEBHOOK_SECRET`. Keep the existing `RESEND_WEBHOOK_SECRET` unchanged; webhook secrets are specific to their Resend endpoints.
5. Redeploy the Vercel project so the new environment variables take effect.

The inbound endpoint verifies Resend's Svix signature, retrieves the message body from Resend, and only accepts replies from the customer's email, the assigned vendor's registered email, or a PAZ admin email. Duplicate webhook events are ignored.

## Verify

After the database setup and deployment, use a new notification email for the first reply test. Emails sent before inbound reply routing was enabled do not contain a per-conversation Reply-To address.

1. Open a published product route and start a test chat using an email address you control.
2. Confirm the conversation appears in Admin Dashboard > Support Chat. For a vendor-owned product, confirm it also appears in that vendor's Dashboard > Chats.
3. Reply from the admin or vendor dashboard and verify the customer receives the email.
4. If inbound email is enabled, reply to that notification and verify the new message appears in the same thread.
5. Open the secure link from the customer email in a different browser and confirm the conversation resumes.
