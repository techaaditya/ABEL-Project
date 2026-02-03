/**
 * ABEL - Graph RAG Chatbot
 * Main JavaScript Controller
 */

// ============================================
// STATE MANAGEMENT
// ============================================
const AppState = {
    isLoggedIn: false,
    user: null,
    currentView: 'landing', // 'landing' | 'chat'
    pendingMessage: null,
    authMode: 'login', // 'login' | 'signup'
    activeConversationId: null
};

// ============================================
// DOM ELEMENTS
// ============================================
const DOM = {
    // Landing
    landingPage: document.getElementById('landing-page'),
    heroContent: document.getElementById('hero-content'),
    heroInputWrapper: document.getElementById('hero-input-wrapper'),
    heroInput: document.getElementById('hero-input'),
    heroSubmitBtn: document.getElementById('hero-submit-btn'),
    
    // Auth Modal
    authModal: document.getElementById('auth-modal'),
    authTitle: document.getElementById('auth-title'),
    authSubtitle: document.getElementById('auth-subtitle'),
    authForm: document.getElementById('auth-form'),
    authSubmitBtn: document.getElementById('auth-submit-btn'),
    usernameGroup: document.getElementById('username-group'),

    // Confirm Modal
    confirmModal: document.getElementById('confirm-modal'),
    confirmTitle: document.getElementById('confirm-title'),
    confirmMessage: document.getElementById('confirm-message'),
    confirmYesBtn: document.getElementById('confirm-yes-btn'),
    confirmCancelBtn: document.getElementById('confirm-cancel-btn'),
    
    // Chat Dashboard
    chatDashboard: document.getElementById('chat-dashboard'),
    chatMessages: document.getElementById('chat-messages'),
    chatWelcome: document.getElementById('chat-welcome'),
    chatInput: document.getElementById('chat-input'),
    sendBtn: document.getElementById('send-btn'),
    // sidebar: document.getElementById('sidebar'), // Removed
    // chatHistory: document.getElementById('chat-history'), // Removed
    chatTitleHeader: document.getElementById('chat-title-header'),
    // mainToggleBtn: document.getElementById('main-toggle-btn'), // Removed
    
    // Landing User UI
    navAuthButtons: document.getElementById('nav-auth-buttons'),
    landingUserMenu: document.getElementById('landing-user-menu'),
    landingUserAvatarText: document.getElementById('landing-user-avatar-text'),
    landingUserDropdown: document.getElementById('landing-user-dropdown'),
    landingUserName: document.getElementById('landing-user-name'),
    landingUserEmail: document.getElementById('landing-user-email')
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#landing-user-menu')) {
            if(DOM.landingUserDropdown) DOM.landingUserDropdown.classList.add('hidden');
        }
    });
});

function initializeApp() {
    // Check if user session exists
    checkSession();
}

function setupEventListeners() {
    // Hero input events
    DOM.heroInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleHeroSubmit();
        }
    });
    
    DOM.heroSubmitBtn.addEventListener('click', handleHeroSubmit);
    
    // Chat input events
    DOM.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    DOM.chatInput.addEventListener('input', autoResizeTextarea);
    
    // Close modal on overlay click
    DOM.authModal.addEventListener('click', (e) => {
        if (e.target === DOM.authModal) {
            closeAuthModal();
        }
    });

    if(DOM.confirmModal) {
        DOM.confirmModal.addEventListener('click', (e) => {
            if (e.target === DOM.confirmModal) {
                closeConfirmModal();
            }
        });
        
        DOM.confirmCancelBtn.addEventListener('click', closeConfirmModal);
    }
    
    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAuthModal();
            closeConfirmModal();
        }
    });
}

// ============================================
// SESSION MANAGEMENT
// ============================================
function checkSession() {
    // Check PHP session via AJAX
    fetch('php/check_session.php')
        .then(res => res.json())
        .then(data => {
            if (data.logged_in) {
                AppState.isLoggedIn = true;
                AppState.user = data.user;
                updateUserUI(); 
                // loadChatHistory(); // Removed
                transitionToChat(); // Auto-redirect to chat
            } else {
                AppState.isLoggedIn = false;
                updateUserUI();
            }
        })
        .catch(() => {
            // Session check failed, user not logged in
            AppState.isLoggedIn = false;
            updateUserUI();
        });
}

