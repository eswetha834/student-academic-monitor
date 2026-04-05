from pathlib import Path
p = Path('src/pages/Student.js')
text = p.read_text(encoding='utf-8')
lines = text.splitlines()
for i in range(967, 983):
    if i < len(lines):
        s = lines[i]
        print(f'{i+1}: {s!r}')
        print(' chars:', [hex(ord(c)) for c in s])
