# Hostel and PG Finder App

A complete Android application for finding and booking hostels and PGs, with a MySQL backend API.

## 🏗️ Architecture

```
Android App (Kotlin + Jetpack Compose) ←→ REST API (Node.js + Express) ←→ MySQL Database
```

## 📱 Features

### Android App
- **Student Authentication** - Login and registration
- **Hostel Allotment** - Request hostel accommodation
- **PG Finder** - Search and filter PGs by area
- **Real-time Data** - Live updates from MySQL database
- **Modern UI** - Material 3 design with purple theme

### Backend API
- **RESTful API** - Clean and well-documented endpoints
- **MySQL Database** - Relational data storage
- **JWT Authentication** - Secure user sessions
- **Data Validation** - Input validation and error handling
- **CORS Support** - Cross-origin requests enabled

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **SQLite3** (included with Node.js)
- **Android Studio** (Latest version)
- **Java 11** or higher

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Database Configuration**
   - **SQLite3** is used (no separate database server needed)
   - Database file: `backend/database.sqlite`
   - Tables are created automatically on first run

3. **Environment Configuration**
   - Update `backend/config.env` with your settings:
   ```env
   PORT=5002
   NODE_ENV=development
   ```

4. **Start Backend Server**
   ```bash
   # Start SQLite server
   node server-sqlite.js
   
   # Or for development with auto-restart
   npx nodemon server-sqlite.js
   ```

   Server will run on `http://localhost:5002`

5. **Verify Setup**
   - **Admin Panel**: `http://localhost:5002/admin`
   - **API Base URL**: `http://localhost:5002/api`
   - **Health Check**: `http://localhost:5002/api/health`

### Detailed Backend Setup Steps

1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Install Node.js Dependencies**
   ```bash
   npm install
   ```
   This installs:
   - `express` - Web framework
   - `sqlite3` - Database driver
   - `cors` - Cross-origin resource sharing
   - `dotenv` - Environment variables
   - `ejs` - Template engine
   - `bcrypt` - Password hashing
   - `jsonwebtoken` - JWT authentication

3. **Check Environment Configuration**
   ```bash
   # Check if config.env exists
   cat config.env
   ```
   Should contain:
   ```env
   PORT=5002
   NODE_ENV=development
   ```

4. **Start the Server**
   ```bash
   # Start SQLite server
   node server-sqlite.js
   ```
   
   Expected output:
   ```
   ✅ SQLite database connected successfully
   ✅ Database tables created successfully
   ✅ Sample data inserted successfully
   🚀 Server running on port 5002
   📱 Admin Panel: http://localhost:5002/admin
   🔗 API Base URL: http://localhost:5002/api
   ```

5. **Test Server Endpoints**
   ```bash
   # Test health endpoint
   curl http://localhost:5002/api/health
   
   # Test hostels endpoint
   curl http://localhost:5002/api/hostels
   
   # Test admin panel
   # Open browser: http://localhost:5002/admin
   ```

6. **Database Verification**
   ```bash
   # Check if database file exists
   ls -la database.sqlite
   
   # View database contents (optional)
   sqlite3 database.sqlite ".tables"
   sqlite3 database.sqlite "SELECT COUNT(*) FROM students;"
   sqlite3 database.sqlite "SELECT COUNT(*) FROM hostels;"
   ```

### Android Setup

1. **Open Project**
   - Open `hostelallotementandpgfinder` folder in Android Studio

2. **Update API URL** (if needed)
   - For emulator: `http://10.0.2.2:5002/api/`
   - For real device: `http://YOUR_IP_ADDRESS:5002/api/`
   - Update in `app/src/main/java/.../network/ApiClient.kt`

3. **Network Security Configuration**
   - Cleartext traffic is allowed for development
   - Network security config: `app/src/main/res/xml/network_security_config.xml`
   - Allows HTTP connections to localhost and your IP

4. **Build and Run**
   - Sync project with Gradle files
   - Run on emulator or device

## 📊 Database Schema

### SQLite Database
- **File**: `backend/database.sqlite`
- **Auto-created**: Tables are created automatically on first run
- **No setup required**: SQLite3 is included with Node.js

### Tables
- **students** - Student information and authentication
- **hostels** - Hostel listings and details
- **pgs** - PG listings and details
- **hostel_allotments** - Hostel booking requests
- **pg_bookings** - PG booking requests
- **admins** - Admin user accounts
- **notifications** - System notifications
- **system_logs** - Application logs

