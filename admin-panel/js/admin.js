// Fresh Admin Panel JavaScript
const API_BASE_URL = 'http://localhost:5002/api';
let authToken = localStorage.getItem('adminToken');
let currentSection = 'dashboard';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString();
    
    // Check if user is already logged in
    if (authToken) {
        showAdminPage();
        loadDashboardData();
    } else {
        showLoginPage();
    }
    
    // Setup login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
});

// Show login page
function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('adminPage').style.display = 'none';
}

// Show admin page
function showAdminPage() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('adminPage').style.display = 'block';
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.data.token;
            localStorage.setItem('adminToken', authToken);
            showAdminPage();
            loadDashboardData();
        } else {
            errorDiv.textContent = data.message || 'Login failed';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Network error. Please try again.';
        errorDiv.style.display = 'block';
    }
}

// Show section
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(section + 'Section').style.display = 'block';
    
    // Add active class to clicked nav link
    event.target.classList.add('active');
    
    currentSection = section;
    
    // Load section data
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'students':
            loadStudents();
            break;
        case 'hostels':
            loadHostels();
            break;
        case 'pgs':
            loadPGs();
            break;
        case 'allotments':
            loadAllotments();
            break;
        case 'bookings':
            loadBookings();
            break;
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                document.getElementById('totalStudents').textContent = data.data.students || 0;
                document.getElementById('totalHostels').textContent = data.data.hostels || 0;
                document.getElementById('totalPGs').textContent = data.data.pgs || 0;
                document.getElementById('pendingRequests').textContent = data.data.pendingAllotments || 0;
            }
        }
        
        // Load recent activity
        loadRecentActivity();
    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

// Load recent activity
async function loadRecentActivity() {
    const activityDiv = document.getElementById('recentActivity');
    
    try {
        // Load recent allotments
        const response = await fetch(`${API_BASE_URL}/admin/allotments`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.length > 0) {
                const recent = data.data.slice(0, 5);
                activityDiv.innerHTML = recent.map(item => `
                    <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <div>
                            <strong>${item.student_name || 'Unknown Student'}</strong> requested 
                            <strong>${item.hostel_name || 'Unknown Hostel'}</strong>
                        </div>
                        <small class="text-muted">${new Date(item.created_at).toLocaleDateString()}</small>
                    </div>
                `).join('');
            } else {
                activityDiv.innerHTML = '<p class="text-muted text-center">No recent activity</p>';
            }
        }
    } catch (error) {
        console.error('Recent activity error:', error);
        activityDiv.innerHTML = '<p class="text-muted text-center">Unable to load recent activity</p>';
    }
}

