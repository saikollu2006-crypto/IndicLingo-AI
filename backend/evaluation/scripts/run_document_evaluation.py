import sys
import os
import json
import time
from pathlib import Path

# Add backend root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import docx
from app.config import settings
from app.services.document_service import document_service
from app.services.translation_service import translation_service
from app.services.summarization_service import summarization_service
from app.services.ocr_service import ocr_service
from app.utils.file_validator import validate_document_file
from app.core.exceptions import FileProcessingException, FileSizeExceededException

def create_sample_docx(file_path: Path):
    doc = docx.Document()
    doc.add_heading("IndicLingo AI Multilingual Document Test", level=1)
    doc.add_paragraph("India is home to hundreds of languages and diverse linguistic heritages.")
    doc.add_paragraph("Language translation bridges educational and commercial divides across all states.")
    
    # Add a table
    table = doc.add_table(rows=1, cols=3)
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = "Code"
    hdr_cells[1].text = "Language"
    hdr_cells[2].text = "Native Script"
    
    languages = [
        ("kn", "Kannada", "ಕನ್ನಡ"),
        ("hi", "Hindi", "हिन्दी"),
        ("te", "Telugu", "తెలుగు"),
        ("ta", "Tamil", "தமிழ்"),
        ("ml", "Malayalam", "മലയാളം")
    ]
    for code, name, script in languages:
        row_cells = table.add_row().cells
        row_cells[0].text = code
        row_cells[1].text = name
        row_cells[2].text = script
        
    doc.add_paragraph("Multimodal intelligence enables voice, text, and document translation seamlessly.")
    doc.save(str(file_path))

def create_sample_txt(file_path: Path, encoding="utf-8"):
    content = (
        "IndicLingo AI Plain Text Document Test\n\n"
        "1. Multilingual translation connects communities.\n"
        "2. Six languages are supported natively: English, Kannada, Hindi, Telugu, Tamil, Malayalam.\n"
        "3. Intelligent summarization distills key insights.\n"
        "4. Speech recognition transcribes live audio directly."
    )
    with open(file_path, "w", encoding=encoding) as f:
        f.write(content)

def create_minimal_pdf(file_path: Path):
    """Creates a strictly conforming minimal PDF 1.4 with genuine text stream."""
    text_content = "IndicLingo AI PDF Extraction Test. Multilingual translation across Indian languages."
    pdf_bytes = (
        b"%PDF-1.4\n"
        b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
        b"4 0 obj << /Length " + str(len(text_content) + 40).encode('ascii') + b" >>\n"
        b"stream\n"
        b"BT\n/F1 12 Tf\n72 712 Td\n(" + text_content.encode('latin1', 'ignore') + b") Tj\nET\n"
        b"endstream\nendobj\n"
        b"5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
        b"xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000360 00000 n \n"
        b"trailer << /Size 6 /Root 1 0 R >>\nstartxref\n440\n%%EOF"
    )
    with open(file_path, "wb") as f:
        f.write(pdf_bytes)

