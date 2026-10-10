const http = require('http');

// Test if server is running
const options = {
    hostname: 'localhost',
    port: 5002,
    path: '/api/hostels',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log('Server is running! Status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Response:', data);
    });
});

req.on('error', (err) => {
    console.error('Server not running or error:', err.message);
});

req.end();

