// Admin dashboard functionality
let items = [];
let reservations = [];
let currentView = 'grid'; // Default view mode

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (!token || role !== 'admin') {
        window.location.href = '/index.html';
    }
}

// Initialize page
async function initializePage() {
    try {
        checkAuth();
        await loadItems();
        displayUserInfo();
        setupEventListeners();  // Move this after displayUserInfo to ensure DOM is ready
        startAutoRefresh();
        console.log('Page initialization complete');
    } catch (error) {
        console.error('Error during page initialization:', error);
        throw error;  // Re-throw to be caught by the outer try-catch
    }
}

// Reload content when language changes
function reloadContent() {
    displayItems();
}

// Make reloadContent available globally for translation manager
window.reloadContent = reloadContent;

// Display user info
function displayUserInfo() {
    const username = localStorage.getItem('username');
    document.getElementById('userInfo').textContent = `Admin: ${username}`;
}

// Load items from server
async function loadItems() {
    try {
        console.log('Loading items...');
        const response = await fetch('/api/items', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        console.log('Received items:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to load items');
        }
        
        items = data;
        displayItems();
    } catch (error) {
        console.error('Error loading items:', error);
        alert('Failed to load items: ' + error.message);
    }
}

// Filter items based on search term
function getFilteredItems() {
    const searchTerm = document.getElementById('searchInput') ? 
        document.getElementById('searchInput').value.toLowerCase() : '';
    
    if (searchTerm.trim() === '') {
        return items;
    }
    
    return items.filter(item => {
        const translationManager = window.ensureTranslationManager ? window.ensureTranslationManager() : null;
        if (translationManager) {
            const localizedItem = translationManager.getLocalizedItem(item);
            return localizedItem.name.toLowerCase().includes(searchTerm) || 
                   (localizedItem.description && localizedItem.description.toLowerCase().includes(searchTerm)) ||
                   item.location.toLowerCase().includes(searchTerm);
        } else if (window.getItemDisplayText) {
            const currentLang = localStorage.getItem('language') || 'nl';
            const name = window.getItemDisplayText(item, 'name', currentLang);
            const description = window.getItemDisplayText(item, 'description', currentLang);
            return name.toLowerCase().includes(searchTerm) || 
                   description.toLowerCase().includes(searchTerm) ||
                   item.location.toLowerCase().includes(searchTerm);
        } else {
            // Fallback for when translation manager isn't loaded yet (default to Dutch)
            const name = item.name?.nl || item.name?.en || item.name || '';
            const description = item.description?.nl || item.description?.en || item.description || '';
            return name.toLowerCase().includes(searchTerm) || 
                   description.toLowerCase().includes(searchTerm) ||
                   item.location.toLowerCase().includes(searchTerm);
        }
    });
}

// Display items based on current view mode
function displayItems() {
    if (currentView === 'grid') {
        displayGridView();
    } else {
        displayListView();
    }
}

