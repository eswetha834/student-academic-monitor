const mongoose = require('mongoose');
const User = require('./models/User');

async function testAdminLoginDebug() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic-monitor');
    
    // Check admin user details
    const admin = await User.findOne({ email: 'admin@gmail.com' }).select('+password');
    console.log('Admin User Found:');
    console.log('- Email:', admin?.email);
    console.log('- Name:', admin?.name);
    console.log('- Role:', admin?.role);
    console.log('- Has password:', !!admin?.password);
    console.log('- Password is hashed:', admin?.password?.startsWith('$2'));
    
    // Check if there are any role issues
    const allAdmins = await User.find({ role: 'admin' });
    console.log('\nAll Admin Users:');
    allAdmins.forEach(admin => {
      console.log(`- ${admin.name} (${admin.email}) - Role: "${admin.role}"`);
    });
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testAdminLoginDebug();
