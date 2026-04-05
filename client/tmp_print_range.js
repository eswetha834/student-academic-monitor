const fs = require('fs');
const path = require('path');
const [start, end] = process.argv.slice(2).map(Number);
const lines = fs.readFileSync(path.resolve(__dirname, 'src/pages/Student.js'), 'utf8').split(/\r?\n/);
const s = Number.isInteger(start) ? start : 1;
const e = Number.isInteger(end) ? end : lines.length;
for (let i = s - 1; i < e; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
