"""
TradeMind ML Model - Train & Inference
========================================
Uses scikit-learn to train a real ML text classifier:
  - TF-IDF vectorizer    (NLP feature extraction)
  - Logistic Regression  (natively probabilistic, no calibration wrapper needed)
  - joblib               (model persistence - save/load)

Training pipeline:
  query text -> TF-IDF features -> LogReg -> intent label -> fetch knowledge -> format response
"""

import json
import joblib
import numpy as np
from pathlib import Path
from typing import Dict, Optional, Tuple

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import LabelEncoder

from training_data import TRAINING_SAMPLES, RESPONSE_KEY_MAP

# ── Paths ─────────────────────────────────────────────────────────────────────
MODEL_DIR = Path(__file__).parent / "model_artifacts"
MODEL_PATH = MODEL_DIR / "classifier.joblib"
LABEL_ENCODER_PATH = MODEL_DIR / "label_encoder.joblib"
METRICS_PATH = MODEL_DIR / "metrics.json"

CONFIDENCE_THRESHOLD = 0.55


# ── Train ─────────────────────────────────────────────────────────────────────

def train_model(verbose: bool = True) -> Dict:
    """
    Train TF-IDF + Logistic Regression on TRAINING_SAMPLES.
    Saves artifacts to model_artifacts/. Returns metrics dict.
    """
    MODEL_DIR.mkdir(exist_ok=True)

    texts  = [t for t, _, _ in TRAINING_SAMPLES]
    labels = [l for _, l, _ in TRAINING_SAMPLES]

    le = LabelEncoder()
    y = le.fit_transform(labels)

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            analyzer="word",
            ngram_range=(1, 3),
            min_df=1,
            sublinear_tf=True,
            strip_accents="unicode",
            lowercase=True,
        )),
        ("clf", LogisticRegression(
            max_iter=1000,
            C=5.0,
            solver="lbfgs",
        )),
    ])

    # 3-fold CV — suppress warnings about small classes (expected with 1-2 samples per class)
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        cv_scores = cross_val_score(pipeline, texts, y, cv=3, scoring="accuracy")
    cv_mean = float(np.mean(cv_scores))
    cv_std  = float(np.std(cv_scores))

    # Final fit on all data
    pipeline.fit(texts, y)

    joblib.dump(pipeline, MODEL_PATH)
    joblib.dump(le, LABEL_ENCODER_PATH)

    metrics = {
        "num_samples": len(texts),
        "num_classes": len(le.classes_),
        "cv_accuracy_mean": round(cv_mean, 4),
        "cv_accuracy_std":  round(cv_std, 4),
        "classes": list(le.classes_),
    }
    METRICS_PATH.write_text(json.dumps(metrics, indent=2))

    if verbose:
        print(f"[OK] Trained on {len(texts)} samples | {len(le.classes_)} intents")
        print(f"[CV] Accuracy: {cv_mean*100:.1f}% +/- {cv_std*100:.1f}%")
        print(f"[SAVED] {MODEL_DIR}")

    return metrics


# ── Inference ─────────────────────────────────────────────────────────────────

class TradeMindMLModel:
    """Loads trained pipeline and serves intent predictions."""

    def __init__(self):
        self.pipeline: Optional[Pipeline] = None
        self.label_encoder: Optional[LabelEncoder] = None
        self._response_key_lookup: Dict[str, str] = {
            label: rkey for _, label, rkey in TRAINING_SAMPLES
        }
        self._load_or_train()

    def _load_or_train(self):
        if MODEL_PATH.exists() and LABEL_ENCODER_PATH.exists():
            self.pipeline = joblib.load(MODEL_PATH)
            self.label_encoder = joblib.load(LABEL_ENCODER_PATH)
            print("✅ ML Model loaded from disk")
        else:
            print("🔧 No saved model — training now...")
            train_model(verbose=True)
            self.pipeline = joblib.load(MODEL_PATH)
            self.label_encoder = joblib.load(LABEL_ENCODER_PATH)

    def predict(self, query: str) -> Tuple[str, float, str]:
        """Returns (intent_label, confidence, response_key)."""
        proba = self.pipeline.predict_proba([query])[0]
        best_idx = int(np.argmax(proba))
        confidence = float(proba[best_idx])
        intent = self.label_encoder.inverse_transform([best_idx])[0]
        response_key = self._response_key_lookup.get(intent, "")
        return intent, confidence, response_key

    def process_query(self, query: str, knowledge_store: Dict) -> Optional[Dict]:
        """Returns response dict or None if confidence is below threshold."""
        intent, confidence, response_key = self.predict(query)

        if confidence < CONFIDENCE_THRESHOLD:
            return None

        knowledge_data = self._fetch_knowledge(response_key, knowledge_store)
        if not knowledge_data:
            return None

        return {
            "answer": self._format_response(response_key, knowledge_data),
            "type": "ml_model",
            "verified": True,
            "confidence": round(confidence * 100, 1),
            "intent": intent,
            "response_key": response_key,
            "source": "Trained ML Model (TF-IDF + Logistic Regression)",
        }

    def _fetch_knowledge(self, response_key: str, knowledge_store: Dict) -> Optional[Dict]:
        if response_key not in RESPONSE_KEY_MAP:
            return None
        kb_name, topic_key = RESPONSE_KEY_MAP[response_key]
        kb = knowledge_store.get(kb_name, {})
        if kb_name == "GLOSSARY":
            value = kb.get(topic_key)
            return {"_glossary_term": topic_key, "_glossary_def": value} if value else None
        return kb.get(topic_key)

    def _format_response(self, response_key: str, data) -> str:
        if isinstance(data, dict) and "_glossary_term" in data:
            term = data["_glossary_term"].upper()
            return f"# {term}\n\n{data['_glossary_def']}\n\n---\n*Verified knowledge base answer.*"

        if not isinstance(data, dict):
            return str(data)

        lines = []
        title = data.get("name") or data.get("title") or response_key.replace("_", " ").title()
        lines.append(f"# {title}\n")

        for key in ("description", "definition"):
            if key in data:
                lines.append(f"{data[key]}\n")
                break

        skip = {"name", "title", "description", "definition"}
        for key, value in data.items():
            if key in skip:
                continue
            label = key.replace("_", " ").title()
            if isinstance(value, str):
                lines.append(f"**{label}:** {value}\n")
            elif isinstance(value, list):
                lines.append(f"\n## {label}")
                for item in value:
                    lines.append(f"- {item}")
                lines.append("")
            elif isinstance(value, dict):
                lines.append(f"\n## {label}")
                for subk, subv in value.items():
                    sublabel = subk.replace("_", " ").title()
                    if isinstance(subv, str):
                        lines.append(f"**{sublabel}:** {subv}")
                    elif isinstance(subv, list):
                        lines.append(f"**{sublabel}:**")
                        for item in subv:
                            lines.append(f"  - {item}")
                    elif isinstance(subv, dict):
                        lines.append(f"**{sublabel}:**")
                        for k2, v2 in subv.items():
                            lines.append(f"  - *{k2}*: {v2}")
                lines.append("")

        lines.append("\n---\n*🧠 ML Model — TF-IDF + Logistic Regression*")
        return "\n".join(lines)


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("🚀 Training TradeMind ML Model...")
    metrics = train_model(verbose=True)
    print("\n📈 Metrics:")
    print(json.dumps(metrics, indent=2))
