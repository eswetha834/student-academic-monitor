const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

(async () => {
  try {
    const uri = process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB:', uri);

    const email = 'elango@gmail.com'; // change to your user email
    const candidatePassword = 'teacher123'; // change to the password you enter on login

    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } }).lean();
    if (!user) {
      console.log('User not found using exact email, trying first 5 users...');
      const anyUsers = await User.find().limit(5).lean();
      console.log(anyUsers.map(u => ({ email: u.email, role: u.role, _id: u._id })));
      process.exit(0);
    }
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
      passwordHash: user.password
    });

    const match = await bcrypt.compare(candidatePassword, user.password);
    console.log('Password match for', candidatePassword, ':', match);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
})();