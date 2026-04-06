const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function testLoginStepByStep() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic-monitor');
    
    console.log('🔍 Testing Login Step by Step\n');
    
    // Step 1: Simulate the exact login query
    const email = 'admin@gmail.com';
    const password = 'admin123';
    const role = 'admin';
    
    console.log('Step 1: Finding user with email:', email);
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }
    
    console.log('✅ User found:');
    console.log('- ID:', user._id);
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Has password:', !!user.password);
    
    // Step 2: Check password
    console.log('\nStep 2: Comparing password');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password does not match!');
      return;
    }
    
    // Step 3: Check role validation (if enabled)
    console.log('\nStep 3: Role validation');
    console.log('Requested role:', role);
    console.log('User role:', user.role);
    
    if (role && role.toLowerCase() !== user.role.toLowerCase()) {
      console.log('❌ Role mismatch!');
      return;
    }
    
    console.log('✅ Role validation passed');
    
    // Step 4: Generate token
    console.log('\nStep 4: Generating JWT token');
    const jwt = require('jsonwebtoken');
    const payload = { user: { id: user._id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "fallback_secret", { expiresIn: '7d' });
    console.log('✅ Token generated');
    
    // Step 5: Create response
    console.log('\nStep 5: Creating response');
    const response = {
      msg: "Login Success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        semester: user.semester,
        rollNumber: user.rollNumber,
        profilePic: user.profilePic
      }
    };
    
    console.log('✅ Response created successfully');
    console.log('Final response:', JSON.stringify(response, null, 2));
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testLoginStepByStep();
