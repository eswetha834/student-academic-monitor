const express = require("express");
const router = express.Router();
const { auth: authMiddleware } = require("../middleware/auth");
const User = require("../models/User");
const Marks = require("../models/Marks");
const AttendanceRecord = require("../models/AttendanceRecord");
const StudentTeacherAssignment = require("../models/StudentTeacherAssignment");
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable');

const calculateGPA = (marks) => {
  // Convert percentage marks to 4.0 scale CGPA with more granular scale
  if (marks >= 95) return 4.0;
  if (marks >= 92) return 3.9;
  if (marks >= 89) return 3.8;
  if (marks >= 86) return 3.7;
  if (marks >= 83) return 3.6;
  if (marks >= 80) return 3.5;
  if (marks >= 77) return 3.4;
  if (marks >= 74) return 3.3;
  if (marks >= 71) return 3.2;
  if (marks >= 68) return 3.1;
  if (marks >= 65) return 3.0;
  if (marks >= 62) return 2.9;
  if (marks >= 59) return 2.8;
  if (marks >= 56) return 2.7;
  if (marks >= 53) return 2.6;
  if (marks >= 50) return 2.5;
  if (marks >= 47) return 2.4;
  if (marks >= 44) return 2.3;
  if (marks >= 41) return 2.2;
  if (marks >= 38) return 2.1;
  if (marks >= 35) return 2.0;
  if (marks >= 32) return 1.9;
  if (marks >= 29) return 1.8;
  if (marks >= 26) return 1.7;
  if (marks >= 23) return 1.6;
  if (marks >= 20) return 1.5;
  if (marks >= 17) return 1.4;
  if (marks >= 14) return 1.3;
  if (marks >= 11) return 1.2;
  if (marks >= 8) return 1.1;
  if (marks >= 5) return 1.0;
  return 0.0;
};

function verifyFaculty(req, res, next) {
  const r = req.user?.role?.name || req.user?.role;
  if (!["faculty", "teacher", "admin", "head_of_department"].includes(r)) {
    return res.status(403).json({ msg: "Access denied" });
  }
  next();
}

router.get("/performance-stats", authMiddleware, verifyFaculty, async (req, res) => {
  try {
    const allMarks = await Marks.find();
    const subjects = {};
    allMarks.forEach((m) => {
      if (!subjects[m.subject]) subjects[m.subject] = { total: 0, count: 0 };
      subjects[m.subject].total += m.marks;
      subjects[m.subject].count += 1;
    });
    const stats = Object.keys(subjects).map((s) => ({
      subject: s,
      average: Number((subjects[s].total / subjects[s].count).toFixed(2)),
    }));
    res.json(stats);
  } catch (e) {
    res.status(500).send("Error");
  }
});

router.get("/dashboard", authMiddleware, verifyFaculty, async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("_id").lean();
    let totalMarksPct = 0;
    let totalAtt = 0;
    let weakCount = 0;
    for (const st of students) {
      const marks = await Marks.find({ studentId: st._id });
      let total = 0;
      marks.forEach((m) => {
        total += m.marks;
      });
      const avgM = marks.length ? total / marks.length : 0;
      const gpa = parseFloat(calculateGPA(avgM).toFixed(2));
      const attRecords = await AttendanceRecord.find({ studentId: st._id });
      let attendance = 0;
      if (attRecords.length > 0) {
        const present = attRecords.filter((r) => r.status === "Present").length;
        attendance = Math.round((present / attRecords.length) * 100);
      } else {
        let att = 0;
        marks.forEach((m) => {
          att += m.attendance || 0;
        });
        attendance = marks.length ? parseInt((att / marks.length).toFixed(0), 10) : 0;
      }
      totalMarksPct += gpa * 10;
      totalAtt += attendance;
      if (gpa < 4 || attendance < 75) weakCount += 1;
    }
    const n = students.length;
    res.json({
      totalStudents: n,
      avgMarksPercent: n ? Number((totalMarksPct / n).toFixed(1)) : 0,
      attendanceAvg: n ? Math.round(totalAtt / n) : 0,
      weakStudentsCount: weakCount,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Error loading faculty dashboard" });
  }
});

