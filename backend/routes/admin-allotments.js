const express = require('express');
const { db } = require('../config/firebase');
const router = express.Router();

// Helper to normalize Firestore doc to allotment object
function formatAllotment(doc) {
    const data = doc.data();
    const status = (data.status || 'pending').toLowerCase();

    return {
        id: doc.id,
        ...data,
        student_id: data.studentId || data.student_id || 'N/A',
        student_name: data.studentName || data.student_name || 'Unknown Student',
        student_email: data.email || data.student_email || 'N/A',
        student_phone: data.contact || data.student_phone || data.phone || 'N/A',
        hostel_id: data.hostelId || data.hostel_id || '',
        hostel_name: data.hostelName || data.hostel_name || 'Unknown Hostel',
        hostel_area: data.hostelArea || data.hostel_area || data.area || 'Campus',
        hostel_price: data.hostelPrice || data.hostel_price || data.price || '3000',
        room_type: data.roomType || data.room_type || 'Single',
        duration: data.duration || '1 Year',
        course: data.course || '',
        academic_year: data.academicYear || data.academic_year || '',
        special_requirements: data.specialRequirements || data.special_requirements || '',
        emergency_contact: data.emergencyContact || data.emergency_contact || '',
        emergency_relation: data.emergencyRelation || data.emergency_relation || '',
        status: status,
        created_at: data.created_at || new Date().toISOString()
    };
}

// Get all allotment requests
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('hostel_allotments').get();
        const allotments = [];
        
        snapshot.forEach(doc => {
            allotments.push(formatAllotment(doc));
        });

        // Sort by created_at descending
        allotments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json({
            success: true,
            data: { allotments }
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
        const doc = await db.collection('hostel_allotments').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Allotment not found' });
        }

        res.json({
            success: true,
            data: formatAllotment(doc)
        });
    } catch (error) {
        console.error('Error fetching allotment:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Approve allotment (PUT & POST supported)
const handleApprove = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('hostel_allotments').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Allotment not found' });
        }

        await docRef.update({
            status: 'approved',
            updated_at: new Date().toISOString()
        });

        const allotmentData = doc.data();
        const hostelId = allotmentData.hostelId || allotmentData.hostel_id;
        if (hostelId) {
            const hostelRef = db.collection('hostels').doc(String(hostelId));
            const hostelDoc = await hostelRef.get();
            if (hostelDoc.exists) {
                const available = Number(hostelDoc.data().available_rooms || 0);
                await hostelRef.update({
                    available_rooms: Math.max(0, available - 1),
                    updated_at: new Date().toISOString()
                });
            }
        }

        res.json({
            success: true,
            message: 'Allotment approved successfully'
        });
    } catch (error) {
        console.error('Error approving allotment:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

router.put('/:id/approve', handleApprove);
router.post('/:id/approve', handleApprove);

// Reject allotment (PUT & POST supported)
const handleReject = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const docRef = db.collection('hostel_allotments').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Allotment not found' });
        }

        await docRef.update({
            status: 'rejected',
            admin_notes: reason || 'Rejected by admin',
            updated_at: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Allotment rejected successfully'
        });
    } catch (error) {
        console.error('Error rejecting allotment:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

router.put('/:id/reject', handleReject);
router.post('/:id/reject', handleReject);

// Get allotment statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const snapshot = await db.collection('hostel_allotments').get();
        let total = 0, pending = 0, approved = 0, rejected = 0;

        snapshot.forEach(doc => {
            total++;
            const status = (doc.data().status || 'pending').toLowerCase();
            if (status === 'pending') pending++;
            else if (status === 'approved') approved++;
            else if (status === 'rejected') rejected++;
        });

        res.json({
            success: true,
            data: {
                total_allotments: total,
                pending_allotments: pending,
                approved_allotments: approved,
                rejected_allotments: rejected
            }
        });
    } catch (error) {
        console.error('Error fetching allotment stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

module.exports = router;
