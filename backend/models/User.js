const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    constructor(data) {
        this.student_id = data.student_id;
        this.name = data.name;
        this.email = data.email;
        this.phone = data.phone;
        this.course = data.course;
        this.academic_year = data.academic_year;
        this.password_hash = data.password_hash;
    }

    // Create new user
    static async create(userData) {
        try {
            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

            const query = `
                INSERT INTO users (student_id, name, email, phone, course, academic_year, password_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                userData.student_id,
                userData.name,
                userData.email,
                userData.phone,
                userData.course,
                userData.academic_year,
                hashedPassword
            ];

            const [result] = await db.pool.execute(query, values);
            return { id: result.insertId, ...userData };
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    // Find user by student ID
    static async findByStudentId(studentId) {
        try {
            const query = 'SELECT * FROM users WHERE student_id = ?';
            const [rows] = await db.pool.execute(query, [studentId]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Error finding user: ${error.message}`);
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const query = 'SELECT * FROM users WHERE email = ?';
            const [rows] = await db.pool.execute(query, [email]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Error finding user by email: ${error.message}`);
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

    // Update user profile
    static async updateProfile(studentId, updateData) {
        try {
            const allowedFields = ['name', 'email', 'phone', 'course', 'academic_year'];
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

            values.push(studentId);
            const query = `UPDATE users SET ${updateFields.join(', ')} WHERE student_id = ?`;
            
            const [result] = await db.pool.execute(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error updating user profile: ${error.message}`);
        }
    }

    // Delete user
    static async delete(studentId) {
        try {
            const query = 'DELETE FROM users WHERE student_id = ?';
            const [result] = await db.pool.execute(query, [studentId]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    // Get user profile (without password)
    static async getProfile(studentId) {
        try {
            const query = `
                SELECT student_id, name, email, phone, course, academic_year, created_at
                FROM users WHERE student_id = ?
            `;
            const [rows] = await db.pool.execute(query, [studentId]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Error getting user profile: ${error.message}`);
        }
    }
}

module.exports = User;


