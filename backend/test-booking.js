const fetch = require('node-fetch');

async function testBooking() {
    try {
        console.log('Testing hostel booking endpoint...');
        
        const response = await fetch('http://localhost:5002/api/hostels/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                student_id: 'TEST123',
                property_id: 6,
                property_type: 'hostel',
                special_requests: 'Room Type: Single\nDuration: 1 Year'
            })
        });
        
        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);
        
    } catch (error) {
        console.error('Error testing booking:', error.message);
    }
}

testBooking();

