from pathlib import Path
text = Path('src/pages/Student.js').read_text(encoding='utf-8').splitlines()
for i in range(900, 981):
    if i < len(text):
        print(f'{i+1:4d}: {text[i]}')
