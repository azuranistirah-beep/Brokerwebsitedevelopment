import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PriceProvider } from './context/PriceContext';
import { CacheClearBanner } from './components/CacheClearBanner';

function App() {
  // ✅ AGGRESSIVE VERSION CHECK WITH FORCE RELOAD
  useEffect(() => {
    const version = '42.2.0-PASSWORD-RESET-FIX'; // ADDED: Password reset utility
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
    console.log('✅ [App] Version 42.2.0 - PASSWORD RESET FIX!');
    console.log('═══════════════════════════════════════════════');
    console.log('');
    console.log('🔑 SOLUSI LOGIN ERROR "Invalid login credentials":');
    console.log('');
    console.log('   STEP 1 - RESET PASSWORD:');
    console.log('   → Go to: http://localhost:5173/password-reset-utility');
    console.log('   → Click: "Reset Password Now"');
    console.log('   → Tunggu pesan SUCCESS');
    console.log('');
    console.log('   STEP 2 - LOGIN:');
    console.log('   → Click: "Go to Login Page" (atau go to /direct-signup)');
    console.log('   → Email: azuranistirah@gmail.com');
    console.log('   → Password: Sundala99!');
    console.log('   → Click: "Create Account & Login"');
    console.log('   → Done! 🎉');
    console.log('');
    console.log('📍 AVAILABLE ROUTES:');
    console.log('   /password-reset-utility  → ⭐ FIX LOGIN ERROR');
    console.log('   /direct-signup           → Login/Signup page');
    console.log('   /member                  → Trading dashboard');
    console.log('   /backend-route-test      → Test backend');
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