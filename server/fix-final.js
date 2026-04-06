// Final fix for faculty login issue
const mongoose = require('mongoose');
const User = require('./models/User');

async function finalFix() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic_monitor');
    console.log('✅ Connected to MongoDB');
    
    // Update faculty user to ensure it has correct role and data
    const result = await User.updateOne(
      { email: 'faculty@test.com' },
      { 
        $set: {
          role: 'teacher',
          department: 'Computer Science',
          userIdString: 'faculty_001'
        }
      },
      { upsert: true }
    );
    
    console.log('📝 Update result:', result);
    
    // Verify the user
    const user = await User.findOne({ email: 'faculty@test.com' });
    console.log('👤 User:', user ? user.name : 'Not found');
    console.log('🔑 Role:', user ? user.role : 'N/A');
    
    if (user) {
      console.log('🎉 Faculty user is ready!');
      console.log('📱 Login: faculty@test.com / faculty123');
      console.log('\n🔮 Now test in browser:');
      console.log('1. Go to http://localhost:3000/login');
      console.log('2. Enter faculty@test.com / faculty123');
      console.log('3. Navigate to Predictions tab');
      console.log('4. Click "Generate Predictions"');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

finalFix();
