const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5002/api';
let authToken = localStorage.getItem('adminToken');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadBookings();
    
    // Add event listeners for logout functionality
    document.getElementById('confirmLogout').addEventListener('click', function() {
        logout();
    });
});

// Load bookings
async function loadBookings() {
    const tableBody = document.getElementById('bookingsTable');
    console.log('Loading bookings from:', `${API_BASE_URL}/admin/bookings`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/bookings`);
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Bookings data:', data);
            
            if (data.success && data.data) {
                if (data.data.length > 0) {
                    tableBody.innerHTML = data.data.map(booking => `
                        <tr>
                            <td>${booking.student_name || 'Unknown'}</td>
                            <td>${booking.property_name || 'Unknown'}</td>
                            <td>
                                <span class="badge ${booking.property_type === 'hostel' ? 'bg-primary' : 'bg-info'}">
                                    ${booking.property_type ? booking.property_type.toUpperCase() : 'UNKNOWN'}
                                </span>
                            </td>
                            <td>${new Date(booking.created_at).toLocaleDateString()}</td>
                            <td>
                                <span class="badge ${getStatusBadgeClass(booking.status)}">
                                    ${booking.status}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-success" onclick="approveBooking(${booking.id})" ${booking.status !== 'pending' ? 'disabled' : ''}>
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="rejectBooking(${booking.id})" ${booking.status !== 'pending' ? 'disabled' : ''}>
                                    <i class="fas fa-times"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No bookings found</td></tr>';
                }
            } else {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No bookings found</td></tr>';
            }
        } else {
            console.error('Response not ok:', response.status);
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading bookings</td></tr>';
        }
    } catch (error) {
        console.error('Bookings error:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading bookings: ' + error.message + '</td></tr>';
    }
}

// Helper function for status badge classes
function getStatusBadgeClass(status) {
    switch(status.toLowerCase()) {
        case 'approved': return 'bg-success';
        case 'rejected': return 'bg-danger';
        case 'pending': return 'bg-warning';
        case 'cancelled': return 'bg-secondary';
        default: return 'bg-secondary';
    }
}

// Approve booking
function approveBooking(id) {
    if (confirm('Approve this booking?')) {
        alert(`Approve booking ${id} - Feature coming soon!`);
    }
}

// Reject booking
function rejectBooking(id) {
    if (confirm('Reject this booking?')) {
        alert(`Reject booking ${id} - Feature coming soon!`);
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/admin';
    }
}
