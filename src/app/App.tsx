import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PriceProvider } from './context/PriceContext';
import { CacheClearBanner } from './components/CacheClearBanner';

function App() {
  // ✅ AGGRESSIVE VERSION CHECK WITH FORCE RELOAD
  useEffect(() => {
    const version = '41.0.0-YAHOO-FINANCE'; // NEW: Real-time Yahoo Finance for Gold, Commodities, Forex, Stocks!
    const stored = localStorage.getItem('app_version');
    
    // If version mismatch, FORCE hard reload
    if (stored !== version) {
      console.log('🔄 [App] Critical version update detected!');
      console.log(`   Old: ${stored || 'unknown'}`);
      console.log(`   New: ${version}`);
      console.log('🔄 Forcing hard reload to clear cache...');
      
      // Update version first
      localStorage.setItem('app_version', version);
      
      // Force hard reload (bypasses cache)
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
      return; // Don't continue initialization
    }
    
    console.log('');
    console.log('═══════════════════════════════════════════════');
    console.log('✅ [App] Version 41.0.0 - YAHOO FINANCE INTEGRATED!');
    console.log('═══════════════════════════════════════════════');
    console.log('🎉 NEW: Real-time prices from Yahoo Finance!');
    console.log('   ✅ Gold/Silver/Oil: REAL-TIME (updates every 10s)');
    console.log('   ✅ Forex: REAL-TIME (updates every 10s)');
    console.log('   ✅ Stocks: REAL-TIME (updates every 10s)');
    console.log('   ✅ Crypto: Binance WebSocket (live streaming)');
    console.log('🔧 Backend v23.0.0: Yahoo Finance endpoint enabled!');
    console.log('💡 NO API KEY NEEDED - Yahoo Finance is FREE!');
    console.log('🚀 Gold price now EXACT MATCH with TradingView!');
    console.log('═══════════════════════════════════════════════');
    console.log('');
  }, []);

  return (
    <ErrorBoundary>
      <PriceProvider>
        <RouterProvider router={router} />
        <CacheClearBanner />
      </PriceProvider>
    </ErrorBoundary>
  );
}

export default App;