import { createClient } from '@supabase/supabase-js'

// Supabase configuration for SkyLogistics custom instance
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length || 0
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
    env: import.meta.env
  })
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: false
  }
})

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('AWBstocks').select('*').limit(1)
    if (error) {
      console.error('Connection test failed:', error)
      return { success: false, error: error.message }
    }
    console.log('Connection test successful:', data)
    return { success: true, data }
  } catch (err) {
    console.error('Connection test error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

// Interface for AirlinesDirectory table
export interface AirlineDirectory {
  id?: string
  prefix?: string
  code?: string
  name?: string
  country?: string
  [key: string]: any
}

// Interface for AWBstocks table - updated to match the actual schema
export interface AWBStock {
  id?: string
  awb_number?: string
  prefix?: string
  serial_number?: string
  check_digit?: number
  airline_code?: string
  airline_name?: string
  description?: string
  status?: string
  warnings?: string
  created_at?: string
  updated_at?: string
  [key: string]: any // Allow for additional fields
}

// Simple function to get airline by prefix
export const getAirlineByPrefix = async (prefix: string) => {
  try {
    console.log('Looking for airline with prefix:', prefix)
    
    const { data, error } = await supabase
      .from('AirlinesDirectory')
      .select('*')
      .eq('prefix', prefix)
      .single()

    if (error) {
      console.log('No airline found for prefix:', prefix)
      return null
    }

    console.log('Found airline:', data)
    return data

  } catch (err) {
    console.log('No airline found for prefix:', prefix)
    return null
  }
}

// Helper function to get AWBstocks data
export const getAWBStocks = async () => {
  try {
    console.log('Fetching AWBstocks data...')
    const { data, error } = await supabase
      .from('AWBstocks')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error('Error fetching AWBstocks:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('AWBstocks data fetched successfully:', data?.length || 0, 'records')
    return data || []
  } catch (err) {
    console.error('Failed to fetch AWBstocks:', err)
    throw err
  }
}

// Helper function to search airlines by name or code
export const searchAirlines = async (searchTerm: string) => {
  try {
    console.log('Searching airlines with term:', searchTerm)
    const { data, error } = await supabase
      .from('AirlinesDirectory')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`)
      .order('name')
      .limit(10)

    if (error) {
      console.error('Error searching airlines:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('Airlines search results:', data?.length || 0, 'records')
    return data || []
  } catch (err) {
    console.error('Failed to search airlines:', err)
    return []
  }
}

// Helper function to get all airlines
export const getAllAirlines = async () => {
  try {
    console.log('Fetching all airlines...')
    const { data, error } = await supabase
      .from('AirlinesDirectory')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching airlines:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log('All airlines fetched successfully:', data?.length || 0, 'records')
    return data || []
  } catch (err) {
    console.error('Failed to fetch airlines:', err)
    throw err
  }
}

// Helper function to insert AWBstock
export const insertAWBStock = async (stockData: Partial<AWBStock>) => {
  try {
    const { data, error } = await supabase
      .from('AWBstocks')
      .insert([stockData])
      .select()

    if (error) {
      console.error('Error inserting AWBstocks:', error)
      throw error
    }

    return data?.[0]
  } catch (err) {
    console.error('Failed to insert AWBstocks:', err)
    throw err
  }
}

// Helper function to update AWBstock
export const updateAWBStock = async (id: string, updates: Partial<AWBStock>) => {
  try {
    const { data, error } = await supabase
      .from('AWBstocks')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating AWBstocks:', error)
      throw error
    }

    return data?.[0]
  } catch (err) {
    console.error('Failed to update AWBstocks:', err)
    throw err
  }
}

// Helper function to delete AWBstock
export const deleteAWBStock = async (id: string) => {
  try {
    const { error } = await supabase
      .from('AWBstocks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting AWBstocks:', error)
      throw error
    }

    return true
  } catch (err) {
    console.error('Failed to delete AWBstocks:', err)
    throw err
  }
}

export interface MasterRecord {
  [key: string]: any
}