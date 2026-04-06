const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createTestAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic-monitor');
    
    // Delete existing admin
    await User.deleteOne({ email: 'admin@gmail.com' });
    console.log('Deleted existing admin user');
    
    // Create new admin with fresh password
    const adminData = {
      name: 'System Administrator',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin',
      department: 'Computer Science'
    };
    
    const admin = new User(adminData);
    await admin.save();
    
    console.log('✅ New admin user created');
    console.log('Email:', admin.email);
    console.log('Password hash:', admin.password.substring(0, 20) + '...');
    console.log('Is hashed:', admin.password.startsWith('$2'));
    
    // Test password comparison
    const isMatch = await bcrypt.compare('admin123', admin.password);
    console.log('Password comparison test:', isMatch);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestAdmin();
