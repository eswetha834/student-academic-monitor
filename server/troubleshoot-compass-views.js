const mongoose = require('mongoose');
require('dotenv').config();

async function troubleshootCompassViews() {
  try {
    console.log('🔍 MongoDB Compass Views Troubleshooting');
    console.log('=====================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // List all collections and views
    console.log('\n📋 All collections and views in academicDB:');
    const collections = await db.listCollections().toArray();
    
    collections.forEach((collection, index) => {
      const type = collection.type === 'view' ? 'VIEW' : 'COLLECTION';
      console.log(`${index + 1}. [${type}] ${collection.name}`);
    });
    
    // Check if our views exist
    console.log('\n🔍 Checking for our specific views:');
    const viewNames = ['full_users_view', 'enhanced_users_view', 'admin_friendly_view'];
    
    for (const viewName of viewNames) {
      const exists = collections.some(c => c.name === viewName);
      console.log(`   ├─ ${viewName}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
      
      if (exists) {
        // Test the view
        try {
          const count = await db.collection(viewName).countDocuments();
          console.log(`   └─ Records: ${count}`);
        } catch (err) {
          console.log(`   └─ Error: ${err.message}`);
        }
      }
    }
    
    // Check original users collection
    console.log('\n👥 Original users collection:');
    try {
      const userCount = await db.collection('users').countDocuments();
      console.log(`   ├─ Records: ${userCount}`);
      
      // Show sample user
      const sampleUser = await db.collection('users').findOne();
      if (sampleUser) {
        console.log('   └─ Sample user keys:', Object.keys(sampleUser));
      }
    } catch (err) {
      console.log(`   └─ Error: ${err.message}`);
    }
    
    // Recreate views if missing
    console.log('\n🔧 Recreating any missing views...');
    
    for (const viewName of viewNames) {
      const exists = collections.some(c => c.name === viewName);
      
      if (!exists) {
        console.log(`   ├─ Creating missing view: ${viewName}`);
        
        try {
          if (viewName === 'full_users_view') {
            await db.createCollection(viewName, {
              viewOn: 'users',
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    password: 1,
                    role: 1,
                    createdAt: 1,
                    updatedAt: 1
                  }
                }
              ]
            });
          } else if (viewName === 'enhanced_users_view') {
            await db.createCollection(viewName, {
              viewOn: 'users',
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    password: 1,
                    role: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    passwordLength: { $strLenCP: { $ifNull: ["$password", ""] } },
                    passwordType: { $type: "$password" },
                    isHashed: { $regexMatch: { input: "$password", regex: /^\$2/ } },
                    isPlainText: { $not: { $regexMatch: { input: "$password", regex: /^\$2/ } } },
                    hasPassword: { $cond: [{ $ifNull: ["$password", false] }, true, false] }
                  }
                }
              ]
            });
          } else if (viewName === 'admin_friendly_view') {
            await db.createCollection(viewName, {
              viewOn: 'users',
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    password: 1,
                    role: 1,
                    createdAt: 1,
                    updatedAt: 1,
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
                        1000 * 60 * 60 * 24
                      ]
                    }
                  }
                }
              ]
            });
          }
          
          console.log(`   └─ ✅ ${viewName} created successfully`);
        } catch (err) {
          console.log(`   └─ ❌ Error creating ${viewName}: ${err.message}`);
        }
      }
    }
    
    // Final verification
    console.log('\n🎯 Final verification:');
    const finalCollections = await db.listCollections().toArray();
    
    viewNames.forEach(viewName => {
      const exists = finalCollections.some(c => c.name === viewName);
      console.log(`   ├─ ${viewName}: ${exists ? '✅ READY' : '❌ STILL MISSING'}`);
    });
    
    console.log('\n🔧 MongoDB Compass Troubleshooting Tips:');
    console.log('==========================================');
    console.log('1. Refresh MongoDB Compass:');
    console.log('   - Click the refresh button (↻) in Compass');
    console.log('   - Or press F5 to refresh the connection');
    console.log('');
    console.log('2. Check connection:');
    console.log('   - Make sure you\'re connected to the correct database');
    console.log('   - Verify you\'re looking at "academicDB" database');
    console.log('');
    console.log('3. Look in the right place:');
    console.log('   - Views appear alongside collections in the left panel');
    console.log('   - They may have a different icon (👁️) than collections (📁)');
    console.log('');
    console.log('4. Check MongoDB Atlas version:');
    console.log('   - Views require MongoDB 3.4+');
    console.log('   - Atlas should support this automatically');
    console.log('');
    console.log('5. Alternative: Use original collection with projection:');
    console.log('   - In Compass, click on the original "users" collection');
    console.log('   - Click "Filter" and enter: {"password": 1, "role": 1, "_id": 1}');
    console.log('   - This will show all fields including sensitive data');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the troubleshooting
troubleshootCompassViews();
