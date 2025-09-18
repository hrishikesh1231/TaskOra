import os
import re
import csv
import joblib
import datetime
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import typing as t

# ----------------- CONFIG -----------------
MODEL_PATH = os.environ.get("HARMFUL_MODEL_PATH", "model/harmful_detector.pkl")
THRESHOLD = float(os.environ.get("HARMFUL_THRESHOLD", 0.45))
GIBBERISH_LOG = Path(os.environ.get("GIBBERISH_LOG", "data/gibberish_log.csv"))
GIBBERISH_LOG.parent.mkdir(parents=True, exist_ok=True)

# ----------------- LOAD MODEL -----------------
try:
    model = joblib.load(MODEL_PATH)
    print("✅ Model loaded from", MODEL_PATH)
except Exception as e:
    model = None
    print("❌ ERROR loading model:", e)

# ----------------- APP -----------------
app = FastAPI(title="Taskora AI Moderation API (with gibberish rules)")

# ----------------- SCHEMAS -----------------
class GigData(BaseModel):
    title: str
    description: str
    location: str
    category: str
    date: datetime.date
    contact: str

class ServiceData(BaseModel):
    title: str
    description: str
    salary: str
    location: str
    postedBy: str
    contact: str
    date: datetime.date

class TextPayload(BaseModel):
    text: str

# ----------------- NORMALIZATION -----------------
def normalize_text(s: str) -> str:
    if not isinstance(s, str):
        s = str(s)
    t = s.strip().lower()
    t = re.sub(r'https?://\S+|www\.\S+|\S+@\S+', ' ', t)
    t = re.sub(
        r'(?<=\b)([a-z])(?:[^\w\s]+|\s)+([a-z])(?:[^\w\s]+|\s)+([a-z])(?=\b)',
        lambda m: m.group(1) + m.group(2) + m.group(3),
        t
    )
    t = re.sub(r'[\r\n]+', ' ', t)
    t = re.sub(r'\s+', ' ', t)
    t = re.sub(r'([^\w\s]){2,}', r'\1', t)
    t = t.replace('0','o').replace('1','i').replace('4','a').replace('3','e').replace('5','s')
    return t.strip()

# ----------------- GIBBERISH HELPERS -----------------
def vowel_ratio(s: str) -> float:
    s_alpha = ''.join([c for c in s.lower() if c.isalpha()])
    if not s_alpha: return 0.0
    return sum(ch in 'aeiou' for ch in s_alpha) / len(s_alpha)

def non_alpha_ratio(s: str) -> float:
    if not s: return 0.0
    return sum(not c.isalpha() for c in s) / max(1, len(s))

def repetitive_char_ratio(s: str) -> float:
    if not s: return 0.0
    longest = 1
    cur = 1
    for i in range(1, len(s)):
        if s[i] == s[i-1]:
            cur += 1
            longest = max(longest, cur)
        else:
            cur = 1
    return longest / max(1, len(s))

# --- NEW: detect salary/price/number-like values ---
def is_number_like(s: str) -> bool:
    if not s or not isinstance(s, str):
        return False
    s = s.strip()
    patterns = [
        r'^\d{1,9}$',                                 # plain number e.g. 6000
        r'^[\d,]{1,10}\s*(/|per|/month|/mo|month)?$', # 6000, 6,000/month, 6000/mo
        r'^[₹$€]\s?[\d,]+(?:\.\d+)?$',                # currency like ₹6000, $6000.00
        r'^\d{1,6}\s*-\s*\d{1,6}$',                   # range e.g. 6000-8000
        r'^\d{1,6}\s*(per|/)\s*(month|mo|year|yr)$',  # e.g. 6000 per month
    ]
    for p in patterns:
        if re.search(p, s, flags=re.IGNORECASE):
            return True
    return False

# fields exempt from gibberish check
NUMERIC_FIELD_EXCEPTIONS = {"salary", "contact", "amount", "price", "budget"}

def is_maybe_gibberish(s: str, field_name: str = "") -> bool:
    s = (s or "").strip()
    if not s:
        return False

    # ✅ Skip gibberish check for numeric fields like salary/contact
    if field_name and field_name.lower() in NUMERIC_FIELD_EXCEPTIONS:
        return False

    # ✅ Skip gibberish if looks like salary/number/currency
    if is_number_like(s):
        return False

    return (
        (vowel_ratio(s) < 0.22)
        or (non_alpha_ratio(s) > 0.45)
        or (repetitive_char_ratio(s) > 0.4)
        or (len(s) < 3)
    )

