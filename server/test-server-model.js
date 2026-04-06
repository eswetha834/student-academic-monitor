// Test if the server's User model is working correctly
const mongoose = require('mongoose');

async function testServerModel() {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/academic_monitor');
    console.log('✅ Connected to MongoDB');
    
    // Test User model import (same as server)
    const User = require('./models/User');
    console.log('📦 User model imported');
    
    // Test the exact query the server does
    const email = 'faculty@test.com';
    const cleanedEmail = email.trim().toLowerCase();
    
    console.log('🔍 Testing server query...');
    
    // This is the exact code from the server
    let user = await User.findOne({ email: cleanedEmail }).select('+password');
    if (!user) {
      console.log('🔍 Exact email search failed, trying regex fallback');
      const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const normalizedEmailRegex = new RegExp(`^\\s*${escapeRegExp(cleanedEmail)}\\s*$`, "i");
      user = await User.findOne({ email: { $regex: normalizedEmailRegex } }).select('+password');
      if (user) console.log('🔎 User found with regex fallback', user.email);
    }
    
    if (user) {
      console.log('✅ User found:', user.name);
      console.log('📧 Email:', user.email);
      console.log('🔑 Role:', user.role);
      console.log('🔐 Password exists:', !!user.password);
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testServerModel();
