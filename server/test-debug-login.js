const axios = require('axios');

async function testDebugLogin() {
  try {
    console.log('🧪 Testing Login with Debug...\n');

    const loginData = {
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin'
    };

    console.log('Sending login data:', loginData);

    const response = await axios.post('http://localhost:5000/api/login', loginData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Login SUCCESS:', response.data);

    // If login successful, test assignment creation
    if (response.data.token) {
      console.log('\n🔐 Testing assignment creation with token...');
      
      const assignmentData = {
        studentEmail: 'student@gmail.com',
        teacherEmail: 'faculty@gmail.com',
        department: 'Computer Science'
      };

      const assignmentResponse = await axios.post(
        'http://localhost:5000/api/admin/assignments',
        assignmentData,
        {
          headers: {
            'Authorization': `Bearer ${response.data.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('\n✅ Assignment creation:', assignmentResponse.data);
    }

  } catch (error) {
    console.error('\n❌ Login failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
      console.error('Full error:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Request setup error:', error.message);
    }
  }
}

testDebugLogin();
