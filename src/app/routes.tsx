import { createBrowserRouter, Navigate } from "react-router";
import React, { lazy, Suspense } from "react";
import { RootLayout } from "./components/RootLayout";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";

// ✅ FIXED: Simplified lazy loading without named exports
const AboutPage = lazy(() => import("./components/AboutPage"));
const TermsPage = lazy(() => import("./components/TermsPage"));
const MarketsPage = lazy(() => import("./components/MarketsPage"));
const ChartPage = lazy(() => import("./components/ChartPage"));
const ScreenerPage = lazy(() => import("./components/ScreenerPage"));
const MemberDashboard = lazy(() => import("./components/MemberDashboard"));
const MobileTradingDashboard = lazy(() => import("./components/MobileTradingDashboard"));
const ProTradingDashboard = lazy(() => import("./components/ProTradingDashboard"));
const NewAdminDashboard = lazy(() => import("./components/NewAdminDashboard"));
const AdminSetupPage = lazy(() => import("./components/AdminSetupPage"));
const AdminFirstSetup = lazy(() => import("./components/AdminFirstSetup"));
const RealMoneyDashboard = lazy(() => import("./components/RealMoneyDashboard"));
const DepositPage = lazy(() => import("./components/DepositPage"));
const MemberDepositPage = lazy(() => import("./components/MemberDepositPage"));
const AuthDiagnosticTool = lazy(() => import("./components/AuthDiagnosticTool"));
const QuickCreateMember = lazy(() => import("./components/QuickCreateMember"));
const TestAccountCreator = lazy(() => import("./components/TestAccountCreator"));
const SimpleAccountCreator = lazy(() => import("./components/SimpleAccountCreator"));
const QuickLoginTest = lazy(() => import("./components/QuickLoginTest"));
const BackendTest = lazy(() => import("./components/BackendTest"));
const ComprehensiveTest = lazy(() => import("./components/ComprehensiveTest"));
const DebugPage = lazy(() => import("./components/DebugPage"));
const TestChart = lazy(() => import("./components/TestChart"));
const SupabaseTestPage = lazy(() => import("./components/SupabaseTestPage"));
const QuickFixDashboard = lazy(() => import("./components/QuickFixDashboard"));
const DeploymentGuide = lazy(() => import("./components/DeploymentGuide"));
const ManualDeploymentHelper = lazy(() => import("./components/ManualDeploymentHelper"));
const QuickSignup = lazy(() => import("./components/QuickSignup"));
const BackendRouteTest = lazy(() => import("./components/BackendRouteTest"));
const DirectSignup = lazy(() => import("./components/DirectSignup"));
const PasswordResetUtility = lazy(() => import("./components/PasswordResetUtility"));

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
        element: <LazyComponent Component={ProTradingDashboard} />, // ✅ NEW: Professional trading dashboard matching design spec!
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
        path: "member-pro",
        element: <LazyComponent Component={ProTradingDashboard} />, // ✅ Pro version (same as /member)
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
        path: "quick-signup",
        element: <LazyComponent Component={QuickSignup} />,
      },
      {
        path: "backend-route-test",
        element: <LazyComponent Component={BackendRouteTest} />,
      },
      {
        path: "direct-signup",
        element: <LazyComponent Component={DirectSignup} />,
      },
      {
        path: "password-reset-utility",
        element: <LazyComponent Component={PasswordResetUtility} />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);