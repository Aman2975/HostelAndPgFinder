const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Hostel = require('../models/Hostel');
const PG = require('../models/PG');
const { db, query: dbQuery, get, run } = require('../config/sqlite-database');
const router = express.Router();

// Generate JWT token for admin
const generateAdminToken = (adminId, role) => {
    return jwt.sign({ adminId, role }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Middleware to authenticate admin (disabled for direct access)
const authenticateAdmin = (req, res, next) => {
    // Skip authentication - allow direct access
    next();
};

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Try to find admin by username first, then by email
        let admin = await Admin.findByUsername(username);
        if (!admin) {
            admin = await Admin.findByEmail(username);
        }
        
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isValidPassword = await Admin.verifyPassword(password, admin.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateAdminToken(admin.id, admin.role);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                admin: {
                    id: admin.id,
                    username: admin.username,
                    email: admin.email,
                    role: admin.role
                },
                token
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get dashboard statistics
router.get('/dashboard', authenticateAdmin, async (req, res) => {
    try {
        const stats = await Admin.getDashboardStats();
        
        res.json({
            success: true,
            data: { stats }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get all students
router.get('/students', authenticateAdmin, async (req, res) => {
    try {
        const filters = {
            search: req.query.search,
            course: req.query.course,
            academic_year: req.query.academic_year,
            is_verified: req.query.is_verified ? req.query.is_verified === 'true' : undefined,
            is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
            offset: req.query.offset ? parseInt(req.query.offset) : undefined
        };

        const students = await Student.getAll(filters);

        res.json({
            success: true,
            data: { students },
            count: students.length
        });

    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get student by ID
router.get('/students/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.getById(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get student activity
        const activity = await Student.getStudentActivity(student.student_id);

        res.json({
            success: true,
            data: { student, activity }
        });

    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Update student
router.put('/students/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updated = await Student.update(id, updateData);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Student not found or no changes made'
            });
        }

        const student = await Student.getById(id);

        res.json({
            success: true,
            message: 'Student updated successfully',
            data: { student }
        });

    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Delete student
router.delete('/students/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Student.delete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });

    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get student statistics
router.get('/students/stats/overview', authenticateAdmin, async (req, res) => {
    try {
        const stats = await Student.getStats();

        res.json({
            success: true,
            data: { stats }
        });

    } catch (error) {
        console.error('Student stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get all hostels
router.get('/hostels', authenticateAdmin, async (req, res) => {
    try {
        const filters = {
            area: req.query.area,
            is_verified: req.query.is_verified ? req.query.is_verified === 'true' : undefined,
            is_active: req.query.is_active ? req.query.is_active === 'true' : undefined
        };

        const hostels = await Hostel.getAll(filters);

        res.json({
            success: true,
            data: { hostels },
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

// Get all PGs
router.get('/pgs', authenticateAdmin, async (req, res) => {
    try {
        const filters = {
            area: req.query.area,
            gender: req.query.gender,
            is_verified: req.query.is_verified ? req.query.is_verified === 'true' : undefined,
            is_active: req.query.is_active ? req.query.is_active === 'true' : undefined
        };

        const pgs = await PG.getAll(filters);

        res.json({
            success: true,
            data: { pgs },
            count: pgs.length
        });

    } catch (error) {
        console.error('Get PGs error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get hostel allotments
router.get('/allotments', authenticateAdmin, async (req, res) => {
    try {
        const { status, limit, offset } = req.query;
        
        let query = `
            SELECT ha.*, s.name as student_name, s.email as student_email, 
                   s.phone as student_phone, h.name as hostel_name
            FROM hostel_allotments ha
            LEFT JOIN students s ON ha.student_id = s.student_id
            LEFT JOIN hostels h ON ha.hostel_id = h.id
        `;
        const values = [];

        if (status) {
            query += ' WHERE ha.status = ?';
            values.push(status);
        }

        query += ' ORDER BY ha.created_at DESC';

        if (limit) {
            query += ' LIMIT ?';
            values.push(parseInt(limit));
        }

        if (offset) {
            query += ' OFFSET ?';
            values.push(parseInt(offset));
        }

        const allotments = await dbQuery(query, values);

        res.json({
            success: true,
            data: { allotments },
            count: allotments.length
        });

    } catch (error) {
        console.error('Get allotments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Update allotment status
router.put('/allotments/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes, assigned_room, allotment_date } = req.body;

        const query = `
            UPDATE hostel_allotments 
            SET status = ?, admin_notes = ?, assigned_room = ?, allotment_date = ?
            WHERE id = ?
        `;

        const result = await run(query, [status, admin_notes, assigned_room, allotment_date, id]);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Allotment not found'
            });
        }

        res.json({
            success: true,
            message: 'Allotment updated successfully'
        });

    } catch (error) {
        console.error('Update allotment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get PG bookings
router.get('/bookings', authenticateAdmin, async (req, res) => {
    try {
        const { status, limit, offset } = req.query;
        
        let query = `
            SELECT pb.*, s.name as student_name, s.email as student_email, 
                   s.phone as student_phone, p.name as pg_name
            FROM pg_bookings pb
            LEFT JOIN students s ON pb.student_id = s.student_id
            LEFT JOIN pgs p ON pb.pg_id = p.id
        `;
        const values = [];

        if (status) {
            query += ' WHERE pb.status = ?';
            values.push(status);
        }

        query += ' ORDER BY pb.created_at DESC';

        if (limit) {
            query += ' LIMIT ?';
            values.push(parseInt(limit));
        }

        if (offset) {
            query += ' OFFSET ?';
            values.push(parseInt(offset));
        }

        const bookings = await dbQuery(query, values);

        res.json({
            success: true,
            data: { bookings },
            count: bookings.length
        });

    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Update booking status
router.put('/bookings/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes, check_in_date, check_out_date } = req.body;

        const query = `
            UPDATE pg_bookings 
            SET status = ?, admin_notes = ?, check_in_date = ?, check_out_date = ?
            WHERE id = ?
        `;

        const result = await run(query, [status, admin_notes, check_in_date, check_out_date, id]);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            message: 'Booking updated successfully'
        });

    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// ==================== HOSTEL MANAGEMENT ====================

// Create new hostel
router.post('/hostels', authenticateAdmin, async (req, res) => {
    try {
        const { name, area, price_per_month, available_rooms, description, amenities, contact_number, address, is_active } = req.body;

        // Basic validation
        if (!name || !area || !price_per_month || !available_rooms) {
            return res.status(400).json({
                success: false,
                message: 'Name, area, price, and available rooms are required'
            });
        }

        const newHostel = await Hostel.create({
            name,
            location: address || area, // Use address as location, fallback to area
            area,
            price_per_month: parseFloat(price_per_month),
            available_rooms: parseInt(available_rooms),
            total_rooms: parseInt(available_rooms), // Set total_rooms same as available_rooms for new hostels
            description: description || '',
            amenities: amenities || '',
            contact_number: contact_number || ''
        });

        res.status(201).json({
            success: true,
            message: 'Hostel created successfully',
            data: newHostel
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

// Update hostel
router.put('/hostels/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, area, price_per_month, available_rooms, description, amenities, contact_number, address, is_active } = req.body;

        const updated = await Hostel.update(id, {
            name,
            location: address || area, // Use address as location, fallback to area
            area,
            price_per_month: price_per_month ? parseFloat(price_per_month) : undefined,
            available_rooms: available_rooms ? parseInt(available_rooms) : undefined,
            total_rooms: available_rooms ? parseInt(available_rooms) : undefined, // Update total_rooms too
            description,
            amenities,
            contact_number
        });

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Hostel not found'
            });
        }

        res.json({
            success: true,
            message: 'Hostel updated successfully'
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

// Delete hostel
router.delete('/hostels/:id', authenticateAdmin, async (req, res) => {
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

// Get single hostel
router.get('/hostels/:id', authenticateAdmin, async (req, res) => {
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
            data: hostel
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

module.exports = router;

