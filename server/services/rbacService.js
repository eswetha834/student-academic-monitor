const mongoose = require("mongoose");
const User = require("../models/User");
const Role = require("../models/Role");
const Permission = require("../models/Permission");
const ActivityLog = require("../models/ActivityLog");

class RBACService {
  
  // Initialize default roles and permissions
  static async initializeRBAC() {
    try {
      console.log("Initializing RBAC system...");
      
      // Create default permissions
      const permissions = await this.createDefaultPermissions();
      
      // Create default roles with permissions
      await this.createDefaultRoles(permissions);
      
      console.log("RBAC system initialized successfully");
      return true;
    } catch (error) {
      console.error("Error initializing RBAC:", error);
      return false;
    }
  }

  // Create default permissions
  static async createDefaultPermissions() {
    const defaultPermissions = [
      // User permissions
      { name: "read_own_profile", description: "View own profile", resource: "profile", action: "read", scope: "own" },
      { name: "update_own_profile", description: "Update own profile", resource: "profile", action: "update", scope: "own" },
      { name: "read_all_users", description: "View all users", resource: "user", action: "read", scope: "all" },
      { name: "create_user", description: "Create new user", resource: "user", action: "create", scope: "all" },
      { name: "update_user", description: "Update user", resource: "user", action: "update", scope: "all" },
      { name: "delete_user", description: "Delete user", resource: "user", action: "delete", scope: "all" },
      
      // Marks permissions
      { name: "read_own_marks", description: "View own marks", resource: "marks", action: "read", scope: "own" },
      { name: "update_assigned_marks", description: "Update marks of assigned students", resource: "marks", action: "update", scope: "assigned" },
      { name: "read_all_marks", description: "View all marks", resource: "marks", action: "read", scope: "all" },
      { name: "export_marks", description: "Export marks reports", resource: "marks", action: "export", scope: "all" },
      
      // Analytics permissions
      { name: "read_own_analytics", description: "View own analytics", resource: "analytics", action: "read", scope: "own" },
      { name: "read_assigned_analytics", description: "View analytics of assigned students", resource: "analytics", action: "read", scope: "assigned" },
      { name: "read_all_analytics", description: "View all analytics", resource: "analytics", action: "read", scope: "all" },
      { name: "manage_analytics", description: "Manage analytics system", resource: "analytics", action: "manage", scope: "all" },
      
      // Notification permissions
      { name: "read_own_notifications", description: "View own notifications", resource: "notification", action: "read", scope: "own" },
      { name: "send_notifications", description: "Send notifications", resource: "notification", action: "create", scope: "all" },
      { name: "manage_notifications", description: "Manage notification system", resource: "notification", action: "manage", scope: "all" },
      
      // Report permissions
      { name: "create_own_reports", description: "Create own reports", resource: "report", action: "create", scope: "own" },
      { name: "export_reports", description: "Export reports", resource: "report", action: "export", scope: "all" },
      { name: "read_all_reports", description: "View all reports", resource: "report", action: "read", scope: "all" },
      
      // Course permissions
      { name: "read_courses", description: "View courses", resource: "course", action: "read", scope: "all" },
      { name: "manage_courses", description: "Manage courses", resource: "course", action: "manage", scope: "all" },
      { name: "assign_courses", description: "Assign courses to faculty", resource: "course", action: "assign", scope: "all" },
      
      // System permissions
      { name: "view_dashboard", description: "View dashboard", resource: "dashboard", action: "read", scope: "own" },
      { name: "manage_system", description: "Manage system settings", resource: "system", action: "manage", scope: "all" },
      { name: "view_audit_logs", description: "View audit logs", resource: "system", action: "read", scope: "all" }
    ];

    const createdPermissions = [];
    
    for (const perm of defaultPermissions) {
      const existing = await Permission.findOne({ name: perm.name });
      if (!existing) {
        const permission = await Permission.create(perm);
        createdPermissions.push(permission);
      } else {
        createdPermissions.push(existing);
      }
    }
    
    return createdPermissions;
  }