def log_gibberish(text: str, field: str = "", extra: dict = None):
    try:
        row = {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "field": field,
            "text": text,
        }
        if extra:
            row.update(extra)
        file_exists = GIBBERISH_LOG.exists()
        with open(GIBBERISH_LOG, "a", newline="", encoding="utf-8") as fh:
            writer = csv.DictWriter(fh, fieldnames=list(row.keys()))
            if not file_exists:
                writer.writeheader()
            writer.writerow(row)
    except Exception as e:
        print("Failed to log gibberish:", e)

# ----------------- UTIL -----------------
def is_valid_contact(contact: str) -> bool:
    pattern = r"^\+?\d{7,15}$"
    return re.match(pattern, (contact or "")) is not None

# ----------------- MODERATION LOGIC -----------------
def analyze_fields_with_model(payload: dict, fields_to_check: t.List[str]):
    if model is None:
        return False, "Moderation model not loaded ❌"

    if not is_valid_contact(payload.get("contact", "")):
        return False, "Invalid contact number format ❌"

    for f in fields_to_check:
        val = str(payload.get(f, "")).strip()
        if not val:
            continue

        # gibberish check
        if is_maybe_gibberish(val, field_name=f):
            log_gibberish(val, field=f, extra={"reason": "rule_based_gibberish"})
            return False, f"Gibberish content detected in {f} 🚫"

        # harmful check
        try:
            norm = normalize_text(val)
            if hasattr(model, "predict_proba"):
                prob = float(model.predict_proba([norm])[0, 1])
            else:
                prob = 1.0 if int(model.predict([norm])[0]) == 1 else 0.0
            pred = int(prob >= THRESHOLD)
            print(f"[ML] field={f} prob={prob:.3f} pred={pred} text='{val}'")
            if pred == 1:
                return False, f"Harmful content detected in {f} 🚫"
        except Exception as e:
            return False, f"Model prediction failed on {f}: {str(e)}"

    combined_text = " ".join([str(payload.get(f, "")) for f in fields_to_check]).strip()
    if combined_text:
        if is_maybe_gibberish(combined_text, field_name="combined"):
            log_gibberish(combined_text, field="combined", extra={"reason": "rule_based_gibberish"})
            return False, "Gibberish content detected 🚫"
        try:
            norm = normalize_text(combined_text)
            if hasattr(model, "predict_proba"):
                prob = float(model.predict_proba([norm])[0, 1])
            else:
                prob = 1.0 if int(model.predict([norm])[0]) == 1 else 0.0
            pred = int(prob >= THRESHOLD)
            print(f"[ML] combined prob={prob:.3f} pred={pred}")
            if pred == 1:
                return False, "Harmful content detected 🚫"
        except Exception as e:
            return False, f"Model prediction failed: {str(e)}"

    return True, "Content is safe ✅"

# ----------------- ENDPOINTS -----------------
@app.post("/analyze")
def analyze_gig(gig: GigData):
    # ✅ Removed "category" from ML/gibberish check
    fields = ["title", "description", "location"]
    ok, msg = analyze_fields_with_model(gig.dict(), fields)
    if not ok:
        return JSONResponse(status_code=400, content={"status": "error", "message": msg})
    return {"status": "ok", "message": msg}

@app.post("/analyze_service")
def analyze_service(service: ServiceData):
    # ✅ Removed "salary" from ML/gibberish check
    fields = ["title", "description", "location", "postedBy"]
    ok, msg = analyze_fields_with_model(service.dict(), fields)
    if not ok:
        return JSONResponse(status_code=400, content={"status": "error", "message": msg})
    return {"status": "ok", "message": msg}

@app.post("/predict_text")
def predict_text(payload: TextPayload):
    text = (payload.text or "").strip()
    if text == "":
        return JSONResponse(status_code=400, content={"status": "error", "message": "Empty text"})
    if is_maybe_gibberish(text, field_name="predict_text"):
        log_gibberish(text, field="predict_text", extra={"reason": "rule_based_gibberish"})
        return JSONResponse(status_code=400, content={"status": "error", "message": "Gibberish content detected 🚫"})
    if model is None:
        return JSONResponse(status_code=500, content={"status": "error", "message": "Model not loaded"})
    try:
        norm = normalize_text(text)
        prob = float(model.predict_proba([norm])[0, 1]) if hasattr(model, "predict_proba") else (1.0 if int(model.predict([norm])[0]) == 1 else 0.0)
        pred = int(prob >= THRESHOLD)
        if pred == 1:
            return JSONResponse(status_code=400, content={"status": "error", "message": "Harmful content detected 🚫", "probability": prob})
        return {"status": "ok", "message": "Content is safe ✅", "probability": prob}
    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": f"Prediction failed: {e}"})

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None, "threshold": THRESHOLD}
