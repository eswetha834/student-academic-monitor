const fs = require('fs');
const lines = fs.readFileSync('src/pages/Student.js', 'utf8').split('\n');
let start = -1;
let end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{activeTab === "Dashboard" && (')) start = i;
  if (lines[i].includes('{activeTab === "Goal Tracker" && (')) { end = i; break; }
}
if (start === -1 || end === -1) {
  console.error('Could not locate section boundaries');
  process.exit(1);
}
const section = lines.slice(start, end);
let stack = [];
section.forEach((line, idx) => {
  const lineNumber = start + idx + 1;
  const opens = (line.match(/<div(?![\w-])/g) || []).length;
  const closes = (line.match(/<\/div>/g) || []).length;
  for (let i = 0; i < opens; i++) stack.push(lineNumber);
  for (let i = 0; i < closes; i++) stack.pop();
  if (opens || closes) {
    console.log(`${lineNumber}: opens=${opens} closes=${closes} stack=${stack.length}`);
  }
});
console.log('final stack length', stack.length, 'top', stack[stack.length-1]);
