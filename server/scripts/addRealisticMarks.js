const mongoose = require('mongoose');
const User = require('../models/User');
const Marks = require('../models/Marks');

// Subject categories with different difficulty levels
const subjectCategories = {
  'Core': [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Data Structures',
    'Algorithms'
  ],
  'Programming': [
    'Computer Networks',
    'Operating Systems',
    'Database Management',
    'Software Engineering',
    'Web Development'
  ],
  'Advanced': [
    'Artificial Intelligence',
    'Machine Learning',
    'Cloud Computing',
    'Cybersecurity',
    'Blockchain'
  ],
  'Electives': [
    'Digital Electronics',
    'Communication Skills',
    'Project Management',
    'Entrepreneurship',
    'Ethics in Technology'
  ]
};

const examTypes = [
  'Internal Assessment',
  'Internal Assessment 1',
  'Internal Assessment 2',
  'Mid-term',
  'Final',
  'Quiz',
  'Project',
  'Practical',
  'Monthly Test',
  'Assignment'
];

// Generate realistic performance profile for each student
const generateStudentProfile = (studentName) => {
  // Create different performance profiles
  const profiles = ['excellent', 'good', 'average', 'below_average', 'struggling'];
  const weights = [0.15, 0.25, 0.35, 0.15, 0.10]; // Distribution
  
  const random = Math.random();
  let cumulative = 0;
  let selectedProfile = 'average';
  
  for (let i = 0; i < profiles.length; i++) {
    cumulative += weights[i];
    if (random <= cumulative) {
      selectedProfile = profiles[i];
      break;
    }
  }
  
  // Base performance levels
  const profileLevels = {
    'excellent': { min: 85, max: 98, variance: 5 },
    'good': { min: 75, max: 89, variance: 8 },
    'average': { min: 60, max: 79, variance: 10 },
    'below_average': { min: 45, max: 69, variance: 12 },
    'struggling': { min: 30, max: 59, variance: 15 }
  };
  
  return profileLevels[selectedProfile];
};

// Generate marks for a student with realistic patterns
const generateRealisticMarks = (studentId, studentName) => {
  const marks = [];
  const profile = generateStudentProfile(studentName);
  
  // Student performs differently in different subject categories
  const categoryPerformance = {
    'Core': profile.min + (Math.random() * profile.variance),
    'Programming': profile.min + (Math.random() * profile.variance) + 5, // Better in programming
    'Advanced': profile.min + (Math.random() * profile.variance) - 3, // Slightly lower in advanced
    'Electives': profile.min + (Math.random() * profile.variance) + 2  // Better in electives
  };
  
  // Generate marks for each subject
  Object.entries(subjectCategories).forEach(([category, subjects]) => {
    subjects.forEach(subject => {
      // Generate 2-4 marks per subject
      const numMarks = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < numMarks; i++) {
        // Base performance with some variance
        let baseMarks = categoryPerformance[category];
        
        // Add some randomness and ensure within bounds
        let marksValue = baseMarks + (Math.random() - 0.5) * 10;
        marksValue = Math.max(profile.min, Math.min(profile.max, marksValue));
        marksValue = Math.round(marksValue);
        
        // Different exam types have different performance
        const examType = examTypes[Math.floor(Math.random() * examTypes.length)];
        let examModifier = 0;
        
        if (examType.includes('Final')) {
          examModifier = -2; // Slightly lower in finals
        } else if (examType.includes('Internal')) {
          examModifier = 3; // Better in internal assessments
        } else if (examType.includes('Project')) {
          examModifier = 5; // Best in projects
        }
        
        marksValue = Math.max(0, Math.min(100, marksValue + examModifier));
        
        marks.push({
          studentId: studentId,
          studentName: studentName,
          subject: subject,
          examType: examType,
          marks: marksValue,
          maxMarks: 100,
          grade: calculateGrade(marksValue),
          semester: Math.floor(Math.random() * 8) + 1,
          academicYear: '2023-2024',
          category: category,
          difficulty: category === 'Advanced' ? 'High' : category === 'Core' ? 'Medium' : 'Low',
          createdAt: generateRandomDate(),
          updatedAt: new Date()
        });
      }
    });
  });
  
  return marks;
};

// Calculate grade from marks
const calculateGrade = (marks) => {
  if (marks >= 95) return 'A+';
  if (marks >= 90) return 'A';
  if (marks >= 85) return 'A-';
  if (marks >= 80) return 'B+';
  if (marks >= 75) return 'B';
  if (marks >= 70) return 'B-';
  if (marks >= 65) return 'C+';
  if (marks >= 60) return 'C';
  if (marks >= 55) return 'C-';
  if (marks >= 50) return 'D';
  return 'F';
};

