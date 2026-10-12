const express = require('express');
const { db } = require('../config/firebase');
const router = express.Router();

// Helper function to format user doc
function formatStudent(doc) {
    const data = doc.data();
    return {
        id: doc.id,
        student_id: data.studentId || data.student_id || 'N/A',
        name: data.name || data.fullName || 'Unknown Student',
        email: data.email || 'N/A',
        phone: data.phone || data.contact || 'N/A',
        course: data.course || 'N/A',
        academic_year: data.academicYear || data.academic_year || 'N/A',
        gender: data.gender || 'N/A',
        university: data.university || 'N/A',
        created_at: data.created_at ? (data.created_at.toDate ? data.created_at.toDate().toISOString() : data.created_at) : new Date().toISOString()
    };
}

// Get all students
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        const students = [];

        snapshot.forEach(doc => {
            students.push(formatStudent(doc));
        });

        // Sort by created_at descending
        students.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json({
            success: true,
            data: { students },
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
        const doc = await db.collection('users').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({
            success: true,
            data: formatStudent(doc)
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
        const updateData = req.body;

        const docRef = db.collection('users').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        await docRef.update({
            ...updateData,
            updated_at: new Date().toISOString()
        });

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
        const docRef = db.collection('users').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        await docRef.delete();

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
        const snapshot = await db.collection('users').get();
        let total = 0, cs = 0, eng = 0, y1 = 0, y2 = 0, y3 = 0, y4 = 0;

        snapshot.forEach(doc => {
            total++;
            const data = doc.data();
            const course = (data.course || '').toLowerCase();
            if (course.includes('computer') || course.includes('cs')) cs++;
            else if (course.includes('engineer')) eng++;

            const year = (data.academicYear || data.academic_year || '').toLowerCase();
            if (year.includes('1st') || year.includes('first')) y1++;
            else if (year.includes('2nd') || year.includes('second')) y2++;
            else if (year.includes('3rd') || year.includes('third')) y3++;
            else if (year.includes('4th') || year.includes('fourth')) y4++;
        });

        res.json({
            success: true,
            data: {
                total_students: total,
                cs_students: cs,
                engineering_students: eng,
                first_year: y1,
                second_year: y2,
                third_year: y3,
                fourth_year: y4
            }
        });
    } catch (error) {
        console.error('Error fetching student stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

module.exports = router;
