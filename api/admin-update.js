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

const decodeJwtEmail = (token) => {
  try {
    const payload = token.split('.')[1]
    const decoded = Buffer.from(payload, 'base64').toString('utf8')
    const parsed = JSON.parse(decoded)
    return parsed.email || parsed?.user?.email || null
  } catch (e) {
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Method not allowed' })

  const authHeader = req.headers.authorization || req.headers['x-access-token'] || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return jsonResponse(res, 401, { error: 'Missing access token' })

  const email = decodeJwtEmail(token)
  if (!email) return jsonResponse(res, 401, { error: 'Invalid access token' })

  if (adminEmails.length === 0 || !adminEmails.includes(email.toLowerCase())) {
    return jsonResponse(res, 403, { error: 'User is not authorized to perform admin updates' })
  }

  const { action, table, payload, match } = req.body || {}
  if (!action || !table) return jsonResponse(res, 400, { error: 'Missing action or table' })

  try {
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
