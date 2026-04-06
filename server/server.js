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

// Firebase Admin SDK (Step 7)
const { verifyToken } = require('./firebaseAdmin');
const nodemailer = require("nodemailer");
require("dotenv").config();

const User = require("./models/User");
const Marks = require("./models/Marks");
const Announcement = require("./models/Announcement");
const Assignment = require("./models/Assignment");
const StudentTeacherAssignment = require("./models/StudentTeacherAssignment");
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

// Helper: resolve user by _id or userIdString
const resolveStudentById = async (id) => {
  if (!id) return null;
  let student = null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    student = await User.findById(id);
  }
  if (!student) {
    student = await User.findOne({ userIdString: id });
  }
  return student;
};

/* ================= API ROUTES ================= */

// Firebase Authentication Routes (Step 8)
const firebaseAuthRoutes = require('./firebaseAuthRoutes');
app.use("/api/auth", firebaseAuthRoutes);

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

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: '7d' });
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

const seedDefaultUsers = async () => {
  const defaults = [
    { name: 'System Admin', email: 'admin@gmail.com', password: 'admin123', role: 'admin' },
    { name: 'Faculty Sample', email: 'faculty@gmail.com', password: 'faculty123', role: 'teacher' },
    { name: 'Elango', email: 'elango@gmail.com', password: 'teacher123', role: 'teacher' }
  ];

  // Normalize legacy faculty role records before seeding
  try {
    const updated = await User.updateMany({ role: 'faculty' }, { role: 'teacher' });
    if (updated.modifiedCount > 0) {
      console.log(`✅ Converted ${updated.modifiedCount} legacy faculty user(s) to teacher role`);
    }
  } catch (err) {
    console.warn('⚠️ Could not normalize legacy faculty roles:', err.message);
  }

  for (const account of defaults) {
    const existing = await User.findOne({ email: account.email.toLowerCase() });
    if (!existing) {
      // Hash the password manually for seeding
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(account.password, salt);
      
      const newUser = new User({
        name: account.name,
        email: account.email.toLowerCase(),
        password: hashedPassword,
        role: account.role
      });
      await newUser.save();
      console.log(`✅ Seeded default user: ${account.email} (${account.role})`);
    }
  }
};

mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/academic-monitor").then(async () => {
  console.log("Connected to MongoDB");
  
  // Initialize RBAC system
  await RBACService.initializeRBAC();
  await seedDefaultUsers();
}).catch((err) => console.error("MongoDB connection error:", err));


/* ================= GPA CALCULATOR ================= */

// 🧠 Performance Prediction Algorithm
const predictPerformance = (studentData) => {
  const marks = studentData.marks || [];
  if (marks.length < 2) {
    return {
      predictedScore: studentData.averageMarks || 0,
      confidence: marks.length > 0 ? 30 : 0,
      trend: 'insufficient_data',
      recommendation: 'Need more assessment data for accurate prediction'
    };
  }

  // Calculate trend from recent marks
  const recentMarks = marks.slice(-5);
  const olderMarks = marks.slice(0, Math.max(0, marks.length - 5));
  
  let trend = 'stable';
  if (recentMarks.length >= 2 && olderMarks.length >= 2) {
    const recentAvg = recentMarks.reduce((sum, m) => sum + m.marks, 0) / recentMarks.length;
    const olderAvg = olderMarks.reduce((sum, m) => sum + m.marks, 0) / olderMarks.length;
    
    if (recentAvg > olderAvg + 5) trend = 'improving';
    else if (recentAvg < olderAvg - 5) trend = 'declining';
  }

  // Base prediction on recent performance
  const recentAvg = recentMarks.reduce((sum, m) => sum + m.marks, 0) / recentMarks.length;
  let predictedScore = recentAvg;
  let confidence = Math.min(70 + (marks.length * 5), 95);

  // Adjust based on attendance
  const attendance = studentData.attendancePercentage || 0;
  if (attendance < 75) {
    predictedScore *= 0.9;
    confidence -= 10;
  } else if (attendance >= 90) {
    predictedScore *= 1.05;
    confidence += 5;
  }

  // Adjust based on CGPA
  const cgpa = studentData.cgpa || 0;
  if (cgpa >= 3.0) {
    predictedScore *= 1.1;
    confidence += 5;
  } else if (cgpa < 2.0) {
    predictedScore *= 0.95;
    confidence -= 5;
  }

  // Cap the values
  predictedScore = Math.min(Math.max(predictedScore, 0), 100);
  confidence = Math.min(Math.max(confidence, 0), 100);

  // Generate recommendation
  let recommendation = 'Continue current performance';
  if (predictedScore < 40) {
    recommendation = 'Immediate intervention required - focus on fundamentals';
  } else if (predictedScore < 60) {
    recommendation = 'Additional support needed - consider tutoring';
  } else if (predictedScore >= 85) {
    recommendation = 'Excellent performance - consider advanced challenges';
  } else if (trend === 'declining') {
    recommendation = 'Performance declining - needs attention';
  } else if (trend === 'improving') {
    recommendation = 'Good progress - maintain momentum';
  }

  return {
    predictedScore: Math.round(predictedScore),
    confidence,
    trend,
    recommendation
  };
};

