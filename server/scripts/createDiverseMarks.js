const mongoose = require('mongoose');
const User = require('../models/User');
const Marks = require('../models/Marks');
const StudentTeacherAssignment = require('../models/StudentTeacherAssignment');

// Tamil student names for Elango's class
const tamilStudentNames = [
  'Karthikeyan',
  'Priyanka',
  'Sathish',
  'Deepika',
  'Ramesh',
  'Lakshmi',
  'Vijay',
  'Anandhi',
  'Mani',
  'Kavitha',
  'Suresh',
  'Meena',
  'Shankar',
  'Revathi',
  'Arul',
  'Divya',
  'Mohan',
  'Sangeetha',
  'Kumar',
  'Sowmiya'
];

// Email domains for students
const emailDomains = ['@gmail.com', '@yahoo.com', '@outlook.com', '@hotmail.com'];

// Generate email from Tamil name
const generateEmail = (name) => {
  const cleanName = name.toLowerCase().replace(/\s+/g, '');
  const domain = emailDomains[Math.floor(Math.random() * emailDomains.length)];
  return `${cleanName}${Math.floor(Math.random() * 100)}${domain}`;
};

// Create students with Tamil names
const createTamilStudents = async () => {
  console.log('👥 Creating Tamil students for teacher Elango...');
  
  const students = [];
  
  for (let i = 0; i < tamilStudentNames.length; i++) {
    const name = tamilStudentNames[i];
    const email = generateEmail(name);
    
    const student = {
      name: name,
      email: email,
      password: 'password123',
      role: 'student',
      department: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'][Math.floor(Math.random() * 4)],
      semester: Math.floor(Math.random() * 8) + 1,
      rollNumber: `CS${String(i + 1).padStart(3, '0')}`,
      profilePic: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    students.push(student);
  }
  
  // Insert students
  const createdStudents = await User.insertMany(students);
  console.log(`✅ Created ${createdStudents.length} Tamil students`);
  
  // Assign to teacher Elango
  const assignments = createdStudents.map(student => ({
    teacherEmail: 'elango@teacher.com',
    studentEmail: student.email,
    department: student.department,
    assignedDate: new Date(),
    isActive: true
  }));
  
  await StudentTeacherAssignment.insertMany(assignments);
  console.log(`✅ Assigned all students to teacher Elango`);
  
  return createdStudents;
};

// Generate unique performance profile for each student
const generateUniquePerformanceProfile = (studentName, studentIndex) => {
  // Use student index to ensure unique profiles
  const profileTypes = [
    { name: 'Top Performer', base: 88, variance: 8, subjects: { math: 5, physics: 3, programming: 7, theory: 4 } },
    { name: 'Good Student', base: 78, variance: 10, subjects: { math: 3, physics: 5, programming: 6, theory: 5 } },
    { name: 'Average Student', base: 68, variance: 12, subjects: { math: 2, physics: 4, programming: 5, theory: 6 } },
    { name: 'Struggling Student', base: 52, variance: 15, subjects: { math: -3, physics: 2, programming: 3, theory: 4 } },
    { name: 'Mathematical Genius', base: 92, variance: 6, subjects: { math: 8, physics: 5, programming: 4, theory: 3 } },
    { name: 'Programming Expert', base: 85, variance: 7, subjects: { math: 3, physics: 2, programming: 9, theory: 4 } },
    { name: 'Theory Strong', base: 80, variance: 8, subjects: { math: 4, physics: 6, programming: 3, theory: 8 } },
    { name: 'All Rounder', base: 75, variance: 5, subjects: { math: 4, physics: 4, programming: 4, theory: 4 } },
    { name: 'Creative Thinker', base: 70, variance: 10, subjects: { math: 1, physics: 3, programming: 6, theory: 7 } },
    { name: 'Hard Worker', base: 82, variance: 6, subjects: { math: 4, physics: 4, programming: 5, theory: 5 } }
  ];
  
  // Rotate through profiles based on student index
  const profileIndex = studentIndex % profileTypes.length;
  return profileTypes[profileIndex];
};

// Subject categories with specific characteristics
const subjectCategories = {
  'Mathematical': {
    subjects: ['Mathematics', 'Statistics', 'Discrete Mathematics', 'Linear Algebra'],
    difficulty: 'High',
    baseMultiplier: 1.0
  },
  'Scientific': {
    subjects: ['Physics', 'Chemistry', 'Biology', 'Environmental Science'],
    difficulty: 'High', 
    baseMultiplier: 1.0
  },
  'Programming': {
    subjects: ['Data Structures', 'Algorithms', 'Web Development', 'Mobile App Development'],
    difficulty: 'Medium',
    baseMultiplier: 1.1
  },
  'Systems': {
    subjects: ['Operating Systems', 'Computer Networks', 'Database Management', 'Cloud Computing'],
    difficulty: 'Medium',
    baseMultiplier: 1.05
  },
  'Applied': {
    subjects: ['Software Engineering', 'Artificial Intelligence', 'Machine Learning', 'Cybersecurity'],
    difficulty: 'High',
    baseMultiplier: 0.95
  },
  'Electives': {
    subjects: ['Digital Electronics', 'Communication Skills', 'Project Management', 'Ethics in Technology'],
    difficulty: 'Low',
    baseMultiplier: 1.15
  }
};

const examTypes = [
  'Internal Assessment 1',
  'Internal Assessment 2', 
  'Mid-term Examination',
  'Final Examination',
  'Quiz',
  'Practical Examination',
  'Project Work',
  'Assignment',
  'Lab Test',
  'Viva Voce'
];

// Generate highly varied marks for each student
const generateVariedMarks = (studentId, studentName, studentIndex) => {
  const marks = [];
  const profile = generateUniquePerformanceProfile(studentName, studentIndex);
  
  console.log(`📝 Generating marks for ${studentName} (${profile.name})`);
  
  // Generate marks for each subject category
  Object.entries(subjectCategories).forEach(([category, categoryInfo]) => {
    categoryInfo.subjects.forEach(subject => {
      // Generate 2-4 marks per subject with high variation
      const numMarks = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < numMarks; i++) {
        const examType = examTypes[Math.floor(Math.random() * examTypes.length)];
        
        // Calculate base marks with student's subject strength
        let baseMarks = profile.base;
        
        // Apply subject-specific modifier
        if (subject.includes('Math') || subject.includes('Statistics')) {
          baseMarks += profile.subjects.math * 3;
        } else if (subject.includes('Physics') || subject.includes('Chemistry')) {
          baseMarks += profile.subjects.physics * 3;
        } else if (subject.includes('Programming') || subject.includes('Development')) {
          baseMarks += profile.subjects.programming * 3;
        } else {
          baseMarks += profile.subjects.theory * 3;
        }
        
        // Apply category multiplier
        baseMarks *= categoryInfo.baseMultiplier;
        
        // Add random variance
        let marksValue = baseMarks + (Math.random() - 0.5) * profile.variance * 2;
        
        // Exam type modifiers
        if (examType.includes('Final')) {
          marksValue -= 3; // Slightly lower in finals
        } else if (examType.includes('Internal')) {
          marksValue += 2; // Better in internal
        } else if (examType.includes('Project') || examType.includes('Practical')) {
          marksValue += 4; // Better in practical work
        } else if (examType.includes('Quiz')) {
          marksValue -= 1; // Slightly lower in quizzes
        }
        
        // Ensure within bounds
        marksValue = Math.max(15, Math.min(100, Math.round(marksValue)));
        
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
          difficulty: categoryInfo.difficulty,
          profileType: profile.name,
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

// Main function to create diverse marks data
const createDiverseMarksData = async () => {
  try {
    console.log('🚀 Creating diverse marks data with Tamil students...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-monitor');
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({ role: 'student' });
    await Marks.deleteMany({});
    await StudentTeacherAssignment.deleteMany({});
    
    // Create Tamil students
    const students = await createTamilStudents();
    
    let totalMarksAdded = 0;
    const performanceStats = {};
    
    // Generate unique marks for each student
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const studentMarks = generateVariedMarks(student._id, student.name, i);
      
      // Calculate student statistics
      const avgMarks = studentMarks.reduce((sum, mark) => sum + mark.marks, 0) / studentMarks.length;
      const profile = generateUniquePerformanceProfile(student.name, i);
      
      if (!performanceStats[profile.name]) {
        performanceStats[profile.name] = 0;
      }
      performanceStats[profile.name]++;
      
      // Insert marks
      await Marks.insertMany(studentMarks);
      totalMarksAdded += studentMarks.length;
      
      console.log(`✅ ${student.name}: ${studentMarks.length} marks, Avg: ${avgMarks.toFixed(1)}% (${profile.name})`);
    }
    
    // Display comprehensive statistics
    console.log('\n🎉 Successfully created diverse marks data!');
    console.log('📊 STATISTICS:');
    console.log(`   Total Students: ${students.length}`);
    console.log(`   Total Marks Added: ${totalMarksAdded}`);
    console.log(`   Average per Student: ${(totalMarksAdded / students.length).toFixed(2)}`);
    
    console.log('\n👥 STUDENT PROFILES:');
    Object.entries(performanceStats).forEach(([profile, count]) => {
      console.log(`   ${profile}: ${count} students`);
    });
    
    // Show sample data for each student
    console.log('\n📋 SAMPLE MARKS BY STUDENT:');
    for (let i = 0; i < Math.min(5, students.length); i++) {
      const student = students[i];
      const studentMarks = await Marks.find({ studentId: student._id }).limit(3);
      
      console.log(`\n📚 ${student.name}:`);
      studentMarks.forEach((markItem, index) => {
        console.log(`   ${index + 1}. ${markItem.subject} (${markItem.examType}): ${markItem.marks}% (${markItem.grade})`);
      });
      
      const avg = studentMarks.reduce((sum, m) => sum + m.marks, 0) / studentMarks.length;
      const profile = generateUniquePerformanceProfile(student.name, i);
      console.log(`   Average: ${avg.toFixed(1)}% | Profile: ${profile.name}`);
    }
    
  } catch (error) {
    console.error('❌ Error creating diverse marks data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
    console.log('✨ Diverse marks data creation completed!');
  }
};

// Run the function
createDiverseMarksData();

module.exports = createDiverseMarksData;
