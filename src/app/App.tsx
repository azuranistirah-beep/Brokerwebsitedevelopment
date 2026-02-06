import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { PublicHeader } from "./components/PublicHeader";
import { PublicFooter } from "./components/PublicFooter";
import { MarketsPage } from "./components/MarketsPage";
import { ChartPage } from "./components/ChartPage";
import { ScreenerPage } from "./components/ScreenerPage";
import { NewsPage } from "./components/NewsPage";
import { AuthModal } from "./components/AuthModal";
import { MemberDashboard } from "./components/MemberDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { Toaster } from "./components/ui/sonner";
import { projectId } from "/utils/supabase/info";
import { supabase } from "./lib/supabaseClient";

type ViewType = "landing" | "markets" | "charts" | "screener" | "news" | "member" | "admin";

export default function App() {
  const [view, setView] = useState<ViewType>("landing");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session error:", error);
        setLoading(false);
        return;
      }

      if (session) {
        setAccessToken(session.access_token);
        // Fetch user profile to determine role
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
    setUserRole(null);
    setView("landing");
  };

  const openAuthModal = (tab: "login" | "signup") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
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
          <AdminDashboard
            accessToken={accessToken}
            onLogout={handleLogout}
          />
        )}
      </main>

      {isPublicView && (
        <PublicFooter 
          onNavigate={handleNavigate}
          onGetStarted={() => openAuthModal("signup")}
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
