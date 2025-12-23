import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create a dummy client if env vars are missing to prevent app crash
let supabase: ReturnType<typeof createClient<Database>>

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Using dummy client.')
    // Create a dummy client with placeholder values
    supabase = createClient<Database>('https://placeholder.supabase.co', 'placeholder-key')
} else {
    // Configuration du client Supabase pour gérer correctement les tokens dans le hash
    // autoRefreshToken et persistSession sont activés par défaut, mais on les spécifie explicitement
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true, // Important : détecte automatiquement les tokens dans le hash
        }
    })
}

export { supabase }
