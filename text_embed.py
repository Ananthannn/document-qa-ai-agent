import os
import json
from sentence_transformers import SentenceTransformer

class JSONEmbedder:
    def __init__(self, input_json="output.json", output_json="output_2.json", chunk_size=500, model_name='all-MiniLM-L6-v2'):
        self.input_json = input_json
        self.output_json = output_json
        self.chunk_size = chunk_size
        self.model = SentenceTransformer(model_name)

    def chunk_text(self, text):
        """Split text into chunks of approximately chunk_size words"""
        words = text.split()
        return [' '.join(words[i:i + self.chunk_size]) for i in range(0, len(words), self.chunk_size)]

    def embed_text(self, text):
        """Embed text chunks using the sentence transformer model"""
        chunks = self.chunk_text(text)
        return self.model.encode(chunks).tolist()

    def process(self):
        """Process the JSON file and save embeddings to a new file"""
        if not os.path.exists(self.input_json):
            raise FileNotFoundError(f"Input file {self.input_json} not found.")
        
        # Create output directory if it doesn't exist
        output_dir = os.path.dirname(self.output_json)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)

        with open(self.input_json, "r", encoding="utf-8") as f:
            data = json.load(f)

        embedded_data = {}
        for key, value in data.items():
            if isinstance(value, str):
                print(f"Processing {key}...")
                embedded_value = self.embed_text(value)
            else:
                print(f"Skipping {key} (not a string value)")
                embedded_value = value  # Keep as is if not a string

            embedded_data[key] = embedded_value

        with open(self.output_json, "w", encoding="utf-8") as f:
            json.dump(embedded_data, f, ensure_ascii=False, indent=2)
        
        print(f"Embeddings saved to {self.output_json}")

embedder = JSONEmbedder(
        input_json="output.json",
        output_json="output_2.json",
        chunk_size=500,
        model_name='all-MiniLM-L6-v2'
    )
embedder.process()