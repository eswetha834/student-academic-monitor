const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const lines = fs.readFileSync(path.resolve(__dirname, 'src/pages/Student.js'), 'utf8').split(/\r?\n/);
const endLine = Number(process.argv[2]) || 228;
const snippet = lines.slice(752, 980).join('\n');
const snippetLines = snippet.split(/\r?\n/);
const code = `const x = (${snippetLines.slice(0, endLine).join('\n')});`;
for (let i = endLine - 5; i <= endLine + 5 && i <= snippetLines.length; i++) {
  console.log(`${i}: ${snippetLines[i - 1]}`);
}
console.log('--- parsing up to line', endLine, '---');
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log('snippet parsed ok');
} catch (err) {
  console.error(err.toString());
  if (err.loc) console.error('line', err.loc.line, 'column', err.loc.column);
  process.exit(1);
}
