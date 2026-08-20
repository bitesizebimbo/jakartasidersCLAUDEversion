import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./config";

/**
 * Anon-key Supabase client for server-side reads of the public discovery
 * catalog (places, cuisines, social_mentions). No cookie/session
 * plumbing needed since these tables are public-read via RLS.
 */
export function createSupabasePublicClient() {
  const config = getSupabasePublicConfig();
  if (!config) return null;
  return createClient(config.url, config.anonKey, {
    auth: { persistSession: false },
  });
}
