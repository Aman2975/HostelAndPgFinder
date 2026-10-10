const express = require('express');
const { query, get, run } = require('../config/sqlite-database');
const router = express.Router();

// Get all bookings (hostel and PG)
router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT * FROM (
                SELECT 
                    'hostel' as property_type,
                    ha.id,
                    ha.status,
                    ha.created_at,
                    s.name as student_name,
                    s.email as student_email,
                    h.name as property_name,
                    h.area as property_area,
                    h.price_per_month
                FROM hostel_allotments ha
                JOIN students s ON ha.student_id = s.student_id
                JOIN hostels h ON ha.hostel_id = h.id
                
                UNION ALL
                
                SELECT 
                    'pg' as property_type,
                    pb.id,
                    pb.status,
                    pb.created_at,
                    s.name as student_name,
                    s.email as student_email,
                    p.name as property_name,
                    p.area as property_area,
                    p.price_per_month
                FROM pg_bookings pb
                JOIN students s ON pb.student_id = s.student_id
                JOIN pgs p ON pb.pg_id = p.id
            ) ORDER BY created_at DESC
        `;
        
        const bookings = await query(sql);
        
        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query; // 'hostel' or 'pg'
        
        let sql, params;
        
        if (type === 'hostel') {
            sql = `
                SELECT 
                    ha.*,
                    s.name as student_name,
                    s.email as student_email,
                    s.phone as student_phone,
                    h.name as property_name,
                    h.area as property_area,
                    h.price_per_month,
                    h.amenities
                FROM hostel_allotments ha
                JOIN students s ON ha.student_id = s.student_id
                JOIN hostels h ON ha.hostel_id = h.id
                WHERE ha.id = ?
            `;
        } else {
            sql = `
                SELECT 
                    pb.*,
                    s.name as student_name,
                    s.email as student_email,
                    s.phone as student_phone,
                    p.name as property_name,
                    p.area as property_area,
                    p.price_per_month,
                    p.amenities
                FROM pg_bookings pb
                JOIN students s ON pb.student_id = s.student_id
                JOIN pgs p ON pb.pg_id = p.id
                WHERE pb.id = ?
            `;
        }
        
        const booking = await get(sql, [id]);
        
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Approve booking
router.put('/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query; // 'hostel' or 'pg'
        
        let updateSql, availabilitySql, propertyId;
        
        if (type === 'hostel') {
            updateSql = 'UPDATE hostel_allotments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            
            // Get hostel ID for availability update
            const hostelSql = 'SELECT hostel_id FROM hostel_allotments WHERE id = ?';
            const allotment = await get(hostelSql, [id]);
            if (allotment) {
                propertyId = allotment.hostel_id;
                availabilitySql = 'UPDATE hostels SET available_rooms = available_rooms - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            }
        } else {
            updateSql = 'UPDATE pg_bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            
            // Get PG ID for availability update
            const pgSql = 'SELECT pg_id FROM pg_bookings WHERE id = ?';
            const booking = await get(pgSql, [id]);
            if (booking) {
                propertyId = booking.pg_id;
                availabilitySql = 'UPDATE pgs SET available_spots = available_spots - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            }
        }
        
        const result = await run(updateSql, ['approved', id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        // Update property availability
        if (availabilitySql && propertyId) {
            await run(availabilitySql, [propertyId]);
        }
        
        res.json({
            success: true,
            message: 'Booking approved successfully'
        });
    } catch (error) {
        console.error('Error approving booking:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Reject booking
router.put('/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query; // 'hostel' or 'pg'
        const { reason } = req.body;
        
        let updateSql;
        
        if (type === 'hostel') {
            updateSql = 'UPDATE hostel_allotments SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        } else {
            updateSql = 'UPDATE pg_bookings SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        }
        
        const result = await run(updateSql, ['rejected', reason || 'Rejected by admin', id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        res.json({
            success: true,
            message: 'Booking rejected successfully'
        });
    } catch (error) {
        console.error('Error rejecting booking:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Cancel booking
router.put('/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query; // 'hostel' or 'pg'
        
        let updateSql, availabilitySql, propertyId;
        
        if (type === 'hostel') {
            updateSql = 'UPDATE hostel_allotments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            
            // Get hostel ID for availability update
            const hostelSql = 'SELECT hostel_id FROM hostel_allotments WHERE id = ?';
            const allotment = await get(hostelSql, [id]);
            if (allotment) {
                propertyId = allotment.hostel_id;
                availabilitySql = 'UPDATE hostels SET available_rooms = available_rooms + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            }
        } else {
            updateSql = 'UPDATE pg_bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            
            // Get PG ID for availability update
            const pgSql = 'SELECT pg_id FROM pg_bookings WHERE id = ?';
            const booking = await get(pgSql, [id]);
            if (booking) {
                propertyId = booking.pg_id;
                availabilitySql = 'UPDATE pgs SET available_spots = available_spots + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            }
        }
        
        const result = await run(updateSql, ['cancelled', id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        
        // Update property availability
        if (availabilitySql && propertyId) {
            await run(availabilitySql, [propertyId]);
        }
        
        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Get booking statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const statsSql = `
            SELECT 
                (SELECT COUNT(*) FROM hostel_allotments) as total_hostel_bookings,
                (SELECT COUNT(*) FROM hostel_allotments WHERE status = 'pending') as pending_hostel_bookings,
                (SELECT COUNT(*) FROM hostel_allotments WHERE status = 'approved') as approved_hostel_bookings,
                (SELECT COUNT(*) FROM hostel_allotments WHERE status = 'rejected') as rejected_hostel_bookings,
                (SELECT COUNT(*) FROM pg_bookings) as total_pg_bookings,
                (SELECT COUNT(*) FROM pg_bookings WHERE status = 'pending') as pending_pg_bookings,
                (SELECT COUNT(*) FROM pg_bookings WHERE status = 'approved') as approved_pg_bookings,
                (SELECT COUNT(*) FROM pg_bookings WHERE status = 'rejected') as rejected_pg_bookings
        `;
        const stats = await get(statsSql);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching booking stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

module.exports = router;

