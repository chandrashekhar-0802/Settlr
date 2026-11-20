/** Connected mode = Supabase URL + publishable key present. Otherwise the app runs in clearly-labelled demo mode. */
export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
