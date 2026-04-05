const mongoose = require("mongoose");
const User = require("../models/User");
const Marks = require("../models/Marks");
const Analytics = require("../models/Analytics");
const Notification = require("../models/Notification");
const ActivityLog = require("../models/ActivityLog");

class AnalyticsService {
  
  // Calculate student performance analytics
  static async calculateStudentAnalytics(studentId, semester) {
    try {
      const student = await User.findById(studentId);
      if (!student) {
        throw new Error("Student not found");
      }

      // Get marks data
      const marksData = await Marks.find({ 
        studentId, 
        semester: semester || student.semester 
      });

      if (marksData.length === 0) {
        return this.createDefaultAnalytics(studentId, semester || student.semester);
      }

      // Calculate basic metrics
      const totalMarks = marksData.reduce((sum, mark) => sum + mark.marks, 0);
      const averageMarks = totalMarks / marksData.length;
      const attendancePercentage = marksData.reduce((sum, mark) => sum + mark.attendance, 0) / marksData.length;
      
      // Calculate GPA (simplified: scale of 10)
      const gpa = (averageMarks / 100) * 10;

      // Analyze trends
      const trends = await this.analyzeTrends(studentId, semester || student.semester);
      
      // Detect risk factors
      const riskAnalysis = this.detectRiskFactors(averageMarks, attendancePercentage, trends);
      
      // Generate AI-like insights
      const insights = this.generateInsights(student, averageMarks, attendancePercentage, trends, riskAnalysis);
      
      // Predict future performance
      const predictions = this.predictPerformance(marksData, trends);
      
      // Subject-wise analysis
      const subjectPerformance = this.analyzeSubjectPerformance(marksData);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(riskAnalysis, subjectPerformance, trends);

      // Create or update analytics record
      const analytics = await Analytics.findOneAndUpdate(
        { studentId, semester: semester || student.semester },
        {
          averageMarks: Math.round(averageMarks * 100) / 100,
          attendancePercentage: Math.round(attendancePercentage * 100) / 100,
          gpa: Math.round(gpa * 100) / 100,
          riskLevel: riskAnalysis.level,
          riskFactors: riskAnalysis.factors,
          marksTrend: trends.marks,
          attendanceTrend: trends.attendance,
          insights,
          predictedGPA: predictions.gpa,
          predictedAttendance: predictions.attendance,
          confidence: predictions.confidence,
          subjectPerformance,
          recommendations,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );

      // Create notifications for high-risk students
      if (riskAnalysis.level === "high" || riskAnalysis.level === "critical") {
        await this.createRiskNotifications(student, riskAnalysis, analytics);
      }

      // Log the analytics calculation
      await ActivityLog.logActivity({
        userId: studentId,
        action: "update",
        resourceType: "analytics",
        resourceId: analytics._id,
        description: `Performance analytics calculated for ${student.name}`,
        metadata: {
          averageMarks,
          attendancePercentage,
          riskLevel: riskAnalysis.level,
          semester: semester || student.semester
        }
      });

      return analytics;
    } catch (error) {
      console.error("Error calculating analytics:", error);
      throw error;
    }
  }

  // Analyze performance trends
  static async analyzeTrends(studentId, semester) {
    try {
      // Get historical data for trend analysis
      const historicalMarks = await Marks.find({ 
        studentId 
      }).sort({ createdAt: 1 });

      if (historicalMarks.length < 2) {
        return { marks: "stable", attendance: "stable" };
      }

      // Calculate marks trend
      const recentMarks = historicalMarks.slice(-5); // Last 5 records
      const olderMarks = historicalMarks.slice(0, -5); // Earlier records
      
      const recentAvg = recentMarks.reduce((sum, mark) => sum + mark.marks, 0) / recentMarks.length;
      const olderAvg = olderMarks.length > 0 ? 
        olderMarks.reduce((sum, mark) => sum + mark.marks, 0) / olderMarks.length : recentAvg;

      let marksTrend = "stable";
      if (recentAvg > olderAvg + 5) marksTrend = "improving";
      else if (recentAvg < olderAvg - 5) marksTrend = "declining";

      // Calculate attendance trend
      const recentAttendance = recentMarks.reduce((sum, mark) => sum + mark.attendance, 0) / recentMarks.length;
      const olderAttendance = olderMarks.length > 0 ? 
        olderMarks.reduce((sum, mark) => sum + mark.attendance, 0) / olderMarks.length : recentAttendance;

      let attendanceTrend = "stable";
      if (recentAttendance > olderAttendance + 5) attendanceTrend = "improving";
      else if (recentAttendance < olderAttendance - 5) attendanceTrend = "declining";

      return { 
        marks: marksTrend, 
        attendance: attendanceTrend 
      };
    } catch (error) {
      console.error("Error analyzing trends:", error);
      return { marks: "stable", attendance: "stable" };
    }
  }

  // Detect risk factors
  static detectRiskFactors(averageMarks, attendancePercentage, trends) {
    const riskFactors = [];
    let riskLevel = "low";

    // Low marks risk
    if (averageMarks < 40) {
      riskFactors.push("low_marks");
      riskLevel = "critical";
    } else if (averageMarks < 60) {
      riskFactors.push("low_marks");
      if (riskLevel !== "critical") riskLevel = "high";
    }

    // Poor attendance risk
    if (attendancePercentage < 60) {
      riskFactors.push("poor_attendance");
      if (riskLevel !== "critical") riskLevel = "high";
    } else if (attendancePercentage < 75) {
      riskFactors.push("poor_attendance");
      if (riskLevel === "low") riskLevel = "medium";
    }

    // Declining performance risk
    if (trends.marks === "declining") {
      riskFactors.push("declining_performance");
      if (riskLevel === "low") riskLevel = "medium";
    }

    // Multiple failures (would need subject-wise failure data)
    // This is a placeholder for future enhancement

    return { level: riskLevel, factors: riskFactors };
  }

  // Generate AI-like insights
  static generateInsights(student, averageMarks, attendancePercentage, trends, riskAnalysis) {
    const insights = [];

    // Performance insights
    if (averageMarks >= 80) {
      insights.push({
        type: "achievement",
        message: `Excellent performance! ${student.name} is among the top performers with ${averageMarks.toFixed(1)}% average marks.`,
        priority: "high"
      });
    } else if (averageMarks >= 60) {
      insights.push({
        type: "achievement", 
        message: `Good performance! ${student.name} is maintaining ${averageMarks.toFixed(1)}% average marks.`,
        priority: "medium"
      });
    }

    // Attendance insights
    if (attendancePercentage >= 95) {
      insights.push({
        type: "achievement",
        message: `Outstanding attendance record at ${attendancePercentage.toFixed(1)}%`,
        priority: "medium"
      });
    } else if (attendancePercentage < 75) {
      insights.push({
        type: "warning",
        message: `Attendance below optimal at ${attendancePercentage.toFixed(1)}%. Regular attendance is crucial for academic success.`,
        priority: "high"
      });
    }

    // Trend insights
    if (trends.marks === "improving") {
      insights.push({
        type: "achievement",
        message: "Great progress! Academic performance is showing positive improvement.",
        priority: "high"
      });
    } else if (trends.marks === "declining") {
      insights.push({
        type: "warning",
        message: "Performance trend is declining. Consider additional support and study strategies.",
        priority: "high"
      });
    }

    // Risk-based insights
    if (riskAnalysis.level === "critical") {
      insights.push({
        type: "warning",
        message: "⚠️ CRITICAL: Student requires immediate academic intervention and support.",
        priority: "high"
      });
    } else if (riskAnalysis.level === "high") {
      insights.push({
        type: "warning",
        message: "Student is at high risk and needs proactive academic support.",
        priority: "high"
      });
    }

    // Predictive insights
    if (trends.marks === "improving" && attendancePercentage >= 85) {
      insights.push({
        type: "prediction",
        message: "Based on current trends, student is on track for excellent academic outcomes.",
        priority: "medium"
      });
    }

    return insights;
  }

  // Predict future performance
  static predictPerformance(marksData, trends) {
    try {
      if (marksData.length < 3) {
        return { gpa: 0, attendance: 0, confidence: 0 };
      }

      // Simple linear regression for prediction
      const recentMarks = marksData.slice(-5);
      const marksValues = recentMarks.map(m => m.marks);
      const attendanceValues = recentMarks.map(m => m.attendance);

      // Calculate trend slope for marks
      const marksSlope = this.calculateSlope(marksValues);
      const attendanceSlope = this.calculateSlope(attendanceValues);

      // Predict next values
      const lastMarks = marksValues[marksValues.length - 1];
      const lastAttendance = attendanceValues[attendanceValues.length - 1];

      const predictedMarks = Math.max(0, Math.min(100, lastMarks + marksSlope));
      const predictedAttendance = Math.max(0, Math.min(100, lastAttendance + attendanceSlope));

      // Calculate confidence based on data consistency
      const marksVariance = this.calculateVariance(marksValues);
      const confidence = Math.max(0, Math.min(100, 100 - marksVariance));

      return {
        gpa: (predictedMarks / 100) * 10,
        attendance: predictedAttendance,
        confidence: Math.round(confidence)
      };
    } catch (error) {
      console.error("Error predicting performance:", error);
      return { gpa: 0, attendance: 0, confidence: 0 };
    }
  }

  // Calculate slope for linear regression
  static calculateSlope(values) {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // Sum of indices
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares of indices

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope || 0;
  }

  // Calculate variance for confidence
  static calculateVariance(values) {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  // Analyze subject-wise performance
  static analyzeSubjectPerformance(marksData) {
    const subjectMap = new Map();

    marksData.forEach(mark => {
      if (!subjectMap.has(mark.subject)) {
        subjectMap.set(mark.subject, {
          subject: mark.subject,
          marks: [],
          attendance: []
        });
      }
      
      const subject = subjectMap.get(mark.subject);
      subject.marks.push(mark.marks);
      subject.attendance.push(mark.attendance);
    });

    const subjectPerformance = [];
    
    subjectMap.forEach((data, subject) => {
      const avgMarks = data.marks.reduce((sum, mark) => sum + mark, 0) / data.marks.length;
      const avgAttendance = data.attendance.reduce((sum, att) => sum + att, 0) / data.attendance.length;
      
      let riskLevel = "low";
      if (avgMarks < 40) riskLevel = "critical";
      else if (avgMarks < 60) riskLevel = "high";
      else if (avgMarks < 75) riskLevel = "medium";

      // Determine trend
      const trend = data.marks.length >= 2 ? 
        (data.marks[data.marks.length - 1] > data.marks[0] ? "improving" : "declining") : 
        "stable";

      subjectPerformance.push({
        subject,
        averageMarks: Math.round(avgMarks * 100) / 100,
        trend,
        riskLevel
      });
    });

    return subjectPerformance;
  }

  // Generate personalized recommendations
  static generateRecommendations(riskAnalysis, subjectPerformance, trends) {
    const recommendations = [];

    // Risk-based recommendations
    if (riskAnalysis.factors.includes("low_marks")) {
      recommendations.push({
        type: "study_focus",
        subject: "General",
        action: "Increase daily study time by 1-2 hours and seek help from teachers for difficult concepts",
        priority: "high"
      });
    }

    if (riskAnalysis.factors.includes("poor_attendance")) {
      recommendations.push({
        type: "attendance_improvement",
        subject: "General",
        action: "Focus on maintaining regular attendance. Set daily reminders for classes",
        priority: "high"
      });
    }

    // Subject-specific recommendations
    subjectPerformance.forEach(subject => {
      if (subject.riskLevel === "high" || subject.riskLevel === "critical") {
        recommendations.push({
          type: "extra_help",
          subject: subject.subject,
          action: `Immediate attention needed in ${subject.subject}. Consider tutoring and extra practice`,
          priority: "high"
        });
      } else if (subject.trend === "declining") {
        recommendations.push({
          type: "study_focus",
          subject: subject.subject,
          action: `${subject.subject} performance is declining. Review recent topics and practice more`,
          priority: "medium"
        });
      }
    });

    // Trend-based recommendations
    if (trends.marks === "improving") {
      recommendations.push({
        type: "time_management",
        subject: "General",
        action: "Continue current study strategies. Consider sharing successful methods with peers",
        priority: "low"
      });
    }

    return recommendations;
  }

  // Create risk notifications
  static async createRiskNotifications(student, riskAnalysis, analytics) {
    try {
      // Notification for student
      await Notification.create({
        recipientId: student._id,
        type: "risk_alert",
        title: "Academic Performance Alert",
        message: `Your academic performance needs attention. Current risk level: ${riskAnalysis.level.toUpperCase()}`,
        priority: riskAnalysis.level === "critical" ? "urgent" : "high",
        metadata: {
          studentId: student._id,
          riskLevel: riskAnalysis.level,
          averageMarks: analytics.averageMarks,
          attendancePercentage: analytics.attendancePercentage
        },
        actions: [
          {
            label: "View Analytics",
            url: "/student/analytics",
            type: "primary"
          },
          {
            label: "Contact Advisor",
            url: "/messages",
            type: "secondary"
          }
        ]
      });

      // Notification for faculty (if assigned)
      const faculty = await User.find({ role: "faculty" });
      for (const teacher of faculty) {
        await Notification.create({
          recipientId: teacher._id,
          senderId: student._id,
          type: "risk_alert",
          title: "Student Risk Alert",
          message: `${student.name} is at ${riskAnalysis.level} risk level and requires attention`,
          priority: riskAnalysis.level === "critical" ? "urgent" : "high",
          metadata: {
            studentId: student._id,
            riskLevel: riskAnalysis.level,
            averageMarks: analytics.averageMarks,
            attendancePercentage: analytics.attendancePercentage
          },
          actions: [
            {
              label: "View Student Profile",
              url: `/faculty/student/${student._id}`,
              type: "primary"
            }
          ]
        });
      }
    } catch (error) {
      console.error("Error creating risk notifications:", error);
    }
  }

  // Create default analytics for new students
  static createDefaultAnalytics(studentId, semester) {
    return Analytics.create({
      studentId,
      semester,
      averageMarks: 0,
      attendancePercentage: 0,
      gpa: 0,
      riskLevel: "low",
      riskFactors: [],
      marksTrend: "stable",
      attendanceTrend: "stable",
      insights: [{
        type: "recommendation",
        message: "No academic data available yet. Regular assessment will help track progress.",
        priority: "medium"
      }],
      predictedGPA: 0,
      predictedAttendance: 0,
      confidence: 0,
      subjectPerformance: [],
      recommendations: []
    });
  }

  // Get class analytics for faculty/admin
  static async getClassAnalytics(semester, department = null) {
    try {
      const matchQuery = { semester };
      if (department) {
        matchQuery.department = department;
      }

      const students = await User.find(matchQuery);
      const studentIds = students.map(s => s._id);

      const analytics = await Analytics.find({
        studentId: { $in: studentIds },
        semester
      }).populate('studentId', 'name email rollNumber');

      // Calculate class statistics
      const classStats = {
        totalStudents: students.length,
        averageGPA: 0,
        averageAttendance: 0,
        riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
        topPerformers: [],
        atRiskStudents: []
      };

      if (analytics.length > 0) {
        const totalGPA = analytics.reduce((sum, a) => sum + a.gpa, 0);
        const totalAttendance = analytics.reduce((sum, a) => sum + a.attendancePercentage, 0);
        
        classStats.averageGPA = Math.round((totalGPA / analytics.length) * 100) / 100;
        classStats.averageAttendance = Math.round((totalAttendance / analytics.length) * 100) / 100;

        // Risk distribution
        analytics.forEach(a => {
          classStats.riskDistribution[a.riskLevel]++;
        });

        // Top performers (GPA >= 8.0)
        classStats.topPerformers = analytics
          .filter(a => a.gpa >= 8.0)
          .sort((a, b) => b.gpa - a.gpa)
          .slice(0, 5)
          .map(a => ({
            student: a.studentId,
            gpa: a.gpa,
            attendance: a.attendancePercentage
          }));

        // At-risk students
        classStats.atRiskStudents = analytics
          .filter(a => a.riskLevel === "high" || a.riskLevel === "critical")
          .sort((a, b) => {
            const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
          })
          .map(a => ({
            student: a.studentId,
            riskLevel: a.riskLevel,
            riskFactors: a.riskFactors,
            gpa: a.gpa,
            attendance: a.attendancePercentage
          }));
      }

      return classStats;
    } catch (error) {
      console.error("Error getting class analytics:", error);
      throw error;
    }
  }
}

module.exports = AnalyticsService;
