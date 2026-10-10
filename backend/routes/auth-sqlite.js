const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, get, run } = require('../config/sqlite-database');

const router = express.Router();

// Register new student
router.post('/register', async (req, res) => {
    try {
        const { student_id, name, email, phone, course, academic_year, password } = req.body;

        // Validate required fields
        if (!student_id || !name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Student ID, name, email, and password are required'
            });
        }

        // Check if student already exists
        const existingStudent = await get('SELECT * FROM students WHERE student_id = ? OR email = ?', [student_id, email]);
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Student with this ID or email already exists'
            });
        }

        // Hash password
        const passwordHash = bcrypt.hashSync(password, 10);

        // Create student
        const sql = `
            INSERT INTO students (student_id, name, email, phone, course, academic_year, password_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await run(sql, [student_id, name, email, phone, course, academic_year, passwordHash]);

        // Generate JWT token
        const token = jwt.sign(
            { student_id, email, type: 'student' },
            process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'Student registered successfully',
            data: {
                id: result.insertId,
                student_id,
                name,
                email,
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Login student
router.post('/login', async (req, res) => {
    try {
        const { student_id, password } = req.body;

        // Validate required fields
        if (!student_id || !password) {
            return res.status(400).json({
                success: false,
                message: 'Student ID and password are required'
            });
        }

        // Find student by student_id or email
        const student = await get('SELECT * FROM students WHERE student_id = ? OR email = ?', [student_id, student_id]);
        if (!student) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isValidPassword = bcrypt.compareSync(password, student.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { student_id: student.student_id, email: student.email, type: 'student' },
            process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                id: student.id,
                student_id: student.student_id,
                name: student.name,
                email: student.email,
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get student profile
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here');
        
        // Get student data
        const student = await get('SELECT * FROM students WHERE student_id = ?', [decoded.student_id]);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Remove password hash from response
        delete student.password_hash;

        res.json({
            success: true,
            data: student
        });

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router;
