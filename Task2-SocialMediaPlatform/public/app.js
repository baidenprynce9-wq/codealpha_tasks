const API_URL = 'http://localhost:5000/api';

// State
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user'));
let currentEditPostId = null;

// DOM Elements
const authSection = {
    login: document.getElementById('login-section'),
    register: document.getElementById('register-section'),
    formLogin: document.getElementById('login-form'),
    formRegister: document.getElementById('register-form'),
    linkRegister: document.getElementById('show-register'),
    linkLogin: document.getElementById('show-login'),
};

const appSection = {
    feed: document.getElementById('feed-section'),
    profile: document.getElementById('profile-section'),
    navLinks: document.getElementById('nav-links'),
    container: document.getElementById('posts-container'),
    profileContainer: document.getElementById('profile-posts-container'),
    postBtn: document.getElementById('create-post-btn'),
    postText: document.getElementById('post-text'),
    postImage: document.getElementById('post-image'),
    profilePicDisplay: document.getElementById('profile-pic-display'),
    profileNameDisplay: document.getElementById('profile-name-display'),
    profileEmailDisplay: document.getElementById('profile-email-display'),
};

const modal = {
    element: document.getElementById('edit-modal'),
    closeBtn: document.querySelector('.close-modal'),
    textArea: document.getElementById('edit-post-text'),
    saveBtn: document.getElementById('save-edit-btn')
};

// Init
function init() {
    updateNav();
    if (token) {
        showSection('feed-section');
        loadPosts();
    } else {
        showSection('login-section');
    }
}

// Navigation
function updateNav() {
    if (token) {
        appSection.navLinks.innerHTML = `
            <li><a href="#" onclick="showSection('feed-section'); loadPosts();">Home</a></li>
            <li><a href="#" onclick="showSection('profile-section'); loadProfile();">Profile</a></li>
            <li><a href="#" onclick="logout()">Logout</a></li>
        `;
    } else {
        appSection.navLinks.innerHTML = `
            <li><a href="#" onclick="showSection('login-section')">Login</a></li>
            <li><a href="#" onclick="showSection('register-section')">Register</a></li>
        `;
    }
}

function showSection(id) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active-section'));
    document.getElementById(id).classList.add('active-section');
}

window.logout = function () {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    token = null;
    currentUser = null;
    updateNav();
    showSection('login-section');
    showToast('Logged out successfully', 'success');
};

// Toast Notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOutRight 0.5s ease forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Auth Handlers
authSection.linkRegister.addEventListener('click', (e) => { e.preventDefault(); showSection('register-section'); });
authSection.linkLogin.addEventListener('click', (e) => { e.preventDefault(); showSection('login-section'); });

authSection.formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            handleAuthSuccess(data);
            showToast('Welcome to SocialSphere!', 'success');
        } else {
            showToast(data.msg || 'Registration failed', 'error');
        }
    } catch (err) { console.error(err); showToast('Server Error', 'error'); }
});

authSection.formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            handleAuthSuccess(data);
            showToast('Login successful!', 'success');
        } else {
            showToast(data.msg || 'Login failed', 'error');
        }
    } catch (err) { console.error(err); showToast('Server Error', 'error'); }
});

function handleAuthSuccess(data) {
    token = data.token;
    currentUser = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(currentUser));
    updateNav();
    showSection('feed-section');
    loadPosts();
}

// Feed Logic
appSection.postBtn.addEventListener('click', async () => {
    const text = appSection.postText.value;
    const file = appSection.postImage.files[0];

    if (!text && !file) return showToast('Please add text or an image', 'error');

    const formData = new FormData();
    formData.append('userId', currentUser.id);
    if (text) formData.append('text', text);
    if (file) formData.append('image', file);

    try {
        const res = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            body: formData
        });
        if (res.ok) {
            appSection.postText.value = '';
            appSection.postImage.value = '';
            loadPosts();
            showToast('Post created!', 'success');
        }
    } catch (err) { console.error(err); }
});

async function loadPosts() {
    try {
        const res = await fetch(`${API_URL}/posts`);
        const posts = await res.json();
        renderPosts(posts, appSection.container);
    } catch (err) { console.error(err); }
}

async function loadProfile() {
    appSection.profileNameDisplay.textContent = currentUser.name;
    appSection.profileEmailDisplay.textContent = currentUser.email;
    appSection.profilePicDisplay.innerHTML = currentUser.profilePic ? `<img src="${currentUser.profilePic}">` : currentUser.name.charAt(0);

    try {
        const res = await fetch(`${API_URL}/posts`);
        const allPosts = await res.json();
        const myPosts = allPosts.filter(p => p.userId._id === currentUser.id);
        renderPosts(myPosts, appSection.profileContainer);
    } catch (err) { console.error(err); }
}


