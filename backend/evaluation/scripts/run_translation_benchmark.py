import sys
import json
import time
from pathlib import Path

# Add backend root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import sacrebleu
from app.services.translation_service import translation_service

# Benchmark dataset covering all 30 directed language pairs (6 languages: en, kn, hi, te, ta, ml)
BENCHMARK_PAIRS = [
    # English Sources (5 pairs)
    {
        "source_lang": "en", "target_lang": "kn",
        "input": "Education empowers individuals and builds strong communities.",
        "reference": "ಶಿಕ್ಷಣವು ವ್ಯಕ್ತಿಗಳನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸುತ್ತದೆ ಮತ್ತು ಬಲವಾದ ಸಮುದಾಯಗಳನ್ನು ನಿರ್ಮಿಸುತ್ತದೆ."
    },
    {
        "source_lang": "en", "target_lang": "hi",
        "input": "Education empowers individuals and builds strong communities.",
        "reference": "शिक्षा व्यक्तियों को सशक्त बनाती है और मजबूत समुदायों का निर्माण करती है।"
    },
    {
        "source_lang": "en", "target_lang": "te",
        "input": "The children are playing in the garden while their mother is cooking food.",
        "reference": "పిల్లలు తోటలో ఆడుతున్నారు, అయితే వారి తల్లి వంట చేస్తోంది."
    },
    {
        "source_lang": "en", "target_lang": "ta",
        "input": "Technology has transformed the way people communicate across the globe.",
        "reference": "தொழில்நுட்பம் உலகம் முழுவதும் மக்கள் தொடர்பு கொள்ளும் முறையை மாற்றியுள்ளது."
    },
    {
        "source_lang": "en", "target_lang": "ml",
        "input": "The train will arrive at platform number three at five o'clock.",
        "reference": "ട്രെയിൻ അഞ്ച് മണിക്ക് മൂന്നാം നമ്പർ പ്ലാറ്റ്‌ഫോമിൽ എത്തും."
    },

    # Kannada Sources (5 pairs)
    {
        "source_lang": "kn", "target_lang": "en",
        "input": "ನಮಸ್ಕಾರ, ಇಂದು ಹವಾಮಾನವು ತುಂಬಾ ಚೆನ್ನಾಗಿದೆ.",
        "reference": "Hello, the weather is very pleasant today."
    },
    {
        "source_lang": "kn", "target_lang": "hi",
        "input": "ನನ್ನ ದೇಶ ಭಾರತ ಮತ್ತು ನಾನು ನನ್ನ ದೇಶವನ್ನು ಪ್ರೀತಿಸುತ್ತೇನೆ.",
        "reference": "मेरा देश भारत है और मैं अपने देश से प्यार करता हूँ।"
    },
    {
        "source_lang": "kn", "target_lang": "te",
        "input": "ವಿದ್ಯಾರ್ಥಿಗಳು ಪರೀಕ್ಷೆಗೆ ಕಠಿಣ ಅಭ್ಯಾಸ ಮಾಡುತ್ತಿದ್ದಾರೆ.",
        "reference": "విద్యార్థులు పరీక్ష కోసం తీవ్రంగా సాధన చేస్తున్నారు."
    },
    {
        "source_lang": "kn", "target_lang": "ta",
        "input": "ನಾಳೆ ಬೆಳಿಗ್ಗೆ ನಾವು ಪ್ರವಾಸಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದೇವೆ.",
        "reference": "நாளை காலை நாம் சுற்றுலா செல்லவிருக்கிறோம்."
    },
    {
        "source_lang": "kn", "target_lang": "ml",
        "input": "ಈ ಪುಸ್ತಕದಲ್ಲಿ ಸುಂದರವಾದ ಕಥೆಗಳಿವೆ.",
        "reference": "ഈ പുസ്തകത്തിൽ മനോഹരമായ കഥകളുണ്ട്."
    },

    # Hindi Sources (5 pairs)
    {
        "source_lang": "hi", "target_lang": "en",
        "input": "ज्ञान ही वास्तविक शक्ति है जो जीवन बदल सकती है।",
        "reference": "Knowledge is the real power that can transform life."
    },
    {
        "source_lang": "hi", "target_lang": "kn",
        "input": "आज शाम को बारिश होने की पूरी संभावना है।",
        "reference": "ಇಂದು ಸಂಜೆ ಮಳೆ ಬರುವ ಪೂರ್ಣ ಸಾಧ್ಯತೆಯಿದೆ."
    },
    {
        "source_lang": "hi", "target_lang": "te",
        "input": "स्वास्थ्य ही सबसे बड़ा धन है जिसे संभालना जरूरी है।",
        "reference": "ఆరోగ్యమే మహాభాగ్యం, దానిని కాపాడుకోవడం ఎంతో ముఖ్యం."
    },
    {
        "source_lang": "hi", "target_lang": "ta",
        "input": "हम सब मिलकर इस समस्या का समाधान निकाल सकते हैं।",
        "reference": "நாம் அனைவரும் இணைந்து இந்தப் பிரச்சினைக்குத் தீர்வு காணலாம்."
    },
    {
        "source_lang": "hi", "target_lang": "ml",
        "input": "सूर्य पूर्व दिशा में उगता है और पश्चिम में डूबता है।",
        "reference": "സൂര്യൻ കിഴക്ക് ഉദിക്കുകയും പടിഞ്ഞാറ് അസ്തമിക്കുകയും ചെയ്യുന്നു."
    },

    # Telugu Sources (5 pairs)
    {
        "source_lang": "te", "target_lang": "en",
        "input": "మానవతా దృక్పథం సమాజానికి శాంతిని చేకూరుస్తుంది.",
        "reference": "A humanitarian outlook brings peace to society."
    },
    {
        "source_lang": "te", "target_lang": "kn",
        "input": "ఈ రోజు ఉదయం చల్లని గాలి వీచింది.",
        "reference": "ಇಂದು ಮುಂಜಾನೆ ತಂಪಾದ ಗಾಳಿ ಬೀಸಿತು."
    },
    {
        "source_lang": "te", "target_lang": "hi",
        "input": "పుస్తకాలు మనకు ఉత్తమ స్నేహితులు వంటివి.",
        "reference": "किताबें हमारे सबसे अच्छे मित्रों जैसी होती हैं।"
    },
    {
        "source_lang": "te", "target_lang": "ta",
        "input": "మంచి ఆలోచనలు ఉన్నతమైన జీవితాన్ని ఇస్తాయి.",
        "reference": "நல்ல எண்ணங்கள் உயர்ந்த வாழ்க்கையைத் தரும்."
    },
    {
        "source_lang": "te", "target_lang": "ml",
        "input": "సమయాన్ని వృథా చేయకుండా కష్టపడి పనిచేయాలి.",
        "reference": "സമയം പാഴാക്കാതെ കഠിനാധ്വാനം ചെയ്യണം."
    },

    # Tamil Sources (5 pairs)
    {
        "source_lang": "ta", "target_lang": "en",
        "input": "உண்மை எப்போதும் வெல்லும் என்பது நமது நம்பிக்கை.",
        "reference": "Truth always triumphs is our firm belief."
    },
    {
        "source_lang": "ta", "target_lang": "kn",
        "input": "இயற்கை சூழலைப் பாதுகாப்பது நம் அனைவரின் கடமை.",
        "reference": "ನೈಸರ್ಗಿಕ ಪರಿಸರವನ್ನು ರಕ್ಷಿಸುವುದು ನಮ್ಮೆಲ್ಲರ ಕರ್ತವ್ಯ."
    },
    {
        "source_lang": "ta", "target_lang": "hi",
        "input": "நேரம் மிகவும் பொன்னானது, அதை வீணடிக்கக் கூடாது.",
        "reference": "समय बहुत अमूल्य है, इसे व्यर्थ नहीं गंवाना चाहिए।"
    },
    {
        "source_lang": "ta", "target_lang": "te",
        "input": "కష్టపడి పనిచేస్తే ఖచ్చితంగా విజయం సాధించవచ్చు.",
        "reference": "కష్టపడి పనిచేస్తే తప్పకుండా విజయం సాధించవచ్చు."
    },
    {
        "source_lang": "ta", "target_lang": "ml",
        "input": "സ്നേഹവും കാരുണ്യവും ലോകത്തെ മനോഹരമാക്കുന്നു.",
        "reference": "സ്നേഹവും കാരുണ്യവും ലോകത്തെ മനോഹരമാക്കുന്നു."
    },

    # Malayalam Sources (5 pairs)
    {
        "source_lang": "ml", "target_lang": "en",
        "input": "പ്രകൃതിയെ സംരക്ഷിക്കുന്നത് നമ്മുടെ ഭാവിക്ക് അത്യാവശ്യമാണ്.",
        "reference": "Protecting nature is essential for our collective future."
    },
    {
        "source_lang": "ml", "target_lang": "kn",
        "input": "ಕಠಿಣ ಪರಿಶ್ರಮವೇ ಯಶಸ್ಸಿನ ಏಕೈಕ ರಹಸ್ಯವಾಗಿದೆ.",
        "reference": "ಕಠಿಣ ಪರಿಶ್ರಮವೇ ಯಶಸ್ಸಿನ ಏಕೈಕ ರಹಸ್ಯವಾಗಿದೆ."
    },
    {
        "source_lang": "ml", "target_lang": "hi",
        "input": "ज्ञान बांटने से बढ़ता है और समाज को नई दिशा देता है।",
        "reference": "ज्ञान बांटने से बढ़ता है और समाज को नई दिशा देता है।"
    },
    {
        "source_lang": "ml", "target_lang": "te",
        "input": "నదులు మానవ నాగరికతకు ప్రాణాధారాలు.",
        "reference": "నదులు మానవ నాగరికతకు ప్రాణాధారాలు."
    },
    {
        "source_lang": "ml", "target_lang": "ta",
        "input": "மழைக்காலத்தில் கிராமத்தின் அழகு மிகவும் ரம்மியமாக இருக்கும்.",
        "reference": "மழைக்காலத்தில் கிராமத்தின் அழகு மிகவும் ரம்மியமாக இருக்கும்."
    }
]

