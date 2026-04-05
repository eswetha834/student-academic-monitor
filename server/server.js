const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
const morgan = require("morgan");
const { body, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
require("dotenv").config();

const User = require("./models/User");
const Marks = require("./models/Marks");
const Announcement = require("./models/Announcement");
const Assignment = require("./models/Assignment");
const AttendanceRecord = require("./models/AttendanceRecord");
const Material = require("./models/Material");
const Message = require("./models/Message");
const CalendarEvent = require("./models/CalendarEvent");
const Course = require("./models/Course");

// Import new models and routes
const Analytics = require("./models/Analytics");
const Notification = require("./models/Notification");
const ActivityLog = require("./models/ActivityLog");
const Permission = require("./models/Permission");
const Role = require("./models/Role");
const analyticsRoutes = require("./routes/analytics");
const notificationRoutes = require("./routes/notifications");
const facultyRoutes = require("./routes/faculty");
const { auth: authMiddleware, authorize, requirePermission } = require("./middleware/auth");
const RBACService = require("./services/rbacService");

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

/* ================= API ROUTES ================= */

// Use new routes
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/faculty", facultyRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

/* ================= MAILER CONFIG ================= */
// Using a mock config for now since real credentials might not be present
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: { user: "mock_user@ethereal.email", pass: "mock_pass" }
});