function updateUserUI() {
    if (AppState.isLoggedIn && AppState.user) {
        // Show User Menu on Landing
        DOM.navAuthButtons.style.display = 'none';
        DOM.landingUserMenu.classList.remove('hidden');
        
        // Update User Info
        DOM.landingUserAvatarText.textContent = (AppState.user.username || 'U').charAt(0).toUpperCase();
        DOM.landingUserName.textContent = AppState.user.username || 'User';
        DOM.landingUserEmail.textContent = AppState.user.email || '';
    } else {
        // Show Auth Buttons
        DOM.navAuthButtons.style.display = 'flex';
        DOM.landingUserMenu.classList.add('hidden');
    }
}

function toggleUserDropdown() {
    DOM.landingUserDropdown.classList.toggle('hidden');
}

// ============================================
// HERO INPUT HANDLING
// ============================================
function handleHeroSubmit() {
    const message = DOM.heroInput.value.trim();
    if (!message) return;
    
    if (!AppState.isLoggedIn) {
        // Store the pending message
        AppState.pendingMessage = message;
        // Show auth modal
        openAuthModal('login');
    } else {
        // User is logged in, transition to chat
        transitionToChat(message);
    }
}

function setHeroInput(text) {
    DOM.heroInput.value = text;
    DOM.heroInput.focus();
}

// ============================================
// AUTH MODAL
// ============================================
function openAuthModal(mode = 'login') {
    AppState.authMode = mode;
    DOM.authModal.classList.add('active');
    switchAuthTab(mode);
    
    // Focus first input
    setTimeout(() => {
        document.getElementById('email').focus();
    }, 300);
}

function closeAuthModal() {
    DOM.authModal.classList.remove('active');
    DOM.authForm.reset();
}

