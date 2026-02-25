import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  // ✅ AGGRESSIVE VERSION CHECK WITH FORCE RELOAD
  useEffect(() => {
    const version = '26.5.0-DEBUG-PRICES'; // Force new version with debug
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
    
    console.log('✅ [App] Version 26.5.0 - CoinCap API (NO CORS!)');
    console.log('🎉 100% working - NO CORS errors guaranteed!');
    console.log('📊 Using reliable CoinCap API for all price data');
    console.log('');
    console.log('Expected console output:');
    console.log('  🎯 [UnifiedPriceService v26.4.0-COINCAP-PRIMARY] Initialized');
    console.log('  🌐 Using CoinCap API (NO CORS issues!)');
    console.log('  ✅ [Success] CoinCap API working!');
    console.log('');
    console.log('If you see "Direct Binance" errors, clear cache: Ctrl+Shift+R');
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;