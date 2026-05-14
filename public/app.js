const API_URL = 'http://localhost:3000/tasks';

// State
let tasks = [];
let filters = { priority: '', completed: '' };

// DOM Elements
const taskForm = document.getElementById('taskForm');
const tasksContainer = document.getElementById('tasksContainer');
const filterPriority = document.getElementById('filterPriority');
const filterCompleted = document.getElementById('filterCompleted');
const clearFiltersBtn = document.getElementById('clearFilters');
const modal = document.getElementById('taskModal');
const modalClose = document.querySelector('.close');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    loadStats();

    taskForm.addEventListener('submit', handleAddTask);
    filterPriority.addEventListener('change', handleFilterChange);
    filterCompleted.addEventListener('change', handleFilterChange);
    clearFiltersBtn.addEventListener('click', clearFilters);
    modalClose.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
});

// API Functions
async function loadTasks() {
    try {
        let url = API_URL;
        const params = new URLSearchParams();

        if (filters.priority) params.append('priority', filters.priority);
        if (filters.completed) params.append('completed', filters.completed);

        if (params.toString()) url += `?${params.toString()}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            tasks = data.data;
            renderTasks();
        }
    } catch (error) {
        showToast('Failed to load tasks', 'error');
    }
}

async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('totalTasks').textContent = data.data.total;
            document.getElementById('completedTasks').textContent = data.data.completed;
            document.getElementById('pendingTasks').textContent = data.data.pending;
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

async function handleAddTask(e) {
    e.preventDefault();

    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const priority = document.getElementById('taskPriority').value;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, priority })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Task created successfully!', 'success');
            taskForm.reset();
            loadTasks();
            loadStats();
        } else {
            showToast(data.errors?.join(', ') || 'Failed to create task', 'error');
        }
    } catch (error) {
        showToast('Failed to create task', 'error');
    }
}

async function updateTask(id, updates) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        const data = await response.json();

        if (data.success) {
            showToast('Task updated successfully!', 'success');
            loadTasks();
            loadStats();
        } else {
            showToast(data.message || 'Failed to update task', 'error');
        }
    } catch (error) {
        showToast('Failed to update task', 'error');
    }
}

async function completeTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}/complete`, {
            method: 'PATCH'
        });

        const data = await response.json();

        if (data.success) {
            showToast('Task marked as complete!', 'success');
            loadTasks();
            loadStats();
        } else {
            showToast(data.message || 'Failed to complete task', 'error');
        }
    } catch (error) {
        showToast('Failed to complete task', 'error');
    }
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showToast('Task deleted successfully!', 'success');
            loadTasks();
            loadStats();
        } else {
            showToast(data.message || 'Failed to delete task', 'error');
        }
    } catch (error) {
        showToast('Failed to delete task', 'error');
    }
}

async function uploadAttachment(taskId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';

    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_URL}/${taskId}/attachment`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                showToast('Attachment uploaded successfully!', 'success');
                loadTasks();
            } else {
                showToast(data.message || 'Failed to upload attachment', 'error');
            }
        } catch (error) {
            showToast('Failed to upload attachment', 'error');
        }
    };

    input.click();
}

// Render Functions
function renderTasks() {
    if (tasks.length === 0) {
        tasksContainer.innerHTML = '<p class="empty-state">No tasks found.</p>';
        return;
    }

    tasksContainer.innerHTML = tasks.map(task => `
        <div class="task-card ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-header">
                <h3 class="task-title">${escapeHtml(task.title)}</h3>
                <span class="priority-badge priority-${task.priority}">${task.priority}</span>
            </div>
            <p class="task-description">${escapeHtml(task.description)}</p>
            <div class="task-meta">
                Created: ${new Date(task.createdAt).toLocaleDateString()}
            </div>
            ${task.attachment ? `
                <div class="task-attachment">
                    📎 ${escapeHtml(task.attachment.filename)} (${formatBytes(task.attachment.size)})
                </div>
            ` : ''}
            <div class="task-actions">
                ${!task.completed ? `
                    <button class="btn btn-success btn-small" onclick="completeTask(${task.id})">
                        ✓ Complete
                    </button>
                ` : ''}
                <button class="btn btn-secondary btn-small" onclick="showEditModal(${task.id})">
                    ✏️ Edit
                </button>
                ${!task.attachment ? `
                    <button class="btn btn-secondary btn-small" onclick="uploadAttachment(${task.id})">
                        📎 Attach
                    </button>
                ` : ''}
                <button class="btn btn-danger btn-small" onclick="deleteTask(${task.id})">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}

function showEditModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('modalTitle').textContent = 'Edit Task';
    document.getElementById('modalBody').innerHTML = `
        <form id="editForm">
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="editTitle" value="${escapeHtml(task.title)}" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="editDescription" required>${escapeHtml(task.description)}</textarea>
            </div>
            <div class="form-group">
                <label>Priority</label>
                <select id="editPriority" required>
                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                    <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
    `;

    document.getElementById('editForm').addEventListener('submit', (e) => {
        e.preventDefault();
        updateTask(taskId, {
            title: document.getElementById('editTitle').value,
            description: document.getElementById('editDescription').value,
            priority: document.getElementById('editPriority').value
        });
        closeModal();
    });

    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

// Filter Functions
function handleFilterChange() {
    filters.priority = filterPriority.value;
    filters.completed = filterCompleted.value;
    loadTasks();
}

function clearFilters() {
    filters = { priority: '', completed: '' };
    filterPriority.value = '';
    filterCompleted.value = '';
    loadTasks();
}

// Utility Functions
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}