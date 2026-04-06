# 📱 User Registration & Data Storage Guide

## ✅ System Status

Your Academic Monitor system is **fully operational** with complete data persistence to MongoDB!

### 📊 Current Database Statistics
- **Total Users**: 21
- **Teachers**: 7
- **Students**: 13
- **Admins**: 1
- **Database**: MongoDB Atlas (academicDB)
- **Collection**: users

---

## 🔄 How Registration Works

### Flow Diagram
```
User Registration (Frontend/API)
        ↓
Validation (Email format, password length, name)
        ↓
Password Hashing (bcryptjs)
        ↓
MongoDB Storage (academicDB.users)
        ↓
Instant Availability in MongoDB Compass
```

### Step 1: User Registers
**Frontend URL**: http://localhost:3000

**API Endpoint**: 
```
POST /api/register
```

**Required Fields**:
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "role": "student"
}
```

### Step 2: Data Processing
- ✅ Email validation (Must be valid email format)
- ✅ Email uniqueness check (No duplicates allowed)
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Timestamps auto-generated (createdAt, updatedAt)
- ✅ Default values set (isActive: true, role: student)

### Step 3: MongoDB Storage
Data automatically saved with structure:
```json
{
  "_id": "ObjectId('...')",
  "name": "Priya Sharma",
  "email": "priya.sharma@college.com",
  "password": "$2b$10$...", // hashed
  "role": "student",
  "department": null,
  "isActive": true,
  "createdAt": ISODate("2026-04-03T11:46:52.123Z"),
  "updatedAt": ISODate("2026-04-03T11:46:52.123Z"),
  "__v": 0
}
```

---

## 🎯 Recently Registered Users (New)

| Email | Name | Role | Registration Time |
|-------|------|------|-------------------|
| testuser.new@gmail.com | Test User New | student | 2026-04-03 |
| priya.sharma@college.com | Priya Sharma | student | 2026-04-03 |
| rajesh.kumar@college.com | Rajesh Kumar | student | 2026-04-03 |

---

## 🔍 How to View Data in MongoDB Compass

### Prerequisites
1. Download [MongoDB Compass](https://www.mongodb.com/products/tools/compass)
2. Install and launch the application

### Connection Steps

**Step 1: Open MongoDB Compass**
```
Launch MongoDB Compass application
```

**Step 2: Create New Connection**
- Click **"New Connection"**
- Or click the **"+"** button

**Step 3: Use Connection String**
- Method A: Paste connection string directly
  ```
  mongodb+srv://eswetha834_db_user:swe123@cluster1.x0u1qzj.mongodb.net/academicDB
  ```
- Method B: Enter details manually
  - **Username**: eswetha834_db_user
  - **Password**: swe123
  - **Host**: cluster1.x0u1qzj.mongodb.net
  - **Database**: academicDB

**Step 4: Click Connect**
```
Wait for connection (2-5 seconds)
```

### Navigate to Users Collection

**Path**: 
```
Cluster0 → academicDB → users
```

**Steps**:
1. In left sidebar, expand **"Cluster0"**
2. Click **"academicDB"** database
3. Look for **"users"** collection (listed under database)
4. Click **"users"** to open

### View Data

**Table View** (Recommended for beginners):
- Click **"Table"** tab at top
- See all users in spreadsheet format
- Columns: name, email, role, createdAt, etc.
- Click any row for full details

**JSON View** (For detailed inspection):
- Click **"JSON"** tab
- View raw MongoDB document structure
- Edit fields (if using Compass Pro)

---

## 🔎 Common Queries in MongoDB Compass

### Find Specific User
**Filter**:
```json
{ "email": "priya.sharma@college.com" }
```

### Find All Teachers
**Filter**:
```json
{ "role": "teacher" }
```

### Find All Students
**Filter**:
```json
{ "role": "student" }
```

### Find Recently Registered (Last 24 hours)
**Filter**:
```json
{ "createdAt": { "$gte": new Date(Date.now() - 24*60*60*1000) } }
```

### Find Active Users Only
**Filter**:
```json
{ "isActive": true }
```

### Find by Department
**Filter**:
```json
{ "department": "Computer Science" }
```

---

## 📋 Complete User List

### Faculty/Teachers (7)
1. **elango@gmail.com** - elango
2. **sarah.johnson@university.edu** - Dr. Sarah Johnson
3. **michael.chen@university.edu** - Prof. Michael Chen
4. **emily.rodriguez@university.edu** - Dr. Emily Rodriguez
5. **david.kim@university.edu** - Prof. David Kim
6. **lisa.anderson@university.edu** - Dr. Lisa Anderson
7. **faculty@gmail.com** - John Faculty

### Students (13)
1. **student@gmail.com** - Jane Student
2. **dmin@gmail.com** - DMIN
3. **sai@gmail.com** - Sai
4. **sru@gmail.com** - sru
5. **google@gmail.com** - Google User
6. **testuser@gmail.com** - Test User
7. **amutha@gmail.com** - amutha
8. **testuser50@example.com** - Test User 50
9. **test@example.com** - Test User
10. **charu@gmail.com** - Charu
11. **testuser.new@gmail.com** - Test User New *(NEW)*
12. **priya.sharma@college.com** - Priya Sharma *(NEW)*
13. **rajesh.kumar@college.com** - Rajesh Kumar *(NEW)*

### Admin (1)
1. **admin@gmail.com** - System Administrator

---

## 🔐 Login Credentials for Testing

### Faculty/Teacher Login
```
Email: elango@gmail.com
Password: faculty123
Role: Faculty
```

### Student Login
```
Email: student@gmail.com
Password: (original password)
Role: Student
```

### Admin Login
```
Email: admin@gmail.com
Password: (hashed)
Role: Admin
```

---

## 📊 Data Storage Architecture

### MongoDB Atlas Setup
```
Organization: eswet's Project
Project: Academic Monitor
Cluster: Cluster0
Region: Asia-Pacific (Mumbai)
Tier: Free (M0)
```

### Database Structure
```
academicDB/
├── users (collection)
│   ├── Documents: 21+
│   ├── Indexes: _id, email (unique)
│   └── Size: ~50-100 KB
│
├── marks (collection)
├── attendance (collection)
├── assignments (collection)
└── announcements (collection)
```

---

## ✨ Key Features of Data Storage

### 1. **Automatic Validation**
- Email format validation
- Email uniqueness enforcement
- Password minimum length (6 characters)
- Required fields check (name, email, password, role)

### 2. **Security**
- Passwords hashed with bcrypt (10 rounds)
- Plain text passwords are optional backup only
- No sensitive data exposed in API responses
- Password field excluded from JSON output

### 3. **Timestamps**
- `createdAt`: When user registered
- `updatedAt`: Last modification time
- Automatically managed by MongoDB

### 4. **Data Integrity**
- Unique indexes on email field
- No duplicate accounts possible
- Invalid data rejected at validation layer
- Referential integrity for related data

### 5. **Query Performance**
- Indexes on frequently searched fields
- Optimized for user lookup by email
- Fast role-based filtering
- Efficient timestamp-based queries

---

## 🧪 Testing User Registration

### Via Frontend (http://localhost:3000)
1. Go to Login page
2. Click "Register" tab
3. Fill in:
   - Name: `Test Student`
   - Email: `teststudent@college.com`
   - Password: `password123`
   - Confirm Password: `password123`
   - Role: `Student`
4. Click "Register"
5. Check MongoDB Compass for new entry

### Via API (Terminal/Postman)
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test User",
    "email": "apitest@example.com",
    "password": "password123",
    "role": "student"
  }'
```