### Sample Data
The database includes sample hostels and PGs for Patiala/PUP area:
- Bhadurgarh, Phase 1, Phase 2, Near PUP, Patiala City

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Student login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Hostels
- `GET /api/hostels` - Get all hostels (with filters)
- `GET /api/hostels/:id` - Get hostel by ID
- `GET /api/hostels/area/:area` - Get hostels by area
- `GET /api/hostels/search/:term` - Search hostels
- `POST /api/hostels/book` - Create hostel allotment request

### PGs
- `GET /api/pgs` - Get all PGs (with filters)
- `GET /api/pgs/:id` - Get PG by ID
- `GET /api/pgs/area/:area` - Get PGs by area
- `GET /api/pgs/search/:term` - Search PGs
- `POST /api/pgs/book` - Create PG booking request

### Admin Panel
- `GET /admin` - Admin dashboard
- `GET /admin/hostels` - Hostel management
- `GET /admin/pgs` - PG management
- `GET /admin/students` - Student management
- `GET /admin/allotments` - Hostel allotment requests
- `GET /admin/bookings` - PG booking requests

## 🎨 UI Features

### Color Scheme
- **Primary**: Deep Purple (#9C27B0)
- **Secondary**: Purple Grey (#512DA8)
- **Tertiary**: Pink (#C2185B)
- **Backgrounds**: Light purple and pink gradients

### Screens
1. **Login Screen** - Student authentication
2. **Signup Screen** - New student registration
3. **Choice Screen** - Hostel vs PG selection
4. **Hostel Allotment** - Request form
5. **PG Finder** - Search and filter PGs

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Start with nodemon for auto-restart
```

### Android Development
- Use Android Studio
- Enable USB debugging for device testing
- Use emulator for quick testing

### Database Management
```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE hostel_pg_finder;

-- Import schema
source backend/database/schema.sql;
```

## 📱 Testing

### Backend API Testing
```bash
# Health check
curl http://localhost:5002/api/health

# Get hostels
curl http://localhost:5002/api/hostels

# Get PGs
curl http://localhost:5002/api/pgs

# Test hostel booking
curl -X POST http://localhost:5002/api/hostels/book \
  -H "Content-Type: application/json" \
  -d '{"student_id":"TEST123","property_id":1,"property_type":"hostel","special_requests":"Student Name: Test User\nRoom Type: Single\nDuration: 1 Year\nCourse: CS\nAcademic Year: 2nd Year\nContact: 9876543210\nEmail: test@example.com"}'
```

### Admin Panel Testing
1. **Access**: `http://localhost:5002/admin`
2. **Dashboard**: View statistics and recent activity
3. **Hostels**: Manage hostel listings
4. **Students**: View registered students
5. **Allotments**: Review hostel requests
6. **Bookings**: Review PG requests

### Android Testing
1. **Login**: Use demo credentials or register new account
2. **Register**: Create new student account
3. **Hostel Allotment**: Submit hostel request form
4. **PG Finder**: Search and filter PGs
5. **Booking**: Test booking functionality

## 🔧 Configuration

### Backend Configuration
- **Port**: 5002 (configurable in config.env)
- **Database**: SQLite3 with automatic table creation
- **CORS**: Enabled for all origins (development)
- **Admin Panel**: EJS templating with Bootstrap 5

### Android Configuration
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 36 (Android 14)
- **Architecture**: Modern Android with Jetpack Compose
- **Network Security**: Allows cleartext HTTP for development

## 🚀 Deployment

### Backend Deployment
1. **VPS/Cloud Server**
   - Install Node.js
   - Clone repository
   - Configure environment variables
   - Start with PM2: `pm2 start server-sqlite.js`

2. **Database**
   - SQLite file: `backend/database.sqlite`
   - No separate database server needed
   - Backup the SQLite file regularly

### Android Deployment
1. **Generate Signed APK**
   - Build → Generate Signed Bundle/APK
   - Create keystore
   - Sign and build

2. **Google Play Store**
   - Create developer account
   - Upload APK/AAB
   - Configure store listing

## 📝 API Documentation

### Request/Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 10
}
```

### Authentication
Include JWT token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check existing issues
2. Create new issue with details
3. Include logs and error messages

## 🔄 Updates

### Recent Changes
- ✅ SQLite backend integration (replaced MySQL)
- ✅ REST API implementation with booking endpoints
- ✅ Android networking setup with cleartext support
- ✅ Purple theme implementation
- ✅ Student-focused design
- ✅ Admin panel with EJS templating
- ✅ Hostel allotment request form with complete field mapping
- ✅ PG booking functionality
- ✅ Comprehensive database schema

### Planned Features
- 🔄 Real-time notifications
- 🔄 Image upload for properties
- 🔄 Advanced search filters
- 🔄 Payment integration
- 🔄 Email notifications
- 🔄 Mobile app push notifications

