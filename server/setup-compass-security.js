const mongoose = require('mongoose');
require('dotenv').config();

async function setupCompassSecurity() {
  try {
    console.log('🔒 Setting up MongoDB Compass Security Views');
    console.log('==========================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Drop existing views if they exist
    console.log('\n🗑️  Cleaning up existing views...');
    try {
      await db.collection('secure_users').drop();
      console.log('   ├─ Dropped existing secure_users view');
    } catch (err) {
      console.log('   ├─ secure_users view does not exist (OK)');
    }
    
    try {
      await db.collection('users_password_info').drop();
      console.log('   ├─ Dropped existing users_password_info view');
    } catch (err) {
      console.log('   ├─ users_password_info view does not exist (OK)');
    }
    
    // Create secure users view (no sensitive data)
    console.log('\n📋 Creating secure users view...');
    await db.createCollection('secure_users', {
      viewOn: 'users',
      pipeline: [
        {
          $project: {
            name: 1,
            email: 1,
            createdAt: 1,
            updatedAt: 1,
            // Hide all sensitive fields
            _id: 0,
            password: 0,
            role: 0
          }
        }
      ]
    });
    console.log('   ✅ secure_users view created');
    
    // Create users with password info view (shows password field exists but not value)
    console.log('\n📋 Creating users with password info view...');
    await db.createCollection('users_password_info', {
      viewOn: 'users',
      pipeline: [
        {
          $project: {
            name: 1,
            email: 1,
            createdAt: 1,
            updatedAt: 1,
            // Show password metadata but hide actual value
            hasPassword: { $cond: [{ $ifNull: ["$password", false] }, true, false] },
            passwordType: { $type: "$password" },
            passwordLength: { $strLenCP: { $ifNull: ["$password", ""] } },
            isHashed: { $regexMatch: { input: "$password", regex: /^\$2/ } },
            // Hide sensitive fields
            _id: 0,
            password: 0,
            role: 0
          }
        }
      ]
    });
    console.log('   ✅ users_password_info view created');
    
    // Create admin view (shows everything for admin access)
    console.log('\n📋 Creating admin users view...');
    await db.createCollection('admin_users', {
      viewOn: 'users',
      pipeline: [
        {
          $project: {
            name: 1,
            email: 1,
            createdAt: 1,
            updatedAt: 1,
            // Show all fields for admin (but mask password)
            _id: 1,
            role: 1,
            password: { $concat: ["***", { $substr: ["$password", -3, 3] }] } // Show only last 3 chars
          }
        }
      ]
    });
    console.log('   ✅ admin_users view created');
    
    // Test the views
    console.log('\n🧪 Testing views...');
    
    const secureUsers = await db.collection('secure_users').find({}).toArray();
    console.log(`   ├─ secure_users: ${secureUsers.length} users`);
    if (secureUsers.length > 0) {
      console.log('   └─ Sample:', JSON.stringify(secureUsers[0], null, 2));
    }
    
    const passwordInfo = await db.collection('users_password_info').find({}).toArray();
    console.log(`   ├─ users_password_info: ${passwordInfo.length} users`);
    if (passwordInfo.length > 0) {
      console.log('   └─ Sample:', JSON.stringify(passwordInfo[0], null, 2));
    }
    
    const adminUsers = await db.collection('admin_users').find({}).toArray();
    console.log(`   ├─ admin_users: ${adminUsers.length} users`);
    if (adminUsers.length > 0) {
      console.log('   └─ Sample:', JSON.stringify(adminUsers[0], null, 2));
    }
    
    console.log('\n🎉 MongoDB Compass Security Setup Complete!');
    console.log('==========================================');
    console.log('\n📋 Available Views in MongoDB Compass:');
    console.log('   1. secure_users - No sensitive data');
    console.log('   2. users_password_info - Password metadata only');
    console.log('   3. admin_users - All data (password partially masked)');
    console.log('\n🔧 How to use in MongoDB Compass:');
    console.log('   1. Open MongoDB Compass');
    console.log('   2. Connect to your database');
    console.log('   3. Navigate to academicDB database');
    console.log('   4. Use the views instead of the users collection');
    console.log('\n⚠️  Security Notes:');
    console.log('   • Use secure_users for most operations');
    console.log('   • Use users_password_info to check password status');
    console.log('   • Use admin_users only for administrative tasks');
    console.log('   • Original users collection still exists with full data');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the setup
setupCompassSecurity();
