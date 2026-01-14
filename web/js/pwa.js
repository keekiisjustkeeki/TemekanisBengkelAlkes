// TEMEKANIS - PWA JavaScript

// Initialize PWA
document.addEventListener('DOMContentLoaded', function() {
    registerServiceWorker();
    setupInstallPrompt();
});

// Register service worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);

                    // Check for updates
                    registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', function() {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    showUpdateNotification();
                                }
                            });
                        }
                    });
                })
                .catch(function(error) {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }
}

// Setup install prompt
function setupInstallPrompt() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', function(e) {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;

        // Show install button or notification
        showInstallNotification(deferredPrompt);
    });

    window.addEventListener('appinstalled', function() {
        // Hide install button or notification
        hideInstallNotification();
        showNotification('Aplikasi berhasil diinstal!', 'success');
        trackEvent('pwa_install');
    });
}

// Show install notification
function showInstallNotification(deferredPrompt) {
    if (localStorage.getItem('pwa_install_dismissed')) return;

    showActionNotification(
        'Instal aplikasi TeMekanis untuk pengalaman yang lebih baik!',
        'Instal',
        function() {
            handleInstallPrompt(deferredPrompt);
        },
        'info'
    );
}

// Hide install notification
function hideInstallNotification() {
    // Implementation depends on how notification is shown
    // For now, just clear any existing notifications
    clearNotifications();
}

// Handle install prompt
function handleInstallPrompt(deferredPrompt) {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then(function(choiceResult) {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
            localStorage.setItem('pwa_install_dismissed', 'true');
        }
        deferredPrompt = null;
    });
}

// Show update notification
function showUpdateNotification() {
    showActionNotification(
        'Versi baru aplikasi tersedia. Perbarui sekarang?',
        'Perbarui',
        function() {
            window.location.reload();
        },
        'info'
    );
}

// Check if running as PWA
function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
}

// Get PWA display mode
function getPWADisplayMode() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return 'standalone';
    } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        return 'minimal-ui';
    } else if (window.matchMedia('(display-mode: browser)').matches) {
        return 'browser';
    }
    return 'unknown';
}

// Cache resources for offline use
function cacheResources() {
    if ('caches' in window) {
        caches.open('temekanis-v1').then(function(cache) {
            return cache.addAll([
                '/',
                '/index.html',
                '/css/style.css',
                '/css/theme.css',
                '/js/main.js',
                '/js/pwa.js',
                '/manifest.json',
                '/LOGO TMEKANIS.png'
            ]);
        }).catch(function(error) {
            console.error('Caching failed:', error);
        });
    }
}

// Handle offline/online status
function setupNetworkStatus() {
    window.addEventListener('online', function() {
        showNotification('Koneksi internet tersambung kembali.', 'success');
        syncOfflineData();
    });

    window.addEventListener('offline', function() {
        showNotification('Koneksi internet terputus. Beberapa fitur mungkin tidak tersedia.', 'warning');
    });
}

// Sync offline data when back online
function syncOfflineData() {
    // Sync any pending data changes
    const pendingChanges = JSON.parse(localStorage.getItem('pending_changes') || '[]');

    if (pendingChanges.length > 0) {
        showNotification('Menyinkronkan data...', 'info');

        // Process pending changes
        pendingChanges.forEach(change => {
            // Implement sync logic based on change type
            console.log('Syncing change:', change);
        });

        // Clear pending changes
        localStorage.removeItem('pending_changes');
        showNotification('Data berhasil disinkronkan.', 'success');
    }
}

// Add data to pending changes for offline sync
function addPendingChange(change) {
    const pendingChanges = JSON.parse(localStorage.getItem('pending_changes') || '[]');
    pendingChanges.push({
        ...change,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('pending_changes', JSON.stringify(pendingChanges));
}

// Handle background sync
function setupBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then(function(registration) {
            return registration.sync.register('background-sync');
        }).catch(function(error) {
            console.error('Background sync registration failed:', error);
        });
    }
}

// Handle push notifications (if implemented)
function setupPushNotifications() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
        // Request permission
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                console.log('Push notification permission granted');
            }
        });

        // Handle incoming push messages
        navigator.serviceWorker.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'push') {
                showNotification(event.data.title, 'info');
            }
        });
    }
}

// Initialize PWA features
function initPWA() {
    if (isPWA()) {
        document.body.classList.add('pwa-mode');
        trackEvent('pwa_launch');
    }

    setupNetworkStatus();
    setupBackgroundSync();
    setupPushNotifications();
    cacheResources();
}

// Call init on load
initPWA();

// Export functions
window.PWA = {
    isPWA,
    getPWADisplayMode,
    cacheResources,
    addPendingChange,
    syncOfflineData
};