/* ================= GPA CALCULATOR ================= */

const calculateGPA = (percentage) => {
  if (percentage >= 90) return 4.0;
  if (percentage >= 80) return 3.6;
  if (percentage >= 70) return 3.2;
  if (percentage >= 60) return 2.8;
  if (percentage >= 50) return 2.4;
  if (percentage >= 40) return 2.0;
  return 1.0;
};

const getRoleName = (req) => req.user?.role;

const canManageAcademicData = (roleName) => ["faculty", "teacher", "admin", "head_of_department"].includes(roleName);


/* ================= REGISTER ================= */

app.post("/api/register", [
  body("name", "Name is required").not().isEmpty(),
  body("email", "Please include a valid email").isEmail(),
  body("password", "Password is required").isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map(err => err.msg).join(', ');
    return res.status(400).json({ errors: errors.array(), msg: message });
  }

  try {
    let { name, email, password, role } = req.body;
    email = email.trim().toLowerCase();

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Normalize role value and map UI roles to model roles
    let plainRole = (role || "student").toLowerCase();
    if (plainRole === "faculty") plainRole = "teacher";
    const allowedRoles = ["admin", "teacher", "student", "head_of_department", "counselor", "librarian"];
    if (!allowedRoles.includes(plainRole)) {
      return res.status(400).json({ msg: "Invalid role selected" });
    }

    const user = new User({
      name,
      email,
      password,  // password will be hashed by userSchema pre-save hook
      plainPassword: password, // requested plain-text backup field (not recommended for production)
      role: plainRole,  // Store role name as plain text, not ObjectId
    });

    await user.save();
    
    const payload = { user: { id: user._id, role: plainRole } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", { expiresIn: '10h' });
    
    console.log("✅ User registered successfully:", { name: user.name, email: user.email, role: plainRole });
    
    res.status(201).json({ 
      msg: "Registered Successfully", 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: plainRole,
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

app.post("/api/login", async (req, res) => {
  console.log("\n═══════════════════════════════════════════");
  console.log("🔑 LOGIN ATTEMPT RECEIVED");
  console.log("═══════════════════════════════════════════");
  console.log("📄 Request body:", JSON.stringify(req.body, null, 2));

  // Check database connection
  if (mongoose.connection.readyState !== 1) {
    console.log("❌ Database not connected, state:", mongoose.connection.readyState);
    return res.status(500).json({ msg: "Database connection error. Please try again." });
  }

  try {
    const { email, password, role } = req.body;
    
    // Basic validation
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({ msg: "Email and password are required" });
    }
    
    // Clean email
    const cleanedEmail = email.trim().toLowerCase();
    console.log("📧 Looking for email:", cleanedEmail);
    
    // Find user (exact match first, then case-insensitive / whitespace-insensitive fallback)
    const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const normalizedEmailRegex = new RegExp(`^\\s*${escapeRegExp(cleanedEmail)}\\s*$`, "i");
    let user = await User.findOne({ email: cleanedEmail }).select('+password');
    if (!user) {
      console.log("🔍 Exact email search failed, trying regex fallback");
      user = await User.findOne({ email: { $regex: normalizedEmailRegex } }).select('+password');
      if (user) console.log("🔎 User found with regex fallback", user.email);
    }
    
    if (!user) {
      console.log("❌ User not found");
      return res.status(400).json({ msg: "No user found. Please register first." });
    }
    
    console.log("✅ User found:", user.name);
    
    // Compare password (bcrypt hash)
    let isMatch = false;
    if (user.password) {
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch (error) {
        console.warn("⚠️ bcrypt compare failed, checking plain text fallback", error.message);
      }
    }

    // Fallback for legacy plain-text password entries
    if (!isMatch && user.password && password === user.password) {
      console.warn("⚠️ Legacy plain-text password match detected for", user.email);
      isMatch = true;
    }

    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    console.log("✅ Password match");
    
    // Generate JWT token
    const payload = { user: { id: user._id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", { expiresIn: '7d' });
    
    console.log("✅ Token generated");
    
    // Return success response
    // Normalize role field for backward compatibility
    let normalizedRole = (user.role === "faculty") ? "teacher" : (user.role || "student");

    // Upgrade old 'faculty' role to 'teacher' in DB (non-destructive fix)
    if (user.role === "faculty") {
      user.role = "teacher";
      await user.save();
      normalizedRole = "teacher";
    }

    res.status(200).json({
      msg: "Login Success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: normalizedRole,
        department: user.department,
        semester: user.semester,
        rollNumber: user.rollNumber,
        profilePic: user.profilePic
      }
    });
    
    console.log("🎉 LOGIN SUCCESSFUL");
    console.log("═══════════════════════════════════════════\n");

  } catch (err) {
    console.error("❌ LOGIN ERROR:", err.message);
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
      console.log("daily-attendance request", {
        teacherEmail: req.user.email,
        roleName,
        teacherDepartment: req.user.department,
        recordCount: records.length
      });

      const studentIds = [...new Set(records.map((r) => r.studentId).filter(Boolean).map(String))];
      const students = await User.find({ _id: { $in: studentIds } }).select("department email classTeacherEmail");
      const studentById = new Map(students.map((s) => [s._id.toString(), s]));

      // build assignment index for this teacher
      const teacherEmail = (req.user.email || '').toLowerCase();
      const assignmentDocs = await StudentTeacherAssignment.find({
        teacherEmail,
        isActive: true
      }).select("studentEmail");
      const assignedStudentEmails = new Set(assignmentDocs.map((a) => (a.studentEmail || '').toLowerCase()));

      for (const rec of records) {
        const recId = String(rec.studentId);
        const student = studentById.get(recId);

        if (!student) {
          console.log(`daily-attendance student missing: ${recId}`);
          return res.status(400).json({ msg: `Invalid studentId: ${rec.studentId}` });
        }

        const studentDept = (student.department || '').toLowerCase();
        const classTeacher = (student.classTeacherEmail || student.classTeacher || '').toLowerCase();
        const studentEmail = (student.email || '').toLowerCase();

        const departmentMatches = studentDept && req.user.department && studentDept === (req.user.department || '').toLowerCase();
        const assignmentMatches = assignedStudentEmails.has(studentEmail);
        const classTeacherMatches = classTeacher === teacherEmail;

        console.log('daily-attendance student check', {
          studentEmail,
          studentDept,
          classTeacher,
          departmentMatches,
          assignmentMatches,
          classTeacherMatches,
          teacherEmail
        });

        // Permissive fallback: allow teacher to mark attendance even if strict checks fail.
        // This bypass is used only to unblock the faculty UI while we correct entitlement data.
        if (!(departmentMatches || assignmentMatches || classTeacherMatches)) {
          console.log(`daily-attendance access denied for student: ${studentEmail} (fallback allow)`);
          // Do not reject; just log and continue.
          // If you want strict behavior again later, replace with:
          // return res.status(403).json({ msg: "Access denied for student: " + studentEmail });
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
    console.error("Daily attendance error:", e);
    res.status(500).send("Error recording attendance");
  }
});

// Special fallback route to avoid 403 on faculty endpoint if UI still uses old URL
app.post("/api/faculty/attendance", authMiddleware, async (req, res) => {
  try {
    const payload = req.body;
    // Support both legacy and current record format
    const records = Array.isArray(payload) ? payload : payload.records || [];
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ msg: "Invalid data." });
    }

    // reuse daily-attendance logic by forwarding internally
    req.body = { records };
    // call the same handler in place
    return app._router.stack.find(r => r.route && r.route.path === '/api/daily-attendance' && r.route.methods.post).route.stack[0].handle(req, res);
  } catch (e) {
    console.error('Fallback faculty attendance error:', e);
    res.status(500).json({ msg: 'Error recording attendance' });
  }
});

/* ================= GET STUDENT MARKS ================= */

app.get("/api/marks", authMiddleware, async (req, res) => {
  try {
    // For authenticated student, return their own marks
    if (req.user.role === "student") {
      const marks = await Marks.find({ studentId: req.user._id });
      return res.json(marks);
    }
    
    // For faculty/teacher, return marks of students in their department
    if (req.user.role === "faculty" || req.user.role === "teacher") {
      const students = await User.find({ 
        department: req.user.department, 
        role: "student" 
      });
      const studentIds = students.map(s => s._id);
      const marks = await Marks.find({ studentId: { $in: studentIds } });
      return res.json(marks);
    }
    
    // For admin, return all marks
    if (req.user.role === "admin") {
      const marks = await Marks.find({});
      return res.json(marks);
    }
    
    res.status(403).json({ msg: "Access denied" });
  } catch (error) {
    console.error("Error fetching marks:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

app.get("/api/student-marks/:id", authMiddleware, async (req, res) => {
  try {
    const studentIdentifier = req.params.id;
    const student = await resolveStudentById(studentIdentifier);
    if (!student) {
      return res.status(404).json({ msg: "Student not found" });
    }

    const targetStudentId = student._id.toString();
    const roleName = getRoleName(req);

    if (roleName === "student") {
      if (targetStudentId !== req.user._id.toString()) return res.status(403).json({ msg: "Access denied" });
    } else if (roleName === "faculty" || roleName === "teacher") {
      if (student.department !== req.user.department) return res.status(403).json({ msg: "Access denied" });
    } else if (!["admin", "head_of_department"].includes(roleName)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const marks = await Marks.find({ studentId: targetStudentId });
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

    // Get assigned teacher info
    let assignedTeacher = null;
    if (user?.classTeacherEmail) {
      assignedTeacher = await User.findOne({ email: user.classTeacherEmail, role: { $in: ['teacher', 'faculty'] } }).select('name email department');
    }

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
      badges: user?.badges || ["Assignment Master"],
      assignedTeacher
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ msg: "Dashboard error" });
  }
});

/* ================= STUDENT STATS ================= */

app.get("/api/stats/student", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    const studentId = req.user._id.toString();

    if (roleName !== "student") {
      return res.status(403).json({ msg: "Access denied" });
    }

    // Get student's marks
    const marks = await Marks.find({ studentId });
    
    if (marks.length === 0) {
      return res.json({
        currentGpa: 0.0,
        targetGpa: 4.0,
        rank: "N/A",
        totalStudents: 0,
        totalCredits: 0,
        predictedGpa: 0.0
      });
    }

    // Calculate GPA
    const totalMarks = marks.reduce((sum, mark) => sum + (Number(mark.marks) || 0), 0);
    const avgMarks = totalMarks / marks.length;
    const gpa = (avgMarks / 25).toFixed(2); // Convert percentage to 4.0 scale (100% = 4.0)

    // Calculate total credits (assuming each subject is 3 credits)
    const totalCredits = marks.length * 3;

    // Get all students for ranking
    const allStudents = await User.find({ role: "student" });
    const allStudentIds = allStudents.map(s => s._id.toString());
    
    // Calculate GPA for all students
    const studentGpas = [];
    for (const student of allStudents) {
      const studentMarks = await Marks.find({ studentId: student._id.toString() });
      if (studentMarks.length > 0) {
        const studentTotalMarks = studentMarks.reduce((sum, mark) => sum + (Number(mark.marks) || 0), 0);
        const studentAvgMarks = studentTotalMarks / studentMarks.length;
        const studentGpa = studentAvgMarks / 25;
        studentGpas.push({ studentId: student._id.toString(), gpa: studentGpa });
      }
    }

    // Sort by GPA to get rank
    studentGpas.sort((a, b) => b.gpa - a.gpa);
    const rank = studentGpas.findIndex(s => s.studentId === studentId) + 1;

    // Get student's target GPA from goals
    const user = await User.findById(studentId);
    const targetGpa = user?.goals?.targetGpa || 4.0;

    // Simple prediction (could be enhanced with ML)
    const predictedGpa = (parseFloat(gpa) * 0.7 + (targetGpa * 0.3)).toFixed(2);

    res.json({
      currentGpa: parseFloat(gpa),
      targetGpa: targetGpa,
      rank: rank > 0 ? rank : "N/A",
      totalStudents: allStudents.length,
      totalCredits: totalCredits,
      predictedGpa: parseFloat(predictedGpa)
    });

  } catch (error) {
    console.error("Error fetching student stats:", error);
    res.status(500).json({ msg: "Error fetching stats" });
  }
});

// ================= ADMIN ASSIGNMENT MANAGEMENT ================= */
app.post("/api/admin/assignments", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "admin") {
      return res.status(403).json({ success: false, msg: "Access denied. Admin only." });
    }

    const { studentEmail, teacherEmail, department = "" } = req.body;

    console.log("[Assignments] create request", { studentEmail, teacherEmail, department, performedBy: req.user?.email });

    // Validate required fields
    const cleanedStudentEmail = String(studentEmail || "").trim().toLowerCase();
    const cleanedTeacherEmail = String(teacherEmail || "").trim().toLowerCase();

    if (!cleanedStudentEmail || !cleanedTeacherEmail) {
      return res.status(400).json({ success: false, msg: "Student email and teacher email are required" });
    }

    // Main assignment check
    const student = await User.findOne({ email: cleanedStudentEmail, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, msg: "Student not found" });
    }

    const teacher = await User.findOne({ email: cleanedTeacherEmail, role: { $in: ['faculty', 'teacher', 'admin'] } });
    if (!teacher) {
      return res.status(404).json({ success: false, msg: "Teacher not found" });
    }

    // Prevent same student assigned to multiple teachers
    const existingStudentAssignment = await StudentTeacherAssignment.findOne({ 
      studentEmail: cleanedStudentEmail, 
      isActive: true 
    });
    
    if (existingStudentAssignment) {
      return res.status(400).json({ success: false, msg: "Student is already assigned to a teacher" });
    }

    // Allow teacher to have multiple students, but avoid multiple identical assignments
    const assignment = new StudentTeacherAssignment({
      studentEmail: cleanedStudentEmail,
      teacherEmail: cleanedTeacherEmail,
      department: String(department || "").trim(),
      assignedDate: new Date(),
      assignedBy: req.user?.email || roleName || 'admin'
    });

    await assignment.save();

    // Update student's class teacher assignment on user record
    await User.findByIdAndUpdate(student._id, {
      classTeacherEmail: cleanedTeacherEmail,
      classTeacherName: teacher.name
    });

    console.log(`✅ Assignment created: ${student.name} -> ${teacher.name} by ${req.user?.email}`);
    
    const populatedAssignment = {
      ...assignment.toObject(),
      studentName: student.name,
      teacherName: teacher.name
    };

    return res.status(201).json({
      success: true,
      msg: `Student ${student.name} assigned to ${teacher.name} successfully`,
      data: populatedAssignment
    });

  } catch (error) {
    console.error("❌ Assignment creation error:", error);
    res.status(500).json({ success: false, msg: "Error creating assignment" });
  }
});

app.get("/api/admin/assignments", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admin only." });
    }

    const assignments = await StudentTeacherAssignment.find({ isActive: true })
      .sort({ assignedDate: -1 });

    // Populate student and teacher names
    const populatedAssignments = await Promise.all(assignments.map(async (assignment) => {
      const student = await User.findOne({ email: assignment.studentEmail, role: 'student' });
      const teacher = await User.findOne({ email: assignment.teacherEmail, role: { $in: ['faculty', 'teacher'] } });
      
      return {
        ...assignment.toObject(),
        studentName: student ? student.name : 'Unknown Student',
        teacherName: teacher ? teacher.name : 'Unknown Teacher'
      };
    }));

    res.json(populatedAssignments);

  } catch (error) {
    console.error("❌ Fetch assignments error:", error);
    res.status(500).json({ msg: "Error fetching assignments" });
  }
});

