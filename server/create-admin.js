const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Get or create admin role
    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      console.log('Creating admin role...');
      adminRole = await Role.create({
        name: 'admin',
        displayName: 'Administrator',
        description: 'System administrator with full access',
        hierarchy: 3,
        settings: {
          canManageStudents: true,
          canManageFaculty: true,
          canViewAllDepartments: true,
          canExportReports: true,
          canSendNotifications: true,
          canManageCourses: true,
          canViewAnalytics: true,
          canManageSystem: true
        }
      });
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new User({
      name: 'System Administrator',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: adminRole._id,
      department: 'Computer Science',
      semester: '8',
      rollNumber: 'ADMIN001'
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@gmail.com');
    console.log('🔑 Password: admin123');

    // Create faculty user
    let facultyRole = await Role.findOne({ name: 'faculty' });
    if (!facultyRole) {
      facultyRole = await Role.create({
        name: 'faculty',
        displayName: 'Faculty',
        description: 'Faculty member with teaching privileges',
        hierarchy: 1
      });
    }

    const facultySalt = await bcrypt.genSalt(10);
    const facultyHashedPassword = await bcrypt.hash('faculty123', facultySalt);

    const faculty = new User({
      name: 'John Faculty',
      email: 'faculty@gmail.com',
      password: facultyHashedPassword,
      role: facultyRole._id,
      department: 'Computer Science',
      semester: '8',
      rollNumber: 'FAC001'
    });

    await faculty.save();
    console.log('✅ Faculty user created successfully!');
    console.log('📧 Email: faculty@gmail.com');
    console.log('🔑 Password: faculty123');

    // Create student user
    let studentRole = await Role.findOne({ name: 'student' });
    if (!studentRole) {
      studentRole = await Role.create({
        name: 'student',
        displayName: 'Student',
        description: 'Regular student with basic access',
        hierarchy: 0
      });
    }

    const studentSalt = await bcrypt.genSalt(10);
    const studentHashedPassword = await bcrypt.hash('student123', studentSalt);

    const student = new User({
      name: 'Jane Student',
      email: 'student@gmail.com',
      password: studentHashedPassword,
      role: studentRole._id,
      department: 'Computer Science',
      semester: '4',
      rollNumber: 'STU001'
    });

    await student.save();
    console.log('✅ Student user created successfully!');
    console.log('📧 Email: student@gmail.com');
    console.log('🔑 Password: student123');

    console.log('\n🎉 All default users created successfully!');
    console.log('You can now login with any of these accounts.');

  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdmin();
