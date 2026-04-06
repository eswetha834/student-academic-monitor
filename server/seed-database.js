const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seedDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create test users
    const testUsers = [
      {
        name: 'System Administrator',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'admin',
        department: 'Computer Science'
      },
      {
        name: 'John Faculty',
        email: 'faculty@gmail.com',
        password: 'faculty123',
        role: 'faculty',
        department: 'Computer Science'
      },
      {
        name: 'Jane Student',
        email: 'student@gmail.com',
        password: 'student123',
        role: 'student',
        department: 'Computer Science',
        rollNumber: 'CS2024001',
        semester: '4'
      },
      {
        name: 'Alice Teacher',
        email: 'teacher@gmail.com',
        password: 'teacher123',
        role: 'teacher',
        department: 'Computer Science'
      },
      {
        name: 'Bob Student',
        email: 'bob@student.com',
        password: 'student123',
        role: 'student',
        department: 'Computer Science',
        rollNumber: 'CS2024002',
        semester: '4'
      },
      {
        name: 'Charlie Student',
        email: 'charlie@student.com',
        password: 'student123',
        role: 'student',
        department: 'Information Technology',
        rollNumber: 'IT2024001',
        semester: '3'
      }
    ];

    // Hash passwords and create users
    const createdUsers = [];
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.name} (${user.email}) - Role: ${user.role}`);
    }

    console.log(`\n🎉 Database seeded successfully with ${createdUsers.length} users!`);
    
    // Verify users were created
    const studentCount = await User.countDocuments({ role: 'student' });
    const teacherCount = await User.countDocuments({ role: { $in: ['faculty', 'teacher'] } });
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    console.log(`\n📊 User Summary:`);
    console.log(`- Students: ${studentCount}`);
    console.log(`- Teachers/Faculty: ${teacherCount}`);
    console.log(`- Admins: ${adminCount}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