router.get("/students", authMiddleware, verifyFaculty, async (req, res) => {
  try {
    const teacherEmail = req.user.email;
    console.log("Getting assigned students for teacher:", teacherEmail);

    // Get all student-teacher assignments for this teacher
    const assignments = await StudentTeacherAssignment.find({
      teacherEmail: teacherEmail,
      isActive: true
    }).sort({ assignedDate: -1 });

    console.log("Found assignments:", assignments.length);

    // Get student details for assigned students
    const assignedStudents = [];
    for (const assignment of assignments) {
      const student = await User.findOne({
        email: assignment.studentEmail,
        role: "student"
      }).select("name email department semester rollNumber profilePic");

      if (student) {
        assignedStudents.push({
          ...student.toObject(),
          assignedDate: assignment.assignedDate,
          department: assignment.department || student.department
        });
      }
    }

    console.log("Returning assigned students:", assignedStudents.length);
    res.json(assignedStudents);
  } catch (error) {
    console.error("Error fetching assigned students:", error);
    res.status(500).json({ msg: "Error fetching assigned students" });
  }
});

router.get("/dashboard-data", authMiddleware, verifyFaculty, async (req, res) => {
  try {
    const teacherEmail = req.user.email;
    console.log("Getting dashboard data for teacher:", teacherEmail);

    // Get all student-teacher assignments for this teacher
    const assignments = await StudentTeacherAssignment.find({
      teacherEmail: teacherEmail,
      isActive: true
    }).sort({ assignedDate: -1 });

    console.log("Found assignments:", assignments.length);

    // Get student details and calculate statistics
    const assignedStudents = [];
    let totalMarksPct = 0;
    let totalAtt = 0;
    let weakCount = 0;

    for (const assignment of assignments) {
      const student = await User.findOne({
        email: assignment.studentEmail,
        role: "student"
      }).select("_id name email department semester rollNumber profilePic");

      if (student) {
        // Get marks for this student (exclude attendance records)
        const marks = await Marks.find({ studentId: student._id });
        let totalMarks = 0;
        let validMarksCount = 0;
        
        marks.forEach((m) => {
          // Exclude attendance records from CGPA calculation
          if (!m.examType || !m.examType.toLowerCase().includes('attendance')) {
            totalMarks += m.marks || 0;
            validMarksCount++;
          }
        });
        
        const avgMarks = validMarksCount > 0 ? totalMarks / validMarksCount : 0;
        const gpa = calculateGPA(avgMarks);
        
        console.log(`Student: ${student.name}, Total Marks: ${totalMarks}, Valid Count: ${validMarksCount}, Average: ${avgMarks.toFixed(2)}, GPA: ${gpa.toFixed(2)}`);

        // Get attendance for this student
        const attRecords = await AttendanceRecord.find({ studentId: student._id });
        let attendance = 0;
        if (attRecords.length > 0) {
          const present = attRecords.filter((r) => r.status === "Present").length;
          attendance = Math.round((present / attRecords.length) * 100);
        } else {
          let att = 0;
          marks.forEach((m) => {
            att += m.attendance || 0;
          });
          attendance = marks.length ? parseInt((att / marks.length).toFixed(0), 10) : 0;
        }

        assignedStudents.push({
          _id: student._id,
          name: student.name,
          email: student.email,
          department: assignment.department || student.department,
          semester: student.semester,
          rollNumber: student.rollNumber,
          profilePic: student.profilePic,
          averageMarks: Number(avgMarks.toFixed(2)),
          cgpa: Number(gpa.toFixed(2)),
          attendancePercent: attendance,
          assignedDate: assignment.assignedDate,
          marksCount: validMarksCount, // Only actual marks, not attendance
          attendanceCount: attRecords.length
        });

        totalMarksPct += gpa * 10;
        totalAtt += attendance;
        if (gpa < 4 || attendance < 75) weakCount += 1;
      }
    }

    const n = assignedStudents.length;
    const stats = {
      totalStudents: n,
      avgMarksPercent: n ? Number((totalMarksPct / n).toFixed(1)) : 0,
      attendanceAvg: n ? Math.round(totalAtt / n) : 0,
      weakStudentsCount: weakCount
    };

    console.log("Dashboard stats:", stats);
    res.json({
      students: assignedStudents,
      stats: stats
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ msg: "Error fetching dashboard data" });
  }
});

