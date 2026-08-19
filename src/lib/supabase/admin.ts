import { createClient } from '@supabase/supabase-js';

// Lazy initialization - only create admin client when actually needed
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin is not configured. Add SUPABASE_SERVICE_ROLE_KEY to your environment variables.");
  }
  return createClient(url, key);
}

// This client bypasses RLS. ONLY use it in secure server routes like webhooks.
export { getSupabaseAdmin };
