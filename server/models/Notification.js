const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  type: {
    type: String,
    enum: [
      "marks_updated",
      "attendance_low", 
      "performance_alert",
      "achievement",
      "reminder",
      "system",
      "risk_alert",
      "deadline",
      "announcement"
    ],
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  // Priority levels
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  
  // Status tracking
  isRead: {
    type: Boolean,
    default: false
  },
  
  readAt: {
    type: Date
  },
  
  // Action buttons
  actions: [{
    label: String,
    url: String,
    type: {
      type: String,
      enum: ["primary", "secondary", "danger"]
    }
  }],
  
  // Metadata for rich notifications
  metadata: {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    subject: String,
    marks: Number,
    attendance: Number,
    semester: String,
    riskLevel: String
  },
  
  // Expiration
  expiresAt: {
    type: Date
  },
  
  // Delivery tracking
  deliveryMethods: [{
    type: {
      type: String,
      enum: ["in_app", "email", "sms"],
      default: "in_app"
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "failed"],
      default: "pending"
    }
  }],
  
  // Batch notifications
  batchId: String,
  
  created: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ created: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  if (this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

module.exports = mongoose.model("Notification", notificationSchema);
