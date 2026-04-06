const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
const Notification = require('./models/Notification');
const CalendarEvent = require('./models/CalendarEvent');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function addNewStudent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('🔗 Connected to MongoDB');

    // Generate a unique email with timestamp to avoid conflicts
    const timestamp = new Date().getTime();
    const email = `student${timestamp}@gmail.com`;
    const password = 'student123';
    const rollNumber = `CS${timestamp.toString().slice(-6)}`;

    console.log(`📧 Creating new student: ${email}`);

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new student user
    const newStudent = new User({
      name: 'New Student',
      email: email,
      password: hashedPassword,
      plainPassword: password,
      role: 'student',
      department: 'Computer Science',
      rollNumber: rollNumber,
      semester: '3rd',
      isActive: true
    });

    await newStudent.save();
    console.log('✅ New student created successfully!');

    // Add sample marks for the new student
    const sampleMarks = [
      {
        studentId: newStudent._id,
        subject: 'Mathematics',
        examType: 'Internal Assessment',
        marks: 88,
        attendance: 94,
        suggestion: 'Excellent performance, maintain consistency'
      },
      {
        studentId: newStudent._id,
        subject: 'Physics',
        examType: 'Internal Assessment',
        marks: 82,
        attendance: 91,
        suggestion: 'Good understanding, practice more numerical problems'
      },
      {
        studentId: newStudent._id,
        subject: 'Chemistry',
        examType: 'Mid-term',
        marks: 85,
        attendance: 89,
        suggestion: 'Strong concepts, focus on organic chemistry'
      },
      {
        studentId: newStudent._id,
        subject: 'Data Structures',
        examType: 'Internal Assessment',
        marks: 92,
        attendance: 96,
        suggestion: 'Outstanding performance, explore advanced topics'
      },
      {
        studentId: newStudent._id,
        subject: 'Database Management',
        examType: 'Internal Assessment',
        marks: 87,
        attendance: 93,
        suggestion: 'Good SQL skills, work on optimization techniques'
      },
      {
        studentId: newStudent._id,
        subject: 'Computer Networks',
        examType: 'Quiz',
        marks: 79,
        attendance: 88,
        suggestion: 'Review networking protocols thoroughly'
      },
      {
        studentId: newStudent._id,
        subject: 'Operating Systems',
        examType: 'Mid-term',
        marks: 84,
        attendance: 90,
        suggestion: 'Good understanding of concepts, practice more'
      },
      {
        studentId: newStudent._id,
        subject: 'Software Engineering',
        examType: 'Internal Assessment',
        marks: 90,
        attendance: 95,
        suggestion: 'Excellent grasp of software development principles'
      }
    ];

    await Marks.insertMany(sampleMarks);
    console.log('✅ Added 8 sample marks');

    // Add sample notifications
    const sampleNotifications = [
      {
        recipientId: newStudent._id,
        title: 'Welcome to Academic Monitor',
        message: 'Your student account has been created successfully. Explore all features!',
        type: 'system',
        priority: 'medium'
      },
      {
        recipientId: newStudent._id,
        title: 'Assignment Due Soon',
        message: 'Data Structures assignment is due next week. Start working on it early.',
        type: 'deadline',
        priority: 'high'
      },
      {
        recipientId: newStudent._id,
        title: 'Performance Achievement',
        message: 'Great job! Your performance in Data Structures is outstanding.',
        type: 'achievement',
        priority: 'medium'
      },
      {
        recipientId: newStudent._id,
        title: 'Attendance Reminder',
        message: 'Maintain at least 75% attendance to avoid any academic issues.',
        type: 'reminder',
        priority: 'low'
      },
      {
        recipientId: newStudent._id,
        title: 'Exam Schedule Updated',
        message: 'Mid-term examination schedule has been posted. Check the calendar.',
        type: 'announcement',
        priority: 'medium'
      }
    ];

    await Notification.insertMany(sampleNotifications);
    console.log('✅ Added 5 sample notifications');

    // Add sample calendar events
    const sampleEvents = [
      {
        title: 'Data Structures Mid-term Exam',
        description: 'Comprehensive exam on data structures and algorithms',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'Exam'
      },
      {
        title: 'Database Lab Submission',
        description: 'Submit your database project with proper documentation',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'Assignment'
      },
      {
        title: 'Guest Lecture - AI/ML',
        description: 'Industry expert talk on Artificial Intelligence and Machine Learning',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'Notice'
      },
      {
        title: 'Technical Workshop',
        description: 'Hands-on workshop on cloud computing technologies',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'Notice'
      },
      {
        title: 'Project Review Meeting',
        description: 'Review meeting for software engineering project',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: 'Review'
      }
    ];

    await CalendarEvent.insertMany(sampleEvents);
    console.log('✅ Added 5 sample calendar events');

    // Verify the account setup
    const finalMarks = await Marks.find({ studentId: newStudent._id });
    const finalNotifications = await Notification.find({ recipientId: newStudent._id });
    const finalEvents = await CalendarEvent.find({});
    
    // Calculate performance metrics
    const avgMarks = finalMarks.reduce((sum, mark) => sum + mark.marks, 0) / finalMarks.length;
    const avgAttendance = finalMarks.reduce((sum, mark) => sum + mark.attendance, 0) / finalMarks.length;
    const excellentSubjects = finalMarks.filter(m => m.marks >= 85).length;
    const goodSubjects = finalMarks.filter(m => m.marks >= 70 && m.marks < 85).length;

    console.log('\n🎉 NEW STUDENT ACCOUNT CREATED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    
    console.log('\n👤 STUDENT DETAILS:');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Name:', newStudent.name);
    console.log('🎓 Role:', newStudent.role);
    console.log('📚 Department:', newStudent.department);
    console.log('🔢 Roll Number:', rollNumber);
    console.log('📖 Semester:', newStudent.semester);
    
    console.log('\n📊 ACADEMIC PERFORMANCE:');
    console.log('📚 Total Subjects:', finalMarks.length);
    console.log('📈 Average Marks:', avgMarks.toFixed(1) + '%');
    console.log('📊 Average Attendance:', avgAttendance.toFixed(1) + '%');
    console.log('🏆 Excellent (85%+):', excellentSubjects, 'subjects');
    console.log('👍 Good (70-84%):', goodSubjects, 'subjects');
    
    console.log('\n🔔 NOTIFICATIONS:');
    console.log('📬 Total Notifications:', finalNotifications.length);
    console.log('📖 Unread:', finalNotifications.filter(n => !n.isRead).length);
    
    console.log('\n📅 CALENDAR EVENTS:');
    console.log('📆 Total Events:', finalEvents.length);
    
    console.log('\n🌐 LOGIN INFORMATION:');
    console.log('🌐 URL: http://localhost:3000/login');
    console.log('📧 Username:', email);
    console.log('🔑 Password:', password);
    
    console.log('\n✨ FEATURES AVAILABLE:');
    console.log('  • Dashboard with performance analytics');
    console.log('  • Detailed marks and attendance tracking');
    console.log('  • Personalized notifications');
    console.log('  • Academic calendar and events');
    console.log('  • Goal setting and progress tracking');
    console.log('  • Performance predictions and insights');
    
    console.log('\n🚀 Student is ready for academic monitoring! 📚✨');

  } catch (error) {
    console.error('❌ Error creating new student:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

addNewStudent();
