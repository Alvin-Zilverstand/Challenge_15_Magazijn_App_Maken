// Student dashboard functionality
let items = [];

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (!token || role !== 'student') {
        window.location.href = '/index.html';
    }
}

// Initialize page
async function initializePage() {
    checkAuth();
    await loadItems();
    setupEventListeners();
    displayUserInfo();
    initializeModal();
    startAutoRefresh();
}

// Display user info
function displayUserInfo() {
    const username = localStorage.getItem('username');
    document.getElementById('userInfo').textContent = `Student: ${username}`;
}

// Load items from server
async function loadItems() {
    try {
        const response = await fetch('/api/items', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        items = await response.json();
        displayItems();
    } catch (error) {
        console.error('Error loading items:', error);
        alert('Failed to load items');
    }
}

let itemDetailsModal = null;
let currentItem = null;

// Initialize Bootstrap modal
function initializeModal() {
    const modalElement = document.getElementById('itemDetailsModal');
    itemDetailsModal = new bootstrap.Modal(modalElement);

    // Set up modal reserve button
    document.getElementById('modalReserveButton').addEventListener('click', () => {
        if (currentItem) {
            const quantity = parseInt(document.getElementById('reserveQuantity').value);
            reserveItem(currentItem._id, quantity);
        }
    });
}

// Show item details in modal
function showItemDetails(item) {
    currentItem = item;
    const availableQuantity = item.quantity - (item.reserved || 0);

    // Set modal content
    document.getElementById('modalItemImage').src = item.imageUrl || '/images/default-item.png';
    document.getElementById('modalItemName').textContent = item.name;
    document.getElementById('modalItemDescription').textContent = item.description || 'No description available';
    document.getElementById('modalItemLocation').textContent = item.location;
    document.getElementById('modalItemQuantity').textContent = availableQuantity;

    // Populate quantity select
    const quantitySelect = document.getElementById('reserveQuantity');
    quantitySelect.innerHTML = '';
    for (let i = 1; i <= availableQuantity; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        quantitySelect.appendChild(option);
    }

    // Show/hide reserve button and quantity select based on availability
    const reserveButton = document.getElementById('modalReserveButton');
    const quantityGroup = document.getElementById('quantitySelectGroup');
    if (availableQuantity > 0) {
        reserveButton.style.display = 'block';
        quantityGroup.style.display = 'block';
        reserveButton.disabled = false;
    } else {
        reserveButton.style.display = 'none';
        quantityGroup.style.display = 'none';
    }

    itemDetailsModal.show();
}

// Track current view mode
let currentViewMode = localStorage.getItem('studentViewMode') || 'grid';

// Display items based on current view mode
function displayItems() {
    const locationFilter = document.getElementById('locationFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filteredItems = items;
    
    // Apply location filter
    if (locationFilter !== 'all') {
        filteredItems = filteredItems.filter(item => item.location === locationFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
        filteredItems = filteredItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm) || 
            (item.description && item.description.toLowerCase().includes(searchTerm))
        );
    }

    // Update view mode buttons active state
    const viewButtons = document.querySelectorAll('.view-mode-btn');
    viewButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-mode') === currentViewMode);
    });

    // Show/hide appropriate containers
    document.getElementById('itemsGrid').classList.toggle('d-none', currentViewMode !== 'grid');
    document.getElementById('itemsList').classList.toggle('d-none', currentViewMode !== 'list');

    if (currentViewMode === 'grid') {
        // Display items in grid view
        const gridContainer = document.getElementById('itemsGrid');
        gridContainer.innerHTML = filteredItems.map(item => `
            <div class="col-md-4 col-lg-3 mb-4">
                <div class="card h-100" style="cursor: pointer" onclick='showItemDetails(${JSON.stringify(item).replace(/"/g, '&quot;')})'>
                    <img src="${item.imageUrl || '/images/default-item.png'}" class="card-img-top" alt="${item.name}" style="height: 200px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="card-text small text-muted">${item.description || 'No description available'}</p>
                        <p class="card-text">
                            <small class="text-muted">Location: ${item.location}</small><br>
                            <small class="text-muted">Available: ${item.quantity - (item.reserved || 0)}</small>
                        </p>
                        ${item.quantity - (item.reserved || 0) > 0 ? 
                            '<span class="badge bg-success">Available</span>' :
                            '<span class="badge bg-secondary">Not Available</span>'
                        }
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        // Display items in list view
        const itemsListBody = document.getElementById('itemsListBody');
        itemsListBody.innerHTML = filteredItems.map(item => `
            <tr class="item-row" style="cursor: pointer" onclick="showItemDetails(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                <td><img src="${item.imageUrl || '/images/default-item.png'}" class="item-thumbnail" alt="${item.name}"></td>
                <td>${item.name}</td>
                <td>${item.description || 'No description available'}</td>
                <td>${item.location}</td>
                <td>${item.quantity - (item.reserved || 0)}</td>
                <td>
                    ${item.quantity - (item.reserved || 0) > 0 ? 
                        '<span class="badge bg-success">Available</span>' :
                        '<span class="badge bg-secondary">Not Available</span>'
                    }
                </td>
            </tr>
        `).join('');
    }
}

// Load user's reservations
async function loadMyReservations() {
    try {
        const response = await fetch('/api/reservations/my', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        myReservations = await response.json();
        displayMyReservations();
    } catch (error) {
        console.error('Error loading reservations:', error);
        alert('Failed to load reservations');
    }
}

// Display user's reservations
function displayMyReservations() {
    const reservationsList = document.getElementById('reservationsList');
    reservationsList.innerHTML = myReservations.map(reservation => `
        <tr>
            <td>${reservation.itemName}</td>
            <td>${reservation.location}</td>
            <td>${new Date(reservation.reservedDate).toLocaleDateString()}</td>
            <td><span class="badge reservation-${reservation.status.toLowerCase()}">${reservation.status}</span></td>
        </tr>
    `).join('');
}

// Reserve an item
async function reserveItem(itemId, quantity = 1) {
    try {
        const response = await fetch('/api/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ itemId, quantity })
        });

        if (response.ok) {
            await loadItems();
            itemDetailsModal.hide();
            // Redirect to reservations page after successful reservation
            window.location.href = '/student-reservations.html';
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to reserve item');
        }
    } catch (error) {
        console.error('Error reserving item:', error);
        alert('Failed to reserve item');
    }
}

// Switch view mode
function switchViewMode(mode) {
    currentViewMode = mode;
    localStorage.setItem('studentViewMode', mode);
    displayItems();
}

// Set up event listeners
function setupEventListeners() {
    document.getElementById('locationFilter').addEventListener('change', displayItems);
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/index.html';
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    
    searchInput.addEventListener('input', displayItems);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            displayItems();
        }
    });
    
    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        displayItems();
        searchInput.focus();
    });
    
    // View mode toggle listeners
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => switchViewMode(btn.getAttribute('data-mode')));
    });
}

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

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);