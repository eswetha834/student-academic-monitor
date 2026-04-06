const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();

async function addSampleUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');

    // Find or create student role
    let studentRole = await Role.findOne({ name: 'student' });
    if (!studentRole) {
      studentRole = await Role.create({ name: 'student' });
      console.log('✅ Created student role');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'sru@gmail.com' });
    if (existingUser) {
      console.log('❌ User sru@gmail.com already exists');
      console.log('User details:', existingUser.name, existingUser.role);
      await mongoose.disconnect();
      return;
    }

    // Create the sample user
    const sampleUser = new User({
      name: 'SRU Student',
      email: 'sru@gmail.com',
      password: 'sru123', // Will be hashed automatically
      role: 'student',
      plainPassword: 'sru123', // For reference (hidden from queries)
      department: 'Computer Science',
      rollNumber: 'CS2024001',
      semester: '4th',
      isActive: true
    });

    await sampleUser.save();
    console.log('✅ Sample user created successfully!');
    console.log('📧 Email: sru@gmail.com');
    console.log('🔑 Password: sru123');
    console.log('👤 Name: SRU Student');
    console.log('🎓 Role: student');
    console.log('📚 Department: Computer Science');
    console.log('🔢 Roll Number: CS2024001');
    console.log('📖 Semester: 4th');

    // Verify the user was created
    const createdUser = await User.findOne({ email: 'sru@gmail.com' });
    if (createdUser) {
      console.log('✅ User verification successful');
      console.log('User ID:', createdUser._id);
    }

  } catch (error) {
    console.error('❌ Error adding sample user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

addSampleUser();
