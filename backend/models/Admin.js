const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Admin {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.email = data.email;
        this.role = data.role;
        this.is_active = data.is_active;
    }

    // Create new admin
    static async create(adminData) {
        try {
            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);

            const query = `
                INSERT INTO admins (username, email, password_hash, role)
                VALUES (?, ?, ?, ?)
            `;
            
            const values = [
                adminData.username,
                adminData.email,
                hashedPassword,
                adminData.role || 'admin'
            ];

            const [result] = await db.pool.execute(query, values);
            return { id: result.insertId, ...adminData };
        } catch (error) {
            throw new Error(`Error creating admin: ${error.message}`);
        }
    }

    // Find admin by username
    static async findByUsername(username) {
        try {
            const query = 'SELECT * FROM admins WHERE username = ? AND is_active = TRUE';
            const [rows] = await db.pool.execute(query, [username]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Error finding admin: ${error.message}`);
        }
    }

    // Find admin by email
    static async findByEmail(email) {
        try {
            const query = 'SELECT * FROM admins WHERE email = ? AND is_active = TRUE';
            const [rows] = await db.pool.execute(query, [email]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Error finding admin by email: ${error.message}`);
        }
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            throw new Error(`Error verifying password: ${error.message}`);
        }
    }

    // Get all admins
    static async getAll() {
        try {
            const query = `
                SELECT id, username, email, role, is_active, created_at, updated_at
                FROM admins
                ORDER BY created_at DESC
            `;
            const [rows] = await db.pool.execute(query);
            return rows;
        } catch (error) {
            throw new Error(`Error getting admins: ${error.message}`);
        }
    }

    // Update admin
    static async update(id, updateData) {
        try {
            const allowedFields = ['username', 'email', 'role', 'is_active'];
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
            const query = `UPDATE admins SET ${updateFields.join(', ')} WHERE id = ?`;
            
            const [result] = await db.pool.execute(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error updating admin: ${error.message}`);
        }
    }

    // Delete admin (soft delete)
    static async delete(id) {
        try {
            const query = 'UPDATE admins SET is_active = FALSE WHERE id = ?';
            const [result] = await db.pool.execute(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting admin: ${error.message}`);
        }
    }

    // Get admin profile
    static async getProfile(id) {
        try {
            const query = `
                SELECT id, username, email, role, is_active, created_at
                FROM admins WHERE id = ?
            `;
            const [rows] = await db.pool.execute(query, [id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Error getting admin profile: ${error.message}`);
        }
    }

    // Get dashboard statistics
    static async getDashboardStats() {
        try {
            const queries = {
                totalStudents: 'SELECT COUNT(*) as count FROM students WHERE is_active = TRUE',
                totalHostels: 'SELECT COUNT(*) as count FROM hostels WHERE is_active = TRUE',
                totalPGs: 'SELECT COUNT(*) as count FROM pgs WHERE is_active = TRUE',
                pendingAllotments: 'SELECT COUNT(*) as count FROM hostel_allotments WHERE status = "pending"',
                pendingBookings: 'SELECT COUNT(*) as count FROM pg_bookings WHERE status = "pending"',
                totalReviews: 'SELECT COUNT(*) as count FROM reviews',
                recentStudents: `
                    SELECT COUNT(*) as count FROM students 
                    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                `,
                recentAllotments: `
                    SELECT COUNT(*) as count FROM hostel_allotments 
                    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                `
            };

            const stats = {};
            for (const [key, query] of Object.entries(queries)) {
                const [rows] = await db.pool.execute(query);
                stats[key] = rows[0].count;
            }

            return stats;
        } catch (error) {
            throw new Error(`Error getting dashboard stats: ${error.message}`);
        }
    }
}

module.exports = Admin;

