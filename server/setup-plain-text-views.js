const mongoose = require('mongoose');
require('dotenv').config();

async function setupPlainTextViews() {
  try {
    console.log('🔓 Setting up Plain Text Views for MongoDB Compass');
    console.log('==================================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Step 1: Update Google user to have plain text password
    console.log('\n🔧 Updating Google user to plain text password...');
    const result = await db.collection('users').updateOne(
      { email: 'google@gmail.com' },
      { $set: { password: 'student123' } }
    );
    
    if (result.matchedCount > 0) {
      console.log('   ✅ Google user password updated to plain text');
    } else {
      console.log('   ❌ Google user not found');
    }
    
    // Step 2: Update admin user to plain text password
    console.log('\n🔧 Updating Admin user to plain text password...');
    const adminResult = await db.collection('users').updateOne(
      { email: 'admin@gmail.com' },
      { $set: { password: 'admin123' } }
    );
    
    if (adminResult.matchedCount > 0) {
      console.log('   ✅ Admin user password updated to plain text');
    } else {
      console.log('   ❌ Admin user not found');
    }
    
    // Step 3: Drop existing views
    console.log('\n🗑️  Dropping existing views...');
    const viewsToDrop = ['full_users_view', 'enhanced_users_view', 'admin_friendly_view'];
    for (const viewName of viewsToDrop) {
      try {
        await db.collection(viewName).drop();
        console.log(`   ├─ Dropped ${viewName}`);
      } catch (err) {
        console.log(`   ├─ ${viewName} does not exist`);
      }
    }
    
    // Step 4: Create simple plain text view
    console.log('\n📋 Creating simple plain text view...');
    await db.createCollection('plain_users_view', {
      viewOn: 'users',
      pipeline: [
        {
          $project: {
            _id: 1,                    // Show ID
            name: 1,                    // Show name
            email: 1,                   // Show email
            password: 1,                // Show password (plain text)
            role: 1,                    // Show role
            department: 1,              // Show department
            semester: 1,                // Show semester
            rollNumber: 1,              // Show roll number
            createdAt: 1,               // Show creation date
            updatedAt: 1                // Show update date
          }
        }
      ]
    });
    console.log('   ✅ plain_users_view created');
    
    // Step 5: Create comprehensive view with all fields
    console.log('\n📋 Creating comprehensive view...');
    await db.createCollection('all_users_data_view', {
      viewOn: 'users',
      pipeline: [
        {
          $project: {
            _id: 1,                    // Show ID
            name: 1,                    // Show name
            email: 1,                   // Show email
            password: 1,                // Show password (plain text)
            role: 1,                    // Show role
            department: 1,              // Show department
            semester: 1,                // Show semester
            rollNumber: 1,              // Show roll number
            goals: 1,                   // Show goals
            badges: 1,                  // Show badges
            createdAt: 1,               // Show creation date
            updatedAt: 1,               // Show update date
            // Add computed fields
            userIdString: { $toString: "$_id" },
            emailDomain: { $arrayElemAt: [{ $split: ["$email", "@"] }, 1] },
            hasGoals: { $gt: [{ $size: { $ifNull: ["$goals", []] } }, 0] },
            hasBadges: { $gt: [{ $size: { $ifNull: ["$badges", []] } }, 0] }
          }
        }
      ]
    });
    console.log('   ✅ all_users_data_view created');
    
    // Step 6: Test the views
    console.log('\n🧪 Testing the views...');
    
    const plainUsers = await db.collection('plain_users_view').find({}).toArray();
    console.log(`   ├─ plain_users_view: ${plainUsers.length} users`);
    
    const allUsersData = await db.collection('all_users_data_view').find({}).toArray();
    console.log(`   ├─ all_users_data_view: ${allUsersData.length} users`);
    
    // Show sample data
    if (plainUsers.length > 0) {
      console.log('\n📋 Sample user data (Plain Text):');
      console.log(JSON.stringify(plainUsers[0], null, 2));
    }
    
    // Step 7: Verify Google user specifically
    console.log('\n🔍 Verifying Google user...');
    const googleUser = await db.collection('users').findOne({ email: 'google@gmail.com' });
    if (googleUser) {
      console.log('   ✅ Google user found:');
      console.log(`   ├─ Name: ${googleUser.name}`);
      console.log(`   ├─ Email: ${googleUser.email}`);
      console.log(`   ├─ Password: ${googleUser.password}`);
      console.log(`   ├─ Role: ${googleUser.role}`);
      console.log(`   ├─ ID: ${googleUser._id}`);
    }
    
    // Step 8: List all collections and views
    console.log('\n📋 All collections and views:');
    const collections = await db.listCollections().toArray();
    collections.forEach((collection, index) => {
      const type = collection.type === 'view' ? 'VIEW' : 'COLLECTION';
      console.log(`${index + 1}. [${type}] ${collection.name}`);
    });
    
    console.log('\n🎉 Plain Text Views Setup Complete!');
    console.log('==========================================');
    console.log('\n📋 Available Views in MongoDB Compass:');
    console.log('   1. plain_users_view - Simple view with all fields');
    console.log('   2. all_users_data_view - Comprehensive view with all data');
    console.log('\n🔧 How to use in MongoDB Compass:');
    console.log('   1. Open MongoDB Compass');
    console.log('   2. Connect to your database');
    console.log('   3. Navigate to academicDB database');
    console.log('   4. Look for 👁️ views (not 📁 collections)');
    console.log('   5. Click on plain_users_view or all_users_data_view');
    console.log('\n🔍 What you will see:');
    console.log('   ✅ User IDs (_id)');
    console.log('   ✅ Passwords (plain text: student123, admin123)');
    console.log('   ✅ User roles (student, admin)');
    console.log('   ✅ All other user data');
    console.log('\n🔄 If views don\'t appear:');
    console.log('   • Click refresh button (↻) in Compass');
    console.log('   • Press F5 to refresh');
    console.log('   • Close and reopen Compass');
    console.log('   • Use original users collection with filter');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the setup
setupPlainTextViews();
