const fs = require('fs');
const parser = require('@babel/parser');
const path = require('path');
const filePath = path.join(__dirname, 'src/pages/Student.js');
const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
const start = 751;
const end = 982;
const snippetLines = lines.slice(start, end);
const slices = [20, 40, 60, 80, 100, 120, 140, 160, 180, 200];
const variants = [
  { name: 'original', lines: snippetLines },
  ...slices.map((n) => ({ name: `slice${n}`, lines: snippetLines.slice(0, n) })),
];
variants.forEach(({name, lines}) => {
  const snippet = lines.join('\n');
  const content = snippet.replace(/^\s*\{/, '').replace(/\}\s*$/, '');
  const code = `const Test = () => (${content});`;
  try {
    parser.parse(code, {sourceType:'module', plugins:['jsx']});
    console.log(name, 'parsed');
  } catch (err) {
    console.log(name, 'failed', err.message);
    if (err.loc) console.log(err.loc);
  }
});
