from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document
from text_embed import MyEmbedder
import json

class VectorDB:
    def __init__(self, text_chunk_json="output.json"):
        self.text_chunk_json = text_chunk_json
        self.embedder = MyEmbedder()

    def load_text_chunks(self):
        with open(self.text_chunk_json, "r", encoding="utf-8") as f:
            data = json.load(f)

        documents = []
        for file_name, chunks in data.items():
            for chunk in chunks:
                documents.append(Document(page_content=chunk, metadata={"source": file_name}))

        return documents

    def create_vector_db(self):
        documents = self.load_text_chunks()
        db = FAISS.from_documents(documents, self.embedder)
        db.save_local("vector_db")

    def search_vector_db(self, query, top_k=5):
        db = FAISS.load_local("vector_db", self.embedder, allow_dangerous_deserialization=True)
        results = db.similarity_search(query, k=top_k)
        return results
    
# vector_db = VectorDB("output.json")
# vector_db.create_vector_db()
# results = vector_db.search_vector_db("what is skewing", top_k=5)
# print(results[0])

