import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// The dummy values are placeholders to prevent the app from crashing at startup.
// The App.tsx component will render an error message if the real keys are not provided,
// so this dummy client will never actually be used.
export const supabase = createClient(
  supabaseUrl || "http://dummy-url.com",
  supabaseAnonKey || "dummy-key"
)

if (!isSupabaseConfigured) {
  console.warn("Supabase environment variables are not set. Displaying configuration notice.");
}

// Adicionando logs para depuração
console.log("VITE_SUPABASE_URL (from app):", supabaseUrl);
console.log("VITE_SUPABASE_ANON_KEY (from app):", supabaseAnonKey);