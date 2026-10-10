// Add PG JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get data from EJS template via data attributes
    const pageData = document.getElementById('page-data');
    const apiBaseUrl = pageData ? pageData.getAttribute('data-api-base-url') : null;
    
    // Set global variable
    window.API_BASE_URL = apiBaseUrl || 'http://localhost:5002/api';
    
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
                const response = await fetch(`${window.API_BASE_URL}/pgs`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        alert('PG created successfully!');
                        window.location.href = '/admin/pgs';
                    } else {
                        alert(data.message || 'Error creating PG');
                    }
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Error creating PG');
                }
            } catch (error) {
                console.error('Error creating PG:', error);
                alert('Error creating PG: ' + error.message);
            }
        });
    }
});
