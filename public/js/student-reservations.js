// Student reservations page functionality
let reservations = [];

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
    await loadReservations();
    setupEventListeners();
    displayUserInfo();
    startAutoRefresh();
}

// Reload content when language changes
function reloadContent() {
    displayReservations();
}

// Make reloadContent available globally for translation manager
window.reloadContent = reloadContent;

// Display user info
function displayUserInfo() {
    const username = localStorage.getItem('username');
    document.getElementById('userInfo').textContent = `Student: ${username}`;
}

// Load and filter reservations
async function loadReservations() {
    try {
        const response = await fetch('/api/reservations/my', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        reservations = await response.json();
        filterAndDisplayReservations();
    } catch (error) {
        console.error('Error loading reservations:', error);
        // Display a user-friendly error message
        const reservationsList = document.getElementById('reservationsList');
        reservationsList.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    <i class="bi bi-exclamation-triangle"></i> 
                    Failed to load reservations: ${error.message}
                    <br><small>Please try refreshing the page</small>
                </td>
            </tr>
        `;
    }
}

// Filter and display reservations
function filterAndDisplayReservations() {
    const locationFilter = document.getElementById('locationFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    const filteredReservations = reservations.filter(reservation => {
        const locationMatch = locationFilter === 'all' || reservation.location === locationFilter;
        const statusMatch = statusFilter === 'all' || reservation.status === statusFilter;
        const searchMatch = searchTerm === '' || 
            reservation.itemName.toLowerCase().includes(searchTerm) ||
            reservation.location.toLowerCase().includes(searchTerm);
        return locationMatch && statusMatch && searchMatch;
    });

    const reservationsList = document.getElementById('reservationsList');
    reservationsList.innerHTML = filteredReservations.map(reservation => `
        <tr>
            <td><strong>${reservation.itemName}</strong></td>
            <td><span class="badge bg-info">${reservation.quantity || 1}</span></td>
            <td>${reservation.location}</td>
            <td>${new Date(reservation.reservedDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            })}</td>
            <td><span class="badge reservation-${reservation.status.toLowerCase()}">${reservation.status}</span></td>
            <td>
                ${reservation.status === 'PENDING' ? `
                    <button class="btn btn-sm btn-danger" onclick="deleteReservation('${reservation._id}')" title="Cancel Reservation">
                        <i class="bi bi-x-circle"></i> Cancel
                    </button>
                ` : reservation.status === 'APPROVED' ? `
                    <button class="btn btn-sm btn-info" onclick="returnReservation('${reservation._id}')" title="Request Return">
                        <i class="bi bi-arrow-return-left"></i> Request Return
                    </button>
                ` : reservation.status === 'REJECTED' ? `
                    <span class="text-muted"><i class="bi bi-x-circle"></i> Rejected</span>
                ` : reservation.status === 'RETURN_PENDING' ? `
                    <span class="text-warning"><i class="bi bi-clock"></i> Return Pending Approval</span>
                ` : reservation.status === 'RETURNED' ? `
                    <span class="text-success"><i class="bi bi-check-circle"></i> Returned</span>
                ` : ''}
            </td>
        </tr>
    `).join('');
}

// Delete (cancel) reservation
async function deleteReservation(reservationId) {
    if (!confirm('Weet je zeker dat je deze reservering wilt annuleren?')) return;

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
            alert(error.message || 'Kon reservering niet annuleren');
        }
    } catch (error) {
        console.error('Error canceling reservation:', error);
        alert('Kon reservering niet annuleren');
    }
}

// Return reservation (mark as returned)
async function returnReservation(reservationId) {
    if (!confirm('Weet je zeker dat je retour wilt aanvragen voor dit artikel? Een admin moet de retour goedkeuren.')) return;

    try {
        const response = await fetch(`/api/reservations/${reservationId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status: 'RETURN_PENDING' })
        });

        if (response.ok) {
            // Successfully requested return, reload reservations
            await loadReservations();
            // Show success message
            const alert = document.createElement('div');
            alert.className = 'alert alert-success alert-dismissible fade show';
            alert.innerHTML = `
                Retour succesvol aangevraagd! Een admin zal je verzoek beoordelen.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            const container = document.querySelector('.container');
            container.prepend(alert);
            setTimeout(() => alert.remove(), 5000);
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Kon retour niet aanvragen');
        }
    } catch (error) {
        console.error('Error requesting return:', error);
        alert(`Kon retour niet aanvragen: ${error.message}`);
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

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    
    searchInput.addEventListener('input', filterAndDisplayReservations);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            filterAndDisplayReservations();
        }
    });
    
    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        filterAndDisplayReservations();
        searchInput.focus();
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
        const response = await fetch('/api/reservations/my', {
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
                quantity: res.quantity
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