const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import SQLite database instead of MySQL
const { testConnection, initializeDatabase, query, get, run } = require('./config/sqlite-database');

// Import routes
const authRoutes = require('./routes/auth-sqlite');
const hostelRoutes = require('./routes/hostels');
const pgRoutes = require('./routes/pgs');
const adminRoutes = require('./routes/admin');
const adminAllotmentRoutes = require('./routes/admin-allotments');
const adminPropertyRoutes = require('./routes/admin-properties');
const adminStudentRoutes = require('./routes/admin-students');
const adminBookingRoutes = require('./routes/admin-bookings');

const app = express();
const PORT = process.env.PORT || 5002;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration - Allow all origins
app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        database: 'SQLite'
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/pgs', pgRoutes);
app.use('/api/admin/allotments', adminAllotmentRoutes);
app.use('/api/admin/students', adminStudentRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);
app.use('/api/admin', adminPropertyRoutes);
app.use('/api/admin', adminRoutes);

// Admin panel routes
app.get('/admin', (req, res) => {
    res.render('admin-dashboard', { 
        title: 'Hostel & PG Admin Panel',
        apiBaseUrl: `http://10.230.118.182:${PORT}/api`
    });
});

app.get('/admin/dashboard', (req, res) => {
    res.render('admin-dashboard', { 
        title: 'Hostel & PG Admin Panel',
        apiBaseUrl: `http://localhost:${PORT}/api`
    });
});

app.get('/admin/hostels', (req, res) => {
    res.render('admin-hostels', { 
        title: 'Hostel & PG Admin Panel',
        apiBaseUrl: `http://localhost:${PORT}/api`
    });
});

app.get('/admin/students', (req, res) => {
    res.render('admin-students', { 
        title: 'Hostel & PG Admin Panel',
        apiBaseUrl: `http://localhost:${PORT}/api`
    });
});

app.get('/admin/pgs', (req, res) => {
    res.render('admin-pgs', { 
        title: 'Hostel & PG Admin Panel',
        apiBaseUrl: `http://localhost:${PORT}/api`
    });
});

app.get('/admin/allotments', (req, res) => {
    res.render('admin-allotments', { 
        title: 'Hostel & PG Admin Panel',
        apiBaseUrl: `http://localhost:${PORT}/api`
    });
});

app.get('/admin/bookings', (req, res) => {
    res.render('admin-bookings', {
        title: 'Hostel & PG Admin Panel',
        apiBaseUrl: `http://localhost:${PORT}/api`
    });
});

// Add/Edit Hostel Pages
app.get('/admin/hostels/add', (req, res) => {
    res.render('add-hostel', {
        title: 'Add New Hostel - Admin Panel',
        apiBaseUrl: `http://localhost:${PORT}/api`
    });
});

app.get('/admin/hostels/edit/:id', (req, res) => {
    console.log('Edit hostel route called with ID:', req.params.id);
    console.log('API Base URL:', `http://localhost:${PORT}/api`);
    
    res.render('edit-hostel', {
        title: 'Edit Hostel - Admin Panel',
        apiBaseUrl: `http://localhost:${PORT}/api`,
        hostelId: req.params.id
    });
});

// Add/Edit PG Pages
app.get('/admin/pgs/add', (req, res) => {
    res.render('add-pg', {
        title: 'Add New PG - Admin Panel',
        apiBaseUrl: `http://localhost:${PORT}/api`
    });
});

app.get('/admin/pgs/edit/:id', (req, res) => {
    console.log('Edit PG route called with ID:', req.params.id);
    console.log('API Base URL:', `http://localhost:${PORT}/api`);
    
    res.render('edit-pg', {
        title: 'Edit PG - Admin Panel',
        apiBaseUrl: `http://localhost:${PORT}/api`,
        pgId: req.params.id
    });
});

// Serve admin panel static files (after specific routes)
app.use('/admin', express.static(path.join(__dirname, '../admin-panel')));
app.use('/admin/js', express.static(path.join(__dirname, 'views/js')));

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Endpoint not found',
        availableEndpoints: [
            'GET /health',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/hostels',
            'GET /api/pgs',
            'POST /api/admin/login',
            'GET /admin'
        ]
    });
});

// Catch-all route for admin panel (must be last)
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin-panel/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        await testConnection();
        
        // Initialize database
        await initializeDatabase();
        
        // Start server on all interfaces
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📱 Admin Panel: http://localhost:${PORT}/admin`);
            console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
            console.log(`🌐 Wireless Access: http://10.230.118.182:${PORT}/admin`);
            console.log(`🌐 API Access: http://10.230.118.182:${PORT}/api`);
            console.log(`💾 Database: SQLite`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
