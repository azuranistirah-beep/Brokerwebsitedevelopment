import { useState, useEffect } from "react";
import { 
  TrendingUp, Package, Gift, MessageSquare, BarChart3, Settings,
  ArrowDownToLine
} from "lucide-react";
import { AdminSidebar } from "./admin/AdminSidebar";
import { AdminTopbar } from "./admin/AdminTopbar";
import { OverviewPage } from "./admin/pages/OverviewPage";
import { MembersPage } from "./admin/pages/MembersPage";
import { KYCPage } from "./admin/pages/KYCPage";
import { WithdrawalsPage } from "./admin/pages/WithdrawalsPage";
import { DepositsPage } from "./admin/pages/DepositsPage";
import { PlaceholderPage } from "./admin/pages/PlaceholderPage";
import { toast } from "sonner";
import { getValidAccessToken } from "../lib/authHelpers";

interface NewAdminDashboardProps {
  onLogout: () => void;
  adminName?: string;
  accessToken: string; // Not used anymore but kept for compatibility
}

export function NewAdminDashboard({ onLogout, adminName = "Admin", accessToken }: NewAdminDashboardProps) {
  const [activeMenu, setActiveMenu] = useState("overview");
  const [isChecking, setIsChecking] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = await getValidAccessToken();
      
      if (!token) {
        // No token - redirect immediately without toast (clean UX)
        window.location.href = "/";
        return;
      }
      
      // Token exists - allow access
      setIsChecking(false);
    } catch (error) {
      // Redirect on error too - silent
      window.location.href = "/";
    }
  };

  // Show loading only while checking (very brief)
  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If we get here, user is authenticated - render dashboard
  const handleMenuChange = (menu: string) => {
    setActiveMenu(menu);
  };

  const handleQuickAction = (action: string) => {
    toast.info(`Quick action: ${action}`);
    // Navigate to relevant pages
    switch (action) {
      case "approve-member":
        setActiveMenu("members");
        break;
      case "approve-kyc":
        setActiveMenu("kyc");
        break;
      case "approve-withdrawal":
        setActiveMenu("withdrawals");
        break;
      case "add-asset":
        setActiveMenu("assets");
        break;
      case "create-promo":
        setActiveMenu("promotions");
        break;
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "overview":
        return <OverviewPage onNavigate={handleMenuChange} />;
      case "members":
        return <MembersPage accessToken={accessToken} />;
      case "kyc":
        return <KYCPage />;
      case "deposits":
        return <DepositsPage accessToken={accessToken} />;
      case "withdrawals":
        return <WithdrawalsPage />;
      case "trades":
        return (
          <PlaceholderPage 
            title="Trades Monitoring"
            description="Monitor all open and closed trades"
            icon={TrendingUp}
          />
        );
      case "assets":
        return (
          <PlaceholderPage 
            title="Assets Management"
            description="Manage trading instruments and payout settings"
            icon={Package}
          />
        );
      case "promotions":
        return (
          <PlaceholderPage 
            title="Promotions & Bonuses"
            description="Create and manage promotional campaigns"
            icon={Gift}
          />
        );
      case "support":
        return (
          <PlaceholderPage 
            title="Support Center"
            description="Manage support tickets and customer inquiries"
            icon={MessageSquare}
          />
        );
      case "reports":
        return (
          <PlaceholderPage 
            title="Reports & Analytics"
            description="View platform statistics and generate reports"
            icon={BarChart3}
          />
        );
      case "settings":
        return (
          <PlaceholderPage 
            title="Platform Settings"
            description="Configure platform settings and admin roles"
            icon={Settings}
          />
        );
      default:
        return <OverviewPage onNavigate={handleMenuChange} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <AdminSidebar 
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <AdminTopbar 
          adminName={adminName}
          onQuickAction={handleQuickAction}
        />

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// ✅ Default export for lazy loading
export default NewAdminDashboard;