router.get("/chat-students", authMiddleware, verifyFaculty, async (req, res) => {
  try {
    const teacherEmail = req.user.email;
    console.log("Getting chat students for teacher:", teacherEmail);

    // Get all student-teacher assignments for this teacher
    const assignments = await StudentTeacherAssignment.find({
      teacherEmail: teacherEmail,
      isActive: true
    });

    // Get student details for chat (simplified version)
    const chatStudents = [];
    for (const assignment of assignments) {
      const student = await User.findOne({
        email: assignment.studentEmail,
        role: "student"
      }).select("name email department");

      if (student) {
        chatStudents.push({
          _id: student._id,
          id: student._id,
          name: student.name,
          email: student.email,
          department: student.department || assignment.department
        });
      }
    }

    res.json(chatStudents);
  } catch (error) {
    console.error("Error fetching chat students:", error);
    res.status(500).json({ msg: "Error fetching chat students" });
  }
});

// Get student marks for comparison
router.get("/student-marks/:studentId", authMiddleware, verifyFaculty, async (req, res) => {
  try {
    const { studentId } = req.params;
    const marks = await Marks.find({ studentId }).lean();
    res.json({ marks, studentId });
  } catch (error) {
    console.error("Error fetching student marks:", error);
    res.status(500).json({ msg: "Error fetching student marks" });
  }
});

router.post("/marks", authMiddleware, verifyFaculty, async (req, res) => {
  try {
    const { studentId, subject, marks, attendance, suggestion, examType } = req.body;
    const teacherEmail = req.user.email;

    console.log("Adding/updating marks for student:", studentId, "by teacher:", teacherEmail);

    // Validate required fields
    if (!studentId || !subject || marks === undefined || marks === '') {
      return res.status(400).json({ msg: "Please provide studentId, subject, and marks" });
    }

    // Verify that this student is assigned to this teacher
    const assignment = await StudentTeacherAssignment.findOne({
      studentEmail: { $in: [
        (await User.findById(studentId))?.email
      ] },
      teacherEmail: teacherEmail,
      isActive: true
    });

    if (!assignment) {
      return res.status(403).json({ msg: "This student is not assigned to you" });
    }

    // Create or update marks record
    const marksRecord = new Marks({
      studentId,
      subject,
      marks: parseInt(marks),
      attendance: attendance ? parseInt(attendance) : null,
      suggestion,
      examType: examType || 'Internal',
      date: new Date()
    });

    await marksRecord.save();
    console.log("✓ Marks saved successfully");

    res.status(201).json({
      success: true,
      msg: "Marks updated successfully",
      marks: marksRecord
    });
  } catch (error) {
    console.error("Error adding marks:", error);
    res.status(500).json({ msg: "Error adding marks: " + error.message });
  }
});

// Report endpoints
router.get("/reports/attendance", authMiddleware, verifyFaculty, async (req, res) => {
  try {
    const teacherEmail = req.user.email;
    const assignments = await StudentTeacherAssignment.find({ teacherEmail, isActive: true });
    const studentIds = assignments.map(a => a.studentId);

    const attendanceRecords = await AttendanceRecord.find({ studentId: { $in: studentIds } });

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Attendance Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

    const tableData = attendanceRecords.map(record => [
      record.studentId.toString(),
      record.date.toISOString().split('T')[0],
      record.status
    ]);

    if (tableData.length > 0) {
      autoTable(doc, {
        head: [['Student ID', 'Date', 'Status']],
        body: tableData,
        startY: 50,
      });
    }

    const buffer = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance-report.pdf"');
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Error generating attendance report:", error);
    res.status(500).json({ msg: "Error generating report" });
  }
});

router.get("/reports/predictions", authMiddleware, verifyFaculty, async (req, res) => {
  try {
    const teacherEmail = req.user.email;
    const assignments = await StudentTeacherAssignment.find({ teacherEmail, isActive: true });
    const studentIds = assignments.map(a => a.studentId);

    const marks = await Marks.find({ studentId: { $in: studentIds } });

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Predictions Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

    // Simple prediction logic: average marks
    const predictions = marks.reduce((acc, mark) => {
      const id = mark.studentId.toString();
      if (!acc[id]) acc[id] = { total: 0, count: 0 };
      acc[id].total += mark.marks;
      acc[id].count += 1;
      return acc;
    }, {});

    const tableData = Object.entries(predictions).map(([id, data]) => [
      id,
      (data.total / data.count).toFixed(2)
    ]);

    if (tableData.length > 0) {
      autoTable(doc, {
        head: [['Student ID', 'Predicted GPA']],
        body: tableData,
        startY: 50,
      });
    }

    const buffer = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="predictions-report.pdf"');
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Error generating predictions report:", error);
    res.status(500).json({ msg: "Error generating report" });
  }
});

