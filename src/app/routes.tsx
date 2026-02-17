import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { LandingPage } from "./components/LandingPage";
import { MarketsPage } from "./components/MarketsPage";
import { ChartPage } from "./components/ChartPage";
import { ScreenerPage } from "./components/ScreenerPage";
import { MemberDashboard } from "./components/MemberDashboard";
import { NewAdminDashboard } from "./components/NewAdminDashboard";
import { RealMoneyDashboard } from "./components/RealMoneyDashboard";
import { AdminSetupPage } from "./components/AdminSetupPage";
import { AuthDiagnosticTool } from "./components/AuthDiagnosticTool";
import { DepositPage } from "./components/DepositPage";
import { QuickCreateMember } from "./components/QuickCreateMember";
import { TestAccountCreator } from "./components/TestAccountCreator";
import { SimpleAccountCreator } from "./components/SimpleAccountCreator";

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
        Component: MemberDashboard,
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
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
