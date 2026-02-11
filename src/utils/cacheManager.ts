/**
 * Cache Management Utilities
 * Helps debug and fix module loading issues
 */

export const clearAllCaches = async () => {
  console.log('🧹 Clearing all caches...');
  
  // 1. Clear localStorage
  try {
    localStorage.clear();
    console.log('✅ localStorage cleared');
  } catch (e) {
    console.error('❌ Failed to clear localStorage:', e);
  }
  
  // 2. Clear sessionStorage
  try {
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');
  } catch (e) {
    console.error('❌ Failed to clear sessionStorage:', e);
  }
  
  // 3. Clear Service Worker caches
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('✅ Service Worker caches cleared');
    }
  } catch (e) {
    console.error('❌ Failed to clear Service Worker caches:', e);
  }
  
  // 4. Unregister Service Workers
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
      console.log('✅ Service Workers unregistered');
    }
  } catch (e) {
    console.error('❌ Failed to unregister Service Workers:', e);
  }
  
  console.log('✅ All caches cleared! Reloading...');
};

// Add global function for easy access from console
if (typeof window !== 'undefined') {
  (window as any).clearCaches = clearAllCaches;
  console.log('💡 Tip: Run clearCaches() in console to clear all caches and reload');
}

export default clearAllCaches;
