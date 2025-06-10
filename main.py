import os
import glob
from read_pdf import PDFReader
from vector_db import VectorDB
import ollama

def process_all_pdfs(folder_path):
    """Reads and chunks all PDFs in the folder."""
    pdf_files = glob.glob(os.path.join(folder_path, "*.pdf"))
    if not pdf_files:
        print("No PDF files found in the folder.")
        return False

    success = False
    for pdf_path in pdf_files:
        print(f"[+] Processing {pdf_path}")
        reader = PDFReader(file_path=pdf_path)
        reader.save_chunks_to_json(output_json="output.json")
        success = True

    return success


def create_or_update_vector_db():
    """Embeds all chunks and saves FAISS vector DB."""
    
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

    response = ollama.chat(model='llama3', messages=[
        {"role": "user", "content": prompt}
    ])
    return response['message']['content']

def main():
    pdf_folder = input("Enter the folder path containing PDFs: ").strip()
    if not os.path.isdir(pdf_folder):
        print("Invalid folder path. Exiting.")
        return

    if not process_all_pdfs(pdf_folder):
        print("No PDFs were processed. Exiting.")
        return

    create_or_update_vector_db()

    while True:
        query = input("\nEnter your question (or type 'exit' to quit): ")
        if query.lower() == 'exit':
            break

        if "how many pdf" in query.lower():
            with open("output.json", "r", encoding="utf-8") as f:
                data = json.load(f)
            print(f"\nThere are {len(data)} PDFs processed.\n")
            continue

        docs = search_relevant_docs(query, top_k=5)
        answer = ask_llm(query, docs)
        print("\nAnswer:\n", answer)


if __name__ == "__main__":
    main()
