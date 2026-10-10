const { query, get, run } = require('../config/sqlite-database');

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
            let sqlQuery = 'SELECT * FROM pgs WHERE is_active = 1';
            const values = [];

            // Apply filters
            if (filters.area) {
                sqlQuery += ' AND area = ?';
                values.push(filters.area);
            }

            if (filters.gender) {
                sqlQuery += ' AND (gender_preference = ? OR gender_preference = "Unisex")';
                values.push(filters.gender);
            }

            if (filters.min_price) {
                sqlQuery += ' AND price_per_month >= ?';
                values.push(filters.min_price);
            }

            if (filters.max_price) {
                sqlQuery += ' AND price_per_month <= ?';
                values.push(filters.max_price);
            }

            if (filters.available_spots) {
                sqlQuery += ' AND available_spots > 0';
            }

            sqlQuery += ' ORDER BY created_at DESC';

            const rows = await query(sqlQuery, values);
            return rows;
        } catch (error) {
            throw new Error(`Error getting PGs: ${error.message}`);
        }
    }

    // Get PG by ID
    static async getById(id) {
        try {
            const sqlQuery = 'SELECT * FROM pgs WHERE id = ?';
            const row = await get(sqlQuery, [id]);
            return row || null;
        } catch (error) {
            throw new Error(`Error getting PG: ${error.message}`);
        }
    }

    // Get PGs by area
    static async getByArea(area) {
        try {
            const sqlQuery = 'SELECT * FROM pgs WHERE area = ? AND is_active = 1 ORDER BY created_at DESC';
            const rows = await query(sqlQuery, [area]);
            return rows;
        } catch (error) {
            throw new Error(`Error getting PGs by area: ${error.message}`);
        }
    }

    // Create new PG
    static async create(pgData) {
        try {
            const sqlQuery = `
                INSERT INTO pgs (name, area, location, available_spots, total_spots, 
                               price_per_month, gender_preference, amenities, contact_number, description, image_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                pgData.name,
                pgData.area,
                pgData.location,
                pgData.available_spots || 0,
                pgData.total_spots || 0,
                pgData.price_per_month,
                pgData.gender_preference || 'Unisex',
                pgData.amenities,
                pgData.contact_number,
                pgData.description,
                pgData.image_url
            ];

            const result = await run(sqlQuery, values);
            return { id: result.insertId, ...pgData };
        } catch (error) {
            throw new Error(`Error creating PG: ${error.message}`);
        }
    }

    // Update PG
    static async update(id, updateData) {
        try {
            const allowedFields = [
                'name', 'area', 'location', 'available_spots', 'total_spots',
                'price_per_month', 'gender_preference', 'amenities', 
                'contact_number', 'description', 'image_url'
            ];
            
            const updateFields = [];
            const values = [];

            for (const [key, value] of Object.entries(updateData)) {
                if (allowedFields.includes(key) && value !== undefined) {
                    updateFields.push(`${key} = ?`);
                    values.push(value);
                }
            }

            if (updateFields.length === 0) {
                throw new Error('No valid fields to update');
            }

            values.push(id);
            const sqlQuery = `UPDATE pgs SET ${updateFields.join(', ')}, updated_at = datetime('now') WHERE id = ?`;
            
            const result = await run(sqlQuery, values);
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Error updating PG: ${error.message}`);
        }
    }

    // Delete PG (soft delete)
    static async delete(id) {
        try {
            const sqlQuery = 'UPDATE pgs SET is_active = 0 WHERE id = ?';
            const result = await run(sqlQuery, [id]);
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Error deleting PG: ${error.message}`);
        }
    }

    // Search PGs
    static async search(searchTerm, filters = {}) {
        try {
            let sqlQuery = `
                SELECT * FROM pgs 
                WHERE is_active = 1 
                AND (name LIKE ? OR location LIKE ? OR area LIKE ? OR description LIKE ?)
            `;
            const values = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];

            // Apply additional filters
            if (filters.area) {
                sqlQuery += ' AND area = ?';
                values.push(filters.area);
            }

            if (filters.gender) {
                sqlQuery += ' AND (gender_preference = ? OR gender_preference = "Unisex")';
                values.push(filters.gender);
            }

            if (filters.min_price) {
                sqlQuery += ' AND price_per_month >= ?';
                values.push(filters.min_price);
            }

            if (filters.max_price) {
                sqlQuery += ' AND price_per_month <= ?';
                values.push(filters.max_price);
            }

            sqlQuery += ' ORDER BY created_at DESC';

            const rows = await query(sqlQuery, values);
            return rows;
        } catch (error) {
            throw new Error(`Error searching PGs: ${error.message}`);
        }
    }

    // Get available areas
    static async getAreas() {
        try {
            const sqlQuery = 'SELECT DISTINCT area FROM pgs WHERE is_active = 1 ORDER BY area';
            const rows = await query(sqlQuery, []);
            return rows.map(row => row.area);
        } catch (error) {
            throw new Error(`Error getting areas: ${error.message}`);
        }
    }

    // Get gender preferences
    static async getGenderPreferences() {
        try {
            const sqlQuery = 'SELECT DISTINCT gender_preference FROM pgs WHERE is_active = 1 ORDER BY gender_preference';
            const rows = await query(sqlQuery, []);
            return rows.map(row => row.gender_preference);
        } catch (error) {
            throw new Error(`Error getting gender preferences: ${error.message}`);
        }
    }
}

module.exports = PG;