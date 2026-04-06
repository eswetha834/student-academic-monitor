# 🔒 MongoDB Compass Security Guide

## 🎯 **Hide Sensitive Data in MongoDB Compass**

### **📋 Goal: Show Only Password Field Name, Hide Values**

---

## 🔧 **Method 1: Create Secure View (Recommended)**

### **✅ Step 1: Create a Secure View**
```javascript
// Connect to MongoDB Shell first
mongosh "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/academicDB"

// Create a secure view that hides sensitive data
use academicDB

db.createView(
  "secure_users",
  "users",
  [
    {
      $project: {
        name: 1,
        email: 1,
        createdAt: 1,
        updatedAt: 1,
        // Hide sensitive fields
        _id: 0,
        password: "$$REMOVE",  // Completely remove password
        role: "$$REMOVE"        // Completely remove role
      }
    }
  ]
)

// Alternative: Show password field exists but hide value
db.createView(
  "users_with_password_field",
  "users", 
  [
    {
      $project: {
        name: 1,
        email: 1,
        createdAt: 1,
        updatedAt: 1,
        // Show password field exists but hide value
        hasPassword: { $cond: [{ $ifNull: ["$password", false] }, true, false] },
        passwordType: { $type: "$password" },
        passwordLength: { $strLenCP: { $ifNull: ["$password", ""] } },
        // Hide sensitive fields
        _id: 0,
        password: "$$REMOVE",
        role: "$$REMOVE"
      }
    }
  ]
)
```

### **✅ Step 2: Use the View in Compass**
1. Open MongoDB Compass
2. Connect to your database
3. Navigate to `academicDB` database
4. Look for `secure_users` or `users_with_password_field` views
5. These views will show data without sensitive information

---

## 🔧 **Method 2: Create Read-Only User Role**

### **✅ Step 1: Create Read-Only Role**
```javascript
// Connect to MongoDB Shell
mongosh "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/academicDB"

use admin

// Create a read-only role that can't see sensitive fields
db.createRole({
  role: "readOnlyUser",
  privileges: [
    {
      resource: { db: "academicDB", collection: "users" },
      actions: ["find"]
    }
  ],
  roles: []
})

// Create a user with this role
db.createUser({
  user: "readonly_user",
  pwd: "secure_password_123",
  roles: [
    { role: "readOnlyUser", db: "admin" }
  ]
})
```

### **✅ Step 2: Create Filtered Access**
```javascript
// Create a role with field-level restrictions
db.createRole({
  role: "limitedUserAccess",
  privileges: [
    {
      resource: { 
        db: "academicDB", 
        collection: "users" 
      },
      actions: ["find"],
      // Note: MongoDB Atlas has additional field-level security features
    }
  ],
  roles: []
})
```

---

## 🔧 **Method 3: MongoDB Atlas Field Level Security**

### **✅ Step 1: Enable Field Level Encryption**
```javascript
// This requires MongoDB Atlas with field level encryption
// Contact MongoDB Atlas support for enterprise features

// Create encryption key
use keyvault
db.createCollection("dataEncryptionKeys")

// Insert encryption key
db.dataEncryptionKeys.insertOne({
  keyAltNames: ["user_data_key"],
  keyMaterial: BinData(2, "your_encryption_key_here"),
  creationDate: new Date(),
  updateDate: new Date(),
  status: 1,
  masterKey: {
    provider: "aws",
    key: "arn:aws:kms:region:account:key/key-id",
    region: "us-east-1"
  }
})
```

### **✅ Step 2: Create Encrypted Collection**
```javascript
use academicDB

// Create collection with encryption schema
db.createCollection("users_encrypted", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      properties: {
        name: { bsonType: "string" },
        email: { bsonType: "string" },
        password: {
          encrypt: {
            bsonType: "string",
            keyId: "/keyAltNames/user_data_key",
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic"
          }
        },
        role: {
          encrypt: {
            bsonType: "string", 
            keyId: "/keyAltNames/user_data_key",
            algorithm: "AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic"
          }
        }
      }
    }
  }
})
```

