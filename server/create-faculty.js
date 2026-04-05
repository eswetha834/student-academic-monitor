const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();

async function createFaculty() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor');
    console.log('Connected to MongoDB');

    // Get faculty role
    const facultyRole = await Role.findOne({ name: 'faculty' });
    if (!facultyRole) {
      console.log('Faculty role not found. Please run create-admin.js first.');
      process.exit(1);
    }

    const sampleFaculty = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        password: await bcrypt.hash('faculty123', await bcrypt.genSalt(10)),
        role: facultyRole._id,
        department: 'Computer Science',
        semester: '8',
        rollNumber: 'FAC001'
      },
      {
        name: 'Prof. Michael Chen',
        email: 'michael.chen@university.edu',
        password: await bcrypt.hash('faculty123', await bcrypt.genSalt(10)),
        role: facultyRole._id,
        department: 'Mathematics',
        semester: '8',
        rollNumber: 'FAC002'
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@university.edu',
        password: await bcrypt.hash('faculty123', await bcrypt.genSalt(10)),
        role: facultyRole._id,
        department: 'Physics',
        semester: '8',
        rollNumber: 'FAC003'
      },
      {
        name: 'Prof. David Kim',
        email: 'david.kim@university.edu',
        password: await bcrypt.hash('faculty123', await bcrypt.genSalt(10)),
        role: facultyRole._id,
        department: 'Chemistry',
        semester: '8',
        rollNumber: 'FAC004'
      },
      {
        name: 'Dr. Lisa Anderson',
        email: 'lisa.anderson@university.edu',
        password: await bcrypt.hash('faculty123', await bcrypt.genSalt(10)),
        role: facultyRole._id,
        department: 'Biology',
        semester: '8',
        rollNumber: 'FAC005'
      }
    ];

    console.log('Creating faculty members...');
    for (const faculty of sampleFaculty) {
      const existing = await User.findOne({ email: faculty.email });
      if (existing) {
        console.log(`✅ ${faculty.name} already exists`);
      } else {
        await User.create(faculty);
        console.log(`✅ Created ${faculty.name}`);
      }
    }

    console.log('\n🎉 Faculty members created successfully!');
    console.log('Login credentials for all faculty:');
    console.log('📧 Email: [faculty email]');
    console.log('🔑 Password: faculty123');

  } catch (error) {
    console.error('Error creating faculty:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createFaculty();
