const axios = require('axios');

async function testSimplifiedAssignment() {
  try {
    console.log('🧪 Testing Simplified Assignment Creation...\n');

    // Login as admin
    const loginResponse = await axios.post('http://localhost:5000/api/login', {
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');

    // Test simplified assignment creation (no assignmentType)
    const assignmentData = {
      studentEmail: 'student@gmail.com',
      teacherEmail: 'faculty@gmail.com',
      department: 'Computer Science'
    };

    console.log('\n📤 Sending simplified assignment request:', assignmentData);

    const response = await axios.post(
      'http://localhost:5000/api/admin/assignments',
      assignmentData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Simplified assignment creation successful!');
    console.log('Response:', response.data);

  } catch (error) {
    console.error('\n❌ Simplified assignment creation failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Request setup error:', error.message);
    }
  }
}

testSimplifiedAssignment();
