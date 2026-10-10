const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

async function setupAdminUser() {
    let connection;
    
    try {
        console.log('🚀 Setting up Admin User...');
        
        // Connect to the database
        connection = mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'hostel_pg_finder'
        });
        
        // Create default admin user
        const adminPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        const [existingAdmin] = await connection.promise().execute(
            'SELECT id FROM admins WHERE email = ?',
            ['admin@hostelpg.com']
        );
        
        if (existingAdmin.length === 0) {
            await connection.promise().execute(
                'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
                ['Super Admin', 'admin@hostelpg.com', hashedPassword, 'super_admin']
            );
            console.log('✅ Admin user created successfully');
            console.log('📧 Email: admin@hostelpg.com');
            console.log('🔑 Password: admin123');
        } else {
            console.log('ℹ️  Admin user already exists');
        }
        
        // Insert sample data
        await insertSampleData(connection);
        
        console.log('🎉 Admin setup completed successfully!');
        console.log('🌐 Access admin panel at: http://localhost:5002/admin');
        
    } catch (error) {
        console.error('❌ Admin setup failed:', error.message);
        console.error('Full error:', error);
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

async function insertSampleData(connection) {
    try {
        console.log('📝 Inserting sample data...');
        
        // Sample students
        const students = [
            ['STU001', 'John Doe', 'john.doe@student.com', '9876543210', 'Computer Science', '2024', 'Male', 'Punjab University', '2024-09-01'],
            ['STU002', 'Jane Smith', 'jane.smith@student.com', '9876543211', 'Engineering', '2024', 'Female', 'Punjab University', '2024-09-01'],
            ['STU003', 'Mike Johnson', 'mike.johnson@student.com', '9876543212', 'Business', '2024', 'Male', 'Punjab University', '2024-09-01']
        ];
        
        for (const student of students) {
            try {
                await connection.promise().execute(
                    'INSERT IGNORE INTO students (student_id, name, email, phone, course, academic_year, gender, university, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    student
                );
            } catch (error) {
                // Ignore duplicate key errors
            }
        }
        
        // Sample hostels
        const hostels = [
            ['University Hostel A', 'Near PUP Main Gate', 'Male', 100, 80, 5000, 'WiFi,Food,Laundry,Study Room', '9876543210', 'Comfortable hostel for male students'],
            ['University Hostel B', 'Near PUP Main Gate', 'Female', 80, 60, 4500, 'WiFi,Food,Laundry,Study Room', '9876543211', 'Comfortable hostel for female students']
        ];
        
        for (const hostel of hostels) {
            try {
                await connection.promise().execute(
                    'INSERT IGNORE INTO hostels (name, location, gender_preference, total_capacity, available_spots, price_per_month, amenities, contact_number, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    hostel
                );
            } catch (error) {
                // Ignore duplicate key errors
            }
        }
        
        // Sample PGs
        const pgs = [
            ['Punjab Student PG', 'Bhadurgarh', 'Near PUP Main Gate', 8, 3, 4500, 'Male', 'WiFi,Food,Laundry,Study Room', '9876543210', 'Comfortable PG for male students'],
            ['Phase 1 PG', 'Phase 1', 'Near PUP Phase 1', 6, 2, 4000, 'Female', 'WiFi,Food,Laundry', '9876543211', 'Comfortable PG for female students'],
            ['Phase 2 PG', 'Phase 2', 'Near PUP Phase 2', 10, 5, 4200, 'Male', 'WiFi,Food,Laundry,Study Room', '9876543212', 'Comfortable PG for male students'],
            ['Near PUP PG', 'Near PUP', 'Walking distance from PUP', 12, 4, 4800, 'Both', 'WiFi,Food,Laundry,Study Room,AC', '9876543213', 'Premium PG near university']
        ];
        
        for (const pg of pgs) {
            try {
                await connection.promise().execute(
                    'INSERT IGNORE INTO pgs (name, area, location, total_spots, available_spots, price_per_month, gender_preference, amenities, contact_number, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    pg
                );
            } catch (error) {
                // Ignore duplicate key errors
            }
        }
        
        console.log('✅ Sample data inserted successfully');
        
    } catch (error) {
        console.error('❌ Sample data insertion failed:', error.message);
    }
}

setupAdminUser();
