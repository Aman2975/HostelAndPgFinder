// Add Hostel JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get data from EJS template via data attributes
    const pageData = document.getElementById('page-data');
    const apiBaseUrl = pageData ? pageData.getAttribute('data-api-base-url') : null;
    
    // Set global variable
    window.API_BASE_URL = apiBaseUrl || 'http://localhost:5002/api';
    
    const form = document.getElementById('hostelForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
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
                const response = await fetch(`${window.API_BASE_URL}/admin/hostels`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        alert('Hostel created successfully!');
                        window.location.href = '/admin/hostels';
                    } else {
                        alert(data.message || 'Error creating hostel');
                    }
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Error creating hostel');
                }
            } catch (error) {
                console.error('Error creating hostel:', error);
                alert('Error creating hostel: ' + error.message);
            }
        });
    }
});
