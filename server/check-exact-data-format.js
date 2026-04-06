const mongoose = require('mongoose');
require('dotenv').config();

async function checkExactDataFormat() {
  try {
    console.log('🔍 Checking Exact Data Format');
    console.log('============================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check exact format in marks collection
    console.log('\n📝 Checking Marks Collection Format...');
    const sampleMark = await db.collection('marks').findOne();
    if (sampleMark) {
      console.log('Sample Mark Record:');
      Object.keys(sampleMark).forEach(key => {
        if (key !== '_id') {
          const value = sampleMark[key];
          const type = typeof value;
          const displayValue = type === 'object' ? JSON.stringify(value) : value;
          console.log(`   ├─ ${key}: ${type} = "${displayValue}"`);
        }
      });
    }
    
    // Check exact format in users collection
    console.log('\n👥 Checking Users Collection Format...');
    const sampleUser = await db.collection('users').findOne({ role: 'student' });
    if (sampleUser) {
      console.log('Sample User Record:');
      Object.keys(sampleUser).forEach(key => {
        if (key !== '_id' && key !== 'password') {
          const value = sampleUser[key];
          const type = typeof value;
          const displayValue = type === 'object' ? JSON.stringify(value) : value;
          console.log(`   ├─ ${key}: ${type} = "${displayValue}"`);
        }
      });
    }
    
    // Test different ID formats
    console.log('\n🧪 Testing Different ID Formats...');
    
    if (sampleUser && sampleMark) {
      const userIdString = sampleUser.userIdString;
      const userId = sampleUser._id;
      
      console.log(`\nUser ID Formats:`);
      console.log(`   ├─ _id: ${userId} (type: ${typeof userId})`);
      console.log(`   └─ userIdString: ${userIdString} (type: ${typeof userIdString})`);
      
      console.log(`\nMark studentId: ${sampleMark.studentId} (type: ${typeof sampleMark.studentId})`);
      
      // Test with _id
      const marksWithId = await db.collection('marks').find({ studentId: userId }).toArray();
      console.log(`\nMarks found with _id: ${marksWithId.length}`);
      
      // Test with userIdString
      const marksWithUserIdString = await db.collection('marks').find({ studentId: userIdString }).toArray();
      console.log(`Marks found with userIdString: ${marksWithUserIdString.length}`);
      
      // Test with string version of _id
      const marksWithIdString = await db.collection('marks').find({ studentId: userId.toString() }).toArray();
      console.log(`Marks found with _id.toString(): ${marksWithIdString.length}`);
      
      // Find the correct format
      let correctFormat = null;
      let correctMarks = [];
      
      if (marksWithId.length > 0) {
        correctFormat = 'user._id (ObjectId)';
        correctMarks = marksWithId;
      } else if (marksWithUserIdString.length > 0) {
        correctFormat = 'user.userIdString (String)';
        correctMarks = marksWithUserIdString;
      } else if (marksWithIdString.length > 0) {
        correctFormat = 'user._id.toString() (String)';
        correctMarks = marksWithIdString;
      }
      
      if (correctFormat) {
        console.log(`\n✅ CORRECT FORMAT FOUND: ${correctFormat}`);
        console.log(`   ├─ Found ${correctMarks.length} marks records`);
        
        if (correctMarks.length > 0) {
          console.log(`   ├─ Sample marks: ${correctMarks.slice(0, 3).map(m => `${m.subject}: ${m.marks}`).join(', ')}`);
          
          // Calculate prediction
          const totalMarks = correctMarks.reduce((sum, m) => sum + m.marks, 0);
          const avgMarks = totalMarks / correctMarks.length;
          const cgpa = (avgMarks * 4) / 100;
          
          console.log(`   ├─ Average: ${avgMarks.toFixed(2)}%`);
          console.log(`   ├─ CGPA: ${cgpa.toFixed(2)}`);
          console.log(`   ✅ Prediction data available!`);
        }
      } else {
        console.log(`\n❌ NO MATCHING FORMAT FOUND`);
        console.log(`   ├─ Need to check data consistency`);
        console.log(`   ├─ May need to update marks collection`);
      }
    }
    
    console.log('\n🎯 Recommendation:');
    console.log('=================');
    
    if (sampleMark && sampleUser) {
      const markStudentId = sampleMark.studentId;
      const userObjectId = sampleUser._id;
      const userUserIdString = sampleUser.userIdString;
      
      console.log(`Current marks.studentId: ${markStudentId}`);
      console.log(`User _id: ${userObjectId}`);
      console.log(`User userIdString: ${userUserIdString}`);
      
      if (markStudentId.toString() === userObjectId.toString()) {
        console.log('✅ Use: student._id (ObjectId) for marks lookup');
      } else if (markStudentId === userUserIdString) {
        console.log('✅ Use: student.userIdString (String) for marks lookup');
      } else {
        console.log('❌ Data mismatch - need to fix collection consistency');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkExactDataFormat();
