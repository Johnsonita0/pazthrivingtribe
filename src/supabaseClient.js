import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const isValidSupabaseUrl = (value) => typeof value === 'string' && value.includes('supabase.co')

let supabase

if (isValidSupabaseUrl(supabaseUrl)) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: false,
      autoRefreshToken: true
    }
  })
} else {
  const noopQuery = () => ({
    select: async () => ({ data: [], error: null }),
    insert: async () => ({ data: [], error: null }),
    update: async () => ({ data: [], error: null }),
    delete: async () => ({ data: [], error: null }),
    upsert: async () => ({ data: [], error: null }),
    eq: () => noopQuery(),
    order: () => noopQuery(),
    limit: () => noopQuery(),
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
    match: () => noopQuery()
  })

  supabase = {
    from: () => noopQuery(),
    rpc: async () => ({ data: null, error: null }),
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: { session: null, user: null }, error: null }),
      signIn: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null })
    },
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
        download: async () => ({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    }
  }
}

export const isSupabaseStub = !isValidSupabaseUrl(supabaseUrl)
export { supabase }
