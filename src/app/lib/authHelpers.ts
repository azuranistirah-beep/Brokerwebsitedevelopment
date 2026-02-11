import { supabase } from "./supabaseClient";
import { toast } from "sonner";

/**
 * Get valid access token with auto-refresh
 * Returns null if user is not authenticated
 */
export async function getValidAccessToken(): Promise<string | null> {
  try {
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("❌ Error getting session:", error);
      return null;
    }

    if (!session) {
      console.log("⚠️ No active session found");
      return null;
    }

    // Check if token is about to expire (within 5 minutes)
    const expiresAt = session.expires_at || 0;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;

    console.log("🔑 Token expires in:", timeUntilExpiry, "seconds");

    // Refresh if token expires in less than 5 minutes
    if (timeUntilExpiry < 300) {
      console.log("🔄 Refreshing token...");
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error("❌ Error refreshing token:", refreshError);
        return null;
      }

      if (refreshData.session) {
        console.log("✅ Token refreshed successfully");
        return refreshData.session.access_token;
      }
    }

    return session.access_token;
  } catch (error) {
    console.error("❌ Error in getValidAccessToken:", error);
    return null;
  }
}

/**
 * Validate if user has admin role
 */
export async function validateAdminAccess(): Promise<boolean> {
  try {
    const token = await getValidAccessToken();
    if (!token) return false;

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error("❌ Error validating user:", error);
      return false;
    }

    // Check user metadata for admin role
    const role = user.user_metadata?.role || localStorage.getItem("userRole");
    
    return role === "admin";
  } catch (error) {
    console.error("❌ Error validating admin access:", error);
    return false;
  }
}

/**
 * Handle authentication errors
 */
export async function handleAuthError(error: any): Promise<void> {
  console.error("🔐 Authentication error:", error);
  
  if (error.message?.includes("JWT") || error.message?.includes("401") || error.message?.includes("token")) {
    console.log("🔄 Session invalid, logging out...");
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Show toast instead of alert for better UX
    toast.error("Your session has expired. Please login again.", {
      duration: 5000,
    });
    
    // Delay reload to let user see the message
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  }
}

/**
 * Make authenticated API call with auto token refresh and retry
 */
export async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {},
  retryCount: number = 0
): Promise<Response> {
  const MAX_RETRIES = 2;
  const TIMEOUT_MS = 15000; // 15 second timeout
  
  try {
    // Get fresh token
    const token = await getValidAccessToken();
    
    if (!token) {
      throw new Error("No valid authentication token");
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      // Make request with fresh token and timeout
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 errors with retry
      if (response.status === 401 && retryCount < MAX_RETRIES) {
        console.log(`⚠️ 401 Unauthorized - Attempt ${retryCount + 1}/${MAX_RETRIES + 1}, refreshing token...`);
        
        // Force token refresh
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error("❌ Token refresh failed:", refreshError);
          await handleAuthError(new Error("Token refresh failed"));
          throw new Error("Authentication failed");
        }
        
        console.log("✅ Token refreshed, retrying request...");
        
        // Retry the request with new token
        return makeAuthenticatedRequest(url, options, retryCount + 1);
      }

      // If still 401 after retries, logout
      if (response.status === 401 && retryCount >= MAX_RETRIES) {
        console.error("❌ 401 Unauthorized after retries - Logging out");
        await handleAuthError(new Error("Invalid token"));
        throw new Error("Authentication failed");
      }

      return response;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Handle abort/timeout error
      if (fetchError.name === 'AbortError') {
        console.error("❌ Request timeout after", TIMEOUT_MS, "ms");
        throw new Error("Request timeout - please check your connection");
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error("❌ Error in makeAuthenticatedRequest:", error);
    throw error;
  }
}

/**
 * Make authenticated request with fallback data on error
 */
export async function makeAuthenticatedRequestWithFallback<T>(
  url: string,
  fallbackData: T,
  options: RequestInit = {}
): Promise<{ data: T; error: string | null; isFromCache: boolean }> {
  try {
    const response = await makeAuthenticatedRequest(url, options);
    
    if (!response.ok) {
      console.warn(`⚠️ API returned ${response.status}, using fallback data`);
      return { data: fallbackData, error: `API returned ${response.status}`, isFromCache: true };
    }
    
    const data = await response.json();
    return { data, error: null, isFromCache: false };
  } catch (error: any) {
    console.warn(`⚠️ API request failed: ${error.message}, using fallback data`);
    return { data: fallbackData, error: error.message, isFromCache: true };
  }
}