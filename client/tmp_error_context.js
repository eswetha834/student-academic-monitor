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
  if (err.pos != null) {
    const start = Math.max(0, err.pos - 80);
    const end = Math.min(code.length, err.pos + 80);
    console.log('context:', JSON.stringify(code.slice(start, end)));
    console.log('excerpt:', code.slice(start, end));
  }
  process.exit(1);
}
