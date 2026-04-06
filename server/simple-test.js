const mongoose = require('mongoose');
require('dotenv').config();

async function simpleTest() {
  try {
    console.log('🧪 Simple Teachers Endpoint Test');
    console.log('==================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    // Test teachers endpoint
    console.log('\n📊 Testing: GET /api/admin/teachers');
    const response = await fetch('http://localhost:5000/api/admin/teachers', {
      headers: {
        'Authorization': 'Bearer fake-token-for-test',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const teachers = await response.json();
      console.log(`✅ Success! Found ${teachers.length} teachers`);
      console.log('📋 First 3 teachers:');
      teachers.slice(0, 3).forEach((teacher, index) => {
        console.log(`   ${index + 1}. ${teacher.name} (${teacher.email})`);
      });
    } else {
      console.log('❌ Failed:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

simpleTest();
