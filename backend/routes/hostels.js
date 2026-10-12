const express = require('express');
const Hostel = require('../models/Hostel');
const { db } = require('../config/firebase');
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

        if (!student_id || !property_id || !property_type) {
            return res.status(400).json({
                success: false,
                message: 'Student ID, property ID, and property type are required'
            });
        }

        const hostel = await Hostel.getById(property_id);
        if (!hostel) {
            return res.status(404).json({
                success: false,
                message: 'Hostel not found'
            });
        }

        if (Number(hostel.available_rooms || 0) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'No rooms available in this hostel'
            });
        }

        // Parse fields from special_requests if passed as formatted string
        let student_name = req.body.student_name || 'Unknown Student';
        let student_email = req.body.email || req.body.student_email || null;
        let student_phone = req.body.contact || req.body.student_phone || null;
        let course = req.body.course || null;
        let academic_year = req.body.academic_year || null;
        let room_type = req.body.room_type || null;
        let duration = req.body.duration || null;
        let special_requirements = '';
        let emergency_contact = null;
        let emergency_relation = null;

        if (special_requests) {
            const lines = special_requests.split('\n');
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('Student Name:')) student_name = trimmedLine.replace('Student Name:', '').trim();
                else if (trimmedLine.startsWith('Room Type:')) room_type = trimmedLine.replace('Room Type:', '').trim();
                else if (trimmedLine.startsWith('Duration:')) duration = trimmedLine.replace('Duration:', '').trim();
                else if (trimmedLine.startsWith('Course:')) course = trimmedLine.replace('Course:', '').trim();
                else if (trimmedLine.startsWith('Academic Year:')) academic_year = trimmedLine.replace('Academic Year:', '').trim();
                else if (trimmedLine.startsWith('Contact:')) student_phone = trimmedLine.replace('Contact:', '').trim();
                else if (trimmedLine.startsWith('Email:')) student_email = trimmedLine.replace('Email:', '').trim();
                else if (trimmedLine.startsWith('Special Requirements:')) special_requirements = trimmedLine.replace('Special Requirements:', '').trim();
                else if (trimmedLine.startsWith('Emergency Contact:')) {
                    emergency_contact = trimmedLine.replace('Emergency Contact:', '').trim();
                    if (emergency_contact.includes('(') && emergency_contact.includes(')')) {
                        const parts = emergency_contact.split('(');
                        emergency_contact = parts[0].trim();
                        emergency_relation = parts[1].replace(')', '').trim();
                    }
                }
            }
        }

        const allotmentData = {
            studentName: student_name,
            studentId: student_id,
            hostelId: hostel.id,
            hostelName: hostel.name,
            roomType: room_type || 'Single',
            duration: duration || '1 Year',
            status: 'Pending',
            course: course || '',
            academicYear: academic_year || '',
            contact: student_phone || '',
            email: student_email || '',
            specialRequirements: special_requirements,
            emergencyContact: emergency_contact,
            emergencyRelation: emergency_relation,
            created_at: new Date().toISOString()
        };

        const docRef = await db.collection('hostel_allotments').add(allotmentData);

        res.status(201).json({
            success: true,
            message: 'Hostel allotment request submitted successfully',
            data: { id: docRef.id, ...allotmentData }
        });

    } catch (error) {
        console.error('Create hostel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Create new hostel (Admin)
router.post('/', async (req, res) => {
    try {
        const hostelData = req.body;
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

// Update hostel (Admin)
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

// Delete hostel (Admin)
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
