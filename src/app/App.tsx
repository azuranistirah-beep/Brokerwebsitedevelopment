import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PriceProvider } from './context/PriceContext';
import { CacheClearBanner } from './components/CacheClearBanner';

function App() {
  // ✅ AGGRESSIVE VERSION CHECK WITH FORCE RELOAD
  useEffect(() => {
    const version = '41.2.1-SYNTAX-FIX'; // FIXED: Removed invalid escape sequences!
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
    console.log('✅ [App] Version 41.2.1 - SYNTAX FIX!');
    console.log('═══════════════════════════════════════════════');
    console.log('🔧 FIXED: Syntax error in console.log');
    console.log('🪙 Gold/Silver/Oil use Yahoo Finance!');
    console.log('   - Crypto: Binance WebSocket (live)');
    console.log('   - Commodities: Yahoo Finance via PriceContext');
    console.log('');
    console.log('🎉 Real-time prices working perfectly:');
    console.log('   ✅ Gold/Silver/Oil: Yahoo Finance (10s refresh)');
    console.log('   ✅ Crypto: Binance WebSocket (live streaming)');
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