const fs = require('fs');
const parser = require('@babel/parser');
const path = require('path');
const filePath = path.join(__dirname, 'src/pages/Student.js');
const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
const snippet = lines.slice(751, 982).join('\n');
const content = snippet.replace(/^\s*\{/, '').replace(/\}\s*$/, '');
const code = `const Test = () => (${content});`;
const ast = parser.parse(code, {sourceType:'module', plugins:['jsx'], errorRecovery:true, tokens:true});
console.log('tokens count', ast.tokens.length);
const near = ast.tokens.slice(-20);
near.forEach((t, i) => console.log(i, t.type.label, t.value, t.start, t.end));
if (ast.errors && ast.errors.length) {
  console.log('errors', ast.errors.length);
  ast.errors.forEach((e, idx) => {
    console.log('err', idx, e.message, e.loc && e.loc.line, e.loc && e.loc.column);
  });
}
