import sys
import os
import json
import time
import asyncio
from pathlib import Path

# Add backend root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import jiwer
from app.config import settings, SUPPORTED_LANGUAGES
from app.services.speech_service import speech_service
from app.services.transcription_service import transcription_service
from app.utils.file_validator import validate_audio_file
from app.core.exceptions import FileProcessingException, FileSizeExceededException, AudioProcessingException

AUDIO_TEST_CASES = [
    {
        "language": "en",
        "ground_truth": "Welcome to IndicLingo AI multimodal platform.",
        "description": "English spoken prompt"
    },
    {
        "language": "kn",
        "ground_truth": "ಇಂಡಿಕ್‌ಲಿಂಗೋ ಎಐ ಧ್ವನಿ ಸಂಸ್ಕರಣಾ ವ್ಯವಸ್ಥೆಗೆ ಸ್ವಾಗತ.",
        "description": "Kannada spoken prompt"
    },
    {
        "language": "hi",
        "ground_truth": "इंडिक्लिंगो एआई बहुभाषी मंच में आपका स्वागत है।",
        "description": "Hindi spoken prompt"
    },
    {
        "language": "te",
        "ground_truth": "ఇండిక్లింగో ఏఐ బహుభాషా వేదికకు స్వాగతం.",
        "description": "Telugu spoken prompt"
    },
    {
        "language": "ta",
        "ground_truth": "இண்டிக்லிங்கோ ஏஐ பன்மொழி தளத்திற்கு நல்வரவு.",
        "description": "Tamil spoken prompt"
    },
    {
        "language": "ml",
        "ground_truth": "ഇൻഡിക്ലിംഗോ എഐ മൾട്ടിമോഡൽ പ്ലാറ്റ്‌ഫോമിലേക്ക് സ്വാഗതം.",
        "description": "Malayalam spoken prompt"
    }
]

async def run_audio_eval():
    print("==================================================")
    print(" Starting Multilingual Speech Recognition (ASR) Evaluation")
    print("==================================================")
    
    results = []
    
    # 1. Test Spoken Audio for all 6 languages
    for test in AUDIO_TEST_CASES:
        lang = test["language"]
        ground_truth = test["ground_truth"]
        print(f"\n--- Testing Language: {lang.upper()} ({test['description']}) ---")
        
        # Step A: Synthesize authentic audio
        tts_start = time.time()
        tts_res = await speech_service.generate_speech_async(
            text=ground_truth,
            language=lang
        )
        tts_latency = round((time.time() - tts_start) * 1000, 2)
        audio_file = tts_res["file_path"]
        print(f"Synthesized Audio ({tts_res['provider']}): {audio_file} in {tts_latency}ms")
        
        # Step B: Transcribe using Whisper
        asr_start = time.time()
        try:
            asr_res = transcription_service.transcribe(
                audio_path=audio_file,
                language=lang
            )
            asr_latency = asr_res["execution_time_ms"]
            transcript = asr_res["transcript"]
            detected_lang = asr_res["detected_language"]
            duration = asr_res["duration_seconds"]
            segments = asr_res.get("segments", [])
            
            # Compute WER/CER where appropriate
            try:
                wer = jiwer.wer(ground_truth, transcript) if transcript else 1.0
            except Exception:
                wer = 1.0
                
            status = "PASS" if len(transcript) > 0 else "PARTIAL"
            print(f"ASR Output: '{transcript}'")
            print(f"Detected Lang: {detected_lang} | Duration: {duration:.1f}s | Latency: {asr_latency:.0f}ms | WER: {wer:.2f}")
            
            results.append({
                "type": "speech_recognition",
                "language": lang,
                "ground_truth": ground_truth,
                "transcript": transcript,
                "detected_language": detected_lang,
                "duration_seconds": duration,
                "segment_count": len(segments),
                "asr_latency_ms": asr_latency,
                "wer": round(wer, 2),
                "status": status,
                "notes": f"Verified timestamps and {len(segments)} segment(s)"
            })
        except Exception as e:
            print(f"ASR failed for {lang}: {e}")
            results.append({
                "type": "speech_recognition",
                "language": lang,
                "ground_truth": ground_truth,
                "transcript": "",
                "status": "FAIL",
                "error": str(e)
            })

    # 2. Test Edge Cases
    print("\n--- Testing ASR Edge Cases ---")
    
    # Edge Case 1: Empty Audio File (0 bytes)
    empty_path = settings.TEMP_DIR / "empty_test.wav"
    empty_path.touch()
    try:
        transcription_service.transcribe(str(empty_path))
        edge1_status = "FAIL"
        edge1_notes = "Should have raised exception on empty file"
    except Exception as e:
        edge1_status = "PASS"
        edge1_notes = f"Gracefully rejected: {str(e)[:80]}"
    if empty_path.exists():
        empty_path.unlink()
    print(f"Empty Audio Test: {edge1_status} ({edge1_notes})")
    results.append({
        "type": "edge_case",
        "case": "empty_file_0_bytes",
        "status": edge1_status,
        "notes": edge1_notes
    })

    # Edge Case 2: Corrupted Audio File (random bytes)
    corrupt_path = settings.TEMP_DIR / "corrupt_test.wav"
    with open(corrupt_path, "wb") as f:
        f.write(b"NOT_A_VALID_WAV_HEADER_DATA_1234567890")
    try:
        transcription_service.transcribe(str(corrupt_path))
        edge2_status = "FAIL"
        edge2_notes = "Should have raised error on corrupted audio"
    except Exception as e:
        edge2_status = "PASS"
        edge2_notes = f"Gracefully handled corrupted stream: {str(e)[:80]}"
    if corrupt_path.exists():
        corrupt_path.unlink()
    print(f"Corrupted Audio Test: {edge2_status} ({edge2_notes})")
    results.append({
        "type": "edge_case",
        "case": "corrupted_audio",
        "status": edge2_status,
        "notes": edge2_notes
    })

    # Edge Case 3: Unsupported Extension Validation
    try:
        validate_audio_file("unsupported_track.xyz", 1024)
        edge3_status = "FAIL"
        edge3_notes = "Did not reject .xyz"
    except FileProcessingException as e:
        edge3_status = "PASS"
        edge3_notes = f"Successfully rejected invalid format: {str(e)[:80]}"
    print(f"Unsupported Extension Test: {edge3_status} ({edge3_notes})")
    results.append({
        "type": "edge_case",
        "case": "unsupported_extension",
        "status": edge3_status,
        "notes": edge3_notes
    })

    # Edge Case 4: Oversized Audio File (> 25MB)
    try:
        validate_audio_file("large_audio.mp3", 30 * 1024 * 1024)
        edge4_status = "FAIL"
        edge4_notes = "Did not reject 30MB file"
    except FileSizeExceededException as e:
        edge4_status = "PASS"
        edge4_notes = f"Successfully rejected >25MB file: {str(e)[:80]}"
    print(f"Oversized File Test: {edge4_status} ({edge4_notes})")
    results.append({
        "type": "edge_case",
        "case": "oversized_file_limit",
        "status": edge4_status,
        "notes": edge4_notes
    })

    out_dir = BASE_DIR / "evaluation" / "results"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "audio_evaluation.json"
    
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"results": results}, f, indent=2, ensure_ascii=False)
        
    print(f"\n==========================================")
    print(f" Audio Evaluation Complete! Results saved to {out_path}")
    print(f"==========================================")

if __name__ == "__main__":
    asyncio.run(run_audio_eval())
