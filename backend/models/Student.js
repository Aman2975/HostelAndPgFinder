const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Student {
    constructor(data) {
        this.id = data.id;
        this.student_id = data.student_id;
        this.name = data.name;
        this.email = data.email;
        this.phone = data.phone;
        this.course = data.course;
        this.academic_year = data.academic_year;
        this.university = data.university;
        this.address = data.address;
        this.emergency_contact = data.emergency_contact;
        this.emergency_contact_name = data.emergency_contact_name;
        this.is_active = data.is_active;
        this.is_verified = data.is_verified;
    }

    // Create new student
    static async create(studentData) {
        try {
            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(studentData.password, saltRounds);

            const query = `
                INSERT INTO students (student_id, name, email, phone, course, academic_year, 
                                    university, address, emergency_contact, emergency_contact_name, password_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                studentData.student_id,
                studentData.name,
                studentData.email,
                studentData.phone,
                studentData.course,
                studentData.academic_year,
                studentData.university,
                studentData.address,
                studentData.emergency_contact,
                studentData.emergency_contact_name,
                hashedPassword
            ];

            const [result] = await db.pool.execute(query, values);
            return { id: result.insertId, ...studentData };
        } catch (error) {
            throw new Error(`Error creating student: ${error.message}`);
        }
    }

    // Find student by student ID
    static async findByStudentId(studentId) {
        try {
            const query = 'SELECT * FROM students WHERE student_id = ?';
            const [rows] = await db.pool.execute(query, [studentId]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Error finding student: ${error.message}`);
        }
    }

    // Find student by email
    static async findByEmail(email) {
        try {
            const query = 'SELECT * FROM students WHERE email = ?';
            const [rows] = await db.pool.execute(query, [email]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Error finding student by email: ${error.message}`);
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

    // Get all students with filters
    static async getAll(filters = {}) {
        try {
            let query = `
                SELECT id, student_id, name, email, phone, course, academic_year, 
                       university, is_active, is_verified, created_at
                FROM students
            `;
            const values = [];
            const conditions = [];

            // Apply filters
            if (filters.search) {
                conditions.push(`(name LIKE ? OR student_id LIKE ? OR email LIKE ?)`);
                const searchTerm = `%${filters.search}%`;
                values.push(searchTerm, searchTerm, searchTerm);
            }

            if (filters.course) {
                conditions.push('course = ?');
                values.push(filters.course);
            }

            if (filters.academic_year) {
                conditions.push('academic_year = ?');
                values.push(filters.academic_year);
            }

            if (filters.is_verified !== undefined) {
                conditions.push('is_verified = ?');
                values.push(filters.is_verified);
            }

            if (filters.is_active !== undefined) {
                conditions.push('is_active = ?');
                values.push(filters.is_active);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            query += ' ORDER BY created_at DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                values.push(filters.limit);
            }

            if (filters.offset) {
                query += ' OFFSET ?';
                values.push(filters.offset);
            }

            const [rows] = await db.pool.execute(query, values);
            return rows;
        } catch (error) {
            throw new Error(`Error getting students: ${error.message}`);
        }
    }

    // Get student by ID
    static async getById(id) {
        try {
            const query = `
                SELECT id, student_id, name, email, phone, course, academic_year, 
                       university, address, emergency_contact, emergency_contact_name, 
                       is_active, is_verified, created_at, updated_at
                FROM students WHERE id = ?
            `;
            const [rows] = await db.pool.execute(query, [id]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Error getting student: ${error.message}`);
        }
    }

    // Update student
    static async update(id, updateData) {
        try {
            const allowedFields = [
                'name', 'email', 'phone', 'course', 'academic_year', 
                'university', 'address', 'emergency_contact', 'emergency_contact_name',
                'is_active', 'is_verified'
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
            const query = `UPDATE students SET ${updateFields.join(', ')} WHERE id = ?`;
            
            const [result] = await db.pool.execute(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error updating student: ${error.message}`);
        }
    }

    // Delete student (soft delete)
    static async delete(id) {
        try {
            const query = 'UPDATE students SET is_active = FALSE WHERE id = ?';
            const [result] = await db.pool.execute(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting student: ${error.message}`);
        }
    }

    // Get student statistics
    static async getStats() {
        try {
            const queries = {
                total: 'SELECT COUNT(*) as count FROM students WHERE is_active = TRUE',
                verified: 'SELECT COUNT(*) as count FROM students WHERE is_active = TRUE AND is_verified = TRUE',
                unverified: 'SELECT COUNT(*) as count FROM students WHERE is_active = TRUE AND is_verified = FALSE',
                byCourse: `
                    SELECT course, COUNT(*) as count 
                    FROM students 
                    WHERE is_active = TRUE 
                    GROUP BY course 
                    ORDER BY count DESC
                `,
                byYear: `
                    SELECT academic_year, COUNT(*) as count 
                    FROM students 
                    WHERE is_active = TRUE 
                    GROUP BY academic_year 
                    ORDER BY academic_year
                `,
                recent: `
                    SELECT COUNT(*) as count 
                    FROM students 
                    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                `
            };

            const stats = {};
            for (const [key, query] of Object.entries(queries)) {
                if (key === 'byCourse' || key === 'byYear') {
                    const [rows] = await db.pool.execute(query);
                    stats[key] = rows;
                } else {
                    const [rows] = await db.pool.execute(query);
                    stats[key] = rows[0].count;
                }
            }

            return stats;
        } catch (error) {
            throw new Error(`Error getting student stats: ${error.message}`);
        }
    }

    // Get student's bookings and allotments
    static async getStudentActivity(studentId) {
        try {
            const queries = {
                allotments: `
                    SELECT ha.*, h.name as hostel_name 
                    FROM hostel_allotments ha 
                    LEFT JOIN hostels h ON ha.hostel_id = h.id 
                    WHERE ha.student_id = ? 
                    ORDER BY ha.created_at DESC
                `,
                bookings: `
                    SELECT pb.*, p.name as pg_name 
                    FROM pg_bookings pb 
                    JOIN pgs p ON pb.pg_id = p.id 
                    WHERE pb.student_id = ? 
                    ORDER BY pb.created_at DESC
                `,
                reviews: `
                    SELECT r.*, 
                           CASE 
                               WHEN r.property_type = 'hostel' THEN h.name 
                               WHEN r.property_type = 'pg' THEN p.name 
                           END as property_name
                    FROM reviews r 
                    LEFT JOIN hostels h ON r.property_type = 'hostel' AND r.property_id = h.id
                    LEFT JOIN pgs p ON r.property_type = 'pg' AND r.property_id = p.id
                    WHERE r.student_id = ? 
                    ORDER BY r.created_at DESC
                `
            };

            const activity = {};
            for (const [key, query] of Object.entries(queries)) {
                const [rows] = await db.pool.execute(query, [studentId]);
                activity[key] = rows;
            }

            return activity;
        } catch (error) {
            throw new Error(`Error getting student activity: ${error.message}`);
        }
    }
}

module.exports = Student;

