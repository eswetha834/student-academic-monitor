const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function fixNewStudentPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('🔗 Connected to MongoDB');

    // Find the most recently created student
    const latestStudent = await User.findOne({ role: 'student' }).sort({ createdAt: -1 });
    
    if (!latestStudent) {
      console.log('❌ No student found');
      return;
    }

    console.log('🔧 Fixing password for:', latestStudent.email);

    // Hash the password correctly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('student123', salt);
    
    // Update the password
    await User.updateOne(
      { _id: latestStudent._id },
      { 
        $set: { 
          password: hashedPassword,
          plainPassword: 'student123'
        }
      }
    );
    
    console.log('✅ Password fixed successfully!');
    
    // Verify the fix
    const updatedStudent = await User.findOne({ _id: latestStudent._id });
    const passwordMatch = await updatedStudent.comparePassword('student123');
    
    console.log('🔑 Password verification:', passwordMatch ? '✅ Valid' : '❌ Invalid');
    
    if (passwordMatch) {
      console.log('\n🎉 NEW STUDENT ACCOUNT IS NOW READY!');
      console.log('📧 Email:', updatedStudent.email);
      console.log('🔑 Password: student123');
      console.log('🌐 Login: http://localhost:3000/login');
    }

  } catch (error) {
    console.error('❌ Error fixing password:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixNewStudentPassword();