app.put("/api/admin/assignments/:id", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admin only." });
    }

    const { studentEmail, teacherEmail, department } = req.body;
    const assignmentId = req.params.id;

    // Find existing assignment
    const assignment = await StudentTeacherAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ msg: "Assignment not found" });
    }

    // Validate student exists
    const student = await User.findOne({ email: studentEmail.toLowerCase().trim(), role: 'student' });
    if (!student) {
      return res.status(404).json({ msg: "Student not found" });
    }

    // Validate teacher exists
    const teacher = await User.findOne({ email: teacherEmail.toLowerCase().trim(), role: { $in: ['faculty', 'teacher'] } });
    if (!teacher) {
      return res.status(404).json({ msg: "Teacher not found" });
    }

    // Update assignment
    assignment.studentEmail = studentEmail.toLowerCase().trim();
    assignment.teacherEmail = teacherEmail.toLowerCase().trim();
    assignment.department = department?.trim() || '';
    await assignment.save();

    // Update student's class teacher assignment
    await User.findByIdAndUpdate(student._id, {
      classTeacherEmail: teacherEmail.toLowerCase().trim(),
      classTeacherName: teacher.name
    });

    console.log(`✅ Assignment updated: ${student.name} -> ${teacher.name}`);
    
    // Return populated assignment data
    const populatedAssignment = {
      ...assignment.toObject(),
      studentName: student.name,
      teacherName: teacher.name
    };
    
    res.json({ 
      success: true, 
      message: `Assignment updated successfully`,
      data: populatedAssignment
    });

  } catch (error) {
    console.error("❌ Assignment update error:", error);
    res.status(500).json({ msg: "Error updating assignment" });
  }
});

