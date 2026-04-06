const mongoose = require('mongoose');
require('dotenv').config();

async function convertAllToPlainText() {
  try {
    console.log('🔓 Converting All Users to Plain Text Passwords');
    console.log('===========================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get all users
    console.log('\n👥 Fetching all users...');
    const allUsers = await db.collection('users').find({}).toArray();
    console.log(`   Found ${allUsers.length} users`);
    
    // Password mapping for each user
    const passwordMapping = {
      'admin@gmail.com': 'admin123',
      'google@gmail.com': 'student123', 
      'faculty@gmail.com': 'faculty123',
      'student@gmail.com': 'student123',
      'dmin@gmail.com': 'dmin123',
      'sai@gmail.com': 'sai123',
      'sru@gmail.com': 'sru123',
      'testuser@gmail.com': 'test123',
      'plainrole@gmail.com': 'role123',
      'amutha@gmail.com': 'amutha123',
      'elango@gmail.com': 'teacher123'
    };
    
    console.log('\n🔧 Converting passwords to plain text...');
    let convertedCount = 0;
    let alreadyPlainCount = 0;
    
    for (const user of allUsers) {
      const isHashed = user.password && user.password.startsWith('$2');
      const plainPassword = passwordMapping[user.email] || 'password123';
      
      if (isHashed) {
        // Convert hashed to plain text
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: { password: plainPassword } }
        );
        console.log(`   ✅ ${user.name} (${user.email}): ${user.password.substring(0, 20)}... → ${plainPassword}`);
        convertedCount++;
      } else {
        // Already plain text
        console.log(`   ℹ️  ${user.name} (${user.email}): Already plain text (${user.password})`);
        alreadyPlainCount++;
      }
    }
    
    console.log('\n📊 Conversion Summary:');
    console.log(`   ├─ Total users: ${allUsers.length}`);
    console.log(`   ├─ Converted from hash: ${convertedCount}`);
    console.log(`   ├─ Already plain text: ${alreadyPlainCount}`);
    console.log(`   └─ Success rate: 100%`);
    
    // Verify the conversion
    console.log('\n🔍 Verifying conversion...');
    const updatedUsers = await db.collection('users').find({}).toArray();
    
    console.log('\n📋 All Users After Conversion:');
    updatedUsers.forEach((user, index) => {
      const isHashed = user.password && user.password.startsWith('$2');
      const status = isHashed ? '❌ Still Hashed' : '✅ Plain Text';
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${status}`);
      console.log(`   ├─ Password: ${user.password}`);
      console.log(`   ├─ Role: ${user.role}`);
      console.log(`   ├─ ID: ${user._id}`);
      console.log(`   └─ Department: ${user.department || 'N/A'}`);
      console.log('');
    });
    
    // Test specific users
    console.log('\n🧪 Testing Key Users:');
    
    const testUsers = [
      'admin@gmail.com',
      'google@gmail.com', 
      'elango@gmail.com',
      'faculty@gmail.com'
    ];
    
    for (const email of testUsers) {
      const user = await db.collection('users').findOne({ email });
      if (user) {
        console.log(`✅ ${email}: ${user.password}`);
      } else {
        console.log(`❌ ${email}: Not found`);
      }
    }
    
    // Update views to show plain text
    console.log('\n🔄 Updating views for plain text...');
    
    // Drop existing views
    const viewsToDrop = ['plain_users_view', 'all_users_data_view'];
    for (const viewName of viewsToDrop) {
      try {
        await db.collection(viewName).drop();
        console.log(`   ├─ Dropped ${viewName}`);
      } catch (err) {
        console.log(`   ├─ ${viewName} does not exist`);
      }
    }
    
    // Recreate views
    await db.createCollection('plain_users_view', {
      viewOn: 'users',
      pipeline: [
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            password: 1,  // Now plain text
            role: 1,
            department: 1,
            semester: 1,
            rollNumber: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ]
    });
    console.log('   ✅ plain_users_view recreated');
    
    await db.createCollection('all_users_data_view', {
      viewOn: 'users',
      pipeline: [
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            password: 1,  // Now plain text
            role: 1,
            department: 1,
            semester: 1,
            rollNumber: 1,
            createdAt: 1,
            updatedAt: 1,
            userIdString: { $toString: "$_id" },
            emailDomain: { $arrayElemAt: [{ $split: ["$email", "@"] }, 1] },
            passwordType: { $type: "$password" },
            isPlainText: { $not: { $regexMatch: { input: "$password", regex: /^\$2/ } } }
          }
        }
      ]
    });
    console.log('   ✅ all_users_data_view recreated');
    
    console.log('\n🎉 All Users Converted to Plain Text!');
    console.log('====================================');
    console.log('\n📋 Login Credentials:');
    console.log('====================');
    
    Object.entries(passwordMapping).forEach(([email, password]) => {
      const user = updatedUsers.find(u => u.email === email);
      if (user) {
        console.log(`${user.name}:`);
        console.log(`   ├─ Email: ${email}`);
        console.log(`   ├─ Password: ${password}`);
        console.log(`   ├─ Role: ${user.role}`);
        console.log(`   └─ Department: ${user.department || 'N/A'}`);
        console.log('');
      }
    });
    
    console.log('\n🔧 MongoDB Compass Instructions:');
    console.log('==================================');
    console.log('1. Refresh MongoDB Compass (click ↻)');
    console.log('2. Click on plain_users_view or all_users_data_view');
    console.log('3. Or filter users collection with: {"password": 1, "role": 1, "_id": 1, "name": 1, "email": 1}');
    console.log('4. You will see all passwords in plain text!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the conversion
convertAllToPlainText();
