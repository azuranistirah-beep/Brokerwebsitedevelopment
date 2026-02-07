import { useState, useEffect } from "react";
import { RealTradeSidebar } from "./RealTradeSidebar";
import { RealTradeHeader } from "./RealTradeHeader";
import { RealTradeArea } from "./RealTradeArea";
import { RealWalletPage } from "./RealWalletPage";
import { RealDepositPage } from "./RealDepositPage";
import { RealWithdrawPage } from "./RealWithdrawPage";
import { RealProfileKYCPage } from "./RealProfileKYCPage";
import { RealHistoryPage } from "./RealHistoryPage";
import { RealPortfolioPage } from "./RealPortfolioPage";
import { projectId } from "../../../utils/supabase/info";
import { toast } from "sonner";

type PageType = "trade" | "portfolio" | "history" | "wallet" | "deposit" | "withdraw" | "profile" | "support";

interface RealMoneyDashboardProps {
  accessToken: string;
  onLogout: () => void;
}

export function RealMoneyDashboard({ accessToken, onLogout }: RealMoneyDashboardProps) {
  const [currentPage, setCurrentPage] = useState<PageType>("trade");
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchWallet();
    fetchProfile();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/wallet`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet);
      } else {
        toast.error("Failed to load wallet");
      }
    } catch (error) {
      console.error("Wallet fetch error:", error);
      toast.error("Failed to load wallet");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-20da1dab/profile`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
  };

  const refreshWallet = () => {
    fetchWallet();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <RealTradeSidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <RealTradeHeader
          wallet={wallet}
          userProfile={userProfile}
          onLogout={onLogout}
        />

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {currentPage === "trade" && (
            <RealTradeArea
              accessToken={accessToken}
              wallet={wallet}
              onWalletUpdate={refreshWallet}
              userProfile={userProfile}
            />
          )}

          {currentPage === "portfolio" && (
            <RealPortfolioPage
              accessToken={accessToken}
              wallet={wallet}
            />
          )}

          {currentPage === "history" && (
            <RealHistoryPage
              accessToken={accessToken}
            />
          )}

          {currentPage === "wallet" && (
            <RealWalletPage
              accessToken={accessToken}
              wallet={wallet}
              onWalletUpdate={refreshWallet}
            />
          )}

          {currentPage === "deposit" && (
            <RealDepositPage
              accessToken={accessToken}
              onSuccess={() => {
                refreshWallet();
                toast.success("Deposit request submitted!");
                setCurrentPage("wallet");
              }}
            />
          )}

          {currentPage === "withdraw" && (
            <RealWithdrawPage
              accessToken={accessToken}
              wallet={wallet}
              onSuccess={() => {
                refreshWallet();
                toast.success("Withdrawal request submitted!");
                setCurrentPage("wallet");
              }}
            />
          )}

          {currentPage === "profile" && (
            <RealProfileKYCPage
              accessToken={accessToken}
              userProfile={userProfile}
              onProfileUpdate={fetchProfile}
            />
          )}

          {currentPage === "support" && (
            <div className="p-8">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Support Center
                </h2>
                <p className="text-slate-400 mb-6">
                  Need help? Contact our 24/7 support team.
                </p>
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-slate-300 font-semibold">Email</p>
                    <p className="text-blue-400">support@investoft.com</p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-slate-300 font-semibold">Live Chat</p>
                    <p className="text-slate-400">Available 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
