const path = require('path');
process.chdir(path.resolve(__dirname));
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const user = await User.findOne({ email: 'elango@gmail.com' }).select('+password');
    if (!user) {
      console.log('user not found');
      return;
    }

    console.log('user', {
      email: user.email,
      role: user.role,
      passwordHash: user.password,
      createdAt: user.createdAt,
    });

    const isMatch = await bcrypt.compare('teacher123', user.password);
    console.log('bcrypt compare teacher123:', isMatch);
    if (!isMatch && user.password === 'teacher123') {
      console.log('plain-text password match (fallback)');
    }

  } catch (err) {
    console.error('inspect error', err);
  } finally {
    await mongoose.disconnect();
  }
})();