// TEMEKANIS - Modal JavaScript

// Initialize modals
document.addEventListener('DOMContentLoaded', function() {
    setupModals();
});

// Setup modal functionality
function setupModals() {
    // Contact form modal
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Rate limit for WhatsApp clicks
    setupRateLimit();
}

// Handle contact form submission
function handleContactSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    const honeypot = document.getElementById('honeypot').value;

    // Honeypot check (anti-spam)
    if (honeypot) {
        showNotification('Pesan terdeteksi sebagai spam.', 'error');
        return;
    }

    // Basic validation
    if (!name || !email || !message) {
        showNotification('Semua field harus diisi.', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Format email tidak valid.', 'error');
        return;
    }

    // Simulate sending message
    showNotification('Pesan sedang dikirim...', 'info');

    setTimeout(() => {
        // Reset form
        document.getElementById('contact-form').reset();

        showNotification('Pesan berhasil dikirim! Kami akan segera menghubungi Anda.', 'success');
    }, 2000);
}

// Rate limiting for WhatsApp clicks
let lastWhatsAppClick = 0;
const rateLimitDelay = 30000; // 30 seconds

function setupRateLimit() {
    const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
    whatsappLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const now = Date.now();
            if (now - lastWhatsAppClick < rateLimitDelay) {
                e.preventDefault();
                const remainingTime = Math.ceil((rateLimitDelay - (now - lastWhatsAppClick)) / 1000);
                showNotification(`Harap tunggu ${remainingTime} detik sebelum mengklik WhatsApp lagi.`, 'warning');
                return;
            }
            lastWhatsAppClick = now;
        });
    });
}

// Generic modal functions
function showModal(modalId) {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}

function hideModal(modalId) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) {
        modal.hide();
    }
}

// Confirmation modal
function showConfirmModal(title, message, onConfirm, onCancel = null) {
    // Create modal HTML if it doesn't exist
    let confirmModal = document.getElementById('confirm-modal');
    if (!confirmModal) {
        confirmModal = document.createElement('div');
        confirmModal.className = 'modal fade';
        confirmModal.id = 'confirm-modal';
        confirmModal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="confirm-title"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="confirm-message"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="confirm-cancel">Batal</button>
                        <button type="button" class="btn btn-primary" id="confirm-ok">OK</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(confirmModal);
    }

    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;

    const okBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');

    // Remove previous event listeners
    const newOkBtn = okBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    // Add new event listeners
    newOkBtn.addEventListener('click', function() {
        hideModal('confirm-modal');
        if (onConfirm) onConfirm();
    });

    newCancelBtn.addEventListener('click', function() {
        hideModal('confirm-modal');
        if (onCancel) onCancel();
    });

    showModal('confirm-modal');
}

// Image preview modal
function showImagePreview(src, alt = '') {
    let imageModal = document.getElementById('image-preview-modal');
    if (!imageModal) {
        imageModal = document.createElement('div');
        imageModal.className = 'modal fade';
        imageModal.id = 'image-preview-modal';
        imageModal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Preview Gambar</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img id="preview-image" src="" alt="" class="img-fluid" style="max-height: 70vh;">
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(imageModal);
    }

    document.getElementById('preview-image').src = src;
    document.getElementById('preview-image').alt = alt;

    showModal('image-preview-modal');
}

// Detail modal for layanan/pembayaran
function showDetailModal(type, data) {
    let detailModal = document.getElementById('detail-modal');
    if (!detailModal) {
        detailModal = document.createElement('div');
        detailModal.className = 'modal fade';
        detailModal.id = 'detail-modal';
        detailModal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="detail-title"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="detail-content"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(detailModal);
    }

    const title = document.getElementById('detail-title');
    const content = document.getElementById('detail-content');

    if (type === 'layanan') {
        title.textContent = data.nama;
        content.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <img src="${data.gambar || 'images/layanan/default.jpg'}" alt="${data.nama}" class="img-fluid rounded" onerror="this.src='images/layanan/default.jpg'">
                </div>
                <div class="col-md-8">
                    <h6>Deskripsi:</h6>
                    <p>${data.deskripsi}</p>
                    <h6>Harga:</h6>
                    <p class="fw-bold text-primary">Rp ${data.harga.toLocaleString('id-ID')}</p>
                    <h6>Kategori:</h6>
                    <p>${data.kategori || 'Umum'}</p>
                </div>
            </div>
        `;
    } else if (type === 'pembayaran') {
        title.textContent = data.nama;
        content.innerHTML = `
            <div class="text-center">
                <img src="${data.logo || 'images/pembayaran/default.png'}" alt="${data.nama}" class="mb-3" style="height: 80px; object-fit: contain;" onerror="this.src='images/pembayaran/default.png'">
                <h6>Deskripsi:</h6>
                <p>${data.deskripsi}</p>
                <h6>Status:</h6>
                <span class="badge ${data.aktif ? 'bg-success' : 'bg-secondary'}">${data.aktif ? 'Aktif' : 'Nonaktif'}</span>
            </div>
        `;
    }

    showModal('detail-modal');
}

// Loading modal
function showLoadingModal(message = 'Memproses...') {
    let loadingModal = document.getElementById('loading-modal');
    if (!loadingModal) {
        loadingModal = document.createElement('div');
        loadingModal.className = 'modal fade';
        loadingModal.id = 'loading-modal';
        loadingModal.setAttribute('data-bs-backdrop', 'static');
        loadingModal.setAttribute('data-bs-keyboard', 'false');
        loadingModal.innerHTML = `
            <div class="modal-dialog modal-sm">
                <div class="modal-content">
                    <div class="modal-body text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2" id="loading-message"></p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(loadingModal);
    }

    document.getElementById('loading-message').textContent = message;
    showModal('loading-modal');
}

function hideLoadingModal() {
    hideModal('loading-modal');
}

// Error modal
function showErrorModal(title, message) {
    let errorModal = document.getElementById('error-modal');
    if (!errorModal) {
        errorModal = document.createElement('div');
        errorModal.className = 'modal fade';
        errorModal.id = 'error-modal';
        errorModal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title" id="error-title"></h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="error-message"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(errorModal);
    }

    document.getElementById('error-title').textContent = title;
    document.getElementById('error-message').textContent = message;

    showModal('error-modal');
}

// Success modal
function showSuccessModal(title, message) {
    let successModal = document.getElementById('success-modal');
    if (!successModal) {
        successModal = document.createElement('div');
        successModal.className = 'modal fade';
        successModal.id = 'success-modal';
        successModal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title" id="success-title"></h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" id="success-message"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(successModal);
    }

    document.getElementById('success-title').textContent = title;
    document.getElementById('success-message').textContent = message;

    showModal('success-modal');
}

// Export modal functions
window.ModalUtils = {
    showModal,
    hideModal,
    showConfirmModal,
    showImagePreview,
    showDetailModal,
    showLoadingModal,
    hideLoadingModal,
    showErrorModal,
    showSuccessModal
};
