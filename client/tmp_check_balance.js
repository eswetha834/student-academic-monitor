const fs = require('fs');
const path = require('path');
const lines = fs.readFileSync(path.resolve(__dirname, 'src/pages/Student.js'), 'utf8').split(/\r?\n/);
const start = 742; const end = 982;
const counts = { '(':0, ')':0, '{':0, '}':0, '[':0, ']':0 };
for (let i = start - 1; i < end; i++) {
  const line = lines[i];
  for (const ch of line) {
    if (counts.hasOwnProperty(ch)) counts[ch] += 1;
  }
  if (i === 980) {
    console.log('line 981 raw:', line);
  }
}
console.log(counts);
