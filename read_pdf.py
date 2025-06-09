import os
import re
import json
import fitz
import pytesseract
from typing import Optional, Tuple
from pdf2image import convert_from_path

class PDFReader:
    def __init__(self, file_path: str, tesseract_path: str = None):
        
        if tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = tesseract_path
        
        self.file_path = file_path
        
        file_name, text = self.read_pdf(file_path)
        file_name = os.path.basename(file_name)
        with open("output.json", "w") as f:
            json.dump({file_name: text}, f, indent=2)

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
                page_text = page.get_text()
                text += self.clean_text(page_text) + "\n"
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

    def read_pdf(self, file_path: str) -> Tuple[str, Optional[str]]:
        
        text = self.read_text_only_pdf(file_path)
        if text and len(text.strip()) > 10:
            return (file_path, text)
        return (file_path, self.read_scanned_pdf(file_path))
    
    def save_text_in_json(self):
        file_name, text = self.read_pdf(self.file_path)
        file_name = os.path.basename(file_name)
        with open("output.json", "w") as f:
            json.dump({file_name: text}, f, indent=2)

# Example usage:
pdf_reader = PDFReader(r"C:\Users\vanan\OneDrive\Documents\projects\document-qa-ai-agent\samples\1809.04281v3_copy (1).pdf", tesseract_path="/usr/bin/tesseract")
pdf_reader.save_text_in_json()