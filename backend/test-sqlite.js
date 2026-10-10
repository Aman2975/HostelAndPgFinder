const { testConnection, initializeDatabase } = require('./config/sqlite-database');

async function testSQLite() {
    try {
        console.log('🧪 Testing SQLite setup...');
        
        // Test connection
        await testConnection();
        
        // Initialize database
        await initializeDatabase();
        
        console.log('✅ SQLite setup successful!');
        console.log('🚀 You can now run: node server-sqlite.js');
        
    } catch (error) {
        console.error('❌ SQLite setup failed:', error.message);
    }
}

testSQLite();
