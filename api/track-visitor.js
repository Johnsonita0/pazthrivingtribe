import { createClient } from '@supabase/supabase-js'

const jsonResponse = (res, status, body) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return String(forwarded).split(',')[0].trim().slice(0, 100)
  return String(req.headers['x-real-ip'] || req.socket?.remoteAddress || '').slice(0, 100)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Method not allowed' })

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse(res, 500, { error: 'Visitor tracking is not configured' })

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch (error) {
      return jsonResponse(res, 400, { error: 'Invalid JSON body' })
    }
  }

  const path = typeof body?.path === 'string' ? body.path.trim().slice(0, 500) : ''
  const sessionId = typeof body?.sessionId === 'string' ? body.sessionId.trim().slice(0, 150) : ''
  if (!path || !sessionId || !path.startsWith('/')) {
    return jsonResponse(res, 400, { error: 'Path and sessionId are required' })
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { error } = await supabase.from('tribe_activity').insert({
      session_id: sessionId,
      path,
      method: 'GET',
      ip_address: getClientIp(req)
    })
    if (error) return jsonResponse(res, 500, { error: 'Failed to record visitor' })
    return jsonResponse(res, 201, { success: true })
  } catch (error) {
    return jsonResponse(res, 500, { error: 'Failed to record visitor' })
  }
}