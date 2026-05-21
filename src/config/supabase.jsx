import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// // Debug: Check if keys are loaded
// console.log('🔑 Supabase URL:', supabaseUrl)
// console.log('🔑 Supabase Key exists:', !!supabaseAnonKey)
// console.log('🔑 Key length:', supabaseAnonKey?.length)

// if (!supabaseUrl || !supabaseAnonKey) {
//   console.error('❌ Missing Supabase credentials! Check your .env file')
//   alert('Missing Supabase credentials! Please check .env file')
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)