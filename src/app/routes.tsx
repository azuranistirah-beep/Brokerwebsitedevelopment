import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { LandingPage } from "./components/LandingPage";
import { MarketsPage } from "./components/MarketsPage";
import { ChartPage } from "./components/ChartPage";
import { ScreenerPage } from "./components/ScreenerPage";
import MemberDashboard from "./components/MemberDashboard"; // ✅ FIXED: default import
import MobileTradingDashboard from "./components/MobileTradingDashboard"; // ✅ NEW: Mobile IQ Option style
import { NewAdminDashboard } from "./components/NewAdminDashboard";
import { AdminSetupPage } from "./components/AdminSetupPage";
import { RealMoneyDashboard } from "./components/RealMoneyDashboard";
import { DepositPage } from "./components/DepositPage";
import { MemberDepositPage } from "./components/MemberDepositPage";
import { AuthDiagnosticTool } from "./components/AuthDiagnosticTool";
import { QuickCreateMember } from "./components/QuickCreateMember";
import { TestAccountCreator } from "./components/TestAccountCreator";
import { SimpleAccountCreator } from "./components/SimpleAccountCreator";
import { LoginPage } from "./components/LoginPage";
import { QuickLoginTest } from "./components/QuickLoginTest";
import { BackendTest } from "./components/BackendTest";
import { ComprehensiveTest } from "./components/ComprehensiveTest";
import { DebugPage } from "./components/DebugPage";
import { TestChart } from "./components/TestChart";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: LandingPage,
      },
      {
        path: "login",
        Component: LoginPage,
      },
      {
        path: "markets",
        Component: MarketsPage,
      },
      {
        path: "cryptocurrency",
        Component: ChartPage,
      },
      {
        path: "screener",
        Component: ScreenerPage,
      },
      {
        path: "trade",
        Component: MarketsPage, // Trade menggunakan MarketsPage
      },
      {
        path: "member",
        Component: MemberDashboard, // ✅ RESTORED: Clean professional dashboard
      },
      {
        path: "member-mobile",
        Component: MobileTradingDashboard, // ✅ Mobile version
      },
      {
        path: "member-old",
        Component: MemberDashboard, // ✅ Keep old version for reference
      },
      {
        path: "admin",
        Component: NewAdminDashboard,
      },
      {
        path: "admin-setup",
        Component: AdminSetupPage,
      },
      {
        path: "real-trading",
        Component: RealMoneyDashboard,
      },
      {
        path: "deposit",
        Component: DepositPage,
      },
      {
        path: "member-deposit",
        Component: MemberDepositPage,
      },
      {
        path: "auth-diagnostic",
        Component: AuthDiagnosticTool,
      },
      {
        path: "quick-create-member",
        Component: QuickCreateMember,
      },
      {
        path: "test-account-creator",
        Component: TestAccountCreator,
      },
      {
        path: "simple-account-creator",
        Component: SimpleAccountCreator,
      },
      {
        path: "quick-login-test",
        Component: QuickLoginTest,
      },
      {
        path: "backend-test",
        Component: BackendTest,
      },
      {
        path: "comprehensive-test",
        Component: ComprehensiveTest,
      },
      {
        path: "debug",
        Component: DebugPage,
      },
      {
        path: "test-chart",
        Component: TestChart,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);