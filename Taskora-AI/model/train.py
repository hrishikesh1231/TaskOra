# model/train.py
import os
import re
import joblib
import pandas as pd
from pathlib import Path
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support

# ---------- CONFIG ----------
CSV_IN = "data/dataset.csv"
CSV_OUT = "data/dataset_clean.csv"
MODEL_OUT = "model/harmful_detector.pkl"
DIAG_DIR = "model/diagnostics"
RANDOM_STATE = 42

# ---------- TEXT NORMALIZATION ----------
def normalize_text(s: str) -> str:
    if not isinstance(s, str):
        s = str(s)
    t = s.strip().lower()
    # remove urls/emails
    t = re.sub(r'https?://\S+|www\.\S+|\S+@\S+', ' ', t)
    # convert spaced/obfuscated sequences like "g u n", "g.u.n", "g*u*n" -> gun
    t = re.sub(
        r'(?<=\b)([a-z])(?:[^\w\s]+|\s)+([a-z])(?:[^\w\s]+|\s)+([a-z])(?=\b)',
        lambda m: m.group(1) + m.group(2) + m.group(3),
        t
    )
    # collapse repeated punctuation and whitespace
    t = re.sub(r'[\r\n]+', ' ', t)
    t = re.sub(r'\s+', ' ', t)
    t = re.sub(r'([^\w\s]){2,}', r'\1', t)
    # simple leet replacements
    t = t.replace('0', 'o').replace('1', 'i').replace('4', 'a').replace('3', 'e').replace('5', 's')
    return t.strip()

# ---------- GIBBERISH HEURISTICS ----------
def vowel_ratio(s: str) -> float:
    s_alpha = ''.join([c for c in s.lower() if c.isalpha()])
    if not s_alpha:
        return 0.0
    return sum(ch in 'aeiou' for ch in s_alpha) / len(s_alpha)

def non_alpha_ratio(s: str) -> float:
    if not s:
        return 0.0
    return sum(not c.isalpha() for c in s) / max(1, len(s))

def repetitive_char_ratio(s: str) -> float:
    if not s:
        return 0.0
    longest = 1
    cur = 1
    for i in range(1, len(s)):
        if s[i] == s[i-1]:
            cur += 1
            if cur > longest:
                longest = cur
        else:
            cur = 1
    return longest / max(1, len(s))

def is_maybe_gibberish(s: str) -> bool:
    return (vowel_ratio(s) < 0.22) or (non_alpha_ratio(s) > 0.45) or (repetitive_char_ratio(s) > 0.4) or (len(s.strip()) < 3)

# ---------- LOAD & CLEAN ----------
def load_and_clean(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, dtype=str, comment="#", keep_default_na=False, encoding="utf-8")
    # normalize column names
    df.columns = [c.strip().lower() for c in df.columns]
    if 'text' not in df.columns or 'label' not in df.columns:
        raise SystemExit("CSV must contain columns 'text' and 'label' (case-insensitive).")
    # remove accidental header-rows and blanks
    df = df[~(df['text'].astype(str).str.lower().str.strip() == 'text')]
    df['text'] = df['text'].astype(str).apply(lambda x: x.strip())
    df['label'] = df['label'].astype(str).apply(lambda x: x.strip())
    df = df[(df['text'] != "") & (df['label'] != "")]
    # numeric labels only (coerce)
    df['label_num'] = pd.to_numeric(df['label'], errors='coerce')
    df = df[~df['label_num'].isna()]
    df['label_num'] = df['label_num'].astype(int)
    df = df[df['label_num'].isin([0, 1])]
    # normalization and gibberish flag
    df['text_norm'] = df['text'].apply(normalize_text)
    df['maybe_gibberish'] = df['text_norm'].apply(is_maybe_gibberish)
    # deduplicate
    df = df.drop_duplicates(subset=['text_norm','label_num']).reset_index(drop=True)
    # ✅ Final clean return: only one label column
    df = df[['text', 'text_norm', 'label_num', 'maybe_gibberish']]
    df = df.rename(columns={'label_num': 'label'})
    df['label'] = df['label'].astype(int)
    return df

