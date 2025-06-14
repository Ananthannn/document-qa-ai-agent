from flask import Flask, request, jsonify
from flask_cors import CORS
from read_pdf import PDFReader
from vector_db import VectorDB
import ollama
import os
import uuid
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

UPLOAD_FOLDER = "uploaded_pdfs"
OUTPUT_JSON = "output.json"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/upload", methods=["POST"])
def upload_pdf():
    try:
        if 'pdf' not in request.files:
            return jsonify({"error": "No PDF file uploaded"}), 400

        file = request.files['pdf']
        if file.filename == '':
            return jsonify({"error": "Empty file name"}), 400
            
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "File must be a PDF"}), 400

        # Generate unique filename and save
        filename = f"{uuid.uuid4()}.pdf"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        # Process PDF
        reader = PDFReader(file_path)
        reader.save_chunks_to_json(OUTPUT_JSON)

        # Create vector database
        vector_db = VectorDB(OUTPUT_JSON)
        vector_db.create_vector_db()

        return jsonify({
            "message": "PDF processed successfully",
            "filename": filename
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/ask", methods=["POST"])
def ask_question():
    try:
        data = request.json
        if not data or "question" not in data:
            return jsonify({"error": "No question provided"}), 400

        question = data["question"]
        if not question.strip():
            return jsonify({"error": "Question cannot be empty"}), 400

        # Search vector database
        vector_db = VectorDB(OUTPUT_JSON)
        results = vector_db.search_vector_db(question)

        if not results:
            return jsonify({"answer": "I couldn't find relevant information to answer your question."}), 200

        # Build context from results
        context = "\n\n".join([doc.page_content for doc in results])

        # Create prompt and get response
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