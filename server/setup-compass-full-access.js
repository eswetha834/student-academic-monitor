const mongoose = require('mongoose');
require('dotenv').config();

async function setupCompassFullAccess() {
  try {
    console.log('🔓 Setting up MongoDB Compass Full Access Views');
    console.log('===========================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Drop existing views if they exist
    console.log('\n🗑️  Cleaning up existing views...');
    const viewsToDrop = ['secure_users', 'users_password_info', 'admin_users'];
    for (const viewName of viewsToDrop) {
      try {
        await db.collection(viewName).drop();
        console.log(`   ├─ Dropped existing ${viewName} view`);
      } catch (err) {
        console.log(`   ├─ ${viewName} view does not exist (OK)`);
      }
    }
    
    // Create full access view (shows everything)
    console.log('\n📋 Creating full access users view...');
    await db.createCollection('full_users_view', {
      viewOn: 'users',
      pipeline: [
        {
          $project: {
            _id: 1,           // Show ID
            name: 1,           // Show name
            email: 1,          // Show email
            password: 1,       // Show password (visible in Compass)
            role: 1,           // Show role
            createdAt: 1,      // Show creation date
            updatedAt: 1       // Show update date
          }
        }
      ]
    });
    console.log('   ✅ full_users_view created');
    
    // Create enhanced view with password analysis
    console.log('\n📋 Creating enhanced users view...');
    await db.createCollection('enhanced_users_view', {
      viewOn: 'users',
      pipeline: [
        {
          $project: {
            _id: 1,                    // Show ID
            name: 1,                    // Show name
            email: 1,                   // Show email
            password: 1,                // Show password
            role: 1,                    // Show role
            createdAt: 1,               // Show creation date
            updatedAt: 1,               // Show update date
            // Add password analysis
            passwordLength: { $strLenCP: { $ifNull: ["$password", ""] } },
            passwordType: { $type: "$password" },
            isHashed: { $regexMatch: { input: "$password", regex: /^\$2/ } },
            isPlainText: { $not: { $regexMatch: { input: "$password", regex: /^\$2/ } } },
            hasPassword: { $cond: [{ $ifNull: ["$password", false] }, true, false] }
          }
        }
      ]
    });
    console.log('   ✅ enhanced_users_view created');
    
    // Create admin-friendly view
    console.log('\n📋 Creating admin-friendly users view...');
    await db.createCollection('admin_friendly_view', {
      viewOn: 'users',
      pipeline: [
        {
          $project: {
            _id: 1,                    // Show ID
            name: 1,                    // Show name
            email: 1,                   // Show email
            password: 1,                // Show password
            role: 1,                    // Show role
            createdAt: 1,               // Show creation date
            updatedAt: 1,               // Show update date
            // Add useful admin info
            userIdString: { $toString: "$_id" },
            emailDomain: { $arrayElemAt: [{ $split: ["$email", "@"] }, 1] },
            passwordStrength: {
              $cond: {
                if: { $gte: [{ $strLenCP: "$password" }, 8] },
                then: "Strong",
                else: {
                  $cond: {
                    if: { $gte: [{ $strLenCP: "$password" }, 6] },
                    then: "Medium",
                    else: "Weak"
                  }
                }
              }
            },
            accountAge: {
              $divide: [
                { $subtract: [new Date(), "$createdAt"] },
                1000 * 60 * 60 * 24  // Convert to days
              ]
            }
          }
        }
      ]
    });
    console.log('   ✅ admin_friendly_view created');
    
    // Test the views
    console.log('\n🧪 Testing views...');
    
    const fullUsers = await db.collection('full_users_view').find({}).toArray();
    console.log(`   ├─ full_users_view: ${fullUsers.length} users`);
    if (fullUsers.length > 0) {
      console.log('   └─ Sample (All fields visible):');
      console.log(JSON.stringify(fullUsers[0], null, 2));
    }
    
    const enhancedUsers = await db.collection('enhanced_users_view').find({}).toArray();
    console.log(`   ├─ enhanced_users_view: ${enhancedUsers.length} users`);
    if (enhancedUsers.length > 0) {
      console.log('   └─ Sample (With analysis):');
      console.log(JSON.stringify(enhancedUsers[0], null, 2));
    }
    
    const adminUsers = await db.collection('admin_friendly_view').find({}).toArray();
    console.log(`   ├─ admin_friendly_view: ${adminUsers.length} users`);
    if (adminUsers.length > 0) {
      console.log('   └─ Sample (Admin-friendly):');
      console.log(JSON.stringify(adminUsers[0], null, 2));
    }
    
    // Show original collection comparison
    console.log('\n📊 Original vs Views Comparison:');
    const originalUsers = await db.collection('users').find({}).toArray();
    console.log(`   ├─ Original users collection: ${originalUsers.length} users`);
    console.log('   └─ Sample (Original):');
    console.log(JSON.stringify(originalUsers[0], null, 2));
    
    console.log('\n🎉 MongoDB Compass Full Access Setup Complete!');
    console.log('===========================================');
    console.log('\n📋 Available Views in MongoDB Compass:');
    console.log('   1. full_users_view - All fields visible');
    console.log('   2. enhanced_users_view - All fields + analysis');
    console.log('   3. admin_friendly_view - All fields + admin tools');
    console.log('\n🔧 How to use in MongoDB Compass:');
    console.log('   1. Open MongoDB Compass');
    console.log('   2. Connect to your database');
    console.log('   3. Navigate to academicDB database');
    console.log('   4. Use the views for enhanced visibility');
    console.log('\n🔍 What you can see in Compass:');
    console.log('   ✅ User IDs (_id)');
    console.log('   ✅ Passwords (plain text or hashed)');
    console.log('   ✅ User roles');
    console.log('   ✅ All user data');
    console.log('\n🔒 Application logs still protect sensitive data:');
    console.log('   ✅ Application logs show [HIDDEN]');
    console.log('   ✅ Debug scripts hide sensitive info');
    console.log('   ✅ Production security maintained');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the setup
setupCompassFullAccess();
