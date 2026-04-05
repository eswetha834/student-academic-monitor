const express = require("express");
const router = express.Router();
const { auth: authMiddleware } = require("../middleware/auth");
const User = require("../models/User");
const Marks = require("../models/Marks");
const AttendanceRecord = require("../models/AttendanceRecord");

const calculateGPA = (marks) => marks / 10;

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

module.exports = router;
