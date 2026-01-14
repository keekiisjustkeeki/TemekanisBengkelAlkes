// TEMEKANIS - Notification JavaScript

// Initialize notifications
document.addEventListener('DOMContentLoaded', function() {
    setupToastContainer();
});

// Setup toast container
function setupToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1060';
        document.body.appendChild(container);
    }
}

// Show notification
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${getToastClass(type)} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="bi ${getToastIcon(type)} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    container.appendChild(toast);

    // Initialize Bootstrap toast
    const bsToast = new bootstrap.Toast(toast, {
        autohide: duration > 0,
        delay: duration
    });

    bsToast.show();

    // Remove from DOM after hide
    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });

    // Play sound if enabled
    playNotificationSound(type);
}

// Get toast class
function getToastClass(type) {
    const classes = {
        success: 'success',
        error: 'danger',
        warning: 'warning',
        info: 'info'
    };
    return classes[type] || 'info';
}

// Get toast icon
function getToastIcon(type) {
    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-exclamation-triangle-fill',
        warning: 'bi-exclamation-triangle-fill',
        info: 'bi-info-circle-fill'
    };
    return icons[type] || 'bi-info-circle-fill';
}

// Show loading notification
function showLoadingNotification(message = 'Memproses...') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Remove existing loading toasts
    const existingLoading = container.querySelector('.loading-toast');
    if (existingLoading) {
        existingLoading.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast loading-toast align-items-center text-white bg-info border-0';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <div class="spinner-border spinner-border-sm me-2" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                ${message}
            </div>
        </div>
    `;

    container.appendChild(toast);

    // Initialize Bootstrap toast (no autohide)
    const bsToast = new bootstrap.Toast(toast, {
        autohide: false
    });

    bsToast.show();

    return toast;
}

// Hide loading notification
function hideLoadingNotification() {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const loadingToast = container.querySelector('.loading-toast');
    if (loadingToast) {
        const bsToast = bootstrap.Toast.getInstance(loadingToast);
        if (bsToast) {
            bsToast.hide();
        } else {
            loadingToast.remove();
        }
    }
}

// Clear all notifications
function clearNotifications() {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toasts = container.querySelectorAll('.toast');
    toasts.forEach(toast => {
        const bsToast = bootstrap.Toast.getInstance(toast);
        if (bsToast) {
            bsToast.hide();
        } else {
            toast.remove();
        }
    });
}

// Notification queue for managing multiple notifications
class NotificationQueue {
    constructor(maxConcurrent = 3) {
        this.queue = [];
        this.active = 0;
        this.maxConcurrent = maxConcurrent;
    }

    add(notification) {
        this.queue.push(notification);
        this.process();
    }

    process() {
        if (this.active >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }

        this.active++;
        const notification = this.queue.shift();

        showNotification(notification.message, notification.type, notification.duration);

        setTimeout(() => {
            this.active--;
            this.process();
        }, notification.duration + 500);
    }
}

const notificationQueue = new NotificationQueue();

// Queued notification functions
function showQueuedNotification(message, type = 'info', duration = 5000) {
    notificationQueue.add({ message, type, duration });
}

function showSuccessNotification(message, duration = 5000) {
    showQueuedNotification(message, 'success', duration);
}

function showErrorNotification(message, duration = 5000) {
    showQueuedNotification(message, 'error', duration);
}

function showWarningNotification(message, duration = 5000) {
    showQueuedNotification(message, 'warning', duration);
}

function showInfoNotification(message, duration = 5000) {
    showQueuedNotification(message, 'info', duration);
}

// Progress notification
function showProgressNotification(message, progress = 0) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    let progressToast = container.querySelector('.progress-toast');
    if (!progressToast) {
        progressToast = document.createElement('div');
        progressToast.className = 'toast progress-toast align-items-center text-white bg-primary border-0';
        progressToast.setAttribute('role', 'alert');
        progressToast.setAttribute('aria-live', 'assertive');
        progressToast.setAttribute('aria-atomic', 'true');

        progressToast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body w-100">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span id="progress-message">${message}</span>
                        <span id="progress-percent">0%</span>
                    </div>
                    <div class="progress" style="height: 6px;">
                        <div id="progress-bar" class="progress-bar bg-white" role="progressbar" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(progressToast);

        const bsToast = new bootstrap.Toast(progressToast, {
            autohide: false
        });
        bsToast.show();
    }

    document.getElementById('progress-message').textContent = message;
    document.getElementById('progress-percent').textContent = Math.round(progress) + '%';
    document.getElementById('progress-bar').style.width = progress + '%';

    return progressToast;
}

// Hide progress notification
function hideProgressNotification() {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const progressToast = container.querySelector('.progress-toast');
    if (progressToast) {
        const bsToast = bootstrap.Toast.getInstance(progressToast);
        if (bsToast) {
            bsToast.hide();
        } else {
            progressToast.remove();
        }
    }
}

// Action notification
function showActionNotification(message, actionText, actionCallback, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${getToastClass(type)} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="bi ${getToastIcon(type)} me-2"></i>
                ${message}
            </div>
            <div class="d-flex align-items-center">
                <button type="button" class="btn btn-sm btn-outline-light me-2" id="action-btn">${actionText}</button>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    container.appendChild(toast);

    // Action button event
    document.getElementById('action-btn').addEventListener('click', function() {
        actionCallback();
        const bsToast = bootstrap.Toast.getInstance(toast);
        if (bsToast) {
            bsToast.hide();
        }
    });

    const bsToast = new bootstrap.Toast(toast, {
        autohide: false
    });
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', function() {
        toast.remove();
    });
}

// Play notification sound
function playNotificationSound(type) {
    const soundEnabled = localStorage.getItem('notificationSound') !== 'false';
    if (!soundEnabled) return;

    // Simple beep sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const frequencies = {
            success: 800,
            error: 400,
            warning: 600,
            info: 500
        };

        oscillator.frequency.setValueAtTime(frequencies[type] || 500, audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        // Fallback: no sound
        console.log('Audio not supported');
    }
}

// Toggle notification sound
function toggleNotificationSound() {
    const current = localStorage.getItem('notificationSound') !== 'false';
    localStorage.setItem('notificationSound', !current);
    showNotification(`Suara notifikasi ${!current ? 'diaktifkan' : 'dinonaktifkan'}`, 'info');
}

// Export functions
window.NotificationUtils = {
    showNotification,
    showLoadingNotification,
    hideLoadingNotification,
    clearNotifications,
    showQueuedNotification,
    showSuccessNotification,
    showErrorNotification,
    showWarningNotification,
    showInfoNotification,
    showProgressNotification,
    hideProgressNotification,
    showActionNotification,
    playNotificationSound,
    toggleNotificationSound
};
