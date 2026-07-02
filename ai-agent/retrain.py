"""
Retrain the TradeMind ML Model
================================
Run this script whenever you add new samples to training_data.py:

    python retrain.py

It will:
  1. Re-train TF-IDF + Logistic Regression on all TRAINING_SAMPLES
  2. Print cross-validation accuracy
  3. Save new model artifacts to model_artifacts/
  4. Restart the AI agent server to load the new model
"""

import json
from trained_model import train_model

if __name__ == "__main__":
    print("=" * 50)
    print("  TradeMind ML Model - Retraining")
    print("=" * 50)
    metrics = train_model(verbose=True)
    print("\nFinal Metrics:")
    print(json.dumps(metrics, indent=2))
    print("\n[DONE] Restart the AI agent server to load the new model.")
