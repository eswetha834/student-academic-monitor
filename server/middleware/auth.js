const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  
  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    
    // Get user (role is stored as string, not ObjectId)
    const user = await User.findById(decoded.user.id);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Role-based access control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ 
        message: "Access denied. User role not found." 
      });
    }
    
    const userRole = req.user.role.name || req.user.role;
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        message: "Access denied. Insufficient permissions." 
      });
    }
    next();
  };
};

// Check specific permission
const requirePermission = (resource, action, scope = 'own') => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({ message: "Access denied. User role not found." });
      }

      // For now, basic role-based check
      const userRole = req.user.role.name || req.user.role;
      
      // Admin can do everything
      if (userRole === 'admin') {
        return next();
      }
      
      // Faculty can manage students and courses
      if (userRole === 'faculty') {
        if (resource === 'marks' && action === 'update') {
          return next();
        }
        if (resource === 'students' && action === 'view') {
          return next();
        }
      }
      
      // Students can only view their own data
      if (userRole === 'student') {
        if (resource === 'profile' && action === 'view') {
          return next();
        }
        if (resource === 'analytics' && action === 'view') {
          return next();
        }
      }
      
      res.status(403).json({ message: "Access denied. Insufficient permissions." });
    } catch (error) {
      console.error("Permission check error:", error);
      res.status(500).json({ message: "Error checking permissions" });
    }
  };
};

module.exports = { auth, authorize, requirePermission };
