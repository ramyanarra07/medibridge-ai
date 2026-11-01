import os
import sys
from datetime import datetime, timedelta

# Ensure parent directory is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.database.db import db
from backend.database.models import User, Patient, Doctor, Caregiver, HealthRecord, DiseasePrediction, Notification, ClinicalNote

def seed_database(app):
    with app.app_context():
        # Drop and re-create all tables
        db.create_all()

        # Check if users already exist
        if User.query.first():
            print("Database already contains data. Skipping seeding.")
            return

        print("Seeding database with realistic virtual ward clinical data...")

        # 1. Admin
        admin_user = User(
            username="admin",
            email="admin@medibridge.ai",
            role="admin",
            full_name="Medi Bridge Administrator",
            phone="+1-555-010-0000"
        )
        admin_user.set_password("admin123")
        db.session.add(admin_user)

        # 2. Doctors
        doc1_user = User(
            username="dr_mitchell",
            email="sarah.mitchell@medibridge.ai",
            role="doctor",
            full_name="Dr. Sarah Mitchell, MD",
            phone="+1-555-010-1001"
        )
        doc1_user.set_password("doctor123")
        db.session.add(doc1_user)
        db.session.flush()

        doc1_profile = Doctor(
            id=doc1_user.id,
            specialization="Nephrology & Chronic Disease Management",
            license_number="MD-NY-784920",
            department="Renal & Metabolic Virtual Ward",
            hospital_affiliation="Medi Bridge University Teaching Hospital",
            consultation_hours="Mon - Fri: 08:30 - 16:30"
        )
        db.session.add(doc1_profile)

        doc2_user = User(
            username="dr_wilson",
            email="james.wilson@medibridge.ai",
            role="doctor",
            full_name="Dr. James Wilson, MD",
            phone="+1-555-010-1002"
        )
        doc2_user.set_password("doctor123")
        db.session.add(doc2_user)
        db.session.flush()

        doc2_profile = Doctor(
            id=doc2_user.id,
            specialization="Cardiology & Vascular Medicine",
            license_number="MD-NY-893124",
            department="Cardiovascular Virtual Care",
            hospital_affiliation="Medi Bridge Heart & Vascular Institute",
            consultation_hours="Tue - Sat: 09:00 - 17:00"
        )
        db.session.add(doc2_profile)

        # 3. Caregivers
        care1_user = User(
            username="caregiver_emma",
            email="emma.johnson@example.com",
            role="caregiver",
            full_name="Emma Johnson",
            phone="+1-555-010-2001"
        )
        care1_user.set_password("caregiver123")
        db.session.add(care1_user)
        db.session.flush()

        care1_profile = Caregiver(
            id=care1_user.id,
            relationship_to_patient="Daughter & Primary Caregiver",
            preferred_contact_method="Mobile SMS & Virtual Ward Push"
        )
        db.session.add(care1_profile)

        care2_user = User(
            username="caregiver_robert",
            email="robert.davis@example.com",
            role="caregiver",
            full_name="Robert Davis",
            phone="+1-555-010-2002"
        )
        care2_user.set_password("caregiver123")
        db.session.add(care2_user)
        db.session.flush()

        care2_profile = Caregiver(
            id=care2_user.id,
            relationship_to_patient="Registered Community Health Nurse",
            preferred_contact_method="Hospital Secure Chat"
        )
        db.session.add(care2_profile)

        # 4. Patients
        # Patient 1: John Doe (T2 Diabetes + Hypertension, moderate-to-high risk)
        p1_user = User(
            username="john_doe",
            email="john.doe@example.com",
            role="patient",
            full_name="John Doe",
            phone="+1-555-010-3001"
        )
        p1_user.set_password("patient123")
        db.session.add(p1_user)
        db.session.flush()

        p1_profile = Patient(
            id=p1_user.id,
            date_of_birth="1968-05-14", # 58 yrs old
            gender="Male",
            blood_group="A+",
            emergency_contact="Emma Johnson (Daughter) - +1-555-010-2001",
            ward_bed_no="Virtual Bed-101",
            monitoring_status="Requires Review",
            medical_history_summary="Type-2 Diabetes diagnosed 2018. Essential hypertension stage 2. Mild peripheral neuropathy.",
            assigned_doctor_id=doc1_profile.id,
            assigned_caregiver_id=care1_profile.id
        )
        db.session.add(p1_profile)

        # Patient 2: Maria Garcia (Chronic Kidney Disease Stage 3, high risk)
        p2_user = User(
            username="maria_garcia",
            email="maria.garcia@example.com",
            role="patient",
            full_name="Maria Garcia",
            phone="+1-555-010-3002"
        )
        p2_user.set_password("patient123")
        db.session.add(p2_user)
        db.session.flush()

        p2_profile = Patient(
            id=p2_user.id,
            date_of_birth="1962-09-21", # 64 yrs old
            gender="Female",
            blood_group="O+",
            emergency_contact="Carlos Garcia (Husband) - +1-555-010-3099",
            ward_bed_no="Virtual Bed-102",
            monitoring_status="Critical Watch",
            medical_history_summary="Chronic Kidney Disease Stage 3b. Renal impairment secondary to long-term hypertension. Proteinuria.",
            assigned_doctor_id=doc1_profile.id,
            assigned_caregiver_id=care2_profile.id
        )
        db.session.add(p2_profile)

        # Patient 3: David Smith (Cardiovascular condition, post-angioplasty)
        p3_user = User(
            username="david_smith",
            email="david.smith@example.com",
            role="patient",
            full_name="David Smith",
            phone="+1-555-010-3003"
        )
        p3_user.set_password("patient123")
        db.session.add(p3_user)
        db.session.flush()

        p3_profile = Patient(
            id=p3_user.id,
            date_of_birth="1958-11-03", # 68 yrs old
            gender="Male",
            blood_group="B+",
            emergency_contact="Sarah Smith (Wife) - +1-555-010-3088",
            ward_bed_no="Virtual Bed-103",
            monitoring_status="Active Monitoring",
            medical_history_summary="Coronary Artery Disease. Status post DES stenting to LAD (2023). Dyslipidemia on Atorvastatin.",
            assigned_doctor_id=doc2_profile.id,
            assigned_caregiver_id=care1_profile.id
        )
        db.session.add(p3_profile)

        # Patient 4: Elena Rostova (Mild Hypertension, stable)
        p4_user = User(
            username="elena_rostova",
            email="elena.rostova@example.com",
            role="patient",
            full_name="Elena Rostova",
            phone="+1-555-010-3004"
        )
        p4_user.set_password("patient123")
        db.session.add(p4_user)
        db.session.flush()

        p4_profile = Patient(
            id=p4_user.id,
            date_of_birth="1981-03-29", # 45 yrs old
            gender="Female",
            blood_group="AB+",
            emergency_contact="Alexander Rostova (Brother) - +1-555-010-3077",
            ward_bed_no="Virtual Bed-104",
            monitoring_status="Stable",
            medical_history_summary="Mild pre-hypertension managed with lifestyle modifications and low-dose ACE inhibitor.",
            assigned_doctor_id=doc2_profile.id,
            assigned_caregiver_id=care2_profile.id
        )
        db.session.add(p4_profile)
        db.session.flush()

        # 5. Seed Historical Vitals for Patients
        now = datetime.utcnow()

        # John Doe (Trending high on glucose and systolic BP over last 7 days)
        john_vitals = [
            # Days ago, Systolic, Diastolic, HR, Glucose, HbA1c, BMI, Creatinine, Urea, eGFR, Hemoglobin, Albumin, Chol, Symptoms
            (6, 134.0, 86.0, 76.0, 142.0, 7.8, 28.4, 1.0, 28.0, 84.0, 14.1, 4.1, 210.0, "Mild fatigue"),
            (5, 138.0, 88.0, 78.0, 150.0, 7.8, 28.5, 1.0, 29.0, 83.0, 14.0, 4.0, 212.0, "Normal"),
            (4, 142.0, 90.0, 80.0, 168.0, 7.9, 28.6, 1.1, 31.0, 80.0, 13.9, 4.0, 215.0, "Frequent thirst"),
            (3, 148.0, 92.0, 82.0, 175.0, 7.9, 28.7, 1.1, 32.0, 79.0, 13.8, 3.9, 218.0, "Blurred morning vision"),
            (2, 152.0, 94.0, 84.0, 182.0, 8.1, 28.8, 1.2, 33.0, 76.0, 13.7, 3.9, 222.0, "Lethargy and dry mouth"),
            (1, 158.0, 96.0, 86.0, 195.0, 8.2, 28.9, 1.2, 34.0, 75.0, 13.6, 3.8, 226.0, "Headache, increased thirst"),
            (0, 162.0, 98.0, 88.0, 210.0, 8.4, 29.1, 1.3, 36.0, 72.0, 13.5, 3.8, 230.0, "Severe thirst, persistent headache"),
        ]

        for days_ago, sbp, dbp, hr, glu, hba1c, bmi, cr, urea, egfr, hb, alb, chol, sym in john_vitals:
            rec = HealthRecord(
                patient_id=p1_profile.id,
                recorded_at=now - timedelta(days=days_ago, hours=2),
                systolic_bp=sbp,
                diastolic_bp=dbp,
                heart_rate=hr,
                blood_glucose=glu,
                hba1c=hba1c,
                bmi=bmi,
                serum_creatinine=cr,
                blood_urea=urea,
                egfr=egfr,
                hemoglobin=hb,
                albumin=alb,
                total_cholesterol=chol,
                symptoms=sym,
                notes="Automated vitals sync via home telemetry kit"
            )
            db.session.add(rec)

        # Maria Garcia (CKD high risk profile)
        maria_vitals = [
            (5, 145.0, 90.0, 72.0, 120.0, 6.2, 26.2, 2.1, 54.0, 42.0, 11.2, 3.4, 195.0, "Mild ankle swelling"),
            (3, 150.0, 94.0, 74.0, 125.0, 6.3, 26.3, 2.4, 58.0, 38.0, 10.9, 3.2, 198.0, "Bilateral edema"),
            (1, 156.0, 96.0, 76.0, 128.0, 6.4, 26.5, 2.7, 64.0, 33.0, 10.6, 3.1, 202.0, "Shortness of breath on exertion, nausea"),
            (0, 160.0, 98.0, 78.0, 130.0, 6.5, 26.7, 3.0, 70.0, 28.0, 10.2, 2.9, 205.0, "Decreased urine output, pronounced fatigue"),
        ]

        for days_ago, sbp, dbp, hr, glu, hba1c, bmi, cr, urea, egfr, hb, alb, chol, sym in maria_vitals:
            rec = HealthRecord(
                patient_id=p2_profile.id,
                recorded_at=now - timedelta(days=days_ago, hours=1),
                systolic_bp=sbp,
                diastolic_bp=dbp,
                heart_rate=hr,
                blood_glucose=glu,
                hba1c=hba1c,
                bmi=bmi,
                serum_creatinine=cr,
                blood_urea=urea,
                egfr=egfr,
                hemoglobin=hb,
                albumin=alb,
                total_cholesterol=chol,
                symptoms=sym,
                notes="Renal profile telemetry update"
            )
            db.session.add(rec)

        # David Smith (Cardiovascular risk profile)
        david_vitals = [
            (4, 138.0, 88.0, 82.0, 115.0, 5.9, 27.5, 1.1, 26.0, 78.0, 14.5, 4.3, 248.0, "No active symptoms"),
            (2, 142.0, 90.0, 86.0, 118.0, 5.9, 27.6, 1.1, 27.0, 77.0, 14.4, 4.2, 255.0, "Mild chest tightness on stairs"),
            (0, 146.0, 92.0, 89.0, 122.0, 6.0, 27.7, 1.2, 28.0, 75.0, 14.3, 4.2, 260.0, "Chest heaviness after walking"),
        ]

        for days_ago, sbp, dbp, hr, glu, hba1c, bmi, cr, urea, egfr, hb, alb, chol, sym in david_vitals:
            rec = HealthRecord(
                patient_id=p3_profile.id,
                recorded_at=now - timedelta(days=days_ago, hours=3),
                systolic_bp=sbp,
                diastolic_bp=dbp,
                heart_rate=hr,
                blood_glucose=glu,
                hba1c=hba1c,
                bmi=bmi,
                serum_creatinine=cr,
                blood_urea=urea,
                egfr=egfr,
                hemoglobin=hb,
                albumin=alb,
                total_cholesterol=chol,
                exercise_induced_angina=True,
                symptoms=sym,
                notes="Cardiology ambulatory log"
            )
            db.session.add(rec)

        # Elena Rostova (Stable profile)
        elena_vitals = [
            (3, 122.0, 80.0, 68.0, 92.0, 5.2, 22.8, 0.8, 20.0, 102.0, 13.8, 4.5, 172.0, "Feeling energetic"),
            (0, 124.0, 82.0, 70.0, 95.0, 5.3, 22.9, 0.8, 21.0, 100.0, 13.7, 4.5, 175.0, "Routine morning check - normal"),
        ]

        for days_ago, sbp, dbp, hr, glu, hba1c, bmi, cr, urea, egfr, hb, alb, chol, sym in elena_vitals:
            rec = HealthRecord(
                patient_id=p4_profile.id,
                recorded_at=now - timedelta(days=days_ago, hours=4),
                systolic_bp=sbp,
                diastolic_bp=dbp,
                heart_rate=hr,
                blood_glucose=glu,
                hba1c=hba1c,
                bmi=bmi,
                serum_creatinine=cr,
                blood_urea=urea,
                egfr=egfr,
                hemoglobin=hb,
                albumin=alb,
                total_cholesterol=chol,
                symptoms=sym,
                notes="Routine bi-weekly telemetry entry"
            )
            db.session.add(rec)

        db.session.flush()

        # 6. Seed Notifications & Alerts
        notifications = [
            Notification(
                recipient_id=doc1_user.id,
                patient_id=p1_profile.id,
                severity="warning",
                title="Elevated Glycemic Alert: John Doe",
                message="Blood glucose reached 210 mg/dL with rising systolic blood pressure (162 mmHg). Multi-parameter risk model escalated to High Risk.",
                is_read=False,
                created_at=now - timedelta(hours=3)
            ),
            Notification(
                recipient_id=care1_user.id,
                patient_id=p1_profile.id,
                severity="warning",
                title="Caregiver Notice: John Doe Blood Sugar High",
                message="Your father's blood sugar was logged at 210 mg/dL. Ensure he takes his prescribed insulin regimen and stays hydrated.",
                is_read=False,
                created_at=now - timedelta(hours=3)
            ),
            Notification(
                recipient_id=doc1_user.id,
                patient_id=p2_profile.id,
                severity="critical",
                title="Critical Renal Deterioration Alert: Maria Garcia",
                message="Serum Creatinine elevated to 3.0 mg/dL with eGFR dropping to 28 mL/min/1.73m2. Immediate nephrology consult required.",
                is_read=False,
                created_at=now - timedelta(hours=1)
            ),
            Notification(
                recipient_id=care2_user.id,
                patient_id=p2_profile.id,
                severity="critical",
                title="Urgent Attention: Maria Garcia",
                message="Renal parameters breached critical threshold. Check patient for fluid retention and confirm medication adherence.",
                is_read=False,
                created_at=now - timedelta(hours=1)
            ),
            Notification(
                recipient_id=doc2_user.id,
                patient_id=p3_profile.id,
                severity="warning",
                title="Cardiovascular Warning: David Smith",
                message="Total cholesterol 260 mg/dL with reported chest heaviness after walking. Exercise-induced angina flag positive.",
                is_read=False,
                created_at=now - timedelta(hours=6)
            ),
            Notification(
                recipient_id=p1_user.id,
                patient_id=p1_profile.id,
                severity="info",
                title="Health Reminder: Virtual Ward Check-in",
                message="Dr. Mitchell reviewed your latest readings. Please log your evening vitals between 18:00 and 20:00.",
                is_read=True,
                created_at=now - timedelta(hours=12)
            ),
        ]
        db.session.add_all(notifications)

        # 7. Seed Clinical Notes
        notes = [
            ClinicalNote(
                patient_id=p1_profile.id,
                doctor_id=doc1_profile.id,
                note_text="Patient demonstrates upward glycemic trajectory over the past week (142 -> 210 mg/dL) coupled with stage 2 systolic readings. Advised strict adherence to low-glycemic dietary intake.",
                action_plan="1. Titrate Metformin to 1000mg BID.\n2. Schedule virtual telehealth review in 48 hours.\n3. Instruct caregiver on ketone testing if fasting glucose > 220 mg/dL.",
                created_at=now - timedelta(hours=4)
            ),
            ClinicalNote(
                patient_id=p2_profile.id,
                doctor_id=doc1_profile.id,
                note_text="Serum creatinine jumped to 3.0 mg/dL, with eGFR below 30 mL/min, placing patient in Stage 4 CKD territory. Mild peripheral edema noted by caregiver.",
                action_plan="1. Review electrolyte panel immediately.\n2. Adjust ACE inhibitor dosage to prevent further renal hypoperfusion.\n3. Virtual bedside nurse dispatch scheduled.",
                created_at=now - timedelta(hours=2)
            ),
            ClinicalNote(
                patient_id=p3_profile.id,
                doctor_id=doc2_profile.id,
                note_text="Total cholesterol persistently high at 260 mg/dL. Patient reports mild exertional angina. EKG telemetry rhythm remains normal sinus.",
                action_plan="1. Intensify statin therapy (Atorvastatin 40mg daily).\n2. Provide sublingual nitroglycerin precautions.\n3. Schedule outpatient stress echocardiogram.",
                created_at=now - timedelta(hours=5)
            )
        ]
        db.session.add_all(notes)

        db.session.commit()
        print("Database seeded successfully with users, patients, doctors, caregivers, vitals, alerts, and clinical notes!")

if __name__ == "__main__":
    from flask import Flask
    from backend.config import Config
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    seed_database(app)
