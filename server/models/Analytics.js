const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  
  // Performance metrics
  averageMarks: {
    type: Number,
    default: 0
  },
  attendancePercentage: {
    type: Number,
    default: 0
  },
  gpa: {
    type: Number,
    default: 0
  },
  
  // Risk detection
  riskLevel: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "low"
  },
  riskFactors: [{
    type: String,
    enum: ["low_marks", "poor_attendance", "declining_performance", "multiple_failures"]
  }],
  
  // Trends
  marksTrend: {
    type: String,
    enum: ["improving", "stable", "declining"],
    default: "stable"
  },
  attendanceTrend: {
    type: String,
    enum: ["improving", "stable", "declining"],
    default: "stable"
  },
  
  // AI-like insights
  insights: [{
    type: {
      type: String,
      enum: ["warning", "recommendation", "achievement", "prediction"]
    },
    message: String,
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Predictions
  predictedGPA: {
    type: Number,
    default: 0
  },
  predictedAttendance: {
    type: Number,
    default: 0
  },
  confidence: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Subject-wise analysis
  subjectPerformance: [{
    subject: String,
    averageMarks: Number,
    trend: String,
    riskLevel: String
  }],
  
  // Recommendations
  recommendations: [{
    type: {
      type: String,
      enum: ["study_focus", "attendance_improvement", "extra_help", "time_management"]
    },
    subject: String,
    action: String,
    priority: String
  }],
  
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
analyticsSchema.index({ studentId: 1, semester: 1 });
analyticsSchema.index({ riskLevel: 1 });
analyticsSchema.index({ lastUpdated: 1 });

module.exports = mongoose.model("Analytics", analyticsSchema);
