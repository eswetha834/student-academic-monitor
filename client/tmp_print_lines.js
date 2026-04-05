const fs = require('fs');
const path = require('path');
const lines = fs.readFileSync(path.resolve(__dirname, 'src/pages/Student.js'), 'utf8').split(/\r?\n/);
for (let i = 969; i < 982; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
