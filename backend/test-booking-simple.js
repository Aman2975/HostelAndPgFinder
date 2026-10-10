const http = require('http');

// Test booking endpoint
const postData = JSON.stringify({
    student_id: 'TEST123',
    property_id: 6,
    property_type: 'hostel',
    special_requests: 'Room Type: Single\nDuration: 1 Year\nCourse: Computer Science\nAcademic Year: 2nd Year\nContact: 9876543210\nEmail: test@example.com'
});

const options = {
    hostname: 'localhost',
    port: 5002,
    path: '/api/hostels/book',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    console.log('Booking endpoint status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Booking response:', data);
    });
});

req.on('error', (err) => {
    console.error('Booking error:', err.message);
});

req.write(postData);
req.end();