  // Create default roles
  static async createDefaultRoles(permissions) {
    const permissionMap = {};
    permissions.forEach(p => {
      permissionMap[p.name] = p._id;
    });

    const defaultRoles = [
      {
        name: "student",
        displayName: "Student",
        description: "Regular student with basic access",
        hierarchy: 0,
        permissions: [
          permissionMap["read_own_profile"],
          permissionMap["update_own_profile"],
          permissionMap["read_own_marks"],
          permissionMap["read_own_analytics"],
          permissionMap["read_own_notifications"],
          permissionMap["create_own_reports"],
          permissionMap["read_courses"],
          permissionMap["view_dashboard"]
        ],
        settings: {
          canManageStudents: false,
          canManageFaculty: false,
          canViewAllDepartments: false,
          canExportReports: false,
          canSendNotifications: false,
          canManageCourses: false,
          canViewAnalytics: true,
          canManageSystem: false
        }
      },
      {
        name: "faculty",
        displayName: "Faculty",
        description: "Faculty member with teaching privileges",
        hierarchy: 1,
        permissions: [
          permissionMap["read_own_profile"],
          permissionMap["update_own_profile"],
          permissionMap["read_own_marks"],
          permissionMap["update_assigned_marks"],
          permissionMap["read_assigned_analytics"],
          permissionMap["read_own_notifications"],
          permissionMap["send_notifications"],
          permissionMap["export_marks"],
          permissionMap["read_courses"],
          permissionMap["view_dashboard"]
        ],
        settings: {
          canManageStudents: true,
          canManageFaculty: false,
          canViewAllDepartments: false,
          canExportReports: true,
          canSendNotifications: true,
          canManageCourses: false,
          canViewAnalytics: true,
          canManageSystem: false
        }
      },
      {
        name: "head_of_department",
        displayName: "Head of Department",
        description: "Department head with extended privileges",
        hierarchy: 2,
        permissions: [
          permissionMap["read_own_profile"],
          permissionMap["update_own_profile"],
          permissionMap["read_all_marks"],
          permissionMap["update_assigned_marks"],
          permissionMap["read_all_analytics"],
          permissionMap["read_own_notifications"],
          permissionMap["send_notifications"],
          permissionMap["export_marks"],
          permissionMap["export_reports"],
          permissionMap["read_all_reports"],
          permissionMap["read_courses"],
          permissionMap["manage_courses"],
          permissionMap["view_dashboard"],
          permissionMap["read_all_users"]
        ],
        settings: {
          canManageStudents: true,
          canManageFaculty: true,
          canViewAllDepartments: true,
          canExportReports: true,
          canSendNotifications: true,
          canManageCourses: true,
          canViewAnalytics: true,
          canManageSystem: false
        }
      },
      {
        name: "admin",
        displayName: "Administrator",
        description: "System administrator with full access",
        hierarchy: 3,
        permissions: Object.values(permissionMap), // All permissions
        settings: {
          canManageStudents: true,
          canManageFaculty: true,
          canViewAllDepartments: true,
          canExportReports: true,
          canSendNotifications: true,
          canManageCourses: true,
          canViewAnalytics: true,
          canManageSystem: true
        }
      }
    ];

    for (const role of defaultRoles) {
      const existing = await Role.findOne({ name: role.name });
      if (!existing) {
        await Role.create(role);
      }
    }
  }

