import { useEffect, useState, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { PublicHeader } from "../components/PublicHeader";
import { PublicFooter } from "../components/PublicFooter";
import { AuthModal } from "../components/AuthModal";
import { AutoAdminSetup } from "../components/AutoAdminSetup";
import { Toaster } from "../components/ui/sonner";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { supabase } from "../lib/supabaseClient";

console.log("✅ RootLayout loaded successfully");

// ✅ Inject Supabase config into window for realTimeWebSocket service
(window as any).__SUPABASE_PROJECT_ID__ = projectId;
(window as any).__SUPABASE_PUBLIC_ANON_KEY__ = publicAnonKey;

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signin");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAutoSetup, setShowAutoSetup] = useState(false);
  const [accountType, setAccountType] = useState<'demo' | 'real'>('demo');

  // Define handleLogout with useCallback
  const handleLogout = useCallback(() => {
    setAccessToken(null);
    setUserId(null);
    setUserRole(null);
    navigate("/");
    
    // Clear localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    
    // Sign out from Supabase
    supabase.auth.signOut();
  }, [navigate]);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        // First check if admin exists via API
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
            
            if (!adminCheck.adminExists) {
              console.log("ℹ️ No admin found - will create on first admin access");
              // Don't show auto setup - let it happen in background or on-demand
            } else {
              console.log("✅ Admin exists");
            }
          } else {
            console.log("⚠️ Failed to check admin existence, proceeding with normal flow");
          }
        } catch (adminCheckError) {
          console.error("Error checking admin:", adminCheckError);
        }

        // Check Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Session error:", error);
          localStorage.clear();
          setLoading(false);
          return;
        }

        if (session) {
          console.log("✅ Valid session found, token expires:", new Date(session.expires_at! * 1000));
          
          setAccessToken(session.access_token);
          setUserId(session.user.id);
          localStorage.setItem("accessToken", session.access_token);
          localStorage.setItem("userId", session.user.id);
          
          // Fetch user role from backend
          try {
            const roleResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/user-role`,
              {
                headers: {
                  "Authorization": `Bearer ${session.access_token}`
                }
              }
            );

            if (roleResponse.ok) {
              const roleData = await roleResponse.json();
              setUserRole(roleData.role);
              localStorage.setItem("userRole", roleData.role);
              console.log("✅ User role:", roleData.role);
            }
          } catch (roleError) {
            console.error("Error fetching role:", roleError);
          }
        } else {
          console.log("ℹ️ No active session found");
          localStorage.clear();
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Session check error:", error);
        localStorage.clear();
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/login');
  };

  const handleAuthSuccess = async (token: string, id: string) => {
    console.log("✅ Authentication successful!");
    setAccessToken(token);
    setUserId(id);
    setAuthModalOpen(false);
    
    localStorage.setItem("accessToken", token);
    localStorage.setItem("userId", id);

    // Fetch user role
    try {
      const roleResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/user-role`,
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (roleResponse.ok) {
        const roleData = await roleResponse.json();
        setUserRole(roleData.role);
        localStorage.setItem("userRole", roleData.role);
        console.log("✅ User logged in with role:", roleData.role);

        // Navigate based on role
        if (roleData.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/member");
        }
      }
    } catch (error) {
      console.error("Error fetching role:", error);
      navigate("/member");
    }
  };

  const handleAutoSetupComplete = async (adminToken: string, adminId: string) => {
    console.log("✅ Auto setup complete!");
    setAccessToken(adminToken);
    setUserId(adminId);
    setUserRole("admin");
    setShowAutoSetup(false);
    
    localStorage.setItem("accessToken", adminToken);
    localStorage.setItem("userId", adminId);
    localStorage.setItem("userRole", "admin");
    
    navigate("/admin");
  };

  // Determine if current page should show header/footer
  const isPublicPage = ['/', '/markets', '/cryptocurrency', '/screener', '/news', '/trade'].includes(location.pathname);
  const isDashboardPage = ['/member', '/admin', '/real-trading', '/admin-setup', '/auth-diagnostic'].includes(location.pathname);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (showAutoSetup) {
    return <AutoAdminSetup onComplete={handleAutoSetupComplete} />;
  }

  return (
    <>
      {isPublicPage && (
        <PublicHeader
          onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick}
          isAuthenticated={!!accessToken}
          userRole={userRole}
          onLogout={handleLogout}
        />
      )}

      <Outlet context={{ 
        accessToken, 
        userId, 
        userRole, 
        accountType, 
        setAccountType, 
        handleLogout,
        onLoginClick: handleLoginClick,
        onSignupClick: handleSignupClick
      }} />

      {isPublicPage && <PublicFooter />}

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
        onAuthSuccess={handleAuthSuccess}
      />

      <Toaster />
    </>
  );
}