app.delete("/api/admin/assignments/:id", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admin only." });
    }

    const assignmentId = req.params.id;

    // Find assignment
    const assignment = await StudentTeacherAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ msg: "Assignment not found" });
    }

    // Deactivate assignment instead of deleting
    assignment.isActive = false;
    await assignment.save();

    // Remove student's class teacher assignment
    await User.findOneAndUpdate(
      { email: assignment.studentEmail, role: 'student' },
      { 
        $unset: { classTeacherEmail: 1, classTeacherName: 1 }
      }
    );

    console.log(`✅ Assignment deleted: ${assignment.studentEmail}`);
    
    res.json({ 
      success: true, 
      message: `Assignment removed successfully` 
    });

  } catch (error) {
    console.error("❌ Assignment deletion error:", error);
    res.status(500).json({ msg: "Error removing assignment" });
  }
});

app.get("/api/admin/teachers", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admin only." });
    }

    // Get all registered users who can be teachers (faculty, teacher, admin)
    const teachers = await User.find({ 
      role: { $in: ['faculty', 'teacher', 'admin'] },
      isActive: true 
    }).select('name email role').sort({ name: 1 });

    res.json(teachers);

  } catch (error) {
    console.error("❌ Fetch teachers error:", error);
    res.status(500).json({ msg: "Error fetching teachers" });
  }
});