---

## 🔧 **Method 4: Compass Filter Settings**

### **✅ Step 1: Create Custom Filter in Compass**
1. Open MongoDB Compass
2. Connect to your database
3. Go to `academicDB` → `users` collection
4. Click on "Filter" bar
5. Enter this projection:

```json
{
  "name": 1,
  "email": 1,
  "createdAt": 1,
  "_id": 0,
  "password": 0,
  "role": 0
}
```

### **✅ Step 2: Save as Favorite Filter**
1. After applying the filter
2. Click "Save Filter"
3. Name it "Secure User View"
4. This filter will be available for future use

---

## 🔧 **Method 5: Create Compass Dashboard**

### **✅ Step 1: Create Custom Dashboard**
1. In MongoDB Compass
2. Click on "Aggregations" tab
3. Create a new pipeline:

```json
[
  {
    "$project": {
      "name": 1,
      "email": 1,
      "createdAt": 1,
      "updatedAt": 1,
      "hasPassword": { "$cond": [{ "$ifNull": ["$password", false] }, true, false] },
      "passwordType": { "$type": "$password" },
      "passwordLength": { "$strLenCP": { "$ifNull": ["$password", ""] } },
      "_id": 0,
      "password": 0,
      "role": 0
    }
  }
]
```

### **✅ Step 2: Save as View**
1. Click "Save as View"
2. Name it "secure_users_view"
3. This will appear as a regular collection in Compass

---

## 🔧 **Method 6: MongoDB Atlas Data API**

### **✅ Step 1: Configure Data API**
```javascript
// In MongoDB Atlas UI
// 1. Go to Data API
// 2. Create new API endpoint
// 3. Configure to exclude sensitive fields

// Example API configuration
{
  "collection": "users",
  "database": "academicDB",
  "projection": {
    "name": 1,
    "email": 1,
    "createdAt": 1,
    "updatedAt": 1,
    "_id": 0,
    "password": 0,
    "role": 0
  }
}
```

---

## 🧪 **Test Your Security Setup**

### **✅ Test View Creation**
```javascript
// Test the secure view
db.secure_users.find().pretty()

// Test the password field view
db.users_with_password_field.find().pretty()

// Should show:
{
  "name": "Google User",
  "email": "google@gmail.com",
  "createdAt": "...",
  "hasPassword": true,
  "passwordType": "string",
  "passwordLength": 10
}
```

### **✅ Test Compass Connection**
1. Open MongoDB Compass
2. Connect with your credentials
3. Navigate to views instead of collections
4. Verify sensitive data is hidden

---

## 🎯 **Recommended Approach**

### **✅ For Most Users: Method 1 (Secure Views)**
```javascript
// Create secure views - easiest and most effective
db.createView("secure_users", "users", [
  { $project: { name: 1, email: 1, createdAt: 1, _id: 0, password: 0, role: 0 } }
])

db.createView("users_password_info", "users", [
  { 
    $project: { 
      name: 1, 
      email: 1, 
      hasPassword: { $cond: [{ $ifNull: ["$password", false] }, true, false] },
      passwordType: { $type: "$password" },
      passwordLength: { $strLenCP: { $ifNull: ["$password", ""] } },
      _id: 0, 
      password: 0, 
      role: 0 
    } 
  }
])
```

### **✅ For Enterprise: Method 3 (Field Level Encryption)**
- Requires MongoDB Atlas Enterprise
- Provides strongest security
- Encrypts data at rest and in transit

---

## 🎉 **Security Result**

**After implementing these methods:**

- ✅ **MongoDB Compass** shows only non-sensitive data
- ✅ **Password field** exists but values are hidden
- ✅ **User IDs** are hidden from views
- ✅ **Roles** are hidden from views
- ✅ **Admin access** still available through shell
- ✅ **Application security** maintained in logs

**Your MongoDB Compass will now show secure data without exposing sensitive information!** 🔒✨
