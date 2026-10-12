const { db } = require('./config/firebase');

async function seedFirebaseData() {
    console.log('🌱 Checking Firestore collections...');

    try {
        // Check hostels
        const hostelsSnap = await db.collection('hostels').get();
        if (hostelsSnap.size < 3) {
            console.log('📦 Seeding default hostels into Firestore...');
            const hostels = [
                {
                    name: 'University Hostel A',
                    area: 'Campus',
                    location: 'Near University Gate',
                    available_rooms: 15,
                    total_rooms: 50,
                    price_per_month: '5000',
                    amenities: 'WiFi, Laundry, Mess, Security',
                    contact_number: '9876543210',
                    description: 'Modern hostel with all amenities',
                    is_active: 1,
                    created_at: new Date().toISOString()
                },
                {
                    name: 'Green Valley Hostel',
                    area: 'Phase 1',
                    location: 'Phase 1',
                    available_rooms: 8,
                    total_rooms: 25,
                    price_per_month: '4500',
                    amenities: 'WiFi, Laundry, Parking',
                    contact_number: '9876543211',
                    description: 'Peaceful environment near market',
                    is_active: 1,
                    created_at: new Date().toISOString()
                },
                {
                    name: 'City Center Hostel',
                    area: 'Phase 2',
                    location: 'Near Bus Stand',
                    available_rooms: 12,
                    total_rooms: 30,
                    price_per_month: '4000',
                    amenities: 'WiFi, Laundry, Common Room',
                    contact_number: '9876543212',
                    description: 'Convenient location for students',
                    is_active: 1,
                    created_at: new Date().toISOString()
                }
            ];

            for (const hostel of hostels) {
                await db.collection('hostels').add(hostel);
            }
            console.log('✅ Hostels seeded successfully.');
        } else {
            console.log(`✅ Hostels collection already has ${hostelsSnap.size} documents.`);
        }

        // Check PGs
        const pgsSnap = await db.collection('pgs').get();
        if (pgsSnap.size < 3) {
            console.log('📦 Seeding default PGs into Firestore...');
            const pgs = [
                {
                    name: 'Sunshine PG',
                    area: 'Bhadurgarh',
                    location: 'Bhadurgarh',
                    available_spots: 5,
                    total_spots: 15,
                    price_per_month: '3500',
                    gender_preference: 'Both',
                    amenities: 'WiFi, Laundry, Kitchen',
                    contact_number: '9876543213',
                    description: 'Cozy PG with home-like atmosphere',
                    is_active: 1,
                    created_at: new Date().toISOString()
                },
                {
                    name: 'Modern PG',
                    area: 'Phase 1',
                    location: 'Phase 1',
                    available_spots: 3,
                    total_spots: 10,
                    price_per_month: '4000',
                    gender_preference: 'Male',
                    amenities: 'WiFi, Laundry, Gym',
                    contact_number: '9876543214',
                    description: 'Modern facilities for working professionals',
                    is_active: 1,
                    created_at: new Date().toISOString()
                },
                {
                    name: 'Green PG',
                    area: 'Phase 2',
                    location: 'Phase 2',
                    available_spots: 4,
                    total_spots: 12,
                    price_per_month: '3200',
                    gender_preference: 'Female',
                    amenities: 'WiFi, Laundry, Security',
                    contact_number: '9876543215',
                    description: 'Safe and secure for female students',
                    is_active: 1,
                    created_at: new Date().toISOString()
                },
                {
                    name: 'Campus PG',
                    area: 'Near PUP',
                    location: 'Near PUP',
                    available_spots: 6,
                    total_spots: 20,
                    price_per_month: '3800',
                    gender_preference: 'Both',
                    amenities: 'WiFi, Laundry, Study Room',
                    contact_number: '9876543216',
                    description: 'Close to university campus',
                    is_active: 1,
                    created_at: new Date().toISOString()
                }
            ];

            for (const pg of pgs) {
                await db.collection('pgs').add(pg);
            }
            console.log('✅ PGs seeded successfully.');
        } else {
            console.log(`✅ PGs collection already has ${pgsSnap.size} documents.`);
        }

    } catch (error) {
        console.error('❌ Error seeding Firestore data:', error);
    }
}

seedFirebaseData();
