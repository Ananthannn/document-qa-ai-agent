from flask import Flask, request, jsonify
from flask_cors import CORS
from read_pdf import PDFReader
from vector_db import VectorDB
import ollama
import os
import uuid
import json
import shutil

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploaded_pdfs"
VECTOR_DB_FOLDER = "vector_stores"
CURRENT_PDF_INFO = "current_pdf.json"

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(VECTOR_DB_FOLDER, exist_ok=True)

def clear_previous_data():
    """Clear all previous PDF data"""
    if os.path.exists(UPLOAD_FOLDER):
        shutil.rmtree(UPLOAD_FOLDER)
        os.makedirs(UPLOAD_FOLDER)
    
    if os.path.exists(VECTOR_DB_FOLDER):
        shutil.rmtree(VECTOR_DB_FOLDER)
        os.makedirs(VECTOR_DB_FOLDER)
    
    if os.path.exists(CURRENT_PDF_INFO):
        os.remove(CURRENT_PDF_INFO)

@app.route("/upload", methods=["POST"])
def upload_pdf():
    try:
        if 'pdf' not in request.files:
            return jsonify({"error": "No PDF file uploaded"}), 400

        # Clear previous data
        clear_previous_data()

        files = request.files.getlist('pdf')
        if not files:
            return jsonify({"error": "No files selected"}), 400

        processed_files = []
        output_json = os.path.join(VECTOR_DB_FOLDER, "current_data.json")

        for file in files:
            if not file.filename.lower().endswith('.pdf'):
                continue

            # Save uploaded file
            filename = f"{uuid.uuid4()}.pdf"
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)

            try:
                # Process PDF and save chunks with embeddings
                reader = PDFReader(file_path)
                reader.save_chunks_to_json(output_json)
                processed_files.append(filename)
            except Exception as e:
                print(f"Error processing {filename}: {e}")
                continue

        if not processed_files:
            return jsonify({"error": "No valid PDF files could be processed"}), 400

        # Create vector database from the saved JSON
        vector_db = VectorDB(output_json)
        vector_db.create_vector_db()

        # Save current PDF info
        with open(CURRENT_PDF_INFO, 'w') as f:
            json.dump({
                "files": processed_files,
                "vector_db": "current_data"
            }, f)

        return jsonify({
            "message": f"Successfully processed {len(processed_files)} PDF files",
            "files": processed_files
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/ask", methods=["POST"])
def ask_question():
    try:
        if not os.path.exists(CURRENT_PDF_INFO):
            return jsonify({"error": "Please upload PDF files first"}), 400

        data = request.json
        if not data or "question" not in data:
            return jsonify({"error": "No question provided"}), 400

        question = data["question"].strip()
        if not question:
            return jsonify({"error": "Question cannot be empty"}), 400

        # Get vector database path from current PDF info
        with open(CURRENT_PDF_INFO, 'r') as f:
            pdf_info = json.load(f)
        
        vector_db_path = os.path.join(VECTOR_DB_FOLDER, f"{pdf_info['vector_db']}.json")
        
        # Search for relevant content
        vector_db = VectorDB(vector_db_path)
        results = vector_db.search_vector_db(question)

        if not results:
            return jsonify({
                "answer": "I couldn't find relevant information to answer your question."
            }), 200

        # Prepare context from results
        context = "\n\n".join([doc.page_content for doc in results])
        
        # Generate response using ollama
        prompt = f"""Based on the following context, please answer the question. 
        If you cannot find the answer in the context, say so.

        Context:
        {context}

        Question: {question}"""

        response = ollama.chat(
            model="llama3", 
            messages=[{"role": "user", "content": prompt}]
        )

        return jsonify({"answer": response["message"]["content"]}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)