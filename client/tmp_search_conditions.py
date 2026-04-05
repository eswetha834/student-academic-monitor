from pathlib import Path
text = Path('src/pages/Student.js').read_text(encoding='utf-8').splitlines()
for i, line in enumerate(text[750:982], start=751):
    if '&& (' in line or '&& <' in line or '&&(' in line or '&&<' in line:
        print(i, repr(line))
