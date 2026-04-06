// Check current users in database
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic_monitor');
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`👥 Found ${users.length} users:`);
    
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Check if faculty exists
    const faculty = await User.findOne({ email: 'faculty@test.com' });
    if (!faculty) {
      console.log('❌ Faculty user not found, creating...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('faculty123', 10);
      
      const newFaculty = new User({
        name: 'Test Faculty',
        email: 'faculty@test.com',
        password: hashedPassword,
        role: 'teacher',
        department: 'Computer Science',
        userIdString: 'faculty_001'
      });
      
      await newFaculty.save();
      console.log('✅ Faculty user created successfully');
    } else {
      console.log('✅ Faculty user exists');
    }

    console.log('\n📱 Login credentials:');
    console.log('👨‍🏫 Faculty: faculty@test.com / faculty123');
    
    // Check students
    const students = await User.find({ role: 'student' });
    console.log(`\n🎓 Found ${students.length} students:`);
    students.forEach(student => {
      console.log(`- ${student.name} (${student.email})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUsers();
