import { RouterProvider } from "react-router";
import { router } from "./routes";

console.log("✅ App.tsx loaded successfully");

// ✅ Global error handler - ONLY suppress TradingView widget errors
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.toString() || '';
  
  // ONLY suppress TradingView-specific errors, NOT backend API errors
  if (
    reason.includes('contentWindow') ||
    reason.includes('Cannot listen to the event') ||
    (reason.includes('iframe') && reason.includes('TradingView'))
  ) {
    console.warn('⚠️ [App] Suppressing TradingView widget error (expected)');
    event.preventDefault();
    return;
  }
  
  // Log all other errors for debugging
  console.error('❌ [App] Unhandled rejection:', reason);
});

// ✅ Global error handler - ONLY suppress TradingView widget errors
window.addEventListener('error', (event) => {
  const message = event.message?.toString() || '';
  
  // ONLY suppress TradingView-specific errors
  if (
    message.includes('contentWindow') ||
    message.includes('Cannot listen to the event') ||
    (message.includes('iframe') && message.includes('TradingView'))
  ) {
    console.warn('⚠️ [App] Suppressing TradingView widget error (expected)');
    event.preventDefault();
    return;
  }
  
  // Log all other errors for debugging
  console.error('❌ [App] Unhandled error:', message);
});

// ✅ Allow console errors and warnings to show (needed for debugging real-time pricing)
// Only suppress TradingView widget-specific messages
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  const message = args[0]?.toString() || '';
  if (
    message.includes('contentWindow') ||
    message.includes('Cannot listen to the event') ||
    (message.includes('iframe') && message.includes('TradingView'))
  ) {
    return; // Suppress ONLY TradingView widget errors
  }
  originalConsoleError(...args); // Show all other errors
};

console.warn = (...args) => {
  const message = args[0]?.toString() || '';
  if (
    message.includes('contentWindow') ||
    message.includes('Cannot listen to the event') ||
    (message.includes('TradingView') && message.includes('iframe'))
  ) {
    return; // Suppress ONLY TradingView widget warnings
  }
  originalConsoleWarn(...args); // Show all other warnings
};

export default function App() {
  return <RouterProvider router={router} />;
}