// Edit PG JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get data from EJS template via data attributes
    const pageData = document.getElementById('page-data');
    const apiBaseUrl = pageData ? pageData.getAttribute('data-api-base-url') : null;
    const pgId = pageData ? pageData.getAttribute('data-pg-id') : null;
    
    // Set global variables
    window.API_BASE_URL = apiBaseUrl;
    window.pgId = pgId;
    
    // Debug: Check if variables are set correctly
    console.log('DOM loaded, pgId:', pgId);
    console.log('API_BASE_URL:', window.API_BASE_URL);
    
    // Fallback values if EJS variables are not rendered
    if (!window.API_BASE_URL || window.API_BASE_URL === '<%= apiBaseUrl %>') {
        console.warn('EJS variable not rendered, using fallback');
        window.API_BASE_URL = 'http://localhost:5002/api';
    }
    if (!window.pgId || window.pgId === '<%= pgId %>') {
        console.warn('EJS variable not rendered, using fallback');
        // Extract ID from URL
        const urlParts = window.location.pathname.split('/');
        window.pgId = urlParts[urlParts.length - 1];
    }
    
    // Load PG data
    async function loadPGData() {
        try {
            console.log('Loading PG data for ID:', pgId);
            console.log('API URL:', `${window.API_BASE_URL}/pgs/${pgId}`);
            
            const response = await fetch(`${window.API_BASE_URL}/pgs/${pgId}`);
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
                    const pg = data.data;
                    
                    // Fill form with PG data
                    document.getElementById('pgName').value = pg.name || '';
                    document.getElementById('pgArea').value = pg.area || '';
                    document.getElementById('pgPrice').value = pg.price_per_month || '';
                    document.getElementById('pgSpots').value = pg.available_spots || '';
                    document.getElementById('pgGender').value = pg.gender_preference || '';
                    document.getElementById('pgDescription').value = pg.description || '';
                    document.getElementById('pgAmenities').value = pg.amenities || '';
                    document.getElementById('pgContact').value = pg.contact_number || '';
                    document.getElementById('pgLocation').value = pg.location || '';
                    document.getElementById('pgStatus').value = pg.is_active ? '1' : '0';
                    document.getElementById('pgAddress').value = pg.address || '';
                    
                    // Hide loading spinner and show form
                    const loadingSpinner = document.getElementById('loadingSpinner');
                    const form = document.getElementById('pgForm');
                    if (loadingSpinner) loadingSpinner.style.display = 'none';
                    if (form) form.style.display = 'block';
                } else {
                    alert('Error loading PG details: ' + (data.message || 'Unknown error'));
                }
            } else {
                alert('Error loading PG details');
            }
        } catch (error) {
            console.error('Error loading PG:', error);
            alert('Error loading PG details: ' + error.message);
        } finally {
            // Always hide loading spinner and show form, even on error
            const loadingSpinner = document.getElementById('loadingSpinner');
            const form = document.getElementById('pgForm');
            if (loadingSpinner) loadingSpinner.style.display = 'none';
            if (form) form.style.display = 'block';
        }
    }

    // Handle form submission
    const form = document.getElementById('pgForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
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
                const response = await fetch(`${window.API_BASE_URL}/pgs/${pgId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        alert('PG updated successfully!');
                        window.location.href = '/admin/pgs';
                    } else {
                        alert(data.message || 'Error updating PG');
                    }
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Error updating PG');
                }
            } catch (error) {
                console.error('Error updating PG:', error);
                alert('Error updating PG: ' + error.message);
            }
        });
    }

    // Load data when page loads
    loadPGData();
});
