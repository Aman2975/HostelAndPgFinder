-- Hostel and PG Finder Database Schema
-- MySQL Database Setup

CREATE DATABASE IF NOT EXISTS hostel_pg_finder;
USE hostel_pg_finder;

-- Users table for student authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    course VARCHAR(50),
    academic_year VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Hostels table
CREATE TABLE IF NOT EXISTS hostels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    area VARCHAR(50),
    available_rooms INT DEFAULT 0,
    total_rooms INT DEFAULT 0,
    price_per_month DECIMAL(10,2),
    amenities TEXT,
    contact_number VARCHAR(15),
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- PGs table
CREATE TABLE IF NOT EXISTS pgs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    area VARCHAR(50),
    location VARCHAR(200),
    available_spots INT DEFAULT 0,
    total_spots INT DEFAULT 0,
    price_per_month DECIMAL(10,2),
    gender_preference ENUM('Male', 'Female', 'Unisex') DEFAULT 'Unisex',
    amenities TEXT,
    contact_number VARCHAR(15),
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    property_id INT NOT NULL,
    property_type ENUM('hostel', 'pg') NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    special_requests TEXT,
    FOREIGN KEY (student_id) REFERENCES users(student_id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_property (property_id, property_type)
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    property_id INT NOT NULL,
    property_type ENUM('hostel', 'pg') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(student_id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (student_id, property_id, property_type)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    property_id INT NOT NULL,
    property_type ENUM('hostel', 'pg') NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(student_id) ON DELETE CASCADE,
    INDEX idx_property_reviews (property_id, property_type)
);

-- Insert sample data
INSERT INTO hostels (name, location, area, available_rooms, total_rooms, price_per_month, amenities, contact_number, description) VALUES
('Punjab Student Hostel', 'Near PUP Main Gate', 'Bhadurgarh', 3, 10, 4500.00, 'WiFi,Food,Laundry,Study Room', '9876543210', 'Comfortable accommodation for PUP students'),
('Golden Girls Hostel', 'Near PUP Campus', 'Phase 1', 2, 8, 5000.00, 'WiFi,AC,Food,Security', '9876543211', 'Safe and secure hostel for female students'),
('Royal Student Hostel', '5 minutes from PUP', 'Phase 2', 4, 12, 4000.00, 'WiFi,Food,Parking,Common Room', '9876543212', 'Budget-friendly option for students'),
('Comfort Zone Hostel', 'Walking distance to University', 'Near PUP', 1, 6, 5500.00, 'WiFi,AC,Food,Gym,Laundry', '9876543213', 'Premium hostel with all amenities');

INSERT INTO pgs (name, area, location, available_spots, total_spots, price_per_month, gender_preference, amenities, contact_number, description) VALUES
('Punjab Student PG', 'Bhadurgarh', 'Near PUP Main Gate', 3, 8, 4500.00, 'Male', 'WiFi,Food,Laundry,Study Room', '9876543210', 'Comfortable PG for male students'),
('Golden Girls PG', 'Phase 1', 'Near PUP Campus', 2, 6, 5000.00, 'Female', 'WiFi,AC,Food,Security', '9876543211', 'Safe PG for female students'),
('Royal Student PG', 'Phase 2', '5 minutes from PUP', 4, 10, 4000.00, 'Unisex', 'WiFi,Food,Parking,Common Room', '9876543212', 'Budget-friendly PG for all students'),
('Comfort Zone PG', 'Near PUP', 'Walking distance to University', 1, 4, 5500.00, 'Male', 'WiFi,AC,Food,Gym,Laundry', '9876543213', 'Premium PG with all amenities'),
('Student Hub PG', 'Bhadurgarh', 'Near PUP Library', 3, 8, 4200.00, 'Male', 'WiFi,Food,Study Area,Laundry', '9876543215', 'Study-focused PG near library'),
('Patiala Palace PG', 'Phase 1', 'Close to PUP Hostels', 2, 6, 4700.00, 'Female', 'WiFi,AC,Food,Security', '9876543216', 'Elegant PG for female students');

-- Create indexes for better performance
CREATE INDEX idx_hostels_area ON hostels(area);
CREATE INDEX idx_hostels_active ON hostels(is_active);
CREATE INDEX idx_pgs_area ON pgs(area);
CREATE INDEX idx_pgs_active ON pgs(is_active);
CREATE INDEX idx_pgs_gender ON pgs(gender_preference);


