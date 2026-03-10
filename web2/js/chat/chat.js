// ==================== CHAT SYSTEM FUNCTIONS ====================

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Get chat conversations
function getConversations() {
    const chats = JSON.parse(localStorage.getItem('temeknis_chats') || '[]');
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    // Filter conversations based on user role
    let conversations;
    if (currentUser.role === 'admin') {
        // Admin sees all conversations
        conversations = chats;
    } else {
        // Pelanggan only sees their conversations
        conversations = chats.filter(c => c.participants.includes(currentUser.id));
    }
    
    // Sort by last message time
    conversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    
    // Add participant info
    const users = JSON.parse(localStorage.getItem('temeknis_users') || '[]');
    return conversations.map(c => {
        const otherParticipantId = c.participants.find(p => p !== currentUser.id);
        const otherUser = users.find(u => u.id === otherParticipantId);
        return {
            ...c,
            otherUser: otherUser ? { id: otherUser.id, username: otherUser.username, role: otherUser.role } : null,
            unreadCount: c.messages.filter(m => !m.read && m.senderId !== currentUser.id).length
        };
    });
}

// Get or create conversation with user
function getOrCreateConversation(otherUserId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    const chats = JSON.parse(localStorage.getItem('temeknis_chats') || '[]');
    
    // Find existing conversation
    let conversation = chats.find(c => 
        c.participants.includes(currentUser.id) && c.participants.includes(otherUserId)
    );
    
    // Create new conversation if not exists
    if (!conversation) {
        conversation = {
            id: 'chat_' + Date.now(),
            participants: [currentUser.id, otherUserId],
            messages: [],
            createdAt: new Date().toISOString(),
            lastMessageTime: new Date().toISOString()
        };
        chats.push(conversation);
        localStorage.setItem('temeknis_chats', JSON.stringify(chats));
    }
    
    return conversation;
}

// Get messages for a conversation
function getMessages(conversationId) {
    const chats = JSON.parse(localStorage.getItem('temeknis_chats') || '[]');
    const conversation = chats.find(c => c.id === conversationId);
    return conversation ? conversation.messages : [];
}

// Send message
function sendMessage(conversationId, messageText, attachment = null) {
    const currentUser = getCurrentUser();
    if (!currentUser) return { success: false, message: 'User not logged in' };
    
    const chats = JSON.parse(localStorage.getItem('temeknis_chats') || '[]');
    const conversationIndex = chats.findIndex(c => c.id === conversationId);
    
    if (conversationIndex === -1) {
        return { success: false, message: 'Conversation not found' };
    }
    
    const message = {
        id: 'msg_' + Date.now(),
        senderId: currentUser.id,
        senderName: currentUser.username,
        text: messageText,
        attachment: attachment,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    chats[conversationIndex].messages.push(message);
    chats[conversationIndex].lastMessageTime = message.timestamp;
    
    localStorage.setItem('temeknis_chats', JSON.stringify(chats));
    
    return { success: true, message: message };
}

// Mark messages as read
function markAsRead(conversationId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const chats = JSON.parse(localStorage.getItem('temeknis_chats') || '[]');
    const conversationIndex = chats.findIndex(c => c.id === conversationId);
    
    if (conversationIndex === -1) return;
    
    chats[conversationIndex].messages.forEach(m => {
        if (m.senderId !== currentUser.id) {
            m.read = true;
        }
    });
    
    localStorage.setItem('temeknis_chats', JSON.stringify(chats));
}

// Get all users for admin (for starting new conversation)
function getAllUsersForChat() {
    const currentUser = getCurrentUser();
    const users = JSON.parse(localStorage.getItem('temeknis_users') || '[]');
    
    return users.filter(u => u.id !== currentUser.id);
}

// Initialize emoji picker
function initEmojiPicker(textareaId, buttonId) {
    const textarea = document.getElementById(textareaId);
    const button = document.getElementById(buttonId);
    
    if (!textarea || !button) return;
    
    // Simple emoji picker (no external library needed)
    const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🙏', '✍️', '💼', '📁', '📂', '📄', '📊', '📈', '📉', '📌', '📎', '🔗', '📝', '✏️', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🌟', '✨', '💫', '🔥', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✅', '❌', '⚠️', '❓', '❗', '💯', '🔔', '🔕', '🔇', '🔈', '🔉', '🔊', '📢', '📣'];
    
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Create emoji picker modal
        let picker = document.getElementById('emoji-picker');
        if (picker) {
            picker.remove();
        }
        
        picker = document.createElement('div');
        picker.id = 'emoji-picker';
        picker.style.cssText = `
            position: absolute;
            bottom: 60px;
            right: 20px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 10px;
            padding: 10px;
            max-width: 300px;
            max-height: 250px;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 1000;
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 5px;
        `;
        
        emojis.forEach(emoji => {
            const span = document.createElement('span');
            span.textContent = emoji;
            span.style.cssText = 'cursor: pointer; font-size: 20px; padding: 5px; border-radius: 5px;';
            span.onclick = function() {
                textarea.value += emoji;
                textarea.focus();
                picker.remove();
            };
            span.onmouseover = function() {
                this.style.background = '#f0f0f0';
            };
            span.onmouseout = function() {
                this.style.background = 'transparent';
            };
            picker.appendChild(span);
        });
        
        textarea.parentElement.style.position = 'relative';
        textarea.parentElement.appendChild(picker);
        
        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', function closePicker(e) {
                if (!picker.contains(e.target) && e.target !== button) {
                    picker.remove();
                    document.removeEventListener('click', closePicker);
                }
            });
        }, 100);
    });
}

