from pypdf import PdfReader

reader = PdfReader("/Users/gus0803/Downloads/PROGRESIÓN DE CONTENIDOS 2025.pdf")
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

with open("src/lib/progrecion.txt", "w", encoding="utf-8") as f:
    f.write(text)

print(f"Extracted {len(text)} characters.")
