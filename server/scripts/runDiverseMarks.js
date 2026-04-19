#!/usr/bin/env node

const createDiverseMarks = require('./createDiverseMarks');

console.log('🎓 Academic Monitor - Diverse Marks Generator');
console.log('==============================================');
console.log('This script will create:');
console.log('• Tamil students with unique names');
console.log('• Different performance profiles for each student');
console.log('• Varied marks across subjects');
console.log('• Assignment to teacher Elango');
console.log('• Realistic performance patterns\n');

// Run the diverse marks creation
createDiverseMarks().then(() => {
  console.log('\n✨ Diverse marks data created successfully!');
  console.log('📊 Each student now has unique performance patterns');
  console.log('👥 Tamil students assigned to teacher Elango');
  console.log('📈 Check faculty dashboard to see the variation!');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Error during diverse marks creation:', error);
  process.exit(1);
});
