import { createClient } from '@supabase/supabase-js'

// Serverless admin endpoint for secure updates using the Supabase service role key.
// Requires these environment variables to be set in your deployment:
// SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAILS (comma-separated list)

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)

const supabase = createClient(supabaseUrl, serviceRoleKey)

const jsonResponse = (res, status, body) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Method not allowed' })

  const authHeader = req.headers.authorization || req.headers['x-access-token'] || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return jsonResponse(res, 401, { error: 'Missing access token' })

  // Verify token with Supabase to retrieve the authenticated user
  try {
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) return jsonResponse(res, 401, { error: 'Invalid or expired access token' })

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

    const { action, table, payload, match } = req.body || {}
    if (!action || !table) return jsonResponse(res, 400, { error: 'Missing action or table' })

    let result
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

    const { data, error } = result
    if (error) return jsonResponse(res, 500, { error: error.message || error })
    return jsonResponse(res, 200, { data })
  } catch (err) {
    return jsonResponse(res, 500, { error: err.message || err })
  }
}
