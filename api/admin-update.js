import { createClient } from '@supabase/supabase-js'

// Serverless admin endpoint for secure updates using the Supabase service role key.
// Requires these environment variables to be set in your deployment:
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAILS (comma-separated list)

const getEnv = () => ({
  supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  adminEmails: (process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
})

const jsonResponse = (res, status, body) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export default async function handler(req, res) {
  const { supabaseUrl, serviceRoleKey, adminEmails } = getEnv()
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

    // Fallback to ADMIN_EMAILS environment variable if no admin row found
    if (!isAdmin && adminEmails.includes((user.email || '').toLowerCase())) {
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

    const { action, table, payload, match } = requestBody || {}
    if (!action || !table) return jsonResponse(res, 400, { error: 'Missing action or table' })

    let result
    try {
      if (action === 'update') {
        if (!match) return jsonResponse(res, 400, { error: 'Missing match object for update' })
        result = await supabase.from(table).update(payload).match(match)
      } else if (action === 'insert') {
        result = await supabase.from(table).insert(payload)
      } else if (action === 'delete') {
        if (!match) return jsonResponse(res, 400, { error: 'Missing match object for delete' })
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
