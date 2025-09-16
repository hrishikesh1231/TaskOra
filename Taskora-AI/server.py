from fastapi import FastAPI
from pydantic import BaseModel
import joblib, re
import datetime

# Initialize FastAPI
app = FastAPI(title="Taskora AI Moderation API", version="1.0")

# Load trained ML model
model = joblib.load("model/harmful_detector.pkl")

# Request body schema
class GigData(BaseModel):
    title: str
    description: str
    location: str
    postedBy: str
    category: str
    date: datetime.date   # ✅ date type
    # workDays: int         # ✅ int type
    # payment: str
    contact: str

# Helper: gibberish detection for text
def is_gibberish(text: str) -> bool:
    text = text.strip()
    if len(text) < 3:  # too short
        return True
    if len(re.findall(r"[aeiou]", text.lower())) == 0:  # no vowels
        return True
    if len(set(text.lower())) == 1:  # repeated chars
        return True
    return False

# Helper: validate phone number
def is_valid_contact(contact: str) -> bool:
    # allow only digits (optionally with +91 etc.)
    pattern = r"^\+?\d{7,15}$"  # 7 to 15 digits
    return re.match(pattern, contact) is not None

@app.post("/analyze")
def analyze_gig(gig: GigData):
    """
    Analyze gig fields for harmful/gibberish content.
    - If harmful → reject.
    - If gibberish → reject with field-specific error.
    - If invalid phone → reject with proper error.
    """

    # Step 1: Special check for contact number
    if not is_valid_contact(gig.contact):
        return {"status": "error", "message": "Invalid contact number format ❌"}

    # Step 2: Check gibberish fields (exclude date, workDays, contact)
    for field_name in ["title", "description", "location", "postedBy", "category"]:
        field_value = getattr(gig, field_name)
        if is_gibberish(str(field_value)):
            return {
                "status": "error",
                "message": f"Invalid {field_name}: looks gibberish ❌"
            }

    # Step 3: AI model check on combined text (skip numbers/dates)
    combined_text = " ".join([
        gig.title,
        gig.description,
        gig.location,
        gig.postedBy,
        gig.category,
        # gig.payment
    ])

    pred = model.predict([combined_text])[0]
    if pred == 1:
        return {"status": "error", "message": "Harmful content detected 🚫"}

    return {"status": "ok", "message": "Content is safe ✅"}
