import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppProvider } from "./context/AppContext";
import { useEffect } from "react";

// Suppress all console warnings and errors related to WebSocket, TradingView, and network issues
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args: any[]) => {
  const message = args.join(' ');
  if (
    message.includes('WebSocket') ||
    message.includes('HTTP polling') ||
    message.includes('Failed to fetch') ||
    message.includes('fallback') ||
    message.includes('mock price') ||
    message.includes('Binance') ||
    message.includes('tradingview') ||
    message.includes('isTrusted')
  ) {
    return; // Silently suppress
  }
  originalWarn.apply(console, args);
};

console.error = (...args: any[]) => {
  const message = args.join(' ');
  if (
    message.includes('WebSocket') ||
    message.includes('HTTP polling') ||
    message.includes('Failed to fetch') ||
    message.includes('fallback') ||
    message.includes('mock price') ||
    message.includes('Binance') ||
    message.includes('isTrusted') ||
    message.includes('tradingview') ||
    message.includes('ws://') ||
    message.includes('wss://')
  ) {
    return; // Silently suppress
  }
  originalError.apply(console, args);
};

function App() {
  // Global error handler for WebSocket errors from TradingView widget
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      if (
        event.message?.includes('WebSocket') ||
        event.message?.includes('tradingview') ||
        event.error?.type === 'error'
      ) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    window.addEventListener('error', handleGlobalError, true);
    
    return () => {
      window.removeEventListener('error', handleGlobalError, true);
    };
  }, []);

  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}

export default App;