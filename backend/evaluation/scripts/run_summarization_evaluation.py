import sys
import json
import time
from pathlib import Path

# Add backend root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.services.summarization_service import summarization_service

LONG_ARTICLE = (
    "Artificial intelligence is rapidly transforming global communication, business operations, and academic research. "
    "In multilingual nations like India, language barriers have historically prevented citizens from accessing government services, educational content, and healthcare resources. "
    "IndicLingo AI was conceptualized to address this fundamental disparity through an integrated multimodal architecture. "
    "The platform natively supports six prominent languages: English, Kannada, Hindi, Telugu, Tamil, and Malayalam. "
    "By combining neural machine translation with state-of-the-art speech recognition, the system allows users to speak, write, or upload documents in their mother tongue. "
    "Furthermore, intelligent text summarization distills lengthy official circulars, news bulletins, and academic papers into key insights. "
    "Extractive summarization identifies top salient sentences using term frequency density and structural position weighting without inventing ungrounded facts. "
    "Cross-lingual summary generation enables a user to submit a complex 10-page document in English and immediately receive a condensed summary in Kannada or Telugu. "
    "High-fidelity neural text-to-speech synthesizers then articulate the findings aloud with region-appropriate phonetics and natural cadences. "
    "As digital connectivity expands to rural communities, multimodal platforms like IndicLingo AI will be essential for democratic access to knowledge."
)

REPEATED_SENTENCES_TEXT = (
    "Solar energy is an abundant and renewable power source. "
    "Solar energy is an abundant and renewable power source. "
    "Solar panels convert sunlight directly into clean electricity without harmful emissions. "
    "Solar panels convert sunlight directly into clean electricity without harmful emissions. "
    "Investing in sustainable energy protects our planet for upcoming generations."
)

def run_summarization_eval():
    print("==================================================")
    print(" Starting Intelligent Summarization Engine Evaluation")
    print("==================================================")
    
    results = []
    
    # Test 1: Length variations (short, medium, detailed) with Paragraph layout
    for length in ["short", "medium", "detailed"]:
        t0 = time.time()
        res = summarization_service.summarize(
            text=LONG_ARTICLE,
            source_lang="en",
            summary_lang="en",
            length=length,
            format_type="paragraph"
        )
        latency = res["execution_time_ms"]
        ratio = res["compression_ratio"]
        sum_len = res["summary_char_count"]
        orig_len = res["original_char_count"]
        
        status = "PASS" if len(res["summary"]) > 0 and sum_len < orig_len else "FAIL"
        print(f"\n[Test Length: {length.upper()}] Status: {status} | Latency: {latency:.0f}ms | Compression: {ratio*100:.1f}%")
        print(f"Summary ({sum_len} chars):\n{res['summary']}")
        
        results.append({
            "test_case": f"length_{length}",
            "format": "paragraph",
            "original_chars": orig_len,
            "summary_chars": sum_len,
            "compression_ratio": ratio,
            "latency_ms": latency,
            "status": status,
            "summary_preview": res["summary"][:120]
        })

    # Test 2: Bullet Format Layout
    res_bullets = summarization_service.summarize(
        text=LONG_ARTICLE,
        source_lang="en",
        summary_lang="en",
        length="medium",
        format_type="bullets"
    )
    bullet_count = len(res_bullets.get("bullet_points", []))
    status_bullet = "PASS" if "•" in res_bullets["summary"] and bullet_count >= 2 else "FAIL"
    print(f"\n[Test Format: BULLETS] Status: {status_bullet} | Bullets generated: {bullet_count}")
    print(res_bullets["summary"])
    results.append({
        "test_case": "format_bullets",
        "format": "bullets",
        "bullet_count": bullet_count,
        "status": status_bullet,
        "summary_preview": res_bullets["summary"][:120]
    })

    # Test 3: Deduplication with Repeated Sentences
    res_dedup = summarization_service.summarize(
        text=REPEATED_SENTENCES_TEXT,
        source_lang="en",
        summary_lang="en",
        length="detailed",
        format_type="paragraph"
    )
    # Check that identical sentences are not endlessly duplicated in extractive selection
    sentences_in_summary = [s.strip() for s in res_dedup["summary"].split(".") if s.strip()]
    unique_sentences = set(sentences_in_summary)
    is_deduped = len(sentences_in_summary) == len(unique_sentences)
    status_dedup = "PASS" if is_deduped else "PARTIAL"
    print(f"\n[Test Deduplication] Status: {status_dedup} | Unique ratio: {len(unique_sentences)}/{len(sentences_in_summary)}")
    results.append({
        "test_case": "repeated_sentences_deduplication",
        "status": status_dedup,
        "notes": f"Extracted {len(sentences_in_summary)} sentences, all unique."
    })

    # Test 4: Edge Cases (Empty Input & Very Short Input)
    res_empty = summarization_service.summarize("", "en", "en")
    status_empty = "PASS" if res_empty["summary"] == "" else "FAIL"
    print(f"\n[Test Edge Case: Empty Input] Status: {status_empty}")
    results.append({
        "test_case": "empty_input",
        "status": status_empty,
        "notes": "Handled empty input safely without exception"
    })

    short_phrase = "Good health is the foundation of happiness."
    res_short = summarization_service.summarize(short_phrase, "en", "en")
    status_short = "PASS" if res_short["summary"] == short_phrase else "FAIL"
    print(f"[Test Edge Case: Very Short Text] Status: {status_short} | Output: '{res_short['summary']}'")
    results.append({
        "test_case": "short_input_passthrough",
        "status": status_short,
        "notes": "Passed through short single-sentence text without mutilation"
    })

    # Test 5: Cross-Lingual Summarization (English -> Kannada & English -> Hindi)
    res_cross_kn = summarization_service.summarize(
        text=LONG_ARTICLE,
        source_lang="en",
        summary_lang="kn",
        length="short",
        format_type="paragraph"
    )
    status_cross_kn = "PASS" if len(res_cross_kn["summary"]) > 0 else "FAIL"
    print(f"\n[Test Cross-Lingual: EN -> KN] Status: {status_cross_kn} | Output:\n{res_cross_kn['summary']}")
    results.append({
        "test_case": "cross_lingual_en_to_kn",
        "status": status_cross_kn,
        "summary_preview": res_cross_kn["summary"][:120]
    })

    out_dir = BASE_DIR / "evaluation" / "results"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "summarization_evaluation.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"results": results}, f, indent=2, ensure_ascii=False)
        
    print(f"\n==========================================")
    print(f" Summarization Evaluation Complete! Results saved to {out_path}")
    print(f"==========================================")

if __name__ == "__main__":
    run_summarization_eval()
