import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create a dummy client if env vars are missing to prevent app crash
let supabase: ReturnType<typeof createClient>

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Using dummy client.')
    // Create a dummy client with placeholder values
    supabase = createClient('https://placeholder.supabase.co', 'placeholder-key')
} else {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }
