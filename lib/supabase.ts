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
    // Next.js patches the global `fetch` to cache responses (its Data
    // Cache), and applies this to every fetch call -- including the ones
    // supabase-js makes -- not just the ones you write yourself. Without
    // this, `export const dynamic = "force-dynamic"` on a page is not
    // enough to guarantee fresh data: a query can keep returning a stale,
    // disk-persisted response from an earlier request with the same URL
    // long after the underlying row has changed. Forcing `no-store` here
    // makes every Supabase call fetched fresh, always.
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
