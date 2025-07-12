// Global variables
let token = localStorage.getItem('token');

// DOM elements
const loginSection = document.getElementById('login-section');
const tasksSection = document.getElementById('tasks-section');
const logoutBtn = document.getElementById('logout-btn');
const loginForm = document.getElementById('login-form');
const addTaskForm = document.getElementById('add-task-form');
const tasksList = document.getElementById('tasks-list');
const taskCount = document.getElementById('task-count');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupEventListeners();
});

// Check authentication status
function checkAuthStatus() {
    if (token) {
        showTasksSection();
        loadTasks();
    } else {
        showLoginSection();
    }
}

// Setup event listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    addTaskForm.addEventListener('submit', handleAddTask);
    logoutBtn.addEventListener('click', handleLogout);
}

// Show login section
function showLoginSection() {
    loginSection.style.display = 'flex';
    tasksSection.style.display = 'none';
    logoutBtn.style.display = 'none';
}

// Show tasks section
function showTasksSection() {
    loginSection.style.display = 'none';
    tasksSection.style.display = 'flex';
    logoutBtn.style.display = 'flex';
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const username = formData.get('username');
    const password = formData.get('password');
    
    const loginError = document.getElementById('login-error');
    loginError.style.display = 'none';
    
    // Show loading state
    const loginBtn = loginForm.querySelector('.login-btn');
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
    loginBtn.disabled = true;
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Store token and update UI
        token = data.token;
        localStorage.setItem('token', token);
        showTasksSection();
        loadTasks();
        
        // Clear form
        loginForm.reset();
        
    } catch (error) {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
    } finally {
        // Reset button state
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
}

// Load tasks
async function loadTasks() {
    const tasksError = document.getElementById('tasks-error');
    
    // Show loading state
    tasksList.innerHTML = `
        <div class="loading-message">
            <i class="fas fa-spinner fa-spin"></i>
            Loading tasks...
        </div>
    `;
    tasksError.style.display = 'none';
    
    try {
        const response = await fetch('http://localhost:5000/tasks', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            handleLogout();
            return;
        }
        
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        
        const tasks = await response.json();
        displayTasks(tasks);
        
    } catch (error) {
        tasksError.textContent = error.message;
        tasksError.style.display = 'block';
        tasksList.innerHTML = '<div class="no-tasks">Failed to load tasks</div>';
    }
}

// Display tasks
function displayTasks(tasks) {
    if (tasks.length === 0) {
        tasksList.innerHTML = '<div class="no-tasks">No tasks yet. Add one above!</div>';
        taskCount.textContent = '0';
        return;
    }
    
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task._id}">
            <div class="task-content">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="toggleTask('${task._id}', ${task.completed})"
                >
                <span class="task-title">${escapeHtml(task.title)}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask('${task._id}')">
                <i class="fas fa-trash"></i>
                Delete
            </button>
        </div>
    `).join('');
    
    taskCount.textContent = tasks.length;
}

// Handle add task
async function handleAddTask(e) {
    e.preventDefault();
    
    const taskInput = document.getElementById('new-task');
    const title = taskInput.value.trim();
    
    if (!title) return;
    
    // Show loading state
    const addBtn = addTaskForm.querySelector('.add-btn');
    const originalText = addBtn.innerHTML;
    addBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    addBtn.disabled = true;
    
    try {
        const response = await fetch('http://localhost:5000/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: title,
                completed: false
            })
        });
        
        if (response.status === 401) {
            handleLogout();
            return;
        }
        
        if (!response.ok) {
            throw new Error('Failed to add task');
        }
        
        // Clear input and reload tasks
        taskInput.value = '';
        loadTasks();
        
    } catch (error) {
        const tasksError = document.getElementById('tasks-error');
        tasksError.textContent = error.message;
        tasksError.style.display = 'block';
    } finally {
        // Reset button state
        addBtn.innerHTML = originalText;
        addBtn.disabled = false;
    }
}

// Toggle task completion
async function toggleTask(id, currentStatus) {
    try {
        const response = await fetch(`http://localhost:5000/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                completed: !currentStatus
            })
        });
        
        if (response.status === 401) {
            handleLogout();
            return;
        }
        
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        
        // Reload tasks to show updated state
        loadTasks();
        
    } catch (error) {
        const tasksError = document.getElementById('tasks-error');
        tasksError.textContent = error.message;
        tasksError.style.display = 'block';
    }
}

// Delete task
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:5000/tasks/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            handleLogout();
            return;
        }
        
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        
        // Reload tasks
        loadTasks();
        
    } catch (error) {
        const tasksError = document.getElementById('tasks-error');
        tasksError.textContent = error.message;
        tasksError.style.display = 'block';
    }
}

// Handle logout
function handleLogout() {
    token = null;
    localStorage.removeItem('token');
    showLoginSection();
    
    // Clear forms
    loginForm.reset();
    addTaskForm.reset();
    
    // Clear error messages
    document.getElementById('login-error').style.display = 'none';
    document.getElementById('tasks-error').style.display = 'none';
    
    // Reload page to ensure clean state
    setTimeout(() => {
        window.location.reload();
    }, 500);
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
} 