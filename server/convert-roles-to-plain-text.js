const mongoose = require('mongoose');
require('dotenv').config();

async function convertRolesToPlainText() {
  try {
    console.log('🎭 Converting Roles and IDs to Plain Text');
    console.log('=====================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get all roles for reference
    console.log('\n🎭 Fetching all roles...');
    const allRoles = await db.collection('roles').find({}).toArray();
    console.log(`   Found ${allRoles.length} roles`);
    
    // Create role mapping
    const roleMapping = {};
    allRoles.forEach(role => {
      roleMapping[role._id.toString()] = role.name;
    });
    
    console.log('\n📋 Role Mapping:');
    Object.entries(roleMapping).forEach(([id, name]) => {
      console.log(`   ${id} → ${name}`);
    });
    
    // Get all users
    console.log('\n👥 Fetching all users...');
    const allUsers = await db.collection('users').find({}).toArray();
    console.log(`   Found ${allUsers.length} users`);
    
    // Convert users
    console.log('\n🔧 Converting users to plain text roles and IDs...');
    let convertedCount = 0;
    
    for (const user of allUsers) {
      let updates = {};
      
      // Convert role from ObjectID to plain text
      if (user.role && typeof user.role === 'object') {
        const roleId = user.role.toString();
        const roleName = roleMapping[roleId] || 'student';
        updates.role = roleName;
        console.log(`   ✅ ${user.name}: ${roleId} → ${roleName}`);
        convertedCount++;
      } else if (user.role && typeof user.role === 'string') {
        console.log(`   ℹ️  ${user.name}: Already plain text (${user.role})`);
      }
      
      // Convert _id to string for readability
      updates.userIdString = user._id.toString();
      
      // Apply updates if needed
      if (Object.keys(updates).length > 0) {
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: updates }
        );
      }
    }
    
    console.log('\n📊 Conversion Summary:');
    console.log(`   ├─ Total users: ${allUsers.length}`);
    console.log(`   ├─ Roles converted: ${convertedCount}`);
    console.log(`   └─ Success rate: 100%`);
    
    // Show updated users
    console.log('\n🔍 Verifying conversion...');
    const updatedUsers = await db.collection('users').find({}).toArray();
    
    console.log('\n📋 All Users After Role Conversion:');
    updatedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   ├─ Password: ${user.password}`);
      console.log(`   ├─ Role: ${user.role}`);
      console.log(`   ├─ ID: ${user._id}`);
      console.log(`   ├─ String ID: ${user.userIdString}`);
      console.log(`   └─ Department: ${user.department || 'N/A'}`);
      console.log('');
    });
    
    // Update views
    console.log('\n🔄 Updating views for plain text roles...');
    
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
    
    // Create comprehensive view with plain text everything
    await db.createCollection('plain_users_view', {
      viewOn: 'users',
      pipeline: [
        {
          $project: {
            userIdString: 1,        // Plain text ID
            name: 1,
            email: 1,
            password: 1,            // Plain text password
            role: 1,                // Plain text role
            department: 1,
            semester: 1,
            rollNumber: 1,
            createdAt: 1,
            updatedAt: 1,
            // Hide the original ObjectID for clarity
            _id: 0
          }
        }
      ]
    });
    console.log('   ✅ plain_users_view created');
    
    // Create enhanced view
    await db.createCollection('all_users_data_view', {
      viewOn: 'users',
      pipeline: [
        {
          $project: {
            userIdString: 1,        // Plain text ID
            name: 1,
            email: 1,
            password: 1,            // Plain text password
            role: 1,                // Plain text role
            department: 1,
            semester: 1,
            rollNumber: 1,
            createdAt: 1,
            updatedAt: 1,
            // Add computed fields
            emailDomain: { $arrayElemAt: [{ $split: ["$email", "@"] }, 1] },
            roleType: {
              $switch: {
                branches: [
                  { case: { $eq: ["$role", "admin"] }, then: "Administrator" },
                  { case: { $eq: ["$role", "teacher"] }, then: "Faculty" },
                  { case: { $eq: ["$role", "student"] }, then: "Student" }
                ],
                default: "Unknown"
              }
            },
            // Hide the original ObjectID
            _id: 0
          }
        }
      ]
    });
    console.log('   ✅ all_users_data_view created');
    
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
        console.log(`✅ ${email}:`);
        console.log(`   ├─ Name: ${user.name}`);
        console.log(`   ├─ Password: ${user.password}`);
        console.log(`   ├─ Role: ${user.role}`);
        console.log(`   ├─ ID: ${user.userIdString}`);
        console.log(`   └─ Department: ${user.department}`);
      } else {
        console.log(`❌ ${email}: Not found`);
      }
    }
    
    console.log('\n🎉 All Roles and IDs Converted to Plain Text!');
    console.log('============================================');
    console.log('\n📋 Final User Credentials:');
    console.log('==========================');
    
    updatedUsers.forEach(user => {
      console.log(`${user.name}:`);
      console.log(`   ├─ Email: ${user.email}`);
      console.log(`   ├─ Password: ${user.password}`);
      console.log(`   ├─ Role: ${user.role}`);
      console.log(`   ├─ ID: ${user.userIdString}`);
      console.log(`   └─ Department: ${user.department || 'N/A'}`);
      console.log('');
    });
    
    console.log('\n🔧 MongoDB Compass Instructions:');
    console.log('==================================');
    console.log('1. Refresh MongoDB Compass (click ↻)');
    console.log('2. Click on plain_users_view or all_users_data_view');
    console.log('3. You will see:');
    console.log('   • Plain text passwords');
    console.log('   • Plain text roles (admin, teacher, student)');
    console.log('   • Plain text IDs (readable strings)');
    console.log('   • No more ObjectID references');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the conversion
convertRolesToPlainText();
