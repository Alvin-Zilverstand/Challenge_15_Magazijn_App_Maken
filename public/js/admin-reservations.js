// Admin reservations page functionality
let reservations = [];

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
    checkAuth();
    await loadReservations();
    setupEventListeners();
    displayUserInfo();
    startAutoRefresh();
}

// Display user info
function displayUserInfo() {
    const username = localStorage.getItem('username');
    document.getElementById('userInfo').textContent = `Admin: ${username}`;
}

// Load and filter reservations
async function loadReservations() {
    try {
        const response = await fetch('/api/reservations', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        reservations = await response.json();
        filterAndDisplayReservations();
    } catch (error) {
        console.error('Error loading reservations:', error);
        alert('Failed to load reservations');
    }
}

// Filter and display reservations
function filterAndDisplayReservations() {
    const locationFilter = document.getElementById('locationFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    const filteredReservations = reservations.filter(reservation => {
        const locationMatch = locationFilter === 'all' || reservation.location === locationFilter;
        const statusMatch = statusFilter === 'all' || reservation.status === statusFilter;
        return locationMatch && statusMatch;
    });

    const reservationsList = document.getElementById('reservationsList');
    reservationsList.innerHTML = filteredReservations.map(reservation => `
        <tr>
            <td><strong>${reservation.studentName}</strong></td>
            <td>${reservation.itemName}</td>
            <td><span class="badge bg-info">${reservation.quantity || 1}</span></td>
            <td>${reservation.location}</td>
            <td>${new Date(reservation.reservedDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            })}</td>
            <td><span class="badge reservation-${reservation.status.toLowerCase()}">${reservation.status}</span></td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    ${reservation.status === 'PENDING' ? `
                        <button class="btn btn-success" onclick="updateReservation('${reservation._id}', 'APPROVED')" title="Approve">
                            <i class="bi bi-check-lg"></i><span class="btn-text"> Approve</span>
                        </button>
                        <button class="btn btn-warning" onclick="updateReservation('${reservation._id}', 'REJECTED')" title="Reject">
                            <i class="bi bi-x-lg"></i><span class="btn-text"> Reject</span>
                        </button>
                    ` : reservation.status === 'RETURN_PENDING' ? `
                        <button class="btn btn-success" onclick="updateReservation('${reservation._id}', 'RETURNED')" title="Approve Return">
                            <i class="bi bi-check-lg"></i><span class="btn-text"> Approve Return</span>
                        </button>
                        <button class="btn btn-warning" onclick="updateReservation('${reservation._id}', 'APPROVED')" title="Reject Return">
                            <i class="bi bi-x-lg"></i><span class="btn-text"> Reject Return</span>
                        </button>
                    ` : reservation.status === 'APPROVED' ? `
                        <span class="text-info"><i class="bi bi-check-circle"></i><span class="btn-text"> Item Loaned</span></span>
                    ` : reservation.status === 'RETURNED' ? `
                        <button class="btn btn-secondary" onclick="archiveReservation('${reservation._id}')" title="Archive Reservation">
                            <i class="bi bi-archive"></i><span class="btn-text"> Archive</span>
                        </button>
                    ` : ''}
                    <button class="btn btn-danger" onclick="deleteReservation('${reservation._id}')" title="Delete">
                        <i class="bi bi-trash"></i><span class="btn-text"> Delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
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
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to update reservation');
        }
    } catch (error) {
        console.error('Error updating reservation:', error);
        alert('Failed to update reservation');
    }
}

// Delete reservation
async function deleteReservation(reservationId) {
    if (!confirm('Are you sure you want to delete this reservation?')) return;

    try {
        const response = await fetch(`/api/reservations/${reservationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            await loadReservations();
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to delete reservation');
        }
    } catch (error) {
        console.error('Error deleting reservation:', error);
        alert('Failed to delete reservation');
    }
}

// Archive reservation
async function archiveReservation(reservationId) {
    if (!confirm('Are you sure you want to archive this reservation? It will be hidden from the list but remain in the database.')) return;

    try {
        const response = await fetch(`/api/reservations/${reservationId}/archive`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            await loadReservations();
            // Show success message
            const alert = document.createElement('div');
            alert.className = 'alert alert-success alert-dismissible fade show';
            alert.innerHTML = `
                Reservation archived successfully!
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            const container = document.querySelector('.container');
            container.prepend(alert);
            setTimeout(() => alert.remove(), 3000);
        } else {
            const error = await response.json();
            alert(error.message || 'Failed to archive reservation');
        }
    } catch (error) {
        console.error('Error archiving reservation:', error);
        alert('Failed to archive reservation');
    }
}

// Set up event listeners
function setupEventListeners() {
    document.getElementById('locationFilter').addEventListener('change', filterAndDisplayReservations);
    document.getElementById('statusFilter').addEventListener('change', filterAndDisplayReservations);
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/index.html';
    });
}

// Auto refresh functionality
let refreshInterval;
let lastReservationsChecksum = '';

function startAutoRefresh() {
    // Refresh every 15 seconds for reservations (more frequent for status changes)
    refreshInterval = setInterval(async () => {
        await checkForReservationUpdates();
    }, 15000);
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
}

async function checkForReservationUpdates() {
    try {
        const response = await fetch('/api/reservations', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const currentReservations = await response.json();
            
            // Create a simple checksum of the reservations data
            const currentChecksum = JSON.stringify(currentReservations.map(res => ({
                id: res._id,
                status: res.status,
                quantity: res.quantity || 1
            })));

            // If reservations changed, refresh the display
            if (lastReservationsChecksum && currentChecksum !== lastReservationsChecksum) {
                reservations = currentReservations;
                filterAndDisplayReservations();
                
                // Show update notification
                showUpdateNotification();
            }
            
            lastReservationsChecksum = currentChecksum;
        }
    } catch (error) {
        console.error('Error checking for reservation updates:', error);
    }
}

function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'alert alert-info alert-dismissible fade show';
    notification.innerHTML = `
        <i class="bi bi-info-circle"></i> Reservations updated!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    const container = document.querySelector('.container');
    container.prepend(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);