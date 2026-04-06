


const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'teacher', 'student'],
    default: 'student'
  },
  plainPassword: {
    type: String,
    required: false,
    select: false // hidden by default from queries
  },
  classTeacherEmail: {
    type: String,
    lowercase: true,
    trim: true,
    default: ''
  },
  department: {
    type: String,
    trim: true
  },
  rollNumber: {
    type: String,
    trim: true
  },
  semester: {
    type: String,
    trim: true
  },
  profilePic: { type: String },
  studyTime: [{ date: { type: Date, default: Date.now }, hours: Number }],
  goals: {
    targetGpa: { type: Number, default: 9.0 },
    targetAttendance: { type: Number, default: 95 }
  },
  notes: [{ text: String, date: { type: Date, default: Date.now } }],
  badges: [String],
  focusSubjects: [{ subject: String, reason: String, date: { type: Date, default: Date.now } }],
  pinnedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model("User", userSchema);