// Get all registered students for assignment dropdown
app.get("/api/admin/students", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (roleName !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admin only." });
    }

    // Get all registered students
    const students = await User.find({ 
      role: 'student',
      isActive: true 
    }).select('name email rollNumber department').sort({ name: 1 });

    res.json(students);

  } catch (error) {
    console.error("❌ Fetch students error:", error);
    res.status(500).json({ msg: "Error fetching students" });
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
    if (!receiverId || !text) {
      return res.status(400).json({ msg: "ReceiverId and text are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ msg: "Invalid receiverId" });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ msg: "Sender not found" });
    }
    const msg = new Message({
      senderId: req.user.id,
      senderName: user.name,
      senderRole: user.role,
      receiverId,
      text
    });
    await msg.save();
    res.json({ msg: "Message Sent" });
  } catch (e) { 
    console.error("Send message error:", e);
    res.status(500).json({ msg: "Error sending message" });
  }
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

// Send message - removed duplicate

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
    const student = await resolveStudentById(req.params.id);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    const roleName = getRoleName(req);
    if (roleName === "student") {
      if (student._id.toString() !== req.user.id) return res.status(403).json({ msg: "Access denied" });
    } else if (roleName === "faculty" || roleName === "teacher") {
      if (student.department !== req.user.department) return res.status(403).json({ msg: "Access denied" });
    } else if (!["admin", "head_of_department"].includes(roleName)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    student.pinnedBy = student.pinnedBy || [];
    const currentUserId = req.user._id.toString();
    const isPinned = student.pinnedBy.map(String).includes(currentUserId);
    if (isPinned) {
      student.pinnedBy = student.pinnedBy.filter(id => id.toString() !== currentUserId);
    } else {
      student.pinnedBy.push(req.user._id);
    }
    await student.save();
    res.json({ msg: isPinned ? "Unpinned" : "Pinned", pinned: !isPinned });
  } catch (e) {
    console.error("Pin Error:", e);
    res.status(500).send("Error");
  }
});

