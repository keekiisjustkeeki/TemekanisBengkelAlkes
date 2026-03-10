// ==================== PELANGGAN PANEL FUNCTIONS ====================

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Check customer access
function checkPelangganAccess() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'pelanggan') {
        window.location.href = '../login.html';
        return false;
    }
    return currentUser;
}

// Initialize pelanggan panel
function initPelangganPanel() {
    const user = checkPelangganAccess();
    if (!user) return;
    
    document.getElementById('user-name').textContent = user.username;
    
    // Load all data
    loadProfile();
    loadMessages();
    
    // Setup navigation
    setupNavigation();
    setupForms();
}

// Setup navigation
function setupNavigation() {
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showPage(this.dataset.page);
        });
    });
}

// Setup forms
function setupForms() {
    // Profile form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }
    
    // Password form
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword();
        });
    }
}

// Show page
function showPage(page) {
    // Hide all pages
    document.querySelectorAll('[id^="page-"]').forEach(p => {
        p.style.display = 'none';
    });
    
    // Show selected page
    const pageElement = document.getElementById('page-' + page);
    if (pageElement) {
        pageElement.style.display = 'block';
    }
    
    // Update title
    const titles = {
        beranda: 'Beranda',
        pesanan: 'Pesan & Riwayat Pesan',
        profil: 'Profil Saya'
    };
    
    document.getElementById('page-title').textContent = titles[page] || page;
    
    // Update active nav
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`[data-page="${page}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Load page specific data
    if (page === 'pesanan') loadMessages();
    if (page === 'profil') loadProfile();
}

// ==================== PROFIL ====================

function loadProfile() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const usernameEl = document.getElementById('profile-username');
    const emailEl = document.getElementById('profile-email');
    const phoneEl = document.getElementById('profile-phone');
    
    if (usernameEl) usernameEl.value = currentUser.username;
    if (emailEl) emailEl.value = currentUser.email || '';
    if (phoneEl) phoneEl.value = currentUser.phone || '';
}

function updateProfile() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const email = document.getElementById('profile-email').value;
    const phone = document.getElementById('profile-phone').value;
    
    // Get all users
    const users = JSON.parse(localStorage.getItem('temeknis_users') || '[]');
    const index = users.findIndex(u => u.id === currentUser.id);
    
    if (index === -1) {
        showAlert('User tidak ditemukan!', 'danger');
        return;
    }
    
    // Check for duplicates
    if (email && users.find(u => u.id !== currentUser.id && u.email && u.email.toLowerCase() === email.toLowerCase())) {
        showAlert('Email sudah digunakan!', 'danger');
        return;
    }
    
    if (phone && users.find(u => u.id !== currentUser.id && u.phone === phone)) {
        showAlert('Nomor telepon sudah digunakan!', 'danger');
        return;
    }
    
    // Update user
    users[index].email = email;
    users[index].phone = phone;
    localStorage.setItem('temeknis_users', JSON.stringify(users));
    
    // Update current user session
    localStorage.setItem('currentUser', JSON.stringify(users[index]));
    
    showAlert('Profil berhasil diperbarui!', 'success');
}

function changePassword() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!oldPassword || !newPassword || !confirmPassword) {
        showAlert('Semua field password harus diisi!', 'warning');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAlert('Password baru tidak cocok!', 'warning');
        return;
    }
    
    if (newPassword.length < 4) {
        showAlert('Password minimal 4 karakter!', 'warning');
        return;
    }
    
    // Get all users
    const users = JSON.parse(localStorage.getItem('temeknis_users') || '[]');
    const index = users.findIndex(u => u.id === currentUser.id);
    
    if (index === -1) {
        showAlert('User tidak ditemukan!', 'danger');
        return;
    }
    
    // Check old password
    if (users[index].password !== oldPassword) {
        showAlert('Password lama salah!', 'danger');
        return;
    }
    
    // Update password
    users[index].password = newPassword;
    localStorage.setItem('temeknis_users', JSON.stringify(users));
    
    showAlert('Password berhasil diubah!', 'success');
    
    // Reset form
    document.getElementById('password-form').reset();
}

// ==================== PESAN ====================

function loadMessages() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const messages = JSON.parse(localStorage.getItem('temeknis_messages') || '[]');
    const userMessages = messages.filter(m => m.userId === currentUser.id);
    const container = document.getElementById('messages-list');
    
    if (!container) return;
    
    if (userMessages.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-chat-dots display-1 text-muted"></i>
                <p class="mt-3 text-muted">Belum ada pesan. Klik tombol di bawah untuk mengirim pesan pertama Anda!</p>
                <button class="btn btn-primary" onclick="showComposeMessage()">
                    <i class="bi bi-send me-2"></i>Kirim Pesan Pertama
                </button>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    userMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const unread = userMessages.filter(m => !m.read && m.from === 'admin').length;
    const unreadEl = document.getElementById('unread-count');
    if (unreadEl) unreadEl.textContent = unread;
    
    container.innerHTML = userMessages.map(msg => `
        <div class="card mb-3 ${msg.from === 'admin' ? 'border-primary' : ''}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="${msg.from === 'admin' ? 'text-primary' : ''}">
                            ${msg.from === 'admin' ? '<i class="bi bi-person-badge me-1"></i>Admin' : '<i class="bi bi-person me-1"></i>Anda'}
                        </h6>
                        <p class="mb-2">${msg.text}</p>
                        ${msg.file ? `<a href="${msg.file}" target="_blank" class="btn btn-sm btn-info mb-2"><i class="bi bi-paperclip me-1"></i>Lihat Lampiran</a>` : ''}
                    </div>
                    <small class="text-muted">${msg.date}</small>
                </div>
            </div>
        </div>
    `).join('');
    
    // Mark as read
    userMessages.forEach(m => {
        const idx = messages.findIndex(msg => msg.id === m.id);
        if (idx !== -1) {
            messages[idx].read = true;
        }
    });
    localStorage.setItem('temeknis_messages', JSON.stringify(messages));
}

function showComposeMessage() {
    const textEl = document.getElementById('message-text');
    const fileEl = document.getElementById('message-file');
    
    if (textEl) textEl.value = '';
    if (fileEl) fileEl.value = '';
    
    const modalEl = document.getElementById('messageModal');
    if (modalEl) {
        new bootstrap.Modal(modalEl).show();
    }
}

function sendMessage() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const textEl = document.getElementById('message-text');
    const fileEl = document.getElementById('message-file');
    
    const text = textEl ? textEl.value : '';
    
    if (!text || !text.trim()) {
        showAlert('Tulis pesan terlebih dahulu!', 'warning');
        return;
    }
    
    const messages = JSON.parse(localStorage.getItem('temeknis_messages') || '[]');
    
    const message = {
        id: Date.now(),
        userId: currentUser.id,
        from: 'pelanggan',
        username: currentUser.username,
        text: text,
        file: null,
        date: new Date().toLocaleString('id-ID'),
        read: false
    };
    
    // Handle file upload
    if (fileEl && fileEl.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            message.file = e.target.result;
            messages.push(message);
            localStorage.setItem('temeknis_messages', JSON.stringify(messages));
            
            hideMessageModal();
            loadMessages();
            showAlert('Pesan berhasil dikirim!', 'success');
        };
        reader.readAsDataURL(fileEl.files[0]);
    } else {
        messages.push(message);
        localStorage.setItem('temeknis_messages', JSON.stringify(messages));
        
        hideMessageModal();
        loadMessages();
        showAlert('Pesan berhasil dikirim!', 'success');
    }
}

function hideMessageModal() {
    const modalEl = document.getElementById('messageModal');
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) {
            modal.hide();
        }
    }
}

// ==================== UTILITIES ====================

function showAlert(message, type) {
    const container = document.getElementById('alert-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    window.location.href = '../login.html';
}

// Export functions to window
window.initPelangganPanel = initPelangganPanel;
window.loadProfile = loadProfile;
window.updateProfile = updateProfile;
window.changePassword = changePassword;
window.loadMessages = loadMessages;
window.showComposeMessage = showComposeMessage;
window.sendMessage = sendMessage;
window.showPage = showPage;
window.showAlert = showAlert;
window.logout = logout;
window.getCurrentUser = getCurrentUser;

