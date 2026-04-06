// Step 7: Verify Token in Backend (Node) - Firebase Admin Setup
// const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
// Note: You need to download serviceAccountKey.json from Firebase Console
// Go to Project Settings -> Service accounts -> Generate new private key
let serviceAccount = null;
let firebaseAdmin = null;

// Firebase completely disabled for deployment
console.log("🔥 Firebase Admin SDK disabled for deployment");

// Skip Firebase initialization entirely
try {
  // Firebase initialization skipped for deployment
  console.log("✅ Firebase Admin SDK disabled - deployment ready");
} catch (error) {
  console.log("⚠️  Firebase Admin SDK not initialized - disabled for deployment");
  firebaseAdmin = null;
}

// Middleware to verify Firebase token (Step 7)
const verifyToken = async (req, res, next) => {
  if (!firebaseAdmin) {
    return res.status(503).json({ 
      success: false, 
      message: "Firebase Admin SDK not configured. Please set up serviceAccountKey.json" 
    });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ 
      success: false, 
      message: "No token provided" 
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Token format is invalid" 
    });
  }

  try {
    // Verify the Firebase ID token
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    
    // Add user info to request object
    req.user = decoded;
    req.firebaseUid = decoded.uid;
    req.userEmail = decoded.email;
    
    console.log("Token verified successfully for user:", decoded.email);
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    return res.status(401).json({ 
      success: false, 
      message: "Invalid token", 
      error: err.message 
    });
  }
};

// Middleware to check if user exists in database
const checkUserExists = async (req, res, next) => {
  try {
    const User = require('./models/User');
    const user = await User.findOne({ 
      firebaseUid: req.firebaseUid 
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found in database" 
      });
    }

    req.dbUser = user;
    next();
  } catch (error) {
    console.error("Error checking user existence:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Helper function to create or update user in database
const createOrUpdateUser = async (firebaseUser, additionalData = {}) => {
  try {
    const User = require('./models/User');
    
    // Check if user already exists
    let user = await User.findOne({ 
      firebaseUid: firebaseUser.uid 
    });

    if (!user) {
      // Create new user
      user = new User({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        name: additionalData.name || firebaseUser.displayName || 'User',
        role: additionalData.role || 'student',
        department: additionalData.department || '',
        semester: additionalData.semester || '',
        rollNumber: additionalData.rollNumber || '',
        createdAt: new Date()
      });
    } else {
      // Update existing user
      if (additionalData.name) user.name = additionalData.name;
      if (additionalData.role) user.role = additionalData.role;
      if (additionalData.department) user.department = additionalData.department;
      if (additionalData.semester) user.semester = additionalData.semester;
      if (additionalData.rollNumber) user.rollNumber = additionalData.rollNumber;
      user.updatedAt = new Date();
    }

    await user.save();
    return user;
  } catch (error) {
    console.error("Error creating/updating user:", error);
    throw error;
  }
};

// Export functions
module.exports = {
  admin: firebaseAdmin,
  verifyToken,
  checkUserExists,
  createOrUpdateUser
};