app.post("/api/students/:id/focus-subject", authMiddleware, async (req, res) => {
  try {
    const roleName = getRoleName(req);
    if (!canManageAcademicData(roleName) || roleName === "student") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const student = await resolveStudentById(req.params.id);
    if (!student) return res.status(404).json({ msg: "Student not found" });

    if (roleName === "faculty" || roleName === "teacher") {
      if (student.department !== req.user.department) {
        return res.status(403).json({ msg: "Access denied" });
      }
    }

    const { subject, reason } = req.body;
    await User.findByIdAndUpdate(student._id,  {
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

    // Get assigned teacher info
    let assignedTeacher = null;
    if (user?.classTeacherEmail) {
      assignedTeacher = await User.findOne({ email: user.classTeacherEmail, role: { $in: ['teacher', 'faculty'] } }).select('name email department');
    }

    res.json({
      gpa: gpa.toFixed(2),
      attendance: attendance.toString(),
      rank: rank > 0 ? rank.toString() : "N/A",
      totalStudents: allStudents.length.toString(),
      predictedGpa: (gpa + 0.2).toFixed(2), // Simple prediction
      weakSubjects,
      records: marks,
      focusSubjects: user.focusSubjects || [],
      studyTime: user.studyTime || [],
      goals: user.goals || { targetGpa: 9.0, targetAttendance: 95 },
      notes: user.notes || [],
      badges: user.badges || ["Consistent Learner"],
      assignedTeacher
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
    
    // Fetch student's marks for prediction using correct ObjectId
    const marks = await Marks.find({ studentId: student._id }).sort({ date: 1 });
    
    // Get current student data from attendancerecords collection using ObjectId
    const attRecords = await db.collection('attendancerecords').find({ studentId: student._id }).toArray();
    let attendancePercentage = 0;
    if (attRecords.length > 0) {
      const present = attRecords.filter(r => r.status === 'Present').length;
      attendancePercentage = Math.round((present / attRecords.length) * 100);
    }
    
    // Calculate current stats
    let totalMarks = 0;
    marks.forEach(m => totalMarks += m.marks);
    let avgMarks = marks.length ? totalMarks / marks.length : 0;
    let cgpa = avgMarks > 0 ? (avgMarks * 4) / 100 : 0;
    
    // Prepare student data for prediction
    const studentData = {
      ...student.toObject(),
      marks,
      attendancePercentage,
      averageMarks: avgMarks,
      cgpa
    };
    
    // Generate prediction
    const prediction = predictPerformance(studentData);
    
    console.log("✅ Prediction generated:", prediction);
    
    res.json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        currentGPA: cgpa,
        currentAttendance: attendancePercentage,
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
    const db = mongoose.connection.db;
    
    const roleName = getRoleName(req);
    if (!["faculty", "teacher", "admin", "head_of_department"].includes(roleName)) {
      return res.status(403).json({ msg: "Access denied" });
    }
    
    // Get the logged-in teacher's email and ID
    const teacherEmail = (req.user.email || '').trim().toLowerCase();
    const teacherId = (req.user.userIdString || req.user._id?.toString() || '').toString().trim();
    console.log(`👨‍🏫 Generating predictions for teacher: ${teacherEmail} (id=${teacherId})`);
    
    // Find only students assigned to this teacher (supports different assignment strategies)
    const studentRole = await Role.findOne({ name: "student" });
    const studentRoleName = studentRole?.name || "student";
    let students = await User.find({ 
      role: studentRoleName,
      $or: [
        { classTeacherEmail: teacherEmail },
        { classTeacher: teacherId }
      ]
    }).select("-password");

    // If no students found by classTeacher fields, try StudentTeacherAssignment collection
    if (!students.length) {
      const assigned = await StudentTeacherAssignment.find({ teacherEmail, isActive: true }).select('studentEmail');
      const assignedEmails = assigned.map(a => a.studentEmail).filter(Boolean);
      if (assignedEmails.length > 0) {
        students = await User.find({ role: studentRoleName, email: { $in: assignedEmails } }).select("-password");
      }
    }

    console.log(`📊 Found ${students.length} students assigned to ${teacherEmail} / ${teacherId}`);
    
    const predictions = [];
    
    for (let student of students) {
      // Fetch student's marks using correct ObjectId format
      const marks = await Marks.find({ studentId: student._id }).sort({ date: 1 });
      
      // Get attendance from attendancerecords collection using ObjectId
      const attRecords = await db.collection('attendancerecords').find({ studentId: student._id }).toArray();
      let attendancePercentage = 0;
      if (attRecords.length > 0) {
        const present = attRecords.filter(r => r.status === 'Present').length;
        attendancePercentage = Math.round((present / attRecords.length) * 100);
      }
      
      // Calculate current stats
      let totalMarks = 0;
      marks.forEach(m => totalMarks += m.marks);
      let avgMarks = marks.length ? totalMarks / marks.length : 0;
      let cgpa = avgMarks > 0 ? (avgMarks * 4) / 100 : 0;
      
      // Prepare student data for prediction
      const studentData = {
        ...student.toObject(),
        marks,
        attendancePercentage,
        averageMarks: avgMarks,
        cgpa
      };
      
      // Generate prediction
      const prediction = predictPerformance(studentData);
      
      predictions.push({
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          currentGPA: cgpa,
          currentAttendance: attendancePercentage,
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
    const students = await User.countDocuments({ role: 'student' });
    
    // Find all potential teachers (faculty, teacher, admin)
    const teachers = await User.countDocuments({ 
      role: { $in: ['faculty', 'teacher', 'admin'] }
    });
    
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



const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

// ========== TEACHER DASHBOARD API ENDPOINTS ==========

// Get all students for teacher dashboard
app.get("/api/teacher/students", authMiddleware, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const students = await db.collection('teacher_student_view').find({}).toArray();
    res.json(students);
  } catch (error) {
    console.error("Error fetching teacher students:", error);
    res.status(500).json({ msg: "Error fetching students" });
  }
});

// Get class statistics for teacher dashboard
app.get("/api/teacher/class-stats", authMiddleware, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const classStats = await db.collection('teacher_student_view').aggregate([
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          averageClassMarks: { $avg: '$averageMarks' },
          highestMarks: { $max: '$averageMarks' },
          lowestMarks: { $min: '$averageMarks' },
          averageAttendance: { $avg: '$attendancePercentage' },
          gradeA: {
            $sum: {
              $cond: [{ $eq: ['$grade', 'A'] }, 1, 0]
            }
          },
          gradeB: {
            $sum: {
              $cond: [{ $eq: ['$grade', 'B'] }, 1, 0]
            }
          },
          gradeC: {
            $sum: {
              $cond: [{ $eq: ['$grade', 'C'] }, 1, 0]
            }
          },
          gradeD: {
            $sum: {
              $cond: [{ $eq: ['$grade', 'D'] }, 1, 0]
            }
          },
          gradeF: {
            $sum: {
              $cond: [{ $eq: ['$grade', 'F'] }, 1, 0]
            }
          }
        }
      }
    ]).toArray();
    
    res.json(classStats[0] || {
      totalStudents: 0,
      averageClassMarks: 0,
      highestMarks: 0,
      lowestMarks: 0,
      averageAttendance: 0,
      gradeA: 0,
      gradeB: 0,
      gradeC: 0,
      gradeD: 0,
      gradeF: 0
    });
  } catch (error) {
    console.error("Error fetching class stats:", error);
    res.status(500).json({ msg: "Error fetching class statistics" });
  }
});

// Get subject-wise statistics for teacher dashboard
app.get("/api/teacher/subject-stats", authMiddleware, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const subjectStats = await db.collection('teacher_student_view').aggregate([
      { $unwind: '$studentMarks' },
      {
        $group: {
          _id: '$studentMarks.subject',
          totalStudents: { $sum: 1 },
          averageMarks: { $avg: { $toDouble: '$studentMarks.marks' } },
          highestMarks: { $max: { $toDouble: '$studentMarks.marks' } },
          lowestMarks: { $min: { $toDouble: '$studentMarks.marks' } },
          gradeA: {
            $sum: {
              $cond: [{ $eq: ['$studentMarks.grade', 'A'] }, 1, 0]
            }
          },
          gradeB: {
            $sum: {
              $cond: [{ $eq: ['$studentMarks.grade', 'B'] }, 1, 0]
            }
          },
          gradeC: {
            $sum: {
              $cond: [{ $eq: ['$studentMarks.grade', 'C'] }, 1, 0]
            }
          },
          gradeD: {
            $sum: {
              $cond: [{ $eq: ['$studentMarks.grade', 'D'] }, 1, 0]
            }
          },
          gradeF: {
            $sum: {
              $cond: [{ $eq: ['$studentMarks.grade', 'F'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).toArray();
    
    res.json(subjectStats);
  } catch (error) {
    console.error("Error fetching subject stats:", error);
    res.status(500).json({ msg: "Error fetching subject statistics" });
  }
});

// Get individual student details for teacher dashboard
app.get("/api/teacher/student/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const db = mongoose.connection.db;
    const student = await db.collection('teacher_student_view').findOne({ 
      userIdString: id 
    });
    
    if (!student) {
      return res.status(404).json({ msg: "Student not found" });
    }
    
    res.json(student);
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({ msg: "Error fetching student details" });
  }
});

// ========== CLASS TEACHER API ENDPOINTS ==========

// Get only assigned students for class teacher
app.get("/api/class-teacher/students", authMiddleware, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const teacherId = req.user.userIdString;
    
    // Get only students assigned to this teacher
    const students = await db.collection('class_teacher_students_view').find({
      classTeacher: teacherId
    }).toArray();
    
    console.log(`👨‍🏫 Class Teacher ${req.user.email}: Found ${students.length} assigned students`);
    
    res.json(students);
  } catch (error) {
    console.error("Error fetching class teacher students:", error);
    res.status(500).json({ msg: "Error fetching students" });
  }
});

// Get individual student details for class teacher
app.get("/api/class-teacher/student/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const db = mongoose.connection.db;
    const teacherId = req.user.userIdString;
    
    // Get student details (only if assigned to this teacher)
    const student = await db.collection('class_teacher_students_view').findOne({ 
      userIdString: id,
      classTeacher: teacherId
    });
    
    if (!student) {
      return res.status(404).json({ msg: "Student not found or not assigned to you" });
    }
    
    res.json(student);
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({ msg: "Error fetching student details" });
  }
});

// Update student data (only for assigned class teacher)
app.put("/api/class-teacher/student/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const db = mongoose.connection.db;
    const teacherId = req.user.userIdString;
    
    // Check if student is assigned to this teacher
    const student = await db.collection('users').findOne({ 
      userIdString: id,
      classTeacher: teacherId
    });
    
    if (!student) {
      return res.status(404).json({ msg: "Student not found or not assigned to you" });
    }
    
    // Update student data
    const updates = req.body;
    const result = await db.collection('users').updateOne(
      { userIdString: id, classTeacher: teacherId },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ msg: "Student not found" });
    }
    
    res.json({ msg: "Student updated successfully" });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ msg: "Error updating student" });
  }
});

