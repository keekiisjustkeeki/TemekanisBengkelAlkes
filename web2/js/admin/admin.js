// ==================== ADMIN PANEL FUNCTIONS ====================

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Check if current user is super admin (iqy)
function isSuperAdmin() {
    const user = getCurrentUser();
    return user && user.username.toLowerCase() === 'iqy';
}

// Check admin access
function checkAdminAccess() {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = '../login.html';
        return false;
    }
    return currentUser;
}

// Initialize admin panel
function initAdminPanel() {
    const user = checkAdminAccess();
    if (!user) return;
    
    document.getElementById('admin-name').textContent = user.username;
    
    // Load all data
    loadDashboard();
    loadKontak();
    loadUsers();
    loadMessages();
    
    // Setup navigation
    setupNavigation();
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
        dashboard: 'Dashboard',
        galeri: 'Kelola Galeri',
        kontak: 'Kelola Kontak',
        pengguna: 'Kelola Pengguna',
        pesanan: 'Pesan Masuk'
    };
    
    document.getElementById('page-title').textContent = titles[page] || page;
    
    // Update active nav
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`[data-page="${page}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Load page specific data
    if (page === 'galeri') loadGaleri();
    if (page === 'pengguna') loadUsers();
    if (page === 'pesanan') loadMessages();
    if (page === 'kontak') loadKontak();
}

// ==================== DASHBOARD ====================

function loadDashboard() {
    const users = getAllUsers();
    const galeri = JSON.parse(localStorage.getItem('temeknis_galeri') || '[]');
    const messages = JSON.parse(localStorage.getItem('temeknis_messages') || '[]');
    
    document.getElementById('total-users').textContent = users.length;
    document.getElementById('total-galeri').textContent = galeri.length;
    document.getElementById('total-pesanan').textContent = messages.length;
    document.getElementById('total-admin').textContent = users.filter(u => u.role === 'admin').length;
    
    const unreadCount = messages.filter(m => !m.read && m.from !== 'admin').length;
    document.getElementById('unread-count').textContent = unreadCount;
}

// ==================== GALERI ====================

function loadGaleri() {
    const galleryGrid = document.getElementById('galeri-grid');
    if (!galleryGrid) return;
    
    let galleryImages = JSON.parse(localStorage.getItem('temeknis_galeri') || '[]');
    
    if (galleryImages.length === 0) {
        galleryImages = [
            'images/galeri/544877218_18026130503721893_2017438710361501895_n.jpg',
            'images/galeri/545335383_18026065796721893_3309926255487628621_n.jpg',
            'images/galeri/546262900_18026130488721893_8392955850337655285_n.jpg',
            'images/galeri/547373441_18026130506721893_3947593962791537705_n.jpg'
        ];
    }
    
    let visibleGallery = JSON.parse(localStorage.getItem('temeknis_galeri_visible') || '[]');
    if (visibleGallery.length === 0) {
        visibleGallery = galleryImages.map((_, index) => index);
        localStorage.setItem('temeknis_galeri_visible', JSON.stringify(visibleGallery));
    }
    
    galleryGrid.innerHTML = galleryImages.map((img, index) => {
        const isVisible = visibleGallery.includes(index);
        return `
            <div class="col-md-3 mb-3">
                <div class="card">
                    <img src="${img}" class="card-img-top" alt="Galeri ${index + 1}" style="height: 150px; object-fit: cover;">
                    <div class="card-body text-center">
                        <button class="btn btn-sm ${isVisible ? 'btn-warning' : 'btn-success'}" 
                                onclick="toggleGalleryVisibility(${index})">
                            ${isVisible ? '<i class="bi bi-eye-slash"></i> Sembunyikan' : '<i class="bi bi-eye"></i> Tampilkan'}
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteGalleryImage(${index})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function showAddGaleri() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = function(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        let galleryImages = JSON.parse(localStorage.getItem('temeknis_galeri') || '[]');
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(event) {
                galleryImages.push(event.target.result);
                localStorage.setItem('temeknis_galeri', JSON.stringify(galleryImages));
                
                // Add to visible list
                let visibleGallery = JSON.parse(localStorage.getItem('temeknis_galeri_visible') || '[]');
                visibleGallery.push(galleryImages.length - 1);
                localStorage.setItem('temeknis_galeri_visible', JSON.stringify(visibleGallery));
                
                loadGaleri();
                showAlert('Foto berhasil ditambahkan!', 'success');
            };
            reader.readAsDataURL(file);
        });
    };
    input.click();
}