// Generate random date within the last 6 months
const generateRandomDate = () => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  return new Date(randomTime);
};

// Main function to add marks for all students
const addRealisticMarksForAllStudents = async () => {
  try {
    console.log('🚀 Starting to add realistic marks for all students...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-monitor');
    
    const students = await User.find({ role: 'student' });
    
    if (students.length === 0) {
      console.log('❌ No students found in database');
      return;
    }
    
    console.log(`📚 Found ${students.length} students`);
    
    // Clear existing marks
    console.log('🗑️  Clearing existing marks...');
    await Marks.deleteMany({});
    
    let totalMarksAdded = 0;
    const performanceStats = {
      excellent: 0,
      good: 0,
      average: 0,
      below_average: 0,
      struggling: 0
    };
    
    // Generate and add marks for each student
    for (const student of students) {
      console.log(`📝 Generating marks for: ${student.name}`);
      
      const studentMarks = generateRealisticMarks(student._id, student.name);
      
      // Calculate student's average to track performance distribution
      const avgMarks = studentMarks.reduce((sum, mark) => sum + mark.marks, 0) / studentMarks.length;
      
      if (avgMarks >= 85) performanceStats.excellent++;
      else if (avgMarks >= 75) performanceStats.good++;
      else if (avgMarks >= 60) performanceStats.average++;
      else if (avgMarks >= 45) performanceStats.below_average++;
      else performanceStats.struggling++;
      
      // Insert marks in batches
      await Marks.insertMany(studentMarks);
      totalMarksAdded += studentMarks.length;
      
      console.log(`✅ Added ${studentMarks.length} marks for ${student.name} (Avg: ${avgMarks.toFixed(1)}%)`);
    }
    
    // Display comprehensive statistics
    console.log('\n🎉 Successfully added realistic marks for all students!');
    console.log('📊 STATISTICS:');
    console.log(`   Total Students: ${students.length}`);
    console.log(`   Total Marks Added: ${totalMarksAdded}`);
    console.log(`   Average Marks per Student: ${(totalMarksAdded / students.length).toFixed(2)}`);
    console.log(`   Average per Subject: ${(totalMarksAdded / (students.length * Object.values(subjectCategories).flat().length)).toFixed(2)}`);
    
    console.log('\n📈 PERFORMANCE DISTRIBUTION:');
    console.log(`   Excellent Students: ${performanceStats.excellent} (${((performanceStats.excellent/students.length)*100).toFixed(1)}%)`);
    console.log(`   Good Students: ${performanceStats.good} (${((performanceStats.good/students.length)*100).toFixed(1)}%)`);
    console.log(`   Average Students: ${performanceStats.average} (${((performanceStats.average/students.length)*100).toFixed(1)}%)`);
    console.log(`   Below Average: ${performanceStats.below_average} (${((performanceStats.below_average/students.length)*100).toFixed(1)}%)`);
    console.log(`   Struggling: ${performanceStats.struggling} (${((performanceStats.struggling/students.length)*100).toFixed(1)}%)`);
    
    // Show sample data
    console.log('\n📋 SAMPLE MARKS:');
    const sampleMarks = await Marks.find().limit(10);
    sampleMarks.forEach((mark, index) => {
      console.log(`${index + 1}. ${mark.studentName} - ${mark.subject} (${mark.examType}): ${mark.marks}% (${mark.grade})`);
    });
    
    // Subject-wise statistics
    console.log('\n📚 SUBJECT-WISE AVERAGES:');
    const subjectStats = {};
    const allMarks = await Marks.find();
    
    allMarks.forEach(mark => {
      if (!subjectStats[mark.subject]) {
        subjectStats[mark.subject] = { total: 0, count: 0 };
      }
      subjectStats[mark.subject].total += mark.marks;
      subjectStats[mark.subject].count++;
    });
    
    Object.entries(subjectStats).forEach(([subject, stats]) => {
      const avg = stats.total / stats.count;
      console.log(`   ${subject}: ${avg.toFixed(1)}% (${stats.count} entries)`);
    });
    
  } catch (error) {
    console.error('❌ Error adding marks:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
};

// Run the function
addRealisticMarksForAllStudents();

module.exports = addRealisticMarksForAllStudents;
