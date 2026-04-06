# Firebase Setup Guide for Academic Monitor

## 🚀 Quick Setup Instructions

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "academic-monitor")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Get Firebase Configuration
1. In your Firebase project, click the Web icon (</>) to add a web app
2. Enter app name (e.g., "Academic Monitor Web")
3. Click "Register app"
4. Copy the Firebase configuration object
5. Update the `firebaseConfig` in `client/src/firebase.js`

### 3. Enable Firebase Services
#### Authentication
1. Go to "Authentication" in Firebase Console
2. Click "Get started"
3. Enable "Email/Password" sign-in method
4. Click "Save"

#### Firestore Database
1. Go to "Firestore Database" in Firebase Console
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Create database"

#### Storage (Optional)
1. Go to "Storage" in Firebase Console
2. Click "Get started"
3. Select "Start in test mode"
4. Click "Done"

### 4. Update Firebase Configuration
Replace the placeholder config in `client/src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id" // optional
};
```

### 5. Install Firebase Dependencies
```bash
cd client
npm install firebase@10.7.1
```

### 6. Update App.js to Use Firebase Context
```javascript
import { FirebaseProvider } from './contexts/FirebaseContext';

function App() {
  return (
    <FirebaseProvider>
      <BrowserRouter>
        <Routes>
          {/* Your routes */}
        </Routes>
      </BrowserRouter>
    </FirebaseProvider>
  );
}
```

## 📊 Firebase Collections Structure

### Users Collection
```
users/{userId}
{
  uid: string,
  email: string,
  name: string,
  role: string, // 'student', 'teacher', 'admin'
  department: string,
  semester: string,
  rollNumber: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Marks Collection
```
marks/{marksId}
{
  studentId: string,
  subject: string,
  marks: number,
  attendance: number,
  semester: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Attendance Collection
```
attendance/{attendanceId}
{
  studentId: string,
  date: string,
  status: string, // 'present', 'absent', 'late'
  subject: string,
  createdAt: timestamp
}
```

### Goals Collection
```
goals/{goalId}
{
  studentId: string,
  subject: string,
  target: number,
  deadline: string,
  current: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Study Sessions Collection
```
studySessions/{sessionId}
{
  studentId: string,
  subject: string,
  duration: number,
  topics: string,
  progress: number,
  date: string,
  createdAt: timestamp
}
```

### Notifications Collection
```
notifications/{notificationId}
{
  recipientId: string,
  type: string,
  title: string,
  message: string,
  read: boolean,
  createdAt: timestamp
}
```

## 🔧 Firebase Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read their own marks
    match /marks/{marksId} {
      allow read: if request.auth != null && 
        resource.data.studentId == request.auth.uid;
      allow write: if request.auth != null && 
        resource.data.studentId == request.auth.uid;
    }
    
    // Users can manage their own goals
    match /goals/{goalId} {
      allow read, write: if request.auth != null && 
        resource.data.studentId == request.auth.uid;
    }
    
    // Users can manage their own study sessions
    match /studySessions/{sessionId} {
      allow read, write: if request.auth != null && 
        resource.data.studentId == request.auth.uid;
    }
    
    // Users can read their own notifications
    match /notifications/{notificationId} {
      allow read: if request.auth != null && 
        resource.data.recipientId == request.auth.uid;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 Usage Examples

### Authentication
```javascript
import { useFirebase } from './contexts/FirebaseContext';

function Login() {
  const { login } = useFirebase();
  
  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      // Navigate to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
}
```

### Data Operations
```javascript
import { firebaseAcademicService } from './services/firebaseService';

// Add marks
await firebaseAcademicService.addMarks({
  studentId: 'user123',
  subject: 'Mathematics',
  marks: 85,
  attendance: 90
});

// Get student marks
const marks = await firebaseAcademicService.getStudentMarks('user123');

// Add goal
await firebaseAcademicService.addGoal({
  studentId: 'user123',
  subject: 'Physics',
  target: 90,
  deadline: '2024-12-31',
  current: 75
});
```

## 🔄 Migration from MongoDB

If you want to migrate from MongoDB to Firebase:

1. **Export Data**: Export your MongoDB data to JSON
2. **Transform**: Convert data to Firebase structure
3. **Import**: Use Firebase Admin SDK to bulk import data
4. **Update Code**: Replace MongoDB calls with Firebase calls

### Migration Script Example
```javascript
// server/migrate-to-firebase.js
const admin = require('firebase-admin');
const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateUsers() {
  const users = await User.find({});
  
  for (const user of users) {
    await db.collection('users').doc(user._id.toString()).set({
      uid: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      semester: user.semester,
      rollNumber: user.rollNumber
    });
  }
}

async function migrateMarks() {
  const marks = await Marks.find({});
  
  for (const mark of marks) {
    await db.collection('marks').add({
      studentId: mark.studentId.toString(),
      subject: mark.subject,
      marks: mark.marks,
      attendance: mark.attendance,
      semester: mark.semester
    });
  }
}
```

## 🎯 Benefits of Firebase Integration

- **Real-time Updates**: Automatic data synchronization
- **Offline Support**: Cached data works offline
- **Scalability**: Handle millions of users
- **Security**: Built-in authentication and security rules
- **Performance**: Optimized for mobile and web
- **Analytics**: Built-in usage analytics
- **Hosting**: Optional Firebase hosting for static assets

## 🔍 Testing Firebase Connection

```javascript
import { db } from './firebase';

// Test connection
const testConnection = async () => {
  try {
    const testDoc = await db.collection('test').doc('connection').get();
    console.log('Firebase connected successfully!');
  } catch (error) {
    console.error('Firebase connection failed:', error);
  }
};
```

## 📱 Next Steps

1. Set up Firebase project
2. Update configuration
3. Install dependencies
4. Test connection
5. Migrate data (optional)
6. Update authentication flow
7. Test all features

## 🆘 Troubleshooting

### Common Issues
- **Permission Denied**: Check Firestore security rules
- **Invalid API Key**: Verify Firebase configuration
- **Network Error**: Check internet connection
- **Module Not Found**: Install Firebase dependencies

### Debug Tips
- Use Firebase Console to verify data
- Check browser console for errors
- Test with small amounts of data first
- Enable debug mode in Firebase SDK
