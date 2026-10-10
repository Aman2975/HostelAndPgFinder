-- Enhanced Database Schema for Admin Panel
-- MySQL Database Setup with Admin Functionality

CREATE DATABASE IF NOT EXISTS hostel_pg_finder;
USE hostel_pg_finder;

-- Admin users table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Students table (enhanced)
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    course VARCHAR(50),
    academic_year VARCHAR(20),
    university VARCHAR(100),
    address TEXT,
    emergency_contact VARCHAR(15),
    emergency_contact_name VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Hostels table (enhanced)
CREATE TABLE IF NOT EXISTS hostels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    owner_name VARCHAR(100),
    owner_phone VARCHAR(15),
    owner_email VARCHAR(100),
    location VARCHAR(200),
    area VARCHAR(50),
    address TEXT,
    available_rooms INT DEFAULT 0,
    total_rooms INT DEFAULT 0,
    price_per_month DECIMAL(10,2),
    security_deposit DECIMAL(10,2) DEFAULT 0,
    amenities TEXT,
    rules TEXT,
    contact_number VARCHAR(15),
    email VARCHAR(100),
    description TEXT,
    images JSON,
    facilities JSON,
    nearby_landmarks TEXT,
    distance_from_university DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- PGs table (enhanced)
CREATE TABLE IF NOT EXISTS pgs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    owner_name VARCHAR(100),
    owner_phone VARCHAR(15),
    owner_email VARCHAR(100),
    area VARCHAR(50),
    location VARCHAR(200),
    address TEXT,
    available_spots INT DEFAULT 0,
    total_spots INT DEFAULT 0,
    price_per_month DECIMAL(10,2),
    security_deposit DECIMAL(10,2) DEFAULT 0,
    gender_preference ENUM('Male', 'Female', 'Unisex') DEFAULT 'Unisex',
    amenities TEXT,
    rules TEXT,
    contact_number VARCHAR(15),
    email VARCHAR(100),
    description TEXT,
    images JSON,
    facilities JSON,
    nearby_landmarks TEXT,
    distance_from_university DECIMAL(5,2),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Hostel allotment requests
CREATE TABLE IF NOT EXISTS hostel_allotments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    hostel_id INT,
    preferred_hostel_name VARCHAR(100),
    student_name VARCHAR(100) NOT NULL,
    student_phone VARCHAR(15),
    student_email VARCHAR(100),
    course VARCHAR(50),
    academic_year VARCHAR(20),
    preferred_room_type VARCHAR(50),
    duration VARCHAR(50),
    special_requirements TEXT,
    status ENUM('pending', 'under_review', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    admin_notes TEXT,
    assigned_room VARCHAR(20),
    allotment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE SET NULL
);

-- PG bookings
CREATE TABLE IF NOT EXISTS pg_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    pg_id INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_in_date DATE,
    check_out_date DATE,
    duration_months INT,
    total_amount DECIMAL(10,2),
    security_deposit DECIMAL(10,2),
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    payment_status ENUM('pending', 'partial', 'paid', 'refunded') DEFAULT 'pending',
    special_requests TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (pg_id) REFERENCES pgs(id) ON DELETE CASCADE
);

-- Reviews and ratings
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    property_id INT NOT NULL,
    property_type ENUM('hostel', 'pg') NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    property_id INT NOT NULL,
    property_type ENUM('hostel', 'pg') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (student_id, property_id, property_type)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20),
    admin_id INT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- System logs
CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
);

-- Insert default admin user
INSERT INTO admins (username, email, password_hash, role) VALUES
('admin', 'admin@hostelpg.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin');

-- Insert sample data
INSERT INTO students (student_id, name, email, phone, course, academic_year, university, password_hash) VALUES
('2024001', 'John Doe', 'john@example.com', '9876543210', 'B.Tech CSE', '2nd Year', 'Punjab University Patiala', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('2024002', 'Jane Smith', 'jane@example.com', '9876543211', 'MBA', '1st Year', 'Punjab University Patiala', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

INSERT INTO hostels (name, owner_name, owner_phone, location, area, available_rooms, total_rooms, price_per_month, amenities, contact_number, description, is_verified) VALUES
('Punjab Student Hostel', 'Rajesh Kumar', '9876543210', 'Near PUP Main Gate', 'Bhadurgarh', 3, 10, 4500.00, 'WiFi,Food,Laundry,Study Room,Security', '9876543210', 'Comfortable accommodation for PUP students', TRUE),
('Golden Girls Hostel', 'Priya Sharma', '9876543211', 'Near PUP Campus', 'Phase 1', 2, 8, 5000.00, 'WiFi,AC,Food,Security,Laundry', '9876543211', 'Safe and secure hostel for female students', TRUE);

INSERT INTO pgs (name, owner_name, owner_phone, area, location, available_spots, total_spots, price_per_month, gender_preference, amenities, contact_number, description, is_verified) VALUES
('Punjab Student PG', 'Amit Singh', '9876543210', 'Bhadurgarh', 'Near PUP Main Gate', 3, 8, 4500.00, 'Male', 'WiFi,Food,Laundry,Study Room', '9876543210', 'Comfortable PG for male students', TRUE),
('Golden Girls PG', 'Sunita Devi', '9876543211', 'Phase 1', 'Near PUP Campus', 2, 6, 5000.00, 'Female', 'WiFi,AC,Food,Security', '9876543211', 'Safe PG for female students', TRUE);

-- Create indexes for better performance
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_course ON students(course);
CREATE INDEX idx_hostels_area ON hostels(area);
CREATE INDEX idx_hostels_active ON hostels(is_active);
CREATE INDEX idx_pgs_area ON pgs(area);
CREATE INDEX idx_pgs_active ON pgs(is_active);
CREATE INDEX idx_pgs_gender ON pgs(gender_preference);
CREATE INDEX idx_allotments_status ON hostel_allotments(status);
CREATE INDEX idx_bookings_status ON pg_bookings(status);
CREATE INDEX idx_reviews_property ON reviews(property_id, property_type);

