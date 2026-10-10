const http = require('http');

// Test with minimal data
const postData = JSON.stringify({
    student_id: 'TEST123',
    property_id: 6,
    property_type: 'hostel',
    special_requests: 'Test request'
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

console.log('Testing booking endpoint...');

const req = http.request(options, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Response:', data);
    });
});

req.on('error', (err) => {
    console.error('Error:', err.message);
});

req.write(postData);
req.end();

