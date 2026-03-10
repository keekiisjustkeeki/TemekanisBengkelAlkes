// ==================== AUTHENTICATION SYSTEM ====================

const USERS_KEY = 'temeknis_users';

// Get all users from localStorage
function getUsers() {
    const users = localStorage.getItem(USERS_KEY);
    if (!users) {
        // Initialize with default admin
        const defaultUsers = [
            {
                id: 'admin001',
                username: 'iqy',
                password: 'kiky',
                role: 'admin',
                email: 'admin@temmekanis.com',
                phone: '081234567890',
                created_at: new Date().toISOString().split('T')[0]
            }
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
        return defaultUsers;
    }
    return JSON.parse(users);
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Find user by username or email
function findUser(identifier) {
    const users = getUsers();
    return users.find(u => 
        u.username.toLowerCase() === identifier.toLowerCase() || 
        (u.email && u.email.toLowerCase() === identifier.toLowerCase())
    );
}

// Login function
function authLogin(identifier, password, role) {
    const user = findUser(identifier);
    
    if (!user) {
        return { success: false, message: 'Akun tidak ditemukan!' };
    }
    
    if (user.password !== password) {
        return { success: false, message: 'Password salah!' };
    }
    
    if (user.role !== role) {
        return { success: false, message: 'Role tidak sesuai! Silakan pilih role yang benar.' };
    }
    
    return { success: true, user: user };
}

// Register new user
function authRegister(userData) {
    const users = getUsers();
    
    // Check if username exists
    if (users.find(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
        return { success: false, message: 'Username sudah digunakan!' };
    }
    
    // Check if email exists
    if (users.find(u => u.email && u.email.toLowerCase() === userData.email.toLowerCase())) {
        return { success: false, message: 'Email sudah digunakan!' };
    }
    
    // Check if phone exists
    if (users.find(u => u.phone === userData.phone)) {
        return { success: false, message: 'Nomor telepon sudah digunakan!' };
    }
    
    // Create new user
    const newUser = {
        id: 'user' + Date.now(),
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        role: 'pelanggan',
        created_at: new Date().toISOString().split('T')[0]
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, user: newUser };
}

// Get current logged in user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Check if user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    window.location.href = 'login.html';
}

// Update user profile
function updateUserProfile(userId, updates) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) {
        return { success: false, message: 'User tidak ditemukan!' };
    }
    
    // Check for duplicates if updating username/email/phone
    if (updates.username && users.find(u => u.id !== userId && u.username.toLowerCase() === updates.username.toLowerCase())) {
        return { success: false, message: 'Username sudah digunakan!' };
    }
    
    if (updates.email && users.find(u => u.id !== userId && u.email && u.email.toLowerCase() === updates.email.toLowerCase())) {
        return { success: false, message: 'Email sudah digunakan!' };
    }
    
    if (updates.phone && users.find(u => u.id !== userId && u.phone === updates.phone)) {
        return { success: false, message: 'Nomor telepon sudah digunakan!' };
    }
    
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
    
    // Update current user session
    localStorage.setItem('currentUser', JSON.stringify(users[index]));
    
    return { success: true, user: users[index] };
}

// Change user password
function changePassword(userId, oldPassword, newPassword) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) {
        return { success: false, message: 'User tidak ditemukan!' };
    }
    
    if (users[index].password !== oldPassword) {
        return { success: false, message: 'Password lama salah!' };
    }
    
    users[index].password = newPassword;
    saveUsers(users);
    
    return { success: true, message: 'Password berhasil diubah!' };
}

// Admin functions
function getAllUsers() {
    return getUsers();
}

function deleteUser(userId) {
    const users = getUsers();
    const filtered = users.filter(u => u.id !== userId);
    
    if (filtered.length === users.length) {
        return { success: false, message: 'User tidak ditemukan!' };
    }
    
    saveUsers(filtered);
    return { success: true, message: 'User berhasil dihapus!' };
}

function createAdmin(userData) {
    userData.role = 'admin';
    return authRegister(userData);
}

function searchUsers(query) {
    const users = getUsers();
    const lowerQuery = query.toLowerCase();
    return users.filter(u => 
        u.username.toLowerCase().includes(lowerQuery) ||
        (u.email && u.email.toLowerCase().includes(lowerQuery)) ||
        u.phone.includes(query)
    );
}

