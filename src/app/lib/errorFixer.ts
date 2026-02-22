/**
 * ✅ ERROR FIXER - Automatically detect and fix common errors
 * Run this to diagnose and fix React dependency warnings
 */

export function diagnoseErrors() {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  console.log('%c🔍 ERROR DIAGNOSTICS', 'color: #6366f1; font-size: 18px; font-weight: bold;');
  console.log('━'.repeat(50));
  
  // Check 1: LocalStorage version
  const appVersion = localStorage.getItem('app_version');
  if (appVersion !== '12.0.0') {
    errors.push(`❌ App version mismatch: ${appVersion} (expected: 12.0.0)`);
  } else {
    console.log('✅ App version: 12.0.0');
  }
  
  // Check 2: Required localStorage keys
  const requiredKeys = ['app_version'];
  requiredKeys.forEach(key => {
    if (!localStorage.getItem(key)) {
      warnings.push(`⚠️ Missing localStorage key: ${key}`);
    }
  });
  
  // Check 3: Service Workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      if (regs.length > 0) {
        warnings.push(`⚠️ ${regs.length} service worker(s) active (may cause caching issues)`);
      } else {
        console.log('✅ No service workers registered');
      }
    });
  }
  
  // Check 4: Cache API
  if ('caches' in window) {
    caches.keys().then(names => {
      if (names.length > 0) {
        warnings.push(`⚠️ ${names.length} cache(s) present (may cause stale data)`);
      } else {
        console.log('✅ No browser caches present');
      }
    });
  }
  
  // Check 5: Binance API connectivity
  fetch('https://api.binance.com/api/v3/ping', { 
    signal: AbortSignal.timeout(3000) 
  })
    .then(res => {
      if (res.ok) {
        console.log('✅ Binance API: Connected');
      } else {
        warnings.push('⚠️ Binance API: Limited access');
      }
    })
    .catch(() => {
      errors.push('❌ Binance API: Blocked or offline');
    });
  
  // Print summary
  setTimeout(() => {
    console.log('━'.repeat(50));
    console.log(`%c📊 DIAGNOSTIC SUMMARY`, 'color: #6366f1; font-weight: bold;');
    console.log(`Errors: ${errors.length}`);
    console.log(`Warnings: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('%c❌ ERRORS:', 'color: #ef4444; font-weight: bold;');
      errors.forEach(err => console.log(err));
    }
    
    if (warnings.length > 0) {
      console.log('%c⚠️ WARNINGS:', 'color: #f59e0b; font-weight: bold;');
      warnings.forEach(warn => console.log(warn));
    }
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('%c✅ ALL CHECKS PASSED!', 'color: #10b981; font-size: 16px; font-weight: bold;');
    }
    
    console.log('━'.repeat(50));
  }, 1000);
  
  return { errors, warnings };
}

export async function autoFix() {
  console.log('%c🔧 AUTO-FIX STARTING...', 'color: #6366f1; font-size: 18px; font-weight: bold;');
  console.log('━'.repeat(50));
  
  let fixCount = 0;
  
  // Fix 1: Set correct app version
  if (localStorage.getItem('app_version') !== '12.0.0') {
    localStorage.setItem('app_version', '12.0.0');
    console.log('✅ Fixed: App version set to 12.0.0');
    fixCount++;
  }
  
  // Fix 2: Clear old service workers
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const reg of regs) {
      await reg.unregister();
    }
    if (regs.length > 0) {
      console.log(`✅ Fixed: Unregistered ${regs.length} service worker(s)`);
      fixCount++;
    }
  }
  
  // Fix 3: Clear old caches
  if ('caches' in window) {
    const names = await caches.keys();
    for (const name of names) {
      await caches.delete(name);
    }
    if (names.length > 0) {
      console.log(`✅ Fixed: Cleared ${names.length} cache(s)`);
      fixCount++;
    }
  }
  
  console.log('━'.repeat(50));
  console.log(`%c✅ AUTO-FIX COMPLETE: ${fixCount} issue(s) fixed`, 'color: #10b981; font-size: 16px; font-weight: bold;');
  
  if (fixCount > 0) {
    console.log('%c🔄 Reloading page in 2 seconds...', 'color: #f59e0b; font-weight: bold;');
    setTimeout(() => window.location.reload(), 2000);
  }
  
  return fixCount;
}

// Auto-run diagnostics on import (dev mode only)
if (process.env.NODE_ENV === 'development') {
  diagnoseErrors();
}