function switchAuthTab(tab) {
    AppState.authMode = tab;
    
    // Update tab styles
    document.querySelectorAll('.auth-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });
    
    // Show/hide username field
    if (tab === 'signup') {
        DOM.usernameGroup.classList.remove('hidden');
        DOM.authTitle.textContent = 'Create account';
        DOM.authSubtitle.textContent = 'Start your learning journey today';
        DOM.authSubmitBtn.textContent = 'Create Account';
    } else {
        DOM.usernameGroup.classList.add('hidden');
        DOM.authTitle.textContent = 'Welcome back';
        DOM.authSubtitle.textContent = 'Sign in to continue your learning journey';
        DOM.authSubmitBtn.textContent = 'Sign In';
    }
}

async function handleAuth(event) {
    event.preventDefault();
    
    const formData = new FormData(DOM.authForm);
    formData.append(AppState.authMode, '1'); // Add login or signup flag
    
    DOM.authSubmitBtn.disabled = true;
    DOM.authSubmitBtn.innerHTML = '<span class="spinner"></span>';
    
    try {
        const response = await fetch('php/auth.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();

        if (data.success) {
            // Auth successful
            AppState.isLoggedIn = true;
            AppState.user = data.user;
            updateUserUI();
            closeAuthModal();
            // loadChatHistory(); // Removed

            // If there was a pending message, send it
            if (AppState.pendingMessage) {
                transitionToChat(AppState.pendingMessage);
                AppState.pendingMessage = null;
            } else {
                transitionToChat();
            }
        } else {
            alert(data.error || 'Authentication failed');
        }
    } catch (error) {
        console.error('Auth Error:', error);
        alert('An error occurred during authentication. Please try again.');
    } finally {
        DOM.authSubmitBtn.disabled = false;
        // Restore button text based on mode
        DOM.authSubmitBtn.textContent = AppState.authMode === 'login' ? 'Sign In' : 'Create Account';
    }
}

// VIEW TRANSITIONS
// ============================================
function transitionToChat(initialMessage = null) {
    AppState.currentView = 'chat';
    
    // Fade out hero content
    DOM.heroContent.classList.add('fade-out');
    
    // After animation, switch views
    setTimeout(() => {
        DOM.landingPage.classList.add('hidden');
        DOM.chatDashboard.classList.add('active');
        
        // Focus chat input
        DOM.chatInput.focus();
        
        // If there's an initial message, send it
        if (initialMessage) {
            DOM.chatInput.value = initialMessage;
            sendMessage();
        }
    }, 400);
}

function transitionToLanding() {
    AppState.currentView = 'landing';
    
    DOM.chatDashboard.classList.remove('active');
    DOM.landingPage.classList.remove('hidden');
    DOM.heroContent.classList.remove('fade-out');
    
    // Reset hero input
    DOM.heroInput.value = '';
}

// ============================================
// CHAT FUNCTIONALITY
// ============================================
function sendMessage() {
    const message = DOM.chatInput.value.trim();
    if (!message) return;
    
    // Hide welcome screen
    DOM.chatWelcome.style.display = 'none';
    
    // Add user message
    addMessage(message, 'user');
    
    // Clear input
    DOM.chatInput.value = '';
    DOM.chatInput.style.height = 'auto';
    DOM.chatInput.focus();
    
    // Show typing indicator
    showTypingIndicator();
    
    // Send to backend
    sendToAPI(message);
}

function sendSuggestion(text) {
    DOM.chatInput.value = text;
    sendMessage();
}

function addMessage(content, type, timestamp = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const time = timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(content)}</div>
        <div class="message-meta">${time}</div>
    `;
    
    DOM.chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message bot';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    DOM.chatMessages.appendChild(indicator);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

async function sendToAPI(message) {
    try {
        const payload = { 
            message: message,
            conversation_id: AppState.activeConversationId
        };

        const response = await fetch('php/chat_proxy.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        removeTypingIndicator();
        
        if (data.reply) {
            addMessage(data.reply, 'bot');
            
            // If new conversation, set ID and Title
            if (data.is_new) {
                AppState.activeConversationId = data.conversation_id;
                if(data.title) {
                    DOM.chatTitleHeader.textContent = data.title;
                    // loadChatHistory(); // Removed
                }
            }
        } else {
            addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
    } catch (error) {
        console.error('API Error:', error);
        removeTypingIndicator();
        addMessage('Connection error. Please check your connection and try again.', 'bot');
    }
}

// ============================================
// SIDEBAR & CHAT HISTORY
// ============================================
function toggleSidebar() {
    // Removed
}

function newChat() {
    AppState.activeConversationId = null;
    DOM.chatTitleHeader.textContent = ''; // Clear text
    
    // Clear messages
    DOM.chatMessages.innerHTML = '';
    DOM.chatMessages.appendChild(DOM.chatWelcome);
    DOM.chatWelcome.style.display = 'flex';
    
    // Clear input
    DOM.chatInput.value = '';

    // Redirect to Landing Page (as requested)
    transitionToLanding();
}

// Functions loadChatHistory and loadConversation removed


// ============================================
// AUTH & LOGOUT
// ============================================
function openLogoutModal() {
    showConfirmModal(
        'Sign Out', 
        'Are you sure you want to sign out?', 
        () => logout()
    );
}

function showConfirmModal(title, message, onConfirm) {
    if (!DOM.confirmModal) return;
    
    DOM.confirmTitle.textContent = title;
    DOM.confirmMessage.textContent = message;
    DOM.confirmModal.classList.add('active');
    
    // Assign new click handler
    DOM.confirmYesBtn.onclick = () => {
        onConfirm();
        closeConfirmModal();
    };
}

function closeConfirmModal() {
    if (DOM.confirmModal) {
        DOM.confirmModal.classList.remove('active');
    }
}

function logout() {
    fetch('php/logout.php')
        .then(() => {
            AppState.isLoggedIn = false;
            AppState.user = null;
            AppState.activeConversationId = null;
            updateUserUI(); // Update UI to show login buttons
            transitionToLanding();
            newChat();
        })
        .catch(console.error);
}

function googleAuth() {
    // Initiate Real Google OAuth Flow
    const btn = document.querySelector('.btn-google');
    btn.innerHTML = 'Redirecting to Google...';
    btn.style.opacity = '0.7';
    
    // Redirect to PHP script which handles the OAuth
    window.location.href = 'php/google_auth.php';
}

// ============================================
// UTILITIES
// ============================================
function autoResizeTextarea() {
    DOM.chatInput.style.height = 'auto';
    DOM.chatInput.style.height = Math.min(DOM.chatInput.scrollHeight, 150) + 'px';
}

function scrollToBottom() {
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize chat history on load
// loadChatHistory();