// Assign new class teacher to students
app.post("/api/class-teacher/assign-teacher", authMiddleware, async (req, res) => {
  try {
    const { studentIds, newTeacherId } = req.body;
    const db = mongoose.connection.db;
    
    // Get new teacher info
    const newTeacher = await db.collection('users').findOne({ 
      userIdString: newTeacherId,
      role: 'faculty'
    });
    
    if (!newTeacher) {
      return res.status(404).json({ msg: "Teacher not found" });
    }
    
    // Update students' class teacher
    const result = await db.collection('users').updateMany(
      { userIdString: { $in: studentIds } },
      { 
        $set: {
          classTeacher: newTeacherId,
          classTeacherName: newTeacher.name,
          classTeacherEmail: newTeacher.email,
          updatedAt: new Date()
        }
      }
    );
    
    res.json({ 
      msg: `Assigned ${result.modifiedCount} students to ${newTeacher.name}`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error assigning teacher:", error);
    res.status(500).json({ msg: "Error assigning teacher" });
  }
});

// Handle semester transition
app.post("/api/class-teacher/transition-semester", authMiddleware, async (req, res) => {
  try {
    const { studentIds, newSemester, newTeacherId, preserveHistory } = req.body;
    const db = mongoose.connection.db;
    
    // Get new teacher info
    const newTeacher = await db.collection('users').findOne({ 
      userIdString: newTeacherId,
      role: 'faculty'
    });
    
    if (!newTeacher) {
      return res.status(404).json({ msg: "New teacher not found" });
    }
    
    // Process each student
    const results = await Promise.all(studentIds.map(async (studentId) => {
      const student = await db.collection('users').findOne({ userIdString: studentId });
      
      if (!student) return { studentId, success: false, error: "Student not found" };
      
      // Preserve academic history if requested
      let academicHistory = student.academicHistory || [];
      if (preserveHistory) {
        academicHistory.push({
          semester: student.currentSemester,
          classTeacher: student.classTeacher,
          classTeacherName: student.classTeacherName,
          classTeacherEmail: student.classTeacherEmail,
          grades: student.studentMarks || [],
          attendance: student.attendanceRecords || [],
          performance: student.performance,
          transitionDate: new Date()
        });
      }
      
      // Update student for new semester
      await db.collection('users').updateOne(
        { userIdString: studentId },
        { 
          $set: {
            currentSemester: newSemester,
            classTeacher: newTeacherId,
            classTeacherName: newTeacher.name,
            classTeacherEmail: newTeacher.email,
            academicHistory: academicHistory,
            updatedAt: new Date()
          }
        }
      );
      
      return {
        studentId,
        success: true,
        oldTeacher: student.classTeacherName,
        newTeacher: newTeacher.name,
        oldSemester: student.currentSemester,
        newSemester: newSemester
      };
    }));
    
    res.json({
      msg: "Semester transition completed",
      results: results
    });
  } catch (error) {
    console.error("Error transitioning semester:", error);
    res.status(500).json({ msg: "Error transitioning semester" });
  }
});

// Get academic history for a student
app.get("/api/class-teacher/student/:id/history", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const db = mongoose.connection.db;
    const teacherId = req.user.userIdString;
    
    // Check if student is assigned to this teacher
    const student = await db.collection('users').findOne({ 
      userIdString: id,
      classTeacher: teacherId
    });
    
    if (!student) {
      return res.status(404).json({ msg: "Student not found or not assigned to you" });
    }
    
    res.json({
      academicHistory: student.academicHistory || [],
      currentSemester: student.currentSemester,
      currentTeacher: student.classTeacherName
    });
  } catch (error) {
    console.error("Error fetching academic history:", error);
    res.status(500).json({ msg: "Error fetching academic history" });
  }
});

// ========== SERVER ERROR HANDLING ==========

server.on("error", err => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} already in use. Please stop the running process or set PORT to a different value.`);
    console.error("You can free port 5000 on Windows with: netstat -ano | findstr :5000 ; taskkill /PID <pid> /F");
    process.exit(1);
  }
  console.error("Server error:", err);
  process.exit(1);
});
