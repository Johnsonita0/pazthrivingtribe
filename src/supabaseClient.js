import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// If no valid supabase URL is present, export a safe stub to avoid repeated network errors
let supabase
if (supabaseUrl && supabaseUrl.includes('supabase.co')) {
	supabase = createClient(supabaseUrl, supabaseAnonKey, {
		auth: {
			persistSession: false,
			detectSessionInUrl: false,
			autoRefreshToken: false
		}
	})
} else {
	// minimal no-op query builder
	const noopQuery = () => ({
		select: async () => ({ data: [], error: null }),
		insert: async () => ({ data: [], error: null }),
		update: async () => ({ data: [], error: null }),
		delete: async () => ({ data: [], error: null }),
		upsert: async () => ({ data: [], error: null }),
		eq: () => noopQuery(),
		order: () => noopQuery(),
		limit: () => noopQuery(),
	})

	supabase = {
		from: () => noopQuery(),
		rpc: async () => ({ data: null, error: null }),
		auth: {
			getSession: async () => ({ data: { session: null } }),
			onAuthStateChange: (_cb) => ({ data: { subscription: { unsubscribe: () => {} } } }),
			signIn: async () => ({ data: null, error: null }),
			signOut: async () => ({ error: null }),
		},
		storage: {
			from: () => ({ upload: async () => ({ error: null }), download: async () => ({ error: null }) })
		}
	}

	// avoid noisy console logs in production-like environments
	if (typeof window !== 'undefined') {
		console.warn('Supabase URL not provided — using in-memory stub to avoid network errors.')
	}
}

// expose a flag so the UI can detect stub mode and show a developer indicator
export const isSupabaseStub = !(supabaseUrl && supabaseUrl.includes('supabase.co'))

export { supabase }