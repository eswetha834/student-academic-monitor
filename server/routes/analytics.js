const express = require("express");
const router = express.Router();
const AnalyticsService = require("../services/analyticsService");
const Analytics = require("../models/Analytics");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const { auth: authMiddleware } = require("../middleware/auth");

function getRoleName(req) {
  return req.user?.role?.name || req.user?.role;
}

// Get student analytics
router.get("/student/:studentId", authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester } = req.query;

    // Check permissions
    if (getRoleName(req) === "student" && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Calculate fresh analytics
    const analytics = await AnalyticsService.calculateStudentAnalytics(studentId, semester);
    
    // Log the view
    await ActivityLog.logActivity({
      userId: req.user._id,
      action: "view",
      resourceType: "analytics",
      resourceId: analytics._id,
      description: `Viewed analytics for student ${studentId}`,
      metadata: { targetUserId: studentId, semester }
    });

    res.json(analytics);
  } catch (error) {
    console.error("Error fetching student analytics:", error);
    res.status(500).json({ message: "Error fetching analytics" });
  }
});

// Get class analytics (for faculty/admin)
router.get("/class", authMiddleware, async (req, res) => {
  try {
    const { semester, department } = req.query;

    // Check permissions
    if (getRoleName(req) === "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const classAnalytics = await AnalyticsService.getClassAnalytics(semester, department);
    
    // Log the view
    await ActivityLog.logActivity({
      userId: req.user._id,
      action: "view",
      resourceType: "analytics",
      description: `Viewed class analytics for semester ${semester}`,
      metadata: { semester, department }
    });

    res.json(classAnalytics);
  } catch (error) {
    console.error("Error fetching class analytics:", error);
    res.status(500).json({ message: "Error fetching class analytics" });
  }
});

// Get at-risk students
router.get("/at-risk", authMiddleware, async (req, res) => {
  try {
    const { semester, riskLevel } = req.query;

    // Check permissions
    if (getRoleName(req) === "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const matchQuery = { riskLevel: { $in: ["high", "critical"] } };
    if (semester) matchQuery.semester = semester;
    if (riskLevel) matchQuery.riskLevel = riskLevel;

    const atRiskStudents = await Analytics.find(matchQuery)
      .populate('studentId', 'name email rollNumber department')
      .sort({ riskLevel: -1, averageMarks: 1 });

    // Log the view
    await ActivityLog.logActivity({
      userId: req.user._id,
      action: "view",
      resourceType: "analytics",
      description: `Viewed at-risk students list`,
      metadata: { semester, riskLevel }
    });

    res.json(atRiskStudents);
  } catch (error) {
    console.error("Error fetching at-risk students:", error);
    res.status(500).json({ message: "Error fetching at-risk students" });
  }
});

// Get performance trends
router.get("/trends/:studentId", authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { period = "semester" } = req.query;

    // Check permissions
    if (getRoleName(req) === "student" && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get historical analytics data
    const historicalData = await Analytics.find({ studentId })
      .sort({ createdAt: 1 })
      .limit(period === "year" ? 12 : 6); // Last 12 months or 6 entries

    // Log the view
    await ActivityLog.logActivity({
      userId: req.user._id,
      action: "view",
      resourceType: "analytics",
      description: `Viewed performance trends for student ${studentId}`,
      metadata: { targetUserId: studentId, period }
    });

    res.json(historicalData);
  } catch (error) {
    console.error("Error fetching performance trends:", error);
    res.status(500).json({ message: "Error fetching trends" });
  }
});

// Get subject-wise performance comparison
router.get("/subject-comparison/:studentId", authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check permissions
    if (getRoleName(req) === "student" && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const analytics = await Analytics.findOne({ 
      studentId, 
      semester: req.query.semester 
    }).populate('studentId', 'name department');

    if (!analytics) {
      return res.status(404).json({ message: "Analytics not found" });
    }

    // Get class average for comparison
    const classAverage = await Analytics.aggregate([
      { $match: { semester: req.query.semester } },
      { $unwind: "$subjectPerformance" },
      { 
        $group: {
          _id: "$subjectPerformance.subject",
          averageMarks: { $avg: "$subjectPerformance.averageMarks" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Combine student performance with class averages
    const comparison = analytics.subjectPerformance.map(subject => {
      const classAvg = classAverage.find(c => c._id === subject.subject);
      return {
        subject: subject.subject,
        studentMarks: subject.averageMarks,
        classAverage: classAvg ? Math.round(classAvg.averageMarks * 100) / 100 : 0,
        difference: classAvg ? Math.round((subject.averageMarks - classAvg.averageMarks) * 100) / 100 : 0,
        trend: subject.trend,
        riskLevel: subject.riskLevel
      };
    });

    // Log the view
    await ActivityLog.logActivity({
      userId: req.user._id,
      action: "view",
      resourceType: "analytics",
      description: `Viewed subject comparison for student ${studentId}`,
      metadata: { targetUserId: studentId, semester: req.query.semester }
    });

    res.json(comparison);
  } catch (error) {
    console.error("Error fetching subject comparison:", error);
    res.status(500).json({ message: "Error fetching subject comparison" });
  }
});

// Update analytics manually (trigger recalculation)
router.post("/recalculate/:studentId", authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester } = req.body;

    // Check permissions (only faculty and admin can trigger recalculation)
    if (getRoleName(req) === "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const analytics = await AnalyticsService.calculateStudentAnalytics(studentId, semester);
    
    // Log the action
    await ActivityLog.logActivity({
      userId: req.user._id,
      action: "update",
      resourceType: "analytics",
      resourceId: analytics._id,
      description: `Manually recalculated analytics for student ${studentId}`,
      metadata: { targetUserId: studentId, semester }
    });

    res.json({ message: "Analytics recalculated successfully", analytics });
  } catch (error) {
    console.error("Error recalculating analytics:", error);
    res.status(500).json({ message: "Error recalculating analytics" });
  }
});

// Get analytics summary for dashboard
router.get("/summary/:studentId", authMiddleware, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check permissions
    if (getRoleName(req) === "student" && req.user._id.toString() !== studentId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const analytics = await Analytics.findOne({ 
      studentId, 
      semester: req.query.semester 
    });

    if (!analytics) {
      return res.status(404).json({ message: "Analytics not found" });
    }

    // Create summary for dashboard
    const summary = {
      gpa: analytics.gpa,
      attendancePercentage: analytics.attendancePercentage,
      riskLevel: analytics.riskLevel,
      marksTrend: analytics.marksTrend,
      attendanceTrend: analytics.attendanceTrend,
      insightsCount: analytics.insights.length,
      recommendationsCount: analytics.recommendations.length,
      predictedGPA: analytics.predictedGPA,
      confidence: analytics.confidence
    };

    // Log the view
    await ActivityLog.logActivity({
      userId: req.user._id,
      action: "view",
      resourceType: "analytics",
      description: `Viewed analytics summary for student ${studentId}`,
      metadata: { targetUserId: studentId, semester: req.query.semester }
    });

    res.json(summary);
  } catch (error) {
    console.error("Error fetching analytics summary:", error);
    res.status(500).json({ message: "Error fetching summary" });
  }
});

module.exports = router;
