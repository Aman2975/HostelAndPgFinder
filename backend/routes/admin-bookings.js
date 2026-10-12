const express = require('express');
const { db } = require('../config/firebase');
const router = express.Router();

// Get all bookings (combines PG bookings and Hostel Allotments)
router.get('/', async (req, res) => {
    try {
        const bookingsList = [];

        // Fetch PG Bookings from 'bookings' collection
        const pgSnap = await db.collection('bookings').get();
        pgSnap.forEach(doc => {
            const data = doc.data();
            bookingsList.push({
                id: doc.id,
                property_type: 'pg',
                status: (data.status || 'pending').toLowerCase(),
                created_at: data.created_at ? (data.created_at.toDate ? data.created_at.toDate().toISOString() : data.created_at) : new Date().toISOString(),
                student_name: data.student_name || data.studentName || 'Student',
                student_email: data.email || data.student_email || 'N/A',
                student_phone: data.contact || data.phone || 'N/A',
                property_name: data.property_name || data.pg_name || data.pgName || 'PG',
                property_area: data.property_area || data.area || 'City',
                price_per_month: data.price_per_month || data.price || '3500'
            });
        });

        // Fetch Hostel Allotments from 'hostel_allotments' collection
        const hostelSnap = await db.collection('hostel_allotments').get();
        hostelSnap.forEach(doc => {
            const data = doc.data();
            bookingsList.push({
                id: doc.id,
                property_type: 'hostel',
                status: (data.status || 'pending').toLowerCase(),
                created_at: data.created_at ? (data.created_at.toDate ? data.created_at.toDate().toISOString() : data.created_at) : new Date().toISOString(),
                student_name: data.studentName || data.student_name || 'Student',
                student_email: data.email || data.student_email || 'N/A',
                student_phone: data.contact || data.student_phone || 'N/A',
                property_name: data.hostelName || data.hostel_name || 'Hostel',
                property_area: data.hostelArea || data.hostel_area || 'Campus',
                price_per_month: data.hostelPrice || data.hostel_price || '3000'
            });
        });

        // Sort combined list by created_at descending
        bookingsList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json({
            success: true,
            data: bookingsList
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

        const collectionName = type === 'hostel' ? 'hostel_allotments' : 'bookings';
        const doc = await db.collection(collectionName).doc(id).get();

        if (!doc.exists) {
            // Try fallback in other collection if type not provided/matched
            const altCollection = type === 'hostel' ? 'bookings' : 'hostel_allotments';
            const altDoc = await db.collection(altCollection).doc(id).get();

            if (!altDoc.exists) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }

            return res.json({
                success: true,
                data: { id: altDoc.id, ...altDoc.data() }
            });
        }

        res.json({
            success: true,
            data: { id: doc.id, ...doc.data() }
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// Approve booking (PUT & POST supported)
const handleApprove = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;

        const collectionName = type === 'hostel' ? 'hostel_allotments' : 'bookings';
        const docRef = db.collection(collectionName).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        await docRef.update({
            status: 'approved',
            updated_at: new Date().toISOString()
        });

        // Update property spots/rooms
        const data = doc.data();
        if (type === 'hostel') {
            const hostelId = data.hostelId || data.hostel_id;
            if (hostelId) {
                const hostelRef = db.collection('hostels').doc(String(hostelId));
                const hostelDoc = await hostelRef.get();
                if (hostelDoc.exists) {
                    const available = Number(hostelDoc.data().available_rooms || 0);
                    await hostelRef.update({ available_rooms: Math.max(0, available - 1) });
                }
            }
        } else {
            const pgId = data.property_id || data.pg_id || data.pgId;
            if (pgId) {
                const pgRef = db.collection('pgs').doc(String(pgId));
                const pgDoc = await pgRef.get();
                if (pgDoc.exists) {
                    const available = Number(pgDoc.data().available_spots || 0);
                    await pgRef.update({ available_spots: Math.max(0, available - 1) });
                }
            }
        }

        res.json({
            success: true,
            message: 'Booking approved successfully'
        });
    } catch (error) {
        console.error('Error approving booking:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

router.put('/:id/approve', handleApprove);
router.post('/:id/approve', handleApprove);

// Reject booking
const handleReject = async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;
        const { reason } = req.body;

        const collectionName = type === 'hostel' ? 'hostel_allotments' : 'bookings';
        const docRef = db.collection(collectionName).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        await docRef.update({
            status: 'rejected',
            admin_notes: reason || 'Rejected by admin',
            updated_at: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Booking rejected successfully'
        });
    } catch (error) {
        console.error('Error rejecting booking:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

router.put('/:id/reject', handleReject);
router.post('/:id/reject', handleReject);

// Cancel booking
router.put('/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;
        const { type } = req.query;

        const collectionName = type === 'hostel' ? 'hostel_allotments' : 'bookings';
        const docRef = db.collection(collectionName).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        await docRef.update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
        });

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
        const hostelSnap = await db.collection('hostel_allotments').get();
        const pgSnap = await db.collection('bookings').get();

        let totalHostel = 0, pendingHostel = 0, approvedHostel = 0, rejectedHostel = 0;
        hostelSnap.forEach(doc => {
            totalHostel++;
            const s = (doc.data().status || 'pending').toLowerCase();
            if (s === 'pending') pendingHostel++;
            else if (s === 'approved') approvedHostel++;
            else if (s === 'rejected') rejectedHostel++;
        });

        let totalPG = 0, pendingPG = 0, approvedPG = 0, rejectedPG = 0;
        pgSnap.forEach(doc => {
            totalPG++;
            const s = (doc.data().status || 'pending').toLowerCase();
            if (s === 'pending') pendingPG++;
            else if (s === 'approved') approvedPG++;
            else if (s === 'rejected') rejectedPG++;
        });

        res.json({
            success: true,
            data: {
                total_hostel_bookings: totalHostel,
                pending_hostel_bookings: pendingHostel,
                approved_hostel_bookings: approvedHostel,
                rejected_hostel_bookings: rejectedHostel,
                total_pg_bookings: totalPG,
                pending_pg_bookings: pendingPG,
                approved_pg_bookings: approvedPG,
                rejected_pg_bookings: rejectedPG
            }
        });
    } catch (error) {
        console.error('Error fetching booking stats:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

module.exports = router;
