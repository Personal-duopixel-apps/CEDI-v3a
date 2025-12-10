import { createClient } from '@supabase/supabase-js'
import { databaseConfig } from '@/config/database.config'

import { Database } from '@/types/supabase'

// Prioritize environment variables, fallback to config file if needed
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || databaseConfig.supabase?.url
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || databaseConfig.supabase?.anonKey

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Please check your .env file or database.config.ts')
}

export const supabase = createClient<Database>(
    supabaseUrl || '',
    supabaseAnonKey || ''
)