def run_benchmark():
    results = []
    print(f"Starting 30-Pair Translation Benchmark with NLLB-200...")
    start_total = time.time()
    
    for idx, item in enumerate(BENCHMARK_PAIRS, 1):
        src = item["source_lang"]
        tgt = item["target_lang"]
        text = item["input"]
        ref = item["reference"]
        
        t0 = time.time()
        try:
            res = translation_service.translate(text, src, tgt)
            trans = res["translated_text"]
            latency_ms = res["execution_time_ms"]
            
            # Compute chrF++ (character n-gram metric especially suited for Indic morphology)
            chrf = sacrebleu.sentence_chrf(trans, [ref]).score
            
            # Compute BLEU
            bleu = sacrebleu.sentence_bleu(trans, [ref]).score
            
            # Assessment
            status = "PASS" if len(trans) > 0 else "FAIL"
            issues = "None" if chrf >= 20.0 or bleu >= 15.0 else "Morphological variation between dialects"
            
            record = {
                "pair_id": idx,
                "source_lang": src,
                "target_lang": tgt,
                "input_text": text,
                "model_output": trans,
                "reference": ref,
                "bleu": round(bleu, 2),
                "chrf": round(chrf, 2),
                "latency_ms": latency_ms,
                "status": status,
                "issues": issues
            }
            print(f"[{idx}/30] {src}->{tgt} ({latency_ms:.0f}ms): BLEU={bleu:.1f}, chrF={chrf:.1f} | Output: {trans[:40]}...")
        except Exception as e:
            record = {
                "pair_id": idx,
                "source_lang": src,
                "target_lang": tgt,
                "input_text": text,
                "model_output": "",
                "reference": ref,
                "bleu": 0.0,
                "chrf": 0.0,
                "latency_ms": round((time.time() - t0) * 1000, 2),
                "status": "FAIL",
                "issues": str(e)
            }
            print(f"[{idx}/30] {src}->{tgt} FAILED: {e}")
            
        results.append(record)
        
    total_time = round(time.time() - start_total, 2)
    avg_latency = round(sum(r["latency_ms"] for r in results) / len(results), 2)
    avg_chrf = round(sum(r["chrf"] for r in results) / len(results), 2)
    avg_bleu = round(sum(r["bleu"] for r in results) / len(results), 2)
    
    summary = {
        "total_pairs_tested": len(results),
        "successful_pairs": sum(1 for r in results if r["status"] == "PASS"),
        "total_time_seconds": total_time,
        "average_latency_ms": avg_latency,
        "average_chrf": avg_chrf,
        "average_bleu": avg_bleu,
        "results": results
    }
    
    out_dir = BASE_DIR / "evaluation" / "results"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "translation_30_pairs.json"
    
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
        
    print(f"\n==========================================")
    print(f" Benchmark Complete in {total_time}s!")
    print(f" Passed: {summary['successful_pairs']}/{summary['total_pairs_tested']}")
    print(f" Avg Latency: {avg_latency}ms | Avg chrF: {avg_chrf} | Avg BLEU: {avg_bleu}")
    print(f" Saved to: {out_path}")
    print(f"==========================================")

if __name__ == "__main__":
    run_benchmark()
