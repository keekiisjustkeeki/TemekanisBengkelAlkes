// TEMEKANIS - Main JavaScript

// Global variables
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

// Initialize app
function initApp() {
    // Initialize theme
    initTheme();

    // Initialize components
    initComponents();

    // Load contact information
    loadContactInfo();

    // Load gallery images
    loadGalleryImages();

    // Setup global events
    setupGlobalEvents();

    // Track page view
    trackPageView();

    // Initialize PWA if available
    if (typeof PWA !== 'undefined') {
        PWA.initPWA();
    }
}

// Initialize theme
function initTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');

    if (isDarkMode) {
        body.classList.add('dark-theme');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="bi bi-sun"></i>';
            themeToggle.title = 'Mode Terang';
        }
    } else {
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="bi bi-moon"></i>';
            themeToggle.title = 'Mode Gelap';
        }
    }

    // Setup theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// Toggle theme
function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);

    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');

    if (isDarkMode) {
        body.classList.add('dark-theme');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="bi bi-sun"></i>';
            themeToggle.title = 'Mode Terang';
        }
        showNotification('Mode gelap diaktifkan.', 'info');
    } else {
        body.classList.remove('dark-theme');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="bi bi-moon"></i>';
            themeToggle.title = 'Mode Gelap';
        }
        showNotification('Mode terang diaktifkan.', 'info');
    }

    trackEvent('theme_toggle', { mode: isDarkMode ? 'dark' : 'light' });
}

// Initialize components
function initComponents() {
    // Initialize tooltips
    initTooltips();

    // Initialize popovers
    initPopovers();

    // Initialize lazy loading
    initLazyLoading();

    // Initialize animations
    initAnimations();
}

// Initialize tooltips
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Initialize popovers
function initPopovers() {
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

// Initialize lazy loading
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(function(img) {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(function(img) {
            img.src = img.dataset.src;
        });
    }
}

// Initialize animations
function initAnimations() {
    // Add animation classes to elements
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(function(el) {
            animationObserver.observe(el);
        });
    }
}

// Load contact information (hardcoded)
function loadContactInfo() {
    // Contact information is now hardcoded in HTML
    // This function is kept for compatibility but no longer loads from localStorage
}

// Load gallery images from galeri folder
function loadGalleryImages() {
    const galleryTrack = document.getElementById('gallery-track');
    if (!galleryTrack) return;

    // List of gallery images (you can add more images to images/galeri/ folder)
    const galleryImages = [
        'images/galeri/544877218_18026130503721893_2017438710361501895_n.jpg',
        'images/galeri/545335383_18026065796721893_3309926255487628621_n.jpg',
        'images/galeri/546262900_18026130488721893_8392955850337655285_n.jpg',
        'images/galeri/547373441_18026130506721893_3947593962791537705_n.jpg',
        'images/galeri/576008780_18033500909721893_8335080155313084645_n.webp',
        'images/galeri/579683243_18033470054721893_7917706045838525185_n.webp'
    ];

    // Clear existing content
    galleryTrack.innerHTML = '';

    // Create cards for each image (duplicate for infinite scroll)
    const allImages = [...galleryImages, ...galleryImages]; // Duplicate for seamless scrolling

    allImages.forEach((imageSrc, index) => {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.innerHTML = `
            <img src="${imageSrc}" alt="Galeri Perbaikan ${index + 1}" loading="lazy">
        `;
        galleryTrack.appendChild(card);
    });

    // Initialize gallery navigation
    initGalleryNavigation();
}

// Initialize gallery navigation
function initGalleryNavigation() {
    const galleryTrack = document.getElementById('gallery-track');
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');

    if (!galleryTrack || !prevBtn || !nextBtn) return;

    let currentPosition = 0;
    const cardWidth = 320; // 300px card + 20px gap
    const totalCards = galleryTrack.children.length;
    const visibleCards = Math.floor(window.innerWidth / cardWidth) || 1;
    const maxPosition = -(totalCards - visibleCards) * cardWidth;

    // Next button
    nextBtn.addEventListener('click', () => {
        currentPosition -= cardWidth;
        if (currentPosition < maxPosition) {
            currentPosition = 0; // Loop back to start
        }
        galleryTrack.style.transform = `translateX(${currentPosition}px)`;
    });

    // Previous button
    prevBtn.addEventListener('click', () => {
        currentPosition += cardWidth;
        if (currentPosition > 0) {
            currentPosition = maxPosition; // Loop to end
        }
        galleryTrack.style.transform = `translateX(${currentPosition}px)`;
    });

    // Auto-scroll every 5 seconds
    setInterval(() => {
        currentPosition -= cardWidth;
        if (currentPosition < maxPosition) {
            currentPosition = 0;
        }
        galleryTrack.style.transform = `translateX(${currentPosition}px)`;
    }, 5000);
}

