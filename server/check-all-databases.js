const { MongoClient } = require('mongodb');

async function checkAllDatabases() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB server');
    
    // List all databases
    const admin = client.db().admin();
    const databases = await admin.listDatabases();
    
    console.log('\n🗄️ Available databases:');
    for (const db of databases.databases) {
      console.log(`- ${db.name} (size: ${db.sizeOnDisk} bytes)`);
      
      // Check if this database has users
      if (db.name.includes('academic') || db.name.includes('edu') || db.name === 'admin' || db.name === 'local') {
        const database = client.db(db.name);
        const collections = await database.listCollections().toArray();
        
        if (collections.find(c => c.name === 'users')) {
          const userCount = await database.collection('users').countDocuments();
          if (userCount > 0) {
            console.log(`  👥 ${db.name}.users: ${userCount} documents`);
            
            // Get sample users
            const sampleUsers = await database.collection('users').find({}).limit(2).toArray();
            sampleUsers.forEach(user => {
              console.log(`    - ${user.name} (${user.email}) - Role: ${user.role}`);
            });
          }
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkAllDatabases();
