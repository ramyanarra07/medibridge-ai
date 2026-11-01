"""
Medi Bridge AI - Comprehensive End-to-End Test Suite
Tests:
- Authentication & RBAC (Patient, Doctor, Caregiver)
- Ingestion of Health Records
- Adaptive Monitoring Engine (Deltas, Alerts, Status change)
- Machine Learning Inference across 4 chronic conditions
- Explainable AI (XAI) feature impact calculations
- Doctor Triage Board, Patient Updates & Clinical Notes
- Caregiver Alert Acknowledgment
- Clinical Health Summary Report Generation
"""

import unittest
import json
import sys
import os

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app import app
from backend.database.db import db
from backend.database.models import User, Patient, Doctor, Caregiver, HealthRecord, DiseasePrediction, Notification, ClinicalNote

class MediBridgeSystemTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.config['TESTING'] = True
        cls.client = app.test_client()

    def test_01_health_check(self):
        """Verify API health check endpoint"""
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get('status'), 'healthy')
        self.assertEqual(data.get('platform'), 'Medi Bridge AI Virtual Ward')
        print("\n[TEST 1 PASSED] Health check endpoint operational.")

    def test_02_doctor_login_and_triage(self):
        """Verify doctor authentication and virtual ward triage summary"""
        res = self.client.post('/api/auth/login', json={
            'username': 'dr_mitchell',
            'password': 'doctor123'
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn('token', data)
        self.assertEqual(data['user']['role'], 'doctor')
        token = data['token']

        # Get Triage Summary
        triage_res = self.client.get('/api/doctors/triage-summary', headers={
            'Authorization': f'Bearer {token}'
        })
        self.assertEqual(triage_res.status_code, 200)
        triage_data = triage_res.get_json()
        self.assertGreaterEqual(triage_data['total_registered_patients'], 1)
        print(f"[TEST 2 PASSED] Doctor authenticated. Inpatients monitored: {triage_data['total_registered_patients']}")

    def test_03_patient_login_and_vitals_retrieval(self):
        """Verify patient authentication and longitudinal vitals retrieval"""
        res = self.client.post('/api/auth/login', json={
            'username': 'john_doe',
            'password': 'patient123'
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        token = data['token']
        patient_id = data['user']['id']

        # Retrieve vitals history
        vitals_res = self.client.get(f'/api/patients/{patient_id}/vitals', headers={
            'Authorization': f'Bearer {token}'
        })
        self.assertEqual(vitals_res.status_code, 200)
        vitals_data = vitals_res.get_json()
        self.assertGreaterEqual(len(vitals_data['records']), 1)
        print(f"[TEST 3 PASSED] Patient authenticated. Retrieved {len(vitals_data['records'])} telemetry records.")

    def test_04_adaptive_monitoring_vitals_ingestion(self):
        """Ingest critical vital signs and verify automated adaptive AI escalation and alerts"""
        # Login John Doe
        login_res = self.client.post('/api/auth/login', json={
            'username': 'john_doe',
            'password': 'patient123'
        })
        token = login_res.get_json()['token']
        patient_id = login_res.get_json()['user']['id']

        # Post vitals simulating a hypertensive and hyperglycemic spike
        vitals_payload = {
            'systolic_bp': 185.0,  # Critical > 180
            'diastolic_bp': 112.0,
            'heart_rate': 98.0,
            'blood_glucose': 275.0, # Critical > 260
            'hba1c': 9.2,
            'bmi': 29.5,
            'serum_creatinine': 1.4,
            'blood_urea': 38.0,
            'egfr': 68.0,
            'total_cholesterol': 240.0,
            'symptoms': 'Pounding occipital headache, intense thirst, blurred vision'
        }

        res = self.client.post(f'/api/patients/{patient_id}/vitals', json=vitals_payload, headers={
            'Authorization': f'Bearer {token}'
        })
        self.assertEqual(res.status_code, 201)
        result = res.get_json()
        eval_report = result['adaptive_evaluation']

        self.assertEqual(eval_report['status'], 'success')
        self.assertEqual(eval_report['monitoring_status'], 'Critical Watch')
        self.assertEqual(eval_report['severity'], 'critical')
        self.assertGreater(eval_report['alerts_generated'], 0)
        self.assertIn('systolic_bp', eval_report['deltas'])
        print(f"[TEST 4 PASSED] Adaptive AI triggered! Ward status escalated to: {eval_report['monitoring_status']} with {eval_report['alerts_generated']} critical alerts.")

    def test_05_multi_disease_machine_learning_inference(self):
        """Verify direct multi-condition prediction endpoint and Explainable AI breakdown"""
        payload = {
            'blood_glucose': 210.0,
            'hba1c': 8.5,
            'bmi': 31.0,
            'systolic_bp': 165.0,
            'diastolic_bp': 98.0,
            'heart_rate': 84.0,
            'serum_creatinine': 2.8, # Elevated renal marker
            'blood_urea': 65.0,
            'egfr': 32.0,
            'hemoglobin': 10.5,
            'albumin': 3.1,
            'total_cholesterol': 260.0,
            'exercise_induced_angina': True,
            'age': 65
        }

        res = self.client.post('/api/predictions/predict-all', json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        preds = data['predictions']
        self.assertEqual(len(preds), 4)

        conditions = [p['condition_type'] for p in preds]
        self.assertIn('diabetes', conditions)
        self.assertIn('ckd', conditions)
        self.assertIn('hypertension', conditions)
        self.assertIn('cardiovascular', conditions)

        # Verify XAI factors exist for each prediction
        for p in preds:
            self.assertIn('risk_score', p)
            self.assertIn('risk_level', p)
            self.assertIn('top_contributing_factors', p)
            self.assertIn('explainability_summary', p)
            self.assertGreater(len(p['top_contributing_factors']), 0)

        print("[TEST 5 PASSED] All 4 ML models evaluated with Explainable AI feature importance breakdowns.")

    def test_06_doctor_clinical_note_creation(self):
        """Verify doctor can post clinical note and action plan"""
        # Doctor login
        doc_login = self.client.post('/api/auth/login', json={
            'username': 'dr_mitchell',
            'password': 'doctor123'
        })
        doc_token = doc_login.get_json()['token']

        # Post note for patient 6 (John Doe)
        note_res = self.client.post('/api/doctors/patients/6/notes', json={
            'note_text': 'Evaluated acute telemetry surge. Systolic BP and glucose critical.',
            'action_plan': '1. Administer rapid-acting insulin.\n2. Hydration with 0.9% Normal Saline.\n3. Telemetry review in 2 hours.'
        }, headers={'Authorization': f'Bearer {doc_token}'})

        self.assertEqual(note_res.status_code, 201)
        note_data = note_res.get_json()
        self.assertIn('note', note_data)
        print("[TEST 6 PASSED] Doctor clinical note and action plan recorded successfully.")

    def test_07_caregiver_alert_acknowledgment(self):
        """Verify caregiver can view and acknowledge pending alerts"""
        # Caregiver login
        care_login = self.client.post('/api/auth/login', json={
            'username': 'caregiver_emma',
            'password': 'caregiver123'
        })
        care_token = care_login.get_json()['token']

        # Get notifications
        notif_res = self.client.get('/api/notifications', headers={'Authorization': f'Bearer {care_token}'})
        self.assertEqual(notif_res.status_code, 200)
        notifs = notif_res.get_json()['notifications']

        if notifs:
            first_id = notifs[0]['id']
            ack_res = self.client.post(f'/api/notifications/{first_id}/acknowledge', headers={
                'Authorization': f'Bearer {care_token}'
            })
            self.assertEqual(ack_res.status_code, 200)
            self.assertTrue(ack_res.get_json()['notification']['is_read'])
            print(f"[TEST 7 PASSED] Caregiver successfully acknowledged alert #{first_id}.")
        else:
            print("[TEST 7 PASSED] Notifications verified.")

    def test_08_clinical_health_report_generation(self):
        """Verify comprehensive clinical health report generation"""
        doc_login = self.client.post('/api/auth/login', json={
            'username': 'dr_mitchell',
            'password': 'doctor123'
        })
        doc_token = doc_login.get_json()['token']

        rep_res = self.client.get('/api/patients/6/report', headers={'Authorization': f'Bearer {doc_token}'})
        self.assertEqual(rep_res.status_code, 200)
        rep = rep_res.get_json()['report']

        self.assertEqual(rep['patient_info']['full_name'], 'John Doe')
        self.assertIn('vitals_summary', rep)
        self.assertIn('ai_risk_assessment', rep)
        self.assertIn('clinical_notes', rep)
        self.assertIn('disclaimer', rep)
        print("[TEST 8 PASSED] Comprehensive clinical health report generated with full provenance.")

if __name__ == '__main__':
    unittest.main()
