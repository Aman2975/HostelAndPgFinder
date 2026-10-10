const express = require('express');
const { query, get, run } = require('../config/sqlite-database');
const router = express.Router();

// Hostel management routes
// Get all hostels for admin
router.get('/hostels', async (req, res) => {
    try {
        const sql = 'SELECT * FROM hostels ORDER BY created_at DESC';
        const hostels = await query(sql);
        
        res.json({
            success: true,
            data: hostels
        });
    } catch (error) {
        console.error('Error fetching hostels:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Add new hostel
router.post('/hostels', async (req, res) => {
    try {
        const {
            name,
            area,
            location,
            price_per_month,
            total_rooms,
            available_rooms,
            amenities,
            contact_number,
            description,
            is_active = 1
        } = req.body;

        // Basic validation
        if (!name || !area || !location || !price_per_month || !total_rooms || !available_rooms) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, area, location, price, total rooms, and available rooms are required' 
            });
        }

        const sql = `
            INSERT INTO hostels (
                name, area, location, price_per_month, total_rooms, available_rooms,
                amenities, contact_number, description, is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        const result = await run(sql, [
            name, area, location, price_per_month, total_rooms, available_rooms,
            amenities, contact_number, description, is_active
        ]);

        res.status(201).json({
            success: true,
            message: 'Hostel added successfully',
            data: { id: result.lastID }
        });
    } catch (error) {
        console.error('Error adding hostel:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Update hostel
router.put('/hostels/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            area,
            location,
            price_per_month,
            total_rooms,
            available_rooms,
            amenities,
            contact_number,
            description,
            is_active
        } = req.body;

        const sql = `
            UPDATE hostels 
            SET name = ?, area = ?, location = ?, price_per_month = ?, 
                total_rooms = ?, available_rooms = ?, amenities = ?, 
                contact_number = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        const result = await run(sql, [
            name, area, location, price_per_month, total_rooms, available_rooms,
            amenities, contact_number, description, is_active, id
        ]);

        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Hostel not found' });
        }

        res.json({
            success: true,
            message: 'Hostel updated successfully'
        });
    } catch (error) {
        console.error('Error updating hostel:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Delete hostel
router.delete('/hostels/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const sql = 'DELETE FROM hostels WHERE id = ?';
        const result = await run(sql, [id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Hostel not found' });
        }

        res.json({
            success: true,
            message: 'Hostel deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting hostel:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// PG management routes
// Get all PGs for admin
router.get('/pgs', async (req, res) => {
    try {
        const sql = 'SELECT * FROM pgs ORDER BY created_at DESC';
        const pgs = await query(sql);
        
        res.json({
            success: true,
            data: pgs
        });
    } catch (error) {
        console.error('Error fetching PGs:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Add new PG
router.post('/pgs', async (req, res) => {
    try {
        const {
            name,
            area,
            location,
            price_per_month,
            total_spots,
            available_spots,
            gender_preference,
            amenities,
            contact_number,
            description,
            is_active = 1
        } = req.body;

        // Basic validation
        if (!name || !area || !location || !price_per_month || !total_spots || !available_spots) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, area, location, price, total spots, and available spots are required' 
            });
        }

        const sql = `
            INSERT INTO pgs (
                name, area, location, price_per_month, total_spots, available_spots,
                gender_preference, amenities, contact_number, description, is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        const result = await run(sql, [
            name, area, location, price_per_month, total_spots, available_spots,
            gender_preference, amenities, contact_number, description, is_active
        ]);

        res.status(201).json({
            success: true,
            message: 'PG added successfully',
            data: { id: result.lastID }
        });
    } catch (error) {
        console.error('Error adding PG:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Update PG
router.put('/pgs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            area,
            location,
            price_per_month,
            total_spots,
            available_spots,
            gender_preference,
            amenities,
            contact_number,
            description,
            is_active
        } = req.body;

        const sql = `
            UPDATE pgs 
            SET name = ?, area = ?, location = ?, price_per_month = ?, 
                total_spots = ?, available_spots = ?, gender_preference = ?, 
                amenities = ?, contact_number = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        const result = await run(sql, [
            name, area, location, price_per_month, total_spots, available_spots,
            gender_preference, amenities, contact_number, description, is_active, id
        ]);

        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'PG not found' });
        }

        res.json({
            success: true,
            message: 'PG updated successfully'
        });
    } catch (error) {
        console.error('Error updating PG:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Delete PG
router.delete('/pgs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const sql = 'DELETE FROM pgs WHERE id = ?';
        const result = await run(sql, [id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'PG not found' });
        }

        res.json({
            success: true,
            message: 'PG deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting PG:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Get property statistics
router.get('/stats', async (req, res) => {
    try {
        const hostelsSql = 'SELECT COUNT(*) as total_hostels, SUM(available_rooms) as total_available_rooms FROM hostels WHERE is_active = 1';
        const pgsSql = 'SELECT COUNT(*) as total_pgs, SUM(available_spots) as total_available_spots FROM pgs WHERE is_active = 1';
        
        const [hostelsStats, pgsStats] = await Promise.all([
            get(hostelsSql),
            get(pgsSql)
        ]);
        
        res.json({
            success: true,
            data: {
                hostels: hostelsStats,
                pgs: pgsStats
            }
        });
    } catch (error) {
        console.error('Error fetching property stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

module.exports = router;