function toggleGalleryVisibility(index) {
    let visibleGallery = JSON.parse(localStorage.getItem('temeknis_galeri_visible') || '[]');
    
    if (visibleGallery.includes(index)) {
        visibleGallery = visibleGallery.filter(i => i !== index);
    } else {
        visibleGallery.push(index);
    }
    
    localStorage.setItem('temeknis_galeri_visible', JSON.stringify(visibleGallery));
    loadGaleri();
}

function deleteGalleryImage(index) {
    if (!confirm('Hapus foto ini?')) return;
    
    let galleryImages = JSON.parse(localStorage.getItem('temeknis_galeri') || '[]');
    galleryImages.splice(index, 1);
    localStorage.setItem('temeknis_galeri', JSON.stringify(galleryImages));
    
    // Update visible list
    let visibleGallery = JSON.parse(localStorage.getItem('temeknis_galeri_visible') || '[]');
    visibleGallery = visibleGallery.filter(i => i !== index).map(i => i > index ? i - 1 : i);
    localStorage.setItem('temeknis_galeri_visible', JSON.stringify(visibleGallery));
    
    loadGaleri();
    loadDashboard();
    showAlert('Foto berhasil dihapus!', 'success');
}

// ==================== KONTAK ====================

function loadKontak() {
    const kontak = JSON.parse(localStorage.getItem('temeknis_kontak') || '{}');
    
    document.getElementById('kontak-alamat').value = kontak.alamat || '';
    document.getElementById('kontak-telepon').value = kontak.telepon || '';
    document.getElementById('kontak-email').value = kontak.email || '';
    document.getElementById('kontak-whatsapp').value = kontak.whatsapp || '';
}

function saveKontak(kontak) {
    localStorage.setItem('temeknis_kontak', JSON.stringify(kontak));
}

document.addEventListener('DOMContentLoaded', function() {
    const kontakForm = document.getElementById('kontak-form');
    if (kontakForm) {
        kontakForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const kontak = {
                alamat: document.getElementById('kontak-alamat').value,
                telepon: document.getElementById('kontak-telepon').value,
                email: document.getElementById('kontak-email').value,
                whatsapp: document.getElementById('kontak-whatsapp').value
            };
            
            saveKontak(kontak);
            showAlert('Kontak berhasil disimpan!', 'success');
        });
    }
});

// ==================== PENGGUNA ====================

function getAllUsers() {
    const users = localStorage.getItem('temeknis_users');
    if (!users) {
        return [];
    }
    return JSON.parse(users);
}

function loadUsers() {
    const users = getAllUsers();
    const table = document.getElementById('users-table');
    if (!table) return;
    
    if (users.length === 0) {
        table.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada pengguna</td></tr>';
        return;
    }
    
    // Check if current user is super admin (iqy)
    const superAdmin = isSuperAdmin();
    
    table.innerHTML = users.map(user => {
        let actionButtons = '';
        
        if (user.role !== 'admin') {
            // Pelanggan - bisa dihapus oleh semua admin
            actionButtons = `<button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')"><i class="bi bi-trash"></i></button>`;
        } else if (superAdmin && user.username.toLowerCase() !== 'iqy') {
            // Admin lain - hanya super admin (iqy) yang bisa edit & hapus
            actionButtons = `<button class="btn btn-sm btn-warning me-1" onclick="editUser('${user.id}')"><i class="bi bi-pencil"></i></button>
                           <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')"><i class="bi bi-trash"></i></button>`;
        } else {
            actionButtons = '-';
        }
        
        return `
        <tr>
            <td>${user.username}</td>
            <td>${user.email || '-'}</td>
            <td>${user.phone || '-'}</td>
            <td><span class="badge bg-${user.role === 'admin' ? 'primary' : 'secondary'}">${user.role}</span></td>
            <td>${actionButtons}</td>
        </tr>
        `;
    }).join('');
}

function searchUsers() {
    const query = document.getElementById('search-user').value.toLowerCase();
    const users = getAllUsers();
    const table = document.getElementById('users-table');
    
    const filtered = users.filter(u => 
        u.username.toLowerCase().includes(query) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.phone && u.phone.includes(query))
    );
    
    // Check if current user is super admin (iqy)
    const superAdmin = isSuperAdmin();
    
    table.innerHTML = filtered.map(user => {
        let actionButtons = '';
        
        if (user.role !== 'admin') {
            actionButtons = `<button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')"><i class="bi bi-trash"></i></button>`;
        } else if (superAdmin && user.username.toLowerCase() !== 'iqy') {
            actionButtons = `<button class="btn btn-sm btn-warning me-1" onclick="editUser('${user.id}')"><i class="bi bi-pencil"></i></button>
                           <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')"><i class="bi bi-trash"></i></button>`;
        } else {
            actionButtons = '-';
        }
        
        return `
        <tr>
            <td>${user.username}</td>
            <td>${user.email || '-'}</td>
            <td>${user.phone || '-'}</td>
            <td><span class="badge bg-${user.role === 'admin' ? 'primary' : 'secondary'}">${user.role}</span></td>
            <td>${actionButtons}</td>
        </tr>
        `;
    }).join('');
}

