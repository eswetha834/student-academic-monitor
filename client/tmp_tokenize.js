const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const code = fs.readFileSync(path.resolve(__dirname, 'src/pages/Student.js'), 'utf8');
const tokens = [];
try {
  const tokenizer = parser.parse(code, { sourceType: 'module', plugins: ['jsx'], tokens: true });
  console.log('parsed ok with tokens:', tokenizer.tokens.length);
} catch (err) {
  console.error('parse error', err.toString());
  if (err.pos != null) {
    const start = Math.max(0, err.pos - 120);
    const end = Math.min(code.length, err.pos + 120);
    console.log('context excerpt:\n' + code.slice(start, end));
  }
}
