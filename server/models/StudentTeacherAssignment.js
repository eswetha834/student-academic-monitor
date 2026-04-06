const mongoose = require('mongoose');

const studentTeacherAssignmentSchema = new mongoose.Schema({
  studentEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  teacherEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  department: {
    type: String,
    trim: true,
    default: ''
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  assignedBy: {
    type: String,
    required: true,
    trim: true,
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add text index for better search performance
studentTeacherAssignmentSchema.index({ 
  studentEmail: 'text', 
  teacherEmail: 'text', 
  department: 'text' 
});

module.exports = mongoose.model('StudentTeacherAssignment', studentTeacherAssignmentSchema);
