const express = require('express');
const Hostel = require('../models/Hostel');
const { db } = require('../config/sqlite-database');
const router = express.Router();

// Get all hostels with optional filters
router.get('/', async (req, res) => {
    try {
        const filters = {
            area: req.query.area,
            min_price: req.query.min_price ? parseFloat(req.query.min_price) : undefined,
            max_price: req.query.max_price ? parseFloat(req.query.max_price) : undefined,
            available_rooms: req.query.available_rooms === 'true'
        };

        const hostels = await Hostel.getAll(filters);

        res.json({
            success: true,
            data: hostels,
            count: hostels.length
        });

    } catch (error) {
        console.error('Get hostels error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get hostel by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const hostel = await Hostel.getById(id);

        if (!hostel) {
            return res.status(404).json({
                success: false,
                message: 'Hostel not found'
            });
        }

        res.json({
            success: true,
            data: { hostel }
        });

    } catch (error) {
        console.error('Get hostel error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get hostels by area
router.get('/area/:area', async (req, res) => {
    try {
        const { area } = req.params;
        const hostels = await Hostel.getByArea(area);

        res.json({
            success: true,
            data: hostels,
            count: hostels.length
        });

    } catch (error) {
        console.error('Get hostels by area error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Search hostels
router.get('/search/:term', async (req, res) => {
    try {
        const { term } = req.params;
        const filters = {
            area: req.query.area,
            min_price: req.query.min_price ? parseFloat(req.query.min_price) : undefined,
            max_price: req.query.max_price ? parseFloat(req.query.max_price) : undefined
        };

        const hostels = await Hostel.search(term, filters);

        res.json({
            success: true,
            data: hostels,
            count: hostels.length
        });

    } catch (error) {
        console.error('Search hostels error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get available areas
router.get('/areas/list', async (req, res) => {
    try {
        const areas = await Hostel.getAreas();

        res.json({
            success: true,
            data: areas
        });

    } catch (error) {
        console.error('Get areas error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Create hostel booking/allotment request
router.post('/book', async (req, res) => {
    try {
        const { student_id, property_id, property_type, special_requests } = req.body;

        console.log('=== HOSTEL BOOKING REQUEST ===');
        console.log('Request Body:', JSON.stringify(req.body, null, 2));

        // Validate required fields
        if (!student_id || !property_id || !property_type) {
            console.log('❌ Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Student ID, property ID, and property type are required'
            });
        }

        // Verify the hostel exists
        const hostel = await Hostel.getById(property_id);
        if (!hostel) {
            console.log('❌ Hostel not found:', property_id);
            return res.status(404).json({
                success: false,
                message: 'Hostel not found'
            });
        }

        console.log('✅ Hostel found:', hostel.name);

        // Check if hostel has available rooms
        if (hostel.available_rooms <= 0) {
            console.log('❌ No rooms available');
            return res.status(400).json({
                success: false,
                message: 'No rooms available in this hostel'
            });
        }

        console.log('✅ Rooms available:', hostel.available_rooms);

        // Parse special requests to extract all form data
        let student_name = 'Unknown Student';
        let student_email = null;
        let student_phone = null;
        let course = null;
        let academic_year = null;
        let room_type = null;
        let duration = null;
        let special_requirements = '';
        let emergency_contact = null;
        let emergency_relation = null;

        if (special_requests) {
            console.log('📝 Parsing special requests...');
            const lines = special_requests.split('\n');
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('Student Name:')) {
                    student_name = trimmedLine.replace('Student Name:', '').trim();
                } else if (trimmedLine.startsWith('Room Type:')) {
                    room_type = trimmedLine.replace('Room Type:', '').trim();
                } else if (trimmedLine.startsWith('Duration:')) {
                    duration = trimmedLine.replace('Duration:', '').trim();
                } else if (trimmedLine.startsWith('Course:')) {
                    course = trimmedLine.replace('Course:', '').trim();
                } else if (trimmedLine.startsWith('Academic Year:')) {
                    academic_year = trimmedLine.replace('Academic Year:', '').trim();
                } else if (trimmedLine.startsWith('Contact:')) {
                    student_phone = trimmedLine.replace('Contact:', '').trim();
                } else if (trimmedLine.startsWith('Email:')) {
                    student_email = trimmedLine.replace('Email:', '').trim();
                } else if (trimmedLine.startsWith('Special Requirements:')) {
                    special_requirements = trimmedLine.replace('Special Requirements:', '').trim();
                } else if (trimmedLine.startsWith('Emergency Contact:')) {
                    emergency_contact = trimmedLine.replace('Emergency Contact:', '').trim();
                    if (emergency_contact.includes('(') && emergency_contact.includes(')')) {
                        const parts = emergency_contact.split('(');
                        emergency_contact = parts[0].trim();
                        emergency_relation = parts[1].replace(')', '').trim();
                    }
                }
            }
        }

        console.log('📋 Parsed Data:');
        console.log('  Student Name:', student_name);
        console.log('  Student Email:', student_email);
        console.log('  Student Phone:', student_phone);
        console.log('  Course:', course);
        console.log('  Academic Year:', academic_year);
        console.log('  Room Type:', room_type);
        console.log('  Duration:', duration);
        console.log('  Special Requirements:', special_requirements);
        console.log('  Emergency Contact:', emergency_contact);
        console.log('  Emergency Relation:', emergency_relation);

        // Check if student exists
        const studentCheckQuery = 'SELECT * FROM students WHERE student_id = ?';
        const existingStudent = await new Promise((resolve, reject) => {
            db.get(studentCheckQuery, [student_id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        if (existingStudent) {
            console.log('✅ Student exists:', existingStudent.name);
            
            // Update student information if provided
            if (student_name && student_name !== 'Unknown Student') {
                const updateStudentQuery = `
                    UPDATE students 
                    SET name = ?, email = ?, phone = ?, course = ?, academic_year = ?, updated_at = datetime('now')
                    WHERE student_id = ?
                `;
                
                await new Promise((resolve, reject) => {
                    db.run(updateStudentQuery, [student_name, student_email, student_phone, course, academic_year, student_id], function(err) {
                        if (err) {
                            console.log('⚠️ Warning: Could not update student record:', err.message);
                        } else {
                            console.log('✅ Student record updated');
                        }
                        resolve();
                    });
                });
            }
        } else {
            console.log('📝 Creating new student record...');
            
            // Validate required student fields
            if (!student_email) {
                console.log('❌ Student email is required');
                return res.status(400).json({
                    success: false,
                    message: 'Student email is required for new students'
                });
            }

            // Create student record
            const createStudentQuery = `
                INSERT INTO students (student_id, name, email, phone, course, academic_year, password_hash, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `;
            
            const studentResult = await new Promise((resolve, reject) => {
                db.run(createStudentQuery, [student_id, student_name, student_email, student_phone, course, academic_year, 'temp_password'], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ insertId: this.lastID });
                    }
                });
            });
            
            console.log('✅ Student record created with ID:', studentResult.insertId);
        }

        // Create comprehensive special requirements text
        const fullSpecialRequirements = () => {
            let requirements = '';
            if (special_requirements) {
                requirements += `Special Requirements: ${special_requirements}\n`;
            }
            if (emergency_contact) {
                requirements += `Emergency Contact: ${emergency_contact}`;
                if (emergency_relation) {
                    requirements += ` (${emergency_relation})`;
                }
            }
            return requirements.trim();
        };

        // Create booking record in database
        const insertQuery = `
            INSERT INTO hostel_allotments 
            (student_id, hostel_id, room_type, duration, special_requirements, status, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))
        `;
        
        const result = await new Promise((resolve, reject) => {
            db.run(insertQuery, [
                student_id, 
                property_id, 
                room_type, 
                duration, 
                fullSpecialRequirements()
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ insertId: this.lastID });
                }
            });
        });
        
        console.log('✅ Hostel booking created successfully with ID:', result.insertId);
        
        res.status(201).json({
            success: true,
            message: 'Hostel allotment request submitted successfully',
            data: {
                id: result.insertId,
                student_id,
                student_name,
                student_email,
                student_phone,
                hostel_id: property_id,
                hostel_name: hostel.name,
                room_type,
                duration,
                course,
                academic_year,
                status: 'pending',
                special_requirements: fullSpecialRequirements()
            }
        });

    } catch (error) {
        console.error('❌ Create hostel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Create new hostel (Admin only - you can add admin authentication later)
router.post('/', async (req, res) => {
    try {
        const hostelData = req.body;

        // Validate required fields
        if (!hostelData.name || !hostelData.location || !hostelData.area) {
            return res.status(400).json({
                success: false,
                message: 'Name, location, and area are required'
            });
        }

        const newHostel = await Hostel.create(hostelData);

        res.status(201).json({
            success: true,
            message: 'Hostel created successfully',
            data: { hostel: newHostel }
        });

    } catch (error) {
        console.error('Create hostel error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Update hostel (Admin only)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updated = await Hostel.update(id, updateData);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Hostel not found or no changes made'
            });
        }

        const hostel = await Hostel.getById(id);

        res.json({
            success: true,
            message: 'Hostel updated successfully',
            data: { hostel }
        });

    } catch (error) {
        console.error('Update hostel error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Delete hostel (Admin only)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Hostel.delete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Hostel not found'
            });
        }

        res.json({
            success: true,
            message: 'Hostel deleted successfully'
        });

    } catch (error) {
        console.error('Delete hostel error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router;


