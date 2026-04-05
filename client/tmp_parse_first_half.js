const fs = require('fs');
const parser = require('@babel/parser');
const path = require('path');
const filePath = path.join(__dirname, 'src/pages/Student.js');
const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
const snippet = lines.slice(751, 935).join('\n');
const content = snippet.replace(/^\s*\{/, '').replace(/\}\s*$/, '');
const code = `const Test = () => (${content});`;
try {
  parser.parse(code, { sourceType:'module', plugins:['jsx'] });
  console.log('parsed first half');
} catch (err) {
  console.error('message:', err.message);
  console.error('loc:', err.loc);
  console.error('pos:', err.pos);
  console.error(code.slice(err.pos - 50, err.pos + 50));
}
