const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Generate JWT token
const generateToken = (studentId) => {
    return jwt.sign({ studentId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Register new user
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

        // Check if user already exists
        const existingUser = await User.findByStudentId(student_id);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Student ID already exists'
            });
        }

        // Check if email already exists
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Create new user
        const userData = {
            student_id,
            name,
            email,
            phone,
            course,
            academic_year,
            password
        };

        const newUser = await User.create(userData);
        const token = generateToken(student_id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    student_id: newUser.student_id,
                    name: newUser.name,
                    email: newUser.email,
                    phone: newUser.phone,
                    course: newUser.course,
                    academic_year: newUser.academic_year
                },
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

// Login user
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

        // Find user by student ID
        const user = await User.findByStudentId(student_id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid student ID or password'
            });
        }

        // Verify password
        const isValidPassword = await User.verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid student ID or password'
            });
        }

        // Generate token
        const token = generateToken(student_id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    student_id: user.student_id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    course: user.course,
                    academic_year: user.academic_year
                },
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

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const studentId = req.user.studentId;
        const user = await User.getProfile(studentId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: { user }
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

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const studentId = req.user.studentId;
        const updateData = req.body;

        const updated = await User.updateProfile(studentId, updateData);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'User not found or no changes made'
            });
        }

        // Get updated user data
        const user = await User.getProfile(studentId);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
}

module.exports = router;


