/**
 * 🔧 INVESTOFT PLATFORM - CONSOLE FIX SCRIPT
 * 
 * Copy-paste script ini ke Console browser (F12 → Console)
 * untuk fix semua error secara otomatis
 * 
 * Version: 12.0.0
 */

(async function InvestoftAutoFix() {
    console.log('%c🚀 INVESTOFT AUTO-FIX SCRIPT v12.0.0', 'color: #6366f1; font-size: 20px; font-weight: bold;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #6366f1;');
    console.log('');
    
    let stepCount = 0;
    const totalSteps = 7;
    
    const logStep = (message, type = 'info') => {
        stepCount++;
        const colors = {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#6366f1'
        };
        console.log(`%c[${stepCount}/${totalSteps}] ${message}`, `color: ${colors[type]}; font-weight: bold;`);
    };
    
    try {
        // Step 1: Check current status
        logStep('🔍 Checking current status...', 'info');
        const currentVersion = localStorage.getItem('app_version');
        const storageKeys = Object.keys(localStorage);
        console.log(`   Current version: ${currentVersion || 'Not set'}`);
        console.log(`   LocalStorage items: ${storageKeys.length}`);
        console.log('');
        
        // Step 2: Clear localStorage
        logStep('🧹 Clearing localStorage...', 'info');
        const beforeCount = Object.keys(localStorage).length;
        localStorage.clear();
        console.log(`   ✓ Cleared ${beforeCount} items`);
        console.log('');
        
        // Step 3: Clear sessionStorage
        logStep('🧹 Clearing sessionStorage...', 'info');
        sessionStorage.clear();
        console.log('   ✓ Session cleared');
        console.log('');
        
        // Step 4: Unregister service workers
        if ('serviceWorker' in navigator) {
            logStep('🧹 Unregistering service workers...', 'info');
            const registrations = await navigator.serviceWorker.getRegistrations();
            let unregisteredCount = 0;
            for (let registration of registrations) {
                await registration.unregister();
                unregisteredCount++;
            }
            console.log(`   ✓ Unregistered ${unregisteredCount} service worker(s)`);
        } else {
            logStep('⏭️  Service workers not available (skipping)', 'warning');
        }
        console.log('');
        
        // Step 5: Clear caches
        if ('caches' in window) {
            logStep('🧹 Clearing browser caches...', 'info');
            const cacheNames = await caches.keys();
            let deletedCount = 0;
            for (let name of cacheNames) {
                await caches.delete(name);
                deletedCount++;
            }
            console.log(`   ✓ Cleared ${deletedCount} cache(s)`);
        } else {
            logStep('⏭️  Cache API not available (skipping)', 'warning');
        }
        console.log('');
        
        // Step 6: Set new version
        logStep('📝 Setting app version to 12.0.0...', 'info');
        localStorage.setItem('app_version', '12.0.0');
        console.log('   ✓ Version updated to 12.0.0');
        console.log('');
        
        // Step 7: Test Binance API
        logStep('🔍 Testing Binance API connection...', 'info');
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(
                'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=1',
                { signal: controller.signal }
            );
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                const price = parseFloat(data[0][4]);
                console.log(`   ✓ Binance API working perfectly!`);
                console.log(`   ✓ BTC Price: $${price.toFixed(2)}`);
                logStep('✅ Binance API: CONNECTED', 'success');
            } else {
                console.log('   ⚠ Binance API limited access (will use fallback)');
                logStep('⚠️  Binance API: LIMITED', 'warning');
            }
        } catch (error) {
            console.log(`   ⚠ Binance API error: ${error.message}`);
            console.log('   ℹ Platform will use fallback prices');
            logStep('⚠️  Binance API: FALLBACK MODE', 'warning');
        }
        console.log('');
        
        // Final summary
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10b981;');
        console.log('%c✅ ALL FIXES COMPLETED SUCCESSFULLY!', 'color: #10b981; font-size: 18px; font-weight: bold;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10b981;');
        console.log('');
        console.log('%cℹ️  NEXT STEPS:', 'color: #6366f1; font-size: 14px; font-weight: bold;');
        console.log('%c1. Platform akan reload otomatis dalam 3 detik', 'color: #94a3b8;');
        console.log('%c2. Setelah reload, login dengan:', 'color: #94a3b8;');
        console.log('%c   Email: azuranistirah@gmail.com', 'color: #94a3b8;');
        console.log('%c   Password: Sundala99!', 'color: #94a3b8;');
        console.log('%c3. Prices akan update setiap 2 detik dari Binance', 'color: #94a3b8;');
        console.log('');
        
        // Countdown
        for (let i = 3; i > 0; i--) {
            console.log(`%c🔄 Reloading in ${i}...`, 'color: #f59e0b; font-weight: bold;');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('%c🔄 Reloading now...', 'color: #6366f1; font-weight: bold;');
        window.location.reload();
        
    } catch (error) {
        console.log('');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ef4444;');
        console.log('%c❌ ERROR OCCURRED!', 'color: #ef4444; font-size: 18px; font-weight: bold;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ef4444;');
        console.log(`%cError: ${error.message}`, 'color: #ef4444;');
        console.log('');
        console.log('%cℹ️  MANUAL FIX:', 'color: #6366f1; font-weight: bold;');
        console.log('%c1. Close all browser tabs', 'color: #94a3b8;');
        console.log('%c2. Press Ctrl + Shift + Delete', 'color: #94a3b8;');
        console.log('%c3. Clear "Cached images and files"', 'color: #94a3b8;');
        console.log('%c4. Clear "Cookies and other site data"', 'color: #94a3b8;');
        console.log('%c5. Select "All time"', 'color: #94a3b8;');
        console.log('%c6. Click "Clear data"', 'color: #94a3b8;');
        console.log('%c7. Reopen browser and try again', 'color: #94a3b8;');
    }
})();
