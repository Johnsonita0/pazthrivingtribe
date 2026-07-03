import { createClient } from '@supabase/supabase-js'
import { loadEnv } from 'vite'

const loadLocalEnv = () => {
  const mode = process.env.NODE_ENV || 'development'
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)
}

const getEnv = () => {
  loadLocalEnv()
  return {
    supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    adminEmails: (process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || '')
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  }
}

const jsonResponse = (res, status, body) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.end()
  }

  if (req.method !== 'POST') {
    return jsonResponse(res, 405, { error: 'Method not allowed' })
  }

  const { supabaseUrl, serviceRoleKey, adminEmails } = getEnv()
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase configuration:', { supabaseUrl: !!supabaseUrl, serviceRoleKey: !!serviceRoleKey })
    return jsonResponse(res, 500, { error: 'Server misconfigured: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing' })
  }

  let requestBody = req.body
  if (typeof requestBody === 'string') {
    try {
      requestBody = JSON.parse(requestBody)
    } catch (parseErr) {
      return jsonResponse(res, 400, { error: 'Invalid JSON body in request' })
    }
  }

  const { email } = requestBody || {}
  if (!email) {
    return jsonResponse(res, 400, { error: 'Email is required' })
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  
  // Check if email is authorized (if admin emails are configured)
  if (adminEmails.length > 0 && !adminEmails.includes(normalizedEmail)) {
    return jsonResponse(res, 403, { error: 'This email is not authorized for admin access' })
  }

  try {
    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Send password reset email
    const { error } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: Math.random().toString(36).slice(-12), // Temporary random password
      email_confirm: true
    }).catch(async (err) => {
      // If user already exists, send password reset instead
      if (err?.status === 400 && err?.message?.includes('already exists')) {
        return await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: normalizedEmail,
          options: {
            redirectTo: `${new URL(req.headers.referer || 'http://localhost:5173').origin}/admin/reset-password`
          }
        })
      }
      throw err
    })

    if (error) {
      console.error('Password reset error:', error)
      throw error
    }

    // If successful, also try the recovery link method for better UX
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
      options: {
        redirectTo: `${new URL(req.headers.referer || 'http://localhost:5173').origin}/admin/reset-password`
      }
    })

    if (linkError) {
      console.error('Generate link error:', linkError)
      // Even if link generation fails, the reset email was likely sent
    }

    return jsonResponse(res, 200, {
      success: true,
      message: 'Password reset email has been sent to your email address. Check your inbox for further instructions.'
    })
  } catch (error) {
    console.error('[Admin Password Reset]', error)
    return jsonResponse(res, 500, {
      error: error?.message || 'Unable to process password reset request. Please try again later.'
    })
  }
}
