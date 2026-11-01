"""
Medi Bridge AI - Synthetic Clinical Benchmark Dataset Generator
Generates reproducible, physiologically validated benchmark datasets
for Diabetes, CKD, Hypertension, and Cardiovascular Disease
grounded in published clinical ranges (NHANES, UCI CKD, AHA, Framingham).
"""

import os
import numpy as np
import pandas as pd

np.random.seed(42)

DATASETS_DIR = os.path.abspath(os.path.dirname(__file__))

def generate_diabetes_dataset(n_samples=1200):
    """
    Simulates clinical dataset aligned with Pima / NHANES Diabetes distributions.
    Features: glucose, bmi, age, systolic_bp, insulin, hba1c
    Target: outcome (0 = Non-diabetic, 1 = Diabetic / High Risk)
    """
    age = np.random.randint(21, 85, size=n_samples)
    bmi = np.random.normal(28.5, 5.5, size=n_samples).clip(16.0, 52.0)
    systolic_bp = (100 + 0.35 * age + 0.4 * bmi + np.random.normal(0, 12, size=n_samples)).clip(90, 200)
    
    # Glucose and HbA1c correlation
    base_glucose = np.random.normal(110, 32, size=n_samples).clip(65, 320)
    hba1c = (3.5 + 0.028 * base_glucose + np.random.normal(0, 0.4, size=n_samples)).clip(4.5, 14.0)
    insulin = (base_glucose * 0.8 + np.random.normal(0, 35, size=n_samples)).clip(10, 450)
    
    # Latent probability of diabetes based on clinical guidelines
    # High glucose (>=126), high HbA1c (>=6.5%), high BMI (>=30)
    logits = (
        0.035 * (base_glucose - 100) +
        1.1 * (hba1c - 5.7) +
        0.08 * (bmi - 25) +
        0.02 * (age - 45) +
        0.015 * (systolic_bp - 120) - 1.2
    )
    probs = 1 / (1 + np.exp(-logits))
    outcome = (probs > 0.5).astype(int)
    
    df = pd.DataFrame({
        'glucose': np.round(base_glucose, 1),
        'bmi': np.round(bmi, 1),
        'age': age,
        'systolic_bp': np.round(systolic_bp, 1),
        'insulin': np.round(insulin, 1),
        'hba1c': np.round(hba1c, 1),
        'outcome': outcome
    })
    
    path = os.path.join(DATASETS_DIR, 'diabetes_dataset.csv')
    df.to_csv(path, index=False)
    print(f"[Dataset] Diabetes generated: {df.shape[0]} samples -> {path}")
    return df

def generate_ckd_dataset(n_samples=1200):
    """
    Simulates clinical dataset aligned with UCI Chronic Kidney Disease features.
    Features: serum_creatinine, blood_urea, egfr, hemoglobin, albumin, systolic_bp, age
    Target: ckd_present (0 = Normal Renal Function, 1 = CKD Risk)
    """
    age = np.random.randint(22, 88, size=n_samples)
    systolic_bp = np.random.normal(132, 18, size=n_samples).clip(90, 210)
    
    # Correlated renal decline markers
    serum_creatinine = np.random.exponential(scale=0.9, size=n_samples) + 0.6
    serum_creatinine = serum_creatinine.clip(0.5, 9.0)
    
    blood_urea = (serum_creatinine * 22 + np.random.normal(12, 8, size=n_samples)).clip(10, 160)
    
    # eGFR inversely correlates with creatinine (CKD-EPI formula approximation)
    egfr = (140 / (serum_creatinine ** 0.85) - 0.3 * age + np.random.normal(0, 6, size=n_samples)).clip(10, 130)
    
    # Anemia and Albuminemia in renal disease
    hemoglobin = (15.5 - 1.4 * (serum_creatinine > 1.5) - 0.02 * age + np.random.normal(0, 1.1, size=n_samples)).clip(7.0, 18.0)
    albumin = (4.4 - 0.4 * (serum_creatinine > 1.4) + np.random.normal(0, 0.4, size=n_samples)).clip(2.0, 5.2)
    
    # CKD clinical criteria: eGFR < 60 mL/min or creatinine > 1.3 mg/dL
    logits = (
        2.2 * (serum_creatinine - 1.2) +
        0.04 * (blood_urea - 25) -
        0.07 * (egfr - 60) -
        0.5 * (hemoglobin - 12) +
        0.02 * (systolic_bp - 130) - 1.0
    )
    probs = 1 / (1 + np.exp(-logits))
    ckd_present = (probs > 0.5).astype(int)
    
    df = pd.DataFrame({
        'serum_creatinine': np.round(serum_creatinine, 2),
        'blood_urea': np.round(blood_urea, 1),
        'egfr': np.round(egfr, 1),
        'hemoglobin': np.round(hemoglobin, 1),
        'albumin': np.round(albumin, 2),
        'systolic_bp': np.round(systolic_bp, 1),
        'age': age,
        'ckd_present': ckd_present
    })
    
    path = os.path.join(DATASETS_DIR, 'ckd_dataset.csv')
    df.to_csv(path, index=False)
    print(f"[Dataset] CKD generated: {df.shape[0]} samples -> {path}")
    return df

