import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PriceProvider } from './context/PriceContext';
import { CacheClearBanner } from './components/CacheClearBanner';

function App() {
  // ✅ AGGRESSIVE VERSION CHECK WITH FORCE RELOAD
  useEffect(() => {
    const version = '38.2.0-TIMEOUT-FIX'; // FIXED: Added timeout handling!
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
    console.log('✅ [App] Version 38.2.0 - TIMEOUT FIX!');
    console.log('═══════════════════════════════════════════════');
    console.log('🔧 FIXED: Added timeout handling (10s backend, 12s frontend)');
    console.log('🔧 Backend: AbortController prevents hanging');
    console.log('🔧 Frontend: Graceful error handling on timeout');
    console.log('💡 Binance API connection should be stable now!');
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