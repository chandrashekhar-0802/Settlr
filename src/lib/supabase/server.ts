import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Server Supabase client bound to the request's auth cookies. Null in demo mode. RLS applies as the signed-in user. */
export async function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: proxy.ts refreshes the session instead.
        }
      },
    },
  });
}

export async function currentUser() {
  const sb = await supabaseServer();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user;
}

/** Admin check runs in the database (is_admin() reads the admins table, which only the service role can write). */
export async function isAdmin() {
  const sb = await supabaseServer();
  if (!sb) return false;
  const { data, error } = await sb.rpc("is_admin");
  return !error && data === true;
}
