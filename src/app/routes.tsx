import { createBrowserRouter, Navigate } from "react-router";
import React, { lazy, Suspense } from "react";
import { RootLayout } from "./components/RootLayout";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";

// ✅ Use lazy loading for heavy components
const AboutPage = lazy(() => import("./components/AboutPage").then(m => ({ default: m.AboutPage })));
const TermsPage = lazy(() => import("./components/TermsPage").then(m => ({ default: m.TermsPage })));
const MarketsPage = lazy(() => import("./components/MarketsPage").then(m => ({ default: m.MarketsPage })));
const ChartPage = lazy(() => import("./components/ChartPage").then(m => ({ default: m.ChartPage })));
const ScreenerPage = lazy(() => import("./components/ScreenerPage").then(m => ({ default: m.ScreenerPage })));
const MemberDashboard = lazy(() => import("./components/MemberDashboard").then(m => ({ default: m.MemberDashboard })));
const MobileTradingDashboard = lazy(() => import("./components/MobileTradingDashboard").then(m => ({ default: m.MobileTradingDashboard })));
const NewAdminDashboard = lazy(() => import("./components/NewAdminDashboard").then(m => ({ default: m.NewAdminDashboard })));
const AdminSetupPage = lazy(() => import("./components/AdminSetupPage").then(m => ({ default: m.AdminSetupPage })));
const AdminFirstSetup = lazy(() => import("./components/AdminFirstSetup").then(m => ({ default: m.AdminFirstSetup })));
const RealMoneyDashboard = lazy(() => import("./components/RealMoneyDashboard").then(m => ({ default: m.RealMoneyDashboard })));
const DepositPage = lazy(() => import("./components/DepositPage").then(m => ({ default: m.DepositPage })));
const MemberDepositPage = lazy(() => import("./components/MemberDepositPage").then(m => ({ default: m.MemberDepositPage })));
const AuthDiagnosticTool = lazy(() => import("./components/AuthDiagnosticTool").then(m => ({ default: m.AuthDiagnosticTool })));
const QuickCreateMember = lazy(() => import("./components/QuickCreateMember").then(m => ({ default: m.QuickCreateMember })));
const TestAccountCreator = lazy(() => import("./components/TestAccountCreator").then(m => ({ default: m.TestAccountCreator })));
const SimpleAccountCreator = lazy(() => import("./components/SimpleAccountCreator").then(m => ({ default: m.SimpleAccountCreator })));
const QuickLoginTest = lazy(() => import("./components/QuickLoginTest").then(m => ({ default: m.QuickLoginTest })));
const BackendTest = lazy(() => import("./components/BackendTest").then(m => ({ default: m.BackendTest })));
const ComprehensiveTest = lazy(() => import("./components/ComprehensiveTest").then(m => ({ default: m.ComprehensiveTest })));
const DebugPage = lazy(() => import("./components/DebugPage").then(m => ({ default: m.DebugPage })));
const TestChart = lazy(() => import("./components/TestChart").then(m => ({ default: m.TestChart })));
const SupabaseTestPage = lazy(() => import("./components/SupabaseTestPage").then(m => ({ default: m.SupabaseTestPage })));
const QuickFixDashboard = lazy(() => import("./components/QuickFixDashboard").then(m => ({ default: m.QuickFixDashboard })));
const DeploymentGuide = lazy(() => import("./components/DeploymentGuide").then(m => ({ default: m.DeploymentGuide })));
const ManualDeploymentHelper = lazy(() => import("./components/ManualDeploymentHelper").then(m => ({ default: m.ManualDeploymentHelper })));

// Loading fallback component
const LoadingFallback = () => (
  <div style={{
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #1e293b',
        borderTop: '3px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }}></div>
      <p>Loading...</p>
    </div>
  </div>
);

// Wrapper component for lazy loaded routes
const LazyComponent = ({ Component }: { Component: React.ComponentType }) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

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
        path: "about",
        element: <LazyComponent Component={AboutPage} />,
      },
      {
        path: "terms",
        element: <LazyComponent Component={TermsPage} />,
      },
      {
        path: "markets",
        element: <LazyComponent Component={MarketsPage} />,
      },
      {
        path: "cryptocurrency",
        element: <LazyComponent Component={ChartPage} />,
      },
      {
        path: "screener",
        element: <LazyComponent Component={ScreenerPage} />,
      },
      {
        path: "trade",
        element: <LazyComponent Component={MarketsPage} />, // Trade menggunakan MarketsPage
      },
      {
        path: "member",
        element: <LazyComponent Component={MemberDashboard} />, // ✅ RESTORED: Clean professional dashboard
      },
      {
        path: "member-mobile",
        element: <LazyComponent Component={MobileTradingDashboard} />, // ✅ Mobile version
      },
      {
        path: "member-old",
        element: <LazyComponent Component={MemberDashboard} />, // ✅ Keep old version for reference
      },
      {
        path: "admin",
        element: <LazyComponent Component={NewAdminDashboard} />,
      },
      {
        path: "admin-setup",
        element: <LazyComponent Component={AdminSetupPage} />,
      },
      {
        path: "admin-first-setup",
        element: <LazyComponent Component={AdminFirstSetup} />,
      },
      {
        path: "real-trading",
        element: <LazyComponent Component={RealMoneyDashboard} />,
      },
      {
        path: "deposit",
        element: <LazyComponent Component={DepositPage} />,
      },
      {
        path: "member-deposit",
        element: <LazyComponent Component={MemberDepositPage} />,
      },
      {
        path: "auth-diagnostic",
        element: <LazyComponent Component={AuthDiagnosticTool} />,
      },
      {
        path: "quick-create-member",
        element: <LazyComponent Component={QuickCreateMember} />,
      },
      {
        path: "test-account-creator",
        element: <LazyComponent Component={TestAccountCreator} />,
      },
      {
        path: "simple-account-creator",
        element: <LazyComponent Component={SimpleAccountCreator} />,
      },
      {
        path: "quick-login-test",
        element: <LazyComponent Component={QuickLoginTest} />,
      },
      {
        path: "backend-test",
        element: <LazyComponent Component={BackendTest} />,
      },
      {
        path: "comprehensive-test",
        element: <LazyComponent Component={ComprehensiveTest} />,
      },
      {
        path: "debug",
        element: <LazyComponent Component={DebugPage} />,
      },
      {
        path: "test-chart",
        element: <LazyComponent Component={TestChart} />,
      },
      {
        path: "supabase-test",
        element: <LazyComponent Component={SupabaseTestPage} />,
      },
      {
        path: "quick-fix-dashboard",
        element: <LazyComponent Component={QuickFixDashboard} />,
      },
      {
        path: "deployment-guide",
        element: <LazyComponent Component={DeploymentGuide} />,
      },
      {
        path: "manual-deployment-helper",
        element: <LazyComponent Component={ManualDeploymentHelper} />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);