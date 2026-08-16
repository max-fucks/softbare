import { createClient } from '@supabase/supabase-js';

// This client bypasses RLS. ONLY use it in secure server routes like webhooks.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
