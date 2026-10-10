const mysql = require('mysql2');
require('dotenv').config({ path: './config.env' });

// Create MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hostel_pg_finder',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Get promise-based connection
const promisePool = pool.promise();

// Test database connection
const testConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ MySQL database connected successfully');
        connection.release();
    } catch (error) {
        console.error('❌ MySQL database connection failed:', error.message);
        process.exit(1);
    }
};

// Initialize database with schema
const initializeDatabase = async () => {
    try {
        // Since we already set up the database with admin_schema.sql,
        // we don't need to initialize it again
        console.log('✅ Database already initialized');
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
    }
};

module.exports = {
    pool: promisePool,
    testConnection,
    initializeDatabase
};


