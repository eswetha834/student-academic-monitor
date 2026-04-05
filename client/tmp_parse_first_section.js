const fs = require('fs');
const parser = require('@babel/parser');
const path = require('path');
const filePath = path.join(__dirname, 'src/pages/Student.js');
const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
const snippet = lines.slice(751, 851).join('\n');
const code = `const Test = () => (${snippet});`;
try {
  parser.parse(code, {sourceType:'module', plugins:['jsx']});
  console.log('parsed first section');
} catch (err) {
  console.error('message:', err.message);
  console.error('loc:', err.loc);
  console.error(code.slice(err.pos - 50, err.pos + 50));
}
