from pathlib import Path
text = Path('src/pages/Student.js').read_text(encoding='utf-8').splitlines()
lines = text[751:982]
for i, line in enumerate(lines[220:235], start=221):
    print(f'{i}: {line}')
