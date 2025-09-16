import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import joblib

# Load dataset
df = pd.read_csv("data/dataset.csv")

# Train pipeline (TF-IDF + Logistic Regression)
model = Pipeline([
    ("tfidf", TfidfVectorizer(stop_words="english")),
    ("clf", LogisticRegression(max_iter=1000))
])

# Fit model
model.fit(df["text"], df["label"])

# Save trained model
joblib.dump(model, "model/harmful_detector.pkl")
print("✅ Model trained and saved to model/harmful_detector.pkl")
