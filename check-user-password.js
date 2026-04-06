const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./server/models/User');

(async () => {
  try {
    const uri = process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB:', uri);

    const email = 'sru@gmail.com'; // change to your user email
    const candidatePassword = 'your-password-here'; // change to the password you enter on login

    const user = await User.findOne({ email }).lean();
    if (!user) {
      console.log('User not found:', email);
      process.exit(0);
    }

    console.log('User found:');
    console.log({
      email: user.email,
      role: user.role,
      classTeacherEmail: user.classTeacherEmail,
      department: user.department,
      semester: user.semester,
      passwordHash: user.password,
    });

    const match = await bcrypt.compare(candidatePassword, user.password);
    console.log('Password match for', candidatePassword, ':', match);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
})();