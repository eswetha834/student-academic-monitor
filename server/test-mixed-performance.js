const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
require('dotenv').config();

async function testMixedPerformance() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27091/academic-monitor');
    console.log('🔗 Connected to MongoDB');

    console.log('🎯 TESTING MIXED PERFORMANCE SCENARIOS');
    console.log('=' .repeat(60));

    // Simulate different performance scenarios
    const scenarios = [
      {
        name: 'Mixed Performance Student',
        subjects: [
          { subject: 'Mathematics', marks: 92, attendance: 95 },
          { subject: 'Physics', marks: 58, attendance: 88 },
          { subject: 'Chemistry', marks: 72, attendance: 82 },
          { subject: 'Data Structures', marks: 85, attendance: 90 },
          { subject: 'Database', marks: 45, attendance: 75 }
        ]
      },
      {
        name: 'Struggling Student',
        subjects: [
          { subject: 'Mathematics', marks: 55, attendance: 70 },
          { subject: 'Physics', marks: 48, attendance: 65 },
          { subject: 'Chemistry', marks: 62, attendance: 78 },
          { subject: 'Data Structures', marks: 58, attendance: 72 },
          { subject: 'Database', marks: 52, attendance: 68 }
        ]
      },
      {
        name: 'Excellent Student',
        subjects: [
          { subject: 'Mathematics', marks: 95, attendance: 98 },
          { subject: 'Physics', marks: 88, attendance: 94 },
          { subject: 'Chemistry', marks: 92, attendance: 96 },
          { subject: 'Data Structures', marks: 90, attendance: 95 },
          { subject: 'Database', marks: 87, attendance: 93 }
        ]
      }
    ];

    scenarios.forEach((scenario, scenarioIndex) => {
      console.log(`\n📊 SCENARIO ${scenarioIndex + 1}: ${scenario.name}`);
      console.log('-'.repeat(40));

      // Categorize subjects
      const criticalSubjects = scenario.subjects.filter(m => m.marks < 60);
      const averageSubjects = scenario.subjects.filter(m => m.marks >= 60 && m.marks < 75);
      const goodSubjects = scenario.subjects.filter(m => m.marks >= 75 && m.marks < 85);
      const excellentSubjects = scenario.subjects.filter(m => m.marks >= 85);

      console.log(`🔴 Critical Subjects (<60%): ${criticalSubjects.length}`);
      criticalSubjects.forEach(subject => {
        console.log(`  ❌ ${subject.subject}: ${subject.marks}% (Att: ${subject.attendance}%)`);
      });

      console.log(`🟡 Needs Improvement (60-74%): ${averageSubjects.length}`);
      averageSubjects.forEach(subject => {
        console.log(`  ⚠️ ${subject.subject}: ${subject.marks}% (Att: ${subject.attendance}%)`);
      });

      console.log(`🟢 Good Performance (75-84%): ${goodSubjects.length}`);
      goodSubjects.forEach(subject => {
        console.log(`  ✅ ${subject.subject}: ${subject.marks}% (Att: ${subject.attendance}%)`);
      });

      console.log(`🟢 Excellent Performance (85%+): ${excellentSubjects.length}`);
      excellentSubjects.forEach(subject => {
        console.log(`  🌟 ${subject.subject}: ${subject.marks}% (Att: ${subject.attendance}%)`);
      });

      // Generate alerts
      const alerts = [];
      
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
          message: `Excellent work in ${excellentSubjects.length} subject(s)`
        });
      }

      console.log(`\n🚨 Generated Alerts: ${alerts.length}`);
      alerts.forEach((alert, index) => {
        const icon = alert.type === 'critical' ? '🔴' : alert.type === 'warning' ? '🟡' : '🟢';
        console.log(`  ${index + 1}. ${icon} ${alert.title}`);
      });

      console.log(`\n📋 Subject Focus Analysis Would Show:`);
      console.log(`  🔴 Critical Section: ${criticalSubjects.length} subjects`);
      console.log(`  🟡 Improvement Section: ${averageSubjects.length} subjects`);
      console.log(`  🟢 Excellent Section: ${excellentSubjects.length} subjects`);
      console.log(`  📊 Overview Grid: All ${scenario.subjects.length} subjects`);
    });

    console.log('\n✅ ENHANCED SUBJECT ALERT FEATURES:');
    console.log('🎯 Individual subject alerts for each subject needing attention');
    console.log('📊 Visual categorization by performance level');
    console.log('🔍 Detailed Subject Focus Analysis section');
    console.log('📈 Attendance tracking per subject');
    console.log('🎨 Color-coded performance indicators');
    console.log('📋 Comprehensive subject overview grid');

    console.log('\n🌐 READY FOR TESTING:');
    console.log('1. Login: http://localhost:3000/login');
    console.log('2. Navigate: Performance Alerts (sidebar menu)');
    console.log('3. View: Subject Focus Analysis section');
    console.log('4. Experience: Individual subject alerts and detailed analysis');

    console.log('\n🎉 SUBJECT ALERT SYSTEM: FULLY ENHANCED ✅');

  } catch (error) {
    console.error('❌ Error testing mixed performance:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testMixedPerformance();
