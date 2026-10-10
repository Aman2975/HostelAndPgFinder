const bcrypt = require('bcryptjs');
const { query, get, run } = require('../config/sqlite-database');

class Student {
    static async create(studentData) {
        try {
            const { student_id, name, email, phone, course, academic_year, password } = studentData;
            
            // Hash password
            const passwordHash = bcrypt.hashSync(password, 10);
            
            const sql = `
                INSERT INTO students (student_id, name, email, phone, course, academic_year, password_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            const result = await run(sql, [student_id, name, email, phone, course, academic_year, passwordHash]);
            return { id: result.insertId, student_id, name, email };
        } catch (error) {
            throw new Error(`Failed to create student: ${error.message}`);
        }
    }

    static async findByEmail(email) {
        try {
            const sql = 'SELECT * FROM students WHERE email = ?';
            return await get(sql, [email]);
        } catch (error) {
            throw new Error(`Failed to find student by email: ${error.message}`);
        }
    }

    static async findById(studentId) {
        try {
            const sql = 'SELECT * FROM students WHERE student_id = ?';
            return await get(sql, [studentId]);
        } catch (error) {
            throw new Error(`Failed to find student by ID: ${error.message}`);
        }
    }

    static async getAll() {
        try {
            const sql = 'SELECT * FROM students ORDER BY created_at DESC';
            return await query(sql);
        } catch (error) {
            throw new Error(`Failed to get all students: ${error.message}`);
        }
    }

    static async update(studentId, updateData) {
        try {
            const fields = [];
            const values = [];
            
            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined && key !== 'id' && key !== 'student_id') {
                    fields.push(`${key} = ?`);
                    values.push(updateData[key]);
                }
            });
            
            if (fields.length === 0) {
                throw new Error('No valid fields to update');
            }
            
            values.push(studentId);
            const sql = `UPDATE students SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE student_id = ?`;
            
            const result = await run(sql, values);
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Failed to update student: ${error.message}`);
        }
    }

    static async delete(studentId) {
        try {
            const sql = 'DELETE FROM students WHERE student_id = ?';
            const result = await run(sql, [studentId]);
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Failed to delete student: ${error.message}`);
        }
    }

    static async verifyPassword(student, password) {
        try {
            return bcrypt.compareSync(password, student.password_hash);
        } catch (error) {
            throw new Error(`Failed to verify password: ${error.message}`);
        }
    }
}

module.exports = Student;
