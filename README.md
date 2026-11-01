# Medi Bridge AI
### An Adaptive AI-Driven Virtual Wards for Enhanced Monitoring of Diabetes, Chronic Kidney Disease, Hypertension, and Cardiovascular Conditions

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Flask 3.1](https://img.shields.io/badge/Backend-Flask_3.1-000000.svg?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React 18](https://img.shields.io/badge/Frontend-React_18-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E.svg?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🌟 Executive Overview
**Medi Bridge AI** is an intelligent, remote healthcare virtual ward platform developed to monitor patients suffering from four major comorbid chronic conditions:
1. **Type-2 Diabetes Mellitus**
2. **Chronic Kidney Disease (CKD)**
3. **Hypertension**
4. **Cardiovascular Conditions (CVD)**

The system connects **Patients**, **Attending Physicians**, **Informal Caregivers**, and **Administrators** in a unified ecosystem featuring:
- **Longitudinal Telemetry Ingestion**: Continuous tracking of blood pressure, blood glucose, HbA1c, serum creatinine, eGFR, heart rate, cholesterol, and symptoms.
- **Adaptive AI Monitoring**: Automatically calculates physiological deltas against moving baselines, detects deterioration trajectories, and escalates virtual ward triage status (`Stable`, `Requires Review`, `Critical Watch`).
- **Four Trained ML Models**: High-performance Scikit-Learn Random Forest classifiers achieving **94.1% - 97.1% accuracy** and **ROC-AUC > 0.99**.
- **Explainable AI (XAI)**: Breaks down risk predictions into percentage contributions and understandable plain-English insights.
- **Multi-Channel Alert Dispatch**: Clinical safety rules that notify doctors, prompt caregivers to acknowledge alerts, and provide actionable patient guidance.
- **Clinical Health Reports**: One-click printable, PDF-ready patient health summaries with physician action plans.

> ⚠️ **Academic Prototype Notice**: Medi Bridge AI is engineered for academic research, education, and viva demonstration. Inferences provide clinical decision support and do not constitute certified medical diagnosis.

---

## 🏗️ System Architecture

```
Medi-Bridge-AI/
├── backend/                  # Python Flask REST API & SQLite ORM
│   ├── app.py                # Server entry point & CORS configuration
│   ├── config.py             # Secrets, token expiration, database paths
│   ├── database/             # SQLAlchemy models & realistic seed data
│   ├── routes/               # Modular REST endpoints (auth, patient, doctor, caregiver, predictions, alerts)
│   ├── services/             # ML service, adaptive monitoring, XAI engine, report generator
│   └── tests/                # Automated end-to-end integration test suite
│
├── machine_learning/         # AI/ML Pipeline
│   ├── datasets/             # Clinical benchmark distributions (Pima, UCI CKD, AHA, Cleveland)
│   ├── training/             # Scikit-Learn training pipelines & metric evaluation
│   └── saved_models/         # Serialized Joblib pipelines & model_metadata.json
│
├── frontend/                 # React 18 + Vite + Tailwind CSS User Interface
│   ├── src/
│   │   ├── api/              # API client with JWT token management
│   │   ├── components/       # Reusable UI cards, SVG charts, badges, navbar, sidebar
│   │   ├── context/          # React AuthContext (login, logout, session persistence)
│   │   └── pages/            # Multi-role portals (Patient, Doctor, Caregiver, Admin, Playground)
│   └── dist/                 # Production build bundle
│
└── documentation/            # Comprehensive Academic Project Report & UML specifications
```

---

## 🚀 Quick Start Guide (Beginner Friendly)

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Python 3.10+** (tested on Python 3.14)
- **Node.js v18+** & **npm**

---

### 2. Backend Setup & Dependencies
Open a terminal in the project root directory (`MAIN PROJECT`):

```bash
# 1. Install backend and ML dependencies
pip install Flask Flask-SQLAlchemy Flask-Cors PyJWT numpy pandas scikit-learn joblib scipy python-dotenv
```

---

### 3. Train Machine Learning Models
Generate the clinical benchmark datasets and train all 4 Scikit-Learn models with evaluation metrics:

```bash
python machine_learning/training/train_all.py
```
*This produces `diabetes_model.joblib`, `ckd_model.joblib`, `hypertension_model.joblib`, `cardiovascular_model.joblib`, and `model_metadata.json` in `machine_learning/saved_models/`.*

---

### 4. Seed the Database
Populate the SQLite database with realistic test patients, doctors, caregivers, 7-day longitudinal vitals, alerts, and doctor notes:

```bash
python backend/database/seed_data.py
```

---

### 5. Frontend Setup & Build
In the project root, install frontend packages and compile:

```bash
# Install frontend packages
npm install --prefix frontend

# Build production bundle (or run npm run dev --prefix frontend for live development)
npm run build --prefix frontend
```

---

### 6. Start the Application
You can run the application in either of two modes:

#### Option A: Unified Production Mode (Recommended)
Run the Flask server. It will serve both the REST API and the React frontend on a single port:

```bash
python backend/app.py
```
Open your browser and navigate to: **`http://localhost:5000`**

#### Option B: Full-Stack Development Mode
Open two separate terminal windows:
- **Terminal 1 (Backend API)**:
  ```bash
  python backend/app.py
  ```
- **Terminal 2 (React Vite Dev Server)**:
  ```bash
  npm run dev --prefix frontend
  ```
Open your browser and navigate to: **`http://localhost:5173`**

---

## 👥 Pre-Configured Demo Accounts (1-Click Login)

The login screen features **1-Click Quick Fill Buttons** for instant evaluation:

| Role | Username | Password | Clinical Profile |
| :--- | :--- | :--- | :--- |
| **Doctor** | `dr_mitchell` | `doctor123` | Dr. Sarah Mitchell, MD (Nephrology & Internal Medicine) |
| **Doctor** | `dr_wilson` | `doctor123` | Dr. James Wilson, MD (Cardiovascular Specialist) |
| **Patient** | `john_doe` | `patient123` | John Doe (58 yo, Type-2 Diabetes & Stage 2 Hypertension) |
| **Patient** | `maria_garcia` | `patient123` | Maria Garcia (64 yo, Chronic Kidney Disease Stage 3, High Risk) |
| **Caregiver** | `caregiver_emma` | `caregiver123` | Emma Johnson (Daughter & Primary Caregiver for John Doe) |
| **Admin** | `admin` | `admin123` | Medi Bridge Virtual Ward System Administrator |

---

## 🧪 Running Automated Tests

Run the complete 8-point automated test suite:

```bash
python backend/tests/test_system.py
```
Expected output:
```
Ran 8 tests in 3.513s
OK
[TEST 1 PASSED] Health check endpoint operational.
[TEST 2 PASSED] Doctor authenticated. Inpatients monitored: 4
[TEST 3 PASSED] Patient authenticated. Retrieved 7 telemetry records.
[TEST 4 PASSED] Adaptive AI triggered! Ward status escalated to: Critical Watch with 2 critical alerts.
[TEST 5 PASSED] All 4 ML models evaluated with Explainable AI feature importance breakdowns.
[TEST 6 PASSED] Doctor clinical note and action plan recorded successfully.
[TEST 7 PASSED] Caregiver successfully acknowledged alert.
[TEST 8 PASSED] Comprehensive clinical health report generated with full provenance.
```

---

## 🩺 Interactive Feature Walkthrough

### 1. Patient Telemetry Ingestion & Adaptive AI
1. Sign in as `john_doe`.
2. Click **Log Telemetry**.
3. Click the preset button **"Hypertensive Escalation"** or enter:
   - Systolic BP: `185 mmHg`
   - Blood Glucose: `275 mg/dL`
4. Click **Submit & Recalculate AI Risk**.
5. Observe the **Adaptive AI Feedback Card**:
   - Computes deltas against previous measurements (e.g. `+23 mmHg SBP`).
   - Escalate Virtual Ward status to **`Critical Watch`**.
   - Generates priority alerts dispatched to Dr. Mitchell and Emma Johnson.

### 2. Attending Physician Virtual Ward Triage
1. Sign in as `dr_mitchell`.
2. View the **Triage Board**:
   - Inpatients categorized by triage level (`Critical Watch`, `Requires Review`, `Stable`).
   - John Doe is flagged in red due to the recent telemetry escalation.
3. Click **Clinical Review & Notes**:
   - Review John's multi-disease risk gauges and longitudinal trajectory.
   - Enter an observation note and structured action plan (e.g., *"Titrate insulin, recheck BP in 2 hours"*).
   - This records in the database and updates both patient and caregiver portals.

### 3. Caregiver Alert Acknowledgment
1. Sign in as `caregiver_emma`.
2. Notice the yellow **Important Patient Alerts** card for John Doe.
3. Review the alert message and click **Acknowledge**.
4. The alert records Emma's acknowledgment with exact timestamp for medical-legal traceability.

### 4. Explainable AI (XAI) Playground
1. Navigate to **AI Disease Risk Engine** (`/predictions`).
2. Adjust interactive sliders for Fasting Glucose, Systolic BP, Serum Creatinine, Cholesterol, or Angina.
3. Instantly watch all 4 models recalculate:
   - Risk percentages and severity classifications.
   - Percentage contribution bars for each biometric parameter.
   - Plain-English clinical narrative explaining the drivers of the prediction.
4. Click the **Model Benchmarks & Metrics** tab to review real Scikit-Learn test set accuracies, precision, recall, and ROC-AUC curves.

### 5. Printable Clinical Health Reports
1. Sign in as `john_doe` or `dr_mitchell`.
2. Go to **Health Reports** (`/patient/reports`).
3. View the structured clinical dossier containing patient demographics, 7-log telemetry averages, multi-disease risk assessment, and doctor notes.
4. Click **Print / Save PDF Report** to produce an official medical center document.

---

## 📄 License
This project is open-sourced under the MIT License for academic research and educational evaluation.
