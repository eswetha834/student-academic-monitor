const mongoose = require('mongoose');
const User = require('./models/User');

async function checkRawUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');

    // Check raw user data without population
    const users = await User.find({});
    console.log('\n👥 Raw User Data:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
      console.log(`   Role (raw): "${user.role}" (type: ${typeof user.role})`);
      console.log(`   Department: ${user.department}`);
      console.log('');
    });

    // Check students specifically
    const students = await User.find({ role: 'student' });
    console.log(`\n🎓 Students found: ${students.length}`);
    students.forEach(student => {
      console.log(`- ${student.name} (${student.email})`);
    });

    // Check teachers specifically  
    const teachers = await User.find({ role: { $in: ['faculty', 'teacher', 'admin'] } });
    console.log(`\n👨‍🏫 Teachers found: ${teachers.length}`);
    teachers.forEach(teacher => {
      console.log(`- ${teacher.name} (${teacher.email}) - Role: "${teacher.role}"`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkRawUsers();
