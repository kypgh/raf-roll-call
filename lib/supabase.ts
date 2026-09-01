import { createClient } from "@supabase/supabase-js";

// Server-only client. Uses the service role key, which bypasses RLS entirely.
// Never import this file from a "use client" component -- it must only ever
// run on the server (Server Components, Server Actions, Route Handlers),
// otherwise the service role key would leak to the browser.
export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
