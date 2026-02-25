/**
 * ✅ CACHE CLEAR BANNER
 * Muncul jika detect error Finnhub di console (old cache)
 */

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function CacheClearBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user already dismissed banner
    const isDismissed = sessionStorage.getItem('cache-banner-dismissed');
    if (isDismissed) {
      return;
    }

    // Intercept console errors to detect Finnhub errors
    const originalError = console.error;
    console.error = function(...args: any[]) {
      const errorStr = args.join(' ');
      
      // Detect Finnhub API errors
      if (errorStr.includes('Finnhub') || errorStr.includes('finnhub') || errorStr.includes('401')) {
        setShowBanner(true);
      }
      
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
    sessionStorage.setItem('cache-banner-dismissed', 'true');
  };

  const handleClearCache = () => {
    // Show instructions
    alert(
      '⚠️ CLEAR BROWSER CACHE:\n\n' +
      '1. Press Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)\n' +
      '2. Select "All time" and check "Cached images and files"\n' +
      '3. Click "Clear data"\n\n' +
      '4. Then press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac) to Hard Refresh\n\n' +
      '5. Check DevTools → Application → Service Workers → Unregister all'
    );
  };

  if (!showBanner || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white py-3 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-2xl">⚠️</div>
          <div className="flex-1">
            <p className="font-semibold text-sm">
              OLD CODE DETECTED - You need to clear browser cache!
            </p>
            <p className="text-xs opacity-90 mt-0.5">
              Press Ctrl+Shift+Delete → Clear Cache → Then Ctrl+Shift+R to Hard Refresh
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearCache}
            className="px-3 py-1.5 bg-white text-red-600 rounded text-xs font-semibold hover:bg-red-50 transition-colors"
          >
            Show Instructions
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-red-500 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
