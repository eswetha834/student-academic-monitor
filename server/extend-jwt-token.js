const fs = require('fs');
const path = require('path');

console.log('🔑 Extending JWT Token Expiration Time');
console.log('====================================');

// Read the server.js file
const serverPath = path.join(__dirname, 'server.js');
let serverContent = fs.readFileSync(serverPath, 'utf8');

// Find the JWT token expiration line
const jwtLines = serverContent.split('\n');
let modified = false;

for (let i = 0; i < jwtLines.length; i++) {
  const line = jwtLines[i];
  
  // Look for JWT expiration settings
  if (line.includes('expiresIn') && line.includes('24h')) {
    // Change from 24h to 7 days (168h)
    jwtLines[i] = line.replace('24h', '168h');
    modified = true;
    console.log('✅ Found JWT expiration line, extending from 24h to 168h (7 days)');
    break;
  }
  
  // Look for alternative JWT expiration format
  if (line.includes('expiresIn') && line.includes('24')) {
    jwtLines[i] = line.replace('24', '168');
    modified = true;
    console.log('✅ Found JWT expiration line, extending from 24 to 168 (7 days)');
    break;
  }
}

if (modified) {
  // Write the modified content back
  fs.writeFileSync(serverPath, jwtLines.join('\n'));
  console.log('✅ JWT token expiration extended to 7 days');
  console.log('🚀 Server needs to be restarted to apply changes');
  console.log('📋 New token will last 7 days instead of 24 hours');
} else {
  console.log('❌ JWT expiration line not found in expected format');
  console.log('🔍 Manual fix: Look for expiresIn in server.js and change to "7d" or "168h"');
}

console.log('\n🎯 Alternative Solution:');
console.log('==================');
console.log('1. Stop current server (Ctrl+C)');
console.log('2. Clear browser cache and storage');
console.log('3. Restart server: npm start');
console.log('4. Re-login to admin dashboard');
console.log('5. Fresh token will be generated with extended expiration');
