import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PriceProvider } from './context/PriceContext';
import { CacheClearBanner } from './components/CacheClearBanner';

function App() {
  // ✅ AGGRESSIVE VERSION CHECK WITH FORCE RELOAD
  useEffect(() => {
    const version = '39.0.0-ANTI-451'; // FIXED: Multiple endpoints + CoinGecko fallback!
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
    console.log('✅ [App] Version 39.0.0 - ANTI 451 ERROR!');
    console.log('═══════════════════════════════════════════════');
    console.log('🔧 FIXED: Multiple Binance endpoints (api, api1, api2, api3)');
    console.log('🔧 FIXED: CoinGecko fallback if Binance blocked (451)');
    console.log('🔧 User-Agent header to bypass blocking');
    console.log('💡 Price sources: Binance → CoinGecko (automatic)');
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