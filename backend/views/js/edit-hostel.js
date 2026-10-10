// Edit Hostel JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get data from EJS template via data attributes
    const pageData = document.getElementById('page-data');
    const apiBaseUrl = pageData ? pageData.getAttribute('data-api-base-url') : null;
    const hostelId = pageData ? pageData.getAttribute('data-hostel-id') : null;
    
    // Set global variables
    window.API_BASE_URL = apiBaseUrl;
    window.hostelId = hostelId;
    
    // Debug: Check if variables are set correctly
    console.log('DOM loaded, hostelId:', hostelId);
    console.log('API_BASE_URL:', window.API_BASE_URL);
    
    // Fallback values if EJS variables are not rendered
    if (!window.API_BASE_URL || window.API_BASE_URL === '<%= apiBaseUrl %>') {
        console.warn('EJS variable not rendered, using fallback');
        window.API_BASE_URL = 'http://localhost:5002/api';
    }
    if (!window.hostelId || window.hostelId === '<%= hostelId %>') {
        console.warn('EJS variable not rendered, using fallback');
        // Extract ID from URL
        const urlParts = window.location.pathname.split('/');
        window.hostelId = urlParts[urlParts.length - 1];
    }
    
    // Load hostel data
    async function loadHostelData() {
        try {
            console.log('Loading hostel data for ID:', hostelId);
            console.log('window.API_BASE_URL:', window.API_BASE_URL);
            console.log('API URL:', `${window.API_BASE_URL}/admin/hostels/${hostelId}`);
            
            const response = await fetch(`${window.API_BASE_URL}/admin/hostels/${hostelId}`);
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            if (response.ok) {
                const responseText = await response.text();
                console.log('Raw response:', responseText);
                
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    console.error('Response was not JSON:', responseText);
                    alert('Error: Server returned invalid data. Please check the console for details.');
                    return;
                }
                
                console.log('Parsed data:', data);
                if (data.success) {
                    const hostel = data.data;
                    
                    // Fill form with hostel data
                    document.getElementById('hostelName').value = hostel.name || '';
                    document.getElementById('hostelArea').value = hostel.area || '';
                    document.getElementById('hostelPrice').value = hostel.price_per_month || '';
                    document.getElementById('hostelRooms').value = hostel.available_rooms || '';
                    document.getElementById('hostelTotalRooms').value = hostel.total_rooms || '';
                    document.getElementById('hostelDescription').value = hostel.description || '';
                    document.getElementById('hostelAmenities').value = hostel.amenities || '';
                    document.getElementById('hostelContact').value = hostel.contact_number || '';
                    document.getElementById('hostelLocation').value = hostel.location || '';
                    document.getElementById('hostelStatus').value = hostel.is_active ? '1' : '0';
                    document.getElementById('hostelAddress').value = hostel.address || '';
                    
                    // Hide loading spinner and show form
                    const loadingSpinner = document.getElementById('loadingSpinner');
                    const form = document.getElementById('hostelForm');
                    if (loadingSpinner) loadingSpinner.style.display = 'none';
                    if (form) form.style.display = 'block';
                } else {
                    alert('Error loading hostel details: ' + (data.message || 'Unknown error'));
                }
            } else {
                alert('Error loading hostel details');
            }
        } catch (error) {
            console.error('Error loading hostel:', error);
            alert('Error loading hostel details: ' + error.message);
        } finally {
            // Always hide loading spinner and show form, even on error
            const loadingSpinner = document.getElementById('loadingSpinner');
            const form = document.getElementById('hostelForm');
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            if (form) form.style.display = 'block';
        }
    }

    // Handle form submission
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
                const response = await fetch(`${window.API_BASE_URL}/admin/hostels/${hostelId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        alert('Hostel updated successfully!');
                        window.location.href = '/admin/hostels';
                    } else {
                        alert(data.message || 'Error updating hostel');
                    }
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Error updating hostel');
                }
            } catch (error) {
                console.error('Error updating hostel:', error);
                alert('Error updating hostel: ' + error.message);
            }
        });
    }

    // Load data when page loads
    loadHostelData();
});
