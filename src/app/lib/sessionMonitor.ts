import { supabase } from "./supabaseClient";
import { toast } from "sonner";

/**
 * Session Monitor - Monitors and maintains active session
 */
export class SessionMonitor {
  private static instance: SessionMonitor;
  private refreshInterval: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  private constructor() {}

  static getInstance(): SessionMonitor {
    if (!SessionMonitor.instance) {
      SessionMonitor.instance = new SessionMonitor();
    }
    return SessionMonitor.instance;
  }

  /**
   * Start monitoring session
   */
  start() {
    console.log("🔍 Starting session monitor...");
    
    // Check immediately
    this.checkAndRefreshToken();

    // Then check every 2 minutes
    this.refreshInterval = setInterval(() => {
      this.checkAndRefreshToken();
    }, 120000); // 2 minutes
  }

  /**
   * Stop monitoring session
   */
  stop() {
    console.log("🛑 Stopping session monitor...");
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Check token expiration and refresh if needed
   */
  private async checkAndRefreshToken() {
    if (this.isRefreshing) {
      console.log("⏳ Refresh already in progress, skipping...");
      return;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Error getting session:", error);
        return;
      }

      if (!session) {
        console.log("⚠️ No active session");
        return;
      }

      const expiresAt = session.expires_at || 0;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;

      console.log("⏰ Token check - expires in:", Math.floor(timeUntilExpiry / 60), "minutes");

      // Refresh if token expires in less than 10 minutes
      if (timeUntilExpiry < 600) {
        this.isRefreshing = true;
        console.log("🔄 Proactive token refresh (expires in", Math.floor(timeUntilExpiry / 60), "minutes)...");
        
        const { data, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError) {
          console.error("❌ Token refresh failed:", refreshError);
          toast.error("Session is about to expire. Please save your work.", {
            duration: 5000,
          });
          return;
        }

        if (data.session) {
          console.log("✅ Token refreshed successfully");
          const newExpiresAt = data.session.expires_at || 0;
          const newTimeUntilExpiry = newExpiresAt - now;
          console.log("⏰ New token expires in:", Math.floor(newTimeUntilExpiry / 60), "minutes");
        }
      } else if (timeUntilExpiry < 1800) {
        // Warn if less than 30 minutes remaining (but more than 10)
        console.log("⚠️ Token expires soon:", Math.floor(timeUntilExpiry / 60), "minutes");
      }
    } catch (error) {
      console.error("❌ Error in session monitor:", error);
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Force refresh token now
   */
  async forceRefresh(): Promise<boolean> {
    try {
      console.log("🔄 Forcing token refresh...");
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error("❌ Force refresh failed:", error);
        return false;
      }

      if (data.session) {
        console.log("✅ Token force refreshed successfully");
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ Error in force refresh:", error);
      return false;
    }
  }
}

// Export singleton instance
export const sessionMonitor = SessionMonitor.getInstance();
