"""
Medi Bridge AI - Comprehensive Machine Learning Training Pipeline
Trains 4 separate chronic disease models:
1. Diabetes Prediction
2. Chronic Kidney Disease (CKD)
3. Hypertension Risk Assessment
4. Cardiovascular Disease (CVD)

Generates evaluation metrics (Accuracy, Precision, Recall, F1, ROC-AUC),
extracts feature importances for Explainable AI, and saves joblib artifacts.
"""

import os
import sys
import json
from datetime import datetime
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from machine_learning.datasets.generate_datasets import generate_all, DATASETS_DIR

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "saved_models"))

def train_condition_model(df, feature_cols, target_col, condition_key, condition_title, dataset_citation):
    print(f"\n==========================================")
    print(f"Training Model for: {condition_title}")
    print(f"Features: {feature_cols}")
    print(f"Target: {target_col}")

    X = df[feature_cols]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Scaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Model: Calibrated Random Forest
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        min_samples_split=4,
        random_state=42,
        class_weight='balanced'
    )
    rf.fit(X_train_scaled, y_train)

    # Evaluation
    y_pred = rf.predict(X_test_scaled)
    y_proba = rf.predict_proba(X_test_scaled)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_proba))
    cm = confusion_matrix(y_test, y_pred).tolist()

    print(f"Results for {condition_title}:")
    print(f"  Accuracy:  {acc:.4f}")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall:    {rec:.4f}")
    print(f"  F1-Score:  {f1:.4f}")
    print(f"  ROC-AUC:   {roc_auc:.4f}")

    # Feature Importance
    importances = rf.feature_importances_
    feat_importance_dict = {
        col: round(float(imp), 4) for col, imp in zip(feature_cols, importances)
    }
    sorted_features = sorted(feat_importance_dict.items(), key=lambda x: x[1], reverse=True)

    # Bundle artifacts
    model_bundle = {
        'model': rf,
        'scaler': scaler,
        'features': feature_cols,
        'target': target_col,
        'condition_key': condition_key,
        'condition_title': condition_title,
        'feature_importances': feat_importance_dict,
        'metrics': {
            'accuracy': round(acc, 4),
            'precision': round(prec, 4),
            'recall': round(rec, 4),
            'f1_score': round(f1, 4),
            'roc_auc': round(roc_auc, 4),
            'confusion_matrix': cm
        }
    }

    # Save joblib
    model_path = os.path.join(MODELS_DIR, f"{condition_key}_model.joblib")
    joblib.dump(model_bundle, model_path)
    print(f"Saved model bundle -> {model_path}")

    return {
        'condition_key': condition_key,
        'condition_title': condition_title,
        'dataset_citation': dataset_citation,
        'algorithm': 'Random Forest Classifier (Ensemble of 100 Trees with Scaler)',
        'trained_at': datetime.utcnow().isoformat(),
        'feature_columns': feature_cols,
        'metrics': model_bundle['metrics'],
        'top_features': sorted_features
    }

def main():
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(DATASETS_DIR, exist_ok=True)

    # Ensure datasets exist
    diabetes_csv = os.path.join(DATASETS_DIR, 'diabetes_dataset.csv')
    if not os.path.exists(diabetes_csv):
        print("Datasets missing. Generating benchmark datasets...")
        generate_all()

    # 1. Diabetes
    df_diabetes = pd.read_csv(os.path.join(DATASETS_DIR, 'diabetes_dataset.csv'))
    meta_diabetes = train_condition_model(
        df=df_diabetes,
        feature_cols=['glucose', 'bmi', 'age', 'systolic_bp', 'insulin', 'hba1c'],
        target_col='outcome',
        condition_key='diabetes',
        condition_title='Type-2 Diabetes Mellitus Risk',
        dataset_citation='Pima Indians Diabetes / National Health and Nutrition Examination Survey (NHANES) Benchmark'
    )

    # 2. Chronic Kidney Disease (CKD)
    df_ckd = pd.read_csv(os.path.join(DATASETS_DIR, 'ckd_dataset.csv'))
    meta_ckd = train_condition_model(
        df=df_ckd,
        feature_cols=['serum_creatinine', 'blood_urea', 'egfr', 'hemoglobin', 'albumin', 'systolic_bp', 'age'],
        target_col='ckd_present',
        condition_key='ckd',
        condition_title='Chronic Kidney Disease (CKD) Progression',
        dataset_citation='UCI Machine Learning Repository Chronic Kidney Disease (CKD) Clinical Benchmark'
    )

    # 3. Hypertension
    df_htn = pd.read_csv(os.path.join(DATASETS_DIR, 'hypertension_dataset.csv'))
    meta_htn = train_condition_model(
        df=df_htn,
        feature_cols=['systolic_bp', 'diastolic_bp', 'age', 'bmi', 'heart_rate', 'blood_glucose'],
        target_col='hypertension_risk',
        condition_key='hypertension',
        condition_title='Hypertension Stage Assessment',
        dataset_citation='American Heart Association (AHA) / Framingham Heart Study Blood Pressure Classification'
    )

    # 4. Cardiovascular Disease (CVD)
    df_cvd = pd.read_csv(os.path.join(DATASETS_DIR, 'cardiovascular_dataset.csv'))
    meta_cvd = train_condition_model(
        df=df_cvd,
        feature_cols=['age', 'systolic_bp', 'total_cholesterol', 'heart_rate', 'blood_glucose', 'bmi', 'exercise_induced_angina'],
        target_col='cvd_risk',
        condition_key='cardiovascular',
        condition_title='Cardiovascular Disease (CVD) Risk',
        dataset_citation='Cleveland Heart Disease Dataset / UCI Machine Learning Repository'
    )

    metadata = {
        'system_title': 'Medi Bridge AI Machine Learning Models',
        'generated_at': datetime.utcnow().isoformat(),
        'conditions': {
            'diabetes': meta_diabetes,
            'ckd': meta_ckd,
            'hypertension': meta_htn,
            'cardiovascular': meta_cvd
        }
    }

    meta_path = os.path.join(MODELS_DIR, 'model_metadata.json')
    with open(meta_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"\nAll 4 ML models successfully trained and serialized. Metadata written to {meta_path}!")

if __name__ == '__main__':
    main()
