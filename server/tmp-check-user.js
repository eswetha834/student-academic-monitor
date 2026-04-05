const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
require('dotenv').config();
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/academic-monitor');
    const u = await User.findOne({ email: 'google@gmail.com' }).populate('role');
    console.log('user', u ? u.toObject() : 'not found');
    if (u) {
      const r = await Role.findOne({ name: u.role?.name });
      console.log('role doc', r ? r.toObject() : 'not found');
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
})();
