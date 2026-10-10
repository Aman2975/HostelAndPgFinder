const express = require('express');
const app = express();
const PORT = 5002;

// Simple test endpoint
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Connection successful!', 
        timestamp: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Test signup endpoint
app.post('/api/auth/register', (req, res) => {
    res.json({
        success: true,
        message: 'Test registration successful',
        data: {
            id: 999,
            student_id: 'TEST001',
            name: 'Test User',
            email: 'test@example.com',
            token: 'test-token-123'
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Test server running on all interfaces (0.0.0.0:${PORT})`);
    console.log(`📱 Test URLs:`);
    console.log(`   http://127.0.0.1:${PORT}/test`);
    console.log(`   http://192.168.23.1:${PORT}/test`);
    console.log(`   http://10.0.2.2:${PORT}/test`);
});

