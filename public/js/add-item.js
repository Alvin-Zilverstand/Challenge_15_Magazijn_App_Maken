// Add Item page functionality

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (!token || role !== 'admin') {
        window.location.href = '/index.html';
    }
}

// Initialize page
function initializePage() {
    checkAuth();
    setupEventListeners();
    displayUserInfo();
    setupImagePreview();
}

// Display user info
function displayUserInfo() {
    const username = localStorage.getItem('username');
    document.getElementById('userInfo').textContent = `Admin: ${username}`;
}

// Set up event listeners
function setupEventListeners() {
    document.getElementById('addItemForm').addEventListener('submit', addItem);
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// Handle logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    window.location.href = '/index.html';
}

// Set up image preview
function setupImagePreview() {
    const imageInput = document.getElementById('itemImage');
    const previewContainer = document.getElementById('imagePreview');
    const removeButton = document.getElementById('removeImage');

    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewContainer.innerHTML = `<img src="${e.target.result}" class="img-fluid" alt="Preview">`;
                removeButton.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            previewContainer.innerHTML = '';
            removeButton.style.display = 'none';
        }
    });

    // Handle remove button click
    removeButton.addEventListener('click', () => {
        imageInput.value = '';
        previewContainer.innerHTML = '';
        removeButton.style.display = 'none';
    });
}

// Add new item
async function addItem(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('itemName').value);
    formData.append('location', document.getElementById('itemLocation').value);
    formData.append('description', document.getElementById('itemDescription').value);
    formData.append('quantity', document.getElementById('itemQuantity').value);

    const imageFile = document.getElementById('itemImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch('/api/items', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (response.ok) {
            alert('Item added successfully!');
            window.location.href = 'admin.html';
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to add item');
        }
    } catch (error) {
        console.error('Error adding item:', error);
        alert('Failed to add item');
    }
}

// Initialize the page when loaded
document.addEventListener('DOMContentLoaded', initializePage);