const fetch = require('node-fetch').default || require('node-fetch');

async function testMarksEndpoint() {
  try {
    console.log('🔍 Testing /api/marks endpoint');
    console.log('==================================');
    
    // First login as SRU student
    console.log('\n🔑 Logging in as SRU student...');
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'sru@gmail.com',
        password: 'student123',
        role: 'student'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.token;
      console.log('✅ Login successful');
      
      // Now test the /api/marks endpoint
      console.log('\n📊 Testing /api/marks endpoint...');
      const marksResponse = await fetch('http://localhost:5000/api/marks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (marksResponse.ok) {
        const marks = await marksResponse.json();
        console.log('✅ /api/marks endpoint working!');
        console.log('📋 Records returned:', marks.length);
        
        if (marks.length > 0) {
          console.log('\n📈 Sample marks data:');
          marks.slice(0, 5).forEach((mark, index) => {
            console.log(`${index + 1}. ${mark.subject}: ${mark.marks}% (${mark.examType})`);
          });
          
          console.log('\n🎉 SUCCESS! The Marks section should now work in the frontend!');
          console.log('🌐 Test at: http://localhost:3000/login');
          console.log('📧 Email: sru@gmail.com');
          console.log('🔑 Password: student123');
        } else {
          console.log('❌ No marks returned');
        }
        
      } else {
        console.log('❌ /api/marks endpoint failed:', marksResponse.status);
        const errorText = await marksResponse.text();
        console.log('Error:', errorText);
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testMarksEndpoint();
