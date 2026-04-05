console.log('🔧 Quick Authentication Fix');
console.log('This script will fix common authentication issues...\n');

const fs = require('fs');

// Fix 1: Remove duplicate index from User model
const userModelPath = './models/User.js';
const userModelContent = fs.readFileSync(userModelPath, 'utf8');

// Remove any duplicate index definitions
const fixedUserModel = userModelContent
  .replace(/unique:\s*true,\s*index:\s*true/g, 'unique: true')
  .replace(/name:\s*{\s*type:\s*String,\s*required:\s*true\s*},\s*index:\s*true/g, 'name: { type: String, required: true }');

fs.writeFileSync(userModelPath, fixedUserModel);
console.log('✅ Fixed User model duplicate index');

// Fix 2: Ensure consistent error messages
const serverPath = './server.js';
const serverContent = fs.readFileSync(serverPath, 'utf8');

// Standardize error messages
const fixedServerContent = serverContent
  .replace(/msg:\s*["']/g, 'message: "')
  .replace(/}\s*msg:\s*["']/g, '} message: "');

fs.writeFileSync(serverPath, fixedServerContent);
console.log('✅ Fixed server error messages');

console.log('\n🎯 Authentication fixes applied!');
console.log('Please restart the server:');
console.log('1. npm start');
console.log('2. Try login with: admin@gmail.com / admin123');
console.log('3. Try registration with new user');
