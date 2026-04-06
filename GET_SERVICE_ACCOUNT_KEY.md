# 🔑 How to Get Firebase Service Account Key

## 🎯 Step-by-Step Instructions

### 1. Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account
3. Select your Firebase project (or create a new one)

### 2. Navigate to Service Accounts
1. Click on **⚙️ Settings** (gear icon) in the left sidebar
2. Select **Project settings**
3. Click on the **Service accounts** tab

### 3. Generate New Private Key
1. Click on **"Generate new private key"**
2. Select **JSON** as the key type
3. Click **"Create"**
4. The JSON file will be downloaded automatically

### 4. Save the File
1. **Rename** the downloaded file to: `serviceAccountKey.json`
2. **Move** it to your server folder: `C:\Users\eswet\academic-monitor\server\`
3. **Replace** the existing placeholder file

### 5. Restart the Server
```bash
cd C:\Users\eswet\academic-monitor\server
npm start
```

## 📋 What the File Should Look Like

Your `serviceAccountKey.json` should contain:

```json
{
  "type": "service_account",
  "project_id": "your-actual-project-id",
  "private_key_id": "your-actual-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "your-actual-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```

## 🔍 Verification Steps

### 1. Check File Location
Make sure the file is at: `C:\Users\eswet\academic-monitor\server\serviceAccountKey.json`

### 2. Check File Content
Open the file and verify it contains:
- ✅ `type: "service_account"`
- ✅ `project_id` (your actual project ID)
- ✅ `private_key` (long string with BEGIN/END PRIVATE KEY)
- ✅ `client_email` (firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com)

### 3. Restart Server
```bash
cd C:\Users\eswet\academic-monitor\server
npm start
```

You should see:
```
✅ Firebase Admin SDK initialized successfully
```

## 🚨 Troubleshooting

### Error: "Cannot find module './serviceAccountKey.json'"
**Cause**: File doesn't exist or is in wrong location
**Fix**: 
1. Download the service account key from Firebase Console
2. Save it as `serviceAccountKey.json` in the server folder
3. Restart the server

### Error: "Firebase Admin SDK initialization failed"
**Cause**: Invalid or corrupted service account key
**Fix**: 
1. Download a fresh service account key
2. Replace the existing file
3. Restart the server

### Error: "Invalid token"
**Cause**: Firebase project not properly configured
**Fix**: 
1. Check that your Firebase project ID matches the service account key
2. Enable Email/Password authentication in Firebase Console
3. Verify your frontend Firebase config matches the project

## 🎯 Success Indicators

When everything is working, you'll see:

### Server Console:
```
✅ Firebase Admin SDK initialized successfully
Connected to MongoDB
Backend is running on http://localhost:5000
```

### Frontend Console:
```
Firebase Token: eyJhbGciOiJSUzI1NiIs...
Login successful! Firebase + Backend flow working!
```

## 📞 Help

If you're still having issues:

1. **Check Firebase Project**: Make sure your project exists and is active
2. **Verify File Location**: Ensure `serviceAccountKey.json` is in the server folder
3. **Check File Content**: Verify the JSON is valid and contains all required fields
4. **Restart Everything**: Stop and restart both frontend and backend

## 🎉 Next Steps

Once the service account key is working:

1. ✅ Test Firebase authentication
2. ✅ Verify token flow
3. ✅ Integrate with existing login system
4. ✅ Deploy to production

---

**📝 Remember**: Never commit your `serviceAccountKey.json` to version control! Add it to `.gitignore`.
