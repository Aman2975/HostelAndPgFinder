const express = require('express');
const { query, get, run } = require('../config/sqlite-database');
const router = express.Router();

// Get all allotment requests
router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT 
                ha.*,
                s.name as student_name,
                s.email as student_email,
                s.phone as student_phone,
                h.name as hostel_name,
                h.area as hostel_area,
                h.price_per_month as hostel_price,
                h.available_rooms as hostel_available_rooms
            FROM hostel_allotments ha
            LEFT JOIN students s ON ha.student_id = s.student_id
            LEFT JOIN hostels h ON ha.hostel_id = h.id
            ORDER BY ha.created_at DESC
        `;
        const allotments = await query(sql);
        
        res.json({
            success: true,
            data: { allotments: allotments }
        });
    } catch (error) {
        console.error('Error fetching allotments:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Get allotment by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT 
                ha.*,
                s.name as student_name,
                s.email as student_email,
                s.phone as student_phone,
                s.course,
                s.academic_year,
                h.name as hostel_name,
                h.area as hostel_area,
                h.price_per_month as hostel_price,
                h.available_rooms as hostel_available_rooms,
                h.amenities as hostel_amenities
            FROM hostel_allotments ha
            LEFT JOIN students s ON ha.student_id = s.student_id
            LEFT JOIN hostels h ON ha.hostel_id = h.id
            WHERE ha.id = ?
        `;
        const allotment = await get(sql, [id]);
        
        if (!allotment) {
            return res.status(404).json({ success: false, message: 'Allotment not found' });
        }
        
        res.json({
            success: true,
            data: allotment
        });
    } catch (error) {
        console.error('Error fetching allotment:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Approve allotment
router.put('/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Update allotment status
        const updateSql = `
            UPDATE hostel_allotments 
            SET status = 'approved', updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const result = await run(updateSql, [id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Allotment not found' });
        }
        
        // Get allotment details to update hostel availability
        const allotmentSql = 'SELECT * FROM hostel_allotments WHERE id = ?';
        const allotment = await get(allotmentSql, [id]);
        
        if (allotment) {
            // Decrease available rooms in hostel
            const updateHostelSql = `
                UPDATE hostels 
                SET available_rooms = available_rooms - 1, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            await run(updateHostelSql, [allotment.hostel_id]);
        }
        
        res.json({
            success: true,
            message: 'Allotment approved successfully'
        });
    } catch (error) {
        console.error('Error approving allotment:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Reject allotment
router.put('/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        const updateSql = `
            UPDATE hostel_allotments 
            SET status = 'rejected', admin_notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const result = await run(updateSql, [reason || 'Rejected by admin', id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Allotment not found' });
        }
        
        res.json({
            success: true,
            message: 'Allotment rejected successfully'
        });
    } catch (error) {
        console.error('Error rejecting allotment:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Get allotment statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const statsSql = `
            SELECT 
                COUNT(*) as total_allotments,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_allotments,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_allotments,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_allotments
            FROM hostel_allotments
        `;
        const stats = await get(statsSql);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching allotment stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

module.exports = router;
