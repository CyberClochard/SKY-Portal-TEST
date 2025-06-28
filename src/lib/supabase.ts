import { createClient } from '@supabase/supabase-js'

// Add fallback values and better error handling
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface MasterRecord {
  [key: string]: any
}