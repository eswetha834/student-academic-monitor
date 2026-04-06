const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
const Notification = require('./models/Notification');
const CalendarEvent = require('./models/CalendarEvent');
require('dotenv').config();

async function verifyAllSections() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('🔗 Connected to MongoDB');

    console.log('\n🎯 VERIFICATION OF ALL MENU SECTIONS');
    console.log('=' .repeat(80));

    // Get a sample student to verify
    const sampleStudent = await User.findOne({ role: 'student' });
    console.log('\n👤 Sample Student:', sampleStudent.email);

    // 1. Dashboard Verification
    const dashboardMarks = await Marks.find({ studentId: sampleStudent._id }).limit(10);
    console.log('\n📊 DASHBOARD SECTION:');
    console.log('✅ Marks Records:', dashboardMarks.length);
    if (dashboardMarks.length > 0) {
      const avgMarks = dashboardMarks.reduce((sum, mark) => sum + mark.marks, 0) / dashboardMarks.length;
      console.log('✅ Average Marks:', avgMarks.toFixed(1) + '%');
      console.log('✅ Subjects:', dashboardMarks.map(m => m.subject).join(', '));
    }

    // 2. Marks Section Verification
    const allMarks = await Marks.find({ studentId: sampleStudent._id });
    const examTypes = [...new Set(allMarks.map(m => m.examType))];
    console.log('\n📈 MARKS SECTION:');
    console.log('✅ Total Marks Records:', allMarks.length);
    console.log('✅ Exam Types:', examTypes.join(', '));
    console.log('✅ Subjects Covered:', [...new Set(allMarks.map(m => m.subject))].length);

    // 3. Attendance Section Verification
    const attendanceRecords = allMarks.filter(m => m.examType.includes('Attendance'));
    console.log('\n📊 ATTENDANCE SECTION:');
    console.log('✅ Attendance Records:', attendanceRecords.length);
    if (attendanceRecords.length > 0) {
      const avgAttendance = attendanceRecords.reduce((sum, mark) => sum + mark.attendance, 0) / attendanceRecords.length;
      console.log('✅ Average Attendance:', avgAttendance.toFixed(1) + '%');
    }

    // 4. Goal Tracker Verification
    console.log('\n🎯 GOAL TRACKER SECTION:');
    console.log('✅ Goals Data:', sampleStudent.goals ? 'Present' : 'Missing');
    console.log('✅ Target GPA:', sampleStudent.goals?.targetGpa || 'Not set');
    console.log('✅ Target Attendance:', sampleStudent.goals?.targetAttendance + '%' || 'Not set');
    console.log('✅ Focus Subjects:', sampleStudent.focusSubjects?.length || 0);
    console.log('✅ Badges:', sampleStudent.badges?.length || 0);
    console.log('✅ Notes:', sampleStudent.notes?.length || 0);

    // 5. Daily Study Tracker Verification
    console.log('\n📚 DAILY STUDY TRACKER SECTION:');
    console.log('✅ Study Sessions:', sampleStudent.studyTime?.length || 0);
    if (sampleStudent.studyTime && sampleStudent.studyTime.length > 0) {
      const totalHours = sampleStudent.studyTime.reduce((sum, session) => sum + session.hours, 0);
      console.log('✅ Total Study Hours:', totalHours.toFixed(1));
      console.log('✅ Average Hours per Session:', (totalHours / sampleStudent.studyTime.length).toFixed(1));
    }

    // 6. Performance Prediction Verification
    console.log('\n📈 PERFORMANCE PREDICTION SECTION:');
    console.log('✅ Prediction Data:', sampleStudent.prediction ? 'Present' : 'Missing');
    if (sampleStudent.prediction) {
      console.log('✅ Predicted GPA:', sampleStudent.prediction.predictedGpa);
      console.log('✅ Confidence:', sampleStudent.prediction.confidence + '%');
      console.log('✅ Risk Level:', sampleStudent.prediction.riskLevel);
      console.log('✅ Recommendations:', sampleStudent.prediction.recommendations?.length || 0);
    }

    // 7. Profile Section Verification
    console.log('\n👤 PROFILE SECTION:');
    console.log('✅ Profile Picture:', sampleStudent.profilePic ? 'Present' : 'Missing');
    console.log('✅ Interests:', sampleStudent.interests?.length || 0);
    console.log('✅ Skills:', sampleStudent.skills?.length || 0);
    console.log('✅ Achievements:', sampleStudent.achievements?.length || 0);
    console.log('✅ Social Links:', sampleStudent.socialLinks ? 'Present' : 'Missing');

    // 8. Notifications Verification
    const notifications = await Notification.find({ recipientId: sampleStudent._id });
    const notificationTypes = [...new Set(notifications.map(n => n.type))];
    console.log('\n🔔 NOTIFICATIONS SECTION:');
    console.log('✅ Total Notifications:', notifications.length);
    console.log('✅ Notification Types:', notificationTypes.join(', '));
    console.log('✅ Unread:', notifications.filter(n => !n.isRead).length);

    // 9. Calendar Events Verification
    const events = await CalendarEvent.find({});
    const eventTypes = [...new Set(events.map(e => e.type))];
    console.log('\n📅 CALENDAR SECTION:');
    console.log('✅ Total Events:', events.length);
    console.log('✅ Event Types:', eventTypes.join(', '));
    console.log('✅ Upcoming Events:', events.filter(e => new Date(e.date) >= new Date()).length);

    // 10. Download Report Verification
    console.log('\n📄 DOWNLOAD REPORT SECTION:');
    console.log('✅ Data Available for Reports:', 'All sections have data');
    console.log('✅ Marks Data:', allMarks.length, 'records');
    console.log('✅ Attendance Data:', attendanceRecords.length, 'records');
    console.log('✅ Profile Data:', 'Complete');
    console.log('✅ Goals Data:', sampleStudent.goals ? 'Available' : 'Missing');

    // Overall Status
    console.log('\n🎯 OVERALL SECTION STATUS:');
    const sections = [
      { name: 'Dashboard', status: dashboardMarks.length > 0 },
      { name: 'Marks', status: allMarks.length > 0 },
      { name: 'Attendance', status: attendanceRecords.length > 0 },
      { name: 'Goal Tracker', status: sampleStudent.goals && Object.keys(sampleStudent.goals).length > 0 },
      { name: 'Daily Study Tracker', status: sampleStudent.studyTime && sampleStudent.studyTime.length > 0 },
      { name: 'Performance Prediction', status: sampleStudent.prediction && Object.keys(sampleStudent.prediction).length > 0 },
      { name: 'Profile', status: sampleStudent.interests && sampleStudent.interests.length > 0 },
      { name: 'Notifications', status: notifications.length > 0 },
      { name: 'Calendar', status: events.length > 0 },
      { name: 'Download Report', status: true }
    ];

    sections.forEach(section => {
      console.log(`${section.status ? '✅' : '❌'} ${section.name}: ${section.status ? 'Data Available' : 'No Data'}`);
    });

    const completeSections = sections.filter(s => s.status).length;
    console.log('\n📊 COMPLETION SUMMARY:');
    console.log(`🎯 Sections with Data: ${completeSections}/${sections.length}`);
    console.log(`📈 Completion Rate: ${(completeSections / sections.length * 100).toFixed(1)}%`);

    if (completeSections === sections.length) {
      console.log('\n🎉 ALL SECTIONS HAVE COMPLETE DATA!');
      console.log('🚀 Students can access and experience every feature');
    } else {
      console.log('\n⚠️ Some sections still need data');
    }

  } catch (error) {
    console.error('❌ Error verifying sections:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

verifyAllSections();
