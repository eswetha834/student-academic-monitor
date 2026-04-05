const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  action: {
    type: String,
    enum: [
      "login",
      "logout", 
      "create",
      "update",
      "delete",
      "view",
      "export",
      "upload",
      "download",
      "approve",
      "reject",
      "assign",
      "notify"
    ],
    required: true
  },
  
  resourceType: {
    type: String,
    enum: [
      "user",
      "marks",
      "attendance", 
      "analytics",
      "notification",
      "report",
      "assignment",
      "material",
      "announcement"
    ],
    required: true
  },
  
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  
  description: {
    type: String,
    required: true
  },
  
  // IP address and device info
  ipAddress: String,
  userAgent: String,
  device: String,
  
  // Changes made (for update actions)
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    fields: [String]
  },
  
  // Status
  status: {
    type: String,
    enum: ["success", "failed", "pending"],
    default: "success"
  },
  
  // Error details if failed
  error: {
    message: String,
    stack: String
  },
  
  // Additional metadata
  metadata: {
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    semester: String,
    subject: String,
    marks: Number,
    attendance: Number,
    fileName: String,
    fileSize: Number,
    duration: Number
  },
  
  // Session tracking
  sessionId: String,
  
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ resourceType: 1 });
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ status: 1 });

// Compound index for audit queries
activityLogSchema.index({ 
  resourceType: 1, 
  resourceId: 1, 
  action: 1, 
  timestamp: -1 
});

// Static method for logging activities
activityLogSchema.statics.logActivity = function(activityData) {
  return this.create({
    ...activityData,
    timestamp: new Date()
  });
};

// Static method for getting user activity summary
activityLogSchema.statics.getUserActivitySummary = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: "$action",
        count: { $sum: 1 },
        lastOccurrence: { $max: "$timestamp" }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

module.exports = mongoose.model("ActivityLog", activityLogSchema);
