// Debug the login issue by checking the User model directly
const mongoose = require('mongoose');
const User = require('./models/User');

async function debugLogin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic_monitor');
    console.log('✅ Connected to MongoDB');
    
    // Test the exact same query as the server
    const email = 'faculty@test.com';
    const cleanedEmail = email.trim().toLowerCase();
    
    console.log('🔍 Testing exact server query...');
    console.log('📧 Looking for email:', cleanedEmail);
    
    // Test exact match
    let user = await User.findOne({ email: cleanedEmail }).select('+password');
    console.log('👤 Exact match result:', user ? user.name : 'Not found');
    
    if (!user) {
      console.log('🔍 Trying regex fallback...');
      const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const normalizedEmailRegex = new RegExp(`^\\s*${escapeRegExp(cleanedEmail)}\\s*$`, "i");
      user = await User.findOne({ email: { $regex: normalizedEmailRegex } }).select('+password');
      console.log('👤 Regex match result:', user ? user.name : 'Not found');
    }
    
    // Test without password selection
    const userNoPassword = await User.findOne({ email: cleanedEmail });
    console.log('👤 User without password:', userNoPassword ? userNoPassword.name : 'Not found');
    
    // Test all users
    const allUsers = await User.find({});
    console.log('👥 All users:', allUsers.map(u => `${u.name} (${u.email})`));
    
    // Test the raw collection
    const db = mongoose.connection.db;
    const rawUser = await db.collection('users').findOne({ email: cleanedEmail });
    console.log('🗄️ Raw collection result:', rawUser ? rawUser.name : 'Not found');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugLogin();
