const { db } = require('../config/firebase');

class Hostel {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.location = data.location;
        this.area = data.area;
        this.available_rooms = data.available_rooms;
        this.total_rooms = data.total_rooms;
        this.price_per_month = data.price_per_month;
        this.amenities = data.amenities;
        this.contact_number = data.contact_number;
        this.description = data.description;
        this.image_url = data.image_url;
        this.is_active = data.is_active;
    }

    // Get all hostels
    static async getAll(filters = {}) {
        try {
            const snapshot = await db.collection('hostels').get();
            let hostels = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.is_active !== 0 && data.is_active !== false) {
                    hostels.push({
                        id: doc.id,
                        ...data,
                        available_rooms: Number(data.available_rooms || 0),
                        total_rooms: Number(data.total_rooms || 0),
                        price_per_month: data.price_per_month !== undefined ? String(data.price_per_month) : "0"
                    });
                }
            });

            // Apply filters
            if (filters.area) {
                hostels = hostels.filter(h => h.area && h.area.toLowerCase() === filters.area.toLowerCase());
            }

            if (filters.min_price !== undefined) {
                hostels = hostels.filter(h => parseFloat(h.price_per_month || 0) >= filters.min_price);
            }

            if (filters.max_price !== undefined) {
                hostels = hostels.filter(h => parseFloat(h.price_per_month || 0) <= filters.max_price);
            }

            if (filters.available_rooms) {
                hostels = hostels.filter(h => Number(h.available_rooms || 0) > 0);
            }

            return hostels;
        } catch (error) {
            throw new Error(`Error getting hostels: ${error.message}`);
        }
    }

    // Get hostel by ID
    static async getById(id) {
        try {
            // First try direct document ID
            const doc = await db.collection('hostels').doc(String(id)).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }

            // Fallback: search all hostels
            const snapshot = await db.collection('hostels').get();
            let found = null;
            snapshot.forEach(d => {
                const data = d.data();
                if (d.id === String(id) || String(data.id) === String(id)) {
                    found = { id: d.id, ...data };
                }
            });
            return found;
        } catch (error) {
            throw new Error(`Error getting hostel: ${error.message}`);
        }
    }

    // Get hostels by area
    static async getByArea(area) {
        try {
            return await this.getAll({ area });
        } catch (error) {
            throw new Error(`Error getting hostels by area: ${error.message}`);
        }
    }

    // Create new hostel
    static async create(hostelData) {
        try {
            const dataToSave = {
                name: hostelData.name || '',
                location: hostelData.location || '',
                area: hostelData.area || '',
                available_rooms: Number(hostelData.available_rooms || 0),
                total_rooms: Number(hostelData.total_rooms || 0),
                price_per_month: String(hostelData.price_per_month || 0),
                amenities: hostelData.amenities || '',
                contact_number: hostelData.contact_number || '',
                description: hostelData.description || '',
                is_active: hostelData.is_active !== undefined ? hostelData.is_active : 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const docRef = await db.collection('hostels').add(dataToSave);
            return { id: docRef.id, ...dataToSave };
        } catch (error) {
            throw new Error(`Error creating hostel: ${error.message}`);
        }
    }

    // Update hostel
    static async update(id, updateData) {
        try {
            const hostel = await this.getById(id);
            if (!hostel) return false;

            const docRef = db.collection('hostels').doc(hostel.id);
            const dataToUpdate = {
                ...updateData,
                updated_at: new Date().toISOString()
            };

            if (dataToUpdate.available_rooms !== undefined) dataToUpdate.available_rooms = Number(dataToUpdate.available_rooms);
            if (dataToUpdate.total_rooms !== undefined) dataToUpdate.total_rooms = Number(dataToUpdate.total_rooms);
            if (dataToUpdate.price_per_month !== undefined) dataToUpdate.price_per_month = String(dataToUpdate.price_per_month);

            await docRef.update(dataToUpdate);
            return true;
        } catch (error) {
            throw new Error(`Error updating hostel: ${error.message}`);
        }
    }

    // Delete hostel (soft delete)
    static async delete(id) {
        try {
            const hostel = await this.getById(id);
            if (!hostel) return false;

            await db.collection('hostels').doc(hostel.id).update({
                is_active: 0,
                updated_at: new Date().toISOString()
            });
            return true;
        } catch (error) {
            throw new Error(`Error deleting hostel: ${error.message}`);
        }
    }

    // Search hostels
    static async search(searchTerm, filters = {}) {
        try {
            const hostels = await this.getAll(filters);
            const term = searchTerm.toLowerCase();
            return hostels.filter(h =>
                (h.name && h.name.toLowerCase().includes(term)) ||
                (h.location && h.location.toLowerCase().includes(term)) ||
                (h.area && h.area.toLowerCase().includes(term)) ||
                (h.description && h.description.toLowerCase().includes(term))
            );
        } catch (error) {
            throw new Error(`Error searching hostels: ${error.message}`);
        }
    }

    // Get available areas
    static async getAreas() {
        try {
            const hostels = await this.getAll();
            const areas = [...new Set(hostels.map(h => h.area).filter(Boolean))];
            return areas.sort();
        } catch (error) {
            throw new Error(`Error getting areas: ${error.message}`);
        }
    }
}

module.exports = Hostel;
