const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5002/api';
let authToken = localStorage.getItem('adminToken');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadAllotments();
    
    // Add event listeners for logout functionality
    document.getElementById('confirmLogout').addEventListener('click', function() {
        logout();
    });
    
    // Add event delegation for approve/reject/view buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.approve-allotment-btn')) {
            const button = e.target.closest('.approve-allotment-btn');
            const allotmentId = button.getAttribute('data-allotment-id');
            approveAllotment(allotmentId);
        } else if (e.target.closest('.reject-allotment-btn')) {
            const button = e.target.closest('.reject-allotment-btn');
            const allotmentId = button.getAttribute('data-allotment-id');
            rejectAllotment(allotmentId);
        } else if (e.target.closest('.view-details-btn')) {
            const button = e.target.closest('.view-details-btn');
            const allotmentId = button.getAttribute('data-allotment-id');
            viewAllotmentDetails(allotmentId);
        }
    });
});

// Load allotments
async function loadAllotments() {
    const tableBody = document.getElementById('allotmentsTable');
    console.log('Loading allotments from:', `${API_BASE_URL}/admin/allotments`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/allotments`);
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Allotments data:', data);
            
            if (data.success && data.data && data.data.allotments) {
                if (data.data.allotments.length > 0) {
                    tableBody.innerHTML = data.data.allotments.map(allotment => `
                        <tr>
                            <td>
                                <strong>${allotment.student_name || 'Unknown Student'}</strong>
                                <br><small class="text-muted">ID: ${allotment.student_id}</small>
                            </td>
                            <td>
                                <a href="mailto:${allotment.student_email || '#'}" class="text-decoration-none">
                                    ${allotment.student_email || 'N/A'}
                                </a>
                            </td>
                            <td>
                                <a href="tel:${allotment.student_phone || '#'}" class="text-decoration-none">
                                    ${allotment.student_phone || 'N/A'}
                                </a>
                            </td>
                            <td>
                                <strong>${allotment.hostel_name || 'Unknown Hostel'}</strong>
                                <br><small class="text-muted">${allotment.hostel_area || 'N/A'} - ₹${allotment.hostel_price || 'N/A'}/month</small>
                            </td>
                            <td>${new Date(allotment.created_at).toLocaleDateString()}</td>
                            <td>
                                <span class="badge ${getStatusBadgeClass(allotment.status)}">
                                    ${allotment.status}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-success approve-allotment-btn" data-allotment-id="${allotment.id}" ${allotment.status !== 'pending' ? 'disabled' : ''} title="Approve">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn btn-sm btn-danger reject-allotment-btn" data-allotment-id="${allotment.id}" ${allotment.status !== 'pending' ? 'disabled' : ''} title="Reject">
                                    <i class="fas fa-times"></i>
                                </button>
                                <button class="btn btn-sm btn-info view-details-btn" data-allotment-id="${allotment.id}" title="View Details">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No allotments found</td></tr>';
                }
            } else {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No allotments found</td></tr>';
            }
        } else {
            console.error('Response not ok:', response.status);
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading allotments</td></tr>';
        }
    } catch (error) {
        console.error('Allotments error:', error);
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading allotments: ' + error.message + '</td></tr>';
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

// View allotment details
async function viewAllotmentDetails(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/allotments/${id}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const allotment = data.data;
                showAllotmentDetailsModal(allotment);
            } else {
                alert('Error loading allotment details: ' + data.message);
            }
        } else {
            alert('Error loading allotment details');
        }
    } catch (error) {
        console.error('Error loading allotment details:', error);
        alert('Error loading allotment details: ' + error.message);
    }
}

// Show allotment details modal
function showAllotmentDetailsModal(allotment) {
    const modalHtml = `
        <div class="modal fade" id="allotmentDetailsModal" tabindex="-1" aria-labelledby="allotmentDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="allotmentDetailsModalLabel">Allotment Request Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6 class="text-primary">Student Information</h6>
                                <p><strong>Name:</strong> ${allotment.student_name || 'N/A'}</p>
                                <p><strong>Student ID:</strong> ${allotment.student_id}</p>
                                <p><strong>Email:</strong> <a href="mailto:${allotment.student_email || '#'}">${allotment.student_email || 'N/A'}</a></p>
                                <p><strong>Phone:</strong> <a href="tel:${allotment.student_phone || '#'}">${allotment.student_phone || 'N/A'}</a></p>
                            </div>
                            <div class="col-md-6">
                                <h6 class="text-primary">Hostel Information</h6>
                                <p><strong>Hostel Name:</strong> ${allotment.hostel_name || 'N/A'}</p>
                                <p><strong>Area:</strong> ${allotment.hostel_area || 'N/A'}</p>
                                <p><strong>Price:</strong> ₹${allotment.hostel_price || 'N/A'}/month</p>
                                <p><strong>Available Rooms:</strong> ${allotment.hostel_available_rooms || 'N/A'}</p>
                            </div>
                        </div>
                        <hr>
                        <div class="row">
                            <div class="col-12">
                                <h6 class="text-primary">Request Details</h6>
                                <p><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(allotment.status)}">${allotment.status}</span></p>
                                <p><strong>Request Date:</strong> ${new Date(allotment.created_at).toLocaleString()}</p>
                                <p><strong>Last Updated:</strong> ${new Date(allotment.updated_at).toLocaleString()}</p>
                                <p><strong>Special Requirements:</strong></p>
                                <div class="bg-light p-3 rounded">
                                    <pre style="white-space: pre-wrap; margin: 0;">${allotment.special_requirements || 'No special requirements'}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        ${allotment.status === 'pending' ? `
                            <button type="button" class="btn btn-success" onclick="approveAllotment(${allotment.id})" data-bs-dismiss="modal">Approve</button>
                            <button type="button" class="btn btn-danger" onclick="rejectAllotment(${allotment.id})" data-bs-dismiss="modal">Reject</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('allotmentDetailsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('allotmentDetailsModal'));
    modal.show();
}

// Approve allotment
async function approveAllotment(id) {
    if (confirm('Are you sure you want to approve this allotment request?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/allotments/${id}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    alert('Allotment approved successfully!');
                    loadAllotments(); // Reload the table
                } else {
                    alert('Error approving allotment: ' + data.message);
                }
            } else {
                alert('Error approving allotment');
            }
        } catch (error) {
            console.error('Error approving allotment:', error);
            alert('Error approving allotment: ' + error.message);
        }
    }
}

// Reject allotment
async function rejectAllotment(id) {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason !== null) { // User didn't cancel
        try {
            const response = await fetch(`${API_BASE_URL}/admin/allotments/${id}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason: reason || 'Rejected by admin' })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    alert('Allotment rejected successfully!');
                    loadAllotments(); // Reload the table
                } else {
                    alert('Error rejecting allotment: ' + data.message);
                }
            } else {
                alert('Error rejecting allotment');
            }
        } catch (error) {
            console.error('Error rejecting allotment:', error);
            alert('Error rejecting allotment: ' + error.message);
        }
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/admin';
    }
}
