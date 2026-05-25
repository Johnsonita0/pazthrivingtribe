import { createClient } from '@supabase/supabase-js'

// Hardcoding your values directly bypasses the broken .env reader completely
const supabaseUrl = 'https://pcprbkqpxntxgtseiyie.supabase.co'
const supabaseAnonKey = 'sb_publishable_AJr5ZE4VWG6XAMv4XUwcKA_UH2CL4cc' 

console.log("Testing Direct Connection Configuration...")

export const supabase = createClient(supabaseUrl, supabaseAnonKey)