const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ["admin", "faculty", "student", "head_of_department", "counselor", "librarian"]
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Permission"
  }],
  hierarchy: {
    type: Number,
    default: 0 // 0 = student, 1 = faculty, 2 = head_of_department, 3 = admin
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Additional role-specific settings
  settings: {
    canManageStudents: { type: Boolean, default: false },
    canManageFaculty: { type: Boolean, default: false },
    canViewAllDepartments: { type: Boolean, default: false },
    canExportReports: { type: Boolean, default: false },
    canSendNotifications: { type: Boolean, default: false },
    canManageCourses: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false },
    canManageSystem: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Index for efficient queries
roleSchema.index({ hierarchy: 1 });

// Static method to get role by hierarchy level
roleSchema.statics.getByHierarchy = function(level) {
  return this.findOne({ hierarchy: level });
};

// Method to check if role has specific permission
roleSchema.methods.hasPermission = function(resource, action, scope = "own") {
  // For admin role, grant all permissions
  if (this.name === "admin") {
    return true;
  }
  
  // Check if permission exists in role's permissions
  return this.permissions.some(permission => {
    return permission.resource === resource && 
           permission.action === action && 
           (permission.scope === scope || permission.scope === "all");
  });
};

module.exports = mongoose.model("Role", roleSchema);