router.get("/reports/performance", authMiddleware, verifyFaculty, async (req, res) => {
  try {
    const teacherEmail = req.user.email;
    const assignments = await StudentTeacherAssignment.find({ teacherEmail, isActive: true });
    const studentIds = assignments.map(a => a.studentId);

    const marks = await Marks.find({ studentId: { $in: studentIds } });

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Performance Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

    const performance = marks.reduce((acc, mark) => {
      const id = mark.studentId.toString();
      if (!acc[id]) acc[id] = [];
      acc[id].push(mark.marks);
      return acc;
    }, {});

    const tableData = Object.entries(performance).map(([id, marksArray]) => [
      id,
      marksArray.length,
      (marksArray.reduce((a, b) => a + b, 0) / marksArray.length).toFixed(2)
    ]);

    if (tableData.length > 0) {
      autoTable(doc, {
        head: [['Student ID', 'Subjects', 'Average Marks']],
        body: tableData,
        startY: 50,
      });
    }

    const buffer = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="performance-report.pdf"');
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Error generating performance report:", error);
    res.status(500).json({ msg: "Error generating report" });
  }
});

router.post("/ai-suggestions", authMiddleware, verifyFaculty, async (req, res) => {
  try {
    const teacherEmail = req.user.email;
    const assignments = await StudentTeacherAssignment.find({ teacherEmail, isActive: true });
    const studentIds = assignments.map(a => a.studentId);

    const students = await User.find({ _id: { $in: studentIds }, role: "student" }).lean();
    const marks = await Marks.find({ studentId: { $in: studentIds } }).lean();
    const attendance = await AttendanceRecord.find({ studentId: { $in: studentIds } }).lean();

    const suggestions = [];

    // 1. Analyze subject-wise performance
    const subjectPerformance = {};
    const subjectCounts = {};
    marks.forEach(mark => {
      if (!subjectPerformance[mark.subject]) {
        subjectPerformance[mark.subject] = 0;
        subjectCounts[mark.subject] = 0;
      }
      subjectPerformance[mark.subject] += mark.marks;
      subjectCounts[mark.subject] += 1;
    });

    // Find weakest subject
    let weakestSubject = null;
    let weakestAvg = 100;
    Object.entries(subjectPerformance).forEach(([subject, total]) => {
      const avg = total / subjectCounts[subject];
      if (avg < weakestAvg) {
        weakestAvg = avg;
        weakestSubject = subject;
      }
    });

    if (weakestSubject && weakestAvg < 60) {
      suggestions.push(`⚠️ ${weakestSubject} has the lowest average (${weakestAvg.toFixed(1)}%) - focus on additional resources`);
    }

    // Find strongest subject
    let strongestSubject = null;
    let strongestAvg = 0;
    Object.entries(subjectPerformance).forEach(([subject, total]) => {
      const avg = total / subjectCounts[subject];
      if (avg > strongestAvg) {
        strongestAvg = avg;
        strongestSubject = subject;
      }
    });

    if (strongestSubject) {
      suggestions.push(`✓ ${strongestSubject} is your strongest area (${strongestAvg.toFixed(1)}%) - use top performers as peer tutors`);
    }

    // 2. Analyze student-wise performance
    const studentPerformance = {};
    const studentMarksCount = {};
    marks.forEach(mark => {
      if (!studentPerformance[mark.studentId]) {
        studentPerformance[mark.studentId] = { total: 0, subject: [] };
        studentMarksCount[mark.studentId] = 0;
      }
      studentPerformance[mark.studentId].total += mark.marks;
      studentPerformance[mark.studentId].subject.push(mark.marks);
      studentMarksCount[mark.studentId] += 1;
    });

    const topPerformers = [];
    const lowPerformers = [];
    const atRiskStudents = [];

    Object.entries(studentPerformance).forEach(([studentId, data]) => {
      const avg = data.total / studentMarksCount[studentId];
      const student = students.find(s => s._id.toString() === studentId);
      
      if (avg >= 80) {
        topPerformers.push({ name: student?.name || 'Unknown', avg: avg.toFixed(1) });
      } else if (avg < 50) {
        lowPerformers.push({ name: student?.name || 'Unknown', avg: avg.toFixed(1) });
      } else if (avg < 65) {
        atRiskStudents.push({ name: student?.name || 'Unknown', avg: avg.toFixed(1) });
      }
    });

    // Top performers
    if (topPerformers.length > 0) {
      const topNames = topPerformers.slice(0, 3).map(t => `${t.name} (${t.avg}%)`).join(', ');
      suggestions.push(`🏆 Outstanding performers: ${topNames} - Consider for leadership roles`);
    }

    // Low performers
    if (lowPerformers.length > 0) {
      suggestions.push(`🚨 ${lowPerformers.length} students below 50% - Immediate intervention needed: ${lowPerformers.map(l => l.name).join(', ')}`);
    }

    // At-risk students
    if (atRiskStudents.length > 0 && atRiskStudents.length <= 5) {
      const riskNames = atRiskStudents.map(r => `${r.name} (${r.avg}%)`).join(', ');
      suggestions.push(`⚡ At-risk students (50-65%): ${riskNames} - Provide additional support`);
    } else if (atRiskStudents.length > 5) {
      suggestions.push(`⚡ ${atRiskStudents.length} students in 50-65% range - Consider class-wide intervention`);
    }

    // 3. Analyze attendance patterns
    const attendanceByStudent = {};
    attendance.forEach(rec => {
      if (!attendanceByStudent[rec.studentId]) {
        attendanceByStudent[rec.studentId] = { present: 0, total: 0 };
      }
      attendanceByStudent[rec.studentId].total += 1;
      if (rec.status === 'present') {
        attendanceByStudent[rec.studentId].present += 1;
      }
    });

    const lowAttendanceStudents = [];
    Object.entries(attendanceByStudent).forEach(([studentId, data]) => {
      const percentage = (data.present / data.total) * 100;
      if (percentage < 75) {
        const student = students.find(s => s._id.toString() === studentId);
        lowAttendanceStudents.push({ name: student?.name || 'Unknown', percentage: percentage.toFixed(0) });
      }
    });

    if (lowAttendanceStudents.length > 0 && lowAttendanceStudents.length <= 4) {
      const attendanceNames = lowAttendanceStudents.map(l => `${l.name} (${l.percentage}%)`).join(', ');
      suggestions.push(`📋 Poor attendance: ${attendanceNames} - Follow up with students`);
    } else if (lowAttendanceStudents.length > 4) {
      suggestions.push(`📋 ${lowAttendanceStudents.length} students with <75% attendance - Conduct class-wide attendance drive`);
    }

    // 4. Performance consistency analysis
    const inconsistentStudents = [];
    Object.entries(studentPerformance).forEach(([studentId, data]) => {
      if (data.subject.length >= 3) {
        const variance = Math.sqrt(
          data.subject.reduce((sum, mark) => sum + Math.pow(mark - (data.total / studentMarksCount[studentId]), 2), 0) / 
          data.subject.length
        );
        if (variance > 20) {
          const student = students.find(s => s._id.toString() === studentId);
          inconsistentStudents.push({ name: student?.name || 'Unknown', variance: variance.toFixed(1) });
        }
      }
    });

    if (inconsistentStudents.length > 0 && inconsistentStudents.length <= 3) {
      const inconsistentNames = inconsistentStudents.map(i => i.name).join(', ');
      suggestions.push(`📊 Inconsistent performers: ${inconsistentNames} - Help identify strengths and weaknesses`);
    } else if (inconsistentStudents.length > 3) {
      suggestions.push(`📊 ${inconsistentStudents.length} students show inconsistent performance - Review teaching methods`);
    }

    // 5. Class-wide insights
    const avgClassMarks = marks.length > 0 ? (marks.reduce((sum, m) => sum + m.marks, 0) / marks.length).toFixed(1) : 0;
    suggestions.push(`📈 Class average: ${avgClassMarks}% - Target: 75%+`);

    // 6. Recommendations based on data
    if (lowPerformers.length >= 3) {
      suggestions.push(`💡 Consider: Extra problem-solving sessions, peer mentoring, or individual consultations`);
    }
    
    if (topPerformers.length >= 5) {
      suggestions.push(`💡 Enrich high achievers with: Advanced assignments, leadership opportunities, or extension topics`);
    }

    res.json({ suggestions: suggestions.slice(0, 10) }); // Return top 10 suggestions
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    res.status(500).json({ msg: "Error generating suggestions" });
  }
});

module.exports = router;
