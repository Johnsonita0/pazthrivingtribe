# PAZ Shop mobile app

## Supabase customer accounts

The app uses Supabase Auth email/password accounts. Checkout requires a signed-in
account with a confirmed email, and the delivery email must match that account.
Mobile checkout requests also send the user's access token to the shop API;
the server validates the session before initializing payment or delivering a
free order.

### Supabase project setup

1. In Supabase, open **Authentication → Providers → Email** and enable email
   sign-ups. Keep email confirmation enabled for customer accounts.
2. In **Authentication → URL Configuration → Redirect URLs**, allow
   `pazshop://auth/callback` for the app's Google/Facebook OAuth callback. For
   customer confirmation emails, allow
   `https://www.pazthrivingtribe.org/shop?account=customer-confirmed` and use a
   verified PAZ website URL as the Site URL. Configure a production SMTP
   provider so verification emails are delivered reliably. Customer sign-ups
   identify the account as `customer` and redirect back to the shop after
   confirmation. Supabase confirmation email wording is configured per project,
   not per app sign-up; use customer-neutral wording in the shared confirmation
   template so vendor sign-ups do not receive a vendor-only message.
3. In **SQL Editor**, run [`customer-account-setup.sql`](./customer-account-setup.sql).
   It creates/updates customer profiles, adds the order-to-customer link, and
   installs row-level-security policies for customers' own profile and orders,
   plus the customer-avatar storage bucket and ownership policies. The main
   [`supabase-admin-setup.sql`](../supabase-admin-setup.sql) also creates or
   updates the saved delivery-address fields on customer profiles and orders;
   the mobile account migration remains required for the customer-specific
   security policies and avatar storage.
4. Run [`../supabase-product-chat-setup.sql`](../supabase-product-chat-setup.sql)
   in the same SQL Editor. This migration links chats to signed-in customers
   and adds the read timestamp used for the unread badges.
5. In **Project Settings → API**, copy the Project URL and the publishable key
   (or legacy `anon` key). These are public client credentials; never use the
   `service_role`/secret key in the app.

### Local Expo configuration

Copy `.env.example` to `.env` in this `mobile-shop` directory and replace the
two placeholder values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Restart Expo after changing environment variables:

```sh
npm run start -- --clear
```

The `.env` file is ignored by Git. `EXPO_PUBLIC_` values are included in the
client app bundle, so only the Supabase URL and publishable/anon key belong
there. Keep `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`, and email
provider secrets on the API/server only. The deployed API also needs its
existing `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`,
and `RESEND_API_KEY` server environment values to validate accounts, take
payment, and deliver products. The chat reply endpoints also send Expo push
notifications to customers who enabled them and have a registered phone
token. If Expo push access control is enabled for the EAS project, add
`EXPO_ACCESS_TOKEN` to the server environment; never add it to the mobile app.

### Customer profile, chat, and phone notifications

The profile reads the signed-in customer's `customer_profiles` row, lets the
customer upload a profile photo to the public-read, owner-write
`customer-avatars` bucket, and shows their order history and complete product
chat history. The signed-in photo also appears beside the notifications bell
on the home screen. The Address Book saves a customer's delivery address on
their profile, prefills it at checkout, and stores it with completed mobile
orders. Run the customer account migration and the main Supabase setup before
using this feature so the required profile, order, and security schema is in
place. Help & Support presents PAZ's contact details and sends messages through
the customer-support API.
If there are no existing conversations, Messages offers a New message action
to start a PAZ Customer Care conversation; a confirmed account email and an
international-format phone number are required. The chat-list API requires
the same confirmed customer account; legacy conversations are matched to the
confirmed account email. Replies from PAZ support and approved vendors
increment the unread badge and send an Expo push notification when a device
token is registered.

Image picking and push registration use native Expo modules. After changing
these native dependencies/configuration, create and install a new EAS build;
an OTA update cannot add native modules. For Android, configure FCM credentials
in **Expo dashboard → Project → Credentials**. For iOS, configure the APNs
credentials there as well. Push-token registration runs on a physical device,
not the web preview or most simulators. The existing EAS project ID is read
from `app.json`.

### EAS builds

Add both public variables to the EAS `preview` and `production` environments
in **Expo dashboard → Project → Environment variables**, or with the EAS CLI:

```sh
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR_PROJECT_REF.supabase.co" --visibility plaintext
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY" --visibility plaintext
eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR_PROJECT_REF.supabase.co" --visibility plaintext
eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY" --visibility plaintext
```

Rebuild the preview/production app after adding or changing EAS variables.
Do not add a Supabase service-role key to EAS client environments.

## Publishing over-the-air updates

EAS Update delivers JavaScript and bundled asset changes to installed builds
that have `expo-updates` enabled. Build and install the app at least once for
each channel before publishing OTA updates:

```sh
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform android --profile production
```

Install the resulting build for each channel on devices before publishing its
first OTA update.

After making and testing a JavaScript or asset change, publish it to the
appropriate channel:

```sh
npm run update:preview -- --message "Describe the preview update"
npm run update:production -- --message "Describe the production update"
```

The preview build subscribes to the `preview` channel; the production build
subscribes to `production`. Updates use the explicit runtime version `1.0.0`, so an update is delivered
only to compatible installed builds. Keep this value aligned with the app
version when making incompatible native changes, and create a new native build
when necessary to keep native and JavaScript changes compatible.

OTA updates cover JavaScript and bundled assets only. Changes to native
dependencies, native code, or native app configuration require a new EAS
build and distribution; they cannot be delivered by an OTA update.
