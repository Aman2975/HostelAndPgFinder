const mysql = require('mysql2');
require('dotenv').config({ path: './config.env' });

async function setupDatabase() {
    let connection;
    
    try {
        console.log('🚀 Setting up Database...');
        
        // Connect without specifying database
        connection = mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });
        
        console.log('📦 Creating database...');
        await connection.promise().execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'hostel_pg_finder'}`);
        console.log('✅ Database created successfully');
        
        // Switch to the database using query instead of execute
        await connection.promise().query(`USE ${process.env.DB_NAME || 'hostel_pg_finder'}`);
        console.log('✅ Connected to database');
        
        // Read and execute schema
        const fs = require('fs');
        const path = require('path');
        const schemaPath = path.join(__dirname, 'database/admin_schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (const statement of statements) {
            if (statement.trim() && !statement.trim().toLowerCase().includes('create database')) {
                try {
                    await connection.promise().query(statement);
                    console.log('✅ Executed:', statement.substring(0, 50) + '...');
                } catch (error) {
                    if (error.message.includes('already exists')) {
                        console.log('ℹ️  Table already exists, skipping...');
                    } else {
                        console.warn('⚠️  Warning:', error.message);
                    }
                }
            }
        }
        
        console.log('🎉 Database setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.error('Full error:', error);
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

setupDatabase();