function renderPosts(posts, container) {
    if (posts.length === 0) {
        container.innerHTML = '<p class="text-center" style="color:var(--text-muted)">No posts yet.</p>';
        return;
    }

    container.innerHTML = posts.map(post => {
        const isOwner = currentUser && post.userId._id === currentUser.id;

        return `
        <div class="post-card">
            <div class="post-header" style="justify-content: space-between;">
                <div style="display:flex; align-items:center;">
                    <div class="user-avatar">
                    ${post.userId.profilePic ? `<img src="${post.userId.profilePic}">` : post.userId.name.charAt(0)}
                    </div>
                    <div class="post-info">
                        <h4>${post.userId.name}</h4>
                        <span>${new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                </div>
                ${isOwner ? `
                    <div class="post-options">
                        <button class="action-btn" onclick="openEditModal('${post._id}', '${post.text || ''}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="deletePost('${post._id}')" style="color:var(--accent-red)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
            <div class="post-content">
                <p>${post.text || ''}</p>
                ${post.image ? `<img src="http://localhost:5000${post.image}" alt="Post Image">` : ''}
            </div>
            <div class="post-footer">
                <button class="action-btn" onclick="likePost('${post._id}')">
                    <i class="${post.likes.includes(currentUser.id) ? 'fas' : 'far'} fa-heart" ${post.likes.includes(currentUser.id) ? 'style="color:var(--accent-red)"' : ''}></i> ${post.likes.length}
                </button>
                <button class="action-btn" onclick="toggleComments('${post._id}')">
                    <i class="far fa-comment"></i> ${post.comments.length}
                </button>
            </div>
             <div id="comments-${post._id}" class="comments-section">
                <div class="comment-input-group">
                    <input type="text" id="comment-input-${post._id}" placeholder="Write a comment..." style="flex:1; padding:10px; border-radius:8px; border:1px solid var(--border-color); background:rgba(0,0,0,0.2); color:white;">
                    <button class="btn btn-primary" onclick="addComment('${post._id}')">Send</button>
                </div>
                <div class="comments-list">
                    ${post.comments.map(c => `
                        <div class="comment-item">
                            <strong>User</strong> <!-- Ideally populate name -->
                            ${c.text}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `}).join('');
}

// Edit & Delete Handlers
window.openEditModal = function (id, text) {
    currentEditPostId = id;
    modal.textArea.value = text;
    modal.element.style.display = 'block';
};

modal.closeBtn.onclick = function () {
    modal.element.style.display = 'none';
};

window.onclick = function (event) {
    if (event.target == modal.element) {
        modal.element.style.display = 'none';
    }
};

modal.saveBtn.onclick = async function () {
    if (!currentEditPostId) return;
    const newText = modal.textArea.value;

    try {
        const res = await fetch(`${API_URL}/posts/${currentEditPostId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, text: newText })
        });

        if (res.ok) {
            showToast('Post updated successfully', 'success');
            modal.element.style.display = 'none';
            loadPosts();
            if (document.getElementById('profile-section').classList.contains('active-section')) loadProfile();
        } else if (res.status === 404) {
            showToast('Post no longer exists', 'error');
            modal.element.style.display = 'none';
            loadPosts();
        } else {
            showToast('Failed to update post', 'error');
        }
    } catch (err) { console.error(err); showToast('Error updating post', 'error'); }
};

window.deletePost = async function (id) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
        const res = await fetch(`${API_URL}/posts/${id}`, {
            method: 'DELETE',
            headers: {
                'x-user-id': currentUser.id
            }
        });

        if (res.ok) {
            showToast('Post deleted', 'success');
            loadPosts();
            if (document.getElementById('profile-section').classList.contains('active-section')) loadProfile();
        } else if (res.status === 404) {
            showToast('Post already deleted', 'info');
            loadPosts();
        } else {
            showToast('Failed to delete post', 'error');
        }
    } catch (err) { console.error(err); showToast('Error deleting post', 'error'); }
};

// Global functions for HTML onclick
window.likePost = async function (id) {
    try {
        await fetch(`${API_URL}/posts/like/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: currentUser.id })
        });
        loadPosts(); // Refresh to show update
    } catch (err) { console.error(err); }
};

window.toggleComments = function (id) {
    const el = document.getElementById(`comments-${id}`);
    el.classList.toggle('show');
};

window.addComment = async function (id) {
    const text = document.getElementById(`comment-input-${id}`).value;
    if (!text) return;

    try {
        await fetch(`${API_URL}/posts/comment/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: currentUser.id, text })
        });
        loadPosts();
        showToast('Comment added', 'success');
    } catch (err) { console.error(err); }
};

// Start
init();
