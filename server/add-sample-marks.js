const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
const Role = require('./models/Role');
require('dotenv').config();

async function addSampleMarks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');

    // Find the student user
    const studentRole = await Role.findOne({ name: 'student' });
    const student = await User.findOne({ email: 'student@gmail.com', role: studentRole._id });
    
    if (!student) {
      console.log('Student user not found');
      process.exit(0);
    }

    console.log('Found student:', student.name);

    // Check if marks already exist
    const existingMarks = await Marks.find({ studentId: student._id });
    console.log('Existing marks count:', existingMarks.length);

    // Add sample marks if less than 2
    if (existingMarks.length < 2) {
      // Clear existing marks to start fresh
      await Marks.deleteMany({ studentId: student._id });
      console.log('Cleared existing marks');

      // Add sample marks for different subjects
      const sampleMarks = [
        {
          studentId: student._id,
          subject: 'Mathematics',
          examType: 'Internal',
          marks: 85,
          attendance: 95,
          suggestion: 'Good performance, keep practicing'
        },
        {
          studentId: student._id,
          subject: 'Physics',
          examType: 'Internal', 
          marks: 78,
          attendance: 92,
          suggestion: 'Focus on problem solving'
        },
        {
          studentId: student._id,
          subject: 'Chemistry',
          examType: 'Mid-term',
          marks: 82,
          attendance: 88,
          suggestion: 'Good understanding of concepts'
        }
      ];

      await Marks.insertMany(sampleMarks);
      console.log('✅ Added 3 sample marks for student');
    } else {
      console.log('Student already has sufficient marks for prediction');
    }

    // Display all marks
    const allMarks = await Marks.find({ studentId: student._id });
    console.log('\n📊 Student Marks:');
    allMarks.forEach((mark, index) => {
      console.log(`${index + 1}. ${mark.subject}: ${mark.marks}% (Attendance: ${mark.attendance}%)`);
    });

  } catch (error) {
    console.error('Error adding sample marks:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

addSampleMarks();
