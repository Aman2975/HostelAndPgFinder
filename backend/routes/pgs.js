const express = require('express');
const PG = require('../models/PG');
const { db } = require('../config/sqlite-database');
const router = express.Router();

// Get all PGs with optional filters
router.get('/', async (req, res) => {
    try {
        const filters = {
            area: req.query.area,
            gender: req.query.gender,
            min_price: req.query.min_price ? parseFloat(req.query.min_price) : undefined,
            max_price: req.query.max_price ? parseFloat(req.query.max_price) : undefined,
            available_spots: req.query.available_spots === 'true'
        };

        const pgs = await PG.getAll(filters);

        res.json({
            success: true,
            data: pgs,
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

// Get PG by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pg = await PG.getById(id);

        if (!pg) {
            return res.status(404).json({
                success: false,
                message: 'PG not found'
            });
        }

        res.json({
            success: true,
            data: { pg }
        });

    } catch (error) {
        console.error('Get PG error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get PGs by area
router.get('/area/:area', async (req, res) => {
    try {
        const { area } = req.params;
        const pgs = await PG.getByArea(area);

        res.json({
            success: true,
            data: pgs,
            count: pgs.length
        });

    } catch (error) {
        console.error('Get PGs by area error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Search PGs
router.get('/search/:term', async (req, res) => {
    try {
        const { term } = req.params;
        const filters = {
            area: req.query.area,
            gender: req.query.gender,
            min_price: req.query.min_price ? parseFloat(req.query.min_price) : undefined,
            max_price: req.query.max_price ? parseFloat(req.query.max_price) : undefined
        };

        const pgs = await PG.search(term, filters);

        res.json({
            success: true,
            data: pgs,
            count: pgs.length
        });

    } catch (error) {
        console.error('Search PGs error:', error);
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
        const areas = await PG.getAreas();

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

// Get gender preferences
router.get('/genders/list', async (req, res) => {
    try {
        const genders = await PG.getGenderPreferences();

        res.json({
            success: true,
            data: { genders }
        });

    } catch (error) {
        console.error('Get gender preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Create PG booking request
router.post('/book', async (req, res) => {
    try {
        const { student_id, property_id, property_type, special_requests } = req.body;

        // Validate required fields
        if (!student_id || !property_id || !property_type) {
            return res.status(400).json({
                success: false,
                message: 'Student ID, property ID, and property type are required'
            });
        }

        // Verify the PG exists
        const pg = await PG.getById(property_id);
        if (!pg) {
            return res.status(404).json({
                success: false,
                message: 'PG not found'
            });
        }

        // Check if PG has available spots
        if (pg.available_spots <= 0) {
            return res.status(400).json({
                success: false,
                message: 'No spots available in this PG'
            });
        }

        // Create booking record in database
        const query = `
            INSERT INTO pg_bookings 
            (student_id, pg_id, status, special_requirements, created_at) 
            VALUES (?, ?, 'pending', ?, datetime('now'))
        `;
        
        const result = await new Promise((resolve, reject) => {
            db.run(query, [student_id, property_id, special_requests || ''], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ insertId: this.lastID });
                }
            });
        });
        
        res.status(201).json({
            success: true,
            message: 'PG booking request submitted successfully',
            data: {
                id: result.insertId,
                student_id,
                pg_id: property_id,
                status: 'pending',
                special_requests: special_requests || ''
            }
        });

    } catch (error) {
        console.error('Create PG booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Create new PG (Admin only)
router.post('/', async (req, res) => {
    try {
        const pgData = req.body;

        // Validate required fields
        if (!pgData.name || !pgData.location || !pgData.area) {
            return res.status(400).json({
                success: false,
                message: 'Name, location, and area are required'
            });
        }

        const newPG = await PG.create(pgData);

        res.status(201).json({
            success: true,
            message: 'PG created successfully',
            data: { pg: newPG }
        });

    } catch (error) {
        console.error('Create PG error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Update PG (Admin only)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updated = await PG.update(id, updateData);

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'PG not found or no changes made'
            });
        }

        const pg = await PG.getById(id);

        res.json({
            success: true,
            message: 'PG updated successfully',
            data: { pg }
        });

    } catch (error) {
        console.error('Update PG error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Delete PG (Admin only)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await PG.delete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'PG not found'
            });
        }

        res.json({
            success: true,
            message: 'PG deleted successfully'
        });

    } catch (error) {
        console.error('Delete PG error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router;


