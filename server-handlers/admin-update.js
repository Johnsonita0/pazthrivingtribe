import { createClient } from '@supabase/supabase-js'
import { sendResendEmail } from './lib/resend.js'

// Serverless admin endpoint for secure updates using the Supabase service role key.
// Requires these environment variables to be set in your deployment:
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAILS (comma-separated list)

const getEnv = () => ({
  supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  adminEmails: (process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || 'pazthrivingtribe@gmail.com')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean),
  adminUserIds: (process.env.ADMIN_USER_IDS || process.env.VITE_ADMIN_USER_IDS || '44787dbc-03ba-475e-9d5c-86ba765d5b0a')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
})

const jsonResponse = (res, status, body) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

export default async function handler(req, res) {
  const { supabaseUrl, serviceRoleKey, adminEmails, adminUserIds } = getEnv()
  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Method not allowed' })
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse(res, 500, { error: 'Server misconfigured: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing' })

  let supabase
  try {
    supabase = createClient(supabaseUrl, serviceRoleKey)
  } catch (clientErr) {
    return jsonResponse(res, 500, { error: `Failed to initialize Supabase client: ${clientErr?.message || clientErr}` })
  }

  const authHeader = req.headers.authorization || req.headers['x-access-token'] || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return jsonResponse(res, 401, { error: 'Missing access token' })

  // Verify token with Supabase to retrieve the authenticated user
  try {
    let userData, userErr
    try {
      const result = await supabase.auth.getUser(token)
      userData = result.data
      userErr = result.error
    } catch (authErr) {
      return jsonResponse(res, 401, { error: `Token verification failed: ${authErr?.message || authErr}` })
    }

    if (userErr || !userData?.user) return jsonResponse(res, 401, { error: `Invalid or expired access token: ${userErr?.message || 'no user data'}` })

    const user = userData.user

    // First try server-side admin table `site_admins` (recommended).
    let isAdmin = false
    try {
      const { data: adminRows, error: adminErr } = await supabase.from('site_admins').select('email, uid').or(`email.eq.${user.email},uid.eq.${user.id}`)
      if (!adminErr && Array.isArray(adminRows) && adminRows.length > 0) {
        isAdmin = true
      }
    } catch (e) {
      // table might not exist yet — we'll fall back to env list
    }

    // Allow the configured admin email and Supabase user ID for this project.
    const normalizedEmail = (user.email || '').toLowerCase()
    if (!isAdmin && (adminEmails.includes(normalizedEmail) || adminUserIds.includes(user.id))) {
      isAdmin = true
    }

    if (!isAdmin) return jsonResponse(res, 403, { error: 'User is not authorized to perform admin updates' })

    let requestBody = req.body
    if (typeof requestBody === 'string') {
      try {
        requestBody = JSON.parse(requestBody)
      } catch (parseErr) {
        return jsonResponse(res, 400, { error: 'Invalid JSON body in request' })
      }
    }

    const { action, table, payload, match, columns = '*', bucket, path, expiresIn = 3600 } = requestBody || {}
    if (!action) return jsonResponse(res, 400, { error: 'Missing action' })

    let result
    try {
      if (action === 'delete_test_shop_orders') {
        result = await supabase.from('shop_orders').delete().eq('payment_mode', 'test')
      } else if (action === 'signed_url') {
        if (bucket !== 'vendor-verification' || !path || !String(path).startsWith('vendors/')) return jsonResponse(res, 400, { error: 'Invalid vendor document path' })
        const signedUrlResult = await supabase.storage.from(bucket).createSignedUrl(path, Math.min(Number(expiresIn) || 3600, 3600))
        if (signedUrlResult.error) return jsonResponse(res, 404, { error: `Vendor document preview unavailable: ${signedUrlResult.error.message || signedUrlResult.error}` })
        return jsonResponse(res, 200, { data: signedUrlResult.data, signedUrl: signedUrlResult.data?.signedUrl || signedUrlResult.data?.signedURL || null })
      } else if (action === 'reply_support') {
        if (!['customer_support_messages', 'vendor_support_messages'].includes(table)) {
          return jsonResponse(res, 400, { error: 'Invalid support message table' })
        }
        if (!match?.id || !String(payload?.admin_reply || '').trim()) {
          return jsonResponse(res, 400, { error: 'A support message ID and reply are required' })
        }

        const reply = String(payload.admin_reply).trim()
        const { data: supportMessage, error: supportLookupError } = await supabase
          .from(table)
          .select('id,sender_email,sender_name,message')
          .eq('id', match.id)
          .maybeSingle()
        if (supportLookupError) throw supportLookupError
        if (!supportMessage) return jsonResponse(res, 404, { error: 'Support message not found' })

        const recipient = String(supportMessage.sender_email || '').trim().toLowerCase()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
          return jsonResponse(res, 400, { error: 'This support message has no valid client email address' })
        }

        const clientName = String(supportMessage.sender_name || 'there').trim() || 'there'
        const originalMessage = String(supportMessage.message || '').trim()
        await sendResendEmail({
          to: recipient,
          subject: 'Reply from PAZ customer care',
          html: `<p>Hi ${escapeHtml(clientName)},</p><p>Our customer care team replied to your message:</p><blockquote>${escapeHtml(reply).replace(/\n/g, '<br>')}</blockquote><p><strong>Your original message:</strong><br>${escapeHtml(originalMessage).replace(/\n/g, '<br>')}</p><p>PAZ Thriving Tribe customer care</p>`,
          text: `Hi ${clientName},\n\nOur customer care team replied to your message:\n\n${reply}\n\nYour original message:\n${originalMessage}\n\nPAZ Thriving Tribe customer care`,
          from: process.env.RESEND_FROM_EMAIL || 'notifications@pazthrivingtribe.org'
        })

        result = await supabase
          .from(table)
          .update({ admin_reply: reply, status: 'closed', updated_at: new Date().toISOString() })
          .match(match)
      } else if (action === 'send_vendor_password_reset') {
        if (!match?.id) return jsonResponse(res, 400, { error: 'A vendor ID is required' })

        const { data: vendor, error: vendorLookupError } = await supabase
          .from('vendor_profiles')
          .select('id,contact_email,company_name')
          .eq('id', match.id)
          .maybeSingle()
        if (vendorLookupError) throw vendorLookupError

        const recipient = String(vendor?.contact_email || '').trim().toLowerCase()
        if (!vendor) return jsonResponse(res, 404, { error: 'Vendor profile not found' })
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
          return jsonResponse(res, 400, { error: 'This vendor has no valid contact email address' })
        }

        const configuredAppUrl = String(process.env.VITE_APP_URL || '').trim().replace(/\/$/, '')
        const requestOrigin = String(req.headers.origin || '').trim().replace(/\/$/, '')
        const isLocalOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(requestOrigin)
        const appUrl = isLocalOrigin ? requestOrigin : configuredAppUrl || 'https://pazthrivingtribe.org'
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: recipient,
          options: { redirectTo: `${appUrl}/vendor?reset=1` },
        })
        if (linkError) throw linkError
        const recoveryLink = linkData?.properties?.action_link
        if (!recoveryLink) throw new Error('Supabase did not return a password recovery link.')

        const vendorName = String(vendor.company_name || 'there').trim() || 'there'
        await sendResendEmail({
          to: recipient,
          subject: 'Reset your PAZ vendor password',
          html: `<p>Hi ${escapeHtml(vendorName)},</p><p>An administrator requested a password reset for your PAZ vendor account.</p><p><a href="${escapeHtml(recoveryLink)}" style="display:inline-block;background:#166534;color:#ffffff;text-decoration:none;border-radius:8px;padding:12px 18px;font-weight:700">Reset vendor password</a></p><p>If the button does not work, copy and paste this link into your browser:</p><p>${escapeHtml(recoveryLink)}</p><p>If you did not request this, you can ignore this email.</p><p>PAZ Thriving Tribe</p>`,
          text: `Hi ${vendorName},\n\nAn administrator requested a password reset for your PAZ vendor account.\n\nReset your password here:\n${recoveryLink}\n\nIf you did not request this, you can ignore this email.\n\nPAZ Thriving Tribe`,
          from: process.env.RESEND_FROM_EMAIL || 'notifications@pazthrivingtribe.org',
        })

        return jsonResponse(res, 200, { ok: true, email: recipient, companyName: vendor.company_name || '' })
      } else if (!table) {
        return jsonResponse(res, 400, { error: 'Missing table' })
      } else if (action === 'update') {
        if (!match) return jsonResponse(res, 400, { error: 'Missing match object for update' })
        result = await supabase.from(table).update(payload).match(match)
      } else if (action === 'insert') {
        result = await supabase.from(table).insert(payload)
      } else if (action === 'select') {
        let query = supabase.from(table).select(columns)
        if (match && typeof match === 'object') {
          Object.entries(match).forEach(([key, value]) => { query = query.eq(key, value) })
        }
        result = await query
      } else if (action === 'delete') {
        if (!match) return jsonResponse(res, 400, { error: 'Missing match object for delete' })
        if (table === 'promotional_ads' && match.id) {
          const { data: adToDelete, error: adLookupError } = await supabase.from('promotional_ads').select('is_platform_ad').eq('id', match.id).maybeSingle()
          if (adLookupError) return jsonResponse(res, 500, { error: `Could not verify promotional ad protection: ${adLookupError.message || adLookupError}` })
          if (adToDelete?.is_platform_ad) return jsonResponse(res, 403, { error: 'Platform promotional ads cannot be deleted' })
        }
        result = await supabase.from(table).delete().match(match)
      } else {
        return jsonResponse(res, 400, { error: 'Unknown action' })
      }
    } catch (dbErr) {
      return jsonResponse(res, 500, { error: `Database operation failed: ${dbErr?.message || dbErr}` })
    }

    const { data, error } = result
    if (error) return jsonResponse(res, 500, { error: `Database error: ${error.message || error}` })
    return jsonResponse(res, 200, { data })
  } catch (err) {
    return jsonResponse(res, 500, { error: `Unexpected error: ${err?.message || err}`, stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined })
  }
}
