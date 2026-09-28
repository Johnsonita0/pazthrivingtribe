# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Production deployment setup

This app uses Supabase env vars for both client-side rendering and secure server-side admin updates.

Required environment variables in production:

- `VITE_SUPABASE_URL` — your Supabase project URL for client-side access
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key for client-side access
- `SUPABASE_URL` — the same Supabase project URL for server-side admin APIs
- `SUPABASE_SERVICE_ROLE_KEY` — secret Supabase service role key used by server-side admin and release-notification APIs
- `RESEND_API_KEY` — server-only key used to deliver product release emails
- `RESEND_FROM_EMAIL` — verified sender address for release emails
- `CRON_SECRET` — secret bearer token used to protect `/api/release-notifications`
- `VITE_APP_URL` — public site origin used to build direct product links in emails
- `ADMIN_EMAILS` — comma-separated list of allowed admin emails (fallback)
- `OPENAI_API_KEY` — server-only key used by `/api/generate-product-description`
- `OPENAI_MODEL` — optional model override; defaults to `gpt-4o-mini`

If you deploy to Vercel, add the `SUPABASE_*` variables in the project dashboard under Environment Variables. Do not use `VITE_SUPABASE_ANON_KEY` as the service role key.
Add `OPENAI_API_KEY` to the local `.env` file for development and to the Vercel Production environment for the deployed AI description helper. Never expose it through a `VITE_` variable.

Alternate fix: if Vercel does not expose `SUPABASE_SERVICE_ROLE_KEY` to the function, also add `VITE_SUPABASE_SERVICE_ROLE_KEY` with the same service role key value. The admin endpoint will accept either variable name at runtime.

The admin endpoint is available at `/api/admin-update`.

### Scheduled product release notifications

Run the `product_release_notifications` table, RLS, and index statements from `supabase-admin-setup.sql` in the Supabase SQL Editor. This table is only accessible to the server-side service role.

The release signup endpoint stores one opt-in per product and email. Supabase Cron calls `/api/release-notifications` every minute and sends the product link when checkout opens, then 12 and 24 hours later. Add `CRON_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `VITE_APP_URL` to the Vercel project environment. In Supabase Vault, create `paz_release_notification_url` with the production URL `https://pazthrivingtribe.org/api/release-notifications` and `paz_release_notification_secret` with the same value as Vercel's `CRON_SECRET`. Then run the updated SQL setup to install and schedule the job.

After a successful checkout delivers the product file to the same email, the remaining release reminders are stopped.

### Paystack Test Mode URLs

Set these URLs in Paystack Dashboard under **Settings > API Keys & Webhooks > Test Mode**:

- Callback URL: `https://pazthrivingtribe.org/payment/callback`
- Webhook URL: `https://pazthrivingtribe.org/api/paystack-webhook`

The webhook verifies the `x-paystack-signature` header and updates matching `shop_orders` records after a successful charge. Add `PAYSTACK_SECRET_KEY` to the Vercel Production or Preview environment using the matching Paystack test secret key.

### Supabase production setup

Recommended step: create a `site_admins` table in Supabase and add your admin user(s). This lets the serverless endpoint authenticate admin rights securely.

Use the SQL script in `supabase-admin-setup.sql` to create the admin table and to add a sample RLS policy for applicant submissions.

If you want to lock down other tables too, add Supabase policies that allow only the server-side endpoint to mutate admin-controlled tables and allow public insert for applicant forms.
