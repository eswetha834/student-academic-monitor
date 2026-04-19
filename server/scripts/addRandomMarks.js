const mongoose = require('mongoose');
const User = require('../models/User');
const Marks = require('../models/Marks');

// Sample subjects and exam types
const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Data Structures',
  'Database Management',
  'Computer Networks',
  'Operating Systems',
  'Software Engineering',
  'Web Development',
  'Artificial Intelligence'
];

const examTypes = [
  'Internal Assessment',
  'Mid-term',
  'Final',
  'Quiz',
  'Project',
  'Practical',
  'Internal Assessment 1',
  'Internal Assessment 2',
  'Monthly Test'
];

// Generate random marks for a student
const generateRandomMarks = (studentId, studentName) => {
  const marks = [];
  
  // Generate 3-5 marks per subject
  subjects.forEach(subject => {
    const numMarks = Math.floor(Math.random() * 3) + 3; // 3-5 marks per subject
    
    for (let i = 0; i < numMarks; i++) {
      const examType = examTypes[Math.floor(Math.random() * examTypes.length)];
      const marksValue = Math.floor(Math.random() * 45) + 55; // Random marks between 55-100
      
      marks.push({
        studentId: studentId,
        studentName: studentName,
        subject: subject,
        examType: examType,
        marks: marksValue,
        maxMarks: 100,
        grade: calculateGrade(marksValue),
        semester: Math.floor(Math.random() * 8) + 1, // Semester 1-8
        academicYear: '2023-2024',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  });
  
  return marks;
};

// Calculate grade from marks
const calculateGrade = (marks) => {
  if (marks >= 90) return 'A+';
  if (marks >= 85) return 'A';
  if (marks >= 80) return 'A-';
  if (marks >= 75) return 'B+';
  if (marks >= 70) return 'B';
  if (marks >= 65) return 'B-';
  if (marks >= 60) return 'C+';
  if (marks >= 55) return 'C';
  if (marks >= 50) return 'C-';
  if (marks >= 45) return 'D';
  return 'F';
};

// Main function to add marks for all students
const addMarksForAllStudents = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-monitor');
    
    console.log('Fetching all students...');
    const students = await User.find({ role: 'student' });
    
    if (students.length === 0) {
      console.log('No students found in database');
      return;
    }
    
    console.log(`Found ${students.length} students`);
    
    // Clear existing marks to avoid duplicates
    console.log('Clearing existing marks...');
    await Marks.deleteMany({});
    
    let totalMarksAdded = 0;
    
    // Generate and add marks for each student
    for (const student of students) {
      console.log(`Generating marks for student: ${student.name}`);
      
      const studentMarks = generateRandomMarks(student._id, student.name);
      
      // Insert marks in batches
      await Marks.insertMany(studentMarks);
      
      totalMarksAdded += studentMarks.length;
      console.log(`Added ${studentMarks.length} marks for ${student.name}`);
    }
    
    console.log('\n✅ Successfully added marks for all students!');
    console.log(`📊 Total students: ${students.length}`);
    console.log(`📝 Total marks added: ${totalMarksAdded}`);
    console.log(`📈 Average marks per student: ${(totalMarksAdded / students.length).toFixed(2)}`);
    
    // Display sample data
    console.log('\n📋 Sample marks data:');
    const sampleMarks = await Marks.find().limit(5);
    sampleMarks.forEach((mark, index) => {
      console.log(`${index + 1}. ${mark.studentName} - ${mark.subject} (${mark.examType}): ${mark.marks}% (${mark.grade})`);
    });
    
  } catch (error) {
    console.error('Error adding marks:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
};

// Run the function
addMarksForAllStudents();
