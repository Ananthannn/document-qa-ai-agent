import os
import json
from sentence_transformers import SentenceTransformer
from read_pdf import PDFReader
def process_json_embeddings(json_path="output.json", chunk_size=500):
    if not os.path.exists(json_path):
        return

    # Load JSON
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Initialize model
    model = SentenceTransformer('all-MiniLM-L6-v2')

    # Helper to chunk text
    def chunk_text(text):
        words = text.split()
        return [' '.join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]

    # Helper to embed text or chunks
    def embed_text(text):
        chunks = chunk_text(text)
        embeddings = model.encode(chunks).tolist()
        return embeddings

    # Replace keys and values with embeddings
    embedded_data = {}

    for key, value in data.items():
        # Embed key
        embedded_key = embed_text(key)

        # Embed value
        if isinstance(value, str):
            embedded_value = embed_text(value)
        else:
            embedded_value = value  # If it's not a string, keep it as is

        # Store in new dict (use str(embedded_key) since keys must be strings)
        embedded_data[str(embedded_key)] = embedded_value

    # Save JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(embedded_data, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    PDFReader(r"C:\Users\vanan\OneDrive\Documents\projects\document-qa-ai-agent\samples\for_pdf_text_extraction.pdf", tesseract_path=r"C:\Program Files\Tesseract-OCR\tesseract.exe")
    process_json_embeddings("output.json")