// Setup global events
function setupGlobalEvents() {
    // Handle online/offline status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Handle visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle before unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Handle resize
    window.addEventListener('resize', debounce(handleResize, 250));

    // Handle scroll
    window.addEventListener('scroll', debounce(handleScroll, 100));

    // Handle keydown
    document.addEventListener('keydown', handleKeydown);

    // Handle context menu
    document.addEventListener('contextmenu', handleContextMenu);

    // Handle storage changes (for contact info synchronization)
    window.addEventListener('storage', handleStorageChange);

    // Handle errors
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
}

// Handle online status
function handleOnline() {
    showNotification('Koneksi internet tersambung kembali.', 'success');
    trackEvent('network_status', { status: 'online' });
}

// Handle offline status
function handleOffline() {
    showNotification('Koneksi internet terputus.', 'warning');
    trackEvent('network_status', { status: 'offline' });
}

// Handle visibility change
function handleVisibilityChange() {
    if (document.hidden) {
        trackEvent('page_visibility', { status: 'hidden' });
    } else {
        trackEvent('page_visibility', { status: 'visible' });
    }
}

// Handle before unload
function handleBeforeUnload(e) {
    trackEvent('page_unload');
}

// Handle resize
function handleResize() {
    trackEvent('window_resize', {
        width: window.innerWidth,
        height: window.innerHeight
    });
}

// Handle scroll
function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);

    // Track scroll milestones
    if (scrollPercent >= 25 && scrollPercent < 50 && !localStorage.getItem('scroll_25')) {
        localStorage.setItem('scroll_25', 'true');
        trackEvent('scroll_milestone', { percent: 25 });
    } else if (scrollPercent >= 50 && scrollPercent < 75 && !localStorage.getItem('scroll_50')) {
        localStorage.setItem('scroll_50', 'true');
        trackEvent('scroll_milestone', { percent: 50 });
    } else if (scrollPercent >= 75 && scrollPercent < 100 && !localStorage.getItem('scroll_75')) {
        localStorage.setItem('scroll_75', 'true');
        trackEvent('scroll_milestone', { percent: 75 });
    } else if (scrollPercent >= 100 && !localStorage.getItem('scroll_100')) {
        localStorage.setItem('scroll_100', 'true');
        trackEvent('scroll_milestone', { percent: 100 });
    }
}

// Handle keydown
function handleKeydown(e) {
    // Handle escape key
    if (e.key === 'Escape') {
        // Close modals, etc.
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        });
    }

    // Handle theme toggle shortcut (Ctrl/Cmd + Shift + T)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        toggleTheme();
    }
}

// Handle context menu
function handleContextMenu(e) {
    // Prevent right-click on certain elements if needed
    // For now, allow default behavior
}

// Handle errors
function handleError(e) {
    console.error('JavaScript Error:', e.error);
    trackEvent('javascript_error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
    });
}

// Handle unhandled rejections
function handleUnhandledRejection(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
    trackEvent('unhandled_rejection', {
        reason: e.reason ? e.reason.toString() : 'Unknown'
    });
}

// Handle storage changes (for real-time synchronization)
function handleStorageChange(e) {
    // Check if the changed key is 'kontak' (contact information)
    if (e.key === 'kontak') {
        console.log('Contact information updated, refreshing display...');
        loadContactInfo();
    }
}



// Utility functions

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Copy to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
            showNotification('Teks berhasil disalin.', 'success');
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

// Fallback copy function
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showNotification('Teks berhasil disalin.', 'success');
        } else {
            showNotification('Gagal menyalin teks.', 'error');
        }
    } catch (err) {
        showNotification('Gagal menyalin teks.', 'error');
    }

    document.body.removeChild(textArea);
}

// Show loading state
function showLoading(elementId, text = 'Memproses...') {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.innerHTML = `
        <div class="d-flex justify-content-center align-items-center">
            <div class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            ${text}
        </div>
    `;
    element.disabled = true;
}

// Hide loading state
function hideLoading(elementId, originalText = '') {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.innerHTML = originalText;
    element.disabled = false;
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone number
function validatePhone(phone) {
    const re = /^[\+]?[0-9\-\(\)\s]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Generate random ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Set URL parameter
function setUrlParameter(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url);
}

// Remove URL parameter
function removeUrlParameter(key) {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.pushState({}, '', url);
}

// Export utility functions
window.AppUtils = {
    debounce,
    throttle,
    formatCurrency,
    truncateText,
    copyToClipboard,
    showLoading,
    hideLoading,
    validateEmail,
    validatePhone,
    generateId,
    getUrlParameter,
    setUrlParameter,
    removeUrlParameter,
    isDarkMode: () => isDarkMode
};