def generate_hypertension_dataset(n_samples=1200):
    """
    Simulates clinical dataset based on AHA Blood Pressure classification.
    Features: systolic_bp, diastolic_bp, age, bmi, heart_rate, blood_glucose
    Target: hypertension_risk (0 = Controlled / Normal, 1 = Hypertension Stage 1 / Stage 2)
    """
    age = np.random.randint(20, 85, size=n_samples)
    bmi = np.random.normal(27.0, 5.0, size=n_samples).clip(17.0, 48.0)
    heart_rate = np.random.normal(74, 11, size=n_samples).clip(50, 125)
    blood_glucose = np.random.normal(108, 28, size=n_samples).clip(70, 280)
    
    systolic_bp = (102 + 0.45 * age + 0.6 * bmi + 0.1 * heart_rate + np.random.normal(0, 11, size=n_samples)).clip(90, 220)
    diastolic_bp = (65 + 0.2 * age + 0.35 * bmi + np.random.normal(0, 8, size=n_samples)).clip(55, 130)
    
    # AHA threshold: SBP >= 130 or DBP >= 80 defines Hypertension Stage 1+
    logits = (
        0.08 * (systolic_bp - 130) +
        0.09 * (diastolic_bp - 80) +
        0.03 * (bmi - 25) +
        0.02 * (age - 45) - 0.5
    )
    probs = 1 / (1 + np.exp(-logits))
    hypertension_risk = (probs > 0.5).astype(int)
    
    df = pd.DataFrame({
        'systolic_bp': np.round(systolic_bp, 1),
        'diastolic_bp': np.round(diastolic_bp, 1),
        'age': age,
        'bmi': np.round(bmi, 1),
        'heart_rate': np.round(heart_rate, 1),
        'blood_glucose': np.round(blood_glucose, 1),
        'hypertension_risk': hypertension_risk
    })
    
    path = os.path.join(DATASETS_DIR, 'hypertension_dataset.csv')
    df.to_csv(path, index=False)
    print(f"[Dataset] Hypertension generated: {df.shape[0]} samples -> {path}")
    return df

def generate_cardiovascular_dataset(n_samples=1200):
    """
    Simulates cardiovascular clinical dataset based on UCI Heart / Framingham features.
    Features: age, systolic_bp, total_cholesterol, heart_rate, blood_glucose, bmi, exercise_induced_angina
    Target: cvd_risk (0 = Low / Normal CVD risk, 1 = Significant CVD Risk)
    """
    age = np.random.randint(25, 85, size=n_samples)
    bmi = np.random.normal(28.0, 4.8, size=n_samples).clip(18.0, 46.0)
    systolic_bp = (108 + 0.35 * age + 0.5 * bmi + np.random.normal(0, 12, size=n_samples)).clip(95, 210)
    total_cholesterol = np.random.normal(205, 42, size=n_samples).clip(120, 360)
    heart_rate = np.random.normal(76, 12, size=n_samples).clip(52, 130)
    blood_glucose = np.random.normal(110, 30, size=n_samples).clip(70, 300)
    
    angina_prob = (0.01 * (age - 35) + 0.003 * (systolic_bp - 120)).clip(0.05, 0.65)
    exercise_induced_angina = (np.random.rand(n_samples) < angina_prob).astype(int)
    
    logits = (
        0.04 * (age - 50) +
        0.02 * (systolic_bp - 130) +
        0.015 * (total_cholesterol - 200) +
        0.012 * (blood_glucose - 100) +
        0.05 * (bmi - 25) +
        1.2 * exercise_induced_angina - 1.8
    )
    probs = 1 / (1 + np.exp(-logits))
    cvd_risk = (probs > 0.5).astype(int)
    
    df = pd.DataFrame({
        'age': age,
        'systolic_bp': np.round(systolic_bp, 1),
        'total_cholesterol': np.round(total_cholesterol, 1),
        'heart_rate': np.round(heart_rate, 1),
        'blood_glucose': np.round(blood_glucose, 1),
        'bmi': np.round(bmi, 1),
        'exercise_induced_angina': exercise_induced_angina,
        'cvd_risk': cvd_risk
    })
    
    path = os.path.join(DATASETS_DIR, 'cardiovascular_dataset.csv')
    df.to_csv(path, index=False)
    print(f"[Dataset] Cardiovascular generated: {df.shape[0]} samples -> {path}")
    return df

def generate_all():
    os.makedirs(DATASETS_DIR, exist_ok=True)
    generate_diabetes_dataset()
    generate_ckd_dataset()
    generate_hypertension_dataset()
    generate_cardiovascular_dataset()
    print("All benchmark datasets generated successfully!")

if __name__ == '__main__':
    generate_all()
