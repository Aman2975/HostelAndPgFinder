const http = require('http');

// Test different IP addresses
const testUrls = [
    'http://127.0.0.1:5002/health',
    'http://localhost:5002/health',
    'http://192.168.23.1:5002/health',
    'http://10.0.2.2:5002/health'
];

async function testConnection(url) {
    return new Promise((resolve) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname,
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log(`✅ ${url} - Status: ${res.statusCode}`);
                resolve(true);
            });
        });

        req.on('error', (err) => {
            console.log(`❌ ${url} - Error: ${err.message}`);
            resolve(false);
        });

        req.on('timeout', () => {
            console.log(`⏰ ${url} - Timeout`);
            req.destroy();
            resolve(false);
        });

        req.end();
    });
}

async function runTests() {
    console.log('🧪 Testing server connections...\n');
    
    for (const url of testUrls) {
        await testConnection(url);
    }
    
    console.log('\n📱 For Android emulator, try these in order:');
    console.log('1. http://127.0.0.1:5002/api/');
    console.log('2. http://192.168.23.1:5002/api/');
    console.log('3. http://10.0.2.2:5002/api/');
}

runTests();

