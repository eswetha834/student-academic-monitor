const mongoose = require('mongoose');
require('dotenv').config();

async function debugAuthIssues() {
  try {
    console.log('🔍 Debugging Authentication Issues');
    console.log('==================================');
    
    // Connect to MongoDB
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Test admin login and check token generation
    console.log('\n🔑 Testing Admin Login and Token:');
    
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.token;
      console.log('✅ Login successful');
      console.log('🔑 Token:', token.substring(0, 50) + '...');
      
      // Test the token immediately
      console.log('\n📊 Testing Token Validity:');
      
      const testResponse = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (testResponse.ok) {
        console.log('✅ Token works immediately');
        console.log('📋 Stats response:', testResponse.status);
      } else {
        console.log('❌ Token failed immediately:', testResponse.status);
        const errorText = await testResponse.text();
        console.log('Error details:', errorText);
      }
      
      // Check JWT configuration
      console.log('\n🔧 JWT Configuration Check:');
      console.log('Server shows: Token expires in: 10h');
      console.log('But we set: expiresIn: 7d');
      console.log('Possible issue: Server not restarted with changes');
      
    } else {
      console.log('❌ Login failed:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('Error details:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugAuthIssues();
