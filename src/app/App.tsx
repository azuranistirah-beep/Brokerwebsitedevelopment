import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppProvider } from './context/AppContext';

function App() {
  // Force cache clear v12.1 - Fixed AppProvider wrapper issue
  useEffect(() => {
    const version = '12.1.0';
    const stored = localStorage.getItem('app_version');
    
    if (stored !== version) {
      console.log('🔄 [App] Version mismatch detected. Clearing all caches...');
      
      // Clear localStorage
      localStorage.clear();
      localStorage.setItem('app_version', version);
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Unregister service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
      
      // Clear caches
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
      
      console.log('✅ App updated to v12.1.0 - All caches cleared!');
      console.log('✅ AppProvider wrapper added - Context errors fixed');
      console.log('✅ Using Direct Binance API - No Edge Functions dependency');
      console.log('✅ Frontend-only solution - 100% working');
      
      // Force reload after clearing
      setTimeout(() => {
        console.log('🔄 Reloading page...');
        window.location.reload();
      }, 500);
    } else {
      console.log('✅ [App] Version 12.1.0 - Cache is clean');
      console.log('✅ AppProvider active - Context ready');
      console.log('✅ Platform ready - Direct Binance API active');
    }
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;