  // Check if user has permission
  static async hasPermission(userId, resource, action, scope = "own", targetUserId = null) {
    try {
      const user = await User.findById(userId).populate({
        path: 'role',
        populate: {
          path: 'permissions'
        }
      });

      if (!user || !user.role) {
        return false;
      }

      // Admin has all permissions
      if (user.role.name === "admin") {
        return true;
      }

      // Check role permissions
      const hasRolePermission = user.role.permissions.some(permission => {
        return permission.resource === resource && 
               permission.action === action && 
               (permission.scope === scope || permission.scope === "all");
      });

      if (!hasRolePermission) {
        return false;
      }

      // For scope-based permissions, check additional conditions
      if (scope === "own") {
        return userId.toString() === targetUserId?.toString();
      }

      if (scope === "assigned") {
        // Check if target user is assigned to current user (e.g., student assigned to faculty)
        return await this.isAssignedToUser(userId, targetUserId, resource);
      }

      if (scope === "department") {
        // Check if both users are in same department
        return await this.areInSameDepartment(userId, targetUserId);
      }

      return true;
    } catch (error) {
      console.error("Error checking permission:", error);
      return false;
    }
  }

  // Check if target user is assigned to current user
  static async isAssignedToUser(userId, targetUserId, resource) {
    try {
      // This would depend on your specific assignment logic
      // For example, students assigned to faculty for specific courses
      
      if (resource === "marks" || resource === "analytics") {
        // Check if faculty teaches the student
        const faculty = await User.findById(userId);
        const student = await User.findById(targetUserId);
        
        // Simple check: same department and faculty role
        return faculty.role === "faculty" && 
               student.role === "student" && 
               faculty.department === student.department;
      }
      
      return false;
    } catch (error) {
      console.error("Error checking assignment:", error);
      return false;
    }
  }

  // Check if users are in same department
  static async areInSameDepartment(userId1, userId2) {
    try {
      const user1 = await User.findById(userId1);
      const user2 = await User.findById(userId2);
      
      return user1.department === user2.department;
    } catch (error) {
      console.error("Error checking department:", error);
      return false;
    }
  }

  // Get user permissions
  static async getUserPermissions(userId) {
    try {
      const user = await User.findById(userId).populate({
        path: 'role',
        populate: {
          path: 'permissions'
        }
      });

      if (!user || !user.role) {
        return [];
      }

      return user.role.permissions;
    } catch (error) {
      console.error("Error getting user permissions:", error);
      return [];
    }
  }

  // Create custom role
  static async createRole(roleData) {
    try {
      const role = await Role.create(roleData);
      await ActivityLog.logActivity({
        userId: roleData.createdBy,
        action: "create",
        resourceType: "role",
        resourceId: role._id,
        description: `Created new role: ${role.name}`
      });
      return role;
    } catch (error) {
      console.error("Error creating role:", error);
      throw error;
    }
  }

  // Update user role
  static async updateUserRole(userId, newRoleId, updatedBy) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { role: newRoleId },
        { new: true }
      ).populate('role');

      await ActivityLog.logActivity({
        userId: updatedBy,
        action: "update",
        resourceType: "user",
        resourceId: userId,
        description: `Updated role for ${user.name} to ${user.role.name}`,
        metadata: { newRoleId, oldRole: user.role }
      });

      return user;
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  }

  // Get role hierarchy for access control
  static getRoleHierarchy(roleName) {
    const hierarchy = {
      student: 0,
      faculty: 1,
      head_of_department: 2,
      admin: 3
    };
    return hierarchy[roleName] || 0;
  }

  // Check if user can access resource based on role hierarchy
  static canAccessResource(userRole, requiredRole) {
    const userLevel = this.getRoleHierarchy(userRole);
    const requiredLevel = this.getRoleHierarchy(requiredRole);
    return userLevel >= requiredLevel;
  }

  // Middleware factory for Express routes
  static requirePermission(resource, action, scope = "own") {
    return async (req, res, next) => {
      try {
        const userId = req.user._id;
        const targetUserId = req.params.userId || req.body.userId || req.query.userId;
        
        const hasPermission = await this.hasPermission(
          userId, 
          resource, 
          action, 
          scope, 
          targetUserId
        );

        if (!hasPermission) {
          return res.status(403).json({ 
            message: "Access denied. Insufficient permissions." 
          });
        }

        next();
      } catch (error) {
        console.error("Permission check error:", error);
        res.status(500).json({ message: "Error checking permissions" });
      }
    };
  }
}

module.exports = RBACService;
