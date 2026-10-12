# 📱 Hostel Allotment and PG Finder - Complete Project Guide

## 🏗️ Project Architecture

```
Android App (Kotlin + Jetpack Compose) ←→ REST API (Node.js + Express) ←→ SQLite Database
```

---

## 📂 Project Structure

### **Backend (Node.js + Express + SQLite)**
```
backend/
├── config/
│   ├── sqlite-database.js          # SQLite database connection & setup
│   └── config.env                  # Environment variables (PORT, etc.)
├── models/
│   ├── Hostel.js                   # Hostel data model & database operations
│   ├── PG.js                       # PG data model & database operations
│   ├── Student-sqlite.js           # Student data model
│   └── Admin.js                    # Admin data model
├── routes/
│   ├── hostels.js                  # Hostel API endpoints (GET, POST /book)
│   ├── pgs.js                      # PG API endpoints (GET, POST /book)
│   ├── auth-sqlite.js              # Student authentication (login, register)
│   ├── admin.js                    # Admin API endpoints
│   ├── admin-allotments.js         # Allotment management endpoints
│   ├── admin-properties.js         # Property management endpoints
│   ├── admin-students.js           # Student management endpoints
│   └── admin-bookings.js           # Booking management endpoints
├── views/
│   ├── admin-dashboard.ejs         # Admin dashboard HTML template
│   ├── admin-hostels.ejs           # Hostel management page
│   ├── admin-pgs.ejs               # PG management page
│   ├── admin-students.ejs          # Student management page
│   ├── admin-allotments.ejs        # Allotment requests page
│   ├── admin-bookings.ejs          # Booking requests page
│   └── js/                         # External JavaScript files for admin panel
│       ├── admin-dashboard.js
│       ├── admin-hostels.js
│       ├── admin-pgs.js
│       ├── admin-students.js
│       ├── admin-allotments.js
│       └── admin-bookings.js
├── database/
│   └── hostel_pg_finder.db         # SQLite database file (auto-created)
├── server.js                       # Main server file (START HERE!)
└── package.json                    # Dependencies & scripts
```

### **Android App (Kotlin + Jetpack Compose)**
```
app/src/main/
├── java/com/example/hostelallotementandpgfinder/
│   ├── MainActivity.kt             # Main activity & navigation
│   ├── data/
│   │   ├── Models.kt               # Local data models (PG, Hostel, etc.)
│   │   └── ApiModels.kt            # API response models
│   ├── network/
│   │   ├── ApiClient.kt            # Retrofit client setup (CHANGE API URL HERE!)
│   │   └── ApiService.kt           # API endpoint definitions
│   ├── ui/
│   │   ├── screens/
│   │   │   ├── LoginScreen.kt      # Student login screen
│   │   │   ├── SignupScreen.kt     # Student registration screen
│   │   │   ├── ChoiceScreen.kt     # Hostel/PG selection screen
│   │   │   ├── HostelAllotmentScreen.kt  # Hostel booking form
│   │   │   └── PGFinderScreen.kt   # PG search & booking
│   │   └── theme/
│   │       ├── Color.kt            # App color scheme
│   │       └── Theme.kt            # Material 3 theme
│   └── AndroidManifest.xml         # App permissions & configuration
├── res/
│   ├── xml/
│   │   └── network_security_config.xml  # Network security (CHANGE IP HERE!)
│   └── values/
│       └── colors.xml              # XML color resources
└── build.gradle.kts                # App dependencies
```

---

## 🚀 How to Start the Server

### **Method 1: Using Command Line**

```bash
# Navigate to backend directory
cd backend

# Start the server
node server.js
```

### **Method 2: Using npm script**

```bash
cd backend
npm start
```

### **Expected Output:**
```
✅ SQLite database connected successfully
✅ Database tables created successfully
✅ Sample data inserted successfully
🚀 Server running on port 5002
📱 Admin Panel: http://localhost:5002/admin
🔗 API Base URL: http://localhost:5002/api
🌐 Wireless Access: http://10.230.118.182:5002/admin
🌐 API Access: http://10.230.118.182:5002/api
💾 Database: SQLite
```

---

## 🔧 How to Change Backend API URL

### **Step 1: Find Your Computer's IP Address**

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (WiFi or Ethernet).

**Example Output:**
```
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 10.230.118.182
```

### **Step 2: Update Android App API URL**

**File:** `app/src/main/java/com/example/hostelallotementandpgfinder/network/ApiClient.kt`

**Line 11:** Change the `BASE_URL` constant:

```kotlin
object ApiClient {
    // CHANGE THIS LINE to match your server IP
    private const val BASE_URL = "http://10.230.118.182:5002/api/"
    
    // For Android Emulator, use:
    // private const val BASE_URL = "http://10.0.2.2:5002/api/"
    
    // For localhost testing:
    // private const val BASE_URL = "http://localhost:5002/api/"
    
    // ... rest of the code
}
```

### **Step 3: Update Network Security Configuration**

**File:** `app/src/main/res/xml/network_security_config.xml`

**Add your IP address to allowed domains:**

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <!-- Add your computer's IP here -->
        <domain includeSubdomains="true">10.230.118.182</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
```

### **Step 4: Rebuild the Android App**

In Android Studio:
1. Click **Build** → **Clean Project**
2. Click **Build** → **Rebuild Project**
3. Run the app on your device/emulator

---

## 📡 API Endpoints Reference

### **Authentication APIs**
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Student login

### **Hostel APIs**
- `GET /api/hostels` - Get all hostels
- `GET /api/hostels/:id` - Get hostel by ID
- `POST /api/hostels/book` - Create hostel allotment request

### **PG APIs**
- `GET /api/pgs` - Get all PGs
- `GET /api/pgs/:id` - Get PG by ID
- `POST /api/pgs/book` - Create PG booking request

### **Admin Panel**
- `http://localhost:5002/admin` - Admin dashboard
- `http://localhost:5002/admin/hostels` - Manage hostels
- `http://localhost:5002/admin/pgs` - Manage PGs
- `http://localhost:5002/admin/students` - View students
- `http://localhost:5002/admin/allotments` - Manage allotment requests
- `http://localhost:5002/admin/bookings` - Manage PG bookings

