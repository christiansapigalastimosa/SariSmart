import { createClient } from '@supabase/supabase-js'

// Default URL is the one you provided. Override via environment variables.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://btpdhtwgidusozdhzsma.supabase.co'

// For client-side usage use NEXT_PUBLIC_SUPABASE_ANON_KEY; for server use SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  // It's helpful during development to fail fast if env vars are missing.
  // In production, ensure these are set in your deployment environment.
  // eslint-disable-next-line no-console
  console.warn('Supabase URL or Key is not set. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_KEY.')
}

export const supabase = createClient(supabaseUrl, supabaseKey as string)

export default supabase
