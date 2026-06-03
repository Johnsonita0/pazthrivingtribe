import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pcprbkqpxntxgtseiyie.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_AJr5ZE4VWG6XAMv4XUwcKA_UH2CL4cc'


export const supabase = createClient(supabaseUrl, supabaseAnonKey)