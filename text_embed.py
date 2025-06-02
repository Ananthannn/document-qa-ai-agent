import os
import json
from sentence_transformers import SentenceTransformer

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

    # Helper to embed chunks
    def embed_chunks(chunks):
        return model.encode(chunks).tolist()

    # Process each key-value pair
    for key, value in list(data.items()):
        if isinstance(value, str):
            chunks = chunk_text(value)
            embeddings = embed_chunks(chunks)
            data[key] = embeddings  # Replace text with embeddings

    # Save JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