---

## 💾 Database Information

### **Database Type:** SQLite3
- **File Location:** `backend/database/hostel_pg_finder.db`
- **Auto-created:** Yes (on first server start)
- **No setup required:** SQLite is file-based

### **Database Tables:**
1. **students** - Student accounts and information
2. **hostels** - Hostel listings
3. **pgs** - PG listings
4. **hostel_allotments** - Hostel booking requests
5. **pg_bookings** - PG booking requests
6. **admins** - Admin accounts
7. **notifications** - System notifications
8. **system_logs** - Application logs

### **View Database:**
```bash
# Install SQLite command-line tool (if not installed)
# Then run:
cd backend
sqlite3 database/hostel_pg_finder.db

# Inside SQLite shell:
.tables                    # List all tables
SELECT * FROM students;    # View students
SELECT * FROM hostel_allotments;  # View allotment requests
.exit                      # Exit SQLite shell
```

---

## 🎨 Key Components & Their Purpose

### **Backend Components**

| File | Purpose | When to Modify |
|------|---------|----------------|
| `server-sqlite.js` | Main server entry point | Change port, add middleware |
| `config/sqlite-database.js` | Database connection & schema | Add new tables, modify schema |
| `routes/hostels.js` | Hostel API logic | Add/modify hostel endpoints |
| `routes/pgs.js` | PG API logic | Add/modify PG endpoints |
| `routes/auth-sqlite.js` | Authentication logic | Change login/register behavior |
| `models/Hostel.js` | Hostel database operations | Change how hostels are queried |
| `models/PG.js` | PG database operations | Change how PGs are queried |

### **Android Components**

| File | Purpose | When to Modify |
|------|---------|----------------|
| `MainActivity.kt` | App navigation & state | Add new screens, change flow |
| `network/ApiClient.kt` | API configuration | **Change server IP/URL** |
| `network/ApiService.kt` | API endpoint definitions | Add new API calls |
| `ui/screens/LoginScreen.kt` | Login UI | Modify login form |
| `ui/screens/HostelAllotmentScreen.kt` | Hostel booking form | Change form fields |
| `ui/screens/PGFinderScreen.kt` | PG search & booking | Modify PG search logic |
| `ui/theme/Color.kt` | App colors | Change color scheme |

---

## 🔍 Common Tasks

### **1. Change Server Port**

**File:** `backend/config.env`
```env
PORT=5002
```

**Then restart the server.**

### **2. Add New API Endpoint**

**Step 1:** Add route in `backend/routes/hostels.js` (or relevant file):
```javascript
router.get('/new-endpoint', async (req, res) => {
    try {
        // Your logic here
        res.json({ success: true, data: yourData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
```

**Step 2:** Add to `app/src/main/java/.../network/ApiService.kt`:
```kotlin
@GET("hostels/new-endpoint")
suspend fun getNewData(): Response<ApiResponse<YourDataType>>
```

**Step 3:** Call from your screen:
```kotlin
val response = ApiClient.apiService.getNewData()
```

### **3. Change App Colors**

**File:** `app/src/main/java/.../ui/theme/Color.kt`
```kotlin
val Purple80 = Color(0xFFD0BCFF)  // Change these hex values
val PurpleGrey80 = Color(0xFFCCC2DC)
```

### **4. Add New Database Table**

**File:** `backend/config/sqlite-database.js`

Add to the `initializeDatabase` function:
```javascript
CREATE TABLE IF NOT EXISTS your_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    field1 VARCHAR(100),
    field2 TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🐛 Troubleshooting

### **Server won't start:**
```bash
# Kill existing node processes
taskkill /F /IM node.exe

# Start fresh
cd backend
node server-sqlite.js
```

### **Android app can't connect:**
1. Check if server is running
2. Verify IP address in `ApiClient.kt`
3. Verify IP is in `network_security_config.xml`
4. Rebuild the Android app

### **Database errors:**
```bash
# Delete and recreate database
cd backend
rm database/hostel_pg_finder.db
node server-sqlite.js
```

---

## 📝 Important Notes

1. **Always use `server-sqlite.js`** (not `server.js` which is for MySQL)
2. **Update IP address** in both `ApiClient.kt` and `network_security_config.xml`
3. **Rebuild Android app** after changing network configuration
4. **Server must be running** before testing the Android app
5. **Admin panel** works in any web browser at `http://localhost:5002/admin`

---

## 🎯 Quick Start Checklist

- [ ] Install Node.js (v16+)
- [ ] Install Android Studio
- [ ] Clone/open project
- [ ] Run `cd backend && npm install`
- [ ] Find your IP address (`ipconfig`)
- [ ] Update `ApiClient.kt` with your IP
- [ ] Update `network_security_config.xml` with your IP
- [ ] Start server: `cd backend && node server-sqlite.js`
- [ ] Build and run Android app
- [ ] Test login, hostel booking, PG finder
- [ ] Access admin panel at `http://localhost:5002/admin`

---

## 📞 Support

If you encounter issues:
1. Check server terminal for error messages
2. Check Android Logcat for app errors
3. Verify network connectivity
4. Ensure all IP addresses match
5. Restart server and rebuild app

---

**Last Updated:** October 2025
**Database:** SQLite3
**Server Port:** 5002
**Admin Panel:** http://localhost:5002/admin
