const fs = require('fs');
const path = require('path');
const code = fs.readFileSync(path.resolve(__dirname, 'src/pages/Student.js'), 'utf8');
for (let idx = 0; idx >= 0 && idx < code.length; ) {
  idx = code.indexOf('`', idx);
  if (idx === -1) break;
  const pre = code.slice(Math.max(0, idx - 40), idx).replace(/\r?\n/g, '\\n');
  const post = code.slice(idx, idx + 80).replace(/\r?\n/g, '\\n');
  console.log('pos', idx, 'pre', pre, 'post', post);
  idx += 1;
}