function deleteUser(userId) {
    if (!confirm('Hapus pengguna ini?')) return;
    
    const users = getAllUsers();
    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem('temeknis_users', JSON.stringify(filtered));
    
    loadUsers();
    loadDashboard();
    showAlert('Pengguna berhasil dihapus!', 'success');
}

function showAddAdmin() {
    const username = prompt('Masukkan username admin baru:');
    if (!username) return;
    
    const password = prompt('Masukkan password:');
    if (!password) return;
    
    const email = prompt('Masukkan email:');
    const phone = prompt('Masukkan nomor telepon:');
    
    const users = getAllUsers();
    
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        showAlert('Username sudah digunakan!', 'danger');
        return;
    }
    
    const newAdmin = {
        id: 'admin' + Date.now(),
        username: username,
        password: password,
        email: email,
        phone: phone,
        role: 'admin',
        created_at: new Date().toISOString().split('T')[0]
    };
    
    users.push(newAdmin);
    localStorage.setItem('temeknis_users', JSON.stringify(users));
    
    loadUsers();
    loadDashboard();
    showAlert('Admin berhasil ditambahkan!', 'success');
}

// ==================== PESANAN ====================

function loadMessages() {
    const messages = JSON.parse(localStorage.getItem('temeknis_messages') || '[]');
    const container = document.getElementById('messages-list');
    if (!container) return;
    
    // Filter by current user role (admin sees all)
    const adminMessages = messages.filter(m => m.from !== 'admin');
    
    if (adminMessages.length === 0) {
        container.innerHTML = '<div class="text-center py-5"><p class="text-muted">Belum ada pesan masuk</p></div>';
        return;
    }
    
    // Sort by date
    adminMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const unread = adminMessages.filter(m => !m.read).length;
    document.getElementById('unread-count').textContent = unread;
    
    container.innerHTML = adminMessages.map(msg => `
        <div class="card mb-3 ${!msg.read ? 'border-primary' : ''}">
            <div class="card-body">
                <div class="d-flex justify-content-between">
                    <div>
                        <h6>${msg.username || 'Pelanggan'}</h6>
                        <p class="mb-1">${msg.text}</p>
                        ${msg.file ? `<a href="${msg.file}" target="_blank" class="btn btn-sm btn-info"><i class="bi bi-paperclip"></i> Lampiran</a>` : ''}
                    </div>
                    <div class="text-end">
                        <small class="text-muted">${msg.date}</small>
                        <br>
                        ${!msg.read ? '<span class="badge bg-primary">Baru</span>' : ''}
                    </div>
                </div>
                <div class="mt-2">
                    <button class="btn btn-sm btn-primary" onclick="replyToMessage(${msg.id})">
                        <i class="bi bi-reply"></i> Balas
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteMessage(${msg.id})">
                        <i class="bi bi-trash"></i> Hapus
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Mark as read
    adminMessages.forEach(m => {
        const idx = messages.findIndex(msg => msg.id === m.id);
        if (idx !== -1) {
            messages[idx].read = true;
        }
    });
    localStorage.setItem('temeknis_messages', JSON.stringify(messages));
}

function replyToMessage(messageId) {
    const messages = JSON.parse(localStorage.getItem('temeknis_messages') || '[]');
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    
    const reply = prompt('Ketik balasan:');
    if (!reply) return;
    
    const currentUser = getCurrentUser();
    
    const replyMessage = {
        id: Date.now(),
        userId: message.userId,
        from: 'admin',
        username: currentUser.username,
        text: reply,
        date: new Date().toLocaleString('id-ID'),
        read: true,
        replyTo: messageId
    };
    
    messages.push(replyMessage);
    localStorage.setItem('temeknis_messages', JSON.stringify(messages));
    
    loadMessages();
    showAlert('Balasan terkirim!', 'success');
}

function deleteMessage(messageId) {
    if (!confirm('Hapus pesan ini?')) return;
    
    const messages = JSON.parse(localStorage.getItem('temeknis_messages') || '[]');
    const filtered = messages.filter(m => m.id !== messageId);
    localStorage.setItem('temeknis_messages', JSON.stringify(filtered));
    
    loadMessages();
    loadDashboard();
    showAlert('Pesan dihapus!', 'success');
}

function filterMessages() {
    const filter = document.getElementById('message-filter').value;
    const messages = JSON.parse(localStorage.getItem('temeknis_messages') || '[]');
    const container = document.getElementById('messages-list');
    
    let filtered = messages.filter(m => m.from !== 'admin');
    
    if (filter === 'unread') {
        filtered = filtered.filter(m => !m.read);
    } else if (filter === 'read') {
        filtered = filtered.filter(m => m.read);
    }
    
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = filtered.map(msg => `
        <div class="card mb-3 ${!msg.read ? 'border-primary' : ''}">
            <div class="card-body">
                <div class="d-flex justify-content-between">
                    <div>
                        <h6>${msg.username || 'Pelanggan'}</h6>
                        <p class="mb-1">${msg.text}</p>
                    </div>
                    <small class="text-muted">${msg.date}</small>
                </div>
            </div>
        </div>
    `).join('');
}

function searchMessages() {
    const query = document.getElementById('message-search').value.toLowerCase();
    const messages = JSON.parse(localStorage.getItem('temeknis_messages') || '[]');
    const container = document.getElementById('messages-list');
    
    const filtered = messages.filter(m => 
        m.from !== 'admin' && 
        (m.text.toLowerCase().includes(query) || (m.username && m.username.toLowerCase().includes(query)))
    );
    
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = filtered.map(msg => `
        <div class="card mb-3">
            <div class="card-body">
                <h6>${msg.username || 'Pelanggan'}</h6>
                <p>${msg.text}</p>
                <small class="text-muted">${msg.date}</small>
            </div>
        </div>
    `).join('');
}

// ==================== UTILITIES ====================

function showAlert(message, type) {
    const container = document.getElementById('alert-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show">
            ${message}
            <button class="btn-close" data-bs-dismiss="alert"></button>
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

// Edit user (hanya super admin iqy yang bisa)
function editUser(userId) {
    const users = getAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        showAlert('Pengguna tidak ditemukan!', 'danger');
        return;
    }
    
    // Cek apakah super admin
    if (!isSuperAdmin()) {
        showAlert('Hanya super admin (iqy) yang dapat mengedit pengguna lain!', 'danger');
        return;
    }
    
    // Jika admin lain (bukan iqy), tidak bisa edit
    if (user.role === 'admin' && user.username.toLowerCase() !== 'iqy') {
        // Super admin iqy bisa edit admin lain
    } else if (user.username.toLowerCase() === 'iqy') {
        showAlert('Tidak dapat mengedit akun super admin!', 'warning');
        return;
    }
    
    const newEmail = prompt('Masukkan email baru:', user.email || '');
    if (newEmail === null) return;
    
    const newPhone = prompt('Masukkan nomor telepon baru:', user.phone || '');
    if (newPhone === null) return;
    
    const newPassword = prompt('Masukkan password baru (kosongkan jika tidak ingin mengubah):');
    if (newPassword === null) return;
    
    // Update user
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
        users[index].email = newEmail;
        users[index].phone = newPhone;
        if (newPassword && newPassword.trim() !== '') {
            users[index].password = newPassword;
        }
        
        localStorage.setItem('temeknis_users', JSON.stringify(users));
        
        loadUsers();
        showAlert('Pengguna berhasil diperbarui!', 'success');
    }
}

// Export functions to window
window.initAdminPanel = initAdminPanel;
window.loadDashboard = loadDashboard;
window.loadGaleri = loadGaleri;
window.showAddGaleri = showAddGaleri;
window.toggleGalleryVisibility = toggleGalleryVisibility;
window.deleteGalleryImage = deleteGalleryImage;
window.loadKontak = loadKontak;
window.loadUsers = loadUsers;
window.searchUsers = searchUsers;
window.deleteUser = deleteUser;
window.editUser = editUser;
window.showAddAdmin = showAddAdmin;
window.loadMessages = loadMessages;
window.replyToMessage = replyToMessage;
window.deleteMessage = deleteMessage;
window.filterMessages = filterMessages;
window.searchMessages = searchMessages;
window.showPage = showPage;
window.showAlert = showAlert;
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.getAllUsers = getAllUsers;
window.isSuperAdmin = isSuperAdmin;

