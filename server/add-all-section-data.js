const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
const Notification = require('./models/Notification');
const CalendarEvent = require('./models/CalendarEvent');
require('dotenv').config();

async function addAllSectionData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('🔗 Connected to MongoDB');

    console.log('\n🎯 ADDING DATA FOR ALL MENU SECTIONS');
    console.log('=' .repeat(80));

    // Get all students
    const allStudents = await User.find({ role: 'student' });
    console.log('\n👥 Processing', allStudents.length, 'students for all sections');

    // Comprehensive data for each section
    for (let i = 0; i < allStudents.length; i++) {
      const student = allStudents[i];
      console.log(`\n📧 Processing ${i + 1}/${allStudents.length}: ${student.email}`);
      
      // 1. DASHBOARD DATA - Enhanced marks and performance
      const dashboardMarks = [
        { subject: 'Mathematics', examType: 'Internal Assessment', marks: 88, attendance: 94, suggestion: 'Excellent performance, maintain consistency' },
        { subject: 'Physics', examType: 'Internal Assessment', marks: 82, attendance: 91, suggestion: 'Good understanding, practice more numerical problems' },
        { subject: 'Chemistry', examType: 'Mid-term', marks: 85, attendance: 89, suggestion: 'Strong concepts, focus on organic chemistry' },
        { subject: 'Data Structures', examType: 'Internal Assessment', marks: 92, attendance: 96, suggestion: 'Outstanding performance, explore advanced topics' },
        { subject: 'Database Management', examType: 'Internal Assessment', marks: 87, attendance: 93, suggestion: 'Good SQL skills, work on optimization techniques' },
        { subject: 'Computer Networks', examType: 'Quiz', marks: 79, attendance: 88, suggestion: 'Review networking protocols thoroughly' },
        { subject: 'Operating Systems', examType: 'Mid-term', marks: 84, attendance: 90, suggestion: 'Good understanding of concepts, practice more' },
        { subject: 'Software Engineering', examType: 'Internal Assessment', marks: 90, attendance: 95, suggestion: 'Excellent grasp of software development principles' },
        { subject: 'Web Development', examType: 'Project', marks: 86, attendance: 92, suggestion: 'Good practical skills, learn modern frameworks' },
        { subject: 'Artificial Intelligence', examType: 'Internal Assessment', marks: 83, attendance: 87, suggestion: 'Good foundation, explore machine learning algorithms' }
      ];

      // Clear existing marks and add comprehensive data
      await Marks.deleteMany({ studentId: student._id });
      const marksForStudent = dashboardMarks.map(mark => ({
        ...mark,
        studentId: student._id
      }));
      await Marks.insertMany(marksForStudent);
      console.log('  📊 Dashboard: Added 10 comprehensive marks records');

      // 2. MARKS SECTION - Detailed marks with different exam types
      const detailedMarks = [
        { subject: 'Mathematics', examType: 'Internal Assessment 1', marks: 85, attendance: 94, suggestion: 'Good start' },
        { subject: 'Mathematics', examType: 'Internal Assessment 2', marks: 88, attendance: 94, suggestion: 'Improvement seen' },
        { subject: 'Mathematics', examType: 'Mid-term', marks: 82, attendance: 94, suggestion: 'Needs focus on calculus' },
        { subject: 'Mathematics', examType: 'Final', marks: 90, attendance: 94, suggestion: 'Excellent final performance' },
        { subject: 'Physics', examType: 'Internal Assessment 1', marks: 78, attendance: 91, suggestion: 'Work on mechanics' },
        { subject: 'Physics', examType: 'Internal Assessment 2', marks: 84, attendance: 91, suggestion: 'Better performance' },
        { subject: 'Physics', examType: 'Mid-term', marks: 80, attendance: 91, suggestion: 'Consistent performance' },
        { subject: 'Physics', examType: 'Final', marks: 86, attendance: 91, suggestion: 'Good improvement' }
      ];

      const detailedMarksForStudent = detailedMarks.map(mark => ({
        ...mark,
        studentId: student._id
      }));
      await Marks.insertMany(detailedMarksForStudent);
      console.log('  📈 Marks: Added 8 detailed marks records with multiple exam types');

      // 3. ATTENDANCE SECTION - Detailed attendance data
      const attendanceData = [
        { subject: 'Mathematics', examType: 'Monthly Attendance', marks: 94, attendance: 94, suggestion: 'Excellent attendance' },
        { subject: 'Physics', examType: 'Monthly Attendance', marks: 85, attendance: 91, suggestion: 'Good attendance record' },
        { subject: 'Chemistry', examType: 'Monthly Attendance', marks: 80, attendance: 89, suggestion: 'Maintain consistency' },
        { subject: 'Data Structures', examType: 'Monthly Attendance', marks: 92, attendance: 96, suggestion: 'Perfect attendance' },
        { subject: 'Database Management', examType: 'Monthly Attendance', marks: 87, attendance: 93, suggestion: 'Very good attendance' }
      ];

      const attendanceForStudent = attendanceData.map(mark => ({
        ...mark,
        studentId: student._id
      }));
      await Marks.insertMany(attendanceForStudent);
      console.log('  📊 Attendance: Added 5 attendance records');

      // 4. GOAL TRACKER SECTION - Goals data (stored in user profile)
      const goalsData = {
        targetGpa: 8.5,
        targetAttendance: 95,
        currentGpa: 7.8,
        currentAttendance: 92
      };

      await User.updateOne(
        { _id: student._id },
        { 
          $set: { 
            goals: goalsData,
            focusSubjects: [
              { subject: 'Mathematics', reason: 'Core subject for engineering', date: new Date() },
              { subject: 'Data Structures', reason: 'Essential for programming', date: new Date() },
              { subject: 'Database Management', reason: 'Important for software development', date: new Date() }
            ],
            badges: ['Top Performer', 'Regular Attendee', 'Goal Achiever'],
            notes: [
              { text: 'Focus on problem solving skills', date: new Date() },
              { text: 'Improve time management', date: new Date() },
              { text: 'Practice more coding problems', date: new Date() }
            ]
          }
        }
      );
      console.log('  🎯 Goal Tracker: Added goals, focus subjects, badges, and notes');

      // 5. DAILY STUDY TRACKER SECTION - Study sessions
      const studySessions = [
        { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), hours: 3 },
        { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), hours: 2.5 },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), hours: 4 },
        { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), hours: 2 },
        { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), hours: 3.5 },
        { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), hours: 5 },
        { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), hours: 3 },
        { date: new Date(), hours: 2.5 }
      ];

      await User.updateOne(
        { _id: student._id },
        { $set: { studyTime: studySessions } }
      );
      console.log('  📚 Daily Study Tracker: Added 8 study sessions');

      // 6. PERFORMANCE PREDICTION SECTION - Prediction data
      const predictionData = {
        predictedGpa: 8.2,
        confidence: 85,
        factors: {
          currentPerformance: 88,
          attendanceRate: 92,
          studyHours: 25.5,
          improvementTrend: 5
        },
        recommendations: [
          'Focus on Mathematics and Physics',
          'Maintain current attendance rate',
          'Increase study hours by 2-3 hours per week',
          'Practice more problem-solving exercises'
        ],
        riskLevel: 'Low',
        nextSemesterPrediction: 'Good performance expected'
      };

      await User.updateOne(
        { _id: student._id },
        { $set: { prediction: predictionData } }
      );
      console.log('  📈 Performance Prediction: Added comprehensive prediction data');

      // 7. PROFILE SECTION - Enhanced profile data
      const profileData = {
        profilePic: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=3b82f6&color=fff`,
        interests: ['Programming', 'Mathematics', 'Problem Solving', 'Technology'],
        skills: ['JavaScript', 'Python', 'SQL', 'Data Structures', 'Web Development'],
        achievements: [
          { title: 'Academic Excellence', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), description: 'Achieved 85%+ in all subjects' },
          { title: 'Perfect Attendance', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), description: '100% attendance for 3 months' },
          { title: 'Project Completion', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), description: 'Successfully completed database project' }
        ],
        socialLinks: {
          github: `https://github.com/${student.name.replace(/\s+/g, '').toLowerCase()}`,
          linkedin: `https://linkedin.com/in/${student.name.replace(/\s+/g, '').toLowerCase()}`,
          email: student.email
        }
      };

      await User.updateOne(
        { _id: student._id },
        { $set: profileData }
      );
      console.log('  👤 Profile: Enhanced with interests, skills, achievements, and social links');

      // 8. NOTIFICATIONS - Enhanced notifications for all sections
      const enhancedNotifications = [
        // Dashboard notifications
        { title: 'Dashboard Update', message: 'Your performance dashboard has been updated with latest marks.', type: 'system', priority: 'medium' },
        { title: 'Performance Alert', message: 'Great improvement in Mathematics! Keep up the good work.', type: 'achievement', priority: 'medium' },
        
        // Marks notifications
        { title: 'New Marks Posted', message: 'Your Internal Assessment 2 marks have been posted.', type: 'marks_updated', priority: 'high' },
        { title: 'Grade Improvement', message: 'Congratulations! Your Physics grade has improved.', type: 'achievement', priority: 'medium' },
        
        // Attendance notifications
        { title: 'Attendance Report', message: 'Your monthly attendance report is now available.', type: 'reminder', priority: 'low' },
        { title: 'Attendance Milestone', message: 'You have achieved 90%+ attendance this month!', type: 'achievement', priority: 'medium' },
        
        // Goal Tracker notifications
        { title: 'Goal Progress', message: 'You are 80% towards your GPA target. Keep going!', type: 'reminder', priority: 'medium' },
        { title: 'Goal Achievement', message: 'Monthly study goal achieved! Set new goals.', type: 'achievement', priority: 'high' },
        
        // Study Tracker notifications
        { title: 'Study Reminder', message: 'Don\'t forget to log your study session today.', type: 'reminder', priority: 'low' },
        { title: 'Study Streak', message: 'You have maintained a 7-day study streak!', type: 'achievement', priority: 'medium' },
        
        // Performance Prediction notifications
        { title: 'Prediction Update', message: 'Your performance prediction has been updated.', type: 'system', priority: 'medium' },
        { title: 'Performance Insight', message: 'Based on current trends, you are on track for excellence.', type: 'performance_alert', priority: 'medium' },
        
        // Profile notifications
        { title: 'Profile Complete', message: 'Your academic profile is now 100% complete.', type: 'achievement', priority: 'low' },
        { title: 'New Badge Earned', message: 'You have earned the "Top Performer" badge!', type: 'achievement', priority: 'high' }
      ];

      await Notification.deleteMany({ recipientId: student._id });
      const notificationsForStudent = enhancedNotifications.map(notif => ({
        ...notif,
        recipientId: student._id
      }));
      await Notification.insertMany(notificationsForStudent);
      console.log('  🔔 Notifications: Added 14 comprehensive notifications');

      console.log('  ✅ All sections data added successfully');
    }

    // 9. CALENDAR EVENTS - Enhanced events for all sections
    const enhancedEvents = [
      // Academic events
      { title: 'Mathematics Mid-term Exam', description: 'Comprehensive exam covering calculus and algebra', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: 'Exam' },
      { title: 'Physics Lab Session', description: 'Practical session on mechanics and thermodynamics', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: 'Assignment' },
      { title: 'Chemistry Project Submission', description: 'Submit your chemistry project with detailed report', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: 'Assignment' },
      { title: 'Data Structures Viva', description: 'Oral examination for data structures course', date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: 'Exam' },
      { title: 'Database Project Demo', description: 'Demonstrate your database project implementation', date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: 'Review' },
      
      // Workshop and events
      { title: 'Machine Learning Workshop', description: 'Hands-on workshop on ML algorithms and applications', date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: 'Notice' },
      { title: 'Career Guidance Session', description: 'Industry experts share career insights', date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: 'Notice' },
      { title: 'Study Skills Seminar', description: 'Learn effective study techniques and time management', date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: 'Notice' },
      
      // Holidays and breaks
      { title: 'Study Break', description: 'Mid-semester break for students', date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: 'Holiday' },
      { title: 'Festival Holiday', description: 'College closed for festival celebration', date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: 'Holiday' }
    ];

    await CalendarEvent.deleteMany({});
    await CalendarEvent.insertMany(enhancedEvents);
    console.log('\n📅 Calendar: Added 10 comprehensive events for all sections');

    // Final verification
    console.log('\n🎯 FINAL VERIFICATION');
    console.log('-'.repeat(50));
    
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalMarks = await Marks.countDocuments();
    const totalNotifications = await Notification.countDocuments();
    const totalEvents = await CalendarEvent.countDocuments();

    console.log('👥 Total Students:', totalStudents);
    console.log('📊 Total Marks Records:', totalMarks);
    console.log('🔔 Total Notifications:', totalNotifications);
    console.log('📅 Total Calendar Events:', totalEvents);

    console.log('\n✅ ALL SECTIONS DATA COMPLETED:');
    console.log('📊 Dashboard: Performance overview with charts');
    console.log('📈 Marks: Detailed marks with multiple exam types');
    console.log('📊 Attendance: Comprehensive attendance tracking');
    console.log('🎯 Goal Tracker: Goals, focus subjects, badges, notes');
    console.log('📚 Daily Study Tracker: Study sessions and time tracking');
    console.log('📈 Performance Prediction: AI-powered predictions');
    console.log('👤 Profile: Complete academic profile with achievements');
    console.log('📄 Download Report: All data available for reports');
    console.log('💬 Chat with Teacher: Ready for communication');
    console.log('📅 Calendar: Academic events and schedules');

    console.log('\n🎉 ALL MENU SECTIONS NOW HAVE COMPLETE DATA!');
    console.log('🚀 Students can access and experience every feature');

  } catch (error) {
    console.error('❌ Error adding all section data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

addAllSectionData();
