const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5002/api';
let authToken = localStorage.getItem('adminToken');
let currentHostelId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadHostels();
    
    // Add event listeners for logout functionality
    document.getElementById('confirmLogout').addEventListener('click', function() {
        logout();
    });
    
    // Add event listener for add hostel button
    document.getElementById('addHostelBtn').addEventListener('click', function() {
        showAddHostelModal();
    });
    
    // Add event delegation for edit and delete buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.edit-hostel-btn')) {
            const button = e.target.closest('.edit-hostel-btn');
            const hostelId = button.getAttribute('data-hostel-id');
            editHostel(hostelId);
        } else if (e.target.closest('.delete-hostel-btn')) {
            const button = e.target.closest('.delete-hostel-btn');
            const hostelId = button.getAttribute('data-hostel-id');
            deleteHostel(hostelId);
        }
    });
});

// Load hostels
async function loadHostels() {
    const tableBody = document.getElementById('hostelsTable');
    console.log('Loading hostels from:', `${API_BASE_URL}/hostels`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/hostels`);
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Hostels data:', data);
            
            if (data.success && data.data) {
                if (data.data.length > 0) {
                    tableBody.innerHTML = data.data.map(hostel => `
                        <tr>
                            <td>${hostel.name}</td>
                            <td>${hostel.area}</td>
                            <td>₹${hostel.price_per_month}</td>
                            <td>${hostel.available_rooms}</td>
                            <td>
                                <span class="badge ${hostel.is_active == 1 ? 'bg-success' : 'bg-secondary'}">                                                   
                                    ${hostel.is_active == 1 ? 'Active' : 'Inactive'}                                                                            
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary edit-hostel-btn" data-hostel-id="${hostel.id}">                                              
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger delete-hostel-btn" data-hostel-id="${hostel.id}">                                             
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hostels found</td></tr>';
                }
            } else {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hostels found</td></tr>';
            }
        } else {
            console.error('Response not ok:', response.status);
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading hostels</td></tr>';
        }
    } catch (error) {
        console.error('Hostels error:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading hostels: ' + error.message + '</td></tr>';
    }
}

// Show add hostel page
window.showAddHostelModal = function() {
    console.log('Redirecting to add hostel page');
    window.location.href = '/admin/hostels/add';
}

// Edit hostel
window.editHostel = function(id) {
    console.log('Redirecting to edit hostel page for ID:', id);
    window.location.href = `/admin/hostels/edit/${id}`;
}

// Delete hostel
window.deleteHostel = function(id) {
    console.log('deleteHostel called with ID:', id);
    
    const confirmModalBody = document.getElementById('confirmModalBody');
    const confirmBtn = document.getElementById('confirmBtn');
    const confirmModal = document.getElementById('confirmModal');
    
    console.log('Modal elements found:', { confirmModalBody, confirmBtn, confirmModal });
    
    if (!confirmModalBody || !confirmBtn || !confirmModal) {
        alert('Error: Confirmation modal elements not found. Please refresh the page.');
        return;
    }
    
    confirmModalBody.innerHTML = 'Are you sure you want to delete this hostel? This action cannot be undone.';
    confirmBtn.onclick = () => confirmDeleteHostel(id);
    
    if (typeof bootstrap === 'undefined') {
        alert('Error: Bootstrap not loaded. Please refresh the page.');
        return;
    }
    
    const modal = new bootstrap.Modal(confirmModal);
    modal.show();
    console.log('Delete confirmation modal shown');
}

// Confirm delete hostel
async function confirmDeleteHostel(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/hostels/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                alert('Hostel deleted successfully!');
                loadHostels();
            } else {
                alert(data.message || 'Error deleting hostel');
            }
        } else {
            const errorData = await response.json();
            alert(errorData.message || 'Error deleting hostel');
        }
    } catch (error) {
        console.error('Delete hostel error:', error);
        alert('Error deleting hostel: ' + error.message);
    }
    
    // Close confirmation modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
    if (modal) modal.hide();
}

// Handle hostel form submission
document.addEventListener('DOMContentLoaded', function() {
    const hostelForm = document.getElementById('hostelForm');
    if (hostelForm) {
        hostelForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('hostelName').value,
                area: document.getElementById('hostelArea').value,
                price_per_month: parseFloat(document.getElementById('hostelPrice').value),
                available_rooms: parseInt(document.getElementById('hostelRooms').value),
                total_rooms: parseInt(document.getElementById('hostelTotalRooms').value) || parseInt(document.getElementById('hostelRooms').value),
                description: document.getElementById('hostelDescription').value,
                amenities: document.getElementById('hostelAmenities').value,
                contact_number: document.getElementById('hostelContact').value,
                location: document.getElementById('hostelLocation').value,
                is_active: document.getElementById('hostelStatus').value === '1',
                address: document.getElementById('hostelAddress').value
            };
            
            try {
                const url = currentHostelId ? 
                    `${API_BASE_URL}/admin/hostels/${currentHostelId}` : 
                    `${API_BASE_URL}/admin/hostels`;
                
                const method = currentHostelId ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        alert(currentHostelId ? 'Hostel updated successfully!' : 'Hostel created successfully!');
                        
                        const modal = bootstrap.Modal.getInstance(document.getElementById('hostelModal'));
                        if (modal) modal.hide();
                        
                        loadHostels();
                    } else {
                        alert(data.message || 'Error saving hostel');
                    }
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Error saving hostel');
                }
            } catch (error) {
                console.error('Save hostel error:', error);
                alert('Error saving hostel');
            }
        });
    }
});

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/admin';
    }
}
