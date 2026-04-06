const axios = require('axios');

async function testAssignmentAPI() {
  try {
    console.log('🧪 Testing Assignment Creation API...\n');

    // First, login as admin to get token
    const loginResponse = await axios.post('http://localhost:5000/api/login', {
      email: 'admin@gmail.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');

    // Set up headers with authentication
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test assignment creation
    const assignmentData = {
      studentEmail: 'student@gmail.com',
      teacherEmail: 'faculty@gmail.com',
      department: 'Computer Science',
      assignmentType: 'student'
    };

    console.log('\n📤 Sending assignment request:', assignmentData);

    const response = await axios.post(
      'http://localhost:5000/api/admin/assignments',
      assignmentData,
      { headers }
    );

    console.log('\n✅ Assignment creation successful!');
    console.log('Response:', response.data);

  } catch (error) {
    console.error('\n❌ Assignment creation failed:');
    
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

testAssignmentAPI();
