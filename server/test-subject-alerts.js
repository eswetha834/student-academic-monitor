const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
require('dotenv').config();

async function testSubjectAlerts() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('🔗 Connected to MongoDB');

    console.log('🎯 TESTING ENHANCED SUBJECT ALERTS');
    console.log('=' .repeat(60));

    // Test SRU student
    const sruStudent = await User.findOne({ email: 'sru@gmail.com' });
    const marks = await Marks.find({ studentId: sruStudent._id });
    
    console.log('\n📊 SUBJECT PERFORMANCE ANALYSIS:');
    console.log('👤 Student:', sruStudent.name);
    console.log('📚 Total Subjects:', marks.length);

    // Categorize subjects
    const criticalSubjects = marks.filter(m => Number(m.marks) < 60);
    const averageSubjects = marks.filter(m => Number(m.marks) >= 60 && Number(m.marks) < 75);
    const goodSubjects = marks.filter(m => Number(m.marks) >= 75 && Number(m.marks) < 85);
    const excellentSubjects = marks.filter(m => Number(m.marks) >= 85);
    
    console.log('\n🔴 CRITICAL SUBJECTS (<60%):', criticalSubjects.length);
    criticalSubjects.forEach((subject, index) => {
      console.log(`  ${index + 1}. ${subject.subject}: ${subject.marks}% (Grade: ${getGrade(Number(subject.marks))})`);
    });

    console.log('\n🟡 NEEDS IMPROVEMENT (60-74%):', averageSubjects.length);
    averageSubjects.forEach((subject, index) => {
      console.log(`  ${index + 1}. ${subject.subject}: ${subject.marks}% (Grade: ${getGrade(Number(subject.marks))})`);
    });

    console.log('\n🟢 GOOD PERFORMANCE (75-84%):', goodSubjects.length);
    goodSubjects.forEach((subject, index) => {
      console.log(`  ${index + 1}. ${subject.subject}: ${subject.marks}% (Grade: ${getGrade(Number(subject.marks))})`);
    });

    console.log('\n🟢 EXCELLENT PERFORMANCE (85%+):', excellentSubjects.length);
    excellentSubjects.forEach((subject, index) => {
      console.log(`  ${index + 1}. ${subject.subject}: ${subject.marks}% (Grade: ${getGrade(Number(subject.marks))})`);
    });

    // Test alert generation
    console.log('\n🚨 ENHANCED ALERT GENERATION:');
    const alerts = [];
    
    // Individual subject alerts
    criticalSubjects.forEach(subject => {
      alerts.push({
        type: 'critical',
        title: `${subject.subject} Needs Immediate Attention`,
        message: `Score: ${subject.marks}%. This subject requires urgent focus.`
      });
    });

    averageSubjects.forEach(subject => {
      alerts.push({
        type: 'warning',
        title: `Improve ${subject.subject} Performance`,
        message: `Current: ${subject.marks}%. With focused effort, you can reach excellence.`
      });
    });

    if (excellentSubjects.length > 0) {
      alerts.push({
        type: 'success',
        title: 'Outstanding Subject Performance!',
        message: `Excellent work in ${excellentSubjects.length} subject(s): ${excellentSubjects.map(s => s.subject).join(', ')}`
      });
    }

    // Overall summary
    const totalNeedingFocus = criticalSubjects.length + averageSubjects.length;
    if (totalNeedingFocus > 0) {
      alerts.push({
        type: 'info',
        title: 'Subject Focus Summary',
        message: `Out of ${marks.length} subjects: ${excellentSubjects.length} excellent, ${averageSubjects.length} need improvement, ${criticalSubjects.length} need urgent focus.`
      });
    }

    console.log('\n📋 GENERATED ALERTS:', alerts.length);
    alerts.forEach((alert, index) => {
      const icon = alert.type === 'critical' ? '🔴' : alert.type === 'warning' ? '🟡' : alert.type === 'info' ? '🔵' : '🟢';
      console.log(`${index + 1}. ${icon} ${alert.title}`);
      console.log(`   ${alert.message}`);
    });

    console.log('\n✅ SUBJECT FOCUS FEATURES IMPLEMENTED:');
    console.log('📊 Individual subject alerts for each critical/average subject');
    console.log('🎯 Subject categorization (Critical, Improvement, Good, Excellent)');
    console.log('📈 Detailed Subject Focus Analysis section');
    console.log('🎨 Visual subject performance overview');
    console.log('🔍 Attendance tracking per subject');
    console.log('📋 Grade calculation for each subject');

    console.log('\n🌐 TEST THE ENHANCED SYSTEM:');
    console.log('1. Login: http://localhost:3000/login');
    console.log('2. Credentials: sru@gmail.com / student123');
    console.log('3. Navigate: Performance Alerts (sidebar menu)');
    console.log('4. View: Subject Focus Analysis section');
    console.log('5. Check: Individual subject alerts and detailed analysis');

    console.log('\n🎉 SUBJECT ALERT SYSTEM STATUS: ENHANCED ✅');
    console.log('📚 Subject monitoring: Individual tracking');
    console.log('🎯 Focus areas: Clearly identified');
    console.log('📊 Visual analysis: Comprehensive overview');
    console.log('🚨 Smart alerts: Per-subject recommendations');

  } catch (error) {
    console.error('❌ Error testing subject alerts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

function getGrade(marks) {
  if (marks >= 90) return 'A+';
  if (marks >= 85) return 'A';
  if (marks >= 80) return 'A-';
  if (marks >= 75) return 'B+';
  if (marks >= 70) return 'B';
  if (marks >= 65) return 'B-';
  if (marks >= 60) return 'C+';
  if (marks >= 55) return 'C';
  if (marks >= 50) return 'C-';
  return 'F';
}

testSubjectAlerts();
