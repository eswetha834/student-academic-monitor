# MongoDB Compass - User Data Management Guide

## 📊 Overview
All registered users (both new and existing) are automatically stored in MongoDB Atlas. You can view, manage, and monitor all user data using MongoDB Compass.

## 🔗 Database Connection Details

**Database Name**: `academicDB`
**Connection String**: `mongodb+srv://eswetha834_db_user:swe123@cluster1.x0u1qzj.mongodb.net/academicDB`

## 📖 How to Access User Data in MongoDB Compass

### Step 1: Open MongoDB Compass
1. Download and install [MongoDB Compass](https://www.mongodb.com/products/tools/compass) if not already installed
2. Launch MongoDB Compass

### Step 2: Connect to Atlas
1. Click **"New Connection"** or use the connection string directly
2. Enter the connection string:
   ```
   mongodb+srv://eswetha834_db_user:swe123@cluster1.x0u1qzj.mongodb.net/academicDB
   ```
3. Click **"Connect"**

### Step 3: Navigate to Users Collection
1. In the left sidebar, expand **"academicDB"** database
2. Look for **"users"** collection
3. Click on **"users"** to view all registered users

## 👥 Current Registered Users (19 Total)

### Faculty/Teachers (5)
| Email | Name | Role | Status |
|-------|------|------|--------|
| elango@gmail.com | elango | teacher | ✅ Active |
| sarah.johnson@university.edu | Dr. Sarah Johnson | teacher | ✅ Active |
| michael.chen@university.edu | Prof. Michael Chen | teacher | ✅ Active |
| emily.rodriguez@university.edu | Dr. Emily Rodriguez | teacher | ✅ Active |
| david.kim@university.edu | Prof. David Kim | teacher | ✅ Active |
| lisa.anderson@university.edu | Dr. Lisa Anderson | teacher | ✅ Active |
| faculty@gmail.com | John Faculty | teacher | ✅ Active |

### Students (11)
| Email | Name | Role |
|-------|------|------|
| student@gmail.com | Jane Student | student |
| dmin@gmail.com | DMIN | student |
| sai@gmail.com | Sai | student |
| sru@gmail.com | sru | student |
| google@gmail.com | Google User | student |
| testuser@gmail.com | Test User | student |
| amutha@gmail.com | amutha | student |
| testuser50@example.com | Test User 50 | student |
| test@example.com | Test User | student |
| charu@gmail.com | Charu | student |
| testuser.new@gmail.com | Test User New | student |

### Admin (1)
| Email | Name | Role |
|-------|------|------|
| admin@gmail.com | System Administrator | admin |

## 📝 User Document Structure

Each user document in MongoDB contains:

```json
{
  "_id": "ObjectId",
  "name": "User Name",
  "email": "user@example.com",
  "password": "hashed_password",
  "plainPassword": "password123",
  "role": "student|teacher|admin",
  "department": "Department Name",
  "rollNumber": "Roll Number",
  "semester": "Semester",
  "profilePic": "image_url",
  "classTeacherEmail": "teacher@example.com",
  "studyTime": [],
  "goals": {
    "targetGpa": 9.0,
    "targetAttendance": 95
  },
  "notes": [],
  "badges": [],
  "focusSubjects": [],
  "pinnedBy": [],
  "isActive": true,
  "createdAt": "2026-04-03T06:15:36.819Z",
  "updatedAt": "2026-04-03T06:15:36.819Z",
  "__v": 0
}
```

## 🔍 How to Search/Filter Users

### Method 1: Using MongoDB Compass GUI
1. Open the **"users"** collection
2. Click the **"Filter"** button
3. Enter your filter query:

**To find a specific email:**
```json
{ "email": "testuser.new@gmail.com" }
```

**To find all teachers:**
```json
{ "role": "teacher" }
```

**To find all students:**
```json
{ "role": "student" }
```

**To find active users:**
```json
{ "isActive": true }
```

### Method 2: Using Query Bar
1. Click the **"Query"** tab
2. Enter your MongoDB query
3. Click **"Find"** to execute

## ➕ Adding New Users (Registration)

When users register through the application:

1. **Via Frontend**: Users can register at http://localhost:3000/login
2. **Via API**: POST to `/api/register` with:
   ```json
   {
     "name": "User Name",
     "email": "user@example.com",
     "password": "password123",
     "role": "student"
   }
   ```

The new user automatically:
- Gets a unique MongoDB `_id`
- Password is hashed with bcrypt
- Timestamps are set (createdAt, updatedAt)
- Data is immediately visible in MongoDB Compass

## 🔐 Password Management

### Password Fields
- **password**: Hashed bcrypt password (never view this directly)
- **plainPassword**: Plain text backup (for testing only)

### Faculty Passwords
All faculty users can login with:
- **Password**: `faculty123`

## 📊 Data Views in MongoDB Compass

### 1. Table View
- Click **"Table"** tab to see all users in a spreadsheet format
- Click column headers to sort
- Click on any row to view full document

### 2. JSON View
- Click **"JSON"** tab to view raw JSON data
- Useful for detailed inspection of any field

### 3. Aggregation View
- Click **"Aggregation"** tab
- Build pipelines to analyze data
- Example: Count users by role

## 🔄 Real-time Synchronization

Changes made through:
- Frontend registration → Instantly visible in Compass
- API endpoints → Immediately reflected in database
- Direct Compass edits → Visible in application (after refresh)

## 💾 Database Statistics

**Path**: academicDB → users collection

- **Total Documents**: 19+
- **Total Size**: Varies with document count
- **Average Size**: ~1-2 KB per user
- **Indexes**: `email` (unique), timestamps

## 📱 Example: Tracking New Registration

1. User registers at http://localhost:3000 with email: `newstudent@college.com`
2. Registration API processes and saves to MongoDB
3. Open MongoDB Compass → academicDB → users
4. Filter: `{ "email": "newstudent@college.com" }`
5. New user document appears with all metadata

## ⚠️ Important Notes

1. **Email Uniqueness**: Each email can only have one user account
2. **Password Hashing**: Passwords are automatically hashed before storage
3. **Case Handling**: Emails are automatically converted to lowercase
4. **Timestamps**: Created/Updated times are automatically set
5. **Data Validation**: Required fields (name, email, password, role) must be present

## 🎯 Quick Reference

| Task | Steps |
|------|-------|
| View all users | Connect to Atlas → academicDB → users → Table view |
| Find specific user | Use filter: `{ "email": "user@example.com" }` |
| Check new registrations | Filter: `{ "createdAt": { "$gte": <date> } }` |
| Find faculty users | Filter: `{ "role": "teacher" }` |
| Export user data | Select users → Export as JSON/CSV |
| Edit user details | Double-click field in Table view (Compass Pro) |

## 🚀 Backend Endpoints for User Management

```
POST   /api/register          - Register new user
POST   /api/login             - User login
GET    /api/faculty/students  - Get assigned students
GET    /api/users             - Get all users (admin only)
PUT    /api/users/:id         - Update user (admin only)
DELETE /api/users/:id         - Delete user (admin only)
```

---

**Last Updated**: April 3, 2026
**Total Users**: 19+
**Database**: MongoDB Atlas (academicDB)
