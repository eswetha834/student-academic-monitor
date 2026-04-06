// Create test faculty and student data for predictions
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Role = require('./models/Role');

async function createTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/academic_monitor');
    console.log('✅ Connected to MongoDB');

    // Check if roles exist
    let facultyRole = await Role.findOne({ name: 'faculty' });
    let studentRole = await Role.findOne({ name: 'student' });

    if (!facultyRole) {
      facultyRole = new Role({ 
        name: 'faculty', 
        displayName: 'Faculty',
        description: 'Teaching staff with access to student management and academic records',
        hierarchy: 1,
        settings: {
          canManageStudents: true,
          canViewAnalytics: true,
          canSendNotifications: true,
          canExportReports: true
        }
      });
      await facultyRole.save();
      console.log('✅ Created faculty role');
    }

    if (!studentRole) {
      studentRole = new Role({ 
        name: 'student', 
        displayName: 'Student',
        description: 'Students with access to their own academic records',
        hierarchy: 0,
        settings: {
          canViewAnalytics: true
        }
      });
      await studentRole.save();
      console.log('✅ Created student role');
    }

    // Create faculty user
    const facultyEmail = 'faculty@test.com';
    let faculty = await User.findOne({ email: facultyEmail });
    
    if (!faculty) {
      const hashedPassword = await bcrypt.hash('faculty123', 10);
      faculty = new User({
        name: 'Test Faculty',
        email: facultyEmail,
        password: hashedPassword,
        role: 'teacher',
        department: 'Computer Science',
        userIdString: 'faculty_001'
      });
      await faculty.save();
      console.log('✅ Created faculty user');
    }

    // Create test students
    const students = [
      { name: 'Alice Johnson', email: 'alice@test.com', currentGPA: 3.8 },
      { name: 'Bob Smith', email: 'bob@test.com', currentGPA: 2.9 },
      { name: 'Carol Williams', email: 'carol@test.com', currentGPA: 3.2 },
      { name: 'David Brown', email: 'david@test.com', currentGPA: 2.4 }
    ];

    for (const studentData of students) {
      let student = await User.findOne({ email: studentData.email });
      
      if (!student) {
        const hashedPassword = await bcrypt.hash('student123', 10);
        student = new User({
          name: studentData.name,
          email: studentData.email,
          password: hashedPassword,
          role: 'student',
          department: 'Computer Science',
          semester: '6th',
          classTeacherEmail: facultyEmail,
          classTeacher: faculty._id.toString(),
          userIdString: `student_${studentData.email.split('@')[0]}`
        });
        await student.save();
        console.log(`✅ Created student: ${studentData.name}`);
      }
    }

    console.log('\n🎯 Test data created successfully!');
    console.log('📱 Login as faculty: faculty@test.com / faculty123');
    console.log('📱 Login as student: alice@test.com / student123');
    console.log('\n🔮 Now you can test the prediction generation!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createTestData();
