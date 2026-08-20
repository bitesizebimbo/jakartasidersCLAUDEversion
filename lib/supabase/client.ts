"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "./config";

/**
 * Browser Supabase client. Returns `null` when Supabase env vars are not
 * configured so callers can render a graceful "not configured" state
 * instead of crashing — auth/saved features are optional for the MVP.
 */
export function createSupabaseBrowserClient() {
  const config = getSupabasePublicConfig();
  if (!config) return null;
  return createBrowserClient(config.url, config.anonKey);
}
