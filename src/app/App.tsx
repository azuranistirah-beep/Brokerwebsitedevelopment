import { useState, useEffect } from "react";
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
import { Toaster } from "./components/ui/sonner";
import { projectId } from "../../utils/supabase/info";
import { supabase } from "./lib/supabaseClient";

type ViewType = "landing" | "markets" | "charts" | "screener" | "news" | "member" | "admin" | "admin-setup";

export default function App() {
  const [view, setView] = useState<ViewType>("landing");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // Check localStorage first
      const storedToken = localStorage.getItem("accessToken");
      const storedUserId = localStorage.getItem("userId");
      const storedRole = localStorage.getItem("userRole");

      if (storedToken && storedUserId && storedRole) {
        console.log("Restoring session from localStorage...");
        setAccessToken(storedToken);
        setUserId(storedUserId);
        setUserRole(storedRole);
        setView(storedRole === "admin" ? "admin" : "member");
        setLoading(false);
        return;
      }

      // Otherwise check Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session error:", error);
        setLoading(false);
        return;
      }

      if (session) {
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
            
            // Save to localStorage for next time
            localStorage.setItem("accessToken", session.access_token);
            localStorage.setItem("userId", session.user.id);
            localStorage.setItem("userRole", result.user.role);
          } else {
            // Silently default to member if profile fetch fails
            setUserRole("member");
            setView("member");
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

  const handleAuthSuccess = async (token: string, userId: string) => {
    setAccessToken(token);
    setUserId(userId);
    
    // Fetch user profile to determine role
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
        setUserRole(result.user.role);
        setView(result.user.role === "admin" ? "admin" : "member");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Default to member if there's an error
      setView("member");
    }
  };

  const handleLogout = () => {
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