/* ================= PASSWORD RESET ================= */
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ msg: "User with that email does not exist" });

  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: '15m' });
  const mailOptions = {
    from: '"System Admin" <no-reply@institution.edu>',
    to: email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Use this token to reset: ${resetToken}`
  };

  try {
    console.log("Simulating Dispatching Mailer to:", email, "Token:", resetToken);
    res.json({ msg: "Check your email for instructions!", token: resetToken }); // for demo, return token
  } catch (e) {
    res.status(500).json({ msg: "Failed to dispatch email." });
  }
});

app.post("/api/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ msg: "Password Reset Successfully!" });
  } catch (err) {
    res.status(400).json({ msg: "Invalid or expired token" });
  }
});

/* ================= DB CONNECTION ================= */

mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/academic-monitor").then(async () => {
  console.log("Connected to MongoDB");
  
  // Initialize RBAC system
  await RBACService.initializeRBAC();
}).catch((err) => console.error("MongoDB connection error:", err));


/* ================= GPA CALCULATOR ================= */

// 🧠 Performance Prediction Algorithm
const predictPerformance = (student) => {
  const marks = student.marks || [];
  if (marks.length < 2) {
    return {
      predictedScore: null,
      confidence: 0,
      trend: 'insufficient_data',
      recommendation: 'Need more data for prediction'
    };
  }

  // Sort marks by date (assuming newer marks are at the end)
  const sortedMarks = marks.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  
  // Calculate recent trend (last 3 marks)
  const recentMarks = sortedMarks.slice(-3);
  const avgRecent = recentMarks.reduce((sum, m) => sum + m.marks, 0) / recentMarks.length;
  const avgOverall = marks.reduce((sum, m) => sum + m.marks, 0) / marks.length;
  
  // Determine trend
  let trend = 'stable';
  let trendPercent = 0;
  
  if (recentMarks.length >= 2) {
    const firstRecent = recentMarks[0].marks;
    const lastRecent = recentMarks[recentMarks.length - 1].marks;
    trendPercent = ((lastRecent - firstRecent) / firstRecent) * 100;
    
    if (trendPercent > 5) trend = 'improving';
    else if (trendPercent < -5) trend = 'declining';
  }
  
  // Predict next score based on trend and consistency
  let predictedScore;
  let confidence = 0;
  
  if (trend === 'improving') {
    predictedScore = Math.min(100, avgRecent + (avgRecent * 0.1)); // Add 10% of recent average
    confidence = Math.min(85, 60 + recentMarks.length * 5);
  } else if (trend === 'declining') {
    predictedScore = Math.max(0, avgRecent - (avgRecent * 0.05)); // Subtract 5% of recent average
    confidence = Math.min(80, 50 + recentMarks.length * 5);
  } else {
    predictedScore = avgRecent; // Stable - predict similar to recent average
    confidence = Math.min(75, 55 + recentMarks.length * 5);
  }
  
  // Adjust based on attendance
  const attendance = student.attendance || 0;
  if (attendance < 75) {
    predictedScore *= 0.9; // Reduce prediction if attendance is poor
    confidence -= 10;
  } else if (attendance >= 90) {
    predictedScore *= 1.05; // Boost prediction if attendance is excellent
    confidence += 5;
  }
  
  // Generate recommendation
  let recommendation = '';
  if (predictedScore >= 90) {
    recommendation = 'Excellent performance expected! Keep up the great work.';
  } else if (predictedScore >= 75) {
    recommendation = 'Good performance expected. Continue current study habits.';
  } else if (predictedScore >= 60) {
    recommendation = 'Moderate performance expected. Consider increasing study time.';
  } else if (predictedScore >= 40) {
    recommendation = 'Performance needs improvement. Seek additional help and focus on weak areas.';
  } else {
    recommendation = 'Significant improvement needed. Consider tutoring and study plan changes.';
  }
  
  return {
    predictedScore: Math.round(predictedScore),
    confidence: Math.max(20, Math.min(95, Math.round(confidence))),
    trend,
    trendPercent: Math.round(trendPercent),
    recommendation,
    factors: {
      recentAverage: Math.round(avgRecent),
      overallAverage: Math.round(avgOverall),
      attendanceImpact: attendance < 75 ? 'negative' : attendance >= 90 ? 'positive' : 'neutral',
      dataPoints: marks.length
    }
  };
};

const calculateGPA = (marks) => {
  // Assuming marks is a percentage out of 100
  // Convert to 10-point scale
  return marks / 10;
};

const getRoleName = (req) => req.user?.role?.name || req.user?.role;

const canManageAcademicData = (roleName) => ["faculty", "teacher", "admin", "head_of_department"].includes(roleName);


/* ================= REGISTER ================= */

app.post("/api/register", [
  body("name", "Name is required").not().isEmpty(),
  body("email", "Please include a valid email").isEmail(),
  body("password", "Password is required").isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    let { name, email, password, role } = req.body;
    email = email.trim().toLowerCase();

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Get role from database
    const normalizedRole = (role || "student").toLowerCase();
    const userRole = await Role.findOne({ name: normalizedRole });
    if (!userRole) {
      return res.status(400).json({ msg: "Invalid role specified" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole._id
    });

    await user.save();
    
    const payload = { user: { id: user._id, role: userRole.name } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", { expiresIn: '10h' });
    
    console.log("✅ User registered successfully:", { name: user.name, email: user.email, role: userRole.name });
    
    res.status(201).json({ 
      msg: "Registered Successfully", 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: userRole.name,
        department: user.department,
        semester: user.semester
      }
    });

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});


/* ================= LOGIN ================= */

app.post("/api/login", [
  body("email", "Please include a valid email").isEmail(),
  body("password", "Password is required").exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    let { email, password, role } = req.body;
    email = email.trim().toLowerCase();

    console.log("\n═══════════════════════════════════════════");
    console.log("🔑 LOGIN ATTEMPT RECEIVED");
    console.log("═══════════════════════════════════════════");
    console.log("📧 Email (normalized):", email);
    console.log("🔐 Password length:", password ? password.length : 0);
    console.log("👤 Role from frontend:", role || "none");
    console.log("📦 Full payload:", JSON.stringify(req.body, null, 2));

    // STEP 1: Find user in database
    console.log("\n[STEP 1] Finding user in database...");
    const user = await User.findOne({ email }).populate('role').select('+password');
    
    if (!user) {
      console.log("❌ [STEP 1] FAILED - User not found!");
      console.log("   Searched for email:", email);
      console.log("   Total users in DB:", await User.countDocuments());
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
    
    console.log("✅ [STEP 1] SUCCESS - User found!");
    console.log("   ├─ ID:", user._id);
    console.log("   ├─ Name:", user.name);
    console.log("   ├─ Email:", user.email);
    console.log("   ├─ Role ID:", user.role._id);
    console.log("   ├─ Role Name:", user.role.name);
    console.log("   └─ Has password hash:", !!user.password);
    
    // STEP 2: Verify password hash exists
    console.log("\n[STEP 2] Checking password hash...");
    if (!user.password) {
      console.log("❌ [STEP 2] FAILED - User has no password hash!");
      return res.status(400).json({ msg: "Invalid Credentials - No password" });
    }
    console.log("✅ [STEP 2] Password hash exists");
    console.log("   ├─ Hash length:", user.password.length);
    console.log("   ├─ Hash starts with:", user.password.substring(0, 20));
    console.log("   └─ Is bcrypt format:", user.password.startsWith("$2"));

    // STEP 3: Compare passwords with bcrypt
    console.log("\n[STEP 3] Comparing passwords with bcrypt...");
    console.log("   ├─ Entered password length:", password.length);
    console.log("   └─ Comparing with hash...");
    
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
      console.log("✅ [STEP 3] Password comparison complete");
      console.log("   └─ Match result:", isMatch);
    } catch (bcryptErr) {
      console.error("❌ [STEP 3] bcrypt error:", bcryptErr.message);
      return res.status(500).json({ msg: "Password verification error" });
    }

    // For seamless upgrade, uncomment this if needed. Let's just strict check for hashed DB unless plain text matches
    let isValid = isMatch;
    if (!isMatch && user.password === password) {
      isValid = true; // Temporary backward compatibility if someone registered with plaintext before
    }

    console.log("\n[STEP 4] Validating credentials...");
    console.log("   ├─ bcrypt match:", isMatch);
    console.log("   ├─ plaintext match (fallback):", user.password === password);
    console.log("   └─ Overall valid:", isValid);

    if (!isValid) {
      console.log("❌ [STEP 4] FAILED - Password invalid!");
      console.log("   └─ Both bcrypt and plaintext comparison failed");
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    console.log("✅ [STEP 4] Credentials valid!");

    if (req.body.role && user.role.name.toLowerCase() !== req.body.role.toLowerCase()) {
      console.log("\n⚠️  Role mismatch - frontend chose:", req.body.role, "| actual DB role:", user.role.name);
      console.log("   📌 Continuing with actual role from DB");
    }

    console.log("\n[STEP 5] Generating JWT token...");
    const payload = { user: { id: user._id, role: user.role.name } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", { expiresIn: '10h' });
    console.log("✅ [STEP 5] Token generated successfully");

    console.log("\n═══════════════════════════════════════════");
    console.log("🎉 LOGIN SUCCESS");
    console.log("═══════════════════════════════════════════");
    console.log("✅ User:", user.name);
    console.log("✅ Email:", user.email);
    console.log("✅ Role:", user.role.name);
    console.log("✅ Token expires in: 10h\n");
    
    res.status(200).json({
      msg: "Login Success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        department: user.department,
        semester: user.semester,
        rollNumber: user.rollNumber,
        profilePic: user.profilePic
      }
    });

  } catch (err) {
    console.error("\n❌ ═══════════════════════════════════════════");
    console.error("❌ LOGIN ERROR");
    console.error("❌ ═══════════════════════════════════════════");
    console.error("Error type:", err.name);
    console.error("Error message:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({ msg: "Server Error" });
  }
});

/* ================= DEBUG ENDPOINTS (DEV ONLY) ================= */

// Check if user exists and has valid password hash
app.get("/api/debug/user-check", async (req, res) => {
  try {
    const email = (req.query.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ msg: "Email required" });

    const user = await User.findOne({ email }).populate('role').select('+password');
    if (!user) {
      return res.status(404).json({
        msg: "User not found",
        email,
        searched: email
      });
    }

    res.json({
      found: true,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role?.name,
      password: {
        exists: !!user.password,
        length: user.password ? user.password.length : 0,
        isBcrypt: user.password ? user.password.startsWith("$2") : false,
        preview: user.password ? user.password.substring(0, 20) + "..." : "NONE"
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Error checking user", error: err.message });
  }
});

// Test bcrypt comparison manually
app.post("/api/debug/test-bcrypt", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Email and password required" });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    res.json({
      email,
      passwordEntered: password,
      hashExists: !!user.password,
      hashLength: user.password.length,
      bcryptMatch: isMatch,
      plaintextMatch: user.password === password
    });
  } catch (err) {
    res.status(500).json({ msg: "Error testing bcrypt", error: err.message });
  }
});

// List all users (debug only)
app.get("/api/debug/all-users", async (req, res) => {
  try {
    const users = await User.find().populate('role').select('name email').limit(20);
    res.json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching users", error: err.message });
  }
});

/* ================= ADMIN ACTIONS ================= */
app.patch("/api/admin/reset-password/:id", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "admin") return res.status(403).json({ msg: "Access Denied" });
    const { newPassword } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    res.json({ msg: "Password reset successfully" });
  } catch (err) { res.status(500).json({ msg: "Error resetting password" }); }
});

app.post("/api/courses", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "admin") return res.status(403).json({ msg: "Access Denied" });
    const { code, title } = req.body;
    const course = new Course({ code, title });
    await course.save();
    res.json({ msg: "Course Created", course });
  } catch (e) { res.status(500).json({ msg: "Error creating course" }); }
});

app.get("/api/courses", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (e) { res.status(500).json({ msg: "Error fetching courses" }); }
});

app.get("/api/users", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "admin") return res.status(403).json({ msg: "Access denied" });
    const users = await User.find().populate("role").select("-password");
    res.json(users.map((u) => ({ ...u.toObject(), role: u.role?.name || u.role })));
  } catch (e) { res.status(500).json({ msg: "Error fetching users" }); }
});

/* ================= ADD MARKS (FACULTY) ================= */

app.post("/api/add-marks", authMiddleware, async (req, res) => {
  try {
    const { studentId, subject, marks, attendance, suggestion } = req.body;
    if (!studentId || !subject || !marks) {
      return res.status(400).json({ msg: "Required fields missing" });
    }

    const roleName = getRoleName(req);
    if (!canManageAcademicData(roleName) || roleName === "student") {
      return res.status(403).json({ msg: "Access denied" });
    }

    if (roleName === "faculty" || roleName === "teacher") {
      const student = await User.findById(studentId).select("department");
      if (!student || student.department !== req.user.department) {
        return res.status(403).json({ msg: "Access denied" });
      }
    }

    const data = new Marks({
      studentId,
      subject,
      examType: req.body.examType || "Internal",
      marks: Number(marks),
      attendance: Number(attendance),
      suggestion
    });

    await data.save();
    res.json({ msg: "Marks Added Successfully", data });

  } catch (err) {
    console.error("Add Marks Error:", err);
    res.status(500).json({ msg: "Error adding marks" });
  }
});

/* ================= UPDATE MARKS (FACULTY) ================= */

app.put("/api/marks/:id", authMiddleware, async (req, res) => {
  try {
    const { marks, attendance, suggestion } = req.body;
    const markId = req.params.id;

    const data = await Marks.findById(markId);
    if (!data) return res.status(404).json({ msg: "Marks not found" });

    const roleName = getRoleName(req);
    if (!canManageAcademicData(roleName) || roleName === "student") {
      return res.status(403).json({ msg: "Access denied" });
    }

    if (roleName === "faculty" || roleName === "teacher") {
      const student = await User.findById(data.studentId).select("department");
      if (!student || student.department !== req.user.department) {
        return res.status(403).json({ msg: "Access denied" });
      }
    }

    data.marks = marks !== undefined ? Number(marks) : data.marks;
    data.attendance = attendance !== undefined ? Number(attendance) : data.attendance;
    data.suggestion = suggestion !== undefined ? suggestion : data.suggestion;

    await data.save();
    res.json({ msg: "Marks Updated Successfully", data });

  } catch (err) {
    console.error("Update Marks Error:", err);
    res.status(500).json({ msg: "Error updating marks" });
  }
});

/* ================= DELETE MARKS (FACULTY) ================= */

app.delete("/api/marks/:id", authMiddleware, async (req, res) => {
  try {
    const markId = req.params.id;
    const data = await Marks.findByIdAndDelete(markId);
    if (!data) return res.status(404).json({ msg: "Marks not found" });

    const roleName = getRoleName(req);
    if (!canManageAcademicData(roleName) || roleName === "student") {
      return res.status(403).json({ msg: "Access denied" });
    }

    if (roleName === "faculty" || roleName === "teacher") {
      const student = await User.findById(data.studentId).select("department");
      if (!student || student.department !== req.user.department) {
        return res.status(403).json({ msg: "Access denied" });
      }
    }

    res.json({ msg: "Marks Deleted Successfully" });
  } catch (err) {
    console.error("Delete Marks Error:", err);
    res.status(500).json({ msg: "Error deleting marks" });
  }
});

/* ================= DAILY ATTENDANCE (FACULTY) ================= */

app.post("/api/daily-attendance", authMiddleware, async (req, res) => {
  try {
    const { records } = req.body;
    if (!records || !Array.isArray(records)) return res.status(400).send("Invalid data");

    const roleName = getRoleName(req);
    if (!canManageAcademicData(roleName) || roleName === "student") {
      return res.status(403).json({ msg: "Access denied" });
    }

    if (roleName === "faculty" || roleName === "teacher") {
      const studentIds = [...new Set(records.map((r) => r.studentId).filter(Boolean).map(String))];
      const students = await User.find({ _id: { $in: studentIds } }).select("department");
      const deptById = new Map(students.map((s) => [s._id.toString(), s.department]));

      for (const rec of records) {
        const dept = deptById.get(String(rec.studentId));
        if (!dept || dept !== req.user.department) {
          return res.status(403).json({ msg: "Access denied" });
        }
      }
    }

    const ops = records.map(rec => ({
      updateOne: {
        filter: { studentId: rec.studentId, date: rec.date },
        update: { $set: { status: rec.status, subject: rec.subject || 'General' } },
        upsert: true
      }
    }));

    await AttendanceRecord.bulkWrite(ops);
    res.json({ msg: "Attendance Recorded Successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).send("Error recording attendance");
  }
});

/* ================= GET STUDENT MARKS ================= */

app.get("/api/student-marks/:id", authMiddleware, async (req, res) => {
  try {
    const studentId = req.params.id;

    const roleName = getRoleName(req);
    if (roleName === "student") {
      if (studentId !== req.user._id.toString()) return res.status(403).json({ msg: "Access denied" });
    } else if (roleName === "faculty" || roleName === "teacher") {
      const student = await User.findById(studentId).select("department");
      if (!student || student.department !== req.user.department) return res.status(403).json({ msg: "Access denied" });
    } else if (!["admin", "head_of_department"].includes(roleName)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const marks = await Marks.find({ studentId });
    res.json(marks);
  } catch (err) {
    console.error("Student Marks Error:", err);
    res.status(500).json({ msg: "Failed to fetch marks" });
  }
});


/* ================= STUDENT DASHBOARD ================= */

app.get("/api/student-dashboard/:id", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    const studentId = req.params.id;

    if (roleName === "student") {
      if (studentId !== req.user._id.toString()) return res.status(403).json({ msg: "Access denied" });
    } else if (roleName === "faculty" || roleName === "teacher") {
      const student = await User.findById(studentId).select("department");
      if (!student || student.department !== req.user.department) return res.status(403).json({ msg: "Access denied" });
    } else if (!["admin", "head_of_department"].includes(roleName)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const marks = await Marks.find({ studentId });

    let total = 0;
    marks.forEach(m => {
      total += m.marks;
    });

    let avgMarks = marks.length ? total / marks.length : 0;
    let gpa = calculateGPA(avgMarks);

    let finalAttendance = 0;
    const attRecords = await AttendanceRecord.find({ studentId: req.params.id });
    if (attRecords.length > 0) {
      const present = attRecords.filter(r => r.status === 'Present').length;
      finalAttendance = Math.round((present / attRecords.length) * 100);
    } else {
      let att = 0;
      marks.forEach(m => { att += (m.attendance || 0); });
      finalAttendance = marks.length ? (att / marks.length) : 0;
    }

    // Calculate Rank
    const studentRole = await Role.findOne({ name: "student" });
    const allStudents = await User.find({ role: studentRole._id });
    const studentStats = await Promise.all(allStudents.map(async (s) => {
      const sMarks = await Marks.find({ studentId: s._id });
      let sTotal = 0;
      sMarks.forEach(m => { sTotal += m.marks; });
      let sAvg = sMarks.length ? sTotal / sMarks.length : 0;
      return { id: s._id.toString(), gpa: calculateGPA(sAvg) };
    }));

    studentStats.sort((a, b) => b.gpa - a.gpa);
    const rank = studentStats.findIndex(s => s.id === req.params.id) + 1;

    // Calculate Prediction
    let predictedGpa = (gpa + 0.2).toFixed(2); // Simple mock prediction logic
    if (avgMarks > 90) predictedGpa = 9.8;

    // Detect Weak Subjects
    const weakSubjects = marks.filter(m => m.marks < 75).map(m => ({
      name: m.subject,
      score: m.marks,
      recommendation: m.marks < 60 ? "Solve 10+ practice problems daily" : "Review key concepts weekly"
    }));

    const user = await User.findById(req.params.id);

    res.json({
      gpa: gpa.toFixed(2),
      attendance: finalAttendance.toFixed(0),
      subjects: marks.length,
      rank: rank > 0 ? rank : "N/A",
      totalStudents: allStudents.length,
      records: marks,
      predictedGpa,
      weakSubjects,
      studyTime: user?.studyTime || [],
      goals: user?.goals || { targetGpa: 9.0, targetAttendance: 95 },
      notes: user?.notes || [],
      badges: user?.badges || ["Assignment Master"]
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ msg: "Dashboard error" });
  }
});


/* ================= NOTICES AND ASSIGNMENTS ================= */
app.post("/api/announcements", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (!canManageAcademicData(roleName) || roleName === "student") {
      return res.status(403).json({ msg: "Access denied" });
    }
    const { text, type, target } = req.body;
    const newAnnc = new Announcement({ text, type, target });
    await newAnnc.save();
    res.json({ msg: "Announcement Sent!" });
  } catch (e) { res.status(500).send("Error"); }
});

app.get("/api/announcements", authMiddleware, async (req, res) => {
  try {
    const all = await Announcement.find().sort({ date: -1 });
    res.json(all);
  } catch (e) { res.status(500).send("Error"); }
});

app.put("/api/announcements/:id", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (!canManageAcademicData(roleName) || roleName === "student") {
      return res.status(403).json({ msg: "Access denied" });
    }
    const { text, type, target } = req.body;
    await Announcement.findByIdAndUpdate(req.params.id, { text, type, target });
    res.json({ msg: "Announcement Updated!" });
  } catch (e) { res.status(500).send("Error"); }
});

app.delete("/api/announcements/:id", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (!canManageAcademicData(roleName) || roleName === "student") {
      return res.status(403).json({ msg: "Access denied" });
    }
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ msg: "Announcement Deleted!" });
  } catch (e) { res.status(500).send("Error"); }
});

app.post("/api/assignments", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (!canManageAcademicData(roleName) || roleName === "student") {
      return res.status(403).json({ msg: "Access denied" });
    }
    const { title, subject, instructions, deadline, category } = req.body;
    const assign = new Assignment({ title, subject, instructions, deadline, category: category || "Assignment" });
    await assign.save();
    res.json({ msg: "Assignment Published" });
  } catch (e) { res.status(500).send("Error"); }
});

app.get("/api/assignments", authMiddleware, async (req, res) => {
  try {
    const all = await Assignment.find().sort({ _id: -1 });
    res.json(all);
  } catch (e) { res.status(500).send("Error"); }
});

app.put("/api/assignments/:id", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (!canManageAcademicData(roleName) || roleName === "student") {
      return res.status(403).json({ msg: "Access denied" });
    }
    const { title, subject, instructions, deadline, category } = req.body;
    await Assignment.findByIdAndUpdate(req.params.id, { title, subject, instructions, deadline, category });
    res.json({ msg: "Assignment Updated!" });
  } catch (e) { res.status(500).send("Error"); }
});

app.delete("/api/assignments/:id", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (!canManageAcademicData(roleName) || roleName === "student") {
      return res.status(403).json({ msg: "Access denied" });
    }
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ msg: "Assignment Deleted!" });
  } catch (e) { res.status(500).send("Error"); }
});

app.post("/api/assignments/upload", authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "student") return res.status(403).json({ msg: "Access denied" });
    const { assignmentId } = req.body;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ msg: "Assignment not found" });

    if (req.file) {
      if (!assignment.submittedFiles) {
        assignment.submittedFiles = [];
      }
      assignment.submissions += 1;
      assignment.submittedFiles.push({
        studentId: req.user.id,
        // Wait, req.user from JWT only has id and role.
        studentName: "Student", // Will fetch user to get name
        filePath: req.file.path.replace(/\\/g, '/')
      });

      const user = await User.findById(req.user.id);
      if (user) {
        assignment.submittedFiles[assignment.submittedFiles.length - 1].studentName = user.name;
      }

      await assignment.save();
      res.json({ msg: "Assignment Uploaded" });
    } else {
      res.status(400).json({ msg: "No file uploaded" });
    }
  } catch (e) { console.error(e); res.status(500).json({ msg: "Error uploading assignment" }); }
});

/* ================= MATERIALS AND MESSAGES ================= */
app.post("/api/materials", authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (!canManageAcademicData(roleName) || roleName === "student") {
      return res.status(403).json({ msg: "Access denied" });
    }
    const { title, subject, type } = req.body;
    const material = new Material({
      title,
      subject,
      type,
      filePath: req.file ? req.file.path.replace(/\\/g, '/') : ''
    });
    await material.save();
    res.json({ msg: "Material Uploaded" });
  } catch (e) {
    console.error("Material Upload Error:", e);
    res.status(500).send("Error");
  }
});

app.get("/api/materials", authMiddleware, async (req, res) => {
  try {
    const all = await Material.find().sort({ date: -1 });
    res.json(all);
  } catch (e) { res.status(500).send("Error"); }
});

app.put("/api/materials/:id", authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (!canManageAcademicData(roleName) || roleName === "student") {
      return res.status(403).json({ msg: "Access denied" });
    }
    const { title, subject, type } = req.body;
    const updateData = { title, subject, type };
    if (req.file) updateData.filePath = req.file.path.replace(/\\/g, '/');
    await Material.findByIdAndUpdate(req.params.id, updateData);
    res.json({ msg: "Material Updated" });
  } catch (e) { res.status(500).send("Error"); }
});

app.delete("/api/materials/:id", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (!canManageAcademicData(roleName) || roleName === "student") {
      return res.status(403).json({ msg: "Access denied" });
    }
    await Material.findByIdAndDelete(req.params.id);
    res.json({ msg: "Material Deleted" });
  } catch (e) { res.status(500).send("Error"); }
});


/* ================= CALENDAR EVENTS ================= */

app.get("/api/calendar-events", authMiddleware, async (req, res) => {
  try {
    const events = await CalendarEvent.find().sort({ date: 1 });
    res.json(events);
  } catch (e) { res.status(500).send("Error"); }
});

app.post("/api/calendar-events", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (!canManageAcademicData(roleName) || roleName === "student") {
      return res.status(403).json({ msg: "Access denied" });
    }
    const { title, date, type, description } = req.body;
    const newEvent = new CalendarEvent({ title, date, type, description });
    await newEvent.save();
    res.json({ msg: "Event added" });
  } catch (e) { res.status(500).send("Error"); }
});

/* ================= ENHANCED CHAT ================= */

app.get("/api/messages/history/:otherId", authMiddleware, async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = req.params.otherId;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherId },
        { senderId: otherId, receiverId: myId }
      ]
    }).sort({ date: 1 });
    res.json(messages);
  } catch (e) { res.status(500).send("Error"); }
});

app.post("/api/messages", authMiddleware, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const user = await User.findById(req.user.id);
    const msg = new Message({
      senderId: req.user.id,
      senderName: user.name,
      senderRole: user.role,
      receiverId,
      text
    });
    await msg.save();
    res.json({ msg: "Message Sent" });
  } catch (e) { res.status(500).send("Error"); }
});

app.get("/api/faculty", authMiddleware, async (req, res) => {
  try {
    const facultyRole = await Role.findOne({ name: 'faculty' });
    const faculty = await User.find({ role: facultyRole._id }).select("name email _id department");
    res.json(faculty);
  } catch (e) { 
    console.error("Faculty Error:", e);
    res.status(500).send("Error"); 
  }
});

/* ================= CREATE SAMPLE FACULTY ================= */
app.post("/api/create-sample-faculty", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "admin") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const facultyRole = await Role.findOne({ name: 'faculty' });
    if (!facultyRole) {
      return res.status(400).json({ msg: "Faculty role not found" });
    }

    const sampleFaculty = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        password: await bcrypt.hash('faculty123', await bcrypt.genSalt(10)),
        role: facultyRole._id,
        department: 'Computer Science',
        semester: '8',
        rollNumber: 'FAC001'
      },
      {
        name: 'Prof. Michael Chen',
        email: 'michael.chen@university.edu',
        password: await bcrypt.hash('faculty123', await bcrypt.genSalt(10)),
        role: facultyRole._id,
        department: 'Mathematics',
        semester: '8',
        rollNumber: 'FAC002'
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@university.edu',
        password: await bcrypt.hash('faculty123', await bcrypt.genSalt(10)),
        role: facultyRole._id,
        department: 'Physics',
        semester: '8',
        rollNumber: 'FAC003'
      },
      {
        name: 'Prof. David Kim',
        email: 'david.kim@university.edu',
        password: await bcrypt.hash('faculty123', await bcrypt.genSalt(10)),
        role: facultyRole._id,
        department: 'Chemistry',
        semester: '8',
        rollNumber: 'FAC004'
      },
      {
        name: 'Dr. Lisa Anderson',
        email: 'lisa.anderson@university.edu',
        password: await bcrypt.hash('faculty123', await bcrypt.genSalt(10)),
        role: facultyRole._id,
        department: 'Biology',
        semester: '8',
        rollNumber: 'FAC005'
      }
    ];

    for (const faculty of sampleFaculty) {
      const existing = await User.findOne({ email: faculty.email });
      if (!existing) {
        await User.create(faculty);
      }
    }

    res.json({ msg: "Sample faculty created successfully" });
  } catch (err) {
    console.error("Create Faculty Error:", err);
    res.status(500).json({ msg: "Error creating faculty" });
  }
});

/* ================= MESSAGING ================= */

// Get messages between student and teacher
app.get("/api/messages/history/:teacherId", authMiddleware, async (req, res) => {
  try {
    const studentId = req.user._id;
    const teacherId = req.params.teacherId;
    
    // For demo purposes, return sample messages
    // In production, this would query a Message collection
    const sampleMessages = [
      {
        _id: '1',
        senderId: teacherId,
        senderName: 'Teacher',
        text: 'Hello! How can I help you today?',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        _id: '2', 
        senderId: studentId,
        senderName: req.user.name,
        text: 'I need help with understanding the latest assignment',
        timestamp: new Date(Date.now() - 1800000)
      }
    ];
    
    res.json(sampleMessages);
  } catch (err) {
    console.error("Get Messages Error:", err);
    res.status(500).json({ msg: "Error fetching messages" });
  }
});

// Send message
app.post("/api/messages", authMiddleware, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user._id;
    
    // For demo purposes, just return success
    // In production, this would save to a Message collection
    console.log(`Message from ${senderId} to ${receiverId}: ${text}`);
    
    res.json({ msg: "Message sent successfully" });
  } catch (err) {
    console.error("Send Message Error:", err);
    res.status(500).json({ msg: "Error sending message" });
  }
});

/* ================= TEACHERS ================= */
app.get("/api/teachers", authMiddleware, async (req, res) => {
  try {
    const teachers = await User.find({ role: { $in: ["teacher", "faculty"] } }).select("-password").lean();
    res.json(teachers);
  } catch (err) {
    console.error("Teachers Error:", err);
    res.status(500).json({ msg: "Error fetching teachers" });
  }
});

/* ================= DAILY ATTENDANCE ================= */
app.post("/api/daily-attendance", authMiddleware, async (req, res) => {
  try {
    const { records } = req.body;
    for (let r of records) {
      if (!r.status) continue;
      await AttendanceRecord.findOneAndUpdate(
        { studentId: r.studentId, date: r.date, subject: r.subject },
        { status: r.status, remark: r.remark },
        { upsert: true }
      );
    }
    res.json({ msg: "Attendance saved" });
  } catch (e) { res.status(500).send("Error"); }
});

app.get("/api/daily-attendance/:id", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    const targetId = req.params.id;

    if (roleName === "student") {
      if (targetId !== req.user._id.toString()) return res.status(403).json({ msg: "Access denied" });
    } else if (roleName === "faculty" || roleName === "teacher") {
      const student = await User.findById(targetId).select("department");
      if (!student || student.department !== req.user.department) return res.status(403).json({ msg: "Access denied" });
    } else if (!["admin", "head_of_department"].includes(roleName)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const records = await AttendanceRecord.find({ studentId: targetId }).sort({ date: 1 });
    res.json(records);
  } catch (e) { res.status(500).send("Error"); }
});


/* ================= INTELLIGENT FEATURES ================= */

app.get("/api/leaderboard", authMiddleware, async (req, res) => {
  try {
    const studentRole = await Role.findOne({ name: "student" });
    const students = await User.find({ role: studentRole._id });
    const leaderboard = await Promise.all(students.map(async (s) => {
      const sMarks = await Marks.find({ studentId: s._id });
      let total = 0; sMarks.forEach(m => total += m.marks);
      let avg = sMarks.length ? total / sMarks.length : 0;
      return { name: s.name, gpa: calculateGPA(avg).toFixed(2) };
    }));
    leaderboard.sort((a, b) => b.gpa - a.gpa);
    res.json(leaderboard.slice(0, 10));
  } catch (e) { res.status(500).send("Error"); }
});

app.post("/api/study-time", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "student") return res.status(403).json({ msg: "Access denied" });
    const { hours } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      $push: { studyTime: { hours, date: new Date() } }
    });
    res.json({ msg: "Study time tracked!" });
  } catch (e) { res.status(500).send("Error"); }
});

app.post("/api/update-goals", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "student") return res.status(403).json({ msg: "Access denied" });
    const { targetGpa, targetAttendance } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      goals: { targetGpa, targetAttendance }
    });
    res.json({ msg: "Goals updated!" });
  } catch (e) { res.status(500).send("Error"); }
});

app.post("/api/notes", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "student") return res.status(403).json({ msg: "Access denied" });
    const { text } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      $push: { notes: { text, date: new Date() } }
    });
    res.json({ msg: "Note added!" });
  } catch (e) { res.status(500).send("Error"); }
});

app.delete("/api/notes/:id", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "student") return res.status(403).json({ msg: "Access denied" });
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { notes: { _id: req.params.id } }
    });
    res.json({ msg: "Note deleted!" });
  } catch (e) { res.status(500).send("Error"); }
});

app.post("/api/students/:id/pin", authMiddleware, async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    const roleName = getRoleName(req);
    if (roleName === "student") {
      if (req.params.id !== req.user._id.toString()) return res.status(403).json({ msg: "Access denied" });
    } else if (roleName === "faculty" || roleName === "teacher") {
      if (student.department !== req.user.department) return res.status(403).json({ msg: "Access denied" });
    } else if (!["admin", "head_of_department"].includes(roleName)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const isPinned = student.pinnedBy.includes(req.user.id);
    if (isPinned) {
      student.pinnedBy = student.pinnedBy.filter(id => id.toString() !== req.user.id);
    } else {
      student.pinnedBy.push(req.user.id);
    }
    await student.save();
    res.json({ msg: isPinned ? "Unpinned" : "Pinned", pinned: !isPinned });
  } catch (e) { res.status(500).send("Error"); }
});

app.post("/api/students/:id/focus-subject", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (!canManageAcademicData(roleName) || roleName === "student") {
      return res.status(403).json({ msg: "Access denied" });
    }

    if (roleName === "faculty" || roleName === "teacher") {
      const student = await User.findById(req.params.id).select("department");
      if (!student || student.department !== req.user.department) {
        return res.status(403).json({ msg: "Access denied" });
      }
    }

    const { subject, reason } = req.body;
    await User.findByIdAndUpdate(req.params.id, {
      $push: { focusSubjects: { subject, reason, date: new Date() } }
    });
    res.json({ msg: "Flagged for weak subject" });
  } catch (e) { res.status(500).send("Error"); }
});

/* ================= STUDENT DASHBOARD ================= */

app.get("/api/student-dashboard/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const roleName = getRoleName(req);
    if (roleName === "student") {
      if (req.params.id !== req.user._id.toString()) return res.status(403).json({ msg: "Access denied" });
    } else if (roleName === "faculty" || roleName === "teacher") {
      if (user.department !== req.user.department) return res.status(403).json({ msg: "Access denied" });
    } else if (!["admin", "head_of_department"].includes(roleName)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const marks = await Marks.find({ studentId: user._id });
    const allStudents = await User.find({ role: "student" });

    // Gpa & Attendance calculations
    let totalMarks = 0;
    marks.forEach(m => totalMarks += m.marks);
    let avgMarks = marks.length ? totalMarks / marks.length : 0;
    let gpa = calculateGPA(avgMarks);

    const attRecords = await AttendanceRecord.find({ studentId: user._id });
    let presentCount = attRecords.filter(r => r.status === 'Present').length;
    let attendance = attRecords.length ? Math.round((presentCount / attRecords.length) * 100) : 0;

    // Weak Subjects based on marks < 40 or 50
    const weakSubjects = marks.filter(m => m.marks < 50).map(m => ({
      name: m.subject,
      score: m.marks,
      recommendation: "Review core concepts and practice previous papers."
    }));

    // Leaderboard Rank
    const studentGPAs = await Promise.all(allStudents.map(async (s) => {
      const sMarks = await Marks.find({ studentId: s._id });
      let sTotal = 0; sMarks.forEach(sm => sTotal += sm.marks);
      let sAvg = sMarks.length ? sTotal / sMarks.length : 0;
      return { id: s._id.toString(), gpa: calculateGPA(sAvg) };
    }));
    studentGPAs.sort((a, b) => b.gpa - a.gpa);
    const rank = studentGPAs.findIndex(s => s.id === user._id.toString()) + 1;

    res.json({
      gpa: gpa.toFixed(2),
      attendance: attendance.toString(),
      rank: rank > 0 ? rank.toString() : "N/A",
      totalStudents: allStudents.length.toString(),
      predictedGpa: (gpa + 0.2).toFixed(2), // Simple prediction
      weakSubjects,
      focusSubjects: user.focusSubjects || [],
      studyTime: user.studyTime || [],
      goals: user.goals || { targetGpa: 9.0, targetAttendance: 95 },
      notes: user.notes || [],
      badges: user.badges || ["Consistent Learner"]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching dashboard" });
  }
});

/* ================= TEACHERS LIST ================= */

app.get("/api/teachers", authMiddleware, async (req, res) => {
  try {
    const teachers = await User.find({ role: { $in: ["teacher", "faculty"] } }).select("-password");
    res.json(teachers);
  } catch (e) { res.status(500).json({ msg: "Error" }); }
});

/* ================= ADMIN ACTIONS ================= */

app.patch("/api/admin/reset-password/:id", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "admin") return res.status(403).json({ msg: "Access denied" });
    const { newPassword } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    res.json({ msg: "Password Reset successfully" });
  } catch (e) { res.status(500).send("Error"); }
});

app.get("/api/students", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName === "student") return res.status(403).json({ msg: "Access denied" });
    if (!["faculty", "teacher", "admin", "head_of_department"].includes(roleName)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Find the student role first
    const studentRole = await Role.findOne({ name: "student" });
    if (!studentRole) {
      return res.status(500).json({ msg: "Student role not found" });
    }

    const query = { role: studentRole._id };
    if (roleName === "faculty" || roleName === "teacher") {
      query.department = req.user.department;
    }

    const students = await User.find(query).populate('role').select("-password").lean();

    // Attach live average GPA and Attendance directly for Teacher Dashboards
    for (let student of students) {
      const marks = await Marks.find({ studentId: student._id });
      let total = 0;
      marks.forEach(m => { total += m.marks; });
      let avgM = marks.length ? total / marks.length : 0;
      student.gpa = parseFloat(calculateGPA(avgM).toFixed(2));

      const attRecords = await AttendanceRecord.find({ studentId: student._id });
      if (attRecords.length > 0) {
        const present = attRecords.filter(r => r.status === 'Present').length;
        student.attendance = Math.round((present / attRecords.length) * 100);
      } else {
        // Fallback to average marks attendance
        let att = 0;
        marks.forEach(m => { att += (m.attendance || 0); });
        student.attendance = marks.length ? parseInt((att / marks.length).toFixed(0)) : 0;
      }

      // 🧠 Smart Risk Detection System
      const academicRisk = avgM < 40;
      const attendanceRisk = student.attendance < 75;
      
      let riskLevel = 'none';
      let riskFactors = [];
      let riskScore = 0;
      
      if (academicRisk) {
        riskFactors.push('Academic');
        riskScore += 40;
      }
      if (attendanceRisk) {
        riskFactors.push('Attendance');
        riskScore += 30;
      }
      if (student.gpa < 4) {
        riskFactors.push('GPA');
        riskScore += 30;
      }
      
      // Calculate risk level
      if (riskScore >= 70) {
        riskLevel = 'high';
      } else if (riskScore >= 40) {
        riskLevel = 'medium';
      } else if (riskScore > 0) {
        riskLevel = 'low';
      }
      
      student.riskLevel = riskLevel;
      student.riskFactors = riskFactors;
      student.riskScore = riskScore;
      student.isAtRisk = riskLevel !== 'none';
      
      // 🏆 Top Performer Detection
      student.isTopPerformer = student.gpa >= 8 && student.attendance >= 85;
      
      // Calculate rank among all students
      const studentRank = students.findIndex(s => s._id.toString() === student._id.toString()) + 1;
      student.rank = studentRank;
    }

    res.json(students);
  } catch (err) {
    console.error("Students Error:", err);
    res.status(500).json({ msg: "Error fetching students" });
  }
});

// 🧠 Performance Prediction Endpoint
app.get("/api/students/:id/prediction", authMiddleware, async (req, res) => {
  try {
    console.log("🧠 Prediction request for student:", req.params.id);
    
    const studentId = req.params.id;
    const student = await User.findById(studentId).populate('role');
    
    if (!student) {
      return res.status(404).json({ msg: "Student not found" });
    }
    
    // Fetch student's marks for prediction
    const marks = await Marks.find({ studentId }).sort({ date: 1 });
    
    // Get current student data
    const attRecords = await AttendanceRecord.find({ studentId });
    let attendance = 0;
    if (attRecords.length > 0) {
      const present = attRecords.filter(r => r.status === 'Present').length;
      attendance = Math.round((present / attRecords.length) * 100);
    }
    
    // Calculate current GPA
    let totalMarks = 0;
    marks.forEach(m => totalMarks += m.marks);
    let avgMarks = marks.length ? totalMarks / marks.length : 0;
    let gpa = parseFloat(calculateGPA(avgMarks).toFixed(2));
    
    // Prepare student data for prediction
    const studentData = {
      ...student.toObject(),
      marks,
      attendance,
      gpa
    };
    
    // Generate prediction
    const prediction = predictPerformance(studentData);
    
    console.log("✅ Prediction generated:", prediction);
    
    res.json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        currentGPA: gpa,
        currentAttendance: attendance,
        totalMarks: marks.length
      },
      prediction,
      generatedAt: new Date().toISOString()
    });
    
  } catch (err) {
    console.error("❌ Prediction Error:", err);
    res.status(500).json({ msg: "Error generating prediction" });
  }
});

// 🧠 Batch Prediction Endpoint (for all students)
app.get("/api/faculty/predictions", authMiddleware, async (req, res) => {
  try {
    console.log("🧠 Batch prediction request");
    
    const roleName = getRoleName(req);
    if (!["faculty", "teacher", "admin", "head_of_department"].includes(roleName)) {
      return res.status(403).json({ msg: "Access denied" });
    }
    
    // Find all students
    const studentRole = await Role.findOne({ name: "student" });
    const students = await User.find({ role: studentRole._id }).select("-password");
    
    const predictions = [];
    
    for (let student of students) {
      // Fetch student's marks
      const marks = await Marks.find({ studentId: student._id }).sort({ date: 1 });
      
      // Get attendance
      const attRecords = await AttendanceRecord.find({ studentId: student._id });
      let attendance = 0;
      if (attRecords.length > 0) {
        const present = attRecords.filter(r => r.status === 'Present').length;
        attendance = Math.round((present / attRecords.length) * 100);
      }
      
      // Calculate current GPA
      let totalMarks = 0;
      marks.forEach(m => totalMarks += m.marks);
      let avgMarks = marks.length ? totalMarks / marks.length : 0;
      let gpa = parseFloat(calculateGPA(avgMarks).toFixed(2));
      
      // Prepare student data for prediction
      const studentData = {
        ...student.toObject(),
        marks,
        attendance,
        gpa
      };
      
      // Generate prediction
      const prediction = predictPerformance(studentData);
      
      predictions.push({
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          currentGPA: gpa,
          currentAttendance: attendance,
          totalMarks: marks.length
        },
        prediction
      });
    }
    
    console.log("✅ Batch predictions generated for", predictions.length, "students");
    
    res.json({
      predictions,
      summary: {
        total: predictions.length,
        highPerformers: predictions.filter(p => p.prediction.predictedScore >= 75).length,
        atRisk: predictions.filter(p => p.prediction.predictedScore < 40).length,
        improving: predictions.filter(p => p.prediction.trend === 'improving').length,
        declining: predictions.filter(p => p.prediction.trend === 'declining').length
      },
      generatedAt: new Date().toISOString()
    });
    
  } catch (err) {
    console.error("❌ Batch Prediction Error:", err);
    res.status(500).json({ msg: "Error generating batch predictions" });
  }
});

/* ================= FACULTY DASHBOARD ================= */

// Test route to debug
app.get("/api/faculty/test", authMiddleware, async (req, res) => {
  try {
    console.log("🔍 TEST ROUTE - Request received");
    const roleName = getRoleName(req);
    console.log("👤 TEST User role:", roleName);
    res.json({ message: "Test route working", role: roleName });
  } catch (err) {
    console.error("Test Route Error:", err);
    res.status(500).json({ msg: "Test route error" });
  }
});

// Temporarily commented out due to async/await issues
/*
app.get("/api/faculty/dashboard", authMiddleware, async (req, res) => {
  try {
    console.log("🔍 Faculty Dashboard - Request received");
    console.log("👤 req.user:", JSON.stringify(req.user, null, 2));
    
    const roleName = getRoleName(req);
    console.log("👤 User role:", roleName);
    
    if (!["faculty", "teacher", "admin", "head_of_department"].includes(roleName)) {
      console.log("❌ Access denied for role:", roleName);
      return res.status(403).json({ msg: "Access denied" });
    }

    console.log("🔍 Finding student role...");
    // Find student role first
    const studentRole = await Role.findOne({ name: "student" });
    if (!studentRole) {
      console.log("❌ Student role not found");
      return res.status(500).json({ msg: "Student role not found" });
    }
    console.log("✅ Student role found:", studentRole._id);
    
    const query = { role: studentRole._id };
    if (roleName === "faculty" || roleName === "teacher") {
      query.department = req.user.department;
    }
    console.log("🔍 Query:", JSON.stringify(query));

    console.log("🔍 Finding students...");
    const students = await User.find(query).select("-password");
    console.log("✅ Found students:", students.length);
    
    console.log("🔍 Finding marks...");
    const marks = await Marks.find();
    console.log("✅ Found marks:", marks.length);

    let totalMarks = 0;
    marks.forEach(m => totalMarks += m.marks);
    let avgMarks = marks.length ? totalMarks / marks.length : 0;

    console.log("🔍 Finding attendance records...");
    const attRecords = await AttendanceRecord.find();
    console.log("✅ Found attendance records:", attRecords.length);
    
    let presentCount = attRecords.filter(r => r.status === 'Present').length;
    let avgAttendance = attRecords.length ? (presentCount / attRecords.length) * 100 : 75;

    const weakStudents = students.filter(s => {
      const studentMarks = marks.filter(m => m.studentId.toString() === s._id.toString());
      if (studentMarks.length === 0) return true;
      const avgMark = studentMarks.reduce((sum, m) => sum + m.marks, 0) / studentMarks.length;
      return avgMark < 40 || avgAttendance < 75;
    });

    const result = {
      totalStudents: students.length,
      avgMarksPercent: Math.round(avgMarks),
      attendanceAvg: Math.round(avgAttendance),
      weakStudentsCount: weakStudents.length
    };
    
    console.log("📊 Dashboard result:", JSON.stringify(result, null, 2));
    res.json(result);
  } catch (err) {
    console.error("Faculty Dashboard Error:", err);
    res.status(500).json({ msg: "Error loading faculty dashboard" });
  }
});
*/

app.get("/api/faculty/performance-stats", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (!["faculty", "teacher", "admin", "head_of_department"].includes(roleName)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Get subject-wise performance
    const marks = await Marks.find();
    const subjectStats = {};
    
    marks.forEach(mark => {
      if (!subjectStats[mark.subject]) {
        subjectStats[mark.subject] = { total: 0, count: 0 };
      }
      subjectStats[mark.subject].total += mark.marks;
      subjectStats[mark.subject].count += 1;
    });

    const performanceStats = Object.keys(subjectStats).map(subject => ({
      subject,
      average: subjectStats[subject].total / subjectStats[subject].count
    }));

    res.json(performanceStats);
  } catch (err) {
    console.error("Faculty Performance Stats Error:", err);
    res.status(500).json({ msg: "Error fetching performance stats" });
  }
});

// Simple fallback endpoint for faculty stats
app.get("/api/faculty/stats-simple", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (!["faculty", "teacher", "admin", "head_of_department"].includes(roleName)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Find student role first
    const studentRole = await Role.findOne({ name: "student" });
    const students = await User.find({ role: studentRole._id }).select("-password");
    
    // Calculate basic stats
    let totalMarks = 0;
    let totalAttendance = 0;
    
    // Process students sequentially to avoid await in for loop
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const studentMarks = await Marks.find({ studentId: student._id });
      const studentAttRecords = await AttendanceRecord.find({ studentId: student._id });
      
      if (studentMarks.length > 0) {
        const avgMark = studentMarks.reduce((sum, m) => sum + m.marks, 0) / studentMarks.length;
        totalMarks += avgMark;
      }
      
      if (studentAttRecords.length > 0) {
        const presentCount = studentAttRecords.filter(r => r.status === 'Present').length;
        totalAttendance += Math.round((presentCount / studentAttRecords.length) * 100);
      }
    }
    
    const avgMarksPercent = students.length > 0 ? Math.round(totalMarks / students.length) : 0;
    const avgAttendancePercent = students.length > 0 ? Math.round(totalAttendance / students.length) : 0;
    
    res.json({
      totalStudents: students.length,
      avgMarksPercent,
      attendanceAvg: avgAttendancePercent,
      weakStudentsCount: 0 // Simplified for now
    });
  } catch (err) {
    console.error("Faculty Simple Stats Error:", err);
    res.status(500).json({ msg: "Error fetching stats" });
  }
});


/* ================= ADMIN DASHBOARD ================= */

app.get("/api/admin/stats", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "admin") return res.status(403).json({ msg: "Access denied" });
    
    // Find student role first
    const studentRole = await Role.findOne({ name: "student" });
    const students = await User.countDocuments({ role: studentRole._id });
    
    // Find faculty role
    const facultyRole = await Role.findOne({ name: "faculty" });
    const teachers = await User.countDocuments({ role: facultyRole._id });
    
    const courses = await Course.countDocuments();
    const marks = await Marks.find();

    let totalMarks = 0;
    marks.forEach(m => totalMarks += m.marks);
    let avgMarks = marks.length ? totalMarks / marks.length : 0;
    let avgGpa = calculateGPA(avgMarks);

    // Simulated attendance overview
    const attRecords = await AttendanceRecord.find();
    let presentCount = attRecords.filter(r => r.status === 'Present').length;
    let avgAttendance = attRecords.length ? (presentCount / attRecords.length) * 100 : 85;

    res.json({
      totalStudents: students,
      totalTeachers: teachers,
      totalCourses: courses,
      avgGpa: avgGpa.toFixed(2),
      avgAttendance: Math.round(avgAttendance),
      recentActivities: [
        { id: 1, text: "Teacher Smith uploaded Math internal marks", time: "2 hours ago" },
        { id: 2, text: "New assignment created for Physics 101", time: "5 hours ago" },
        { id: 3, text: "Admin updated the academic year settings", time: "1 day ago" }
      ]
    });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching admin stats" });
  }
});

// Course Management
app.get("/api/admin/courses", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "admin") return res.status(403).json({ msg: "Access denied" });
    const courses = await Course.find();
    res.json(courses);
  } catch (e) { res.status(500).json({ msg: "Error" }); }
});

app.post("/api/admin/courses", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "admin") return res.status(403).json({ msg: "Access denied" });
    const { code, title, teacher } = req.body;
    const newCourse = new Course({ code, title, teacher });
    await newCourse.save();
    res.json({ msg: "Course Added" });
  } catch (e) { res.status(500).json({ msg: "Error" }); }
});

app.delete("/api/admin/courses/:id", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "admin") return res.status(403).json({ msg: "Access denied" });
    await Course.findByIdAndDelete(req.params.id);
    res.json({ msg: "Course Deleted" });
  } catch (e) { res.status(500).json({ msg: "Error" }); }
});

app.delete("/api/admin/users/:id", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "admin") return res.status(403).json({ msg: "Access denied" });
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User Deleted" });
  } catch (e) { res.status(500).json({ msg: "Error" }); }
});


/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

server.on("error", err => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} already in use. Please stop the running process or set PORT to a different value.`);
    console.error("You can free port 5000 on Windows with: netstat -ano | findstr :5000 ; taskkill /PID <pid> /F");
    process.exit(1);
  }
  console.error("Server error:", err);
  process.exit(1);
});