// Display items in grid view
function displayGridView() {
    const itemsGrid = document.getElementById('itemsGrid');
    document.getElementById('itemsList').classList.add('d-none');
    itemsGrid.classList.remove('d-none');

    const filteredItems = getFilteredItems();
    itemsGrid.innerHTML = filteredItems.map(item => {
        // Use multiple fallback strategies
        const translationManager = window.ensureTranslationManager ? window.ensureTranslationManager() : null;
        let localizedItem;
        
        if (translationManager) {
            localizedItem = translationManager.getLocalizedItem(item);
        } else if (window.getItemDisplayText) {
            // Use debug helper fallback
            const currentLang = localStorage.getItem('language') || 'nl';
            localizedItem = {
                ...item,
                name: window.getItemDisplayText(item, 'name', currentLang),
                description: window.getItemDisplayText(item, 'description', currentLang)
            };
        } else {
            // Final fallback
            localizedItem = {
                ...item,
                name: (typeof item.name === 'object') ? (item.name?.nl || item.name?.en || 'Onbekend Artikel') : (item.name || 'Onbekend Artikel'),
                description: (typeof item.description === 'object') ? (item.description?.nl || item.description?.en || 'Geen beschrijving beschikbaar') : (item.description || 'Geen beschrijving beschikbaar')
            };
        }
        
        return `
        <div class="col-md-4 col-lg-3">
            <div class="card item-card">
                <img src="${item.imageUrl || '/images/default-item.png'}" class="item-image" alt="${localizedItem.name}">
                <div class="card-body">
                    <h5 class="card-title">${localizedItem.name}</h5>
                    <p class="card-text text-muted">${localizedItem.description || 'No description available'}</p>
                    <p class="card-text">Location: ${item.location}</p>
                    <p class="card-text">Quantity: ${item.quantity}</p>
                    <p class="card-text">Reserved: ${item.reserved || 0}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-sm btn-warning" onclick="editItem('${item._id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteItem('${item._id}')">Delete</button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Display items in list view
function displayListView() {
    const itemsList = document.getElementById('itemsList');
    const itemsGrid = document.getElementById('itemsGrid');
    itemsGrid.classList.add('d-none');
    itemsList.classList.remove('d-none');

    const itemsListBody = document.getElementById('itemsListBody');
    const filteredItems = getFilteredItems();
    itemsListBody.innerHTML = filteredItems.map(item => {
        // Use multiple fallback strategies
        const translationManager = window.ensureTranslationManager ? window.ensureTranslationManager() : null;
        let localizedItem;
        
        if (translationManager) {
            localizedItem = translationManager.getLocalizedItem(item);
        } else if (window.getItemDisplayText) {
            // Use debug helper fallback
            const currentLang = localStorage.getItem('language') || 'nl';
            localizedItem = {
                ...item,
                name: window.getItemDisplayText(item, 'name', currentLang),
                description: window.getItemDisplayText(item, 'description', currentLang)
            };
        } else {
            // Final fallback
            localizedItem = {
                ...item,
                name: (typeof item.name === 'object') ? (item.name?.nl || item.name?.en || 'Onbekend Artikel') : (item.name || 'Onbekend Artikel'),
                description: (typeof item.description === 'object') ? (item.description?.nl || item.description?.en || 'Geen beschrijving beschikbaar') : (item.description || 'Geen beschrijving beschikbaar')
            };
        }
        
        return `
        <tr>
            <td><img src="${item.imageUrl || '/images/default-item.png'}" class="item-thumbnail" alt="${localizedItem.name}"></td>
            <td>${localizedItem.name}</td>
            <td>${localizedItem.description || 'No description available'}</td>
            <td>${item.location}</td>
            <td>${item.quantity}</td>
            <td>${item.reserved || 0}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editItem('${item._id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteItem('${item._id}')">Delete</button>
            </td>
        </tr>
        `;
    }).join('');
}

// Load reservations
async function loadReservations() {
    try {
        const response = await fetch('/api/reservations', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        reservations = await response.json();
        displayReservations();
    } catch (error) {
        console.error('Error loading reservations:', error);
        alert('Failed to load reservations');
    }
}

// Display reservations in table
function displayReservations() {
    const reservationsList = document.getElementById('reservationsList');
    reservationsList.innerHTML = reservations.map(reservation => `
        <tr>
            <td>${reservation.studentName}</td>
            <td>${reservation.itemName}</td>
            <td>${reservation.location}</td>
            <td>${new Date(reservation.reservedDate).toLocaleDateString()}</td>
            <td><span class="badge reservation-${reservation.status.toLowerCase()}">${reservation.status}</span></td>
            <td>
                ${reservation.status === 'PENDING' ? `
                    <button class="btn btn-sm btn-success" onclick="updateReservation('${reservation._id}', 'APPROVED')">Approve</button>
                    <button class="btn btn-sm btn-danger" onclick="updateReservation('${reservation._id}', 'REJECTED')">Reject</button>
                ` : ''}
            </td>
        </tr>
    `).join('');
}


// Delete item
async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
        const response = await fetch(`/api/items/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            await loadItems();
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to delete item');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
    }
}

// Update reservation status
async function updateReservation(reservationId, status) {
    try {
        const response = await fetch(`/api/reservations/${reservationId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            await loadReservations();
            await loadItems(); // Refresh items to update quantities
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to update reservation');
        }
    } catch (error) {
        console.error('Error updating reservation:', error);
        alert('Failed to update reservation');
    }
}

// Edit item functionality
let editModal = null;

// Initialize Bootstrap modal when DOM is loaded
function initializeModal() {
    const modalElement = document.getElementById('editItemModal');
    if (!modalElement) {
        console.error('Modal element not found in the DOM');
        return;
    }
    try {
        editModal = new bootstrap.Modal(modalElement);
        console.log('Modal initialized successfully');
    } catch (error) {
        console.error('Error initializing modal:', error);
    }
}

async function editItem(itemId) {
    try {
        console.log('Fetching item with ID:', itemId);  // Debug log
        const response = await fetch(`/api/items/${itemId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        console.log('Response data:', data);  // Debug log

        if (!response.ok) {
            console.error('Server error:', data);
            throw new Error(data.message || 'Failed to fetch item');
        }
        
        if (!data || !data._id) {
            throw new Error('Invalid item data received');
        }

        document.getElementById('editItemId').value = data._id;
        document.getElementById('editItemName').value = data.name;
        document.getElementById('editItemDescription').value = data.description || '';
        document.getElementById('editItemLocation').value = data.location;
        document.getElementById('editItemQuantity').value = data.quantity;

        // Show current image if it exists
        const imagePreview = document.getElementById('editImagePreview');
        const removeButton = document.getElementById('editRemoveImage');
        imagePreview.innerHTML = '';
        
        if (data.imageUrl) {
            const img = document.createElement('img');
            img.src = data.imageUrl;
            img.classList.add('modal-item-image');
            imagePreview.appendChild(img);
            removeButton.style.display = 'block';
            imagePreview.dataset.currentImageUrl = data.imageUrl;
        } else {
            removeButton.style.display = 'none';
            imagePreview.dataset.currentImageUrl = '';
        }

        // Show the modal
        if (!editModal) {
            console.log('Modal not initialized, attempting to initialize now');
            initializeModal();
        }
        
        if (editModal) {
            editModal.show();
        } else {
            throw new Error('Could not initialize modal. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching item:', error);
        alert('Error loading item details: ' + error.message);
    }
}

async function submitEditItem() {
    const itemId = document.getElementById('editItemId').value;
    const formData = new FormData();
    formData.append('name', document.getElementById('editItemName').value);
    formData.append('description', document.getElementById('editItemDescription').value);
    formData.append('location', document.getElementById('editItemLocation').value);
    formData.append('quantity', document.getElementById('editItemQuantity').value);

    const imagePreview = document.getElementById('editImagePreview');
    const imageFile = document.getElementById('editItemImage').files[0];
    const currentImageUrl = imagePreview.dataset.currentImageUrl;

    try {
        // Handle image update
        if (imageFile) {
            // Upload new image
            const imageFormData = new FormData();
            imageFormData.append('image', imageFile);
            
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: imageFormData
            });
            
            if (!uploadResponse.ok) {
                throw new Error('Failed to upload image');
            }
            
            const { imageUrl } = await uploadResponse.json();
            formData.append('imageUrl', imageUrl);
        } else if (!currentImageUrl) {
            // If no new image and no current image, explicitly set imageUrl to null
            formData.append('imageUrl', '');
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
        return;
    }

    try {
        const response = await fetch(`/api/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });

        if (!response.ok) {
            throw new Error('Update failed');
        }

        await loadItems(); // Refresh the items list
        bootstrap.Modal.getInstance(document.getElementById('editItemModal')).hide();
        alert('Item updated successfully');
    } catch (error) {
        console.error('Error updating item:', error);
        alert('Error updating item');
    }
}

// Set up event listeners
function setupEventListeners() {
    // Common elements
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/index.html';
        });
    }
    
    // View mode toggle
    const viewModeBtns = document.querySelectorAll('.view-mode-btn');
    if (viewModeBtns.length > 0) {
        viewModeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.view-mode-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentView = this.dataset.mode;
                displayItems();
            });
        });
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    
    if (searchInput) {
        searchInput.addEventListener('input', displayItems);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                displayItems();
            }
        });
    }
    
    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                displayItems();
                searchInput.focus();
            }
        });
    }

    // Edit form elements
    const editItemImage = document.getElementById('editItemImage');
    if (editItemImage) {
        editItemImage.addEventListener('change', function(e) {
            const file = e.target.files[0];
            const imagePreview = document.getElementById('editImagePreview');
            const removeButton = document.getElementById('editRemoveImage');

            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('modal-item-image');
                    imagePreview.appendChild(img);
                    removeButton.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.innerHTML = '';
                if (!imagePreview.dataset.currentImageUrl) {
                    removeButton.style.display = 'none';
                }
            }
        });
    }

    // Remove image button
    const editRemoveImage = document.getElementById('editRemoveImage');
    if (editRemoveImage) {
        editRemoveImage.addEventListener('click', function() {
            const imagePreview = document.getElementById('editImagePreview');
            const imageInput = document.getElementById('editItemImage');
            const removeButton = document.getElementById('editRemoveImage');

            imagePreview.innerHTML = '';
            imageInput.value = '';
            imagePreview.dataset.currentImageUrl = '';
            removeButton.style.display = 'none';
        });
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing page...');
        await initializePage();
        console.log('Page initialized');
        
        // Ensure modal is initialized after Bootstrap is loaded
        setTimeout(() => {
            console.log('Initializing modal...');
            initializeModal();
            console.log('Modal initialized');
        }, 100);
    } catch (error) {
        console.error('Error during page initialization:', error);
        alert('Error initializing page: ' + error.message);
    }
});

// Auto refresh functionality
let refreshInterval;
let lastItemsChecksum = '';

function startAutoRefresh() {
    // Refresh every 30 seconds
    refreshInterval = setInterval(async () => {
        await checkForUpdates();
    }, 30000);
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
}

async function checkForUpdates() {
    try {
        const response = await fetch('/api/items', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const currentItems = await response.json();
            
            // Create a simple checksum of the items data
            const currentChecksum = JSON.stringify(currentItems.map(item => ({
                id: item._id,
                quantity: item.quantity,
                reserved: item.reserved || 0
            })));

            // If items changed, refresh the display
            if (lastItemsChecksum && currentChecksum !== lastItemsChecksum) {
                items = currentItems;
                displayItems();
                
                // Show update notification
                showUpdateNotification();
            }
            
            lastItemsChecksum = currentChecksum;
        }
    } catch (error) {
        console.error('Error checking for updates:', error);
    }
}

function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'alert alert-info alert-dismissible fade show';
    notification.innerHTML = `
        <i class="bi bi-info-circle"></i> Items updated!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    const container = document.querySelector('.container');
    container.prepend(notification);
    setTimeout(() => notification.remove(), 3000);
}