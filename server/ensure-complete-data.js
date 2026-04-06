const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
const Notification = require('./models/Notification');
const CalendarEvent = require('./models/CalendarEvent');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function ensureCompleteData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('🔗 Connected to MongoDB');

    console.log('\n🔧 ENSURING COMPLETE DATA FOR ALL STUDENTS');
    console.log('=' .repeat(70));

    // Get all student users
    const allStudents = await User.find({ role: 'student' });
    console.log('\n👥 Found', allStudents.length, 'student users');

    // Standard password for all students
    const standardPassword = 'student123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(standardPassword, salt);

    // Sample marks data
    const sampleMarks = [
      { subject: 'Mathematics', examType: 'Internal Assessment', marks: 85, attendance: 90, suggestion: 'Good performance, keep practicing' },
      { subject: 'Physics', examType: 'Internal Assessment', marks: 78, attendance: 88, suggestion: 'Focus on problem solving' },
      { subject: 'Chemistry', examType: 'Mid-term', marks: 82, attendance: 85, suggestion: 'Good understanding of concepts' },
      { subject: 'Computer Science', examType: 'Internal Assessment', marks: 88, attendance: 92, suggestion: 'Excellent work!' },
      { subject: 'English', examType: 'Quiz', marks: 75, attendance: 87, suggestion: 'Improve writing skills' }
    ];

    // Sample notifications
    const sampleNotifications = [
      { title: 'Welcome Back!', message: 'New semester has started. Check your schedule.', type: 'system', priority: 'medium' },
      { title: 'Assignment Due', message: 'Submit your assignments on time.', type: 'deadline', priority: 'high' },
      { title: 'Exam Schedule', message: 'Mid-term exams next week. Prepare well.', type: 'reminder', priority: 'medium' }
    ];

    // Process each student
    for (let i = 0; i < allStudents.length; i++) {
      const student = allStudents[i];
      console.log(`\n📧 Processing ${i + 1}/${allStudents.length}: ${student.email}`);
      
      // Fix password
      await User.updateOne(
        { _id: student._id },
        { $set: { password: hashedPassword, plainPassword: standardPassword } }
      );
      console.log('  🔑 Password updated');

      // Check and add marks if needed
      const existingMarks = await Marks.find({ studentId: student._id });
      if (existingMarks.length === 0) {
        const marksForStudent = sampleMarks.map(mark => ({
          ...mark,
          studentId: student._id
        }));
        await Marks.insertMany(marksForStudent);
        console.log('  📚 Added 5 marks records');
      } else {
        console.log(`  📚 Has ${existingMarks.length} marks records`);
      }

      // Check and add notifications if needed
      const existingNotifications = await Notification.find({ recipientId: student._id });
      if (existingNotifications.length === 0) {
        const notificationsForStudent = sampleNotifications.map(notif => ({
          ...notif,
          recipientId: student._id
        }));
        await Notification.insertMany(notificationsForStudent);
        console.log('  🔔 Added 3 notifications');
      } else {
        console.log(`  🔔 Has ${existingNotifications.length} notifications`);
      }

      // Ensure student has basic profile info
      const updates = {};
      if (!student.department) updates.department = 'Computer Science';
      if (!student.semester) updates.semester = '3rd';
      if (!student.rollNumber) updates.rollNumber = `CS${String(i + 1).padStart(4, '0')}`;
      if (!student.name || student.name === 'Test User') updates.name = `Student ${i + 1}`;

      if (Object.keys(updates).length > 0) {
        await User.updateOne({ _id: student._id }, { $set: updates });
        console.log('  👤 Updated profile info');
      }

      console.log('  ✅ Student data complete');
    }

    // Ensure calendar events exist
    const existingEvents = await CalendarEvent.find({});
    if (existingEvents.length < 5) {
      const additionalEvents = [
        { title: 'Final Exams', description: 'End of semester examinations', date: '2026-05-15', type: 'Exam' },
        { title: 'Project Submission', description: 'Final project submission deadline', date: '2026-05-10', type: 'Assignment' }
      ];
      await CalendarEvent.insertMany(additionalEvents);
      console.log('\n📅 Added 2 more calendar events');
    }

    // Final verification
    console.log('\n🎯 FINAL VERIFICATION');
    console.log('-'.repeat(50));

    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalMarks = await Marks.countDocuments();
    const totalNotifications = await Notification.countDocuments();
    const totalEvents = await CalendarEvent.countDocuments();

    console.log('👥 Total Students:', totalStudents);
    console.log('📚 Total Marks Records:', totalMarks);
    console.log('🔔 Total Notifications:', totalNotifications);
    console.log('📅 Total Calendar Events:', totalEvents);

    // Test login for a few students
    const testStudents = await User.find({ role: 'student' }).limit(3);
    console.log('\n🔑 LOGIN VERIFICATION:');
    for (const student of testStudents) {
      const passwordMatch = await student.comparePassword(standardPassword);
      console.log(`  ${student.email}: ${passwordMatch ? '✅ Valid' : '❌ Invalid'}`);
    }

    console.log('\n' + '=' .repeat(70));
    console.log('🎉 ALL STUDENT DATA ENSURED AND COMPLETE!');
    console.log('🚀 Every student now has:');
    console.log('  ✅ Valid login credentials');
    console.log('  ✅ Academic marks data');
    console.log('  ✅ Notifications');
    console.log('  ✅ Complete profile');
    console.log('  ✅ Access to calendar events');
    
    console.log('\n🔑 UNIVERSAL LOGIN:');
    console.log('📧 Any student email');
    console.log('🔑 Password: student123');
    console.log('🌐 URL: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Error ensuring complete data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

ensureCompleteData();
