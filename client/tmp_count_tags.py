from pathlib import Path
import re
p = Path('src/pages/Student.js')
text = p.read_text(encoding='utf-8').splitlines()
lines = text[751:982]
section = '\n'.join(lines)
opens = len(re.findall(r'<div(?:\s|>)', section))
closes = len(re.findall(r'</div>', section))
print('div opens', opens, 'closes', closes)
# count other tags? maybe the outer root is not <div>
for tag in ['p','button','span','table','tbody','tr','td','h3','h2','h1','AreaChart','ResponsiveContainer','CartesianGrid','XAxis','YAxis','Tooltip','Area','Quote','Bell']:
    print(tag, len(re.findall(fr'<{tag}(?:\s|>)', section)), len(re.findall(fr'</{tag}>', section)))
