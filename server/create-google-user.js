const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();

async function createGoogleUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'google@gmail.com' });
    if (existingUser) {
      console.log('User google@gmail.com already exists');
      process.exit(0);
    }

    // Get student role
    const studentRole = await Role.findOne({ name: 'student' });
    if (!studentRole) {
      console.log('Student role not found');
      process.exit(0);
    }

    // Create the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password', salt);

    const user = new User({
      name: 'Google User',
      email: 'google@gmail.com',
      password: hashedPassword,
      role: studentRole._id,
      department: 'Computer Science',
      semester: '4',
      rollNumber: 'GOO001'
    });

    await user.save();
    console.log('✅ User created successfully!');
    console.log('📧 Email: google@gmail.com');
    console.log('🔑 Password: password');
    console.log('👤 Name: Google User');
    console.log('🎓 Role: Student');

  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createGoogleUser();