// Initialize file input for chat
function initFileInput(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (!input) return;
    
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Check file type
        const isImage = file.type.startsWith('image/');
        const isPDF = file.type === 'application/pdf';
        const isDoc = file.type.includes('word') || file.type.includes('document');
        
        if (!isImage && !isPDF && !isDoc) {
            alert('Hanya dapat mengirim gambar, PDF, atau dokumen Word');
            input.value = '';
            return;
        }
        
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File terlalu besar. Maksimal 10MB');
            input.value = '';
            return;
        }
        
        // Show preview
        if (preview) {
            if (isImage) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 10px;">`;
                };
                reader.readAsDataURL(file);
            } else {
                preview.innerHTML = `<div class="d-flex align-items-center p-3 bg-light rounded"><i class="bi bi-file-earmark me-2"></i>${file.name}</div>`;
            }
            preview.style.display = 'block';
        }
    });
}

// Handle file attachment
function handleAttachment(conversationId) {
    const fileInput = document.getElementById('chat-file-input');
    const messageText = document.getElementById('chat-message');
    
    if (!fileInput || !fileInput.files[0]) {
        return sendMessage(conversationId, messageText.value);
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const attachment = {
            name: file.name,
            type: file.type,
            data: e.target.result
        };
        
        const result = sendMessage(conversationId, messageText.value, attachment);
        
        if (result.success) {
            messageText.value = '';
            fileInput.value = '';
            const preview = document.getElementById('file-preview');
            if (preview) preview.style.display = 'none';
        }
        
        return result;
    };
    
    reader.readAsDataURL(file);
}

// Format timestamp
function formatTimestamp(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) {
        return 'Baru saja';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return minutes + ' menit lalu';
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return hours + ' jam lalu';
    }
    
    // More than 24 hours
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Scroll to bottom of chat
function scrollToBottom(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollTop = element.scrollHeight;
    }
}

// Export functions
window.ChatSystem = {
    getConversations,
    getOrCreateConversation,
    getMessages,
    sendMessage,
    markAsRead,
    getAllUsersForChat,
    initEmojiPicker,
    initFileInput,
    handleAttachment,
    formatTimestamp,
    scrollToBottom,
    getCurrentUser
};

