import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pcprbkqpxntxgtseiyie.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZ21lb2Z0dmhjcXBteGZmd21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTM2NjIsImV4cCI6MjA5NDkyOTY2Mn0.iCd71tYnDLTjOLpHGO5ILl5ZpnG984uyBSDkOCwedyw'


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: false,
		detectSessionInUrl: false,
		autoRefreshToken: false
	}
})