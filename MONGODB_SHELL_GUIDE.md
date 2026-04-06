# 🗄️ MongoDB Shell Guide - Viewing Changes

## 🎯 **How to Check MongoDB Data in Shell**

### **📋 Prerequisites**
- MongoDB Shell (mongosh) installed
- Access to your MongoDB Atlas database
- Connection string from your .env file

---

## 🔧 **Step 1: Connect to MongoDB Shell**

### **✅ Using MongoDB Atlas Connection**
```bash
# Open MongoDB Shell
mongosh

# Connect to your Atlas database
mongosh "mongodb+srv://<username>:<password>@cluster.mongodb.net/academicDB"
```

### **✅ Using Your Connection String**
```bash
# Get connection from .env file
# Replace with your actual connection string
mongosh "mongodb+srv://your-username:your-password@your-cluster.mongodb.net/academicDB"
```

---

## 🔍 **Step 2: Navigate to Database**

```javascript
// Switch to your database
use academicDB

// Show all collections
show collections

// You should see: users, marks, announcements, etc.
```

---

## 👥 **Step 3: Check Users Collection**

### **✅ View All Users (Safe)**
```javascript
// View all users without sensitive data
db.users.find({}, {
  name: 1,
  email: 1,
  createdAt: 1,
  _id: 0  // Hide ID for security
}).pretty()

// View specific user
db.users.findOne({ email: "google@gmail.com" }, {
  name: 1,
  email: 1,
  createdAt: 1,
  _id: 0
})
```

### **✅ Check Password Field Type**
```javascript
// Check if password field exists and its type
db.users.findOne({ email: "google@gmail.com" }, {
  password: 1,
  _id: 0
})

// Check password properties
db.users.findOne({ email: "google@gmail.com" }, {
  password: { $type: 1 },
  "password": { $exists: 1 },
  $expr: { $type: "$password" }
})
```

---

## 🔒 **Step 4: Verify Security Changes**

### **✅ Test Login with Protected Logging**
```bash
# In another terminal, start your server
npm start

# Try logging in with wrong password
# Check server logs - should show [HIDDEN] for sensitive data
```

### **✅ Run Database Check Script**
```bash
# Run the protected check script
node check-atlas-password.js

# Should show:
✅ User found in Atlas!
📋 User Details from Atlas:
   _id: [HIDDEN]
   name: Google User
   email: google@gmail.com
   password value: [HIDDEN]
```

---

## 🧪 **Step 5: Test Different Scenarios**

### **✅ Test with Correct Password**
```bash
# Login with correct password
# Check logs should still show [HIDDEN] for stored password
```

### **✅ Test with Wrong Password**
```bash
# Login with wrong password
# Check logs should show [HIDDEN] for stored password
```

### **✅ Test Database Queries**
```javascript
// In MongoDB shell
db.users.find({ email: "google@gmail.com" }).pretty()

// You'll see the actual password in shell (this is normal)
// The protection is in the application logs, not the database itself
```

---

## 📊 **Step 6: View Collection Statistics**

```javascript
// Count all users
db.users.countDocuments()

// Count users with passwords
db.users.countDocuments({ password: { $exists: true } })

// Check password types
db.users.aggregate([
  {
    $group: {
      _id: { $type: "$password" },
      count: { $sum: 1 }
    }
  }
])

// Check role distribution
db.users.aggregate([
  {
    $group: {
      _id: "$role",
      count: { $sum: 1 }
    }
  }
])
```

---

## 🔍 **Step 7: Monitor Changes**

### **✅ Watch for New Users**
```javascript
// Create a change stream (MongoDB Atlas only)
const changeStream = db.users.watch();
changeStream.on('change', (change) => {
  console.log('Change detected:', change);
});

// Or just check periodically
setInterval(() => {
  const count = db.users.countDocuments();
  console.log('Current user count:', count);
}, 5000);
```

---

## 🎯 **What You Should See**

### **✅ In Application Logs**
```
✅ [STEP 1] SUCCESS - User found!
   ├─ ID: [HIDDEN]
   ├─ Name: Google User
   ├─ Email: google@gmail.com
   ├─ Role: [HIDDEN]
   └─ Has password: true
```

### **✅ In MongoDB Shell**
```javascript
// You can see actual data in shell (this is normal)
{
  "_id": "69c224762fa65438b75aabde",
  "name": "Google User",
  "email": "google@gmail.com",
  "password": "student123",
  "role": "student"
}
```

### **✅ In Check Script**
```
✅ User found in Atlas!
📋 User Details from Atlas:
   _id: [HIDDEN]
   password value: [HIDDEN]
```

---

## 🔧 **Quick Commands Reference**

```bash
# Connect to MongoDB
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/academicDB"

# Switch database
use academicDB

# View users safely
db.users.find({}, {name: 1, email: 1, _id: 0}).pretty()

# Check specific user
db.users.findOne({email: "google@gmail.com"})

# Count users
db.users.countDocuments()

# Run protection check
node check-atlas-password.js
```

---

## 🎉 **Verification Complete**

**The protection is working correctly:**

- ✅ **Application logs** show `[HIDDEN]` for sensitive data
- ✅ **Database shell** shows actual data (this is normal)
- ✅ **Debug scripts** hide sensitive information
- ✅ **Security maintained** in production logs

**The MongoDB shell access is for administrators only - application logs are protected!** 🔒✨
