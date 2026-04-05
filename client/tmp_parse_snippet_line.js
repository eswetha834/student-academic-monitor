const fs = require('fs');
const parser = require('@babel/parser');
const path = require('path');
const filePath = path.join(__dirname, 'src/pages/Student.js');
const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
const snippet = lines.slice(751, 982).join('\n');
const content = snippet.replace(/^\s*\{/, '').replace(/\}\s*$/, '');
const code = `const Test = () => (${content});`;
try {
  parser.parse(code, {sourceType:'module', plugins:['jsx']});
  console.log('parsed successfully');
} catch (err) {
  console.error('message:', err.message);
  console.error('loc:', err.loc);
  console.error('pos:', err.pos);
  console.error('posLoc:', err.pos && code.slice(err.pos - 40, err.pos + 40));
  console.error('codeFrame:', err.codeFrame);
}
