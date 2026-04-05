


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true
  },
  department: { type: String, default: "Computer Science" },
  semester: { type: String, default: "4" },
  rollNumber: { type: String },
  profilePic: { type: String },
  studyTime: [{ date: { type: Date, default: Date.now }, hours: Number }],
  goals: {
    targetGpa: { type: Number, default: 9.0 },
    targetAttendance: { type: Number, default: 95 }
  },
  notes: [{ text: String, date: { type: Date, default: Date.now } }],
  badges: [String],
  focusSubjects: [{ subject: String, reason: String, date: { type: Date, default: Date.now } }],
  pinnedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

module.exports = mongoose.model("User", userSchema);
