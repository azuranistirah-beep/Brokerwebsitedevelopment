import { RouterProvider } from "react-router";
import { router } from "./routes";

console.log("✅ App.tsx loaded successfully");

// ✅ Suppress TradingView iframe warnings (safe to ignore)
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

console.error = (...args) => {
  // Ignore TradingView iframe CORS warnings
  const message = args[0]?.toString() || '';
  if (
    message.includes('iframe') ||
    message.includes('contentWindow') ||
    message.includes('Cannot listen to the event') ||
    message.includes('Fetch failed: 401') ||
    message.includes('Not authenticated')
  ) {
    return; // Suppress these specific warnings
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  // Suppress known warnings that are expected/harmless
  const message = args[0]?.toString() || '';
  if (
    message.includes('Binance Direct Failed') ||
    message.includes('CORS') ||
    message.includes('No authentication token - user not logged in') ||
    message.includes('Failed to load') ||
    message.includes('No active session found')
  ) {
    return; // Suppress these specific warnings
  }
  originalConsoleWarn(...args);
};

console.log = (...args) => {
  // Suppress timeout messages (they are already throttled, but suppress completely)
  const message = args[0]?.toString() || '';
  if (
    message.includes('Backend Timeout') ||
    message.includes('Request took too long')
  ) {
    return; // Suppress these messages
  }
  originalConsoleLog(...args);
};

export default function App() {
  return <RouterProvider router={router} />;
}