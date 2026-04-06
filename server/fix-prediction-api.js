const mongoose = require('mongoose');
require('dotenv').config();

async function fixPredictionAPI() {
  try {
    console.log('🔧 Fixing Performance Prediction API');
    console.log('===================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Test the current data structure
    console.log('\n📊 Testing current data structure...');
    
    // Check students
    const students = await db.collection('users').find({ role: 'student' }).limit(2).toArray();
    console.log(`Found ${students.length} students`);
    
    for (const student of students) {
      console.log(`\n📚 Student: ${student.name} (${student.email})`);
      console.log(`   ├─ _id: ${student._id}`);
      console.log(`   ├─ userIdString: ${student.userIdString}`);
      
      // Check marks with _id
      const marksWithId = await db.collection('marks').find({ studentId: student._id }).toArray();
      console.log(`   ├─ Marks with _id: ${marksWithId.length}`);
      
      // Check marks with userIdString
      const marksWithUserIdString = await db.collection('marks').find({ studentId: student.userIdString }).toArray();
      console.log(`   ├─ Marks with userIdString: ${marksWithUserIdString.length}`);
      
      // Check attendance with _id
      const attWithId = await db.collection('attendancerecords').find({ studentId: student._id }).toArray();
      console.log(`   ├─ Attendance with _id: ${attWithId.length}`);
      
      // Check attendance with userIdString
      const attWithUserIdString = await db.collection('attendancerecords').find({ studentId: student.userIdString }).toArray();
      console.log(`   └─ Attendance with userIdString: ${attWithUserIdString.length}`);
    }
    
    console.log('\n🎯 Issue Identified:');
    console.log('==================');
    console.log('❌ Prediction API using wrong studentId format');
    console.log('❌ Should use userIdString instead of _id');
    console.log('❌ Need to update prediction algorithm');
    
    console.log('\n🔧 Creating Fixed Prediction Script...');
    
    // Create a fixed prediction function
    const fixedPredictPerformance = (studentData) => {
      const marks = studentData.marks || [];
      if (marks.length < 2) {
        return {
          predictedScore: studentData.averageMarks || 0,
          confidence: marks.length > 0 ? 30 : 0,
          trend: 'insufficient_data',
          recommendation: 'Need more assessment data for accurate prediction'
        };
      }

      // Calculate trend from recent marks
      const recentMarks = marks.slice(-5);
      const olderMarks = marks.slice(0, Math.max(0, marks.length - 5));
      
      let trend = 'stable';
      if (recentMarks.length >= 2 && olderMarks.length >= 2) {
        const recentAvg = recentMarks.reduce((sum, m) => sum + m.marks, 0) / recentMarks.length;
        const olderAvg = olderMarks.reduce((sum, m) => sum + m.marks, 0) / olderMarks.length;
        
        if (recentAvg > olderAvg + 5) trend = 'improving';
        else if (recentAvg < olderAvg - 5) trend = 'declining';
      }

      // Base prediction on recent performance
      const recentAvg = recentMarks.reduce((sum, m) => sum + m.marks, 0) / recentMarks.length;
      let predictedScore = recentAvg;
      let confidence = Math.min(70 + (marks.length * 5), 95);

      // Adjust based on attendance
      const attendance = studentData.attendancePercentage || 0;
      if (attendance < 75) {
        predictedScore *= 0.9;
        confidence -= 10;
      } else if (attendance >= 90) {
        predictedScore *= 1.05;
        confidence += 5;
      }

      // Adjust based on CGPA
      const cgpa = studentData.cgpa || 0;
      if (cgpa >= 3.0) {
        predictedScore *= 1.1;
        confidence += 5;
      } else if (cgpa < 2.0) {
        predictedScore *= 0.95;
        confidence -= 5;
      }

      // Cap the values
      predictedScore = Math.min(Math.max(predictedScore, 0), 100);
      confidence = Math.min(Math.max(confidence, 0), 100);

      // Generate recommendation
      let recommendation = 'Continue current performance';
      if (predictedScore < 40) {
        recommendation = 'Immediate intervention required - focus on fundamentals';
      } else if (predictedScore < 60) {
        recommendation = 'Additional support needed - consider tutoring';
      } else if (predictedScore >= 85) {
        recommendation = 'Excellent performance - consider advanced challenges';
      } else if (trend === 'declining') {
        recommendation = 'Performance declining - needs attention';
      } else if (trend === 'improving') {
        recommendation = 'Good progress - maintain momentum';
      }

      return {
        predictedScore: Math.round(predictedScore),
        confidence,
        trend,
        recommendation
      };
    };

    // Test the fixed prediction
    console.log('\n🧪 Testing Fixed Prediction Algorithm...');
    
    for (const student of students) {
      // Fetch data using correct IDs
      const marks = await db.collection('marks').find({ studentId: student.userIdString }).toArray();
      const attendance = await db.collection('attendancerecords').find({ studentId: student.userIdString }).toArray();
      
      // Calculate attendance percentage
      let attendancePercentage = 0;
      if (attendance.length > 0) {
        const present = attendance.filter(r => r.status === 'Present').length;
        attendancePercentage = Math.round((present / attendance.length) * 100);
      }
      
      // Calculate average marks
      const averageMarks = marks.length > 0 
        ? marks.reduce((sum, m) => sum + m.marks, 0) / marks.length 
        : 0;
      
      // Calculate CGPA
      const cgpa = averageMarks > 0 ? (averageMarks * 4) / 100 : 0;
      
      // Prepare student data
      const studentData = {
        ...student,
        marks,
        attendance,
        attendancePercentage,
        averageMarks,
        cgpa
      };
      
      // Generate prediction
      const prediction = fixedPredictPerformance(studentData);
      
      console.log(`\n📊 ${student.name} - Prediction Results:`);
      console.log(`   ├─ Current Average: ${averageMarks.toFixed(2)}%`);
      console.log(`   ├─ Current CGPA: ${cgpa.toFixed(2)}`);
      console.log(`   ├─ Attendance: ${attendancePercentage}%`);
      console.log(`   ├─ Predicted Score: ${prediction.predictedScore}%`);
      console.log(`   ├─ Confidence: ${prediction.confidence}%`);
      console.log(`   ├─ Trend: ${prediction.trend}`);
      console.log(`   └─ Recommendation: ${prediction.recommendation}`);
    }
    
    console.log('\n🎉 Fixed Prediction Algorithm Ready!');
    console.log('==================================');
    console.log('✅ Uses correct studentId format (userIdString)');
    console.log('✅ Works with new data structure');
    console.log('✅ Enhanced prediction logic');
    console.log('✅ Better confidence calculation');
    console.log('✅ Improved recommendations');
    
    console.log('\n📝 Required Changes:');
    console.log('==================');
    console.log('1. Update /api/faculty/predictions endpoint');
    console.log('2. Use userIdString instead of _id for marks lookup');
    console.log('3. Use attendancerecords collection');
    console.log('4. Apply fixed prediction algorithm');
    console.log('5. Test with frontend integration');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the fix
fixPredictionAPI();
