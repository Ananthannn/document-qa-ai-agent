import os
import re
import json
import fitz
import pytesseract
from pdf2image import convert_from_path
from typing import Optional, Tuple

class PDFReader:
    def __init__(self, file_path: str, chunk_size=500, tesseract_path: Optional[str] = None):
        if tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = tesseract_path

        self.file_path = file_path
        self.chunk_size = chunk_size

    @staticmethod
    def clean_text(text: str) -> str:
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]', '', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def read_text_only_pdf(self, file_path: str) -> Optional[str]:
        try:
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += self.clean_text(page.get_text()) + "\n"
            doc.close()
            return text if text.strip() else None
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return None

    def read_scanned_pdf(self, file_path: str, dpi: int = 300) -> Optional[str]:
        try:
            images = convert_from_path(file_path, dpi=dpi)
            text = ""
            for img in images:
                text += pytesseract.image_to_string(img) + "\n"
            return self.clean_text(text)
        except Exception as e:
            print(f"OCR failed: {e}")
            return None

    def read_pdf(self) -> Optional[str]:
        text = self.read_text_only_pdf(self.file_path)
        if text and len(text.strip()) > 10:
            return text
        return self.read_scanned_pdf(self.file_path)

    def chunk_text(self, text: str) -> list[str]:
        words = text.split()
        chunks = [' '.join(words[i:i + self.chunk_size]) for i in range(0, len(words), self.chunk_size)]
        return chunks

    def save_chunks_to_json(self, output_json="output.json"):
        text = self.read_pdf()
        if not text:
            print("No text extracted from PDF.")
            return

        chunks = self.chunk_text(text)
        file_name = os.path.basename(self.file_path)

        with open(output_json, "w", encoding="utf-8") as f:
            json.dump({file_name: chunks}, f, ensure_ascii=False, indent=2)

        print(f"Text chunks saved to {output_json}")

# Example usage:
# pdf_reader = PDFReader(r"samples\1809.04281v3_copy (1).pdf")
# pdf_reader.save_chunks_to_json()
