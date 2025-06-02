import sys
import os
import fitz
import re
import pytesseract
from pdf2image import convert_from_path
import os
from typing import Optional

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

class PDFReader:
    def __init__(self, tesseract_path: str = None):
        if tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = tesseract_path

    @staticmethod
    def clean_text(text: str) -> str:
        """Remove non-printable characters and extra whitespace"""
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]', '', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def read_text_only_pdf(self, file_path: str) -> Optional[str]:
        """Extract text from searchable PDFs"""
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
        """OCR for image-based PDFs"""
        try:
            images = convert_from_path(file_path, dpi=dpi)
            text = ""
            for img in images:
                text += pytesseract.image_to_string(img) + "\n"
            return self.clean_text(text)
        except Exception as e:
            print(f"OCR failed: {e}")
            return None

    def read_pdf(self, file_path: str) -> Optional[str]:
        """Unified PDF reader with fallback to OCR"""
        text = self.read_text_only_pdf(file_path)
        if text and len(text.strip()) > 10:
            return text
        return self.read_scanned_pdf(file_path)