// Load students
async function loadStudents() {
    const tableBody = document.getElementById('studentsTable');
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/students`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                tableBody.innerHTML = data.data.map(student => `
                    <tr>
                        <td>${student.student_id}</td>
                        <td>${student.name}</td>
                        <td>${student.email}</td>
                        <td>${student.course || 'N/A'}</td>
                        <td>${student.academic_year || 'N/A'}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" onclick="editStudent(${student.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent(${student.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No students found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Students error:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading students</td></tr>';
    }
}

// Load hostels
async function loadHostels() {
    const tableBody = document.getElementById('hostelsTable');
    
    try {
        const response = await fetch(`${API_BASE_URL}/hostels`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
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
                            <button class="btn btn-sm btn-outline-primary" onclick="editHostel(${hostel.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteHostel(${hostel.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hostels found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Hostels error:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading hostels</td></tr>';
    }
}

// Load PGs
async function loadPGs() {
    const tableBody = document.getElementById('pgsTable');
    
    try {
        const response = await fetch(`${API_BASE_URL}/pgs`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
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
                            <button class="btn btn-sm btn-outline-primary" onclick="editPG(${pg.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deletePG(${pg.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No PGs found</td></tr>';
            }
        }
    } catch (error) {
        console.error('PGs error:', error);
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading PGs</td></tr>';
    }
}

// Load allotments
async function loadAllotments() {
    const tableBody = document.getElementById('allotmentsTable');
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/allotments`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                tableBody.innerHTML = data.data.map(allotment => `
                    <tr>
                        <td>${allotment.student_name || 'Unknown'}</td>
                        <td>${allotment.hostel_name || 'Unknown'}</td>
                        <td>${new Date(allotment.created_at).toLocaleDateString()}</td>
                        <td>
                            <span class="badge ${getStatusBadgeClass(allotment.status)}">
                                ${allotment.status}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-success" onclick="approveAllotment(${allotment.id})" ${allotment.status !== 'pending' ? 'disabled' : ''}>
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="rejectAllotment(${allotment.id})" ${allotment.status !== 'pending' ? 'disabled' : ''}>
                                <i class="fas fa-times"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No allotments found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Allotments error:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading allotments</td></tr>';
    }
}

// Load bookings
async function loadBookings() {
    const tableBody = document.getElementById('bookingsTable');
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                tableBody.innerHTML = data.data.map(booking => `
                    <tr>
                        <td>${booking.student_name || 'Unknown'}</td>
                        <td>${booking.property_name || 'Unknown'}</td>
                        <td>
                            <span class="badge ${booking.property_type === 'hostel' ? 'bg-primary' : 'bg-info'}">
                                ${booking.property_type.toUpperCase()}
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
        }
    } catch (error) {
        console.error('Bookings error:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading bookings</td></tr>';
    }
}

// Helper functions
function getStatusBadgeClass(status) {
    switch(status.toLowerCase()) {
        case 'approved': return 'bg-success';
        case 'rejected': return 'bg-danger';
        case 'pending': return 'bg-warning';
        case 'cancelled': return 'bg-secondary';
        default: return 'bg-secondary';
    }
}

// Action functions
function editStudent(id) {
    alert(`Edit student ${id} - Feature coming soon!`);
}

function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        alert(`Delete student ${id} - Feature coming soon!`);
    }
}

// ==================== HOSTEL MANAGEMENT FUNCTIONS ====================

let currentHostelId = null;

// Show add hostel modal
function showAddHostelModal() {
    currentHostelId = null;
    document.getElementById('hostelModalLabel').textContent = 'Add New Hostel';
    document.getElementById('hostelSubmitBtn').innerHTML = '<i class="fas fa-save me-2"></i>Save Hostel';
    document.getElementById('hostelForm').reset();
    
    const modal = new bootstrap.Modal(document.getElementById('hostelModal'));
    modal.show();
}

// Show edit hostel modal
async function editHostel(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/hostels/${id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const hostel = data.data;
                currentHostelId = id;
                
                // Fill form with hostel data
                document.getElementById('hostelName').value = hostel.name || '';
                document.getElementById('hostelArea').value = hostel.area || '';
                document.getElementById('hostelPrice').value = hostel.price_per_month || '';
                document.getElementById('hostelRooms').value = hostel.available_rooms || '';
                document.getElementById('hostelDescription').value = hostel.description || '';
                document.getElementById('hostelAmenities').value = hostel.amenities || '';
                document.getElementById('hostelContact').value = hostel.contact_number || '';
                document.getElementById('hostelStatus').value = hostel.is_active || 1;
                document.getElementById('hostelAddress').value = hostel.address || '';
                
                document.getElementById('hostelModalLabel').textContent = 'Edit Hostel';
                document.getElementById('hostelSubmitBtn').innerHTML = '<i class="fas fa-save me-2"></i>Update Hostel';
                
                const modal = new bootstrap.Modal(document.getElementById('hostelModal'));
                modal.show();
            }
        }
    } catch (error) {
        console.error('Error loading hostel:', error);
        alert('Error loading hostel details');
    }
}

// Delete hostel
function deleteHostel(id) {
    document.getElementById('confirmModalBody').innerHTML = 'Are you sure you want to delete this hostel? This action cannot be undone.';
    document.getElementById('confirmBtn').onclick = () => confirmDeleteHostel(id);
    
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
}

// Confirm delete hostel
async function confirmDeleteHostel(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/hostels/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                alert('Hostel deleted successfully!');
                loadHostels(); // Reload the hostels table
            } else {
                alert(data.message || 'Error deleting hostel');
            }
        } else {
            alert('Error deleting hostel');
        }
    } catch (error) {
        console.error('Delete hostel error:', error);
        alert('Error deleting hostel');
    }
    
    // Close confirmation modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('confirmModal'));
    modal.hide();
}

// Handle hostel form submission
document.getElementById('hostelForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('hostelName').value,
        area: document.getElementById('hostelArea').value,
        price_per_month: document.getElementById('hostelPrice').value,
        available_rooms: document.getElementById('hostelRooms').value,
        description: document.getElementById('hostelDescription').value,
        amenities: document.getElementById('hostelAmenities').value,
        contact_number: document.getElementById('hostelContact').value,
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
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                alert(currentHostelId ? 'Hostel updated successfully!' : 'Hostel created successfully!');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('hostelModal'));
                modal.hide();
                
                // Reload hostels table
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

function editPG(id) {
    alert(`Edit PG ${id} - Feature coming soon!`);
}

function deletePG(id) {
    if (confirm('Are you sure you want to delete this PG?')) {
        alert(`Delete PG ${id} - Feature coming soon!`);
    }
}

function approveAllotment(id) {
    if (confirm('Approve this allotment request?')) {
        alert(`Approve allotment ${id} - Feature coming soon!`);
    }
}

function rejectAllotment(id) {
    if (confirm('Reject this allotment request?')) {
        alert(`Reject allotment ${id} - Feature coming soon!`);
    }
}

function approveBooking(id) {
    if (confirm('Approve this booking?')) {
        alert(`Approve booking ${id} - Feature coming soon!`);
    }
}

function rejectBooking(id) {
    if (confirm('Reject this booking?')) {
        alert(`Reject booking ${id} - Feature coming soon!`);
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminToken');
        authToken = null;
        showLoginPage();
    }
}