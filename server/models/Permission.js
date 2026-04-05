const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true,
    enum: [
      "user", "marks", "attendance", "analytics", "notification",
      "report", "assignment", "material", "announcement", "course",
      "system", "dashboard", "profile", "message", "calendar"
    ]
  },
  action: {
    type: String,
    required: true,
    enum: ["create", "read", "update", "delete", "export", "manage", "assign"]
  },
  scope: {
    type: String,
    enum: ["own", "department", "all", "assigned"],
    default: "own"
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
permissionSchema.index({ resource: 1, action: 1 });

module.exports = mongoose.model("Permission", permissionSchema);
