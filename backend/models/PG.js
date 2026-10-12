const { db } = require('../config/firebase');

class PG {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.area = data.area;
        this.location = data.location;
        this.available_spots = data.available_spots;
        this.total_spots = data.total_spots;
        this.price_per_month = data.price_per_month;
        this.gender_preference = data.gender_preference;
        this.amenities = data.amenities;
        this.contact_number = data.contact_number;
        this.description = data.description;
        this.image_url = data.image_url;
        this.is_active = data.is_active;
    }

    // Get all PGs
    static async getAll(filters = {}) {
        try {
            const snapshot = await db.collection('pgs').get();
            let pgs = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.is_active !== 0 && data.is_active !== false) {
                    pgs.push({
                        id: doc.id,
                        ...data,
                        available_spots: Number(data.available_spots || 0),
                        total_spots: Number(data.total_spots || 0),
                        price_per_month: data.price_per_month !== undefined ? String(data.price_per_month) : "0"
                    });
                }
            });

            if (filters.area) {
                pgs = pgs.filter(p => p.area && p.area.toLowerCase() === filters.area.toLowerCase());
            }

            if (filters.gender) {
                pgs = pgs.filter(p => p.gender_preference && (p.gender_preference.toLowerCase() === filters.gender.toLowerCase() || p.gender_preference.toLowerCase() === 'unisex' || p.gender_preference.toLowerCase() === 'both'));
            }

            if (filters.min_price !== undefined) {
                pgs = pgs.filter(p => parseFloat(p.price_per_month || 0) >= filters.min_price);
            }

            if (filters.max_price !== undefined) {
                pgs = pgs.filter(p => parseFloat(p.price_per_month || 0) <= filters.max_price);
            }

            if (filters.available_spots) {
                pgs = pgs.filter(p => Number(p.available_spots || 0) > 0);
            }

            return pgs;
        } catch (error) {
            throw new Error(`Error getting PGs: ${error.message}`);
        }
    }

    // Get PG by ID
    static async getById(id) {
        try {
            const doc = await db.collection('pgs').doc(String(id)).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }

            const snapshot = await db.collection('pgs').get();
            let found = null;
            snapshot.forEach(d => {
                const data = d.data();
                if (d.id === String(id) || String(data.id) === String(id)) {
                    found = { id: d.id, ...data };
                }
            });
            return found;
        } catch (error) {
            throw new Error(`Error getting PG: ${error.message}`);
        }
    }

    // Get PGs by area
    static async getByArea(area) {
        try {
            return await this.getAll({ area });
        } catch (error) {
            throw new Error(`Error getting PGs by area: ${error.message}`);
        }
    }

    // Create new PG
    static async create(pgData) {
        try {
            const dataToSave = {
                name: pgData.name || '',
                area: pgData.area || '',
                location: pgData.location || '',
                available_spots: Number(pgData.available_spots || 0),
                total_spots: Number(pgData.total_spots || 0),
                price_per_month: String(pgData.price_per_month || 0),
                gender_preference: pgData.gender_preference || 'Both',
                amenities: pgData.amenities || '',
                contact_number: pgData.contact_number || '',
                description: pgData.description || '',
                image_url: pgData.image_url || '',
                is_active: pgData.is_active !== undefined ? pgData.is_active : 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const docRef = await db.collection('pgs').add(dataToSave);
            return { id: docRef.id, ...dataToSave };
        } catch (error) {
            throw new Error(`Error creating PG: ${error.message}`);
        }
    }

    // Update PG
    static async update(id, updateData) {
        try {
            const pg = await this.getById(id);
            if (!pg) return false;

            const docRef = db.collection('pgs').doc(pg.id);
            const dataToUpdate = {
                ...updateData,
                updated_at: new Date().toISOString()
            };

            if (dataToUpdate.available_spots !== undefined) dataToUpdate.available_spots = Number(dataToUpdate.available_spots);
            if (dataToUpdate.total_spots !== undefined) dataToUpdate.total_spots = Number(dataToUpdate.total_spots);
            if (dataToUpdate.price_per_month !== undefined) dataToUpdate.price_per_month = String(dataToUpdate.price_per_month);

            await docRef.update(dataToUpdate);
            return true;
        } catch (error) {
            throw new Error(`Error updating PG: ${error.message}`);
        }
    }

    // Delete PG
    static async delete(id) {
        try {
            const pg = await this.getById(id);
            if (!pg) return false;

            await db.collection('pgs').doc(pg.id).update({
                is_active: 0,
                updated_at: new Date().toISOString()
            });
            return true;
        } catch (error) {
            throw new Error(`Error deleting PG: ${error.message}`);
        }
    }

    // Search PGs
    static async search(searchTerm, filters = {}) {
        try {
            const pgs = await this.getAll(filters);
            const term = searchTerm.toLowerCase();
            return pgs.filter(p =>
                (p.name && p.name.toLowerCase().includes(term)) ||
                (p.location && p.location.toLowerCase().includes(term)) ||
                (p.area && p.area.toLowerCase().includes(term)) ||
                (p.description && p.description.toLowerCase().includes(term))
            );
        } catch (error) {
            throw new Error(`Error searching PGs: ${error.message}`);
        }
    }

    // Get available areas
    static async getAreas() {
        try {
            const pgs = await this.getAll();
            const areas = [...new Set(pgs.map(p => p.area).filter(Boolean))];
            return areas.sort();
        } catch (error) {
            throw new Error(`Error getting areas: ${error.message}`);
        }
    }

    // Get gender preferences
    static async getGenderPreferences() {
        try {
            const pgs = await this.getAll();
            const prefs = [...new Set(pgs.map(p => p.gender_preference).filter(Boolean))];
            return prefs.sort();
        } catch (error) {
            throw new Error(`Error getting gender preferences: ${error.message}`);
        }
    }
}

module.exports = PG;
