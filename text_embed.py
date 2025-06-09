import os
import json
from sentence_transformers import SentenceTransformer

class JSONEmbedder:
    def __init__(self, input_json="output.json", output_json="output_embedded.json", model_name='all-MiniLM-L6-v2'):
        self.input_json = input_json
        self.output_json = output_json
        self.model = SentenceTransformer(model_name)

    def embed_chunks(self, chunks):
        """Embed a list of text chunks and return list of embeddings."""
        embeddings = self.model.encode(chunks)
        # Convert numpy arrays to list for JSON serialization
        return [emb.tolist() for emb in embeddings]

    def process(self):
        if not os.path.exists(self.input_json):
            raise FileNotFoundError(f"Input file {self.input_json} not found.")

        with open(self.input_json, "r", encoding="utf-8") as f:
            data = json.load(f)

        embedded_data = {}
        for pdf_name, chunks in data.items():
            if not isinstance(chunks, list):
                print(f"Skipping {pdf_name}, expected list of text chunks.")
                continue
            print(f"Embedding chunks for {pdf_name} ...")
            embedded_chunks = self.embed_chunks(chunks)
            embedded_data[pdf_name] = embedded_chunks

        with open(self.output_json, "w", encoding="utf-8") as f:
            json.dump(embedded_data, f, ensure_ascii=False, indent=2)

        print(f"Embeddings saved to {self.output_json}")

# Example usage:
# embedder = JSONEmbedder(input_json="output.json", output_json="output_embedded.json")
# embedder.process()
