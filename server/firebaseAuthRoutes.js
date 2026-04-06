// Step 8: Protect Routes - Firebase Authentication Routes
const express = require('express');
const router = express.Router();
const { verifyToken, createOrUpdateUser } = require('./firebaseAdmin');
const User = require('./models/User');

// Firebase login endpoint
router.post('/firebase-login', verifyToken, async (req, res) => {
  try {
    const { user } = req;
    
    // Check if user exists in database
    let dbUser = await User.findOne({ firebaseUid: user.uid });
    
    if (!dbUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found. Please register first." 
      });
    }

    console.log("Firebase login successful for:", user.email);
    
    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: dbUser._id,
        firebaseUid: dbUser.firebaseUid,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        department: dbUser.department,
        semester: dbUser.semester,
        rollNumber: dbUser.rollNumber
      }
    });
  } catch (error) {
    console.error("Firebase login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during login" 
    });
  }
});

// Firebase registration endpoint
router.post('/firebase-register', verifyToken, async (req, res) => {
  try {
    const { user } = req;
    const { userData } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { firebaseUid: user.uid },
        { email: user.email }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User already exists" 
      });
    }

    // Create new user in database
    const newUser = await createOrUpdateUser(user, userData);

    console.log("Firebase registration successful for:", user.email);
    
    res.json({
      success: true,
      message: "Registration successful",
      user: {
        id: newUser._id,
        firebaseUid: newUser.firebaseUid,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        department: newUser.department,
        semester: newUser.semester,
        rollNumber: newUser.rollNumber
      }
    });
  } catch (error) {
    console.error("Firebase registration error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during registration" 
    });
  }
});

// Logout endpoint
router.post('/logout', verifyToken, async (req, res) => {
  try {
    // You can optionally revoke the token here
    // For now, just confirm logout
    console.log("Firebase logout for:", req.user.email);
    
    res.json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    console.error("Firebase logout error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error during logout" 
    });
  }
});

// Get current user info
router.get('/me', verifyToken, async (req, res) => {
  try {
    const dbUser = await User.findOne({ firebaseUid: req.firebaseUid });
    
    if (!dbUser) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.json({
      success: true,
      user: {
        id: dbUser._id,
        firebaseUid: dbUser.firebaseUid,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        department: dbUser.department,
        semester: dbUser.semester,
        rollNumber: dbUser.rollNumber
      }
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

module.exports = router;
