const express = require('express');
const { query, get, run } = require('../config/sqlite-database');
const router = express.Router();

// Get all students
router.get('/', async (req, res) => {
    try {
        console.log('Admin students route called - fetching from database...');
        const sql = `
            SELECT id, student_id, name, email, phone, course, academic_year, 
                   gender, university, created_at, updated_at
            FROM students 
            ORDER BY created_at DESC
        `;
        const students = await query(sql);
        console.log(`Found ${students.length} students in database`);
        
        res.json({
            success: true,
            data: { students: students },
            count: students.length
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Get student by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const sql = 'SELECT * FROM students WHERE id = ?';
        const student = await get(sql, [id]);
        
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        
        // Remove password from response
        const { password, ...studentData } = student;
        
        res.json({
            success: true,
            data: studentData
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Update student
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            email,
            phone,
            course,
            academic_year,
            gender,
            university
        } = req.body;

        const sql = `
            UPDATE students 
            SET name = ?, email = ?, phone = ?, course = ?, 
                academic_year = ?, gender = ?, university = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        const result = await run(sql, [
            name, email, phone, course, academic_year, gender, university, id
        ]);

        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({
            success: true,
            message: 'Student updated successfully'
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Delete student
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if student has any bookings or allotments
        const bookingsSql = 'SELECT COUNT(*) as count FROM pg_bookings WHERE student_id = (SELECT student_id FROM students WHERE id = ?)';
        const allotmentsSql = 'SELECT COUNT(*) as count FROM hostel_allotments WHERE student_id = (SELECT student_id FROM students WHERE id = ?)';
        
        const [bookings, allotments] = await Promise.all([
            get(bookingsSql, [id]),
            get(allotmentsSql, [id])
        ]);
        
        if (bookings.count > 0 || allotments.count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete student with existing bookings or allotments' 
            });
        }
        
        const sql = 'DELETE FROM students WHERE id = ?';
        const result = await run(sql, [id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Get student statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const statsSql = `
            SELECT 
                COUNT(*) as total_students,
                COUNT(CASE WHEN course = 'Computer Science' THEN 1 END) as cs_students,
                COUNT(CASE WHEN course = 'Engineering' THEN 1 END) as engineering_students,
                COUNT(CASE WHEN academic_year = '1st Year' THEN 1 END) as first_year,
                COUNT(CASE WHEN academic_year = '2nd Year' THEN 1 END) as second_year,
                COUNT(CASE WHEN academic_year = '3rd Year' THEN 1 END) as third_year,
                COUNT(CASE WHEN academic_year = '4th Year' THEN 1 END) as fourth_year
            FROM students
        `;
        const stats = await get(statsSql);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching student stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Get student's booking history
router.get('/:id/bookings', async (req, res) => {
    try {
        const { id } = req.params;
        
        const sql = `
            SELECT 
                'hostel' as type,
                ha.id,
                ha.status,
                ha.created_at,
                h.name as property_name,
                h.area,
                h.price_per_month
            FROM hostel_allotments ha
            JOIN hostels h ON ha.hostel_id = h.id
            WHERE ha.student_id = (SELECT student_id FROM students WHERE id = ?)
            
            UNION ALL
            
            SELECT 
                'pg' as type,
                pb.id,
                pb.status,
                pb.created_at,
                p.name as property_name,
                p.area,
                p.price_per_month
            FROM pg_bookings pb
            JOIN pgs p ON pb.pg_id = p.id
            WHERE pb.student_id = (SELECT student_id FROM students WHERE id = ?)
            
            ORDER BY created_at DESC
        `;
        
        const bookings = await query(sql, [id, id]);
        
        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Error fetching student bookings:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

module.exports = router;
