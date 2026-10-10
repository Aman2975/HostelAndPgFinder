const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5002/api';
let authToken = localStorage.getItem('adminToken');
let currentStudentId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadStudents();
    
    // Add event listeners for logout functionality
    document.getElementById('confirmLogout').addEventListener('click', function() {
        logout();
    });
    
    // Add event listener for add student button
    document.getElementById('addStudentBtn').addEventListener('click', function() {
        showAddStudentModal();
    });
});

// Load students
async function loadStudents() {
    const tableBody = document.getElementById('studentsTable');
    try {
        const response = await fetch(`${API_BASE_URL}/admin/students`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Students data:', data);
            if (data.success && data.data && data.data.students) {
                tableBody.innerHTML = data.data.students.map(student => `
                    <tr>
                        <td>${student.student_id}</td>
                        <td>${student.name}</td>
                        <td>${student.email}</td>
                        <td>${student.phone || 'N/A'}</td>
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
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No students found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Students error:', error);
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading students</td></tr>';
    }
}

// Show add student modal
function showAddStudentModal() {
    currentStudentId = null;
    document.getElementById('studentModalLabel').textContent = 'Add New Student';
    document.getElementById('studentSubmitBtn').innerHTML = '<i class="fas fa-save me-2"></i>Save Student';
    document.getElementById('studentForm').reset();
    
    const modal = new bootstrap.Modal(document.getElementById('studentModal'));
    modal.show();
}

// Edit student
function editStudent(id) {
    alert(`Edit student ${id} - Feature coming soon!`);
}

// Delete student
function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        alert(`Delete student ${id} - Feature coming soon!`);
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/admin';
    }
}
