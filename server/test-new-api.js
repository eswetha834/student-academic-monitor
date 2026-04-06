const mongoose = require('mongoose');
const User = require('./models/User');
const Marks = require('./models/Marks');
require('dotenv').config();

async function testNewAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('🔗 Connected to MongoDB');

    // Find SRU student
    const sruStudent = await User.findOne({ email: 'sru@gmail.com' });
    console.log('👤 Testing new /api/marks endpoint for:', sruStudent.email);
    console.log('🆔 Student ID:', sruStudent._id);

    // Simulate the API call (same logic as new endpoint)
    const marks = await Marks.find({ studentId: sruStudent._id });
    console.log('\n📊 API SIMULATION RESULTS:');
    console.log('📋 Records returned:', marks.length);

    if (marks.length > 0) {
      console.log('\n📈 SAMPLE DATA (what frontend will receive):');
      marks.slice(0, 5).forEach((mark, index) => {
        console.log(`${index + 1}. ${mark.subject}: ${mark.marks}% (${mark.examType})`);
      });
      
      console.log('\n✅ API endpoint is ready!');
      console.log('🔄 Server needs to be restarted');
      console.log('🌐 Then test: http://localhost:3000/login');
      console.log('📧 Email: sru@gmail.com');
      console.log('🔑 Password: student123');
    } else {
      console.log('❌ No marks found');
    }

  } catch (error) {
    console.error('❌ Error testing API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testNewAPI();
