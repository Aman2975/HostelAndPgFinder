const express = require('express');
const Hostel = require('../models/Hostel');
const PG = require('../models/PG');
const { db } = require('../config/firebase');
const router = express.Router();

// Get all hostels for admin
router.get('/hostels', async (req, res) => {
    try {
        const hostels = await Hostel.getAll();
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
        const hostelData = req.body;
        if (!hostelData.name || !hostelData.area || !hostelData.location || !hostelData.price_per_month) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, area, location, and price are required'
            });
        }

        const newHostel = await Hostel.create(hostelData);
        res.status(201).json({
            success: true,
            message: 'Hostel added successfully',
            data: { id: newHostel.id, hostel: newHostel }
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
        const updateData = req.body;

        const updated = await Hostel.update(id, updateData);
        if (!updated) {
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
        const deleted = await Hostel.delete(id);

        if (!deleted) {
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

// Get all PGs for admin
router.get('/pgs', async (req, res) => {
    try {
        const pgs = await PG.getAll();
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
        const pgData = req.body;
        if (!pgData.name || !pgData.area || !pgData.location || !pgData.price_per_month) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, area, location, and price are required'
            });
        }

        const newPG = await PG.create(pgData);
        res.status(201).json({
            success: true,
            message: 'PG added successfully',
            data: { id: newPG.id, pg: newPG }
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
        const updateData = req.body;

        const updated = await PG.update(id, updateData);
        if (!updated) {
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
        const deleted = await PG.delete(id);

        if (!deleted) {
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
        const hostels = await Hostel.getAll();
        const pgs = await PG.getAll();

        const totalAvailableRooms = hostels.reduce((sum, h) => sum + Number(h.available_rooms || 0), 0);
        const totalAvailableSpots = pgs.reduce((sum, p) => sum + Number(p.available_spots || 0), 0);

        res.json({
            success: true,
            data: {
                hostels: {
                    total_hostels: hostels.length,
                    total_available_rooms: totalAvailableRooms
                },
                pgs: {
                    total_pgs: pgs.length,
                    total_available_spots: totalAvailableSpots
                }
            }
        });
    } catch (error) {
        console.error('Error fetching property stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

module.exports = router;
