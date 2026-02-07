import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      // Enable automatic token refresh
      autoRefreshToken: true,
      // Persist auth session to localStorage
      persistSession: true,
      // Detect session changes in other tabs
      detectSessionInUrl: true,
      // Storage key for session
      storageKey: 'investoft-auth-token',
      // Use localStorage for persistence
      storage: window.localStorage,
    },
  }
);