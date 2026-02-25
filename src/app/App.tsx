import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PriceProvider } from './context/PriceContext';
import { CacheClearBanner } from './components/CacheClearBanner';

function App() {
  // ✅ AGGRESSIVE VERSION CHECK WITH FORCE RELOAD
  useEffect(() => {
    const version = '39.1.0-BACKEND-451-FIX'; // FIXED: Backend with multiple endpoints!
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
    console.log('✅ [App] Version 39.1.0 - BACKEND 451 FIX!');
    console.log('═══════════════════════════════════════════════');
    console.log('🔧 FIXED: Backend route /binance/ticker/24hr updated!');
    console.log('🔧 Multiple Binance endpoints (api, api1, api2, api3, data-api)');
    console.log('🔧 CoinGecko fallback automatic (46 crypto symbols)');
    console.log('💡 Price sources: Binance → CoinGecko (seamless)');
    console.log('📡 Check Network tab for X-Price-Source header!');
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