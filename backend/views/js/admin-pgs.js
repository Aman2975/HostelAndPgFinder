const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5002/api';
let authToken = localStorage.getItem('adminToken');
let currentPGId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadPGs();
    
    // Add event listeners for logout functionality
    document.getElementById('confirmLogout').addEventListener('click', function() {
        logout();
    });
    
    // Add event listener for add PG button
    document.getElementById('addPGBtn').addEventListener('click', function() {
        showAddPGModal();
    });
    
    // Add event delegation for edit and delete buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.edit-pg-btn')) {
            const button = e.target.closest('.edit-pg-btn');
            const pgId = button.getAttribute('data-pg-id');
            editPG(pgId);
        } else if (e.target.closest('.delete-pg-btn')) {
            const button = e.target.closest('.delete-pg-btn');
            const pgId = button.getAttribute('data-pg-id');
            deletePG(pgId);
        }
    });
});

// Load PGs
async function loadPGs() {
    const tableBody = document.getElementById('pgsTable');
    console.log('Loading PGs from:', `${API_BASE_URL}/pgs`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/pgs`);
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('PGs data:', data);
            
            if (data.success && data.data) {
                if (data.data.length > 0) {
                    tableBody.innerHTML = data.data.map(pg => `
                        <tr>
                            <td>${pg.name}</td>
                            <td>${pg.area}</td>
                            <td>₹${pg.price_per_month}</td>
                            <td>${pg.available_spots}</td>
                            <td>${pg.gender_preference}</td>
                            <td>
                                <span class="badge ${pg.is_active == 1 ? 'bg-success' : 'bg-secondary'}">                                                   
                                    ${pg.is_active == 1 ? 'Active' : 'Inactive'}                                                                            
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary edit-pg-btn" data-pg-id="${pg.id}">                                              
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger delete-pg-btn" data-pg-id="${pg.id}">                                             
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No PGs found</td></tr>';
                }
            } else {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No PGs found</td></tr>';
            }
        } else {
            console.error('Response not ok:', response.status);
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading PGs</td></tr>';
        }
    } catch (error) {
        console.error('PGs error:', error);
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading PGs: ' + error.message + '</td></tr>';
    }
}

// Show add PG page
window.showAddPGModal = function() {
    console.log('Redirecting to add PG page');
    window.location.href = '/admin/pgs/add';
}

// Edit PG
window.editPG = function(id) {
    console.log('Redirecting to edit PG page for ID:', id);
    window.location.href = `/admin/pgs/edit/${id}`;
}

// Delete PG
window.deletePG = function(id) {
    console.log('deletePG called with ID:', id);
    
    const confirmModalBody = document.getElementById('confirmModalBody');
    const confirmBtn = document.getElementById('confirmBtn');
    const confirmModal = document.getElementById('confirmModal');
    
    console.log('PG Modal elements found:', { confirmModalBody, confirmBtn, confirmModal });
    
    if (!confirmModalBody || !confirmBtn || !confirmModal) {
        alert('Error: PG confirmation modal elements not found. Please refresh the page.');
        return;
    }
    
    confirmModalBody.innerHTML = 'Are you sure you want to delete this PG? This action cannot be undone.';
    confirmBtn.onclick = () => confirmDeletePG(id);
    
    if (typeof bootstrap === 'undefined') {
        alert('Error: Bootstrap not loaded. Please refresh the page.');
        return;
    }
    
    const modal = new bootstrap.Modal(confirmModal);
    modal.show();
    console.log('PG Delete confirmation modal shown');
}

// Confirm delete PG
async function confirmDeletePG(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/pgs/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                alert('PG deleted successfully!');
                loadPGs();
            } else {
                alert(data.message || 'Error deleting PG');
            }
        } else {
            const errorData = await response.json();
            alert(errorData.message || 'Error deleting PG');
        }
    } catch (error) {
        console.error('Delete PG error:', error);
        alert('Error deleting PG: ' + error.message);
    }
    
    // Close confirmation modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
    if (modal) modal.hide();
}

// Handle PG form submission
document.addEventListener('DOMContentLoaded', function() {
    const pgForm = document.getElementById('pgForm');
    if (pgForm) {
        pgForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('pgName').value,
                area: document.getElementById('pgArea').value,
                price_per_month: parseFloat(document.getElementById('pgPrice').value),
                available_spots: parseInt(document.getElementById('pgSpots').value),
                gender_preference: document.getElementById('pgGender').value,
                description: document.getElementById('pgDescription').value,
                amenities: document.getElementById('pgAmenities').value,
                contact_number: document.getElementById('pgContact').value,
                location: document.getElementById('pgLocation').value,
                is_active: document.getElementById('pgStatus').value === '1',
                address: document.getElementById('pgAddress').value
            };
            
            try {
                const url = currentPGId ? 
                    `${API_BASE_URL}/pgs/${currentPGId}` : 
                    `${API_BASE_URL}/pgs`;
                
                const method = currentPGId ? 'PUT' : 'POST';
                
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
                        alert(currentPGId ? 'PG updated successfully!' : 'PG created successfully!');
                        
                        const modal = bootstrap.Modal.getInstance(document.getElementById('pgModal'));
                        if (modal) modal.hide();
                        
                        loadPGs();
                    } else {
                        alert(data.message || 'Error saving PG');
                    }
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Error saving PG');
                }
            } catch (error) {
                console.error('Save PG error:', error);
                alert('Error saving PG: ' + error.message);
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
