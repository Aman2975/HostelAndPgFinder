const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5002/api';
let authToken = localStorage.getItem('adminToken');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString();
    loadDashboardData();
    
    // Add event listeners for logout functionality
    document.getElementById('confirmLogout').addEventListener('click', function() {
        logout();
    });
});

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load hostels count
        const hostelsResponse = await fetch(`${API_BASE_URL}/hostels`);
        if (hostelsResponse.ok) {
            const hostelsData = await hostelsResponse.json();
            if (hostelsData.success) {
                document.getElementById('totalHostels').textContent = hostelsData.data.length || 0;
            }
        }

        // Load students count
        const studentsResponse = await fetch(`${API_BASE_URL}/admin/students`);
        if (studentsResponse.ok) {
            const studentsData = await studentsResponse.json();
            if (studentsData.success) {
                document.getElementById('totalStudents').textContent = studentsData.data.length || 0;
            }
        }

        // Load PGs count
        const pgsResponse = await fetch(`${API_BASE_URL}/pgs`);
        if (pgsResponse.ok) {
            const pgsData = await pgsResponse.json();
            if (pgsData.success) {
                document.getElementById('totalPGs').textContent = pgsData.data.length || 0;
            }
        }

        // Set pending requests to 0 for now
        document.getElementById('pendingRequests').textContent = 0;

        loadRecentActivity();
    } catch (error) {
        console.error('Dashboard error:', error);
        // Set default values on error
        document.getElementById('totalStudents').textContent = 0;
        document.getElementById('totalHostels').textContent = 0;
        document.getElementById('totalPGs').textContent = 0;
        document.getElementById('pendingRequests').textContent = 0;
    }
}

// Load recent activity
async function loadRecentActivity() {
    const activityDiv = document.getElementById('recentActivity');
    try {
        // For now, show a simple message since allotments might not exist
        activityDiv.innerHTML = '<p class="text-muted text-center">No recent activity</p>';
    } catch (error) {
        activityDiv.innerHTML = '<p class="text-muted text-center">Unable to load recent activity</p>';
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/admin';
    }
}
