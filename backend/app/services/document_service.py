import os
import time
from pathlib import Path
from typing import Dict, Any, List
import pypdf
import docx
from app.core.exceptions import FileProcessingException
from app.services.language_detection_service import language_detection_service
from app.services.ocr_service import ocr_service
from app.utils.text_cleaner import normalize_text
from app.core.logging import logger
from app.config import settings

class DocumentService:
    """Document text extraction engine supporting PDF, DOCX, and TXT."""

    def extract_text_from_pdf(self, file_path: str) -> Dict[str, Any]:
        extracted_pages = []
        is_scanned = False
        ocr_applied = False

        try:
            reader = pypdf.PdfReader(file_path)
            num_pages = len(reader.pages)

            for idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                page_text = normalize_text(page_text)
                
                # If page has very little/no text, check if scanned
                if len(page_text.strip()) < 30 and ocr_service.is_available():
                    # Attempt OCR on embedded images if available
                    for img_obj in page.images:
                        from PIL import Image
                        import io
                        try:
                            pil_img = Image.open(io.BytesIO(img_obj.data))
                            ocr_text = ocr_service.perform_ocr(pil_img)
                            if ocr_text:
                                page_text += "\n" + ocr_text
                                is_scanned = True
                                ocr_applied = True
                        except Exception:
                            pass

                extracted_pages.append(page_text)

            full_text = "\n\n".join(extracted_pages).strip()
            
            return {
                "text": full_text,
                "page_count": num_pages,
                "is_scanned": is_scanned,
                "ocr_applied": ocr_applied,
            }
        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
            raise FileProcessingException(f"Failed to read PDF file: {str(e)}")

    def extract_text_from_docx(self, file_path: str) -> Dict[str, Any]:
        try:
            doc = docx.Document(file_path)
            paragraphs = []
            
            for p in doc.paragraphs:
                if p.text.strip():
                    paragraphs.append(p.text.strip())

            # Also extract text inside tables
            for table in doc.tables:
                for row in table.rows:
                    row_texts = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                    if row_texts:
                        paragraphs.append(" | ".join(row_texts))

            full_text = "\n\n".join(paragraphs).strip()
            return {
                "text": full_text,
                "page_count": max(1, len(paragraphs) // 5),
                "is_scanned": False,
                "ocr_applied": False,
            }
        except Exception as e:
            logger.error(f"DOCX extraction error: {e}")
            raise FileProcessingException(f"Failed to read Word document: {str(e)}")

    def extract_text_from_txt(self, file_path: str) -> Dict[str, Any]:
        encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252"]
        content = None
        for enc in encodings:
            try:
                with open(file_path, "r", encoding=enc) as f:
                    content = f.read()
                    break
            except Exception:
                continue

        if content is None:
            raise FileProcessingException("Could not read text file with standard encodings.")

        normalized = normalize_text(content)
        return {
            "text": normalized,
            "page_count": max(1, len(normalized) // 2500),
            "is_scanned": False,
            "ocr_applied": False,
        }

    def process_document(self, file_path: str, original_filename: str) -> Dict[str, Any]:
        start_time = time.time()
        ext = Path(original_filename).suffix.lower()

        if ext == ".pdf":
            result = self.extract_text_from_pdf(file_path)
        elif ext == ".docx":
            result = self.extract_text_from_docx(file_path)
        elif ext == ".txt":
            result = self.extract_text_from_txt(file_path)
        else:
            raise FileProcessingException(f"Unsupported file type: {ext}")

        extracted_text = result["text"]
        detected_lang, _ = language_detection_service.detect_language(extracted_text)

        execution_time_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "file_name": original_filename,
            "file_type": ext,
            "page_count": result["page_count"],
            "char_count": len(extracted_text),
            "extracted_text": extracted_text,
            "is_scanned": result["is_scanned"],
            "ocr_applied": result["ocr_applied"],
            "language_hint": detected_lang,
            "execution_time_ms": execution_time_ms,
        }

    def export_text_as_file(self, text: str, format_type: str = "txt") -> str:
        """Exports translated/summarized document text as downloadable .txt or .docx."""
        file_id = f"export_{int(time.time())}_{os.urandom(4).hex()}"
        
        if format_type == "docx":
            filename = f"{file_id}.docx"
            out_path = settings.DOC_DIR / filename
            doc = docx.Document()
            for para in text.split("\n\n"):
                if para.strip():
                    doc.add_paragraph(para.strip())
            doc.save(str(out_path))
        else:
            filename = f"{file_id}.txt"
            out_path = settings.DOC_DIR / filename
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(text)

        return filename

document_service = DocumentService()
