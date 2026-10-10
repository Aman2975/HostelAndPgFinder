const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

// Create MySQL connection without database first
const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
});

async function setupAdminPanel() {
    try {
        console.log('🚀 Setting up Admin Panel...');
        
        // First, create the database if it doesn't exist
        console.log('📦 Creating database...');
        await connection.promise().execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'hostel_pg_finder'}`);
        console.log('✅ Database created successfully');
        
        // Now connect to the specific database
        await connection.promise().execute(`USE ${process.env.DB_NAME || 'hostel_pg_finder'}`);
        
        // Read and execute admin schema
        const fs = require('fs');
        const path = require('path');
        const schemaPath = path.join(__dirname, 'database/admin_schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (const statement of statements) {
            if (statement.trim() && !statement.trim().toLowerCase().includes('create database')) {
                try {
                    await connection.promise().execute(statement);
                } catch (error) {
                    // Skip errors for statements that might already exist
                    if (!error.message.includes('already exists')) {
                        console.warn('⚠️  Warning:', error.message);
                    }
                }
            }
        }
        
        console.log('✅ Database schema created successfully');
        
        // Create default admin user
        const adminPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        const [existingAdmin] = await connection.promise().execute(
            'SELECT id FROM admins WHERE username = ?',
            ['admin']
        );
        
        if (existingAdmin.length === 0) {
            await connection.promise().execute(
                'INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
                ['admin', 'admin@hostelpg.com', hashedPassword, 'super_admin']
            );
            console.log('✅ Default admin user created');
            console.log('📧 Username: admin');
            console.log('🔑 Password: admin123');
        } else {
            console.log('ℹ️  Admin user already exists');
        }
        
        // Insert sample data
        await insertSampleData();
        
        console.log('🎉 Admin panel setup completed successfully!');
        console.log('🌐 Access admin panel at: http://localhost:5002/admin');
        console.log('📊 API endpoints available at: http://localhost:5002/api');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.error('Full error:', error);
    } finally {
        if (connection) {
            connection.end();
        }
    }
}

async function insertSampleData() {
    try {
        console.log('📝 Inserting sample data...');
        
        // Check if sample data already exists
        const [existingStudents] = await connection.promise().execute(
            'SELECT COUNT(*) as count FROM students'
        );
        
        if (existingStudents[0].count > 0) {
            console.log('ℹ️  Sample data already exists');
            return;
        }
        
        // Insert sample students
        const students = [
            ['2024001', 'John Doe', 'john@example.com', '9876543210', 'B.Tech CSE', '2nd Year', 'Punjab University Patiala', '123 Main St', '9876543211', 'Jane Doe'],
            ['2024002', 'Jane Smith', 'jane@example.com', '9876543212', 'MBA', '1st Year', 'Punjab University Patiala', '456 Oak Ave', '9876543213', 'Bob Smith'],
            ['2024003', 'Amit Kumar', 'amit@example.com', '9876543214', 'B.Tech ECE', '3rd Year', 'Punjab University Patiala', '789 Pine St', '9876543215', 'Priya Kumar']
        ];
        
        for (const student of students) {
            const hashedPassword = await bcrypt.hash('student123', 10);
            await connection.promise().execute(
                'INSERT INTO students (student_id, name, email, phone, course, academic_year, university, address, emergency_contact, emergency_contact_name, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [...student, hashedPassword]
            );
        }
        
        // Insert sample hostels
        const hostels = [
            ['Punjab Student Hostel', 'Rajesh Kumar', '9876543210', 'Near PUP Main Gate', 'Bhadurgarh', '123 University Road', 3, 10, 4500.00, 5000.00, 'WiFi,Food,Laundry,Study Room,Security', 'No smoking, No pets', '9876543210', 'admin@punjabhostel.com', 'Comfortable accommodation for PUP students', '["hostel1.jpg", "hostel2.jpg"]', '["WiFi", "Food", "Laundry", "Study Room", "Security"]', 'PUP Main Gate, Bus Stop', 0.5, true, true, 'Well maintained hostel'],
            ['Golden Girls Hostel', 'Priya Sharma', '9876543211', 'Near PUP Campus', 'Phase 1', '456 Campus Road', 2, 8, 5000.00, 6000.00, 'WiFi,AC,Food,Security,Laundry', 'Female only, No male visitors', '9876543211', 'admin@goldengirls.com', 'Safe and secure hostel for female students', '["girls1.jpg", "girls2.jpg"]', '["WiFi", "AC", "Food", "Security", "Laundry"]', 'PUP Campus, Shopping Mall', 0.3, true, true, 'Excellent security']
        ];
        
        for (const hostel of hostels) {
            await connection.promise().execute(
                'INSERT INTO hostels (name, owner_name, owner_phone, location, area, address, available_rooms, total_rooms, price_per_month, security_deposit, amenities, rules, contact_number, email, description, images, facilities, nearby_landmarks, distance_from_university, is_active, is_verified, admin_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                hostel
            );
        }
        
        // Insert sample PGs
        const pgs = [
            ['Punjab Student PG', 'Amit Singh', '9876543210', 'Bhadurgarh', 'Near PUP Main Gate', '123 University Road', 3, 8, 4500.00, 5000.00, 'Male', 'WiFi,Food,Laundry,Study Room', 'No smoking, No pets', '9876543210', 'admin@punjabpg.com', 'Comfortable PG for male students', '["pg1.jpg", "pg2.jpg"]', '["WiFi", "Food", "Laundry", "Study Room"]', 'PUP Main Gate, Bus Stop', 0.5, true, true, 'Well maintained PG'],
            ['Golden Girls PG', 'Sunita Devi', '9876543211', 'Phase 1', 'Near PUP Campus', '456 Campus Road', 2, 6, 5000.00, 6000.00, 'Female', 'WiFi,AC,Food,Security', 'Female only, No male visitors', '9876543211', 'admin@goldengirlspg.com', 'Safe PG for female students', '["girlspg1.jpg", "girlspg2.jpg"]', '["WiFi", "AC", "Food", "Security"]', 'PUP Campus, Shopping Mall', 0.3, true, true, 'Excellent security']
        ];
        
        for (const pg of pgs) {
            await connection.promise().execute(
                'INSERT INTO pgs (name, owner_name, owner_phone, area, location, address, available_spots, total_spots, price_per_month, security_deposit, gender_preference, amenities, rules, contact_number, email, description, images, facilities, nearby_landmarks, distance_from_university, is_active, is_verified, admin_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                pg
            );
        }
        
        // Insert sample allotments
        const allotments = [
            ['2024001', 1, 'Punjab Student Hostel', 'John Doe', '9876543210', 'john@example.com', 'B.Tech CSE', '2nd Year', 'Single Room', '1 Year', 'Need ground floor room', 'pending', 'New application', null, null],
            ['2024002', null, 'Golden Girls Hostel', 'Jane Smith', '9876543212', 'jane@example.com', 'MBA', '1st Year', 'Double Room', '2 Years', 'Prefer corner room', 'under_review', 'Under review by admin', null, null]
        ];
        
        for (const allotment of allotments) {
            await connection.promise().execute(
                'INSERT INTO hostel_allotments (student_id, hostel_id, preferred_hostel_name, student_name, student_phone, student_email, course, academic_year, preferred_room_type, duration, special_requirements, status, admin_notes, assigned_room, allotment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                allotment
            );
        }
        
        // Insert sample bookings
        const bookings = [
            ['2024001', 1, '2024-01-15', '2024-02-01', '2024-08-01', 6, 27000.00, 5000.00, 'confirmed', 'paid', 'Need ground floor room', 'Booking confirmed', '2024-02-01', '2024-08-01'],
            ['2024002', 2, '2024-01-20', '2024-02-15', '2024-12-15', 10, 50000.00, 6000.00, 'pending', 'pending', 'Prefer corner room', 'Under review', null, null]
        ];
        
        for (const booking of bookings) {
            await connection.promise().execute(
                'INSERT INTO pg_bookings (student_id, pg_id, booking_date, check_in_date, check_out_date, duration_months, total_amount, security_deposit, status, payment_status, special_requests, admin_notes, check_in_date, check_out_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                booking
            );
        }
        
        console.log('✅ Sample data inserted successfully');
        
    } catch (error) {
        console.error('❌ Error inserting sample data:', error.message);
    }
}

// Run setup
setupAdminPanel();
