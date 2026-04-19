#!/usr/bin/env node

const addRealisticMarks = require('./addRealisticMarks');

console.log('🎓 Academic Monitor - Random Marks Generator');
console.log('==========================================');
console.log('This script will generate realistic random marks for all students');
console.log('with different performance profiles and subject categories.\n');

// Run the marks generation
addRealisticMarks().then(() => {
  console.log('\n✨ Marks generation completed successfully!');
  console.log('📊 You can now check the faculty dashboard to see the generated marks.');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error during marks generation:', error);
  process.exit(1);
});
