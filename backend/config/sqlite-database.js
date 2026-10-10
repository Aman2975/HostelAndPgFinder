const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config({ path: './config.env' });

// Create SQLite database connection
const dbPath = path.join(__dirname, '..', 'database', 'hostel_pg_finder.db');
const db = new sqlite3.Database(dbPath);

// Test database connection
const testConnection = async () => {
    return new Promise((resolve, reject) => {
        db.get("SELECT 1", (err) => {
            if (err) {
                console.error('❌ SQLite database connection failed:', err.message);
                reject(err);
            } else {
                console.log('✅ SQLite database connected successfully');
                resolve();
            }
        });
    });
};

// Initialize database with schema
const initializeDatabase = async () => {
    return new Promise((resolve, reject) => {
        // Create tables
        const createTables = `
            -- Admin users table
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                role VARCHAR(20) DEFAULT 'admin',
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Students table
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id VARCHAR(20) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                phone VARCHAR(15),
                course VARCHAR(50),
                academic_year VARCHAR(10),
                gender VARCHAR(10),
                university VARCHAR(100),
                password_hash VARCHAR(255) NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Hostels table
            CREATE TABLE IF NOT EXISTS hostels (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL,
                owner_name VARCHAR(100),
                owner_phone VARCHAR(15),
                location VARCHAR(200),
                area VARCHAR(50),
                available_rooms INTEGER DEFAULT 0,
                total_rooms INTEGER DEFAULT 0,
                price_per_month DECIMAL(10,2),
                amenities TEXT,
                contact_number VARCHAR(15),
                description TEXT,
                image_url VARCHAR(255),
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- PGs table
            CREATE TABLE IF NOT EXISTS pgs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL,
                owner_name VARCHAR(100),
                owner_phone VARCHAR(15),
                location VARCHAR(200),
                area VARCHAR(50),
                available_spots INTEGER DEFAULT 0,
                total_spots INTEGER DEFAULT 0,
                price_per_month DECIMAL(10,2),
                gender_preference VARCHAR(20),
                amenities TEXT,
                contact_number VARCHAR(15),
                description TEXT,
                image_url VARCHAR(255),
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Hostel allotment requests
            CREATE TABLE IF NOT EXISTS hostel_allotments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id VARCHAR(20) NOT NULL,
                hostel_id INTEGER NOT NULL,
                room_type VARCHAR(50),
                duration VARCHAR(50),
                special_requirements TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (hostel_id) REFERENCES hostels(id)
            );

            -- PG bookings
            CREATE TABLE IF NOT EXISTS pg_bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id VARCHAR(20) NOT NULL,
                pg_id INTEGER NOT NULL,
                move_in_date DATE,
                duration VARCHAR(50),
                special_requirements TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (pg_id) REFERENCES pgs(id)
            );

            -- Reviews and ratings
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id VARCHAR(20) NOT NULL,
                property_id INTEGER NOT NULL,
                property_type VARCHAR(10) NOT NULL,
                rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(student_id)
            );

            -- Favorites
            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id VARCHAR(20) NOT NULL,
                property_id INTEGER NOT NULL,
                property_type VARCHAR(10) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(student_id)
            );

            -- Notifications
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id VARCHAR(20) NOT NULL,
                title VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50),
                is_read BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(student_id)
            );

            -- System logs
            CREATE TABLE IF NOT EXISTS system_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id VARCHAR(20),
                user_type VARCHAR(20),
                action VARCHAR(100) NOT NULL,
                details TEXT,
                ip_address VARCHAR(45),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `;

        db.exec(createTables, (err) => {
            if (err) {
                console.error('❌ Database initialization failed:', err.message);
                reject(err);
            } else {
                console.log('✅ Database tables created successfully');
                
                // Insert sample data
                insertSampleData()
                    .then(() => resolve())
                    .catch(reject);
            }
        });
    });
};

// Insert sample data
const insertSampleData = async () => {
    return new Promise((resolve, reject) => {
        const bcrypt = require('bcryptjs');
        
        // Insert admin user
        const adminPassword = bcrypt.hashSync('admin123', 10);
        const studentPassword = bcrypt.hashSync('student123', 10);
        
        const sampleData = [
            // Admin
            `INSERT OR IGNORE INTO admins (username, email, password_hash, full_name) VALUES ('admin', 'admin@hostelpg.com', '${adminPassword}', 'System Administrator')`,
            
            // Sample student
            `INSERT OR IGNORE INTO students (student_id, name, email, phone, course, academic_year, password_hash) VALUES ('2024001', 'Demo Student', 'student@example.com', '9876543210', 'Computer Science', '2024', '${studentPassword}')`,
            
            // Sample hostels
            `INSERT OR IGNORE INTO hostels (name, owner_name, owner_phone, location, area, available_rooms, total_rooms, price_per_month, amenities, contact_number, description) VALUES 
            ('University Hostel A', 'Dr. Rajesh Kumar', '9876543210', 'Near University Gate', 'Campus', 15, 50, 5000.00, 'WiFi, Laundry, Mess, Security', '9876543210', 'Modern hostel with all amenities'),
            ('Green Valley Hostel', 'Mrs. Priya Singh', '9876543211', 'Phase 1', 'Phase 1', 8, 25, 4500.00, 'WiFi, Laundry, Parking', '9876543211', 'Peaceful environment near market'),
            ('City Center Hostel', 'Mr. Amit Sharma', '9876543212', 'Near Bus Stand', 'Phase 2', 12, 30, 4000.00, 'WiFi, Laundry, Common Room', '9876543212', 'Convenient location for students')`,
            
            // Sample PGs
            `INSERT OR IGNORE INTO pgs (name, owner_name, owner_phone, location, area, available_spots, total_spots, price_per_month, gender_preference, amenities, contact_number, description) VALUES 
            ('Sunshine PG', 'Mrs. Sunita Devi', '9876543213', 'Bhadurgarh', 'Bhadurgarh', 5, 15, 3500.00, 'Both', 'WiFi, Laundry, Kitchen', '9876543213', 'Cozy PG with home-like atmosphere'),
            ('Modern PG', 'Mr. Vikas Gupta', '9876543214', 'Phase 1', 'Phase 1', 3, 10, 4000.00, 'Male', 'WiFi, Laundry, Gym', '9876543214', 'Modern facilities for working professionals'),
            ('Green PG', 'Mrs. Rekha Jain', '9876543215', 'Phase 2', 'Phase 2', 4, 12, 3200.00, 'Female', 'WiFi, Laundry, Security', '9876543215', 'Safe and secure for female students'),
            ('Campus PG', 'Mr. Ramesh Kumar', '9876543216', 'Near PUP', 'Near PUP', 6, 20, 3800.00, 'Both', 'WiFi, Laundry, Study Room', '9876543216', 'Close to university campus')`
        ];

        let completed = 0;
        sampleData.forEach((query, index) => {
            db.exec(query, (err) => {
                if (err) {
                    console.warn(`⚠️  Warning: ${err.message}`);
                }
                completed++;
                if (completed === sampleData.length) {
                    console.log('✅ Sample data inserted successfully');
                    resolve();
                }
            });
        });
    });
};

// Wrapper functions to match MySQL interface
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ insertId: this.lastID, changes: this.changes });
            }
        });
    });
};

module.exports = {
    db,
    testConnection,
    initializeDatabase,
    query,
    get,
    run
};