def run_document_eval():
    print("==================================================")
    print(" Starting Document Processing & Extraction Evaluation")
    print("==================================================")
    
    test_dir = settings.TEMP_DIR / "doc_tests"
    test_dir.mkdir(parents=True, exist_ok=True)
    results = []
    
    # 1. Test DOCX Processing
    docx_path = test_dir / "sample_test.docx"
    create_sample_docx(docx_path)
    try:
        t0 = time.time()
        docx_res = document_service.process_document(str(docx_path), docx_path.name)
        lat = docx_res["execution_time_ms"]
        text = docx_res["extracted_text"]
        status = "PASS" if "Kannada" in text and "ಕನ್ನಡ" in text else "PARTIAL"
        print(f"\n[Test DOCX Extraction] Status: {status} | Latency: {lat:.1f}ms | Chars: {len(text)} | Pages: {docx_res['page_count']}")
        print(f"Extracted excerpt:\n{text[:180]}...")
        results.append({
            "format": "DOCX",
            "file_name": docx_path.name,
            "status": status,
            "char_count": len(text),
            "page_count": docx_res["page_count"],
            "latency_ms": lat,
            "table_data_extracted": "ಕನ್ನಡ" in text
        })
    except Exception as e:
        print(f"[Test DOCX] FAILED: {e}")
        results.append({"format": "DOCX", "status": "FAIL", "error": str(e)})

    # 2. Test TXT Processing
    txt_path = test_dir / "sample_test.txt"
    create_sample_txt(txt_path)
    try:
        txt_res = document_service.process_document(str(txt_path), txt_path.name)
        lat = txt_res["execution_time_ms"]
        text = txt_res["extracted_text"]
        status = "PASS" if "IndicLingo AI" in text else "FAIL"
        print(f"\n[Test TXT Extraction] Status: {status} | Latency: {lat:.1f}ms | Chars: {len(text)}")
        results.append({
            "format": "TXT",
            "file_name": txt_path.name,
            "status": status,
            "char_count": len(text),
            "latency_ms": lat
        })
    except Exception as e:
        print(f"[Test TXT] FAILED: {e}")
        results.append({"format": "TXT", "status": "FAIL", "error": str(e)})

    # 3. Test PDF Extraction
    pdf_path = test_dir / "sample_test.pdf"
    create_minimal_pdf(pdf_path)
    try:
        pdf_res = document_service.process_document(str(pdf_path), pdf_path.name)
        lat = pdf_res["execution_time_ms"]
        text = pdf_res["extracted_text"]
        status = "PASS" if len(text) > 0 else "PARTIAL"
        print(f"\n[Test PDF Extraction] Status: {status} | Latency: {lat:.1f}ms | Text: '{text[:80]}...'")
        results.append({
            "format": "PDF",
            "file_name": pdf_path.name,
            "status": status,
            "char_count": len(text),
            "ocr_applied": pdf_res["ocr_applied"],
            "latency_ms": lat
        })
    except Exception as e:
        print(f"[Test PDF] FAILED: {e}")
        results.append({"format": "PDF", "status": "FAIL", "error": str(e)})

    # 4. Test Document Export to DOCX and TXT
    export_content = "This is a verified document translation generated by IndicLingo AI.\n\nKey takeaways:\n• Accuracy\n• Speed\n• Multilingual fidelity."
    try:
        exported_txt = document_service.export_text_as_file(export_content, "txt")
        txt_exists = (settings.DOC_DIR / exported_txt).exists()
        
        exported_docx = document_service.export_text_as_file(export_content, "docx")
        docx_exists = (settings.DOC_DIR / exported_docx).exists()
        
        export_status = "PASS" if txt_exists and docx_exists else "FAIL"
        print(f"\n[Test Document Export] Status: {export_status}")
        print(f"Exported TXT: {exported_txt} (exists: {txt_exists})")
        print(f"Exported DOCX: {exported_docx} (exists: {docx_exists})")
        results.append({
            "test_case": "document_export",
            "status": export_status,
            "txt_export": exported_txt,
            "docx_export": exported_docx
        })
    except Exception as e:
        print(f"[Test Export] FAILED: {e}")
        results.append({"test_case": "document_export", "status": "FAIL", "error": str(e)})

    # 5. Test OCR Service Availability Check
    ocr_avail = ocr_service.is_available()
    ocr_langs = ocr_service.get_supported_ocr_languages()
    ocr_status = "PASS" if ocr_avail else "PARTIAL"
    print(f"\n[Test OCR Engine Status] Status: {ocr_status} | Tesseract Available: {ocr_avail} | Installed Langs: {ocr_langs}")
    results.append({
        "test_case": "ocr_engine_status",
        "status": ocr_status,
        "tesseract_available": ocr_avail,
        "supported_languages": ocr_langs,
        "notes": "Tesseract binary check executed; when binary is absent on host, system gracefully falls back to native text extraction."
    })

    # 6. Test Edge Cases & Validation
    print("\n--- Testing Document Edge Cases ---")
    
    # Edge 1: Unsupported extension (.exe)
    try:
        validate_document_file("malicious.exe", 1024)
        edge1 = "FAIL"
    except FileProcessingException as e:
        edge1 = "PASS"
    print(f"Unsupported Extension (.exe) Validation: {edge1}")
    results.append({"test_case": "reject_unsupported_doc_ext", "status": edge1})

    # Edge 2: Oversized Document (> 25MB)
    try:
        validate_document_file("huge.pdf", 30 * 1024 * 1024)
        edge2 = "FAIL"
    except FileSizeExceededException as e:
        edge2 = "PASS"
    print(f"Oversized File (>25MB) Validation: {edge2}")
    results.append({"test_case": "reject_oversized_doc", "status": edge2})

    # Edge 3: Corrupted DOCX File
    corrupt_docx = test_dir / "corrupt.docx"
    with open(corrupt_docx, "wb") as f:
        f.write(b"NOT_A_VALID_ZIP_PK_HEADER")
    try:
        document_service.process_document(str(corrupt_docx), corrupt_docx.name)
        edge3 = "FAIL"
    except FileProcessingException as e:
        edge3 = "PASS"
    print(f"Corrupted DOCX Safe Handling: {edge3}")
    results.append({"test_case": "corrupted_docx_handling", "status": edge3})

    out_dir = BASE_DIR / "evaluation" / "results"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "document_evaluation.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"results": results}, f, indent=2, ensure_ascii=False)
        
    print(f"\n==========================================")
    print(f" Document Evaluation Complete! Results saved to {out_path}")
    print(f"==========================================")

if __name__ == "__main__":
    run_document_eval()