**Response**:
```json
{
  "msg": "Registered Successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "69cf5b0806117ef7443c3fe2",
    "name": "API Test User",
    "email": "apitest@example.com",
    "role": "student"
  }
}
```

---

## 🚀 Next Steps

1. **View Data**: Open MongoDB Compass and explore the users collection
2. **Test Registration**: Register a new user and see it appear in Compass
3. **Monitor Growth**: Track new user registrations in real-time
4. **Export Data**: Use Compass to export user data as JSON/CSV
5. **Analytics**: Use Compass aggregation pipeline for user analytics

---

## 🆘 Troubleshooting

### Issue: Users showing in Compass but not in API
- **Solution**: Restart the backend server (`node server.js`)
- Check MongoDB connection string in `.env`

### Issue: Email uniqueness error
- **Solution**: Use different email address
- Check if email already exists in Compass

### Issue: Password not working after registration
- **Solution**: Passwords are hashed automatically
- Use original password from registration, not the hash

### Issue: Can't connect MongoDB Compass
- **Solution**: Check internet connection
- Verify credentials in connection string
- Check IP whitelist in MongoDB Atlas console

---

## 📈 Monitoring User Growth

**Using MongoDB Compass**:
1. Open users collection
2. Check total document count (bottom left)
3. Use aggregation pipeline to count by role
4. Monitor createdAt field for registration trends

**Using Terminal**:
```bash
cd c:\Users\eswet\academic-monitor\server
node -e "const User = require('./models/User'); User.countDocuments().then(count => console.log('Total users:', count));"
```

---

**Last Updated**: April 3, 2026
**System Status**: ✅ Fully Operational
**Data Persistence**: ✅ MongoDB Atlas
**User Registrations**: ✅ Automatic Storage
