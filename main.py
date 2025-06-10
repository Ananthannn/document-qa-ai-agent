import os
import glob
from read_pdf import PDFReader
from vector_db import VectorDB
import ollama

def process_all_pdfs(folder_path):
    """Reads and chunks all PDFs in the folder."""
    pdf_files = glob.glob(os.path.join(folder_path, "*.pdf"))
    for pdf_path in pdf_files:
        print(f"[+] Processing {pdf_path}")
        reader = PDFReader(file_path=pdf_path)
        reader.save_chunks_to_json(output_json="output.json")

def create_or_update_vector_db():
    """Embeds all chunks and saves FAISS vector DB."""
    print("[+] Creating/Updating vector database...")
    vector_db = VectorDB("output.json")
    vector_db.create_vector_db()
    print("[✓] Vector database created and saved.")

def search_relevant_docs(query, top_k=5):
    """Search top-K relevant chunks for the query."""
    vector_db = VectorDB("output.json")
    return vector_db.search_vector_db(query, top_k=top_k)

def ask_llm(query, docs):
    """Ask the LLM using retrieved docs as context."""
    context = ""
    sources = set()

    for doc in docs:
        context += f"[Source: {doc.metadata.get('source', 'unknown')}]\n{doc.page_content}\n\n"
        sources.add(doc.metadata.get("source", "unknown"))

    source_summary = f"The following documents were retrieved from {len(sources)} PDFs: {', '.join(sources)}.\n\n"
    prompt = source_summary + "Use the following context to answer the question:\n" + context + f"\nQuestion: {query}"

    print("[+] Generating answer using LLM...")
    response = ollama.chat(model='llama3', messages=[
        {"role": "user", "content": prompt}
    ])
    return response['message']['content']

def main():
    pdf_folder = "pdfs"
    process_all_pdfs(pdf_folder)
    create_or_update_vector_db()

    while True:
        query = input("\nEnter your question (or type 'exit' to quit): ")
        if query.lower() == 'exit':
            break

        docs = search_relevant_docs(query, top_k=5)
        answer = ask_llm(query, docs)
        print("\n🧠 Answer:\n", answer)

if __name__ == "__main__":
    main()