# ---------- PIPELINE ----------
def build_pipeline():
    word_tfidf = TfidfVectorizer(ngram_range=(1,3), analyzer='word', min_df=1, max_df=0.95)
    char_tfidf = TfidfVectorizer(ngram_range=(3,6), analyzer='char_wb', min_df=1)
    union = FeatureUnion([('word', word_tfidf), ('char', char_tfidf)])
    clf = LogisticRegression(max_iter=3000, class_weight='balanced', solver='liblinear')
    pipeline = Pipeline([('features', union), ('clf', clf)])
    return pipeline

def evaluate_thresholds(model, X_val, y_val, thresholds=(0.5, 0.45, 0.4, 0.35, 0.3)):
    proba = model.predict_proba(X_val)[:, 1]
    rows = []
    for t in thresholds:
        pred = (proba >= t).astype(int)
        p, r, f, _ = precision_recall_fscore_support(y_val, pred, average='binary', pos_label=1)
        rows.append({'threshold': t, 'precision': p, 'recall': r, 'f1': f})
    return pd.DataFrame(rows)

def train_and_save(df: pd.DataFrame):
    X = df['text_norm']
    y = df['label']  # already int
    strat = y if y.nunique() > 1 else None
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=RANDOM_STATE, stratify=strat)
    pipeline = build_pipeline()
    print(f"Training on {len(X_train)} rows, validating on {len(X_test)} rows...")
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    print("==== Classification report (threshold=0.5) ====")
    print(classification_report(y_test, y_pred, digits=4))
    print("Confusion matrix:\n", confusion_matrix(y_test, y_pred))
    # threshold diagnostics
    thresh_df = evaluate_thresholds(pipeline, X_test, y_test)
    print("Threshold diagnostics:\n", thresh_df.to_string(index=False))
    # save artifacts
    os.makedirs(os.path.dirname(MODEL_OUT), exist_ok=True)
    os.makedirs(DIAG_DIR, exist_ok=True)
    joblib.dump(pipeline, MODEL_OUT)
    df.to_csv(CSV_OUT, index=False)
    # save FN/FP
    proba = pipeline.predict_proba(X_test)[:, 1]
    preds = (proba >= 0.5).astype(int)
    test_df = pd.DataFrame({'text': X_test, 'true': y_test, 'pred': preds, 'proba': proba})
    fn = test_df[(test_df['true'] == 1) & (test_df['pred'] == 0)]
    fp = test_df[(test_df['true'] == 0) & (test_df['pred'] == 1)]
    fn.to_csv(os.path.join(DIAG_DIR, 'false_negatives.csv'), index=False)
    fp.to_csv(os.path.join(DIAG_DIR, 'false_positives.csv'), index=False)
    print("Saved model ->", MODEL_OUT)
    print("Saved cleaned CSV ->", CSV_OUT)
    print("Saved diagnostics ->", DIAG_DIR)
    return pipeline, thresh_df, fn, fp

# ---------- MAIN ----------
if __name__ == "__main__":
    print("Loading and cleaning dataset:", CSV_IN)
    if not Path(CSV_IN).exists():
        raise SystemExit(f"Input CSV not found at {CSV_IN}")
    df = load_and_clean(CSV_IN)
    print("Cleaned dataset shape:", df.shape)
    print("Label counts:\n", df['label'].value_counts())
    # Save mismatches
    keywords = ["gun", "kill", "bomb", "suicide", "attack", "shoot", "murder"]
    kw_re = re.compile("|".join([re.escape(k) for k in keywords]), re.IGNORECASE)
    kw_mismatch = df[df['text_norm'].str.contains(kw_re, na=False) & (df['label'] == 0)]
    if not kw_mismatch.empty:
        os.makedirs('data', exist_ok=True)
        kw_mismatch[['text', 'label']].to_csv('data/keyword_label_mismatch.csv', index=False)
        print("Saved keyword-label mismatches -> data/keyword_label_mismatch.csv (please review)")
    pipeline, thresh_df, fn, fp = train_and_save(df)
    try:
        word_vocab = pipeline.named_steps['features'].transformer_list[0][1].vocabulary_
        for token in ["weapon", "weapons", "need weapons", "kill", "gun"]:
            print(f"{token} in word-vocab? {token in word_vocab}")
    except Exception:
        pass
