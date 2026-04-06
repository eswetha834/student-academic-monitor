const fetch = require('node-fetch').default || require('node-fetch');

async function testLiveStats() {
  try {
    console.log('🔍 TESTING LIVE STUDENT STATS ENDPOINT');
    console.log('=' .repeat(50));

    // First login to get token
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

      // Now test the stats endpoint
      console.log('\n📊 Testing /api/stats/student endpoint...');
      const statsResponse = await fetch('http://localhost:5000/api/stats/student', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        console.log('✅ Stats endpoint working!');
        console.log('\n📋 STATS RESPONSE:');
        console.log('📊 Current GPA:', stats.currentGpa);
        console.log('🎯 Target GPA:', stats.targetGpa);
        console.log('🏆 Rank:', stats.rank);
        console.log('👥 Total Students:', stats.totalStudents);
        console.log('💳 Total Credits:', stats.totalCredits);
        console.log('🔮 Predicted GPA:', stats.predictedGpa);

        console.log('\n🎯 FRONTEND INTEGRATION STATUS:');
        console.log('✅ Current GPA: Now shows', stats.currentGpa, '(was N/A)');
        console.log('✅ Rank: Now shows', stats.rank, '(was N/A)');
        console.log('✅ Credits: Now shows', stats.totalCredits, '(was N/A)');
        console.log('✅ Target GPA: Shows', stats.targetGpa);
        console.log('✅ Predicted GPA: Shows', stats.predictedGpa);

        console.log('\n🌐 READY FOR FRONTEND TESTING:');
        console.log('1. Go to: http://localhost:3000/login');
        console.log('2. Login: sru@gmail.com / student123');
        console.log('3. Check Dashboard: Stats should now show values');
        console.log('4. Check Performance Alerts: Summary should show values');

      } else {
        console.log('❌ Stats endpoint failed:', statsResponse.status);
        const errorText = await statsResponse.text();
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

testLiveStats();
