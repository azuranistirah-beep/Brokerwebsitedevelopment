import { useState, useEffect, useCallback } from "react";
import { LandingPage } from "./components/LandingPage";
import { MarketsPage } from "./components/MarketsPage";
import { ChartPage } from "./components/ChartPage";
import { ScreenerPage } from "./components/ScreenerPage";
import { NewsPage } from "./components/NewsPage";
import { PublicHeader } from "./components/PublicHeader";
import { PublicFooter } from "./components/PublicFooter";
import { AuthModal } from "./components/AuthModal";
import { MemberDashboard } from "./components/MemberDashboard";
import { NewAdminDashboard } from "./components/NewAdminDashboard";
import { AdminSetupPage } from "./components/AdminSetupPage";
import { AutoAdminSetup } from "./components/AutoAdminSetup";
import { RealMoneyDashboard } from "./components/RealMoneyDashboard";
import { Toaster } from "./components/ui/sonner";
import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { supabase } from "./lib/supabaseClient";
import { sessionMonitor } from "./lib/sessionMonitor";
import { toast } from "sonner";

type ViewType = "landing" | "markets" | "charts" | "screener" | "news" | "member" | "admin" | "admin-setup" | "real-trading";

export default function App() {
  const [view, setView] = useState<ViewType>("landing");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAutoSetup, setShowAutoSetup] = useState(false);
  const [accountType, setAccountType] = useState<'demo' | 'real'>('demo'); // Account type for members

  // Define handleLogout with useCallback to avoid dependency issues
  const handleLogout = useCallback(() => {
    setAccessToken(null);
    setUserId(null);
    setUserRole(null);
    setView("landing");
    
    // Clear localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    
    // Sign out from Supabase
    supabase.auth.signOut();
  }, []);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        // First check if admin exists via API (not localStorage)
        try {
          const checkAdminResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/check-admin`,
            {
              headers: {
                "Authorization": `Bearer ${publicAnonKey}`
              }
            }
          );

          if (checkAdminResponse.ok) {
            const adminCheck = await checkAdminResponse.json();
            
            // If no admin exists, show auto setup
            if (!adminCheck.adminExists) {
              console.log("ℹ️ No admin found, showing auto setup");
              setShowAutoSetup(true);
              setLoading(false);
              return;
            }
            
            // Admin exists, proceed with normal session check
            console.log("✅ Admin exists, skipping auto setup");
          } else {
            console.log("⚠️ Failed to check admin existence, proceeding with normal flow");
            // Don't show auto setup on error - let the AutoAdminSetup component handle it
          }
        } catch (adminCheckError) {
          console.error("Error checking admin:", adminCheckError);
          // Don't show auto setup on error - just proceed normally
        }

        // Check Supabase session (always get fresh token)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Session error:", error);
          // Clear invalid session
          localStorage.clear();
          setLoading(false);
          return;
        }

        if (session) {
          console.log("✅ Valid session found, token expires:", new Date(session.expires_at! * 1000));
          
          setAccessToken(session.access_token);
          setUserId(session.user.id);
          
          // Try to fetch user profile, but don't fail if backend is down
          try {
              const response = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/profile`,
                {
                  headers: {
                    Authorization: `Bearer ${session.access_token}`,
                  },
                }
              );

              if (response.ok) {
                const result = await response.json();
                setUserRole(result.user.role);
                setView(result.user.role === "admin" ? "admin" : "member");
              
              // Save to localStorage for quick reference (but always use fresh session token)
              localStorage.setItem("userId", session.user.id);
              localStorage.setItem("userRole", result.user.role);
            } else {
              console.log("⚠️ Profile fetch failed, checking localStorage for role...");
              // Fallback to localStorage role
              const storedRole = localStorage.getItem("userRole");
              if (storedRole) {
                setUserRole(storedRole);
                setView(storedRole === "admin" ? "admin" : "member");
              } else {
                // Default to member
                setUserRole("member");
                setView("member");
              }
            }
          } catch (profileError) {
            // Silently default to member if profile fetch fails
            setUserRole("member");
            setView("member");
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();

    // Set up auth state listener for real-time session monitoring
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔐 Auth state changed:", event);

      if (event === 'TOKEN_REFRESHED') {
        console.log("✅ Token refreshed automatically");
        if (session) {
          setAccessToken(session.access_token);
        }
      }

      if (event === 'SIGNED_OUT') {
        console.log("👋 User signed out");
        handleLogout();
      }

      if (event === 'USER_UPDATED') {
        console.log("👤 User updated");
      }
    });

    // Set up periodic token refresh check (every 2 minutes)
    const refreshInterval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const expiresAt = session.expires_at || 0;
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiresAt - now;

        console.log("⏰ Token check - expires in:", timeUntilExpiry, "seconds");

        // Refresh if token expires in less than 10 minutes
        if (timeUntilExpiry < 600) {
          console.log("🔄 Proactive token refresh...");
          const { data, error } = await supabase.auth.refreshSession();
          
          if (error) {
            console.error("❌ Token refresh failed:", error);
            toast.error("Session expired. Please login again.");
            handleLogout();
          } else if (data.session) {
            console.log("✅ Token refreshed proactively");
            setAccessToken(data.session.access_token);
          }
        }
      }
    }, 120000); // Check every 2 minutes

    // Cleanup
    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [handleLogout]);

  const handleAuthSuccess = async (token: string, userId: string) => {
    setAccessToken(token);
    setUserId(userId);
    
    // Fetch user profile to determine role and status
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const user = result.user;
        
        // Check user status
        if (user.status === 'pending') {
          toast.error("Your account is awaiting admin approval. Please wait for verification.");
          handleLogout();
          return;
        }
        
        if (user.status === 'rejected') {
          toast.error("Your account has been rejected. Please contact support for more information.");
          handleLogout();
          return;
        }
        
        // If active, proceed normally
        if (user.status === 'active') {
          setUserRole(user.role);
          setView(user.role === "admin" ? "admin" : "member");
          
          // Store in localStorage
          localStorage.setItem("accessToken", token);
          localStorage.setItem("userId", userId);
          localStorage.setItem("userRole", user.role);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Default to member if there's an error
      setUserRole("member");
      setView("member");
    }
  };

  const openAuthModal = (tab: "login" | "signup") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleAdminLogin = async (token: string, userId: string) => {
    console.log("Admin login successful, setting state...");
    setAccessToken(token);
    setUserId(userId);
    
    // Store in localStorage
    localStorage.setItem("accessToken", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("userRole", "admin"); // Store role locally
    
    setView("admin");
  };

  const handleNavigate = (newView: string) => {
    setView(newView as ViewType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const isPublicView = ["landing", "markets", "charts", "screener", "news"].includes(view);

  return (
    <>
      {isPublicView && (
        <PublicHeader
          onLogin={() => openAuthModal("login")}
          onGetStarted={() => openAuthModal("signup")}
          onNavigate={handleNavigate}
          currentView={view}
        />
      )}

      <main>
        {view === "landing" && (
          <LandingPage
            onGetStarted={() => openAuthModal("signup")}
            onNavigate={handleNavigate}
          />
        )}
        
        {view === "markets" && <MarketsPage />}
        {view === "charts" && <ChartPage />}
        {view === "screener" && <ScreenerPage />}
        {view === "news" && <NewsPage />}

        {view === "member" && accessToken && (
          <MemberDashboard
            accessToken={accessToken}
            onLogout={handleLogout}
            accountType={accountType}
            onSwitchToReal={() => setView("real-trading")}
          />
        )}

        {view === "real-trading" && accessToken && (
          <RealMoneyDashboard
            accessToken={accessToken}
            onLogout={handleLogout}
          />
        )}

        {view === "admin" && accessToken && (
          <NewAdminDashboard
            accessToken={accessToken}
            onLogout={handleLogout}
          />
        )}

        {view === "admin-setup" && (
          <AdminSetupPage onSuccess={handleAdminLogin} />
        )}

        {showAutoSetup && (
          <AutoAdminSetup onComplete={() => {
            setShowAutoSetup(false);
            localStorage.setItem("autoSetupDone", "true");
          }} />
        )}
      </main>

      {isPublicView && (
        <PublicFooter 
          onNavigate={handleNavigate}
          onGetStarted={() => openAuthModal("signup")}
          onAdminLogin={handleAdminLogin}
        />
      )}

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        defaultTab={authModalTab}
      />

      <Toaster />
    </>
  );
}