const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/academic-monitor';

(async () => {
  try {
    await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for password migration.');

    const users = await User.find({}).select('+password');
    let migrated = 0;

    for (const user of users) {
      if (!user.password) continue;
      if (user.password.startsWith('$2')) continue; // already hashed

      const plaintext = user.password;
      const hash = await bcrypt.hash(plaintext, 10);
      user.password = hash;
      await user.save();
      migrated++;
      console.log(`Migrated user ${user.email} to bcrypt hashed password.`);
    }

    console.log(`Migration complete. Total migrated users: ${migrated}`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
})();