const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const filePath = path.resolve(__dirname, 'src/pages/Student.js');
const code = fs.readFileSync(filePath, 'utf8');
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log('parsed ok');
} catch (err) {
  console.error(err.toString());
  if (err.loc) console.error('line', err.loc.line, 'column', err.loc.column);
  process.exit(1);
}
